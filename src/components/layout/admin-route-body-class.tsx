"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function AdminRouteBodyClass() {
  const pathname = usePathname();

  useEffect(() => {
    const isAdminRoute = pathname.startsWith("/admin");

    document.body.classList.toggle("admin-route", isAdminRoute);

    return () => {
      document.body.classList.remove("admin-route");
    };
  }, [pathname]);

  return null;
}
