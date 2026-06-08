const appJson = require('./app.json');

const apiUrl =
  process.env.EXPO_PUBLIC_API_URL ??
  'https://agendalo-production-b282.up.railway.app';

module.exports = {
  expo: {
    ...appJson.expo,
    plugins: [
      ...(appJson.expo.plugins ?? []),
      '@react-native-community/datetimepicker',
    ],
    extra: {
      apiUrl,
      eas: {
        projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
      },
    },
  },
};
