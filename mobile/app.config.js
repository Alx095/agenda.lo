const appJson = require('./app.json');

const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

module.exports = {
  expo: {
    ...appJson.expo,
    extra: {
      apiUrl,
    },
  },
};
