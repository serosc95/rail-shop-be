import { Module } from '@nestjs/common';
import { CreatePaymentUseCase } from './create-payment.usecase';
import { ListProductsUseCase } from './list-products.usecase';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { WompiModule } from '../../infrastructure/wompi/wompi.module';

import { PRODUCT_REPOSITORY, TRANSACTION_REPOSITORY, WOMPI_REPOSITORY } from '../../domain/repositories/tokens';

@Module({
  imports: [DatabaseModule, WompiModule],
  providers: [
    {
      provide: ListProductsUseCase,
      useFactory: (productRepo) => new ListProductsUseCase(productRepo),
      inject: [PRODUCT_REPOSITORY],
    },
    {
      provide: CreatePaymentUseCase,
      useFactory: (productRepo, transactionRepo, wompiGateway) =>
        new CreatePaymentUseCase(productRepo, transactionRepo, wompiGateway),
      inject: [PRODUCT_REPOSITORY, TRANSACTION_REPOSITORY, WOMPI_REPOSITORY],
    },
  ],
  exports: [ListProductsUseCase, CreatePaymentUseCase],
})
export class UseCasesModule {}
