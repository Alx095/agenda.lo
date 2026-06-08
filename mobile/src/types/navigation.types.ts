export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  AppointmentList: undefined;
  AppointmentForm: undefined;
  AppointmentDetail: { appointmentId: string };
};
