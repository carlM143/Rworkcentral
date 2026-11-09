<script setup lang="ts">
import { ArrowLeft, CalendarClock, CalendarDays, Clock3, History, Pencil, Users } from 'lucide-vue-next'
import { normalizeScheduleDayName, WORK_SCHEDULE_DAYS } from '~/types/workSchedule'
import type { WorkScheduleDayName } from '~/types/workSchedule'

definePageMeta({ layout: 'admin' })
useHead({ title: 'View Work Schedule | RWorkCentral' })

type BooleanValue = boolean | number | string | null | undefined

interface DayFromApi {
  day_of_week: string
  is_working_day?: BooleanValue
  time_in?: string | null
  time_out?: string | null
}

interface RevisionFromApi {
  id: number
  effective_from: string
  effective_to?: string | null
  required_work_hours: string | number
  grace_period: string | number
  reason?: string | null
  applied_at?: string | null
  days?: DayFromApi[] | null
}

interface ScheduleFromApi {
  id: number
  schedule_name: string
  schedule_code: string
  schedule_type_id: number
  schedule_type?: { id: number; type_name: string } | null
  required_work_hours: string | number
  grace_period: string | number
  status: BooleanValue
  employments_count?: number
  created_at?: string | null
  updated_at?: string | null
  days?: DayFromApi[] | null
  current_revision?: RevisionFromApi | null
  upcoming_revision?: RevisionFromApi | null
  revisions?: RevisionFromApi[] | null
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

interface DayView {
  day: WorkScheduleDayName
  working: boolean
  timeIn: string
  timeOut: string
}

const route = useRoute()
const router = useRouter()
const { $api } = useNuxtApp()
const { error: showError } = useToast()

const scheduleId = computed(() => Number(route.params.id))
const loading = ref(true)
const pageError = ref('')
const schedule = ref<ScheduleFromApi | null>(null)

const isTrue = (value: BooleanValue) =>
  value === true || value === 1 || value === '1' || value === 'true'

const localToday = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

const formatDate = (value: string | null | undefined) => {
  const match = String(value ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return '—'
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatTime = (value: string | null | undefined) => {
  const match = String(value ?? '').match(/^(\d{1,2}):(\d{2})/)
  if (!match) return '—'
  const hours = Number(match[1])
  return `${hours % 12 || 12}:${match[2]} ${hours >= 12 ? 'PM' : 'AM'}`
}

// API stores only working days; missing days are rest days.
const toWeek = (days: DayFromApi[] | null | undefined): DayView[] => {
  const saved = new Map<WorkScheduleDayName, DayFromApi>()
  for (const item of Array.isArray(days) ? days : []) {
    const name = normalizeScheduleDayName(item.day_of_week)
    if (name) saved.set(name, item)
  }
  return WORK_SCHEDULE_DAYS.map(day => {
    const item = saved.get(day)
    const working = Boolean(item) && (item?.is_working_day == null || isTrue(item.is_working_day))
    return {
      day,
      working,
      timeIn: working ? formatTime(item?.time_in) : '',
      timeOut: working ? formatTime(item?.time_out) : '',
    }
  })
}

const workingSummary = (days: DayView[]) => {
  const count = days.filter(d => d.working).length
  return `${count} working · ${7 - count} rest`
}

const currentWeek = computed(() => toWeek(schedule.value?.days))
const upcoming = computed(() => schedule.value?.upcoming_revision ?? null)
const upcomingWeek = computed(() => toWeek(upcoming.value?.days))

const typeName = computed(() =>
  schedule.value?.schedule_type?.type_name || `Schedule type #${schedule.value?.schedule_type_id ?? ''}`,
)
const active = computed(() => isTrue(schedule.value?.status))

const history = computed(() =>
  [...(schedule.value?.revisions ?? [])].sort((a, b) =>
    String(b.effective_from).localeCompare(String(a.effective_from))),
)

const revisionState = (revision: RevisionFromApi) => {
  if (String(revision.effective_from).slice(0, 10) > localToday()) return 'Upcoming'
  if (revision.id === schedule.value?.current_revision?.id) return 'Current'
  return 'Past'
}

const revisionDaysText = (revision: RevisionFromApi) =>
  toWeek(revision.days)
    .filter(d => d.working)
    .map(d => `${d.day.slice(0, 3)} ${d.timeIn}–${d.timeOut}`)
    .join(', ') || 'No working days'

const messageFromError = (problem: any): string => {
  const data = problem?.data ?? problem?.response?._data ?? {}
  return String(data.message ?? problem?.message ?? 'An unexpected error occurred.')
}

const loadSchedule = async () => {
  loading.value = true
  pageError.value = ''
  schedule.value = null

  if (!Number.isInteger(scheduleId.value) || scheduleId.value < 1) {
    pageError.value = 'Invalid work schedule ID.'
    loading.value = false
    return
  }

  try {
    const response = await $api<ApiResponse<ScheduleFromApi>>(
      `/admin/work-schedules/${scheduleId.value}`,
      { method: 'GET' },
    )
    if (!response?.success || !response?.data?.id) {
      throw new Error(response?.message || 'Work schedule not found.')
    }
    schedule.value = response.data
  } catch (problem) {
    pageError.value = messageFromError(problem)
    showError('Could Not Load Work Schedule', pageError.value)
  } finally {
    loading.value = false
  }
}

onMounted(loadSchedule)
watch(scheduleId, loadSchedule)
</script>

<template>
  <section class="schedule-page">
    <button type="button" class="back-button" @click="router.push('/admin/work-schedules')">
      <ArrowLeft :size="15" /> Back to Work Schedules
    </button>

    <div v-if="loading" class="page-message">Loading work schedule...</div>
    <div v-else-if="pageError" class="page-message error-message">{{ pageError }}</div>

    <template v-else-if="schedule">
      <header class="view-header">
        <div class="title-block">
          <div class="title-row">
            <h1>{{ schedule.schedule_name }}</h1>
            <span class="status-pill" :class="active ? 'active' : 'inactive'">{{ active ? 'Active' : 'Inactive' }}</span>
          </div>
          <p>{{ schedule.schedule_code }} · {{ typeName }}</p>
        </div>
        <button type="button" class="primary-button" @click="router.push(`/admin/work-schedules/${schedule.id}/edit`)">
          <Pencil :size="15" /> Change Schedule
        </button>
      </header>

      <div class="stat-grid">
        <div class="stat-card">
          <Clock3 :size="17" />
          <div><span>Required Hours</span><strong>{{ Number(schedule.required_work_hours) }} hrs</strong></div>
        </div>
        <div class="stat-card">
          <CalendarClock :size="17" />
          <div><span>Grace Period</span><strong>{{ Number(schedule.grace_period) }} min</strong></div>
        </div>
        <div class="stat-card">
          <CalendarDays :size="17" />
          <div><span>Working Days</span><strong>{{ workingSummary(currentWeek) }}</strong></div>
        </div>
        <div class="stat-card">
          <Users :size="17" />
          <div><span>Assigned Employees</span><strong>{{ schedule.employments_count ?? 0 }}</strong></div>
        </div>
      </div>

      <section class="card">
        <div class="section-heading">
          <div>
            <h2>Current Schedule</h2>
            <p>
              In effect since {{ formatDate(schedule.current_revision?.effective_from) }}<template v-if="schedule.current_revision?.reason"> · {{ schedule.current_revision.reason }}</template>
            </p>
          </div>
        </div>
        <div class="week-grid">
          <div v-for="day in currentWeek" :key="day.day" class="day-cell" :class="{ rest: !day.working }">
            <span class="day-name">{{ day.day }}</span>
            <strong v-if="day.working">{{ day.timeIn }} – {{ day.timeOut }}</strong>
            <em v-else>Rest Day</em>
          </div>
        </div>
      </section>

      <section v-if="upcoming" class="card upcoming-card">
        <div class="section-heading">
          <div>
            <h2>Upcoming Change</h2>
            <p>
              Takes effect on <strong>{{ formatDate(upcoming.effective_from) }}</strong>
              · {{ Number(upcoming.required_work_hours) }} hrs · {{ Number(upcoming.grace_period) }} min grace
              <template v-if="upcoming.reason"> · {{ upcoming.reason }}</template>
            </p>
          </div>
        </div>
        <div class="week-grid">
          <div v-for="day in upcomingWeek" :key="day.day" class="day-cell" :class="{ rest: !day.working }">
            <span class="day-name">{{ day.day }}</span>
            <strong v-if="day.working">{{ day.timeIn }} – {{ day.timeOut }}</strong>
            <em v-else>Rest Day</em>
          </div>
        </div>
      </section>

      <section class="card">
        <div class="section-heading">
          <History :size="17" class="muted-icon" />
          <div><h2>Schedule History</h2><p>Every dated change to hours, grace period and working days.</p></div>
        </div>

        <p v-if="!history.length" class="empty">No schedule changes recorded yet.</p>
        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Effective</th>
                <th>Hours</th>
                <th>Grace</th>
                <th>Working Days</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="revision in history" :key="revision.id">
                <td class="nowrap">
                  {{ formatDate(revision.effective_from) }}
                  <small v-if="revision.effective_to">to {{ formatDate(revision.effective_to) }}</small>
                </td>
                <td>{{ Number(revision.required_work_hours) }} hrs</td>
                <td>{{ Number(revision.grace_period) }} min</td>
                <td class="days-text">{{ revisionDaysText(revision) }}</td>
                <td>{{ revision.reason || '—' }}</td>
                <td><span class="state-pill" :class="revisionState(revision).toLowerCase()">{{ revisionState(revision) }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </section>
</template>

<style scoped>
.schedule-page{width:100%;max-width:1200px;margin:0 auto;padding-bottom:28px;display:grid;gap:13px}
.back-button{justify-self:start;display:inline-flex;align-items:center;gap:6px;padding:0;border:0;background:transparent;color:var(--primary);font:inherit;font-size:11px;font-weight:600;cursor:pointer}
.page-message{display:grid;min-height:160px;place-items:center;border:1px solid var(--border);border-radius:12px;background:var(--bg-card);color:var(--text-muted);font-size:12px}
.error-message{color:var(--red,#ef4444)}
.view-header{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap}
.title-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.title-block h1{margin:0;font-size:20px;font-weight:700;color:var(--text-primary)}
.title-block p{margin:5px 0 0;font-size:12px;color:var(--text-secondary)}
.status-pill,.state-pill{display:inline-flex;align-items:center;padding:3px 9px;border-radius:999px;font-size:10px;font-weight:700}
.status-pill.active,.state-pill.current{background:#16a34a1f;color:#16a34a}
.status-pill.inactive,.state-pill.past{background:color-mix(in srgb,var(--text-muted) 16%,transparent);color:var(--text-muted)}
.state-pill.upcoming{background:#2563eb1f;color:#3b82f6}
.primary-button{display:inline-flex;align-items:center;gap:7px;min-height:38px;padding:0 15px;border:1px solid var(--primary);border-radius:8px;background:var(--primary);color:#fff;font:inherit;font-size:12px;font-weight:650;cursor:pointer}
.stat-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.stat-card{display:flex;align-items:center;gap:11px;padding:14px;border:1px solid var(--border);border-radius:12px;background:var(--bg-card);color:var(--primary)}
.stat-card span{display:block;font-size:10px;color:var(--text-secondary)}
.stat-card strong{display:block;margin-top:3px;font-size:13px;color:var(--text-primary)}
.card{padding:18px;border:1px solid var(--border);border-radius:12px;background:var(--bg-card);min-width:0}
.upcoming-card{border-color:#3b82f655}
.section-heading{display:flex;align-items:flex-start;gap:10px;margin-bottom:14px}
.section-heading h2{margin:0;font-size:14px;font-weight:700;color:var(--text-primary)}
.section-heading p{margin:4px 0 0;font-size:11px;color:var(--text-secondary)}
.muted-icon{margin-top:1px;color:var(--text-muted)}
.week-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px}
.day-cell{display:grid;gap:6px;padding:11px;border:1px solid var(--border);border-radius:9px;background:var(--bg-card-soft)}
.day-cell.rest{opacity:.65}
.day-name{font-size:11px;font-weight:700;color:var(--text-primary)}
.day-cell strong{font-size:11px;font-weight:600;color:var(--text-primary)}
.day-cell em{font-size:11px;font-style:normal;color:var(--text-muted)}
.table-wrap{overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:11px}
th{padding:9px 10px;border-bottom:1px solid var(--border);text-align:left;font-weight:650;color:var(--text-secondary);white-space:nowrap}
td{padding:10px;border-bottom:1px solid var(--border);color:var(--text-primary);vertical-align:top}
tr:last-child td{border-bottom:0}
td small{display:block;margin-top:3px;color:var(--text-muted)}
.nowrap{white-space:nowrap}
.days-text{min-width:240px;color:var(--text-secondary)}
.empty{margin:0;font-size:11px;color:var(--text-muted)}
@media(max-width:1000px){.stat-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.week-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media(max-width:600px){.stat-grid,.week-grid{grid-template-columns:1fr 1fr}.primary-button{width:100%;justify-content:center}}
</style>
