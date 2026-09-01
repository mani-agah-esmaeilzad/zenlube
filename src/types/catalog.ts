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
  ProductPromotion,
} from "@/generated/prisma";

export type ProductWithRelations = Product & {
  brand: Brand;
  category: Category;
  carMappings: Array<ProductCar & { car: Car }>;
  reviews?: ProductReview[];
  questions?: ProductQuestion[];
  promotion?: ProductPromotion | null;
};

export type CarWithProducts = Car & {
  productMappings: Array<ProductCar & { product: Product & { brand: Brand } }>;
  maintenanceTasks?: CarMaintenanceTask[];
  questions?: CarQuestion[];
};
