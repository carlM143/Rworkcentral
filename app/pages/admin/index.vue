<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  Users,
  UserCheck,
  Clock3,
  UserX,
  House,
  CalendarDays,
  ChevronDown,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-vue-next'
import { useDashboardSummary } from '~/composables/admin/dashboard/useDashboardSummary'
import {
  PENDING_TYPE_STYLE,
  usePendingRequests,
  waitingLabel,
} from '~/composables/admin/dashboard/usePendingRequests'
import { useDashboardPayroll } from '~/composables/admin/dashboard/useDashboardPayroll'
import { useDashboardCharts, type AttendanceRange } from '~/composables/admin/dashboard/useDashboardCharts'
import {
  LEVEL_TONE,
  notificationIcon,
  timeAgo,
  useNotifications,
  type AppNotification,
} from '~/composables/admin/notifications/useNotifications'
import {
  UPCOMING_EVENT_STYLE,
  eventDateLabel,
  useUpcomingEvents,
} from '~/composables/admin/dashboard/useUpcomingEvents'

// =====================================================
// LIVE DATA: SUMMARY CARDS + PENDING REQUESTS
// =====================================================

const router = useRouter()
const { user } = useAuth()
const { summary, loading, error, getSummary } = useDashboardSummary()

const {
  summary: pendingSummary,
  summaryLoading: pendingLoading,
  summaryError: pendingError,
  getSummary: getPendingSummary,
} = usePendingRequests()

const {
  events: upcoming,
  loading: eventsLoading,
  error: eventsError,
  getEvents,
} = useUpcomingEvents()

const EVENT_DAYS = 30

const {
  payroll,
  loaded: payrollLoaded,
  loading: payrollLoading,
  error: payrollError,
  getPayroll,
} = useDashboardPayroll()

// Shares its data with the bell in the top bar.
const {
  latest: latestNotifications,
  loaded: notificationsLoaded,
  error: notificationsError,
  loadSummary: loadNotifications,
  markRead,
} = useNotifications()

const {
  attendance, attendanceLoading, attendanceError, getAttendance,
  headcount, headcountLoading, headcountError, getHeadcount,
} = useDashboardCharts()

const attendanceRange = ref<AttendanceRange>('this_week')
watch(attendanceRange, range => void getAttendance(range))

onMounted(() => {
  void getSummary()
  void getPendingSummary()
  void getEvents(EVENT_DAYS, 6)
  void getPayroll()
  void loadNotifications()
  void getAttendance(attendanceRange.value)
  void getHeadcount(5)
})

// =====================================================
// ATTENDANCE CHART (live)
// =====================================================

const CHART_W = 700
const CHART_H = 220
const CHART_PAD = 15

// Round the highest value up to a clean axis maximum (5, 10, 20, 25, 50, 100...).
const niceMax = (value: number) => {
  if (value <= 5) return 5
  const power = 10 ** Math.floor(Math.log10(value))
  const step = [1, 2, 2.5, 5, 10].find(f => f * power >= value) ?? 10
  return step * power
}

const attendanceChart = computed(() => {
  const days = attendance.value?.days ?? []
  if (!days.length) return null

  const peak = Math.max(...days.map(d => Math.max(d.present ?? 0, d.late ?? 0, d.absent ?? 0, d.scheduled)))
  const max = niceMax(peak)
  const x = (i: number) => (days.length === 1 ? CHART_W / 2 : CHART_PAD + (i * (CHART_W - CHART_PAD * 2)) / (days.length - 1))
  const y = (v: number) => CHART_H - (v / max) * CHART_H

  // Only past and current days are plotted.
  const series = (key: 'present' | 'late' | 'absent') =>
    days
      .map((d, i) => (d[key] === null ? null : { x: x(i), y: y(d[key] as number), value: d[key] as number, day: d }))
      .filter((p): p is NonNullable<typeof p> => p !== null)

  const present = series('present')
  const late = series('late')
  const absent = series('absent')
  const points = (list: typeof present) => list.map(p => `${p.x},${p.y}`).join(' ')

  // Every label for a week; every other label for 14 days.
  const labelEvery = days.length > 7 ? 2 : 1

  return {
    ticks: [5, 4, 3, 2, 1, 0].map(n => Math.round((max / 5) * n)),
    present,
    late,
    absent,
    presentLine: points(present),
    lateLine: points(late),
    absentLine: points(absent),
    labels: days.map((d, i) => ({ text: i % labelEvery === 0 ? d.label : '', holiday: d.is_holiday, title: d.holiday_name })),
    holidays: days
      .map((d, i) => (d.is_holiday ? { x: x(i), name: d.holiday_name } : null))
      .filter((h): h is { x: number, name: string | null } => h !== null),
  }
})

const pointTitle = (label: string, value: number, day: { date: string, scheduled: number, on_leave: number, wfh: number }) =>
  `${label}: ${value} · ${day.date} (scheduled ${day.scheduled}, leave ${day.on_leave}, WFH ${day.wfh})`

// =====================================================
// DEPARTMENT HEADCOUNT (live)
// =====================================================

const DEPT_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#94a3b8']

