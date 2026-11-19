
"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function ConditionalNavbar({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  const isAdminRoute =
    pathname === "/dashboard/admin" ||
    pathname.startsWith("/dashboard/admin/");

  if (isAdminRoute) {
    return null;
  }

  return <>{children}</>;
}
