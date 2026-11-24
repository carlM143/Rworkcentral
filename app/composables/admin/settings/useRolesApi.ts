/**
 * Settings › Users & Access › Roles & Permissions.
 *   GET    /admin/roles
 *   GET    /admin/roles/catalog
 *   POST   /admin/roles
 *   GET    /admin/roles/{id}
 *   PUT    /admin/roles/{id}
 *   PUT    /admin/roles/{id}/privileges
 *   DELETE /admin/roles/{id}
 */

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export'

export interface RoleSummary {
  id: number
  name: string
  locked: boolean
  users_count: number
  privileges_count: number
  portal: string
}

export interface RoleDetail extends RoleSummary {
  privilege_ids: number[]
  users: { id: number, name: string, email: string, emp_id: string | number | null }[]
}

export interface CatalogFeature {
  key: string
  label: string
  notes: string | null
  actions: Partial<Record<PermissionAction, number | null>>
}

export interface CatalogModule {
  key: string
  label: string
  icon: string | null
  /** Portal that shows this module (null = Portal Access itself). */
  portal?: 'admin' | 'employee' | null
  features: CatalogFeature[]
}

export interface PrivilegeCatalog {
  actions: PermissionAction[]
  modules: CatalogModule[]
  missing: number
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const rolesApiError = (error: unknown, fallback: string) => {
  const e = error as { data?: { message?: string, errors?: Record<string, string[]> } }
  const errors = e?.data?.errors ?? {}
  return Object.values(errors)[0]?.[0] ?? e?.data?.message ?? fallback
}

export const useRolesApi = () => {
  const { $api } = useNuxtApp()

  return {
    list: () => $api<ApiResponse<RoleSummary[]>>('/admin/roles', { method: 'GET' }),
    catalog: () => $api<ApiResponse<PrivilegeCatalog>>('/admin/roles/catalog', { method: 'GET' }),
    show: (id: number) => $api<ApiResponse<RoleDetail>>(`/admin/roles/${id}`, { method: 'GET' }),
    create: (payload: { name: string, copy_from_role_id?: number | null }) =>
      $api<ApiResponse<RoleDetail>>('/admin/roles', { method: 'POST', body: payload }),
    rename: (id: number, name: string) =>
      $api<ApiResponse<RoleDetail>>(`/admin/roles/${id}`, { method: 'PUT', body: { name } }),
    savePrivileges: (id: number, privilegeIds: number[]) =>
      $api<ApiResponse<RoleDetail>>(`/admin/roles/${id}/privileges`, { method: 'PUT', body: { privilege_ids: privilegeIds } }),
    remove: (id: number) => $api<ApiResponse<null>>(`/admin/roles/${id}`, { method: 'DELETE' }),
  }
}
