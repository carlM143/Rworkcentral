
// composables/admin/holiday-management/holiday-coverage/useHolidayCoverage.ts

import { ref } from 'vue'

import type {
  CoverageEmployee,
  CoverageHoliday,
  CoverageHolidayOption,
  HolidayCoverageResponse,
  HolidayListResponse,
  LoadedCoverage,
  SaveCoveragePayload,
} from '~/types/holiday-management/holiday-coverage/holidayCoverage'

export const useHolidayCoverage = () => {
  const { $api } = useNuxtApp()

  const holidays = ref<CoverageHolidayOption[]>([])
  const holiday = ref<CoverageHoliday | null>(null)
  const employees = ref<CoverageEmployee[]>([])

  // Work locations
  const locations = ref<{
    id: number
    location_name: string
  }[]>([])

  const loadingHolidays = ref(false)
  const loadingCoverage = ref(false)
  const saving = ref(false)

  let listVersion = 0
  let detailVersion = 0

  const getErrorMessage = (
    err: unknown,
    fallback = 'Something went wrong.',
  ): string => {
    const problem = err as {
      data?: {
        message?: string
        errors?: Record<string, string[]>
      }
    } | undefined

    const firstError = Object.values(
      problem?.data?.errors ?? {},
    ).flat()[0]

    return String(
      firstError || problem?.data?.message || fallback,
    )
  }

  const resetCoverage = () => {
    detailVersion++

    holiday.value = null
    employees.value = []
    loadingCoverage.value = false
  }

  // GET HOLIDAYS AND LOCATIONS
  const fetchHolidays = async (
    year: number,
    locationId = 'all',
    month = 'all'
    ) => {
    loadingHolidays.value = true

    try {
        const response = await $api<HolidayListResponse>(
        '/admin/holiday-coverage',
        {
            query: {
            year,
            location_id: locationId,
            },
        }
        )

        holidays.value = response.data ?? []
        locations.value = response.locations ?? []

        return holidays.value
    } finally {
        loadingHolidays.value = false
    }
    }

  // GET HOLIDAY COVERAGE
  const fetchCoverage = async (
    holidayId: number,
    year: number,
  ): Promise<LoadedCoverage | null> => {
    const current = ++detailVersion

    loadingCoverage.value = true

    try {
      const response = await $api<HolidayCoverageResponse>(
        `/admin/holidays/${holidayId}/coverage`,
        {
          query: { year },
        },
      )

      if (current !== detailVersion) return null

      holiday.value = response.data.holiday
      employees.value = response.data.employees ?? []

      return {
        holiday: holiday.value,
        employees: employees.value,
      }
    } catch (err) {
      if (current === detailVersion) {
        holiday.value = null
        employees.value = []
      }

      throw err
    } finally {
      if (current === detailVersion) {
        loadingCoverage.value = false
      }
    }
  }

  // SAVE HOLIDAY COVERAGE
  const saveCoverage = async (
    holidayId: number,
    year: number,
    payload: SaveCoveragePayload,
  ): Promise<HolidayCoverageResponse> => {
    saving.value = true

    try {
      return await $api<HolidayCoverageResponse>(
        `/admin/holidays/${holidayId}/coverage`,
        {
          method: 'PUT',
          query: { year },
          body: payload,
        },
      )
    } finally {
      saving.value = false
    }
  }

  return {
    holidays,
    holiday,
    employees,
    locations,

    loadingHolidays,
    loadingCoverage,
    saving,

    fetchHolidays,
    fetchCoverage,
    resetCoverage,
    saveCoverage,
    getErrorMessage,
  }
}
