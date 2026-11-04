<script setup lang="ts">
import {
  ArrowLeft,
  CalendarDays,
  Info,
  Send,
  UserRound,
  WalletCards,
  WandSparkles,
  X,
} from 'lucide-vue-next'
import EmployeeRequestImageUpload from '~/components/employee/EmployeeRequestImageUpload.vue'
import { useToast } from '~/composables/useToast'

definePageMeta({ layout: 'admin' })
useHead({ title: 'File Employee Leave | RWorkCentral' })

type PayType = 'paid' | 'unpaid'
type PayMode = PayType | 'mixed'

interface EmployeeOption {
  id: number
  emp_id: string | number
  firstname: string
  middlename?: string | null
  lastname: string
}

interface LeaveTypeOption {
  id: number
  leave_name: string
  leave_code?: string | null
}

interface WorkScheduleDay {
  day_of_week: string
  is_working_day?: boolean | number | string | null
}

interface EmploymentRecord {
  id: number
  date_hired?: string | null
  work_schedule?: {
    schedule_name?: string | null
    schedule_code?: string | null
    days?: WorkScheduleDay[] | null
  } | null
}

interface LeaveCredit {
  employee_id: number
  leave_type_id?: number | null
  leave_type?: string | null
  policy_paid?: boolean | number | string | null
  available: number | string
}

interface LeaveDateDetail {
  date: string
  dayType: 'whole_day' | 'half_day'
  payType: PayType
}

const router = useRouter()
const { $api } = useNuxtApp()
const { success } = useToast()

const localDateKey = () => {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const employees = ref<EmployeeOption[]>([])
const leaveTypes = ref<LeaveTypeOption[]>([])
const selectedEmployeeId = ref<number | ''>('')

    
const employeeQuery = ref('')
const employeeDropdownOpen = ref(false)
const employeeActiveIndex = ref(-1)
const employeePicker = ref<HTMLElement | null>(null)

const filteredEmployeeOptions = computed(() => {
  const query = employeeQuery.value.trim().toLowerCase()

  if (!query) return employees.value

  return employees.value.filter(employee => {
    const fullName = employeeName(employee)

    return `${fullName} ${employee.emp_id} EMP-${employee.emp_id}`
      .toLowerCase()
      .includes(query)
  })
})

const closeEmployeeDropdown = () => {
  employeeDropdownOpen.value = false
  employeeActiveIndex.value = -1

  const employee = selectedEmployee.value

  employeeQuery.value = employee
    ? `EMP-${employee.emp_id} — ${employeeName(employee)}`
    : ''
}

const openEmployeeDropdown = () => {
  employeeQuery.value = ''
  employeeDropdownOpen.value = true
  employeeActiveIndex.value = -1
}

const handleEmployeeSearch = () => {
  selectedEmployeeId.value = ''
  employeeDropdownOpen.value = true
  employeeActiveIndex.value = -1
}

const selectEmployee = (employee: EmployeeOption) => {
  selectedEmployeeId.value = employee.id
  employeeQuery.value =
    `EMP-${employee.emp_id} — ${employeeName(employee)}`

  employeeDropdownOpen.value = false
  employeeActiveIndex.value = -1
}

const moveEmployeeActive = (direction: number) => {
  if (!employeeDropdownOpen.value) {
    openEmployeeDropdown()
    return
  }

  const total = filteredEmployeeOptions.value.length
  if (!total) return

  if (employeeActiveIndex.value < 0) {
    employeeActiveIndex.value = direction > 0 ? 0 : total - 1
    return
  }

  employeeActiveIndex.value =
    (employeeActiveIndex.value + direction + total) % total
}

const selectHighlightedEmployee = () => {
  const employee =
    filteredEmployeeOptions.value[employeeActiveIndex.value]

  if (employee) selectEmployee(employee)
}

const handleEmployeeFocusOut = (event: FocusEvent) => {
  const nextTarget = event.relatedTarget

  if (
    !(nextTarget instanceof Node) ||
    !employeePicker.value?.contains(nextTarget)
  ) {
    closeEmployeeDropdown()
  }
}

const leaveTypeId = ref<number | ''>('')
const requestDate = ref(localDateKey())
const startDate = ref('')
const endDate = ref('')
const selectedDates = ref<string[]>([])
const leaveDates = ref<LeaveDateDetail[]>([])
const payMode = ref<PayMode | ''>('')
const reason = ref('')
const attachment = ref<{ name: string; dataUrl: string }>()
const imageLoading = ref(false)
const loadingOptions = ref(true)
const loadingContext = ref(false)
const saving = ref(false)
const formError = ref('')
const contextError = ref('')
const scheduleName = ref('')
const restDayIndexes = ref<number[]>([])
const credits = ref<LeaveCredit[]>([])
let contextRequest = 0

const weekdayIndexes: Record<string, number> = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
}
const weekdayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const toWeekdayIndex = (value: unknown): number | null => {
  if (typeof value !== 'string') return null
  return weekdayIndexes[value.trim().toLowerCase().replace(/[^a-z]/g, '').slice(0, 3)] ?? null
}

