const appJson = require('./app.json');

const apiUrl =
  process.env.EXPO_PUBLIC_API_URL ??
  'https://agendalo-production-b282.up.railway.app';

module.exports = {
  expo: {
    ...appJson.expo,
    extra: {
      apiUrl,
    },
  },
};
