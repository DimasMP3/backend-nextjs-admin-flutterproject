import type { ComponentType, SVGProps } from "react";

export type NavItem = {
  label: string;
  href: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
};

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Movies", href: "/movies" },
  { label: "Showtimes", href: "/showtimes" },
  { label: "Theaters", href: "/theaters" },
  { label: "Orders", href: "/orders" },
  { label: "Users", href: "/users" },
  { label: "Settings", href: "/settings" },
];