const isWorkingDay = (value: WorkScheduleDay['is_working_day']) =>
  value !== false && value !== 0 && value !== '0' && value !== 'false'

const selectedEmployee = computed(() =>
  employees.value.find(employee => employee.id === Number(selectedEmployeeId.value)),
)
const selectedLeaveType = computed(() =>
  leaveTypes.value.find(type => type.id === Number(leaveTypeId.value)),
)
const employeeName = (employee: EmployeeOption) =>
  [employee.firstname, employee.middlename, employee.lastname].filter(Boolean).join(' ')

const matchingCredits = computed(() => {
  const type = selectedLeaveType.value
  if (!type) return []
  const name = type.leave_name.trim().toLowerCase()

  return credits.value.filter(credit =>
    Number(credit.employee_id) === Number(selectedEmployeeId.value)
    && (Number(credit.leave_type_id) === type.id
      || (credit.leave_type ?? '').trim().toLowerCase() === name),
  )
})
const paidCredits = computed(() => matchingCredits.value.filter(credit =>
  credit.policy_paid === true
  || credit.policy_paid === 1
  || credit.policy_paid === '1'
  || credit.policy_paid === 'true',
))
const hasPaidPolicy = computed(() => paidCredits.value.length > 0)
const availablePaidCredits = computed(() => paidCredits.value.reduce(
  (total, credit) => total + (Number(credit.available) || 0), 0,
))
const paidDisabled = computed(() =>
  !selectedEmployeeId.value || loadingContext.value || Boolean(contextError.value) || !hasPaidPolicy.value,
)

const duration = (item: LeaveDateDetail) => item.dayType === 'half_day' ? 0.5 : 1
const totalDays = computed(() => leaveDates.value.reduce((total, item) => total + duration(item), 0))
const paidDays = computed(() => leaveDates.value.reduce(
  (total, item) => total + (item.payType === 'paid' ? duration(item) : 0), 0,
))
const unpaidDays = computed(() => totalDays.value - paidDays.value)
const actualPayType = computed<PayMode>(() =>
  paidDays.value > 0 && unpaidDays.value > 0 ? 'mixed' : paidDays.value > 0 ? 'paid' : 'unpaid',
)
const balanceAfter = computed(() => Math.max(0, availablePaidCredits.value - paidDays.value))
const restDayText = computed(() => restDayIndexes.value.map(index => weekdayLabels[index]).join(', '))
const contextNotice = computed(() => {
  if (!selectedEmployeeId.value) return 'Select an employee to load their assigned schedule and leave credits.'
  if (loadingContext.value) return 'Loading the employee schedule and leave credits...'
  if (contextError.value) return contextError.value
  if (!leaveTypeId.value) return `Schedule loaded. Rest days: ${restDayText.value || 'None'}. Select a leave type to check paid credits.`
  if (!hasPaidPolicy.value) return 'No eligible paid policy was found for this employee and leave type. The request will be Unpaid.'
  return `${availablePaidCredits.value} paid day${availablePaidCredits.value === 1 ? '' : 's'} available. Rest days from ${scheduleName.value} are disabled.`
})

