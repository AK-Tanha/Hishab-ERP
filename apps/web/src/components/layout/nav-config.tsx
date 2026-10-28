import {
  Home, ShoppingCart, Truck, Package, BookOpen, BarChart3, Users, Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  tab?: boolean; // true = shown in the mobile bottom bar
};

export type NavGroup = { id: string; items: NavItem[] };

export const navGroups: NavGroup[] = [
  {
    id: "main",
    items: [
      { href: "/dashboard", labelKey: "nav.home", icon: Home, tab: true },
      { href: "/sales", labelKey: "nav.sales", icon: ShoppingCart, tab: true },
      { href: "/purchases", labelKey: "nav.purchases", icon: Truck },
      { href: "/inventory", labelKey: "nav.inventory", icon: Package, tab: true },
    ],
  },
  {
    id: "finance",
    items: [
      { href: "/accounting", labelKey: "nav.accounting", icon: BookOpen },
      { href: "/reports", labelKey: "nav.reports", icon: BarChart3, tab: true },
    ],
  },
  {
    id: "system",
    items: [
      { href: "/users", labelKey: "nav.users", icon: Users },
      { href: "/settings", labelKey: "nav.settings", icon: Settings },
    ],
  },
];

// The primary action for each section (FAB on mobile, header button on desktop)
export const quickActions = [
  { match: "/dashboard", href: "/sales/new", labelKey: "nav.newInvoice" },
  { match: "/sales", href: "/sales/new", labelKey: "nav.newInvoice" },
  { match: "/purchases", href: "/purchases/new", labelKey: "nav.newBill" },
  { match: "/inventory", href: "/inventory/new", labelKey: "nav.newProduct" },
];

export const isActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(href + "/");