<script setup lang="ts">
import { BriefcaseBusiness, Building2, UserRound, CalendarDays, Clock3, BadgeCheck } from 'lucide-vue-next'
import { useDepartmentApi, type DepartmentApiRecord } from '~/composables/admin/departments/useDepartmentApi'
import { usePositionApi, type PositionApiRecord } from '~/composables/admin/departments/positions/usePositionApi'

const { form } = useEmployeeForm()
const { $api } = useNuxtApp()
const { error: showError } = useToast()
const departmentApi = useDepartmentApi()
const positionApi = usePositionApi()

interface RestDayRecord { id: number; rest_day: string }
interface EmploymentTypeRecord { id: number; name: string }
interface ApiResponse<T> { success: boolean; message: string; data: T }

const restDays = ref<RestDayRecord[]>([])
const employmentTypes = ref<EmploymentTypeRecord[]>([])
const departments = ref<DepartmentApiRecord[]>([])
const positions = ref<PositionApiRecord[]>([])

const loadingRestDays = ref(false)
const loadingEmploymentTypes = ref(false)
const loadingOrganization = ref(false)
const organizationError = ref('')

interface DaySchedule {
  day: string
  label: string
  enabled: boolean
  timeIn: string
  timeOut: string
}

const weekDays = reactive<DaySchedule[]>([
  { day: 'monday', label: 'Monday', enabled: true, timeIn: '08:00 AM', timeOut: '05:00 PM' },
  { day: 'tuesday', label: 'Tuesday', enabled: true, timeIn: '08:00 AM', timeOut: '05:00 PM' },
  { day: 'wednesday', label: 'Wednesday', enabled: true, timeIn: '08:00 AM', timeOut: '05:00 PM' },
  { day: 'thursday', label: 'Thursday', enabled: true, timeIn: '08:00 AM', timeOut: '05:00 PM' },
  { day: 'friday', label: 'Friday', enabled: true, timeIn: '08:00 AM', timeOut: '05:00 PM' },
  { day: 'saturday', label: 'Saturday', enabled: false, timeIn: '08:00 AM', timeOut: '12:00 PM' },
  { day: 'sunday', label: 'Sunday', enabled: false, timeIn: '08:00 AM', timeOut: '12:00 PM' },
])