const loadOptions = async () => {
  loadingOptions.value = true
  formError.value = ''
  try {
    const [employeeResponse, leaveTypeResponse] = await Promise.all([
      $api<any>('/admin/employees', { method: 'GET', query: { status: 1 } }),
      $api<any>('/admin/leave-types', { method: 'GET' }),
    ])
    employees.value = Array.isArray(employeeResponse?.data) ? employeeResponse.data : []
    leaveTypes.value = Array.isArray(leaveTypeResponse?.data) ? leaveTypeResponse.data : []
  } catch (error: any) {
    formError.value = error?.data?.message || error?.message || 'Unable to load employees and leave types.'
  } finally {
    loadingOptions.value = false
  }
}

const resolveSchedule = (employments?: EmploymentRecord[] | null) => {
  const employment = [...(employments ?? [])].sort((a, b) => {
    const dateOrder = (b.date_hired ?? '').slice(0, 10).localeCompare((a.date_hired ?? '').slice(0, 10))
    return dateOrder || b.id - a.id
  })[0]
  const schedule = employment?.work_schedule
  const days = schedule?.days
  if (!Array.isArray(days) || !days.length) throw new Error('The selected employee has no assigned work schedule days.')
  if (days.some(day => toWeekdayIndex(day.day_of_week) === null)) throw new Error('The employee schedule contains an unrecognized weekday.')

  const working = new Set(days
    .filter(day => isWorkingDay(day.is_working_day))
    .map(day => toWeekdayIndex(day.day_of_week))
    .filter((day): day is number => day !== null))
  const explicitRest = days
    .filter(day => !isWorkingDay(day.is_working_day))
    .map(day => toWeekdayIndex(day.day_of_week))
    .filter((day): day is number => day !== null)

  restDayIndexes.value = [...new Set([
    ...explicitRest,
    ...[0, 1, 2, 3, 4, 5, 6].filter(index => !working.has(index)),
  ])].sort((a, b) => a - b)
  scheduleName.value = schedule?.schedule_name || schedule?.schedule_code || 'assigned schedule'
}

const loadEmployeeContext = async () => {
  const employeeId = Number(selectedEmployeeId.value)
  const requestId = ++contextRequest
  contextError.value = ''
  credits.value = []
  restDayIndexes.value = []
  scheduleName.value = ''
  selectedDates.value = []
  leaveDates.value = []
  payMode.value = ''
  if (!employeeId) return

  loadingContext.value = true
  try {
    const [profileResponse, creditResponse] = await Promise.all([
      $api<any>(`/admin/employees/${employeeId}`, { method: 'GET' }),
      $api<any>('/admin/leave-credit-balances', { method: 'GET', query: { employee_id: employeeId } }),
    ])
    if (requestId !== contextRequest) return
    if (profileResponse?.success === false || !profileResponse?.data) throw new Error(profileResponse?.message || 'Unable to load the employee profile.')
    if (creditResponse?.success === false || !Array.isArray(creditResponse?.data)) throw new Error(creditResponse?.message || 'Unable to load employee leave credits.')
    resolveSchedule(profileResponse.data.employments)
    credits.value = creditResponse.data.filter((credit: LeaveCredit) => Number(credit.employee_id) === employeeId)
  } catch (error: any) {
    if (requestId !== contextRequest) return
    contextError.value = error?.data?.message || error?.response?._data?.message || error?.message || 'Unable to verify this employee\'s leave information.'
  } finally {
    if (requestId === contextRequest) loadingContext.value = false
  }
}

watch(selectedEmployeeId, loadEmployeeContext)
watch([leaveTypeId, paidDisabled], () => {
  if (leaveTypeId.value && paidDisabled.value) payMode.value = 'unpaid'
})
watch(payMode, mode => {
  if (mode === 'paid' || mode === 'unpaid') leaveDates.value.forEach(item => { item.payType = mode })
})
watch(selectedDates, dates => {
  const previous = new Map(leaveDates.value.map(item => [item.date, item]))
  leaveDates.value = [...new Set(dates)].sort().map(date => ({
    date,
    dayType: previous.get(date)?.dayType || 'whole_day',
    payType: previous.get(date)?.payType || (payMode.value === 'paid' && !paidDisabled.value ? 'paid' : 'unpaid'),
  }))
}, { deep: true })

