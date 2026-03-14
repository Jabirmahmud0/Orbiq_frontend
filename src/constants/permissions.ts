import {
  Home,
  Users,
  Target,
  CheckSquare,
  BarChart,
  Clipboard,
  UserCircle,
  Settings,
} from "lucide-react";

export const ROUTE_PERMISSIONS = [
  { pattern: /^\/dashboard(\/.*)?$/, atom: "view:dashboard" },
  { pattern: /^\/users(\/.*)?$/, atom: "view:users" },
  { pattern: /^\/leads(\/.*)?$/, atom: "view:leads" },
  { pattern: /^\/tasks(\/.*)?$/, atom: "view:tasks" },
  { pattern: /^\/reports(\/.*)?$/, atom: "view:reports" },
  { pattern: /^\/audit-log(\/.*)?$/, atom: "view:audit-log" },
  { pattern: /^\/customer-portal(\/.*)?$/, atom: "view:customer-portal" },
  { pattern: /^\/settings(\/.*)?$/, atom: "manage:settings" },
];

export const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    atom: "view:dashboard",
    icon: Home,
  },
  { label: "Users", href: "/users", atom: "view:users", icon: Users },
  { label: "Leads", href: "/leads", atom: "view:leads", icon: Target },
  {
    label: "Tasks",
    href: "/tasks",
    atom: "view:tasks",
    icon: CheckSquare,
  },
  {
    label: "Reports",
    href: "/reports",
    atom: "view:reports",
    icon: BarChart,
  },
  {
    label: "Audit Log",
    href: "/audit-log",
    atom: "view:audit-log",
    icon: Clipboard,
  },
  {
    label: "Customer Portal",
    href: "/customer-portal",
    atom: "view:customer-portal",
    icon: UserCircle,
  },
  {
    label: "Settings",
    href: "/settings",
    atom: "manage:settings",
    icon: Settings,
  },
];

export const PERMISSIONS_BY_MODULE = {
  Dashboard: ["view:dashboard"],
  Users: ["view:users", "manage:users"],
  Leads: ["view:leads", "manage:leads"],
  Tasks: ["view:tasks", "manage:tasks"],
  Reports: ["view:reports", "export:reports"],
  Audit: ["view:audit-log"],
  Customer: ["view:customer-portal"],
  Settings: ["manage:settings"],
  Permissions: ["manage:permissions"],
};
