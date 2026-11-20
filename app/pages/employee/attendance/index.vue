<script setup lang="ts">
import { CalendarDays, Clock3, FileClock, House, RefreshCw } from 'lucide-vue-next'
import EmployeeAttendanceTable from '~/components/employee/attendance/EmployeeAttendanceTable.vue'
import {
  attendanceError,
  attendanceStatusLabel,
  attendanceWorkedHours,
  useAttendance,
} from '~/composables/employee/attendance/useAttendance'
import type { TimeLogRecord } from '~/types/employee/attendance/attendance'
import { requestClock } from '~/utils/employeeRequestTime'

definePageMeta({ layout: false, middleware: 'employee' })
useHead({ title: 'Attendance | Employee Portal — RWorkCentral' })

const CORRECTION_ROUTE = '/employee/requests/timelog-correction-request'

const api = useAttendance()
const { profile, requests, wfhToday, ensureRequests, fetchWfhToday } = useEmployeePortal()

// Undertime approval check needs requests; the WFH note needs today's WFH status
onMounted(() => {
  void ensureRequests()
  void fetchWfhToday()
})

/* =========================================================
   HELPERS
========================================================= */

const pad = (value: number) => String(value).padStart(2, '0')
const toDateKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
const todayKey = toDateKey(new Date())

const formatDate = (value: string) =>
  new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })

const formatTime = (value?: string | null) =>
  value ? new Date(value).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }) : '—'

const hoursText = (log?: TimeLogRecord | null) => {
  const hours = log ? attendanceWorkedHours(log) : null
  return hours === null ? '—' : `${hours.toFixed(1)} hrs`
}