const removeDate = (date: string) => {
  selectedDates.value = selectedDates.value.filter(selected => selected !== date)
}

const applySuggestedSplit = () => {
  let remainingUnits = Math.floor(availablePaidCredits.value * 2 + 0.001)
  leaveDates.value.forEach(item => {
    const units = Math.round(duration(item) * 2)
    item.payType = remainingUnits >= units ? 'paid' : 'unpaid'
    if (item.payType === 'paid') remainingUnits -= units
  })
}

const formatDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString('en-PH', {
  weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
})

const validate = () => {
  formError.value = ''
  if (!selectedEmployeeId.value) formError.value = 'Select an employee.'
  else if (!leaveTypeId.value) formError.value = 'Select a leave type.'
  else if (!requestDate.value) formError.value = 'Select the filing date.'
  else if (loadingContext.value || contextError.value) formError.value = contextError.value || 'Wait for the employee information to load.'
  else if (!selectedDates.value.length) formError.value = 'Select at least one leave date.'
  else if (!payMode.value) formError.value = 'Choose Paid, Unpaid, or Mixed leave.'
  else if (!reason.value.trim()) formError.value = 'Provide the reason for the leave.'
  else if (payMode.value !== actualPayType.value) formError.value = 'The payment choice does not match the selected date breakdown.'
  else if (paidDays.value > 0 && !hasPaidPolicy.value) formError.value = 'This employee has no eligible paid policy for the selected leave type.'
  else if (paidDays.value > availablePaidCredits.value + 0.001) formError.value = `Insufficient paid credits: ${availablePaidCredits.value} available and ${paidDays.value} requested.`
  return !formError.value
}

const submit = async () => {
  if (saving.value || imageLoading.value || !validate()) return
  saving.value = true
  try {
    const dates = leaveDates.value.map(item => ({
      leave_date: item.date,
      day_type: item.dayType,
      day_value: duration(item),
      requested_pay_type: item.payType,
      pay_type: item.payType,
    }))
    const response = await $api<any>('/admin/leave-approvals', {
      method: 'POST',
      body: {
        employee_id: Number(selectedEmployeeId.value),
        leave_type_id: Number(leaveTypeId.value),
        request_date: requestDate.value,
        requested_pay_type: actualPayType.value,
        start_date: dates[0]?.leave_date,
        end_date: dates[dates.length - 1]?.leave_date,
        reason: reason.value.trim(),
        dates,
        image: attachment.value?.dataUrl || undefined,
      },
    })
    if (response?.success === false) throw new Error(response.message || 'The leave request was not saved.')
    success('Leave Filed', response?.message || 'The employee leave was filed and auto-approved successfully.')
    await router.push('/admin/approvals/leaves')
  } catch (error: any) {
    const data = error?.data ?? error?.response?._data ?? {}
    const firstError = Object.values(data.errors ?? {}).flat()[0]
    formError.value = String(firstError || data.message || error?.message || 'Unable to file the employee leave.')
  } finally {
    saving.value = false
  }
}

onMounted(loadOptions)
</script>

