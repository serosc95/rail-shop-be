// src/infrastructure/database/database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductEntity } from './entities/product.entity';
import { TransactionEntity } from './entities/transaction.entity';

import { ProductRepositoryAdapter } from './repositories/product.repository.adapter';
import { TransactionRepositoryAdapter } from './repositories/transaction.repository.adapter';

import { PRODUCT_REPOSITORY, TRANSACTION_REPOSITORY } from '../../domain/repositories/tokens';


@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, TransactionEntity])],
  providers: [
    { provide: PRODUCT_REPOSITORY, useClass: ProductRepositoryAdapter },
    { provide: TRANSACTION_REPOSITORY, useClass: TransactionRepositoryAdapter },
  ],
  exports: [PRODUCT_REPOSITORY, TRANSACTION_REPOSITORY],
})
export class DatabaseModule {}
