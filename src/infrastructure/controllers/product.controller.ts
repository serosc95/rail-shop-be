import { Controller, Get } from '@nestjs/common';
import { ListProductsUseCase } from '../../app/use-cases/list-products.usecase';

@Controller('products')
export class ProductController {
  constructor(private readonly useCase: ListProductsUseCase) {}

  @Get()
  async list() {
    return this.useCase.execute();
  }
}