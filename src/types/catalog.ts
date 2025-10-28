import type {
  Brand,
  Car,
  CarMaintenanceTask,
  CarQuestion,
  Category,
  Product,
  ProductCar,
  ProductQuestion,
  ProductReview,
} from "@/generated/prisma";

export type ProductWithRelations = Product & {
  brand: Brand;
  category: Category;
  carMappings: Array<ProductCar & { car: Car }>;
  reviews?: ProductReview[];
  questions?: ProductQuestion[];
};

export type CarWithProducts = Car & {
  productMappings: Array<ProductCar & { product: Product & { brand: Brand } }>;
  maintenanceTasks?: CarMaintenanceTask[];
  questions?: CarQuestion[];
};
