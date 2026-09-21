import type { Metadata } from "next";

import { MgModelOverview } from "@/components/catalog/mg-model-overview";
import { getMgModelHub } from "@/lib/mg-model-hubs";
import { buildPageMetadata } from "@/lib/seo";

const hub = getMgModelHub("mg-gs");

export const metadata: Metadata = buildPageMetadata({
  pathname: "/cars/mg-gs",
  title: hub.title,
  description: hub.description,
  imageUrl: hub.image,
});

export default function MgGsOverviewPage() {
  return <MgModelOverview hub={hub} />;
}
