import { useWorkScheduleApi } from '~/composables/admin/employeeSchedule/useWorkScheduleApi'

import type {
  WorkSchedule,
  WorkScheduleFormData,
} from '~/types/workSchedule'

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
  const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/)

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
): WorkSchedule => ({
  id: item.id,
  code: item.schedule_code,
  name: item.schedule_name,
  typeId: item.schedule_type_id,
  type: item.schedule_type?.type_name
    ?? types.find(x => x.id === item.schedule_type_id)?.type_name
    ?? 'Unknown',
  timeIn: as12Hour(item.time_in),
  timeOut: as12Hour(item.time_out),
  breakStart: as12Hour(item.break_start) || undefined,
  breakEnd: as12Hour(item.break_end) || undefined,
  workHours: Number(item.required_work_hours),
  gracePeriod: Number(item.grace_period),
  employeeCount: Number(item.employments_count ?? 0),
  status: item.status === true || item.status === 1 ? 'Active' : 'Inactive',
})

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

    const timeIn = as24Hour(form.timeIn)
    const timeOut = as24Hour(form.timeOut)

    if (!timeIn || !timeOut || timeIn === timeOut) {
      throw new Error('Provide valid and different time-in and time-out values.')
    }

    const breakStart = as24Hour(form.breakStart) || null
    const breakEnd = as24Hour(form.breakEnd) || null

    if ((breakStart && !breakEnd) || (!breakStart && breakEnd)) {
      throw new Error('Enter both break start and break end, or leave both blank.')
    }

    return {
      schedule_type_id: selectedType.id,
      schedule_code: form.code.trim(),
      schedule_name: form.name.trim(),
      time_in: timeIn,
      time_out: timeOut,
      break_start: breakStart,
      break_end: breakEnd,
      required_work_hours: Number(form.workHours),
      grace_period: Number(form.gracePeriod),
      status: form.status === 'Active',
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
    return updateSchedule(schedule.id, {
      code: schedule.code,
      name: schedule.name,
      type: schedule.type,
      timeIn: as24Hour(schedule.timeIn),
      timeOut: as24Hour(schedule.timeOut),
      breakStart: as24Hour(schedule.breakStart),
      breakEnd: as24Hour(schedule.breakEnd),
      workHours: schedule.workHours,
      gracePeriod: schedule.gracePeriod,
      status: schedule.status === 'Active' ? 'Inactive' : 'Active',
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
