<script setup lang="ts">
import { BriefcaseBusiness, Building2, UserRound, Clock3, BadgeCheck } from 'lucide-vue-next'
import { useDepartmentApi, type DepartmentApiRecord } from '~/composables/admin/departments/useDepartmentApi'
import { usePositionApi, type PositionApiRecord } from '~/composables/admin/departments/positions/usePositionApi'

const { form } = useEmployeeForm()
const { $api } = useNuxtApp()
const { error: showError } = useToast()
const departmentApi = useDepartmentApi()
const positionApi = usePositionApi()

interface EmploymentTypeRecord { id: number; name: string }
interface ApiResponse<T> { success: boolean; message: string; data: T }

const employmentTypes = ref<EmploymentTypeRecord[]>([])
const departments = ref<DepartmentApiRecord[]>([])
const positions = ref<PositionApiRecord[]>([])

const loadingEmploymentTypes = ref(false)
const loadingOrganization = ref(false)
const organizationError = ref('')

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

// Show active schedules, plus the employee's assigned template during Edit
// even if that template has since been deactivated.
const workScheduleOptions = computed(() =>
  schedules.value.filter(schedule =>
    schedule.status === 'Active'
    || schedule.id === Number(form.value.workScheduleId),
  ),
)

// The employee stores the template ID; its working/rest days and shift times
// are managed only in the Work Schedules module.
const loadAvailableWorkSchedules = async () => {
  try {
    await loadSchedules()

    const selected = schedules.value.find(
      schedule => schedule.id === Number(form.value.workScheduleId),
    )

    if (selected) {
      // Retain an existing employee's assignment during Edit.
      form.value.workSchedule = selected.name
    } else if (!form.value.workScheduleId) {
      // Create: leave unselected because employment.work_schedule_id is nullable.
      form.value.workSchedule = ''
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
  const id = value ? Number(value) : null
  const selected = schedules.value.find(schedule => schedule.id === id)

  form.value.workScheduleId = selected?.id ?? null
  form.value.workSchedule = selected?.name ?? ''
}

// Keep the name synced when an existing employee's data arrives asynchronously.
watch([() => form.value.workScheduleId, schedules], ([id]) => {
  const selected = schedules.value.find(schedule => schedule.id === Number(id))
  if (selected) form.value.workSchedule = selected.name
}, { immediate: true })

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

        <!-- WORK SCHEDULE: Template assignment only. No per-employee shift editing. -->
        <div class="section-divider" />

        <div class="section-title">
          <div class="section-title-icon orange"><Clock3 :size="16" /></div>
          <div>
            <strong>Work Schedule</strong>
            <span>Assign a preconfigured work schedule to this employee.</span>
          </div>
        </div>

        <div class="form-field">
          <label class="field-label" for="employee-work-schedule">Work Schedule Template</label>
          <select
            id="employee-work-schedule"
            class="lookup-select"
            :value="form.workScheduleId ?? ''"
            :disabled="loadingWorkSchedules"
            @change="selectWorkSchedule"
          >
            <option value="">{{ loadingWorkSchedules ? 'Loading work schedules...' : 'No work schedule (optional)' }}</option>
            <option v-for="sch in workScheduleOptions" :key="sch.id" :value="sch.id">
              {{ sch.name }} ({{ sch.code }})
            </option>
          </select>
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
@media(max-width:900px){.employment-layout{grid-template-columns:1fr}.summary-column{width:100%;max-width:450px;margin:0 auto;padding-right:0;padding-bottom:20px;border-right:0;border-bottom:1px solid var(--border-soft)}}
@media(max-width:600px){.two-column{grid-template-columns:1fr}}
</style>
