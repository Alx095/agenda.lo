import { ConfigService } from '@nestjs/config';
import { UnverifiedUsersCleanupService } from './unverified-users-cleanup.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UnverifiedUsersCleanupService', () => {
  const prisma = {
    user: {
      deleteMany: jest.fn(),
    },
  } as unknown as PrismaService;

  const configService = {
    get: jest.fn().mockReturnValue(5),
  } as unknown as ConfigService;

  let service: UnverifiedUsersCleanupService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UnverifiedUsersCleanupService(prisma, configService);
  });

  it('marks users older than TTL as expired', () => {
    const sixMinutesAgo = new Date(Date.now() - 6 * 60 * 1000);
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

    expect(service.isExpired(sixMinutesAgo)).toBe(true);
    expect(service.isExpired(twoMinutesAgo)).toBe(false);
  });

  it('deletes only unverified users past the cutoff', async () => {
    (prisma.user.deleteMany as jest.Mock).mockResolvedValue({ count: 2 });

    const deleted = await service.deleteExpiredUnverifiedUsers();

    expect(deleted).toBe(2);
    expect(prisma.user.deleteMany).toHaveBeenCalledWith({
      where: {
        emailVerified: false,
        createdAt: { lt: expect.any(Date) },
      },
    });
  });
});