const headcountView = computed(() => {
  const h = headcount.value
  if (!h || !h.total) return null

  let start = 0
  const stops: string[] = []
  const rows = h.departments.map((d, i) => {
    const color = d.name === 'Others' ? DEPT_COLORS[5]! : DEPT_COLORS[i % 5]!
    const share = (d.count / h.total) * 100
    stops.push(`${color} ${start}% ${start + share}%`)
    start += share
    return { ...d, color }
  })

  return { total: h.total, rows, gradient: `conic-gradient(${stops.join(', ')})` }
})


const recentNotifications = computed(() => latestNotifications.value.slice(0, 4))

const openNotification = async (item: AppNotification) => {
  try {
    await markRead(item)
  } catch {
    // Still navigate.
  }
  if (item.url) await router.push(item.url)
}

// =====================================================
// PAYROLL STATUS (live)
// =====================================================

const shortDate = (date: string, withYear = false) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', ...(withYear ? { year: 'numeric' } : {}) })
    .format(new Date(`${date}T00:00:00`))

const peso = (value: number) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value)

const payrollView = computed(() => {
  const p = payroll.value
  if (!p) return null

  const days = p.period.days_to_payday
  const paydayWhen = days === 0 ? 'today' : days > 0 ? `in ${days} day${days === 1 ? '' : 's'}` : `${Math.abs(days)} day${days === -1 ? '' : 's'} ago`
  const netChange = p.previous && p.previous.net > 0 && p.totals.net > 0
    ? ((p.totals.net - p.previous.net) / p.previous.net) * 100
    : null

  return {
    title: p.period.name,
    cutoff: `${shortDate(p.period.cutoff_start)} – ${shortDate(p.period.cutoff_end, true)}`,
    badge: p.status_label,
    badgeTone: ['draft', 'open', 'review', 'progress', 'paid'][p.step] ?? 'review',
    steps: p.steps.map((label, index) => ({
      label,
      done: index < p.step || (index === p.step && index === p.steps.length - 1),
      current: index === p.step && index !== p.steps.length - 1,
    })),
    employees: `${p.employees.generated} / ${p.employees.active}`,
    employeesNote: p.employees.finalized ? `${p.employees.finalized} finalized` : 'generated',
    net: p.employees.generated ? peso(p.totals.net) : '—',
    netNote: netChange === null ? 'net pay' : `${netChange >= 0 ? '+' : ''}${netChange.toFixed(1)}% vs last cutoff`,
    payday: shortDate(p.period.payment_date),
    paydayNote: paydayWhen,
    action: p.next_action,
  }
})

const display = (value?: number) =>
  loading.value && !summary.value ? '…' : String(value ?? 0)

const percentText = (percent?: number) =>
  `${(percent ?? 0).toFixed(1)}% of total`

const stats = computed(() => {
  const s = summary.value

  return [
    {
      label: 'Total Employees',
      value: display(s?.total_employees.value),
      description: 'Active employees',
      trend: s?.total_employees.new_this_month
        ? `+${s.total_employees.new_this_month} new this month`
        : 'No new employees this month',
      type: 'blue',
      icon: Users,
    },
    {
      label: 'Present Today',
      value: display(s?.present.value),
      description: percentText(s?.present.percent),
      trend: (s?.present.percent ?? 0) >= 90 ? 'Good attendance' : 'Needs attention',
      type: 'green',
      icon: UserCheck,
    },
    {
      label: 'Late',
      value: display(s?.late.value),
      description: percentText(s?.late.percent),
      trend: (s?.late.value ?? 0) > 0 ? 'Needs monitoring' : 'No late employees',
      type: 'orange',
      icon: Clock3,
    },
    {
      label: 'Absent',
      value: display(s?.absent.value),
      description: percentText(s?.absent.percent),
      trend: (s?.absent.value ?? 0) > 0 ? 'Today' : 'No absences',
      type: 'red',
      icon: UserX,
    },
    {
      label: 'WFH / Remote',
      value: display(s?.wfh.value),
      description: percentText(s?.wfh.percent),
      trend: 'Approved today',
      type: 'purple',
      icon: House,
    },
  ]
})

// Pending Requests card (live): one row per request type.
const pendingRequests = computed(() =>
  (pendingSummary.value?.types ?? []).map(t => ({
    ...t,
    icon: PENDING_TYPE_STYLE[t.type].icon,
    color: PENDING_TYPE_STYLE[t.type].color,
    subtitle: t.count
      ? `${t.count} for approval · oldest ${waitingLabel(t.oldest_days).toLowerCase()}`
      : 'Nothing pending',
  })),
)

// A type with pending items opens the filtered View all page; an empty
// type goes straight to its module page.
const openPendingType = (type: string, count: number, url: string) => {
  router.push(count ? `/admin/pending-requests?type=${type}` : url)
}

// =====================================================
// HEADER (greeting + date)
// =====================================================

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})

const firstName = computed(() => {
  const name = user.value?.name?.trim() || ''
  return name.split(/\s+/)[0] || 'there'
})

const todayLabel = computed(() =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    weekday: 'short',
  }).format(new Date()),
)

