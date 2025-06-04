import { ProductEntity } from '../../infrastructure/database/entities/product.entity';

export class Product {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly price: number,
    public readonly stock: number,
  ) {}

  static fromEntity(entity: ProductEntity): Product {
    return new Product(
      entity.id,
      entity.name,
      entity.description,
      entity.price,
      entity.stock,
    );
  }

  updateStock(newStock: number): Product {
    if (newStock < 0) {
      throw new Error('El stock no puede ser negativo');
    }
    return new Product(this.id, this.name, this.description, this.price, newStock);
  }
}
