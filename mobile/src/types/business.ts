export type BusinessRole = 'OWNER' | 'STAFF';

export type Business = {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

export type BusinessWithMembership = Business & {
  role: BusinessRole;
};

export type CreateBusinessData = {
  name: string;
};
