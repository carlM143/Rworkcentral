import { useWorkScheduleApi } from '~/composables/admin/employeeSchedule/useWorkScheduleApi'

import type {
  WorkSchedule,
  WorkScheduleDayFormData,
  WorkScheduleFormData,
} from '~/types/workSchedule'
import { WORK_SCHEDULE_DAYS } from '~/types/workSchedule'

import type {
  WorkScheduleRecord,
  WorkSchedulePayload,
  ScheduleTypeRecord,
} from '~/composables/admin/employeeSchedule/useWorkScheduleApi'

const as12Hour = (value: string | null | undefined): string => {
  if (!value) return ''

  const match = value.match(/^(\d{1,2}):(\d{2})/)
  if (!match) return ''

  const hours = Number(match[1])
  const minutes = match[2]

  return `${String(hours % 12 || 12).padStart(2, '0')}:${minutes} ${hours >= 12 ? 'PM' : 'AM'}`
}

const as24Hour = (value: string | undefined): string => {
  const clean = (value || '').trim().toUpperCase()
  const match = clean.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/)

  if (!match) return ''

  let hours = Number(match[1])
  const minutes = Number(match[2])

  if (hours > 23 || minutes > 59) return ''

  if (match[3]) {
    if (hours < 1 || hours > 12) return ''
    hours = (hours % 12) + (match[3] === 'PM' ? 12 : 0)
  }

  return `${String(hours).padStart(2, '0')}:${match[2]}`
}

const toUiSchedule = (
  item: WorkScheduleRecord,
  types: ScheduleTypeRecord[],
): WorkSchedule => {
  const days = Array.isArray(item.days) ? item.days : []
  const firstWorkingDay = days.find(day => day.is_working_day)

  return {
    id: item.id,
    code: item.schedule_code,
    name: item.schedule_name,
    typeId: item.schedule_type_id,
    type: item.schedule_type?.type_name
      ?? types.find(x => x.id === item.schedule_type_id)?.type_name
      ?? 'Unknown',
    timeIn: as12Hour(firstWorkingDay?.time_in ?? item.time_in),
    timeOut: as12Hour(firstWorkingDay?.time_out ?? item.time_out),
    breakStart: as12Hour(item.break_start) || undefined,
    breakEnd: as12Hour(item.break_end) || undefined,
    workHours: Number(item.required_work_hours),
    gracePeriod: Number(item.grace_period),
    employeeCount: Number(item.employments_count ?? 0),
    status: item.status === true || item.status === 1 ? 'Active' : 'Inactive',
    days,
  }
}