const weekday = (dateKey: string) =>
  new Date(`${dateKey}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long' })

const shiftFor = (dateKey: string) => profile.value.workDays.find(shift => shift.day === weekday(dateKey))

const shiftText = (dateKey: string) => {
  const shift = shiftFor(dateKey)
  return shift?.start ? `${requestClock(shift.start)} – ${requestClock(shift.end)}` : 'Rest day / Not provided'
}

/**
 * Undertime is only shown once an Undertime request covering that day is approved
 * (same rule as before the move from EmployeePortalView).
 */
const statusLabel = (log: TimeLogRecord) => {
  const status = attendanceStatusLabel(log)
  if (status !== 'Undertime') return status
  const date = log.work_date.slice(0, 10)
  const approved = requests.value.some(request => request.type === 'Undertime'
    && request.status === 'Approved' && request.start <= date && request.end >= date)
  return approved ? 'Undertime (Approved)' : '—'
}

const badgeClass = (status: string) =>
  status === 'On Time' || status.includes('Verified') ? 'green'
    : status.includes('Late') ? 'orange'
      : status.includes('Undertime') ? 'purple'
        : 'neutral'

/* =========================================================
   TODAY
========================================================= */

const todayLog = ref<TimeLogRecord | null>(null)

const loadToday = async () => {
  try {
    todayLog.value = await api.today()
  } catch {
    todayLog.value = null
  }
}

/* =========================================================
   HISTORY (filter by month; empty = all)
========================================================= */

const logs = ref<TimeLogRecord[]>([])
const loading = ref(false)
const loadError = ref('')
const month = ref('')

const monthRange = computed(() => {
  if (!/^\d{4}-\d{2}$/.test(month.value)) return {}
  const [year, mon] = month.value.split('-').map(Number) as [number, number]
  return {
    start_date: `${month.value}-01`,
    end_date: toDateKey(new Date(year, mon, 0)),
  }
})

const loadLogs = async () => {
  loading.value = true
  loadError.value = ''
  try {
    logs.value = await api.list(monthRange.value)
  } catch (cause) {
    logs.value = []
    loadError.value = attendanceError(cause, 'Unable to load your attendance records.')
  } finally {
    loading.value = false
  }
}

const refresh = () => Promise.all([loadLogs(), loadToday()])

watch(month, () => void loadLogs())
onMounted(() => void refresh())

const daysLogged = computed(() => logs.value.filter(log => log.time_in).length)

/* =========================================================
   DETAILS & REPORT
========================================================= */

const detailsOpen = ref(false)
const selected = ref<TimeLogRecord | null>(null)

const viewLog = (log: TimeLogRecord) => {
  selected.value = log
  detailsOpen.value = true
}

// "Report" opens a Time Log Correction request for that date
const reportLog = (log: TimeLogRecord) => {
  detailsOpen.value = false
  void navigateTo({ path: `${CORRECTION_ROUTE}/create`, query: { date: log.work_date.slice(0, 10) } })
}
</script>

<template>
  <section class="attendance-page">
    <header class="page-header">
      <div>
        <h1>Attendance</h1>
        <p>Your time logs, work schedule and attendance status.</p>
      </div>
      <div class="header-actions">
        <button type="button" class="secondary-button" :disabled="loading" @click="refresh">
          <RefreshCw :size="15" :class="{ spin: loading }" /> Refresh
        </button>
        <NuxtLink :to="CORRECTION_ROUTE" class="primary-button">
          <FileClock :size="16" /> Time Log Corrections
        </NuxtLink>
      </div>
    </header>

    <p v-if="loadError" class="error-message" role="alert">{{ loadError }}</p>

    <div class="top-grid">
      <!-- Today -->
      <article class="card today-card">
        <div class="card-heading">
          <div>
            <h2>Today's Attendance</h2>
            <p>{{ formatDate(todayKey) }} · Shift {{ shiftText(todayKey) }}</p>
          </div>
          <span class="badge" :class="todayLog ? badgeClass(statusLabel(todayLog)) : 'neutral'">
            {{ todayLog ? statusLabel(todayLog) : 'No record yet' }}
          </span>
        </div>

        <div class="punch-summary">
          <div><span>Time In</span><strong>{{ formatTime(todayLog?.time_in) }}</strong></div>
          <div><span>Time Out</span><strong>{{ formatTime(todayLog?.time_out) }}</strong></div>
          <div><span>Hours Worked</span><strong>{{ hoursText(todayLog) }}</strong></div>
        </div>

        <p v-if="wfhToday?.has_approved_wfh" class="wfh-note">
          <House :size="14" />
          <span>You have an approved Work From Home day today. Time in and out from the
            <NuxtLink to="/employee">Dashboard</NuxtLink>.</span>
        </p>
        <p v-else class="footnote">Regular on-site attendance is recorded by the biometric device or QR scan.</p>
      </article>

      <!-- Work schedule -->
      <article class="card schedule-card">
        <div class="card-heading">
          <div>
            <h2>Work Schedule</h2>
            <p>Your regular work week</p>
          </div>
          <CalendarDays :size="20" class="muted-icon" />
        </div>

        <ul v-if="profile.workDays.length" class="schedule-list">
          <li v-for="shift in profile.workDays" :key="shift.day" :class="{ today: shift.day === weekday(todayKey) }">
            <span>{{ shift.day }}</span>
            <strong>{{ shift.start ? `${requestClock(shift.start)} – ${requestClock(shift.end)}` : 'Rest day' }}</strong>
          </li>
        </ul>
        <p v-else class="footnote">No work schedule is assigned to your profile yet.</p>
      </article>
    </div>

    <!-- History -->
    <article class="card table-card">
      <div class="table-header">
        <div>
          <h2>Attendance History</h2>
          <p>{{ daysLogged }} day(s) logged{{ month ? ' this month' : '' }}. Found a wrong time? Use Report to file a correction.</p>
        </div>
        <label class="month-filter">
          <Clock3 :size="15" />
          <input v-model="month" type="month" :max="todayKey.slice(0, 7)" aria-label="Filter by month">
          <button v-if="month" type="button" @click="month = ''">All</button>
        </label>
      </div>

      <EmployeeAttendanceTable
        :logs="logs"
        :loading="loading"
        :status-label="statusLabel"
        @view="viewLog"
        @report="reportLog"
      />
    </article>

    <!-- Details -->
    <EmployeeRecordDialog
      v-model="detailsOpen"
      title="Attendance Details"
      :subtitle="selected ? formatDate(selected.work_date) : ''"
    >
      <dl v-if="selected" class="record-fields">
        <div><dt>Date</dt><dd>{{ formatDate(selected.work_date) }}</dd></div>
        <div>
          <dt>Status</dt>
          <dd><span class="badge" :class="badgeClass(statusLabel(selected))">{{ statusLabel(selected) }}</span></dd>
        </div>
        <div><dt>Time In</dt><dd>{{ formatTime(selected.time_in) }}</dd></div>
        <div><dt>Time Out</dt><dd>{{ formatTime(selected.time_out) }}</dd></div>
        <div><dt>Hours Worked</dt><dd>{{ hoursText(selected) }}</dd></div>
        <div><dt>Scheduled Shift</dt><dd>{{ shiftText(selected.work_date.slice(0, 10)) }}</dd></div>
        <div v-if="selected.late_minutes"><dt>Late</dt><dd>{{ selected.late_minutes }} min</dd></div>
        <div v-if="selected.undertime_minutes"><dt>Undertime</dt><dd>{{ selected.undertime_minutes }} min</dd></div>
        <div v-if="selected.overtime_minutes"><dt>Overtime</dt><dd>{{ selected.overtime_minutes }} min</dd></div>
        <div><dt>Source</dt><dd class="capitalize">{{ selected.source || '—' }}</dd></div>
        <div v-if="selected.remarks" class="wide"><dt>Remarks</dt><dd>{{ selected.remarks }}</dd></div>
      </dl>
      <template #actions>
        <button v-if="selected" type="button" class="report-button" @click="reportLog(selected)">
          <FileClock :size="14" /> Report an issue
        </button>
      </template>
    </EmployeeRecordDialog>
  </section>
</template>

<style scoped>
/* Page frame: same as the other employee request pages (e.g. Time Log Correction) */
.attendance-page { max-width: 1660px; margin: 0 auto; color: var(--text-primary); }
.page-header, .card-heading, .table-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.page-header { align-items: flex-start; margin-bottom: 22px; }
h1 { margin: 0 0 7px; font-size: 27px; letter-spacing: -.6px; }
h2 { margin: 0 0 6px; font-size: 15px; }
p { margin: 0; color: var(--text-secondary); font-size: 12px; line-height: 1.6; }
.header-actions { display: flex; flex-wrap: wrap; gap: 10px; }
.primary-button, .secondary-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 41px; padding: 10px 17px; border-radius: 9px; font: inherit; font-size: 12px; font-weight: 600; text-decoration: none; white-space: nowrap; cursor: pointer; }
.primary-button { border: 0; background: linear-gradient(135deg, #1f68f2, #2878ff); color: #fff; }
.secondary-button { border: 1px solid var(--border); background: var(--bg-card); color: var(--text-primary); }
.secondary-button:disabled { opacity: .55; cursor: wait; }
.error-message { margin-bottom: 15px; padding: 12px 15px; border-radius: 9px; background: var(--red-soft, #fee2e2); color: var(--red, #b91c1c); }

.card { border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); box-shadow: var(--shadow); }
.top-grid { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 14px; margin-bottom: 18px; }
.today-card, .schedule-card { padding: 18px; }
.card-heading { align-items: flex-start; margin-bottom: 16px; }
.muted-icon { flex-shrink: 0; color: var(--text-muted); }

.punch-summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border: 1px solid var(--border-soft); border-radius: 10px; background: var(--bg-card-soft); }
.punch-summary div { padding: 14px; }
.punch-summary div + div { border-left: 1px solid var(--border-soft); }
.punch-summary span { display: block; color: var(--text-secondary); font-size: 11px; }
.punch-summary strong { display: block; margin-top: 6px; font-size: 18px; font-variant-numeric: tabular-nums; }
.footnote { margin-top: 12px; color: var(--text-muted); font-size: 11px; }
.wfh-note { display: flex; align-items: center; gap: 8px; margin-top: 12px; padding: 10px 12px; border-radius: 8px; background: var(--primary-soft); color: var(--text-secondary); font-size: 12px; }
.wfh-note svg { flex-shrink: 0; color: var(--primary); }
.wfh-note a { color: var(--primary); font-weight: 600; }

.schedule-list { display: grid; gap: 6px; margin: 0; padding: 0; list-style: none; }
.schedule-list li { display: flex; justify-content: space-between; gap: 12px; padding: 8px 10px; border-radius: 8px; font-size: 12px; }
.schedule-list li span { color: var(--text-secondary); }
.schedule-list li.today { background: var(--primary-soft); }
.schedule-list li.today span, .schedule-list li.today strong { color: var(--primary); }

.table-card { overflow: hidden; }
.table-header { padding: 18px; }
.month-filter { display: flex; align-items: center; gap: 8px; padding: 0 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); color: var(--text-muted); }
.month-filter input { height: 38px; border: 0; outline: 0; background: transparent; color: var(--text-primary); font: inherit; font-size: 12px; }
.month-filter button { padding: 3px 8px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-card); color: var(--text-primary); font: inherit; font-size: 11px; cursor: pointer; }

.badge { display: inline-block; padding: 5px 8px; border-radius: 5px; font-size: 10px; font-weight: 600; white-space: nowrap; }
.green { background: var(--green-soft); color: var(--green); }
.orange { background: var(--orange-soft); color: var(--orange); }
.purple { background: var(--purple-soft, rgba(139, 92, 246, .12)); color: var(--purple, #8b5cf6); }
.neutral { background: var(--bg-card-soft); color: var(--text-secondary); }

.record-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin: 0; }
.record-fields dt { color: var(--text-secondary); font-size: 11px; }
.record-fields dd { margin: 5px 0 0; font-size: 13px; font-weight: 600; }
.record-fields .wide { grid-column: 1 / -1; }
.capitalize { text-transform: capitalize; }
.report-button { display: inline-flex; align-items: center; gap: 6px; padding: 9px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--primary-soft); color: var(--primary); font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .spin { animation: none; } }

@media (max-width: 850px) {
  .page-header, .table-header { flex-wrap: wrap; }
  .top-grid { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  h1 { font-size: 22px; line-height: 1.3; }
  .page-header { gap: 14px; }
  .header-actions, .header-actions > * { width: 100%; }
  .table-header, .today-card, .schedule-card { padding: 14px; }
  .punch-summary strong { font-size: 15px; }
  .month-filter { width: 100%; }
  .month-filter input { flex: 1; }
  .record-fields { grid-template-columns: 1fr; }
}
</style>
