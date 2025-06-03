import { Controller, Get } from '@nestjs/common';
import { ListProductsUseCase } from '../../app/use-cases/list-products.usecase';
import { ApiTags, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ProductDto } from '../dtos/product.dto';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly useCase: ListProductsUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los productos' })
  @ApiOkResponse({ description: 'Lista de productos', type: [ProductDto] })
  async list() {
    return this.useCase.execute();
  }
}
