import { create } from "zustand";
import { Permission } from "@/types/permission.types";

interface PermissionState {
  allPermissions: Permission[];
  setPermissions: (permissions: Permission[]) => void;
}

export const permissionStore = create<PermissionState>((set) => ({
  allPermissions: [],
  setPermissions: (permissions) => {
    set({ allPermissions: permissions });
  },
}));
