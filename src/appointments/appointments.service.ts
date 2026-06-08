import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Appointment, AppointmentStatus, Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentQueryDto } from './dto/appointment-query.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { PaginatedAppointmentsResponse } from './types/paginated-appointments.type';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    return this.prisma.appointment.create({
      data: {
        title: createAppointmentDto.title,
        description: createAppointmentDto.description,
        clientName: createAppointmentDto.clientName,
        clientPhone: createAppointmentDto.clientPhone,
        appointmentDate: new Date(createAppointmentDto.appointmentDate),
        status: createAppointmentDto.status ?? AppointmentStatus.PENDING,
        userId,
      },
    });
  }

  async findAll(
    userId: string,
    query: AppointmentQueryDto,
  ): Promise<PaginatedAppointmentsResponse> {
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
      userId,
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
    const appointment = await this.prisma.appointment.findFirst({
      where: { id, userId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

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
    const result = await this.prisma.appointment.deleteMany({
      where: { id, userId },
    });

    if (result.count === 0) {
      throw new NotFoundException('Appointment not found');
    }
  }
}
