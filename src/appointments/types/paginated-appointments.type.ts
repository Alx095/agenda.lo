import { Appointment } from '../../generated/prisma/client';

export type PaginatedAppointmentsResponse = {
  data: Appointment[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