// =====================================================
// UPCOMING EVENTS (live)
// =====================================================

// Upcoming Events card (live): next 30 days, nearest first.
// Events of the same type on the same day are combined into one row,
// and the person (or holiday) name is the main text.
const SHORT_LABEL: Record<string, [string, string]> = {
  birthday: ['Birthday', 'birthdays'],
  anniversary: ['Work Anniversary', 'work anniversaries'],
  regularization: ['Regularization', 'regularizations'],
  holiday: ['Holiday', 'holidays'],
  milestone: ['Milestone', 'milestones'],
}

const upcomingEvents = computed(() => {
  const groups = new Map<string, NonNullable<typeof upcoming.value>['items']>()

  for (const event of upcoming.value?.items ?? []) {
    const key = `${event.type}|${event.date}`
    groups.set(key, [...(groups.get(key) ?? []), event])
  }

  return [...groups.values()].map((group) => {
    const first = group[0]!
    const [single, plural] = SHORT_LABEL[first.type] ?? [first.label, 'events']
    const names = group.map(e => e.title)

    return {
      key: `${first.type}-${first.date}`,
      days_until: first.days_until,
      icon: UPCOMING_EVENT_STYLE[first.type].icon,
      color: UPCOMING_EVENT_STYLE[first.type].color,
      dateLabel: eventDateLabel(first),
      title: names.length <= 2 ? names.join(', ') : `${names[0]} and ${names.length - 1} others`,
      subtitle: group.length === 1
        ? `${first.type === 'milestone' ? first.label : single} · ${first.detail}`
        : `${group.length} ${plural}`,
      tooltip: group.map(e => `${e.title} — ${e.label}: ${e.detail}`).join('\n'),
    }
  })
})

</script>

