/**
 * System Settings.
 *
 * UI ONLY FOR NOW: values are kept in memory (useState) and reset on a full
 * page reload. Planned Laravel endpoints:
 *   GET /admin/settings/system
 *   PUT /admin/settings/system
 */

export interface SystemSettings {
  general: {
    system_name: string
    timezone: string
    date_format: 'MMM D, YYYY' | 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
    time_format: '12h' | '24h'
    week_starts_on: 'sunday' | 'monday'
    currency: 'PHP'
  }
  security: {
    session_timeout_minutes: number
    password_min_length: number
    require_uppercase: boolean
    require_number: boolean
    require_symbol: boolean
    password_expiry_days: number // 0 = never
    max_login_attempts: number
    lockout_minutes: number
    two_factor_for_admins: boolean
  }
  audit: {
    enabled: boolean
    log_logins: boolean
    log_data_changes: boolean
    log_exports: boolean
    retention_days: number
  }
  maintenance: {
    enabled: boolean
    message: string
  }
}

export const defaultSystemSettings = (): SystemSettings => ({
  general: {
    system_name: 'RWorkCentral HRIS',
    timezone: 'Asia/Manila',
    date_format: 'MMM D, YYYY',
    time_format: '12h',
    week_starts_on: 'monday',
    currency: 'PHP',
  },
  security: {
    session_timeout_minutes: 60,
    password_min_length: 8,
    require_uppercase: true,
    require_number: true,
    require_symbol: false,
    password_expiry_days: 0,
    max_login_attempts: 5,
    lockout_minutes: 15,
    two_factor_for_admins: false,
  },
  audit: {
    enabled: true,
    log_logins: true,
    log_data_changes: true,
    log_exports: true,
    retention_days: 365,
  },
  maintenance: {
    enabled: false,
    message: 'RWorkCentral is under scheduled maintenance. Please try again later.',
  },
})

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value))
const delay = () => new Promise(resolve => setTimeout(resolve, 250))

export const useSystemSettings = () => {
  const saved = useState<SystemSettings>('settings-system', defaultSystemSettings)

  // GET /admin/settings/system
  const load = async (): Promise<ApiResponse<SystemSettings>> => {
    await delay()
    return { success: true, message: 'System settings retrieved.', data: clone(saved.value) }
  }

  // PUT /admin/settings/system
  const save = async (payload: SystemSettings): Promise<ApiResponse<SystemSettings>> => {
    await delay()
    saved.value = clone(payload)
    return { success: true, message: 'System settings saved.', data: clone(saved.value) }
  }

  return { load, save }
}