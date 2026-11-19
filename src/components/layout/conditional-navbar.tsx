
"use client";

import { usePathname } from "next/navigation";
import Navbar from "./navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();

  const isDashboardRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/student/dashboard") ||
    pathname.startsWith("/tutor/dashboard");

  if (isDashboardRoute) {
    return null;
  }

  return <Navbar />;
}
