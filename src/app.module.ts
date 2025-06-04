// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductController } from './infrastructure/controllers/product.controller';
import { PaymentController } from './infrastructure/controllers/payment.controller';

import { DatabaseModule } from './infrastructure/database/database.module';
import { UseCasesModule } from './app/use-cases/use-cases.module';
import { WompiModule } from './infrastructure/wompi/wompi.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),

    DatabaseModule,
    UseCasesModule,
    WompiModule,
  ],
  controllers: [ProductController, PaymentController],
})
export class AppModule {}
