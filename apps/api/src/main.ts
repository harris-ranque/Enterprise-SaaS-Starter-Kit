import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const logger = WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.printf(({ level, message, timestamp }) => {
            return `${timestamp as string} [${level}] ${message as string}`;
          }),
        ),
      }),
    ],
  });

  const app = await NestFactory.create(AppModule, { logger });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');

  logger.log('Server is running on port 3001');
}

bootstrap();
