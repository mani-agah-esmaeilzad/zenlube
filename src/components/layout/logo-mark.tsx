import Image from "next/image";

export const LOGO_SRC = "/oilbar-logo-main.png";

type LogoMarkProps = {
  className?: string;
  size?: number;
  priority?: boolean;
};

export function LogoMark({
  className = "",
  size = 48,
  priority = false,
}: LogoMarkProps) {
  const containerClass = ["inline-flex items-center gap-3", className].filter(Boolean).join(" ");

  return (
    <span className={containerClass}>
      <Image
        src={LOGO_SRC}
        alt="لوگوی Oilbar"
        width={size}
        height={size}
        priority={priority}
        unoptimized
        className="h-auto w-auto"
      />
    </span>
  );
}
