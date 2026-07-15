"use client";

import { usePathname } from "next/navigation";

export function SiteChromeShell({
  children,
  hideOnHome = false,
}: Readonly<{
  children: React.ReactNode;
  hideOnHome?: boolean;
}>) {
  const pathname = usePathname();

  if (hideOnHome && pathname === "/") {
    return null;
  }

  return <div className="site-chrome">{children}</div>;
}
