import type {
  SystemUserRole,
} from '~/types/userAccess'

export type PermissionLevel =
  | 'Full Access'
  | 'Manage'
  | 'Approve'
  | 'View'
  | 'Self Only'
  | 'No Access'

export type RoleType =
  | 'System'
  | 'Custom'

export type RoleStatus =
  | 'Active'
  | 'Inactive'

export interface RoleDefinition {
  id: number

  name: SystemUserRole

  description: string

  type: RoleType

  userCount: number

  status: RoleStatus
}

export interface PermissionMatrixRow {
  id: number

  module: string

  permissions: Record<
    SystemUserRole,
    PermissionLevel
  >
}

export interface RoleActivity {
  id: number

  action: string
  description: string

  performedBy: string

  date: string
}