import { ListProductsUseCase } from '../../../src/app/usecases/list-products.usecase';
import { ProductRepository } from '../../../src/domain/repositories/product.repository';
import { Product } from '../../../src/domain/models/product';

describe('ListProductsUseCase', () => {
  let useCase: ListProductsUseCase;
  let productRepo: jest.Mocked<ProductRepository>;

  beforeEach(() => {
    productRepo = {
      findAll: jest.fn(),
    } as unknown as jest.Mocked<ProductRepository>;

    useCase = new ListProductsUseCase(productRepo);
  });

  it('should return a list of products', async () => {
    const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Product A',
          price: 100,
          description: 'A great product',
          stock: 10,
          updateStock: jest.fn(),
        },
        {
          id: '2',
          name: 'Product B',
          price: 200,
          description: 'Another product',
          stock: 5,
          updateStock: jest.fn(),
        },
      ];
      

    productRepo.findAll.mockResolvedValue(mockProducts);

    const result = await useCase.execute();

    expect(result).toEqual(mockProducts);
    expect(productRepo.findAll).toHaveBeenCalledTimes(1);
  });

  it('should return an empty array if no products are found', async () => {
    productRepo.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
    expect(productRepo.findAll).toHaveBeenCalled();
  });

  it('should throw if repository fails', async () => {
    productRepo.findAll.mockRejectedValue(new Error('Database error'));

    await expect(useCase.execute()).rejects.toThrow('Database error');
    expect(productRepo.findAll).toHaveBeenCalled();
  });
});
