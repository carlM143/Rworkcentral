<script setup lang="ts">
import { X, Search, User, CalendarDays, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-vue-next'
import EmployeeRequestImageUpload from '~/components/employee/EmployeeRequestImageUpload.vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    defaultType?: 'Leave' | 'Overtime' | 'Undertime' | ''
  }>(),
  {
    defaultType: 'Leave',
  },
)

const emit = defineEmits<{
  close: []
  success: [message: string]
}>()

const { $api } = useNuxtApp()
const { success } = useToast()

const requestType = ref<'Leave' | 'Overtime' | 'Undertime'>('Leave')
const saving = ref(false)
const errorMessage = ref('')

// Employee search & selection
const employeeQuery = ref('')
const employees = ref<Array<{ id: number; emp_id: any; firstname: string; lastname: string; department?: { department_name?: string } }>>([])
const selectedEmployee = ref<any | null>(null)
const showEmployeeDropdown = ref(false)

// Leave fields
const leaveTypes = ref<Array<{ id: number; leave_name: string; leave_code?: string }>>([])
const leaveTypeId = ref<number | null>(null)
const requestDate = ref(new Date().toISOString().slice(0, 10))
const leaveReason = ref('')

// Calendar & selected dates for Leave (supports non-continuous selection e.g. 1st and 3rd)
const viewDate = ref<Date>(new Date())
const selectedDatesMap = ref<Record<string, { dayType: 'whole_day' | 'half_day'; payType: 'paid' | 'unpaid' }>>({})

// Overtime fields
const otDate = ref(new Date().toISOString().slice(0, 10))
const otStartAt = ref('18:00')
const otEndAt = ref('21:00')
const otReason = ref('')

// Undertime fields
const utDate = ref(new Date().toISOString().slice(0, 10))
const utStartTime = ref('')
const utEndTime = ref('18:00')
const utReason = ref('')
const attachedImage = ref<{ name: string; dataUrl: string } | undefined>(undefined)

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const weekdays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']

watch(() => props.open, async isOpen => {
  if (isOpen) {
    requestType.value = (props.defaultType || 'Leave') as any
    errorMessage.value = ''
    employeeQuery.value = ''
    selectedEmployee.value = null
    leaveReason.value = ''
    otReason.value = ''
    utReason.value = ''
    utStartTime.value = ''
    utEndTime.value = '18:00'
    attachedImage.value = undefined
    selectedDatesMap.value = {}

    // Default today selected for leave
    const todayStr = new Date().toISOString().slice(0, 10)
    selectedDatesMap.value = {
      [todayStr]: { dayType: 'whole_day', payType: 'paid' },
    }

    try {
      const [empRes, leaveRes] = await Promise.all([
        $api<any>('/admin/employees').catch(() => ({ data: [] })),
        $api<any>('/admin/leave-types').catch(() => ({ data: [] })),
      ])
      employees.value = Array.isArray(empRes?.data) ? empRes.data : (Array.isArray(empRes) ? empRes : [])
      leaveTypes.value = Array.isArray(leaveRes?.data) ? leaveRes.data : (Array.isArray(leaveRes) ? leaveRes : [])
      if (leaveTypes.value.length && !leaveTypeId.value) {
        leaveTypeId.value = leaveTypes.value[0].id
      }
    } catch {
      employees.value = []
      leaveTypes.value = []
    }
  }
})

const filteredEmployees = computed(() => {
  const query = employeeQuery.value.trim().toLowerCase()
  if (!query) return employees.value.slice(0, 8)
  return employees.value.filter(emp => {
    const fullName = `${emp.firstname} ${emp.lastname}`.toLowerCase()
    const empId = String(emp.emp_id ?? emp.id).toLowerCase()
    return fullName.includes(query) || empId.includes(query)
  }).slice(0, 8)
})

const selectEmployee = (emp: any) => {
  selectedEmployee.value = emp
  employeeQuery.value = `${emp.firstname} ${emp.lastname} (${emp.emp_id ?? emp.id})`
  showEmployeeDropdown.value = false
}

