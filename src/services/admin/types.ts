export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  productCount: number;
  createdAt: Date;
};

export type AdminBrand = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  website?: string | null;
  productCount: number;
  createdAt: Date;
};

export type AdminCar = {
  id: string;
  slug: string;
  manufacturer: string;
  model: string;
  generation?: string | null;
  imageUrl?: string | null;
  yearFrom?: number | null;
  yearTo?: number | null;
  engineCode?: string | null;
  engineType?: string | null;
  oilCapacityLit?: number | null;
  viscosity?: string | null;
  specification?: string | null;
  overviewDetails?: string | null;
  engineDetails?: string | null;
  gearboxDetails?: string | null;
  maintenanceInfo?: string | null;
  productMappingCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminProductCarMapping = {
  car: {
    id: string;
    manufacturer: string;
    model: string;
    generation?: string | null;
    slug: string;
  };
};

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  sku?: string | null;
  description?: string | null;
  price: number;
  stock: number;
  viscosity?: string | null;
  oilType?: string | null;
  imageUrl?: string | null;
  isFeatured: boolean;
  brand: {
    id: string;
    name: string;
    slug: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  carMappings: AdminProductCarMapping[];
  averageRating?: number | null;
  reviewCount?: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminOrder = {
  id: string;
  fullName: string;
  email?: string | null;
  status: string;
  total: number;
  createdAt: Date;
};

export type AdminOrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

export type AdminOrderDetail = AdminOrder & {
  paymentMethod: string;
  paymentGateway?: string | null;
  paymentRefId?: string | null;
  shippingMethod: string;
  shippingTrackingCode?: string | null;
  phone: string;
  city: string;
  province: string;
  address1: string;
  address2?: string | null;
  postalCode: string;
  notes?: string | null;
  items: AdminOrderItem[];
};

export type AdminUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: "ADMIN" | "CUSTOMER";
  ordersCount: number;
  createdAt: Date;
};

export type AdminMaintenanceTask = {
  id: string;
  carId: string;
  title: string;
  description?: string | null;
  intervalKm?: number | null;
  intervalMonths?: number | null;
  priority: number;
  recommendedProductSlugs: string[];
  car: {
    id: string;
    manufacturer: string;
    model: string;
    generation?: string | null;
    slug: string;
  } | null;
  updatedAt: Date;
};

export type AdminQuestion = {
  id: string;
  question: string;
  answer?: string | null;
  status: "PENDING" | "ANSWERED" | "ARCHIVED";
  authorName: string;
  createdAt: Date;
  answeredAt?: Date | null;
};

export type AdminProductQuestion = AdminQuestion & {
  product: {
    id: string;
    name: string;
    slug: string;
    brandName: string;
  } | null;
};

export type AdminCarQuestion = AdminQuestion & {
  car: {
    id: string;
    manufacturer: string;
    model: string;
    slug: string;
  } | null;
};

export type EngagementGroup = {
  entityType: string;
  entityId: string;
  eventType: string;
  count: number;
};

export type OverviewTabData = {
  categories: AdminCategory[];
  brands: AdminBrand[];
  cars: AdminCar[];
  products: AdminProduct[];
  users: AdminUser[];
  recentOrders: AdminOrder[];
  totalRevenue: number;
  revenueLast30: number;
  ordersByStatus: Record<string, number>;
  ordersLast30: number;
  totalReviews: number;
  maintenanceTasks: AdminMaintenanceTask[];
  productQuestions: AdminProductQuestion[];
  carQuestions: AdminCarQuestion[];
  engagementGroups: EngagementGroup[];
};

export type ProductsTabFilters = {
  search?: string;
  brandId?: string;
  categoryId?: string;
  stockStatus: "all" | "low" | "out" | "in";
};

export type Pagination = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type ProductsTabData = {
  categories: AdminCategory[];
  brands: AdminBrand[];
  cars: AdminCar[];
  products: AdminProduct[];
  filters: ProductsTabFilters;
  pagination: Pagination;
  lowStock: {
    count: number;
    threshold: number;
    preview: Array<Pick<AdminProduct, "id" | "name" | "stock" | "slug">>;
  };
};

export type OrdersTabFilters = {
  status: "all" | "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  query?: string | null;
  page: number;
  perPage: number;
};

export type OrdersTabData = {
  orders: AdminOrderDetail[];
  filters: OrdersTabFilters;
  pagination: Pagination;
  statusCounts: Record<string, number>;
  revenueLast30: number;
};

export type CarsTabData = {
  cars: AdminCar[];
  maintenanceTasks: AdminMaintenanceTask[];
  products: AdminProduct[];
};

export type MaintenanceTabData = {
  cars: AdminCar[];
  maintenanceTasks: AdminMaintenanceTask[];
  products: AdminProduct[];
};

export type QuestionsTabData = {
  productQuestions: AdminProductQuestion[];
  carQuestions: AdminCarQuestion[];
};

export type BrandsTabData = {
  brands: AdminBrand[];
  totalReviews: number;
};

export type CategoriesTabData = {
  categories: AdminCategory[];
};

export type UsersTabData = {
  users: AdminUser[];
};

export type ReportsTabData = {
  engagementGroups: EngagementGroup[];
  maintenanceTasks: AdminMaintenanceTask[];
  productQuestions: AdminProductQuestion[];
  carQuestions: AdminCarQuestion[];
  products: AdminProduct[];
  cars: AdminCar[];
};
