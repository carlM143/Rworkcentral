// types/holiday-management/holiday-coverage/holidayCoverage.ts
// Matches HolidayCoverageController (index / show / update).

/**
 * How a holiday decides who is paid:
 *  - all  : every employee in the holiday's locations
 *  - only : only the selected employees (inside the holiday's locations)
 */
export type CoverageMode = 'all' | 'only'

/** One option of the "Select Holiday" dropdown — GET /admin/holiday-coverage?year= */
export interface CoverageHolidayOption {
  id: number
  holiday_name: string
  date: string
}

/** The selected holiday — GET /admin/holidays/{id}/coverage */
export interface CoverageHoliday {
  id: number
  holiday_name: string
  date: string | null
  type: string | null
  coverage_mode: CoverageMode
  /** Location names. Empty = the holiday applies to all locations. */
  locations: string[]
  /** True when the holiday is still stored with the old "everyone except" setting. */
  legacy_except?: boolean
}

export interface CoverageEmployee {
  id: number
  emp_id: number | string
  name: string
  department_id: number | null
employment_type: string | null
  department: string | null
  location_id: number | null
  location: string | null
  status: boolean
  /** Inside the holiday's locations. Employees outside are never paid. */
  in_location: boolean
  /** Paid under the saved coverage. */
  selected: boolean
}

export interface LoadedCoverage {
  holiday: CoverageHoliday
  employees: CoverageEmployee[]
}

export interface HolidayListResponse {
  success: boolean
  data: CoverageHolidayOption[]

  locations: {
    id: number
    location_name: string
  }[]

  selected_location_id: number | null
}

export interface HolidayCoverageResponse {
  success?: boolean
  message?: string
  data: LoadedCoverage
}

/** PUT /admin/holidays/{id}/coverage */
export interface SaveCoveragePayload {
  employee_coverage: CoverageMode
  employee_ids: number[]
}