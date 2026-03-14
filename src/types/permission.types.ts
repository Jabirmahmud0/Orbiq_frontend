export interface Permission {
  id: string;
  atom: string;
  label: string;
  description?: string;
  module: string;
}

export interface UserPermission {
  id: string;
  permission_id: string;
  granted_by: string;
  granted_at: string;
  is_revoked: boolean;
  permission: Permission;
}

export interface EffectivePermissions {
  role: Permission[];
  user: UserPermission[];
  effective: { atom: string }[];
}
