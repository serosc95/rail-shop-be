import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from '../../../src/infrastructure/controllers/product.controller';
import { ListProductsUseCase } from '../../../src/app/usecases/list-products.usecase';
import { ProductDto } from '../../../src/app/dtos/product.dto';
import { InternalServerErrorException } from '@nestjs/common';

describe('ProductController', () => {
  let controller: ProductController;
  let listProductsUseCase: ListProductsUseCase;

   const mockProducts: ProductDto[] = [
          {
            id: '1',
            name: 'Product A',
            price: 100,
            description: 'A great product',
            stock: 10,
          },
          {
            id: '2',
            name: 'Product B',
            price: 200,
            description: 'Another product',
            stock: 5,
          },
        ];

  const mockUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ListProductsUseCase,
          useValue: mockUseCase,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    listProductsUseCase = module.get<ListProductsUseCase>(ListProductsUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería devolver una lista de productos', async () => {
    mockUseCase.execute.mockResolvedValue(mockProducts);

    const result = await controller.list();

    expect(result).toEqual(mockProducts);
    expect(mockUseCase.execute).toHaveBeenCalled();
  });

  it('debería lanzar una InternalServerErrorException si falla el use case', async () => {
    mockUseCase.execute.mockRejectedValue(new Error('Fallo de prueba'));

    await expect(controller.list()).rejects.toThrow(InternalServerErrorException);
  });
});
