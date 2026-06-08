import { BusinessRole } from '../../generated/prisma/client';

export type SafeBusiness = {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type BusinessWithMembership = SafeBusiness & {
  role: BusinessRole;
};
