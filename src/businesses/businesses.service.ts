import { Injectable, NotFoundException } from '@nestjs/common';
import { Business, BusinessRole } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import {
  BusinessWithMembership,
  SafeBusiness,
} from './types/business.types';
import { BusinessAccessService } from './business-access.service';

@Injectable()
export class BusinessesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly businessAccessService: BusinessAccessService,
  ) {}

  async create(userId: string, dto: CreateBusinessDto): Promise<SafeBusiness> {
    const business = await this.prisma.$transaction(async (tx) => {
      const createdBusiness = await tx.business.create({
        data: {
          name: dto.name.trim(),
          ownerId: userId,
        },
      });

      await tx.businessUser.create({
        data: {
          businessId: createdBusiness.id,
          userId,
          role: BusinessRole.OWNER,
        },
      });

      return createdBusiness;
    });

    return this.toSafeBusiness(business);
  }

  async findAllForUser(userId: string): Promise<BusinessWithMembership[]> {
    const memberships = await this.prisma.businessUser.findMany({
      where: { userId },
      include: { business: true },
      orderBy: { createdAt: 'desc' },
    });

    return memberships.map((membership) => ({
      ...this.toSafeBusiness(membership.business),
      role: membership.role,
    }));
  }

  async findOneForUser(
    userId: string,
    businessId: string,
  ): Promise<BusinessWithMembership> {
    await this.businessAccessService.assertMembership(userId, businessId);

    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const membership = await this.prisma.businessUser.findUnique({
      where: {
        businessId_userId: {
          businessId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Business not found');
    }

    return {
      ...this.toSafeBusiness(business),
      role: membership.role,
    };
  }

  private toSafeBusiness(business: Business): SafeBusiness {
    return {
      id: business.id,
      name: business.name,
      ownerId: business.ownerId,
      createdAt: business.createdAt,
      updatedAt: business.updatedAt,
    };
  }
}
