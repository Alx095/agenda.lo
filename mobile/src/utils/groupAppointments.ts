import { Appointment } from '../types/appointment';
import { formatSectionTitle } from './formatDate';

export type AppointmentDaySection = {
  title: string;
  dateKey: string;
  data: Appointment[];
};

export function groupAppointmentsByDay(
  appointments: Appointment[],
): AppointmentDaySection[] {
  const groups = new Map<string, Appointment[]>();

  const sorted = [...appointments].sort(
    (a, b) =>
      new Date(a.appointmentDate).getTime() -
      new Date(b.appointmentDate).getTime(),
  );

  for (const appointment of sorted) {
    const dateKey = new Date(appointment.appointmentDate).toDateString();
    const existing = groups.get(dateKey);

    if (existing) {
      existing.push(appointment);
    } else {
      groups.set(dateKey, [appointment]);
    }
  }

  return Array.from(groups.entries()).map(([dateKey, data]) => ({
    dateKey,
    title: formatSectionTitle(dateKey),
    data,
  }));
}

export function filterTodayAppointments(
  appointments: Appointment[],
): Appointment[] {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  return appointments
    .filter((item) => {
      const date = new Date(item.appointmentDate);
      return date >= start && date <= end;
    })
    .sort(
      (a, b) =>
        new Date(a.appointmentDate).getTime() -
        new Date(b.appointmentDate).getTime(),
    );
}