<template>
  <section class="create-leave-page">
    <button type="button" class="back-button" @click="router.push('/admin/approvals/leaves')">
      <ArrowLeft :size="16" /> Back to Leave Approvals
    </button>

    <PageHeader
      title="File Employee Leave"
      description="Select an employee, validate their schedule and credits, then file the leave for approval."
    />

    <form class="leave-form" novalidate @submit.prevent="submit">
      
        <!-- EMPLOYEE AND LEAVE DETAILS -->
        <section class="form-card">
        <div class="section-title">
            <UserRound :size="19" />

            <div>
            <h2>Employee and Leave Details</h2>
            <p>
                Select an employee, leave type, and filing date.
            </p>
            </div>
        </div>

        <div class="form-grid">

            <!-- SEARCHABLE EMPLOYEE -->
            <div class="employee-field">
            <label for="employee-search">
                Employee <em>*</em>
            </label>

            <div
                ref="employeePicker"
                class="employee-picker"
                @focusout="handleEmployeeFocusOut"
            >
                <input
                id="employee-search"
                v-model="employeeQuery"
                type="text"
                role="combobox"
                aria-autocomplete="list"
                aria-controls="employee-options"
                :aria-expanded="employeeDropdownOpen"
                autocomplete="off"
                placeholder="Search employee name or ID..."
                :disabled="loadingOptions"
                required
                @focus="openEmployeeDropdown"
                @input="handleEmployeeSearch"
                @keydown.down.prevent="moveEmployeeActive(1)"
                @keydown.up.prevent="moveEmployeeActive(-1)"
                @keydown.enter.prevent="selectHighlightedEmployee"
                @keydown.esc.prevent="closeEmployeeDropdown"
                />

                <div
                v-if="employeeDropdownOpen && !loadingOptions"
                id="employee-options"
                class="employee-dropdown"
                role="listbox"
                aria-label="Employees"
                >
                <button
                    v-for="(employee, index) in filteredEmployeeOptions"
                    :key="employee.id"
                    type="button"
                    role="option"
                    class="employee-option"
                    :class="{
                    highlighted: employeeActiveIndex === index
                    }"
                    :aria-selected="selectedEmployeeId === employee.id"
                    @click="selectEmployee(employee)"
                >
                    <span class="employee-option-name">
                    {{ employeeName(employee) }}
                    </span>

                    <span class="employee-option-id">
                    EMP-{{ employee.emp_id }}
                    </span>
                </button>

                <div
                    v-if="filteredEmployeeOptions.length === 0"
                    class="employee-no-results"
                >
                    No employees found.
                </div>
                </div>
            </div>
            </div>

            <!-- LEAVE TYPE -->
            <label>
            <span>Leave Type <em>*</em></span>

            <select
                v-model.number="leaveTypeId"
                :disabled="loadingOptions"
                required
            >
                <option value="" disabled>
                {{ loadingOptions
                    ? 'Loading leave types...'
                    : 'Select leave type'
                }}
                </option>

                <option
                v-for="type in leaveTypes"
                :key="type.id"
                :value="type.id"
                >
                {{ type.leave_name }}
                </option>
            </select>
            </label>

            <!-- FILING DATE -->
            <label>
            <span>Filing Date <em>*</em></span>

            <input
                v-model="requestDate"
                type="date"
                required
            />
            </label>

        </div>

        <!-- EMPLOYEE SCHEDULE AND CREDIT INFORMATION -->
        <div
            class="context-note"
            :class="{ error: contextError }"
        >
            <Info :size="16" />
            <span>{{ contextNotice }}</span>
        </div>
        </section>


      <section class="form-card">
        <div class="section-title">
          <WalletCards :size="19" />
          <div><h2>Payment Classification</h2><p>Paid options follow the selected employee’s eligible policy and credits.</p></div>
        </div>

        <div class="payment-options">
          <label :class="{ disabled: paidDisabled, selected: payMode === 'paid' }"><input v-model="payMode" type="radio" value="paid" :disabled="paidDisabled" /><strong>Paid</strong><small>All selected dates use paid credits.</small></label>
          <label :class="{ selected: payMode === 'unpaid' }"><input v-model="payMode" type="radio" value="unpaid" /><strong>Unpaid</strong><small>No leave credits will be deducted.</small></label>
          <label :class="{ disabled: paidDisabled, selected: payMode === 'mixed' }"><input v-model="payMode" type="radio" value="mixed" :disabled="paidDisabled" /><strong>Mixed</strong><small>Set Paid or Unpaid for each date.</small></label>
        </div>
      </section>

      <section class="form-card">
        <div class="section-title">
          <CalendarDays :size="19" />
          <div><h2>Leave Dates</h2><p>Select individual dates. Employee rest days are disabled.</p></div>
        </div>

        <div v-if="!selectedEmployeeId || loadingContext || contextError" class="calendar-placeholder">
          {{ contextNotice }}
        </div>
        <EmployeeLeaveDateCalendar
          v-else
          v-model:start="startDate"
          v-model:end="endDate"
          v-model:selected-dates="selectedDates"
          :disabled-weekdays="restDayIndexes"
          selection-mode="multiple"
        />

        <div v-if="leaveDates.length" class="selected-days">
          <div class="selected-days-heading"><div><h3>Selected Days</h3><p>Configure duration and payment for each date.</p></div><strong>{{ totalDays }} day{{ totalDays === 1 ? '' : 's' }}</strong></div>
          <div v-for="item in leaveDates" :key="item.date" class="day-row">
            <strong>{{ formatDate(item.date) }}</strong>
            <div class="day-controls">
              <select v-model="item.dayType"><option value="whole_day">Whole Day (1.0)</option><option value="half_day">Half Day (0.5)</option></select>
              <select v-model="item.payType" :disabled="payMode !== 'mixed'"><option value="paid" :disabled="paidDisabled">Paid</option><option value="unpaid">Unpaid</option></select>
              <button type="button" aria-label="Remove date" @click="removeDate(item.date)"><X :size="16" /></button>
            </div>
          </div>
        </div>

        <div v-if="leaveDates.length && payMode === 'mixed'" class="split-action">
          <div><strong>Suggested split</strong><p>Uses available credits on the earliest dates and marks the remaining dates Unpaid.</p></div>
          <button type="button" @click="applySuggestedSplit"><WandSparkles :size="15" /> Apply Suggested Split</button>
        </div>

        <div v-if="leaveDates.length" class="credit-summary">
          <div><span>Available Credits</span><strong>{{ availablePaidCredits }}</strong></div>
          <div><span>Paid Days</span><strong>{{ paidDays }}</strong></div>
          <div><span>Unpaid Days</span><strong>{{ unpaidDays }}</strong></div>
          <div><span>Balance if Approved</span><strong>{{ balanceAfter }}</strong></div>
        </div>
      </section>

      <section class="form-card">
        <label class="reason-field"><span>Reason / Details <em>*</em></span><textarea v-model="reason" rows="5" maxlength="1000" required placeholder="Enter the reason for filing this employee leave." /><small>{{ reason.length }}/1000</small></label>
        <EmployeeRequestImageUpload v-model="attachment" :required="false" @busy="imageLoading = $event" />
        <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>
      </section>

      <footer class="form-actions">
        <AppButton type="button" variant="secondary" :disabled="saving" @click="router.push('/admin/approvals/leaves')">Cancel</AppButton>
        <AppButton type="submit" :icon="Send" :disabled="saving || imageLoading || loadingContext">
          {{ saving ? 'Filing Leave...' : 'File & Auto-Approve' }}
        </AppButton>
      </footer>
    </form>
  </section>
