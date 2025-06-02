import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from './infrastructure/controllers/product.controller';
import { PaymentController } from './infrastructure/controllers/payment.controller';
import { ProductRepositoryAdapter } from './infrastructure/database/repositories/product.repository.adapter';
import { TransactionRepositoryAdapter } from './infrastructure/database/repositories/transaction.repository.adapter';
import { WompiGatewayAdapter } from './infrastructure/wompi/wompi.gateway.adapter';
import { ProductEntity } from './infrastructure/database/entities/product.entity';
import { TransactionEntity } from './infrastructure/database/entities/transaction.entity';
import { ListProductsUseCase } from './app/use-cases/list-products.usecase';
import { CreatePaymentUseCase } from './app/use-cases/create-payment.usecase';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: 'admin123',
      database: 'wompi',
      entities: [ProductEntity, TransactionEntity],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([ProductEntity, TransactionEntity]),
  ],
  controllers: [
    ProductController,
    PaymentController,
  ],
  providers: [
    {
      provide: 'ProductRepository',
      useClass: ProductRepositoryAdapter,
    },
    {
      provide: 'TransactionRepository',
      useClass: TransactionRepositoryAdapter,
    },
    {
      provide: 'WompiGateway',
      useClass: WompiGatewayAdapter,
    },
    {
      provide: ListProductsUseCase,
      useFactory: (productRepo: ProductRepositoryAdapter) =>
        new ListProductsUseCase(productRepo),
      inject: ['ProductRepository'],
    },
    {
      provide: CreatePaymentUseCase,
      useFactory: (
        productRepo: ProductRepositoryAdapter,
        transactionRepo: TransactionRepositoryAdapter,
        wompi: WompiGatewayAdapter
      ) => new CreatePaymentUseCase(productRepo, transactionRepo, wompi),
      inject: ['ProductRepository', 'TransactionRepository', 'WompiGateway'],
    },
  ],
})
export class AppModule {}
