import Image from "next/image";

export const LOGO_SRC = "/ChatGPT%20Image%20Nov%2024,%202025,%2009_22_15%20PM.png";

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
        alt="لوگوی اویل بار"
        width={size}
        height={size}
        priority={priority}
        className="h-auto w-auto"
      />
    </span>
  );
}
