export type VerifiedCarSeed = {
  slug: string;
  manufacturer: string;
  model: string;
  generation: string;
  imageUrl: string;
  engineType: string;
  engineCode: string;
  viscosity: string;
  oilCapacityLit: number;
  specification: string;
  yearFrom: number;
  yearTo: number;
  overviewDetails: string;
  engineDetails: string;
  gearboxDetails: string;
  maintenanceInfo: string;
  sources: {
    bamaModelUrl: string;
    oilSpecUrl: string;
    technicalSpecUrl: string;
  };
};

export const verifiedCars: VerifiedCarSeed[] = [];