// Calendar Navigation
const currentMonthLabel = computed(() => `${monthNames[viewDate.value.getMonth()]} ${viewDate.value.getFullYear()}`)
const prevMonth = () => { viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() - 1, 1, 12, 0, 0) }
const nextMonth = () => { viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + 1, 1, 12, 0, 0) }
const goToToday = () => {
  const now = new Date()
  viewDate.value = new Date(now.getFullYear(), now.getMonth(), 1, 12, 0, 0)
}

const formatDateStr = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const calendarCells = computed(() => {
  const year = viewDate.value.getFullYear()
  const month = viewDate.value.getMonth()
  const firstDay = new Date(year, month, 1, 12, 0, 0)
  const lastDay = new Date(year, month + 1, 0, 12, 0, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()
  const todayStr = new Date().toISOString().slice(0, 10)

  const cells = []
  const prevMonthLastDay = new Date(year, month, 0, 12, 0, 0).getDate()

  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i, 12, 0, 0)
    const dateStr = formatDateStr(d)
    cells.push({ dateStr, dayNumber: d.getDate(), isCurrentMonth: false, isToday: dateStr === todayStr })
  }

  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const d = new Date(year, month, dayNum, 12, 0, 0)
    const dateStr = formatDateStr(d)
    cells.push({ dateStr, dayNumber: dayNum, isCurrentMonth: true, isToday: dateStr === todayStr })
  }

  const totalCells = cells.length <= 35 ? 35 : 42
  const remaining = totalCells - cells.length
  for (let dayNum = 1; dayNum <= remaining; dayNum++) {
    const d = new Date(year, month + 1, dayNum, 12, 0, 0)
    const dateStr = formatDateStr(d)
    cells.push({ dateStr, dayNumber: dayNum, isCurrentMonth: false, isToday: dateStr === todayStr })
  }

  return cells
})

const toggleDateSelection = (dateStr: string) => {
  if (selectedDatesMap.value[dateStr]) {
    const copy = { ...selectedDatesMap.value }
    delete copy[dateStr]
    selectedDatesMap.value = copy
  } else {
    selectedDatesMap.value = {
      ...selectedDatesMap.value,
      [dateStr]: { dayType: 'whole_day', payType: 'paid' },
    }
  }
}

const selectedDatesList = computed(() => {
  return Object.keys(selectedDatesMap.value).sort()
})

const totalLeaveDays = computed(() => {
  return Object.values(selectedDatesMap.value).reduce((sum, item) => sum + (item.dayType === 'half_day' ? 0.5 : 1.0), 0)
})

const setQuickPreset = (type: 'today' | 'tomorrow' | 'next3' | 'nextWeek') => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0)
  const map: Record<string, { dayType: 'whole_day' | 'half_day'; payType: 'paid' | 'unpaid' }> = {}

  if (type === 'today') {
    map[formatDateStr(today)] = { dayType: 'whole_day', payType: 'paid' }
  } else if (type === 'tomorrow') {
    const tom = new Date(today.getTime() + 86400000)
    map[formatDateStr(tom)] = { dayType: 'whole_day', payType: 'paid' }
  } else if (type === 'next3') {
    for (let i = 0; i < 3; i++) {
      const d = new Date(today.getTime() + i * 86400000)
      map[formatDateStr(d)] = { dayType: 'whole_day', payType: 'paid' }
    }
  } else if (type === 'nextWeek') {
    const dayOfWeek = today.getDay()
    const daysUntilNextMon = dayOfWeek === 0 ? 1 : 8 - dayOfWeek
    const nextMon = new Date(today.getTime() + daysUntilNextMon * 86400000)
    for (let i = 0; i < 5; i++) {
      const d = new Date(nextMon.getTime() + i * 86400000)
      map[formatDateStr(d)] = { dayType: 'whole_day', payType: 'paid' }
    }
  }
  selectedDatesMap.value = map
  if (selectedDatesList.value.length) {
    const first = new Date(selectedDatesList.value[0] + 'T00:00:00')
    viewDate.value = new Date(first.getFullYear(), first.getMonth(), 1, 12, 0, 0)
  }
}

