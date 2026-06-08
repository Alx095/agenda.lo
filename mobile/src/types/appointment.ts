export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'COMPLETED';

export type Appointment = {
  id: string;
  title: string;
  description: string | null;
  clientName: string;
  clientPhone: string | null;
  appointmentDate: string;
  status: AppointmentStatus;
  businessId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateAppointmentData = {
  businessId: string;
  title: string;
  description?: string;
  clientName: string;
  clientPhone?: string;
  appointmentDate: string;
  status?: AppointmentStatus;
};

export type UpdateAppointmentData = {
  title?: string;
  description?: string;
  clientName?: string;
  clientPhone?: string;
  appointmentDate?: string;
  status?: AppointmentStatus;
};

export type GetAppointmentsParams = {
  businessId: string;
  status?: AppointmentStatus;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sort?: 'asc' | 'desc';
};

export type PaginatedAppointmentsResponse = {
  data: Appointment[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
