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
  isActive: boolean;
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
  requiresShipping: boolean;
  shippingWeightGrams?: number | null;
  shippingDimensionsMode: "DEFAULT" | "CUSTOM";
  shippingLengthCm?: number | null;
  shippingWidthCm?: number | null;
  shippingHeightCm?: number | null;
  shippingRestrictedCarriers: string[];
  shippingIsLiquid: boolean;
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

export type AdminOrderSmsFeedback = {
  status: "sent" | "failed" | "disabled" | "sending" | "uncertain" | "sandbox" | "absent" | "unknown";
  label: string;
  errorSummary?: string;
};

export type AdminOrderDetail = AdminOrder & {
  smsNotifications?: {
    status: AdminOrderSmsFeedback | null;
    tracking: AdminOrderSmsFeedback | null;
    merchant: AdminOrderSmsFeedback;
  };
  paymentMethod: string;
  paymentGateway?: string | null;
  paymentRefId?: string | null;
  paymentAuthority?: string | null;
  paidAt?: Date | null;
  shippingMethod?: string | null;
  shippingCost: number;
  shippingProviderKey?: string | null;
  shippingCarrierCode?: string | null;
  shippingCarrierLabel?: string | null;
  shippingServiceCode?: string | null;
  shippingServiceLabel?: string | null;
  shippingBaseCost?: number | null;
  shippingAdjustmentAmount: number;
  shippingCurrency: string;
  shippingPackageWeightGrams?: number | null;
  shippingPackageLengthCm?: number | null;
  shippingPackageWidthCm?: number | null;
  shippingPackageHeightCm?: number | null;
  shippingQuotedAt?: Date | null;
  shippingQuoteExpiresAt?: Date | null;
  shippingExternalStatus?: string | null;
  shippingTrackingUrl?: string | null;
  shippingTrackingCode?: string | null;
  phone: string;
  city: string;
  province: string;
  address1: string;
  address2?: string | null;
  postalCode: string;
  notes?: string | null;
  items: AdminOrderItem[];
  paymentEvents: Array<{
    id: string;
    gateway: string;
    authority?: string | null;
    status: string;
    createdAt: Date;
  }>;
  shipment?: {
    id: string;
    status: string;
    externalStatus?: string | null;
    externalShipmentId?: string | null;
    trackingCode?: string | null;
    submittedAt?: Date | null;
    attemptCount: number;
    lastErrorMessage?: string | null;
  } | null;
};

export type AdminUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: "ADMIN" | "OPERATIONS_MANAGER" | "CONTENT_MANAGER" | "SUPPORT" | "CUSTOMER";
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
  shipping: "all" | "POST" | "TIPAX" | "UNSHIPPED" | "SHIPPED" | "TRACKING";
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
  averageOrderValue: number;
  paidOrdersCount: number;
  wishlistItemsCount: number;
  recentViewsCount: number;
  couponCount: number;
  couponRedemptions: number;
  auditLogs: Array<{
    id: string;
    actorName: string;
    actorEmail?: string | null;
    targetType: string;
    targetId: string;
    action: string;
    summary: string;
    createdAt: Date;
  }>;
  returnRequests: Array<{
    id: string;
    orderId: string;
    userName: string;
    reason: string;
    status: string;
    requestedAt: Date;
    refundAmount?: number | null;
  }>;
};

export type AdminMarketingBanner = {
  id: string;
  title: string;
  subtitle?: string | null;
  ctaLabel?: string | null;
  ctaLink?: string | null;
  imageUrl?: string | null;
  position: string;
  isActive: boolean;
  updatedAt: Date;
};

export type AdminBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string | null;
  tags: string[];
  authorName: string;
  readMinutes: number;
  publishedAt: Date;
};

export type AdminGalleryImage = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  link?: string | null;
  orderIndex: number;
  isActive: boolean;
  updatedAt: Date;
};

export type ContentTabData = {
  banners: AdminMarketingBanner[];
  posts: AdminBlogPost[];
  galleryImages: AdminGalleryImage[];
  coupons: Array<{
    id: string;
    code: string;
    title: string;
    discountType: string;
    amount: number;
    minOrderAmount?: number | null;
    usageLimit?: number | null;
    usedCount: number;
    isActive: boolean;
    endsAt?: Date | null;
  }>;
  smsLogs: Array<{
    id: string;
    phone: string;
    eventType: string;
    templateName?: string | null;
    status: string;
    provider?: string | null;
    errorMessage?: string | null;
    createdAt: Date;
  }>;
};

export type AdminPromotionKind = "SALE" | "OCTANE" | "RACING_FUEL";

export type AdminSpecialOffer = {
  id: string;
  productId: string;
  kind: AdminPromotionKind;
  label?: string | null;
  specialPrice?: number | null;
  startsAt?: Date | null;
  endsAt?: Date | null;
  sortOrder: number;
  isActive: boolean;
  updatedAt: Date;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    imageUrl?: string | null;
    brandName: string;
  };
};

export type SpecialOffersTabData = {
  offers: AdminSpecialOffer[];
  products: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    imageUrl?: string | null;
    brandName: string;
    categoryName: string;
    hasPromotion: boolean;
    torobReady: boolean;
  }>;
  readiness: {
    total: number;
    priced: number;
    inStock: number;
    withImage: number;
    torobReady: number;
    missingPrice: number;
    outOfStock: number;
    missingImage: number;
  };
};

export type AdminShippingLocation = {
  code: string;
  name: string;
  parentCode?: string | null;
};

export type ShippingTabData = {
  settings: {
    enabled: boolean;
    providerKey: string;
    providerStoreId: string;
    providerProductTypeCode: string;
    originProvinceCode: string;
    originCityCode: string;
    originAddress: string;
    originPostalCode: string;
    senderName: string;
    senderMobile: string;
    enabledCarriers: string[];
    basePackagingWeightGrams: number;
    extraPackagingWeightPerAdditionalItemGrams: number;
    minimumPackageWeightGrams: number;
    defaultLengthCm: number;
    defaultWidthCm: number;
    defaultHeightCm: number;
    freeShippingEnabled: boolean;
    freeShippingThresholdRials: number | null;
    adjustmentFixedRials: number;
    adjustmentPercent: number;
    manualFallbackEnabled: boolean;
    manualFallbackLabel: string;
    manualFallbackCostRials: number | null;
    quoteTtlSeconds: number;
    providerTimeoutMs: number;
  };
  environment: {
    providerMode: "amadast" | "mock" | "disabled";
    clientCodeConfigured: boolean;
    providerIdentityConfigured: boolean;
    ready: boolean;
    isProductionMock: boolean;
  };
  rollout: {
    mode: "legacy" | "dynamic";
    setupReady: boolean;
    enabled: boolean;
    blockers: Array<{ code: string; message: string }>;
  };
  capabilities: {
    quotes: boolean;
    locationSync: boolean;
    createShipment: boolean;
    trackingLookup: boolean;
    cancelShipment: boolean;
    label: boolean;
  } | null;
  provinces: AdminShippingLocation[];
  cities: AdminShippingLocation[];
  stats: {
    physicalProducts: number;
    missingWeightProducts: number;
    mappedProvinces: number;
    mappedCities: number;
    originMapped: boolean;
    lastLocationSyncAt: string | null;
  };
};