</template>

<style scoped>
.create-leave-page{width:100%;max-width:1180px;margin:0 auto}.back-button{display:inline-flex;align-items:center;gap:6px;margin-bottom:10px;padding:0;border:0;background:transparent;color:var(--primary);font-size:11px;font-weight:650;cursor:pointer}.leave-form{display:flex;flex-direction:column;gap:14px}.form-card{padding:20px;border:1px solid var(--border);border-radius:12px;background:var(--bg-card)}.section-title{display:flex;align-items:flex-start;gap:10px;margin-bottom:18px;color:var(--primary)}.section-title h2,.selected-days-heading h3{margin:0;color:var(--text-primary);font-size:14px}.section-title p,.selected-days-heading p,.split-action p{margin:4px 0 0;color:var(--text-muted);font-size:10px}.form-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.form-grid label,.reason-field{display:flex;flex-direction:column;gap:6px;color:var(--text-secondary);font-size:11px;font-weight:650}.form-grid em,.reason-field em{color:var(--red);font-style:normal}.form-grid select,.form-grid input,.day-controls select,.reason-field textarea{width:100%;box-sizing:border-box;border:1px solid var(--border);border-radius:8px;background:var(--bg-card-soft);color:var(--text-primary);font:inherit;outline:0}.form-grid select,.form-grid input,.day-controls select{height:41px;padding:0 11px}.reason-field textarea{padding:11px;resize:vertical}.reason-field small{align-self:flex-end;color:var(--text-muted);font-weight:400}.context-note{display:flex;align-items:flex-start;gap:8px;margin-top:15px;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--primary-soft);color:var(--text-secondary);font-size:10px;line-height:1.5}.context-note.error{border-color:var(--red);background:var(--red-soft);color:var(--red)}.payment-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.payment-options label{display:grid;grid-template-columns:auto 1fr;gap:3px 8px;padding:13px;border:1px solid var(--border);border-radius:10px;background:var(--bg-card-soft);cursor:pointer}.payment-options label.selected{border-color:var(--primary);background:var(--primary-soft)}.payment-options label.disabled{opacity:.45;cursor:not-allowed}.payment-options input{grid-row:1/3}.payment-options strong{color:var(--text-primary);font-size:11px}.payment-options small{color:var(--text-muted);font-size:9px;line-height:1.4}.calendar-placeholder{padding:24px;border:1px dashed var(--border);border-radius:10px;color:var(--text-muted);font-size:11px;text-align:center}.selected-days{margin-top:14px;border:1px solid var(--border);border-radius:10px;overflow:hidden}.selected-days-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px;background:var(--bg-card-soft)}.selected-days-heading>strong{color:var(--primary);font-size:12px}.day-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border-top:1px solid var(--border)}.day-row>strong{color:var(--text-primary);font-size:11px}.day-controls{display:flex;align-items:center;gap:8px}.day-controls select{width:auto;min-width:135px}.day-controls button{display:inline-flex;width:32px;height:32px;align-items:center;justify-content:center;border:0;border-radius:7px;background:var(--red-soft);color:var(--red);cursor:pointer}.split-action{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-top:14px;padding:12px;border:1px solid var(--border);border-radius:9px;background:var(--bg-card-soft)}.split-action strong{color:var(--text-primary);font-size:11px}.split-action button{display:inline-flex;align-items:center;gap:6px;padding:8px 10px;border:1px solid var(--primary);border-radius:7px;background:transparent;color:var(--primary);font-size:10px;font-weight:650;cursor:pointer}.credit-summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:14px}.credit-summary div{padding:12px;border:1px solid var(--border);border-radius:9px;background:var(--bg-card-soft)}.credit-summary span{display:block;color:var(--text-muted);font-size:9px}.credit-summary strong{display:block;margin-top:5px;color:var(--text-primary);font-size:15px}.form-error{margin:12px 0 0;color:var(--red);font-size:11px}.form-actions{position:sticky;bottom:0;display:flex;justify-content:flex-end;gap:9px;padding:13px 0;background:var(--bg-page)}


