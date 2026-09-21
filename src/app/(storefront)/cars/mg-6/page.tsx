import type { Metadata } from "next";

import { MgModelOverview } from "@/components/catalog/mg-model-overview";
import { getMgModelHub } from "@/lib/mg-model-hubs";
import { buildPageMetadata } from "@/lib/seo";

const hub = getMgModelHub("mg-6");

export const metadata: Metadata = buildPageMetadata({
  pathname: "/cars/mg-6",
  title: hub.title,
  description: hub.description,
  imageUrl: hub.image,
});

export default function Mg6OverviewPage() {
  return <MgModelOverview hub={hub} />;
}
