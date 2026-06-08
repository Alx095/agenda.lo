import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export function getCorsOptions(): CorsOptions {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const corsOrigin = process.env.CORS_ORIGIN?.trim();

  if (corsOrigin) {
    return {
      origin: corsOrigin
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
      credentials: true,
    };
  }

  if (nodeEnv !== 'production') {
    return {
      origin: true,
      credentials: true,
    };
  }

  return {
    origin: false,
    credentials: true,
  };
}
