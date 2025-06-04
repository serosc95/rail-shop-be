import {
  Controller,
  Get,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ListProductsUseCase } from '../../app/use-cases/list-products.usecase';
import { ProductDto } from '../../app/dtos/product.dto';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(
    private readonly listProductsUseCase: ListProductsUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los productos' })
  @ApiOkResponse({
    description: 'Lista de productos',
    type: ProductDto,
    isArray: true,
  })
  async list(): Promise<ProductDto[]> {
    try {
      return await this.listProductsUseCase.execute();
    } catch (error) {
      throw new InternalServerErrorException(
        'No se pudieron obtener los productos',
      );
    }
  }
}
