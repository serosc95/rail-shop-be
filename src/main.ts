import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api');
    app.enableCors();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

    // Swagger setup
    const config = new DocumentBuilder()
      .setTitle('Rail Shop (ROP y venta de productos)')
      .setDescription('Documentación de la API REST')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const configService = app.get(ConfigService);
    const PORT = configService.get<number>('PORT') || 3000;

    await app.listen(PORT);
    logger.log(`Server running at http://localhost:${PORT}`);
    logger.log(`Swagger at http://localhost:${PORT}/api/docs`);
  } catch (error) {
    logger.error('Application failed to start', error);
    process.exit(1);
  }
}

bootstrap();
