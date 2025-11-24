import Image from "next/image";

export const LOGO_SRC = "/ChatGPT%20Image%20Nov%2024,%202025,%2009_22_15%20PM.png";

type LogoMarkProps = {
  className?: string;
  size?: number;
  withText?: boolean;
  textAlign?: "left" | "center" | "right";
  priority?: boolean;
};

export function LogoMark({
  className = "",
  size = 48,
  withText = false,
  textAlign = "right",
  priority = false,
}: LogoMarkProps) {
  const containerClass = ["inline-flex items-center gap-3", className].filter(Boolean).join(" ");
  const textAlignment =
    textAlign === "left" ? "text-left" : textAlign === "center" ? "text-center" : "text-right";

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
