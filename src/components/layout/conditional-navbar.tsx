
"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import Navbar from "@/components/layout/navbar";

export default function ConditionalNavbar({
  children,
}: {
  children?: ReactNode;
}) {
  const pathname = usePathname();

  const isAdminRoute =
    pathname === "/dashboard/admin" ||
    pathname.startsWith("/dashboard/admin/");

  if (isAdminRoute) {
    return null;
  }

  return children ?? <Navbar />;
}
