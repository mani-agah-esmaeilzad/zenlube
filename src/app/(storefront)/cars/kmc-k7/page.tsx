import type { Metadata } from "next";

import { CarModelOverview } from "@/components/catalog/mg-model-overview";
import { getKmcModelHub, kmcModelLinks } from "@/lib/kmc-model-hubs";
import { buildPageMetadata } from "@/lib/seo";

const hub = getKmcModelHub("kmc-k7");

export const metadata: Metadata = buildPageMetadata({
  pathname: "/cars/kmc-k7",
  title: hub.title,
  description: hub.description,
  imageUrl: hub.image,
});

export default function KmcK7OverviewPage() {
  return <CarModelOverview brandLabel="کی ام سی" brandName="KMC" hub={hub} models={kmcModelLinks} />;
}
