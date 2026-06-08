import { Injectable, NotFoundException } from '@nestjs/common';
import { BusinessUser } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BusinessAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async assertMembership(
    userId: string,
    businessId: string,
  ): Promise<BusinessUser> {
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

    return membership;
  }
}
