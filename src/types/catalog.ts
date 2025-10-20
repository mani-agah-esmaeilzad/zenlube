import type {
  Brand,
  Car,
  Category,
  Product,
  ProductCar,
  ProductReview,
} from "@/generated/prisma";

export type ProductWithRelations = Product & {
  brand: Brand;
  category: Category;
  carMappings: Array<ProductCar & { car: Car }>;
  reviews?: ProductReview[];
};

export type CarWithProducts = Car & {
  productMappings: Array<ProductCar & { product: Product & { brand: Brand } }>;
};