export const useWorkSchedules = () => {
  const api = useWorkScheduleApi()

  const schedules = useState<WorkSchedule[]>('work-schedules', () => [])
  const scheduleTypes = useState<ScheduleTypeRecord[]>('work-schedule-types', () => [])

  const loading = ref(false)
  const saving = ref(false)
  const errorMessage = ref('')

  const search = ref('')
  const type = ref('')
  const status = ref('')

  const scheduleTypeNames = computed(() =>
    scheduleTypes.value.map(item => item.type_name),
  )

  const loadSchedules = async () => {
    loading.value = true
    errorMessage.value = ''

    try {
      const [typesResult, schedulesResult] = await Promise.all([
        api.getScheduleTypes(),
        api.getSchedules(),
      ])

      scheduleTypes.value = typesResult.data

      schedules.value = schedulesResult.data.map(
        item => toUiSchedule(item, scheduleTypes.value),
      )
    } catch (error) {
      errorMessage.value = 'Unable to load work schedules.'
      throw error
    } finally {
      loading.value = false
    }
  }

  const buildPayload = (form: WorkScheduleFormData): WorkSchedulePayload => {
    const selectedType = scheduleTypes.value.find(
      item => item.type_name === form.type,
    )

    if (!selectedType) {
      throw new Error('Select a valid schedule type from the database.')
    }

    if (!Array.isArray(form.days) || form.days.length !== WORK_SCHEDULE_DAYS.length) {
      throw new Error('Configure all seven days from Monday to Sunday.')
    }

    const dayMap = new Map(form.days.map(day => [day.day_of_week, day]))
    const days: WorkScheduleDayFormData[] = WORK_SCHEDULE_DAYS.map(dayName => {
      const day = dayMap.get(dayName)
      if (!day) throw new Error(`Missing schedule configuration for ${dayName}.`)

      if (!day.is_working_day) {
        return {
          day_of_week: dayName,
          is_working_day: false,
          time_in: null,
          time_out: null,
        }
      }

      const timeIn = as24Hour(day.time_in ?? undefined)
      const timeOut = as24Hour(day.time_out ?? undefined)
      if (!timeIn || !timeOut || timeIn === timeOut) {
        throw new Error(`${dayName} requires valid and different time-in and time-out values.`)
      }

      return {
        day_of_week: dayName,
        is_working_day: true,
        time_in: timeIn,
        time_out: timeOut,
      }
    })

    if (!days.some(day => day.is_working_day)) {
      throw new Error('Select at least one working day.')
    }

    return {
      schedule_type_id: selectedType.id,
      schedule_code: form.code.trim(),
      schedule_name: form.name.trim(),
      required_work_hours: Number(form.workHours),
      grace_period: Number(form.gracePeriod),
      status: form.status === 'Active',
      days,
    }
  }

  const createSchedule = async (form: WorkScheduleFormData) => {
    if (saving.value) return

    saving.value = true

    try {
      const result = await api.createSchedule(buildPayload(form))
      await loadSchedules()

      return result
    } finally {
      saving.value = false
    }
  }

  const updateSchedule = async (id: number, form: WorkScheduleFormData) => {
    if (saving.value) return

    saving.value = true

    try {
      const result = await api.updateSchedule(id, buildPayload(form))
      await loadSchedules()

      return result
    } finally {
      saving.value = false
    }
  }


  const toggleScheduleStatus = async (schedule: WorkSchedule) => {
    // Laravel stores only working days.
    // Missing days must be restored as rest days before updating.
    const savedDays = new Map(
      schedule.days.map(day => [day.day_of_week, day]),
    )

    const normalizedDays: WorkScheduleDayFormData[] =
      WORK_SCHEDULE_DAYS.map(dayName => {
        const saved = savedDays.get(dayName)
        const isWorking = Boolean(saved?.is_working_day)

        return {
          day_of_week: dayName,
          is_working_day: isWorking,
          time_in: isWorking ? saved?.time_in ?? null : null,
          time_out: isWorking ? saved?.time_out ?? null : null,
        }
      })

    return updateSchedule(schedule.id, {
      code: schedule.code,
      name: schedule.name,
      type: schedule.type,
      workHours: schedule.workHours,
      gracePeriod: schedule.gracePeriod,
      status: schedule.status === 'Active'
        ? 'Inactive'
        : 'Active',
      days: normalizedDays,
    })
  }


  const deleteSchedule = async (schedule: WorkSchedule) => {
    if (saving.value) return

    saving.value = true

    try {
      const result = await api.deleteSchedule(schedule.id)
      await loadSchedules()

      return result
    } finally {
      saving.value = false
    }
  }

  const filteredSchedules = computed(() => {
    const keyword = search.value.trim().toLowerCase()

    return schedules.value.filter(item =>
      (!keyword || item.name.toLowerCase().includes(keyword) || item.code.toLowerCase().includes(keyword)) &&
      (!type.value || item.type === type.value) &&
      (!status.value || item.status === status.value),
    )
  })

  const stats = computed(() => ({
    total: schedules.value.length,
    active: schedules.value.filter(x => x.status === 'Active').length,
  }))

  const resetFilters = () => {
    search.value = ''
    type.value = ''
    status.value = ''
  }

  return {
    schedules,
    scheduleTypes,
    scheduleTypeNames,
    loading,
    saving,
    errorMessage,
    search,
    type,
    status,
    filteredSchedules,
    stats,
    resetFilters,
    loadSchedules,
    createSchedule,
    updateSchedule,
    toggleScheduleStatus,
    deleteSchedule,
  }
}
