import Image from "next/image";
import { cn } from "@/lib/utils";

export const LOGO_SRC = "/oilbar-logo-optimized.png";
const LOGO_WIDTH = 676;
const LOGO_HEIGHT = 264;

type LogoMarkProps = {
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export function LogoMark({
  className = "",
  priority = false,
  sizes,
}: LogoMarkProps) {
  return (
    <Image
      alt="لوگوی Oilbar"
      className={cn("h-auto w-auto object-contain", className)}
      height={LOGO_HEIGHT}
      priority={priority}
      sizes={sizes}
      src={LOGO_SRC}
      width={LOGO_WIDTH}
    />
  );
}
