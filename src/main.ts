import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getCorsOptions } from './config/cors.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableCors(getCorsOptions());

  const port = Number(process.env.PORT) || 3000;
  const host = '0.0.0.0';

  await app.listen(port, host);

  Logger.log(`Application running on http://${host}:${port}`, 'Bootstrap');
}

bootstrap();
