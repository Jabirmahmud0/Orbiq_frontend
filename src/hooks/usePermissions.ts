import { useMemo } from "react";
import { authStore } from "@/store/authStore";

export const usePermissions = () => {
  const { user, permissions } = authStore();

  const hasPermission = (atom: string): boolean => {
    if (!permissions) return false;
    return permissions.includes(atom);
  };

  const hasAnyPermission = (atoms: string[]): boolean => {
    if (!permissions) return false;
    return atoms.some((atom) => permissions.includes(atom));
  };

  const hasAllPermissions = (atoms: string[]): boolean => {
    if (!permissions) return false;
    return atoms.every((atom) => permissions.includes(atom));
  };

  const canAccessRoute = (pathname: string): boolean => {
    if (!permissions) return false;

    // Import route permissions dynamically
    const { ROUTE_PERMISSIONS } = require("@/constants/permissions");

    const match = ROUTE_PERMISSIONS.find((r: any) =>
      new RegExp(r.pattern).test(pathname),
    );

    if (!match) return true; // Unprotected route

    return permissions.includes(match.atom);
  };

  return {
    permissions: permissions || [],
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessRoute,
  };
};
