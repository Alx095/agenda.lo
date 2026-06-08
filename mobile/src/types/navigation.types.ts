export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  VerifyEmail: { token?: string } | undefined;
};

export type AppStackParamList = {
  Home: undefined;
  AppointmentList: undefined;
  AppointmentForm: { appointmentId?: string } | undefined;
  AppointmentDetail: { appointmentId: string };
};
