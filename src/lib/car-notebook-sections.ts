export type StoredCarNotebookSection = {
  categoryId: number;
  id: string;
  title: string;
  tag: string;
  sourceTitle: string;
  description: string;
  sourceUrl?: string;
};

export type RequestedCarNotebookSection = {
  categoryId: number;
  id: string;
  title: string;
  tag: string;
  storeCategorySlugs?: string[];
};

export const REQUESTED_CAR_NOTEBOOK_SECTIONS: readonly RequestedCarNotebookSection[] = [
  { categoryId: 2, id: "fuel-filter", title: "فیلتر بنزین", tag: "سوخت" },
  { categoryId: 3, id: "gearbox-oil", title: "روغن گیربکس", tag: "گیربکس", storeCategorySlugs: ["gear-oil"] },
  { categoryId: 1, id: "engine-oil", title: "روغن موتور", tag: "روانکار", storeCategorySlugs: ["engine-oil"] },
  { categoryId: 4, id: "brake-fluid", title: "روغن ترمز", tag: "ترمز", storeCategorySlugs: ["brake-oil"] },
  { categoryId: 5, id: "oil-filter", title: "فیلتر روغن", tag: "فیلتر", storeCategorySlugs: ["oil-filter"] },
  { categoryId: 6, id: "air-filter", title: "فیلتر هوا", tag: "فیلتر", storeCategorySlugs: ["air-filter"] },
  { categoryId: 14, id: "cabin-filter", title: "فیلتر کابین", tag: "فیلتر", storeCategorySlugs: ["cabin-filter"] },
  { categoryId: 7, id: "antifreeze", title: "ضدیخ", tag: "خنک‌کاری" },
  { categoryId: 49, id: "octane", title: "اکتان", tag: "سوخت" },
  { categoryId: 33, id: "hydraulic-oil", title: "روغن هیدرولیک", tag: "هیدرولیک" },
] as const;

export const REQUESTED_CAR_NOTEBOOK_CATEGORY_IDS = REQUESTED_CAR_NOTEBOOK_SECTIONS.map((section) => section.categoryId);

export const REQUESTED_CAR_NOTEBOOK_SECTION_BY_ID = new Map<number, RequestedCarNotebookSection>(
  REQUESTED_CAR_NOTEBOOK_SECTIONS.map((section) => [section.categoryId, section] as const),
);

export const REQUESTED_CAR_NOTEBOOK_SECTION_BY_PAGE_ID = new Map<string, RequestedCarNotebookSection>(
  REQUESTED_CAR_NOTEBOOK_SECTIONS.map((section) => [section.id, section] as const),
);