const requestedDurationText = computed(() => {
  if (!utStartTime.value || !utEndTime.value) return 'Enter valid times'
  const [h1, m1] = utStartTime.value.split(':').map(Number)
  const [h2, m2] = utEndTime.value.split(':').map(Number)
  const mins1 = h1 * 60 + m1
  const mins2 = h2 * 60 + m2
  const diff = mins2 - mins1
  if (diff <= 0) return 'Invalid duration'
  const hours = Math.floor(diff / 60)
  const mins = diff % 60
  return `${hours ? hours + ' hr ' : ''}${mins ? mins + ' mins' : hours ? '' : '0 mins'}`
})

const submit = async () => {
  if (!selectedEmployee.value) {
    errorMessage.value = 'Please select an employee.'
    return
  }

  if (requestType.value === 'Leave' && !selectedDatesList.value.length) {
    errorMessage.value = 'Please select at least one leave date.'
    return
  }

  saving.value = true
  errorMessage.value = ''

  try {
    let endpoint = ''
    let payload: Record<string, any> = {}

    if (requestType.value === 'Leave') {
      endpoint = '/admin/leave-approvals'
      const datesArray = selectedDatesList.value.map(d => ({
        leave_date: d,
        day_type: selectedDatesMap.value[d].dayType,
        day_value: selectedDatesMap.value[d].dayType === 'half_day' ? 0.5 : 1.0,
        pay_type: selectedDatesMap.value[d].payType,
      }))

      payload = {
        employee_id: selectedEmployee.value.id,
        leave_type_id: leaveTypeId.value,
        request_date: requestDate.value,
        requested_pay_type: datesArray[0]?.pay_type || 'paid',
        reason: leaveReason.value || 'Admin filed leave request',
        dates: datesArray,
        image: attachedImage.value,
      }
    } else if (requestType.value === 'Overtime') {
      endpoint = '/admin/overtime-requests'
      payload = {
        employee_id: selectedEmployee.value.id,
        ot_date: otDate.value,
        start_at: `${otDate.value} ${otStartAt.value}:00`,
        end_at: `${otDate.value} ${otEndAt.value}:00`,
        reason: otReason.value || 'Admin filed overtime request',
        image: attachedImage.value,
      }
    } else {
      endpoint = '/admin/undertime-requests'
      payload = {
        employee_id: selectedEmployee.value.id,
        undertime_date: utDate.value,
        scheduled_time_out: `${utDate.value} 18:00:00`,
        requested_time_out: `${utDate.value} ${utStartTime.value || '16:00'}:00`,
        reason: utReason.value || 'Admin filed undertime request',
        image: attachedImage.value,
      }
    }

    const res = await $api<any>(endpoint, {
      method: 'POST',
      body: payload,
    })

    if (res?.success === false) {
      throw new Error(res?.message || 'Failed to submit request.')
    }

    const msg = res?.message || `${requestType.value} request filed and auto-approved successfully.`
    success('Request Filed', msg)
    emit('success', msg)
    emit('close')
  } catch (err: any) {
    const data = err?.data ?? err?.response?._data ?? {}
    const firstErr = Object.values(data.errors ?? {}).flat()[0]
    errorMessage.value = String(firstErr || data.message || err?.message || 'Failed to submit request.')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div v-if="open" class="modal-overlay" @click.self="emit('close')">
    <article class="modal-card" role="dialog" aria-modal="true" aria-label="File Approval Request">
      <header class="modal-header">
        <div>
          <h2>File {{ requestType }} Request</h2>
          <p>Submit and auto-approve a {{ requestType.toLowerCase() }} request for an employee.</p>
        </div>
        <button type="button" class="close-btn" aria-label="Close" @click="emit('close')">
          <X :size="18" />
        </button>
      </header>

      <div class="modal-body">
        <!-- Request Type Tabs -->
        <div v-if="!defaultType" class="type-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            :aria-selected="requestType === 'Leave'"
            :class="{ active: requestType === 'Leave' }"
            @click="requestType = 'Leave'"
          >
            Leave Request
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="requestType === 'Overtime'"
            :class="{ active: requestType === 'Overtime' }"
            @click="requestType = 'Overtime'"
          >
            Overtime
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="requestType === 'Undertime'"
            :class="{ active: requestType === 'Undertime' }"
            @click="requestType = 'Undertime'"
          >
            Undertime
          </button>
        </div>

        <!-- Employee Autocomplete -->
        <div class="field-group autocomplete-container">
          <label>Employee *</label>
          <div class="input-with-icon">
            <Search :size="16" class="field-icon" />
            <input
              v-model="employeeQuery"
              type="text"
              placeholder="Type employee name or ID for suggestions..."
              autocomplete="off"
              @focus="showEmployeeDropdown = true"
              @input="showEmployeeDropdown = true; selectedEmployee = null"
            />
          </div>

          <div v-if="showEmployeeDropdown && filteredEmployees.length" class="suggestions-dropdown">
            <div
              v-for="emp in filteredEmployees"
              :key="emp.id"
              class="suggestion-item"
              @click="selectEmployee(emp)"
            >
              <User :size="14" />
              <div>
                <strong>{{ emp.firstname }} {{ emp.lastname }}</strong>
                <span>{{ emp.emp_id ? `EMP-${emp.emp_id}` : `ID: ${emp.id}` }} · {{ emp.department?.department_name || 'No Department' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- LEAVE FIELDS -->
        <template v-if="requestType === 'Leave'">
          <div class="field-group">
            <label>Leave Type *</label>
            <select v-model="leaveTypeId">
              <option v-for="lt in leaveTypes" :key="lt.id" :value="lt.id">
                {{ lt.leave_name }}
              </option>
            </select>
          </div>

          <div class="field-group">
            <label>Date of Request (Filing Date)</label>
            <input v-model="requestDate" type="date" />
          </div>

          <!-- Calendar Date Picker allowing specific/non-continuous date selection (click to toggle dates) -->
          <div class="field-group calendar-box">
            <div class="cal-nav-header">
              <div class="cal-title-group">
                <span class="cal-month-title">{{ currentMonthLabel }}</span>
                <ChevronDown :size="14" class="cal-caret" />
                <button type="button" class="today-badge-btn" @click="goToToday">Today</button>
              </div>
              <div class="cal-nav-arrows">
                <button type="button" @click="prevMonth" aria-label="Previous month"><ChevronLeft :size="16" /></button>
                <button type="button" @click="nextMonth" aria-label="Next month"><ChevronRight :size="16" /></button>
              </div>
            </div>

            <div class="cal-grid">
              <div v-for="w in weekdays" :key="w" class="cal-weekday">{{ w }}</div>
              <div
                v-for="(cell, i) in calendarCells"
                :key="i"
                class="cal-cell"
                :class="{
                  'other-month': !cell.isCurrentMonth,
                  'today': cell.isToday,
                  'selected': selectedDatesMap[cell.dateStr],
                }"
                @click="toggleDateSelection(cell.dateStr)"
              >
                {{ cell.dayNumber }}
              </div>
            </div>
          </div>

          <!-- Leave Schedule by Day with Whole/Half Day and Paid/Unpaid -->
          <div class="field-group schedule-by-day-box">
            <div class="sched-heading">
              <CalendarDays :size="16" />
              <div>
                <strong>Leave Schedule by Day (Click dates above to add/remove)</strong>
                <p>Choose Whole/Half Day and Paid/Unpaid for each date.</p>
              </div>
              <span class="total-badge">Total: {{ totalLeaveDays }} day{{ totalLeaveDays === 1 ? '' : 's' }}</span>
            </div>

            <div v-if="!selectedDatesList.length" class="empty-sched">
              No dates selected. Click dates on the calendar above.
            </div>

            <div v-for="(dateStr, idx) in selectedDatesList" :key="dateStr" class="sched-row">
              <div class="sched-info">
                <span class="sched-idx">#{{ idx + 1 }}</span>
                <div>
                  <strong>{{ dateStr }}</strong>
                  <small>{{ new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' }) }}</small>
                </div>
              </div>

              <div class="sched-controls">
                <select v-model="selectedDatesMap[dateStr].dayType" aria-label="Day type">
                  <option value="whole_day">Whole Day (1.0)</option>
                  <option value="half_day">Half Day (0.5)</option>
                </select>

                <select v-model="selectedDatesMap[dateStr].payType" aria-label="Pay type">
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>

                <button type="button" class="remove-date-btn" title="Remove date" @click="delete selectedDatesMap[dateStr]">
                  <X :size="14" />
                </button>
              </div>
            </div>
          </div>

          <div class="field-group">
            <label>Reason / Details</label>
            <textarea v-model="leaveReason" rows="3" placeholder="Include the reason and any relevant times or details."></textarea>
          </div>

          <EmployeeRequestImageUpload v-model="attachedImage" :required="false" class="field-group" />
        </template>

        <!-- OVERTIME FIELDS -->
        <template v-if="requestType === 'Overtime'">
          <div class="field-group">
            <label>Overtime Date *</label>
            <input v-model="otDate" type="date" />
          </div>

          <div class="field-row">
            <div class="field-group">
              <label>Start Time *</label>
              <input v-model="otStartAt" type="time" />
            </div>
            <div class="field-group">
              <label>End Time *</label>
              <input v-model="otEndAt" type="time" />
            </div>
          </div>

          <div class="field-group">
            <label>Reason / Justification</label>
            <textarea v-model="otReason" rows="3" placeholder="Enter reason for overtime..."></textarea>
          </div>

          <EmployeeRequestImageUpload v-model="attachedImage" :required="false" class="field-group" />
        </template>

        <!-- UNDERTIME FIELDS -->
        <template v-if="requestType === 'Undertime'">
          <div class="field-group">
            <label>Request Date *</label>
            <input v-model="utDate" type="date" />
          </div>

          <div class="shift-badge">
            <CalendarDays :size="14" />
            <span>Scheduled shift: <strong>8:00 AM – 6:00 PM</strong></span>
          </div>

          <div class="field-row">
            <div class="field-group">
              <label>Undertime Start Time *</label>
              <input v-model="utStartTime" type="time" />
            </div>
            <div class="field-group">
              <label>Undertime End Time *</label>
              <input v-model="utEndTime" type="time" />
            </div>
          </div>

          <div class="duration-badge">
            <CalendarDays :size="14" />
            <span>Requested duration: <strong>{{ requestedDurationText }}</strong></span>
          </div>

          <div class="field-group">
            <label>Reason / Details</label>
            <textarea v-model="utReason" rows="3" placeholder="Include the reason and any relevant times or details."></textarea>
          </div>

          <EmployeeRequestImageUpload v-model="attachedImage" :required="false" class="field-group" />
        </template>

        <p v-if="errorMessage" class="error-msg" role="alert">{{ errorMessage }}</p>
      </div>

      <footer class="modal-footer">
        <AppButton variant="secondary" :disabled="saving" @click="emit('close')">
          Cancel
        </AppButton>
        <AppButton :disabled="saving || !selectedEmployee" @click="submit">
          {{ saving ? 'Filing & Approving...' : 'File & Auto-Approve' }}
        </AppButton>
      </footer>
    </article>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(2px);
  padding: 16px;
}
.modal-card {
  width: 100%;
  max-width: 580px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}
.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid var(--border);
}
.modal-header h2 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}
.modal-header p {
  margin: 4px 0 0;
  font-size: 11px;
  color: var(--text-muted);
}
.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}
.close-btn:hover {
  background: var(--bg-card-soft);
  color: var(--text-primary);
}
.modal-body {
  padding: 18px 20px;
  max-height: 75vh;
  overflow-y: auto;
}
.type-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 16px;
  padding: 4px;
  background: var(--bg-card-soft);
  border-radius: 9px;
  border: 1px solid var(--border);
}
.type-tabs button {
  height: 34px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}
