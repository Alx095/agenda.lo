export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  VerifyEmail: { token?: string } | undefined;
};

export type MainTabParamList = {
  Today: undefined;
  Calendar: undefined;
  Account: undefined;
};

export type AppStackParamList = {
  MainTabs: { screen?: keyof MainTabParamList } | undefined;
  AppointmentForm: { appointmentId?: string } | undefined;
  AppointmentDetail: { appointmentId: string };
};
