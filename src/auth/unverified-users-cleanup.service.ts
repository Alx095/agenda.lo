import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UnverifiedUsersCleanupService {
  private readonly logger = new Logger(UnverifiedUsersCleanupService.name);
  private readonly ttlMinutes: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.ttlMinutes = this.configService.get<number>(
      'UNVERIFIED_USER_TTL_MINUTES',
      5,
    );
  }

  getTtlMinutes(): number {
    return this.ttlMinutes;
  }

  isExpired(createdAt: Date): boolean {
    const cutoff = this.getCutoffDate();
    return createdAt < cutoff;
  }

  getCutoffDate(): Date {
    return new Date(Date.now() - this.ttlMinutes * 60 * 1000);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async cleanupExpiredUnverifiedUsers(): Promise<void> {
    const deleted = await this.deleteExpiredUnverifiedUsers();

    if (deleted > 0) {
      this.logger.log(
        `Removed ${deleted} unverified user(s) older than ${this.ttlMinutes} minute(s)`,
      );
    }
  }

  async deleteExpiredUnverifiedUsers(): Promise<number> {
    const result = await this.prisma.user.deleteMany({
      where: {
        emailVerified: false,
        createdAt: { lt: this.getCutoffDate() },
      },
    });

    return result.count;
  }

  async deleteUnverifiedUser(userId: string): Promise<void> {
    await this.prisma.user.deleteMany({
      where: {
        id: userId,
        emailVerified: false,
      },
    });
  }
}