const applyMonToWeekdays = () => {
  const mon = weekDays.find(d => d.day === 'monday')
  if (!mon) return
  weekDays.forEach(d => {
    if (['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(d.day)) {
      d.timeIn = mon.timeIn
      d.timeOut = mon.timeOut
      d.enabled = true
    }
  })
}

const isActive = (status: boolean | number | string) =>
  status === true || status === 1 || status === '1' || status === 'true' || status === 'Active'

const employmentTypeOptions = computed(() => employmentTypes.value.map(type => type.name))

const departmentOptions = computed(() =>
  departments.value
    .filter(item => isActive(item.status))
    .sort((a, b) => a.department_name.localeCompare(b.department_name))
)

const positionOptions = computed(() =>
  positions.value
    .filter(item => item.department_id === form.value.departmentId && isActive(item.status))
    .sort((a, b) => a.position.localeCompare(b.position))
)

const {
  schedules,
  loading: loadingWorkSchedules,
  loadSchedules,
} = useWorkSchedules()

const workScheduleOptions = computed(() =>
  schedules.value.filter(schedule => schedule.status === 'Active')
)

const loadAvailableWorkSchedules = async () => {
  try {
    await loadSchedules()

    if (!form.value.workScheduleId && workScheduleOptions.value.length > 0) {
      const defaultSch = workScheduleOptions.value[0]
      form.value.workScheduleId = defaultSch.id
      form.value.workSchedule = defaultSch.name
      if (defaultSch.timeIn && defaultSch.timeOut) {
        weekDays.forEach(d => {
          if (['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(d.day)) {
            d.timeIn = defaultSch.timeIn
            d.timeOut = defaultSch.timeOut
            d.enabled = true
          }
        })
      }
    } else if (form.value.workScheduleId) {
      const selected = schedules.value.find(s => s.id === form.value.workScheduleId)
      if (selected) {
        form.value.workSchedule = selected.name
        if (selected.timeIn && selected.timeOut) {
          weekDays.forEach(d => {
            if (['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(d.day)) {
              d.timeIn = selected.timeIn
              d.timeOut = selected.timeOut
              d.enabled = true
            }
          })
        }
      }
    }
  } catch {
    showError(
      'Work Schedules Unavailable',
      'Could not load work schedules from the database.',
    )
  }
}

const selectWorkSchedule = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value
  const schId = value ? Number(value) : null
  form.value.workScheduleId = schId
  const selected = schedules.value.find(s => s.id === schId)
  form.value.workSchedule = selected?.name ?? ''

  if (selected && selected.timeIn && selected.timeOut) {
    weekDays.forEach(d => {
      if (['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(d.day)) {
        d.timeIn = selected.timeIn
        d.timeOut = selected.timeOut
        d.enabled = true
      }
    })
  }
}

const employeeSummary = computed(() => {
  const name = [form.value.firstName, form.value.middleName, form.value.lastName].filter(Boolean).join(' ')
  return name || 'New Employee'
})

// EMPLOYMENT TYPES
const loadEmploymentTypes = async () => {
  loadingEmploymentTypes.value = true
  try {
    const response = await $api<ApiResponse<EmploymentTypeRecord[]>>('/admin/employment-types')
    employmentTypes.value = response.data

    const selected = response.data.find(type => type.name === form.value.employmentType)
    form.value.employmentTypeId = selected?.id ?? null
  } catch {
    employmentTypes.value = []
    showError('Employment Types Unavailable', 'Could not load employment types from the database.')
  } finally {
    loadingEmploymentTypes.value = false
  }
}

// REST DAYS
const loadRestDays = async () => {
  loadingRestDays.value = true
  try {
    const response = await $api<ApiResponse<RestDayRecord[]>>('/admin/rest-days')
    restDays.value = response.data

    if (form.value.restDay && form.value.restDayId === null) {
      const selected = response.data.find(day => day.rest_day === form.value.restDay)
      form.value.restDayId = selected?.id ?? null
    }
  } catch {
    restDays.value = []
    showError('Rest Days Unavailable', 'Could not load rest days from the database.')
  } finally {
    loadingRestDays.value = false
  }
}

const selectRestDay = (day: RestDayRecord) => {
  form.value.restDayId = day.id
  form.value.restDay = day.rest_day
}

watch(() => form.value.employmentType, name => {
  const selected = employmentTypes.value.find(type => type.name === name)
  form.value.employmentTypeId = selected?.id ?? null
})

// DEPARTMENTS AND POSITIONS
const loadOrganization = async () => {
  loadingOrganization.value = true
  organizationError.value = ''

  try {
    const [departmentResult, positionResult] = await Promise.allSettled([
      departmentApi.getDepartments(),
      positionApi.getPositions(),
    ])

    const errors: string[] = []

    if (departmentResult.status === 'fulfilled') {
      departments.value = departmentResult.value.data

      const selectedDepartment = departmentOptions.value.find(
        item => item.id === form.value.departmentId
      )

      if (selectedDepartment) {
        form.value.department = selectedDepartment.department_name
      } else {
        form.value.departmentId = null
        form.value.department = ''
        form.value.positionId = null
        form.value.position = ''
      }
    } else {
      departments.value = []
      errors.push('departments')
    }

    if (positionResult.status === 'fulfilled') {
      positions.value = positionResult.value.data

      const selectedPosition = positionOptions.value.find(
        item => item.id === form.value.positionId
      )

      if (selectedPosition) {
        form.value.position = selectedPosition.position
      } else {
        form.value.positionId = null
        form.value.position = ''
      }
    } else {
      positions.value = []
      errors.push('positions')
    }

    if (errors.length) {
      organizationError.value = `Unable to load ${errors.join(' and ')} from Laravel.`
      showError('Organization Data Unavailable', organizationError.value)
    }
  } catch {
    organizationError.value = 'Unable to load organization information.'
    showError('Organization Data Unavailable', organizationError.value)
  } finally {
    loadingOrganization.value = false
  }
}

const selectDepartment = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value
  const selected = departmentOptions.value.find(item => item.id === Number(value))

  form.value.departmentId = selected?.id ?? null
  form.value.department = selected?.department_name ?? ''

  form.value.positionId = null
  form.value.position = ''
}

const selectPosition = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value
  const selected = positionOptions.value.find(item => item.id === Number(value))

  form.value.positionId = selected?.id ?? null
  form.value.position = selected?.position ?? ''
}

onMounted(() => {
  void loadEmploymentTypes()
  void loadRestDays()
  void loadOrganization()
  void loadAvailableWorkSchedules()
})
</script>

<template>
  <FormSection
    title="Employment Information"
    description="Set the employee's official work assignment, position and employment details."
    :icon="BriefcaseBusiness"
  >
    <div class="employment-layout">
      <!-- EMPLOYEE SUMMARY -->
      <aside class="summary-column">
        <div class="employee-summary">
          <div class="summary-avatar"><UserRound :size="28" /></div>
          <strong>{{ employeeSummary }}</strong>
        </div>

        <div class="summary-box">
          <div class="summary-item">
            <div class="summary-icon"><Building2 :size="15" /></div>
            <div>
              <span>Department</span>
              <strong>{{ form.department || 'Not selected' }}</strong>
            </div>
          </div>

          <div class="summary-item">
            <div class="summary-icon"><BriefcaseBusiness :size="15" /></div>
            <div>
              <span>Position</span>
              <strong>{{ form.position || 'Not selected' }}</strong>
            </div>
          </div>

          <div class="summary-item">
            <div class="summary-icon"><BadgeCheck :size="15" /></div>
            <div>
              <span>Employment Type</span>
              <strong>{{ form.employmentType || 'Not selected' }}</strong>
            </div>
          </div>
        </div>

        <div class="summary-note">
          Employment details will be used by Timekeeping, Leave, Payroll and Approval workflows.
        </div>
      </aside>

      <!-- FORM -->
      <div class="employment-form">
        <div class="section-title">
          <div class="section-title-icon"><BriefcaseBusiness :size="16" /></div>
          <div>
            <strong>Basic Employment Details</strong>
            <span>Hiring date and employment classification.</span>
          </div>
        </div>

        <div class="form-grid two-column">
          <AppDateInput v-model="form.dateHired" label="Date Hired" required />

          <div class="form-field">
            <label class="field-label">Employment Type <span>*</span></label>
            <AppSelect v-model="form.employmentType" :options="employmentTypeOptions" placeholder="Select employment type" />
            <small v-if="loadingEmploymentTypes" class="field-hint">Loading employment types...</small>
          </div>
        </div>

        <!-- ORGANIZATION ASSIGNMENT -->
        <div class="section-divider" />

        <div class="section-title">
          <div class="section-title-icon green"><Building2 :size="16" /></div>
          <div>
            <strong>Organization Assignment</strong>
            <span>Assign the employee to an active department and its corresponding position.</span>
          </div>
        </div>

        <div class="form-grid two-column">
          <!-- DEPARTMENT: LARAVEL -->
          <div class="form-field">
            <label class="field-label" for="employee-department">Department <span>*</span></label>
            <select
              id="employee-department"
              class="lookup-select"
              :value="form.departmentId ?? ''"
              :disabled="loadingOrganization || departmentOptions.length === 0"
              required
              @change="selectDepartment"
            >
              <option value="">{{ loadingOrganization ? 'Loading departments...' : 'Select department' }}</option>
              <option v-for="item in departmentOptions" :key="item.id" :value="item.id">
                {{ item.department_name }}
              </option>
            </select>
            <small v-if="!loadingOrganization && !departmentOptions.length && !organizationError" class="field-hint">
              No active departments available.
            </small>
          </div>

          <!-- POSITION: FILTERED BY DEPARTMENT -->
          <div class="form-field">
            <label class="field-label" for="employee-position">Position / Designation <span>*</span></label>
            <select
              id="employee-position"
              class="lookup-select"
              :value="form.positionId ?? ''"
              :disabled="loadingOrganization || !form.departmentId || !positionOptions.length"
              required
              @change="selectPosition"
            >
              <option value="">
                {{ !form.departmentId ? 'Select department first' : loadingOrganization ? 'Loading positions...' : 'Select position' }}
              </option>
              <option v-for="item in positionOptions" :key="item.id" :value="item.id">
                {{ item.position }}
              </option>
            </select>
            <small v-if="form.departmentId && !loadingOrganization && !positionOptions.length && !organizationError" class="field-hint">
              No active positions available for this department.
            </small>
          </div>
        </div>

        <div v-if="organizationError" class="organization-error" role="alert">
          <span>{{ organizationError }}</span>
          <button type="button" :disabled="loadingOrganization" @click="loadOrganization">Retry</button>
        </div>

        <!-- WORK SCHEDULE -->
        <div class="section-divider" />

        <div class="section-title">
          <div class="section-title-icon orange"><Clock3 :size="16" /></div>
          <div class="heading-with-action">
            <div>
              <strong>Work Schedule &amp; Day-by-Day Shift Timings</strong>
              <span>Select work schedule template or customize shift timings for each workday.</span>
            </div>
            <button
              type="button"
              class="btn-text-action"
              @click="applyMonToWeekdays"
            >
              Apply Monday to Weekdays
            </button>
          </div>
        </div>

        <div class="form-field" style="margin-bottom: 14px;">
          <label class="field-label" for="employee-work-schedule">Work Schedule Template <span>*</span></label>
          <select
            id="employee-work-schedule"
            class="lookup-select"
            :value="form.workScheduleId ?? ''"
            :disabled="loadingWorkSchedules"
            @change="selectWorkSchedule"
          >
            <option value="">{{ loadingWorkSchedules ? 'Loading work schedules...' : 'Select work schedule template' }}</option>
            <option v-for="sch in workScheduleOptions" :key="sch.id" :value="sch.id">
              {{ sch.name }} ({{ sch.code }} - {{ sch.timeIn }} to {{ sch.timeOut }})
            </option>
          </select>
          <small class="field-hint">Selecting a template auto-fills shift times below. You can overwrite any day's timing freely.</small>
        </div>

        <!-- DAY BY DAY SHIFT TIMINGS -->
        <div class="days-schedule-container">
          <div
            v-for="d in weekDays"
            :key="d.day"
            class="day-schedule-row"
            :class="{ 'day-disabled': !d.enabled }"
          >
            <label class="day-checkbox-label">
              <input
                v-model="d.enabled"
                type="checkbox"
              >
              <span class="day-name">{{ d.label }}</span>
            </label>

            <div class="day-times" v-if="d.enabled">
              <div class="mini-field">
                <span class="mini-label">In:</span>
                <input
                  v-model="d.timeIn"
                  type="text"
                  class="native-input mini"
                  placeholder="08:00 AM"
                >
              </div>
              <span class="time-dash">-</span>
              <div class="mini-field">
                <span class="mini-label">Out:</span>
                <input
                  v-model="d.timeOut"
                  type="text"
                  class="native-input mini"
                  placeholder="05:00 PM"
                >
              </div>
            </div>
            <div class="day-rest-badge" v-else>
              Rest Day / Off
            </div>
          </div>
        </div>

        <div class="integration-note">
          <CalendarDays :size="18" />
          <div>
            <strong>HRIS Integration</strong>
            <span>Department, position, and work schedule assignments are retrieved from Laravel and will be saved using their database IDs.</span>
          </div>
        </div>
      </div>
    </div>
  </FormSection>
</template>

<style scoped>
.employment-layout{display:grid;grid-template-columns:230px minmax(0,1fr);gap:24px}
.summary-column{padding-right:22px;border-right:1px solid var(--border-soft)}
.employee-summary{display:flex;flex-direction:column;align-items:center;padding-bottom:18px;text-align:center}
.summary-avatar{display:flex;width:72px;height:72px;align-items:center;justify-content:center;margin-bottom:10px;border-radius:50%;background:var(--primary-soft);color:var(--primary)}
.employee-summary strong{max-width:190px;overflow:hidden;color:var(--text-primary);font-size:12px;font-weight:700;white-space:nowrap;text-overflow:ellipsis}
.summary-box{overflow:hidden;border:1px solid var(--border);border-radius:10px;background:var(--bg-card-soft)}
.summary-item{display:flex;align-items:center;gap:9px;padding:11px;border-bottom:1px solid var(--border-soft)}
.summary-item:last-child{border-bottom:0}
.summary-icon{display:flex;width:30px;height:30px;flex-shrink:0;align-items:center;justify-content:center;border-radius:8px;background:var(--primary-soft);color:var(--primary)}
.summary-item span,.summary-item strong{display:block}
.summary-item span{color:var(--text-muted);font-size:8px}
.summary-item strong{margin-top:2px;color:var(--text-primary);font-size:9px;font-weight:600}
.summary-note{margin-top:13px;padding:10px;border-radius:8px;background:var(--primary-soft);color:var(--text-secondary);font-size:8px;line-height:1.55}
.employment-form{min-width:0}
.section-title{display:flex;align-items:center;gap:9px;margin-bottom:14px}
.heading-with-action{display:flex;flex:1;align-items:center;justify-content:space-between;gap:12px}
.btn-text-action{padding:4px 10px;border:1px solid var(--border);border-radius:6px;background:var(--bg-card);color:var(--primary);font-size:9px;font-weight:600;cursor:pointer;white-space:nowrap}
.btn-text-action:hover{background:var(--primary-soft);border-color:var(--primary)}
.section-title-icon{display:flex;width:31px;height:31px;flex-shrink:0;align-items:center;justify-content:center;border-radius:8px;background:var(--primary-soft);color:var(--primary)}
.section-title-icon.green{background:var(--green-soft);color:var(--green)}
.section-title-icon.orange{background:var(--orange-soft);color:var(--orange)}
.section-title strong,.section-title span{display:block}
.section-title strong{color:var(--text-primary);font-size:11px;font-weight:650}
.section-title span{margin-top:2px;color:var(--text-muted);font-size:8px}
.form-grid{display:grid;gap:14px}
.two-column{grid-template-columns:repeat(2,minmax(0,1fr))}
.form-field{min-width:0}
.field-label{display:block;margin-bottom:7px;color:var(--text-secondary);font-size:10px;font-weight:600}
.field-label span{color:var(--red)}
.field-hint{display:block;margin-top:5px;color:var(--text-muted);font-size:8px}
.lookup-select{width:100%;height:40px;padding:0 34px 0 12px;border:1px solid var(--border);border-radius:8px;outline:0;background:var(--bg-card);color:var(--text-primary);font-size:12px;font-family:inherit;cursor:pointer;transition:border-color .18s ease,box-shadow .18s ease}
.lookup-select:focus{border-color:var(--primary);box-shadow:0 0 0 3px rgba(36,107,253,.08)}
.lookup-select:disabled{opacity:.6;cursor:not-allowed}
.lookup-select option{background:var(--bg-card);color:var(--text-primary)}
.organization-error{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:12px;padding:10px;border:1px solid var(--red);border-radius:8px;color:var(--red);font-size:10px}
.organization-error button{padding:6px 11px;border:1px solid var(--border);border-radius:6px;background:var(--bg-card);color:var(--text-primary);cursor:pointer}
.section-divider{height:1px;margin:24px 0 18px;background:var(--border-soft)}
.integration-note{display:flex;align-items:flex-start;gap:10px;margin-top:22px;padding:12px;border:1px solid color-mix(in srgb,var(--primary) 20%,var(--border));border-radius:9px;background:color-mix(in srgb,var(--primary-soft) 55%,var(--bg-card));color:var(--primary)}
.integration-note svg{flex-shrink:0}
.integration-note strong,.integration-note span{display:block}
.integration-note strong{color:var(--text-primary);font-size:9px}
.integration-note span{margin-top:3px;color:var(--text-secondary);font-size:8px;line-height:1.5}
.rest-day-options{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}
.rest-day-option{position:relative;display:flex;min-height:38px;align-items:center;gap:8px;padding:0 10px;border:1px solid var(--border);border-radius:8px;background:var(--bg-card);color:var(--text-secondary);font-size:9px;cursor:pointer;transition:border-color .15s ease,background .15s ease,color .15s ease}
.rest-day-option:hover{border-color:var(--primary)}
.rest-day-option.selected{border-color:var(--primary);background:var(--primary-soft);color:var(--primary)}
.rest-day-option input{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
.radio-control{position:relative;width:15px;height:15px;flex-shrink:0;border:1.5px solid var(--border);border-radius:50%;background:var(--bg-card)}
.rest-day-option.selected .radio-control{border-color:var(--primary)}
.rest-day-option.selected .radio-control::after{position:absolute;top:50%;left:50%;width:7px;height:7px;transform:translate(-50%,-50%);border-radius:50%;background:var(--primary);content:''}
.radio-label{font-weight:550}

/* DAY BY DAY SHIFT TIMINGS */
.days-schedule-container { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
.day-schedule-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border: 1px solid var(--border-soft); border-radius: 8px; background: var(--bg-card); transition: all 0.15s ease; }
.day-schedule-row.day-disabled { opacity: 0.55; background: var(--bg-card-soft); }
.day-checkbox-label { display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; }
.day-checkbox-label input[type="checkbox"] { width: 16px; height: 16px; accent-color: var(--primary); cursor: pointer; }
.day-name { color: var(--text-primary); font-size: 10px; font-weight: 600; min-width: 75px; }
.day-times { display: flex; align-items: center; gap: 8px; }
.mini-field { display: flex; align-items: center; gap: 5px; }
.mini-label { color: var(--text-muted); font-size: 9px; }
.native-input.mini { width: 110px; height: 32px; padding: 0 8px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-card); color: var(--text-primary); font-size: 10px; outline: none; }
.native-input.mini:focus { border-color: var(--primary); }
.time-dash { color: var(--text-muted); font-size: 10px; }
.day-rest-badge { padding: 3px 8px; border-radius: 4px; background: var(--bg-card-soft); color: var(--text-muted); font-size: 9px; font-weight: 500; }

@media(max-width:1100px){.rest-day-options{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:900px){.employment-layout{grid-template-columns:1fr}.summary-column{width:100%;max-width:450px;margin:0 auto;padding-right:0;padding-bottom:20px;border-right:0;border-bottom:1px solid var(--border-soft)}}
@media(max-width:600px){.two-column{grid-template-columns:1fr}.rest-day-options{grid-template-columns:1fr}}
</style>