.type-tabs button.active {
  background: var(--bg-card);
  color: var(--primary);
  box-shadow: var(--shadow);
}
.field-group {
  margin-bottom: 14px;
  position: relative;
}
.field-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
}
.field-group input,
.field-group select,
.field-group textarea {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font-size: 11px;
  font-family: inherit;
  outline: 0;
}
.field-group textarea {
  height: auto;
  padding: 10px 12px;
}
.field-group input:focus,
.field-group select:focus,
.field-group textarea:focus {
  border-color: var(--primary);
}
.field-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.input-with-icon {
  position: relative;
}
.input-with-icon .field-icon {
  position: absolute;
  top: 50%;
  left: 12px;
  transform: translateY(-50%);
  color: var(--text-muted);
}
.input-with-icon input {
  padding-left: 38px;
}
.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 20;
  margin-top: 4px;
  max-height: 220px;
  overflow-y: auto;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}
.suggestion-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-soft);
}
.suggestion-item:last-child {
  border-bottom: 0;
}
.suggestion-item:hover {
  background: var(--bg-card-soft);
}
.suggestion-item strong {
  display: block;
  font-size: 11px;
  color: var(--text-primary);
}
.suggestion-item span {
  display: block;
  font-size: 9px;
  color: var(--text-muted);
}
.calendar-box {
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: #0f172a;
  color: #f8fafc;
}
.cal-nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.cal-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.cal-month-title {
  font-size: 15px;
  font-weight: 700;
  color: #f8fafc;
}
.cal-caret {
  color: #94a3b8;
  margin-left: -2px;
}
.today-badge-btn {
  padding: 4px 10px;
  border: 1px solid #334155;
  border-radius: 6px;
  background: #1e293b;
  color: #e2e8f0;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
}
.today-badge-btn:hover {
  background: #334155;
}
.cal-nav-arrows {
  display: flex;
  gap: 6px;
}
.cal-nav-arrows button {
  width: 30px;
  height: 30px;
  border: 1px solid #334155;
  border-radius: 8px;
  background: #1e293b;
  color: #e2e8f0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cal-nav-arrows button:hover {
  background: #334155;
}
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  row-gap: 6px;
  column-gap: 2px;
  text-align: center;
}
.cal-weekday {
  font-size: 10px;
  font-weight: 700;
  color: #64748b;
  padding: 6px 0;
  text-align: center;
}
.cal-cell {
  width: 34px;
  height: 34px;
  max-width: 34px;
  max-height: 34px;
  aspect-ratio: 1 / 1;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50% !important;
  font-size: 12px;
  font-weight: 600;
  color: #cbd5e1;
  background: transparent;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s ease;
  padding: 0;
  box-sizing: border-box;
}
.cal-cell:hover {
  background: #1e293b;
  color: #fff;
}
.cal-cell.other-month {
  color: #475569;
  opacity: 0.45;
}
.cal-cell.today:not(.selected) {
  border-color: #3b82f6;
  color: #60a5fa;
}
.cal-cell.selected {
  background: #2563eb !important;
  color: #ffffff !important;
  border-color: #2563eb !important;
  border-radius: 50% !important;
  font-weight: 700;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.55) !important;
}
.shift-badge,
.duration-badge {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 14px;
  padding: 11px 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card-soft);
  color: var(--primary);
  font-size: 11px;
}
.shift-badge strong,
.duration-badge strong {
  color: var(--text-primary);
}
.schedule-by-day-box {
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card-soft);
}
.sched-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  color: var(--primary);
}
.sched-heading strong {
  display: block;
  font-size: 11px;
  color: var(--text-primary);
}
.sched-heading p {
  margin: 2px 0 0;
  font-size: 9px;
  color: var(--text-muted);
}
.total-badge {
  margin-left: auto;
  padding: 3px 8px;
  border-radius: 6px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 10px;
  font-weight: 700;
}
.empty-sched {
  padding: 12px;
  text-align: center;
  color: var(--text-muted);
  font-size: 10px;
}
.sched-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px;
  margin-bottom: 6px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card);
}
.sched-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.sched-idx {
  font-size: 9px;
  font-weight: 700;
  color: var(--text-muted);
}
.sched-info strong {
  display: block;
  font-size: 10px;
  color: var(--text-primary);
}
.sched-info small {
  display: block;
  font-size: 9px;
  color: var(--text-muted);
}
.sched-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.sched-controls select {
  height: 34px;
  padding: 0 28px 0 10px;
  font-size: 11px;
  font-weight: 500;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-primary);
  min-width: 140px;
  cursor: pointer;
}
.sched-controls select:last-of-type {
  min-width: 90px;
}
.remove-date-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 6px;
  background: var(--red-soft);
  color: var(--red);
  cursor: pointer;
}
.remove-date-btn:hover {
  background: var(--red);
  color: white;
}
.error-msg {
  margin: 10px 0 0;
  color: var(--red);
  font-size: 11px;
}
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid var(--border);
  background: var(--bg-card-soft);
}
</style>