<template>
  <section class="dashboard-page">
    <!-- PAGE HEADER -->
    <div class="dashboard-header">
      <div>
        <h1>Dashboard</h1>

        <p class="welcome-text">
          {{ greeting }},
          <strong>{{ firstName }}!</strong>
          👋
        </p>

        <p class="header-subtitle">
          Here's what's happening in your organization today.
        </p>
      </div>

      <div class="header-actions">
        <button class="date-button">
          <span>{{ todayLabel }}</span>
          <CalendarDays :size="17" />
        </button>

        <!-- <button class="quick-action">
          <span class="plus">+</span>
          Quick Action
          <ChevronDown :size="16" />
        </button> -->
      </div>
    </div>

    <!-- API ERROR -->
    <p v-if="error" class="stats-error" role="alert">
      {{ error }}
      <button type="button" @click="getSummary()">Retry</button>
    </p>

    <!-- SUMMARY CARDS -->
    <div class="stats-grid">
      <article v-for="stat in stats" :key="stat.label" class="stat-card">
        <div class="stat-icon" :class="`stat-${stat.type}`">
          <component :is="stat.icon" :size="21" />
        </div>

        <div class="stat-content">
          <p class="stat-label">{{ stat.label }}</p>
          <h2>{{ stat.value }}</h2>
          <p class="stat-description">{{ stat.description }}</p>
          <p class="stat-trend" :class="`trend-${stat.type}`">{{ stat.trend }}</p>
        </div>
      </article>
    </div>

    <!-- MAIN GRID -->
    <div class="dashboard-grid">
      <!-- ATTENDANCE (live) -->
      <article class="dashboard-card attendance-card">
        <div class="card-header">
          <div>
            <h3>Attendance Overview</h3>
            <p>
              Scheduled employees per day
              <template v-if="attendance?.summary.attendance_rate !== null && attendance?.summary.attendance_rate !== undefined">
                · {{ attendance.summary.attendance_rate }}% attendance
              </template>
            </p>
          </div>

          <div class="filter-wrap">
            <select v-model="attendanceRange" class="small-filter" aria-label="Attendance period">
              <option value="this_week">This Week</option>
              <option value="last_week">Last Week</option>
              <option value="last_14_days">Last 14 Days</option>
            </select>
            <ChevronDown :size="14" class="filter-icon" />
          </div>
        </div>

        <div class="legend">
          <span><i class="legend-dot green" /> Present</span>
          <span><i class="legend-dot orange" /> Late</span>
          <span><i class="legend-dot red" /> Absent</span>
          <span v-if="attendanceChart?.holidays.length"><i class="legend-dot holiday" /> Holiday</span>
        </div>

        <p v-if="attendanceError" class="request-empty">
          {{ attendanceError }}
          <button type="button" class="view-all inline" @click="getAttendance(attendanceRange)">Retry</button>
        </p>
        <p v-else-if="attendanceLoading && !attendance" class="request-empty">Loading...</p>

        <div v-else-if="attendanceChart" class="chart-wrapper" :class="{ dimmed: attendanceLoading }">
          <div class="chart-y-axis">
            <span v-for="(tick, i) in attendanceChart.ticks" :key="i">{{ tick }}</span>
          </div>

          <div class="chart-area">
            <div class="grid-line line-1" />
            <div class="grid-line line-2" />
            <div class="grid-line line-3" />
            <div class="grid-line line-4" />
            <div class="grid-line line-5" />

            <svg class="chart-svg" :viewBox="`0 0 ${CHART_W} ${CHART_H}`" preserveAspectRatio="none" role="img" aria-label="Attendance per day">
              <rect
                v-for="h in attendanceChart.holidays"
                :key="h.x"
                class="holiday-band"
                :x="h.x - 14"
                y="0"
                width="28"
                :height="CHART_H"
              >
                <title>{{ h.name }}</title>
              </rect>

              <polyline class="line-present" :points="attendanceChart.presentLine" />
              <polyline class="line-late" :points="attendanceChart.lateLine" />
              <polyline class="line-absent" :points="attendanceChart.absentLine" />

              <g class="chart-points present-points">
                <circle v-for="p in attendanceChart.present" :key="`p-${p.day.date}`" :cx="p.x" :cy="p.y" r="5">
                  <title>{{ pointTitle('Present', p.value, p.day) }}</title>
                </circle>
              </g>
              <g class="chart-points late-points">
                <circle v-for="p in attendanceChart.late" :key="`l-${p.day.date}`" :cx="p.x" :cy="p.y" r="4">
                  <title>{{ pointTitle('Late', p.value, p.day) }}</title>
                </circle>
              </g>
              <g class="chart-points absent-points">
                <circle v-for="p in attendanceChart.absent" :key="`a-${p.day.date}`" :cx="p.x" :cy="p.y" r="4">
                  <title>{{ pointTitle('Absent', p.value, p.day) }}</title>
                </circle>
              </g>
            </svg>

            <div class="x-labels">
              <span v-for="(label, i) in attendanceChart.labels" :key="i" :class="{ holiday: label.holiday }" :title="label.title ?? undefined">
                {{ label.text }}
              </span>
            </div>
          </div>
        </div>
      </article>

      <!-- PENDING REQUESTS (live) -->
      <article class="dashboard-card pending-card">
        <div class="card-header">
          <div>
            <h3>Pending Requests</h3>
            <p>
              Requests waiting for action
              <template v-if="pendingSummary"> · {{ pendingSummary.total }} total</template>
            </p>
          </div>

          <button type="button" class="view-all" @click="router.push('/admin/pending-requests')">
            View all
            <ArrowUpRight :size="14" />
          </button>
        </div>

        <p v-if="pendingError" class="request-empty">
          {{ pendingError }}
          <button type="button" class="view-all inline" @click="getPendingSummary()">Retry</button>
        </p>
        <p v-else-if="pendingLoading && !pendingSummary" class="request-empty">Loading...</p>

        <div v-else class="request-list">
          <button
            v-for="request in pendingRequests"
            :key="request.type"
            type="button"
            class="request-row"
            @click="openPendingType(request.type, request.count, request.url)"
          >
            <div class="request-icon" :class="`request-${request.color}`">
              <component :is="request.icon" :size="17" />
            </div>

            <div class="request-info">
              <strong>{{ request.label }}</strong>
              <span>{{ request.subtitle }}</span>
            </div>

            <span class="request-count" :class="request.count ? `count-${request.color}` : 'count-zero'">
              {{ request.count }}
            </span>
          </button>
        </div>
      </article>

      <!-- PAYROLL (live) -->
      <div class="status-column">
        <article class="dashboard-card status-card">
          <div class="card-header">
            <div>
              <h3>Payroll Status</h3>
              <p>Current payroll cutoff</p>
            </div>

            <button type="button" class="view-all" @click="router.push('/admin/payroll/payroll-period')">
              View all
              <ArrowUpRight :size="14" />
            </button>
          </div>

          <p v-if="payrollError" class="request-empty">
            {{ payrollError }}
            <button type="button" class="view-all inline" @click="getPayroll()">Retry</button>
          </p>
          <p v-else-if="payrollLoading && !payrollLoaded" class="request-empty">Loading...</p>
          <div v-else-if="!payrollView" class="request-empty">
            No payroll period yet.
            <button type="button" class="view-all inline" @click="router.push('/admin/payroll/payroll-period')">Create a pay period</button>
          </div>

          <template v-else>
            <div class="status-box payroll-box">
              <div class="status-box-top">
                <div>
                  <strong>{{ payrollView.title }}</strong>
                  <small class="cutoff">Cutoff {{ payrollView.cutoff }}</small>
                </div>

                <span class="status-badge" :class="payrollView.badgeTone">{{ payrollView.badge }}</span>
              </div>

              <div class="stepper">
                <template v-for="(step, index) in payrollView.steps" :key="step.label">
                  <div v-if="index > 0" class="step-line" :class="{ completed: step.done || step.current }" />
                  <div class="step" :class="{ completed: step.done, current: step.current }">
                    <span>
                      <CheckCircle2 v-if="step.done" :size="18" />
                      <template v-else>{{ index + 1 }}</template>
                    </span>
                    <small>{{ step.label }}</small>
                  </div>
                </template>
              </div>
            </div>

            <div class="payroll-figures">
              <div>
                <span>Employees</span>
                <strong>{{ payrollView.employees }}</strong>
                <small>{{ payrollView.employeesNote }}</small>
              </div>
              <div>
                <span>Net Pay</span>
                <strong>{{ payrollView.net }}</strong>
                <small>{{ payrollView.netNote }}</small>
              </div>
              <div>
                <span>Payday</span>
                <strong>{{ payrollView.payday }}</strong>
                <small>{{ payrollView.paydayNote }}</small>
              </div>
            </div>

            <button type="button" class="next-action" @click="router.push(payrollView.action.url)">
              {{ payrollView.action.label }}
              <ArrowUpRight :size="14" />
            </button>
          </template>
        </article>
      </div>

      <!-- DEPARTMENT (live) -->
      <article class="dashboard-card department-card">
        <div class="card-header">
          <div>
            <h3>Department Headcount</h3>
            <p>
              Workforce distribution
              <template v-if="headcount"> · {{ headcount.department_count }} department{{ headcount.department_count === 1 ? '' : 's' }}</template>
            </p>
          </div>

          <button type="button" class="view-all" @click="router.push('/admin/departments')">
            View all
            <ArrowUpRight :size="14" />
          </button>
        </div>

        <p v-if="headcountError" class="request-empty">
          {{ headcountError }}
          <button type="button" class="view-all inline" @click="getHeadcount(5)">Retry</button>
        </p>
        <p v-else-if="headcountLoading && !headcount" class="request-empty">Loading...</p>
        <p v-else-if="!headcountView" class="request-empty">No active employees yet.</p>

        <div v-else class="department-content">
          <div class="donut-chart" :style="{ background: headcountView.gradient }" role="img" :aria-label="`${headcountView.total} active employees by department`">
            <div class="donut-center">
              <strong>{{ headcountView.total }}</strong>
              <span>Total</span>
            </div>
          </div>

          <div class="department-list">
            <div v-for="department in headcountView.rows" :key="department.name" class="department-row">
              <div class="department-name">
                <span class="department-dot" :style="{ background: department.color }" />
                {{ department.name }}
              </div>

              <div class="department-number">
                <strong>{{ department.count }}</strong>
                <span>{{ department.percent }}%</span>
              </div>
            </div>
          </div>
        </div>
      </article>

      <!-- NOTIFICATIONS (live, same data as the bell) -->
      <article class="dashboard-card notifications-card">
        <div class="card-header">
          <div>
            <h3>Recent Notifications</h3>
            <p>Latest HR activities</p>
          </div>

          <button type="button" class="view-all" @click="router.push('/admin/notifications')">
            View all
            <ArrowUpRight :size="14" />
          </button>
        </div>

        <p v-if="notificationsError && !notificationsLoaded" class="request-empty">
          {{ notificationsError }}
          <button type="button" class="view-all inline" @click="loadNotifications()">Retry</button>
        </p>
        <p v-else-if="!notificationsLoaded" class="request-empty">Loading...</p>
        <p v-else-if="!recentNotifications.length" class="request-empty">
          No notifications yet. New requests, approvals and trip updates will appear here.
        </p>

        <div v-else class="notification-list">
          <button
            v-for="item in recentNotifications"
            :key="item.id"
            type="button"
            class="notification-row"
            @click="openNotification(item)"
          >
            <div class="activity-icon" :class="`request-${LEVEL_TONE[item.level] ?? 'blue'}`">
              <component :is="notificationIcon(item.category)" :size="17" />
            </div>

            <div class="activity-content">
              <strong>{{ item.title }}</strong>
              <span>{{ item.message }}</span>
              <span>{{ timeAgo(item.created_at) }}<template v-if="item.actor"> · {{ item.actor }}</template></span>
            </div>

            <span v-if="!item.read" class="unread-dot" aria-label="Unread" />
          </button>
        </div>
      </article>

      <!-- UPCOMING (live) -->
      <article class="dashboard-card events-card">
        <div class="card-header">
          <div>
            <h3>Upcoming Events</h3>
            <p>
              Next {{ EVENT_DAYS }} days
              <template v-if="upcoming"> · {{ upcoming.total }} event{{ upcoming.total === 1 ? '' : 's' }}</template>
            </p>
          </div>

          <button type="button" class="view-all" @click="router.push('/admin/upcoming-events')">
            View all
            <ArrowUpRight :size="14" />
          </button>
        </div>

        <p v-if="eventsError" class="request-empty">
          {{ eventsError }}
          <button type="button" class="view-all inline" @click="getEvents(EVENT_DAYS, 6)">Retry</button>
        </p>
        <p v-else-if="eventsLoading && !upcoming" class="request-empty">Loading...</p>
        <p v-else-if="!upcomingEvents.length" class="request-empty">
          No birthdays, anniversaries, regularizations or holidays in the next {{ EVENT_DAYS }} days.
        </p>

        <div v-else class="events-list">
          <div v-for="event in upcomingEvents" :key="event.key" class="event-row" :title="event.tooltip">
            <div class="event-icon" :class="`event-${event.color}`">
              <component :is="event.icon" :size="17" />
            </div>

            <div class="event-info">
              <strong>{{ event.title }}</strong>
              <span>{{ event.subtitle }}</span>
            </div>

            <span class="event-date" :class="{ soon: event.days_until <= 1 }">{{ event.dateLabel }}</span>
          </div>

          <button
            v-if="upcoming && upcoming.total > upcoming.items.length"
            type="button"
            class="events-more"
            @click="router.push('/admin/upcoming-events')"
          >
            +{{ upcoming.total - upcoming.items.length }} more in the next {{ EVENT_DAYS }} days
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.dashboard-page { width: 100%; max-width: 1660px; margin: 0 auto; }

