import type { ShippingProvider } from "@/lib/shipping/providers/provider";

export const mockShippingProvider: ShippingProvider = {
  key: "mock",
  capabilities: {
    quotes: true,
    locationSync: true,
    createShipment: true,
    trackingLookup: true,
    cancelShipment: false,
    label: false,
  },
  async quote(request) {
    const weightStep = Math.ceil(request.weightGrams / 1_000);
    return [
      {
        providerRequestId: `mock-${request.originExternalCityId}-${request.destinationExternalCityId}`,
        carrierCode: "POST",
        carrierLabel: "پست",
        serviceCode: "post-pishtaz",
        serviceLabel: "پست پیشتاز (آزمایشی)",
        basePriceRials: 600_000 + weightStep * 80_000,
        estimatedDeliveryLabel: "۳ تا ۵ روز کاری",
        estimatedMinDays: 3,
        estimatedMaxDays: 5,
      },
      {
        providerRequestId: `mock-${request.originExternalCityId}-${request.destinationExternalCityId}`,
        carrierCode: "TIPAX",
        carrierLabel: "تیپاکس",
        serviceCode: "tipax-standard",
        serviceLabel: "تیپاکس (آزمایشی)",
        basePriceRials: 850_000 + weightStep * 100_000,
        estimatedDeliveryLabel: "۲ تا ۴ روز کاری",
        estimatedMinDays: 2,
        estimatedMaxDays: 4,
      },
    ];
  },
  async listLocations() {
    return {
      provinces: [
        { externalId: 21, name: "تهران", externalParentId: 0 },
        { externalId: 11, name: "خراسان رضوی", externalParentId: 0 },
        { externalId: 4, name: "اصفهان", externalParentId: 0 },
        { externalId: 17, name: "فارس", externalParentId: 0 },
      ],
      cities: [
        { externalId: 86, name: "تهران", externalParentId: 21 },
        { externalId: 522, name: "مشهد", externalParentId: 11 },
        { externalId: 201, name: "اصفهان", externalParentId: 4 },
        { externalId: 901, name: "شیراز", externalParentId: 17 },
      ],
    };
  },
  async createShipment(request) {
    return { externalShipmentId: `mock-${request.externalOrderNumber}`, externalStatus: "SUBMITTED" };
  },
  async lookupTracking(phone) {
    return [{
      externalOrderNumber: 1,
      carrierLabel: "پست آزمایشی",
      amadastTrackingCode: `MOCK-${phone.slice(-4)}`,
      carrierTrackingCode: null,
    }];
  },
};