/* Searchable Employee Dropdown */

.employee-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 650;
}

.employee-field em {
  color: var(--red);
  font-style: normal;
}

.employee-picker {
  position: relative;
  width: 100%;
  min-width: 0;
}

.employee-picker input {
  width: 100%;
  height: 41px;
  box-sizing: border-box;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 400;
  outline: none;
}

.employee-picker input:focus {
  border-color: var(--primary);
}

.employee-picker input::placeholder {
  color: var(--text-muted);
}

.employee-picker input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.employee-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 100;
  max-height: 260px;
  overflow-y: auto;
  padding: 5px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
}

.employee-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 11px 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
}

.employee-option:hover,
.employee-option.highlighted {
  background: var(--primary-soft);
}

.employee-option-name {
  font-size: 12px;
  font-weight: 500;
}

.employee-option-id {
  color: var(--text-muted);
  font-size: 11px;
  white-space: nowrap;
}

.employee-no-results {
  padding: 14px 12px;
  color: var(--text-muted);
  font-size: 12px;
  text-align: center;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}
/* Keep Employee label and required asterisk on the same line */
.employee-field > label {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 4px;
  width: fit-content;
}

.employee-field > label em {
  display: inline;
  color: var(--red);
  font-style: normal;
  line-height: inherit;
}


@media(max-width:800px){.form-grid,.payment-options{grid-template-columns:1fr}.credit-summary{grid-template-columns:repeat(2,minmax(0,1fr))}.day-row{align-items:flex-start;flex-direction:column}.day-controls{width:100%;flex-wrap:wrap}.day-controls select{flex:1;min-width:130px}}
@media(max-width:480px){.form-card{padding:14px}.credit-summary{grid-template-columns:1fr 1fr}.split-action{align-items:flex-start;flex-direction:column}.split-action button{width:100%;justify-content:center}.form-actions{display:grid;grid-template-columns:1fr 1fr}.day-controls select{width:100%;flex-basis:100%}}
</style>
