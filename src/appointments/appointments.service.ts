import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Appointment, AppointmentStatus, Prisma } from '../generated/prisma/client';
import { BusinessAccessService } from '../businesses/business-access.service';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentQueryDto } from './dto/appointment-query.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { PaginatedAppointmentsResponse } from './types/paginated-appointments.type';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly businessAccessService: BusinessAccessService,
  ) {}

  async create(
    userId: string,
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    await this.businessAccessService.assertMembership(
      userId,
      createAppointmentDto.businessId,
    );

    const appointment = await this.prisma.appointment.create({
      data: {
        businessId: createAppointmentDto.businessId,
        title: createAppointmentDto.title,
        description: createAppointmentDto.description,
        clientName: createAppointmentDto.clientName,
        clientPhone: createAppointmentDto.clientPhone,
        appointmentDate: new Date(createAppointmentDto.appointmentDate),
        status: createAppointmentDto.status ?? AppointmentStatus.PENDING,
      },
    });

    void this.sendConfirmationEmailSafe(userId, appointment);

    return appointment;
  }

  private async sendConfirmationEmailSafe(
    userId: string,
    appointment: Appointment,
  ): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });

      if (!user?.email) {
        this.logger.warn(
          `Skipping confirmation email for appointment ${appointment.id}: user has no email`,
        );
        return;
      }

      this.logger.log(
        `Preparing confirmation email for appointment ${appointment.id} → ${user.email}`,
      );

      await this.emailService.sendAppointmentConfirmationEmail({
        to: user.email,
        userName: user.name,
        appointment,
      });
    } catch (error) {
      this.logger.error(
        `Appointment ${appointment.id} created but confirmation email failed`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  async findAll(
    userId: string,
    query: AppointmentQueryDto,
  ): Promise<PaginatedAppointmentsResponse> {
    await this.businessAccessService.assertMembership(userId, query.businessId);

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const sort = query.sort ?? 'asc';

    if (query.fromDate && query.toDate) {
      const from = new Date(query.fromDate);
      const to = new Date(query.toDate);

      if (from > to) {
        throw new BadRequestException('fromDate must be before or equal to toDate');
      }
    }

    const where: Prisma.AppointmentWhereInput = {
      businessId: query.businessId,
      ...(query.status !== undefined && { status: query.status }),
      ...this.buildDateRangeFilter(query.fromDate, query.toDate),
    };

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        orderBy: {
          appointmentDate: sort,
        },
        skip,
        take: limit,
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  }

  private buildDateRangeFilter(
    fromDate?: string,
    toDate?: string,
  ): Prisma.AppointmentWhereInput {
    if (!fromDate && !toDate) {
      return {};
    }

    return {
      appointmentDate: {
        ...(fromDate && { gte: new Date(fromDate) }),
        ...(toDate && { lte: new Date(toDate) }),
      },
    };
  }

  async findOne(userId: string, id: string): Promise<Appointment> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    await this.businessAccessService.assertMembership(
      userId,
      appointment.businessId,
    );

    return appointment;
  }

  async update(
    userId: string,
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    const {
      title,
      description,
      clientName,
      clientPhone,
      appointmentDate,
      status,
    } = updateAppointmentDto;

    if (
      title === undefined &&
      description === undefined &&
      clientName === undefined &&
      clientPhone === undefined &&
      appointmentDate === undefined &&
      status === undefined
    ) {
      throw new BadRequestException('At least one field must be provided');
    }

    await this.findOne(userId, id);

    return this.prisma.appointment.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(clientName !== undefined && { clientName }),
        ...(clientPhone !== undefined && { clientPhone }),
        ...(appointmentDate !== undefined && {
          appointmentDate: new Date(appointmentDate),
        }),
        ...(status !== undefined && { status }),
      },
    });
  }

  async remove(userId: string, id: string): Promise<void> {
    const appointment = await this.findOne(userId, id);

    await this.prisma.appointment.delete({
      where: { id: appointment.id },
    });
  }
}