/* HEADER */
.dashboard-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 22px; }
.dashboard-header h1 { margin: 0; color: var(--text-primary); font-size: 28px; font-weight: 750; letter-spacing: -0.7px; }
.welcome-text { margin: 6px 0 0; color: var(--text-primary); font-size: 16px; }
.header-subtitle { margin: 4px 0 0; color: var(--text-secondary); font-size: 13px; }
.header-actions { display: flex; align-items: center; gap: 10px; }
.date-button, .quick-action { display: flex; height: 41px; align-items: center; gap: 10px; padding: 0 14px; border-radius: 9px; font-size: 13px; font-weight: 500; }
.date-button { border: 1px solid var(--border); background: var(--bg-card); color: var(--text-secondary); }
.quick-action { border: 0; background: linear-gradient(135deg, #1f68f2, #2878ff); color: white; box-shadow: 0 5px 12px rgba(36, 107, 253, 0.23); }
.quick-action .plus { font-size: 24px; font-weight: 300; }

/* API ERROR */
.stats-error { margin: 0 0 13px; padding: 10px 14px; border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 9px; background: rgba(244, 63, 94, 0.07); color: #fb7185; font-size: 13px; }
.stats-error button { margin-left: 10px; border: 0; background: transparent; color: var(--primary); font-size: 13px; cursor: pointer; }

/* STAT CARDS */
.stats-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 13px; margin-bottom: 13px; }
.stat-card { display: flex; min-height: 132px; gap: 12px; padding: 17px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); box-shadow: var(--shadow); transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease; }
.stat-card:hover { transform: translateY(-2px); border-color: color-mix(in srgb, var(--primary) 25%, var(--border)); }
.stat-icon { display: flex; width: 39px; height: 39px; flex-shrink: 0; align-items: center; justify-content: center; border-radius: 50%; }
.stat-blue { background: var(--primary-soft); color: var(--primary); }
.stat-green { background: var(--green-soft); color: var(--green); }
.stat-orange { background: var(--orange-soft); color: var(--orange); }
.stat-red { background: var(--red-soft); color: var(--red); }
.stat-purple { background: var(--purple-soft); color: var(--purple); }
.stat-label { margin: 2px 0 5px; color: var(--text-secondary); font-size: 13px; font-weight: 500; }
.stat-content h2 { margin: 0 0 5px; color: var(--text-primary); font-size: 28px; line-height: 1; letter-spacing: -0.5px; }
.stat-description, .stat-trend { margin: 0; font-size: 13px; }
.stat-description { color: var(--text-muted); }
.stat-trend { margin-top: 9px; }
.trend-blue { color: var(--primary); }
.trend-green { color: var(--green); }
.trend-orange { color: var(--orange); }
.trend-red { color: var(--red); }
.trend-purple { color: var(--purple); }

/* DASHBOARD GRID */
.dashboard-grid { display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(285px, 0.95fr) minmax(320px, 1.05fr); gap: 13px; }
.dashboard-card { border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); box-shadow: var(--shadow); }
.card-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 16px 17px 13px; }
.card-header h3 { margin: 0; color: var(--text-primary); font-size: 16px; font-weight: 700; letter-spacing: -0.15px; }
.card-header p { margin: 4px 0 0; color: var(--text-muted); font-size: 12px; }
.view-all, .small-filter { display: flex; align-items: center; gap: 5px; border: 0; background: transparent; color: var(--primary); font-size: 13px; font-weight: 500; }
.view-all:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; border-radius: 4px; }
.small-filter { padding: 7px 9px; border: 1px solid var(--border); border-radius: 7px; color: var(--text-secondary); }
.filter-wrap { position: relative; }
select.small-filter { padding-right: 26px; background: var(--bg-card); font-family: inherit; appearance: none; cursor: pointer; }
select.small-filter:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.filter-icon { position: absolute; top: 50%; right: 8px; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
.legend-dot.holiday { border-radius: 2px; background: color-mix(in srgb, var(--purple) 35%, transparent); }
.holiday-band { fill: color-mix(in srgb, var(--purple) 12%, transparent); }
.x-labels span.holiday { color: var(--purple); font-weight: 700; }
.dimmed { opacity: 0.6; }

/* ATTENDANCE */
.attendance-card { min-height: 360px; }
.legend { display: flex; gap: 22px; padding: 0 18px 10px; color: var(--text-secondary); font-size: 12px; }
.legend span { display: flex; align-items: center; gap: 6px; }
.legend-dot { width: 7px; height: 7px; border-radius: 100%; }
.legend-dot.green { background: var(--green); }
.legend-dot.orange { background: var(--orange); }
.legend-dot.red { background: var(--red); }
.chart-wrapper { display: flex; height: 245px; padding: 8px 18px 15px 14px; }
.chart-y-axis { display: flex; width: 33px; flex-direction: column; justify-content: space-between; padding-bottom: 25px; color: var(--text-muted); font-size: 12px; }
.chart-area { position: relative; flex: 1; }
.grid-line { position: absolute; left: 0; right: 0; height: 1px; background: var(--border-soft); }
.line-1 { top: 0; }
.line-2 { top: 20%; }
.line-3 { top: 40%; }
.line-4 { top: 60%; }
.line-5 { top: 80%; }
.chart-svg { position: absolute; inset: 0 0 26px; width: 100%; height: calc(100% - 26px); overflow: visible; }
.chart-svg polyline { fill: none; stroke-width: 2.2; vector-effect: non-scaling-stroke; }
.line-present { stroke: var(--green); }
.line-late { stroke: var(--orange); }
.line-absent { stroke: var(--red); }
.present-points { fill: var(--green); }
.late-points { fill: var(--orange); }
.absent-points { fill: var(--red); }
.x-labels { position: absolute; right: -5px; bottom: 0; left: -4px; display: flex; justify-content: space-between; color: var(--text-muted); font-size: 12px; }

/* REQUESTS */
.pending-card { min-height: 360px; }
.request-list { padding: 0 16px 9px; }
.request-row { display: flex; min-height: 52px; align-items: center; gap: 10px; border-bottom: 1px solid var(--border-soft); }
.request-row:last-child { border-bottom: 0; }

/* Rows are buttons now (clickable). */
button.request-row { width: 100%; padding: 0 4px; border-top: 0; border-right: 0; border-left: 0; background: transparent; color: inherit; font-family: inherit; text-align: left; cursor: pointer; }
button.request-row:hover { background: var(--bg-card-soft); }
button.request-row:focus-visible { outline: 2px solid var(--primary); outline-offset: -2px; }

.request-icon, .activity-icon, .event-icon { display: flex; width: 34px; height: 34px; flex-shrink: 0; align-items: center; justify-content: center; border-radius: 50%; }
.request-green, .event-green { background: var(--green-soft); color: var(--green); }
.request-orange, .event-orange { background: var(--orange-soft); color: var(--orange); }
.request-purple, .event-purple { background: var(--purple-soft); color: var(--purple); }
.request-blue, .event-blue { background: var(--primary-soft); color: var(--primary); }
.request-red { background: var(--red-soft); color: var(--red); }
.request-info, .activity-content, .event-info { min-width: 0; flex: 1; }
.request-info strong, .activity-content strong, .event-info strong { display: block; color: var(--text-primary); font-size: 13px; font-weight: 600; }
.request-info span, .activity-content span, .event-info span { display: block; margin-top: 3px; color: var(--text-muted); font-size: 12px; }
.request-count { font-size: 13px; font-weight: 700; }
.count-green { color: var(--green); }
.count-orange { color: var(--orange); }
.count-purple { color: var(--purple); }
.count-blue { color: var(--primary); }
.count-red { color: var(--red); }
.count-zero { color: var(--text-muted); }
.request-empty { margin: 0; padding: 18px; color: var(--text-muted); font-size: 13px; }
.view-all.inline { display: inline-flex; margin-left: 6px; }

/* STATUS */
.status-column { display: flex; flex-direction: column; gap: 13px; }
.status-card { flex: 1; }
.status-box { margin: 0 14px 14px; padding: 12px; border-radius: 9px; }
.payroll-box { border: 1px solid color-mix(in srgb, var(--green) 20%, var(--border)); background: color-mix(in srgb, var(--green-soft) 60%, var(--bg-card)); }
.status-box-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.status-box-top strong { color: var(--text-primary); font-size: 12px; }
.status-badge { padding: 4px 7px; border-radius: 5px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
.status-badge.review { background: var(--green-soft); color: var(--green); }
.status-badge.draft { background: var(--bg-card-soft); color: var(--text-secondary); }
.status-badge.open { background: var(--primary-soft); color: var(--primary); }
.status-badge.progress { background: var(--orange-soft); color: var(--orange); }
.status-badge.paid { background: var(--green-soft); color: var(--green); }
.status-box-top .cutoff { display: block; margin-top: 3px; color: var(--text-muted); font-size: 12px; }
.step.current > span { border-color: var(--primary); background: var(--primary-soft); color: var(--primary); }
.step.current small { color: var(--primary); font-weight: 700; }
.payroll-figures { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin: 0 14px 12px; }
.payroll-figures div { padding: 10px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-card-soft); }
.payroll-figures span { display: block; color: var(--text-muted); font-size: 12px; }
.payroll-figures strong { display: block; margin-top: 4px; color: var(--text-primary); font-size: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.payroll-figures small { display: block; margin-top: 3px; color: var(--text-secondary); font-size: 12px; }
.next-action { display: flex; width: calc(100% - 28px); align-items: center; justify-content: center; gap: 6px; margin: 0 14px 14px; padding: 9px; border: 1px dashed color-mix(in srgb, var(--primary) 45%, var(--border)); border-radius: 9px; background: transparent; color: var(--primary); font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
.next-action:hover { background: var(--primary-soft); }
.next-action:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.stepper { display: flex; align-items: flex-start; margin-top: 22px; }
.step { position: relative; display: flex; width: 38px; flex-shrink: 0; flex-direction: column; align-items: center; }
.step > span { position: relative; z-index: 2; display: flex; width: 22px; height: 22px; align-items: center; justify-content: center; border: 1px solid var(--border); border-radius: 50%; background: var(--bg-card); color: var(--text-muted); font-size: 12px; font-weight: 600; }
.step.completed > span { border-color: var(--green); background: var(--green); color: white; }
.step small { margin-top: 7px; color: var(--text-muted); font-size: 10px; white-space: nowrap; }
.step.completed small { color: var(--text-primary); }
.step-line { height: 2px; flex: 1; margin-top: 10px; background: var(--border); }
.step-line.completed { background: var(--green); }

/* DEPARTMENT */
.department-card, .notifications-card, .events-card { min-height: 300px; }
.department-content { display: flex; align-items: center; gap: 22px; padding: 15px 18px 22px; }
.donut-chart { position: relative; display: flex; width: 150px; height: 150px; flex-shrink: 0; align-items: center; justify-content: center; border-radius: 50%; background: conic-gradient(#3b82f6 0 33.6%, #22c55e 33.6% 50%, #f59e0b 50% 60.9%, #8b5cf6 60.9% 70.3%, #ec4899 70.3% 78.9%, #d5dae3 78.9% 100%); }
.donut-chart::after { content: ""; position: absolute; width: 92px; height: 92px; border-radius: 50%; background: var(--bg-card); }
.donut-center { position: relative; z-index: 2; text-align: center; }
.donut-center strong { display: block; color: var(--text-primary); font-size: 24px; }
.donut-center span { color: var(--text-muted); font-size: 12px; }
.department-list { flex: 1; }
.department-row { display: flex; align-items: center; justify-content: space-between; padding: 5px 0; }
.department-name { display: flex; align-items: center; gap: 7px; color: var(--text-secondary); font-size: 12px; }
.department-dot { width: 7px; height: 7px; border-radius: 2px; }
.dept-blue { background: #3b82f6; }
.dept-green { background: #22c55e; }
.dept-orange { background: #f59e0b; }
.dept-purple { background: #8b5cf6; }
.dept-pink { background: #ec4899; }
.dept-gray { background: #d5dae3; }
.department-number { display: flex; gap: 6px; font-size: 12px; }
.department-number strong { color: var(--text-primary); }
.department-number span { color: var(--text-muted); }

/* NOTIFICATIONS */
.notification-list, .events-list { padding: 0 16px 10px; }
.notification-row, .event-row { display: flex; min-height: 53px; align-items: center; gap: 10px; border-bottom: 1px solid var(--border-soft); }
.notification-row:last-child, .event-row:last-child { border-bottom: 0; }
.activity-success { background: var(--green-soft); color: var(--green); }
.activity-warning { background: var(--orange-soft); color: var(--orange); }
.activity-purple { background: var(--purple-soft); color: var(--purple); }
.activity-danger { background: var(--red-soft); color: var(--red); }
button.notification-row { width: 100%; padding: 6px 4px; border-top: 0; border-right: 0; border-left: 0; background: transparent; color: inherit; font-family: inherit; text-align: left; cursor: pointer; }
button.notification-row:hover { background: var(--bg-card-soft); }
button.notification-row:focus-visible { outline: 2px solid var(--primary); outline-offset: -2px; }
.activity-content span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.unread-dot { width: 5px; height: 5px; flex-shrink: 0; border-radius: 100%; background: var(--primary); }

/* EVENTS */
.event-date { color: var(--text-secondary); font-size: 12px; white-space: nowrap; }
.event-date.soon { color: var(--primary); font-weight: 700; }
.event-red { background: var(--red-soft); color: var(--red); }
.events-more { display: block; width: 100%; margin: 8px 0 0; padding: 6px; border: 0; border-radius: 6px; background: transparent; color: var(--primary); font-family: inherit; font-size: 12px; font-weight: 600; text-align: center; cursor: pointer; }
.events-more:hover { background: var(--bg-card-soft); }
.events-more:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }

/* RESPONSIVE */
@media (max-width: 1400px) {
  .stats-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .dashboard-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .status-column { grid-column: span 2; display: grid; grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 920px) {
  .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .dashboard-grid { grid-template-columns: 1fr; }
  .status-column { grid-column: auto; grid-template-columns: 1fr; }
}

@media (max-width: 650px) {
  .dashboard-header { flex-direction: column; gap: 16px; }
  .header-actions { width: 100%; }
  .date-button, .quick-action { flex: 1; justify-content: center; }
  .stats-grid { grid-template-columns: 1fr; }
  .department-content { flex-direction: column; }
  .department-list { width: 100%; }
}

@media (max-width: 440px) {
  .header-actions { flex-direction: column; }
  .date-button, .quick-action { width: 100%; }
}
</style>