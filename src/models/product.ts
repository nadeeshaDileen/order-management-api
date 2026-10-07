// models/product.ts

export type Category = 'electronics' | 'clothing' | 'food' | 'books';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  stock: number;
  tags: string[];
  createdAt: Date;
}

export interface CreateProductInput {
  name: string;
  price: number;
  category: Category;
  stock: number;
  tags?: string[];
}

export interface UpdateProductInput {
  name?: string;
  price?: number;
  stock?: number;
  tags?: string[];
}
