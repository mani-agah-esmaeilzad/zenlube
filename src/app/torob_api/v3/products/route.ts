// Torob's canonical v3 path. Keep the existing /api/torob/products path
// working as well so already-configured shops do not need a breaking change.
export {
  GET,
  POST,
} from "@/app/api/torob/products/route";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";
