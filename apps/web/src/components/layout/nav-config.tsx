import {
  Home, FileText, Truck, Package, BookOpen, BarChart3, Users, Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  tab?: boolean; // true = shown in the mobile bottom bar
  requiredPermission?: string | string[]; // permission required to see this item
  requiredRole?: "owner" | "admin" | "accountant" | "sales" | "storekeeper";
};

export type NavGroup = { id: string; items: NavItem[] };

export const navGroups: NavGroup[] = [
  {
    id: "home",
    items: [
      { href: "/dashboard", labelKey: "nav.home", icon: Home, tab: true },
    ],
  },
  {
    id: "sales",
    items: [
      { href: "/sales/invoices", labelKey: "nav.invoices", icon: FileText, tab: true, requiredPermission: ["sales.*", "sales.invoice.view"] },
      { href: "/sales/customers", labelKey: "nav.customers", icon: Users, requiredPermission: ["sales.*", "customers.*"] },
    ],
  },
  {
    id: "procurement",
    items: [
      { href: "/purchases", labelKey: "nav.purchases", icon: Truck, requiredPermission: ["purchases.*", "purchases.bill.view"] },
      { href: "/inventory", labelKey: "nav.inventory", icon: Package, tab: true, requiredPermission: "inventory.*" },
    ],
  },
  {
    id: "finance",
    items: [
      { href: "/accounting", labelKey: "nav.accounting", icon: BookOpen, requiredPermission: "accounting.*" },
      { href: "/reports", labelKey: "nav.reports", icon: BarChart3, tab: true, requiredPermission: "reports.*" },
    ],
  },
  {
    id: "system",
    items: [
      { href: "/users", labelKey: "nav.users", icon: Users, requiredPermission: "users.manage" },
      { href: "/settings", labelKey: "nav.settings", icon: Settings, requiredPermission: "tenants.settings" },
    ],
  },
];

// The primary action for each section (quick-action FAB on mobile;
// each page renders its own CTA button in its header on desktop)
export const quickActions = [
  { match: "/dashboard", href: "/sales/new", labelKey: "nav.newInvoice" },
  { match: "/sales", href: "/sales/new", labelKey: "nav.newInvoice" },
  { match: "/purchases", href: "/purchases/new", labelKey: "nav.newBill" },
  { match: "/inventory", href: "/inventory/new", labelKey: "nav.newProduct" },
];

export const isActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(href + "/");
