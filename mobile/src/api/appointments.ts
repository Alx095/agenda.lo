import { authorizedRequest } from './client';
import {
  Appointment,
  CreateAppointmentData,
  GetAppointmentsParams,
  PaginatedAppointmentsResponse,
  UpdateAppointmentData,
} from '../types/appointment';

function buildQueryString(params?: GetAppointmentsParams): string {
  if (!params) {
    return '';
  }

  const searchParams = new URLSearchParams();

  if (params.status) {
    searchParams.set('status', params.status);
  }

  if (params.fromDate) {
    searchParams.set('fromDate', params.fromDate);
  }

  if (params.toDate) {
    searchParams.set('toDate', params.toDate);
  }

  if (params.page !== undefined) {
    searchParams.set('page', String(params.page));
  }

  if (params.limit !== undefined) {
    searchParams.set('limit', String(params.limit));
  }

  if (params.sort) {
    searchParams.set('sort', params.sort);
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export async function getAppointments(
  params?: GetAppointmentsParams,
): Promise<PaginatedAppointmentsResponse> {
  return authorizedRequest<PaginatedAppointmentsResponse>(
    `/appointments${buildQueryString(params)}`,
    { method: 'GET' },
  );
}

export async function getAppointmentById(id: string): Promise<Appointment> {
  return authorizedRequest<Appointment>(`/appointments/${id}`, {
    method: 'GET',
  });
}

export async function createAppointment(
  data: CreateAppointmentData,
): Promise<Appointment> {
  return authorizedRequest<Appointment>('/appointments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAppointment(
  id: string,
  data: UpdateAppointmentData,
): Promise<Appointment> {
  return authorizedRequest<Appointment>(`/appointments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteAppointment(id: string): Promise<void> {
  await authorizedRequest<void>(`/appointments/${id}`, {
    method: 'DELETE',
  });
}
