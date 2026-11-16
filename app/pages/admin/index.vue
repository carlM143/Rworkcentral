<script setup lang="ts">
import { computed, onMounted } from 'vue'
import {
  Users,
  UserCheck,
  Clock3,
  UserX,
  House,
  CalendarDays,
  ChevronDown,
  ArrowUpRight,
  Umbrella,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-vue-next'
import { useDashboardSummary } from '~/composables/admin/dashboard/useDashboardSummary'
import {
  PENDING_TYPE_STYLE,
  usePendingRequests,
  waitingLabel,
} from '~/composables/admin/dashboard/usePendingRequests'
import { useDashboardPayroll } from '~/composables/admin/dashboard/useDashboardPayroll'
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

onMounted(() => {
  void getSummary()
  void getPendingSummary()
  void getEvents(EVENT_DAYS, 6)
  void getPayroll()
})

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
// MOCK DATA (not yet connected)
// =====================================================

const departments = [
  { name: 'Operations', count: 86, percent: 33.6, className: 'dept-blue' },
  { name: 'Finance', count: 42, percent: 16.4, className: 'dept-green' },
  { name: 'HR', count: 28, percent: 10.9, className: 'dept-orange' },
  { name: 'IT', count: 24, percent: 9.4, className: 'dept-purple' },
  { name: 'Sales', count: 22, percent: 8.6, className: 'dept-pink' },
  { name: 'Others', count: 54, percent: 21.1, className: 'dept-gray' },
]

const notifications = [
  {
    title: 'Time log correction request approved',
    meta: 'Juan Dela Cruz · May 26, 2026 9:15 AM',
    type: 'success',
    icon: CheckCircle2,
  },
  {
    title: 'Overtime request for May 27 approved',
    meta: 'Maria Reyes · May 26, 2026 8:45 AM',
    type: 'warning',
    icon: Clock3,
  },
  {
    title: 'Leave request for May 29–30 pending',
    meta: 'Pedro Santos · May 26, 2026 8:30 AM',
    type: 'purple',
    icon: Umbrella,
  },
  {
    title: 'Missing time out detected',
    meta: '5 employees affected · May 26, 2026 8:00 AM',
    type: 'danger',
    icon: AlertTriangle,
  },
]

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

        <button class="quick-action">
          <span class="plus">+</span>
          Quick Action
          <ChevronDown :size="16" />
        </button>
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
      <!-- ATTENDANCE -->
      <article class="dashboard-card attendance-card">
        <div class="card-header">
          <div>
            <h3>Attendance Overview</h3>
            <p>Weekly attendance performance</p>
          </div>

          <button class="small-filter">
            This Week
            <ChevronDown :size="14" />
          </button>
        </div>

        <div class="legend">
          <span><i class="legend-dot green" /> Present</span>
          <span><i class="legend-dot orange" /> Late</span>
          <span><i class="legend-dot red" /> Absent</span>
        </div>

        <!-- MOCK CHART -->
        <div class="chart-wrapper">
          <div class="chart-y-axis">
            <span>250</span>
            <span>200</span>
            <span>150</span>
            <span>100</span>
            <span>50</span>
            <span>0</span>
          </div>

          <div class="chart-area">
            <div class="grid-line line-1" />
            <div class="grid-line line-2" />
            <div class="grid-line line-3" />
            <div class="grid-line line-4" />
            <div class="grid-line line-5" />

            <svg class="chart-svg" viewBox="0 0 700 220" preserveAspectRatio="none">
              <polyline class="line-present" points="15,64 125,55 235,47 345,68 455,56 565,86 675,140" />
              <polyline class="line-late" points="15,174 125,170 235,176 345,168 455,171 565,182 675,189" />
              <polyline class="line-absent" points="15,186 125,183 235,184 345,185 455,187 565,190 675,193" />

              <g class="chart-points present-points">
                <circle cx="15" cy="64" r="5" />
                <circle cx="125" cy="55" r="5" />
                <circle cx="235" cy="47" r="5" />
                <circle cx="345" cy="68" r="5" />
                <circle cx="455" cy="56" r="5" />
                <circle cx="565" cy="86" r="5" />
                <circle cx="675" cy="140" r="5" />
              </g>

              <g class="chart-points late-points">
                <circle cx="15" cy="174" r="4" />
                <circle cx="125" cy="170" r="4" />
                <circle cx="235" cy="176" r="4" />
                <circle cx="345" cy="168" r="4" />
                <circle cx="455" cy="171" r="4" />
                <circle cx="565" cy="182" r="4" />
                <circle cx="675" cy="189" r="4" />
              </g>

              <g class="chart-points absent-points">
                <circle cx="15" cy="186" r="4" />
                <circle cx="125" cy="183" r="4" />
                <circle cx="235" cy="184" r="4" />
                <circle cx="345" cy="185" r="4" />
                <circle cx="455" cy="187" r="4" />
                <circle cx="565" cy="190" r="4" />
                <circle cx="675" cy="193" r="4" />
              </g>
            </svg>

            <div class="x-labels">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
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

      <!-- DEPARTMENT -->
      <article class="dashboard-card department-card">
        <div class="card-header">
          <div>
            <h3>Department Headcount</h3>
            <p>Workforce distribution</p>
          </div>

          <button class="view-all">View all</button>
        </div>

        <div class="department-content">
          <div class="donut-chart">
            <div class="donut-center">
              <strong>256</strong>
              <span>Total</span>
            </div>
          </div>

          <div class="department-list">
            <div v-for="department in departments" :key="department.name" class="department-row">
              <div class="department-name">
                <span class="department-dot" :class="department.className" />
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

      <!-- NOTIFICATIONS -->
      <article class="dashboard-card notifications-card">
        <div class="card-header">
          <div>
            <h3>Recent Notifications</h3>
            <p>Latest HR activities</p>
          </div>

          <button class="view-all">View all</button>
        </div>

        <div class="notification-list">
          <div v-for="item in notifications" :key="item.title" class="notification-row">
            <div class="activity-icon" :class="`activity-${item.type}`">
              <component :is="item.icon" :size="17" />
            </div>

            <div class="activity-content">
              <strong>{{ item.title }}</strong>
              <span>{{ item.meta }}</span>
            </div>

            <span class="unread-dot" />
          </div>
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
.dashboard-header h1 { margin: 0; color: var(--text-primary); font-size: 27px; font-weight: 750; letter-spacing: -0.7px; }
.welcome-text { margin: 6px 0 0; color: var(--text-primary); font-size: 14px; }
.header-subtitle { margin: 4px 0 0; color: var(--text-secondary); font-size: 12px; }
.header-actions { display: flex; align-items: center; gap: 10px; }
.date-button, .quick-action { display: flex; height: 41px; align-items: center; gap: 10px; padding: 0 14px; border-radius: 9px; font-size: 12px; font-weight: 500; }
.date-button { border: 1px solid var(--border); background: var(--bg-card); color: var(--text-secondary); }
.quick-action { border: 0; background: linear-gradient(135deg, #1f68f2, #2878ff); color: white; box-shadow: 0 5px 12px rgba(36, 107, 253, 0.23); }
.quick-action .plus { font-size: 20px; font-weight: 300; }

/* API ERROR */
.stats-error { margin: 0 0 13px; padding: 10px 14px; border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 9px; background: rgba(244, 63, 94, 0.07); color: #fb7185; font-size: 12px; }
.stats-error button { margin-left: 10px; border: 0; background: transparent; color: var(--primary); font-size: 12px; cursor: pointer; }

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
.stat-label { margin: 2px 0 5px; color: var(--text-secondary); font-size: 11px; font-weight: 500; }
.stat-content h2 { margin: 0 0 5px; color: var(--text-primary); font-size: 24px; line-height: 1; letter-spacing: -0.5px; }
.stat-description, .stat-trend { margin: 0; font-size: 10px; }
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
.card-header h3 { margin: 0; color: var(--text-primary); font-size: 14px; font-weight: 700; letter-spacing: -0.15px; }
.card-header p { margin: 4px 0 0; color: var(--text-muted); font-size: 9px; }
.view-all, .small-filter { display: flex; align-items: center; gap: 5px; border: 0; background: transparent; color: var(--primary); font-size: 10px; font-weight: 500; }
.view-all:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; border-radius: 4px; }
.small-filter { padding: 7px 9px; border: 1px solid var(--border); border-radius: 7px; color: var(--text-secondary); }

/* ATTENDANCE */
.attendance-card { min-height: 360px; }
.legend { display: flex; gap: 22px; padding: 0 18px 10px; color: var(--text-secondary); font-size: 9px; }
.legend span { display: flex; align-items: center; gap: 6px; }
.legend-dot { width: 7px; height: 7px; border-radius: 100%; }
.legend-dot.green { background: var(--green); }
.legend-dot.orange { background: var(--orange); }
.legend-dot.red { background: var(--red); }
.chart-wrapper { display: flex; height: 245px; padding: 8px 18px 15px 14px; }
.chart-y-axis { display: flex; width: 33px; flex-direction: column; justify-content: space-between; padding-bottom: 25px; color: var(--text-muted); font-size: 8px; }
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
.x-labels { position: absolute; right: -5px; bottom: 0; left: -4px; display: flex; justify-content: space-between; color: var(--text-muted); font-size: 8px; }

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
.request-info strong, .activity-content strong, .event-info strong { display: block; color: var(--text-primary); font-size: 10px; font-weight: 600; }
.request-info span, .activity-content span, .event-info span { display: block; margin-top: 3px; color: var(--text-muted); font-size: 8px; }
.request-count { font-size: 12px; font-weight: 700; }
.count-green { color: var(--green); }
.count-orange { color: var(--orange); }
.count-purple { color: var(--purple); }
.count-blue { color: var(--primary); }
.count-red { color: var(--red); }
.count-zero { color: var(--text-muted); }
.request-empty { margin: 0; padding: 18px; color: var(--text-muted); font-size: 11px; }
.view-all.inline { display: inline-flex; margin-left: 6px; }

/* STATUS */
.status-column { display: flex; flex-direction: column; gap: 13px; }
.status-card { flex: 1; }
.status-box { margin: 0 14px 14px; padding: 12px; border-radius: 9px; }
.payroll-box { border: 1px solid color-mix(in srgb, var(--green) 20%, var(--border)); background: color-mix(in srgb, var(--green-soft) 60%, var(--bg-card)); }
.status-box-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.status-box-top strong { color: var(--text-primary); font-size: 9px; }
.status-badge { padding: 4px 7px; border-radius: 5px; font-size: 7px; font-weight: 700; text-transform: uppercase; }
.status-badge.review { background: var(--green-soft); color: var(--green); }
.status-badge.draft { background: var(--bg-card-soft); color: var(--text-secondary); }
.status-badge.open { background: var(--primary-soft); color: var(--primary); }
.status-badge.progress { background: var(--orange-soft); color: var(--orange); }
.status-badge.paid { background: var(--green-soft); color: var(--green); }
.status-box-top .cutoff { display: block; margin-top: 3px; color: var(--text-muted); font-size: 8px; }
.step.current > span { border-color: var(--primary); background: var(--primary-soft); color: var(--primary); }
.step.current small { color: var(--primary); font-weight: 700; }
.payroll-figures { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin: 0 14px 12px; }
.payroll-figures div { padding: 10px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-card-soft); }
.payroll-figures span { display: block; color: var(--text-muted); font-size: 8px; }
.payroll-figures strong { display: block; margin-top: 4px; color: var(--text-primary); font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.payroll-figures small { display: block; margin-top: 3px; color: var(--text-secondary); font-size: 8px; }
.next-action { display: flex; width: calc(100% - 28px); align-items: center; justify-content: center; gap: 6px; margin: 0 14px 14px; padding: 9px; border: 1px dashed color-mix(in srgb, var(--primary) 45%, var(--border)); border-radius: 9px; background: transparent; color: var(--primary); font-family: inherit; font-size: 10px; font-weight: 600; cursor: pointer; }
.next-action:hover { background: var(--primary-soft); }
.next-action:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.stepper { display: flex; align-items: flex-start; margin-top: 22px; }
.step { position: relative; display: flex; width: 38px; flex-shrink: 0; flex-direction: column; align-items: center; }
.step > span { position: relative; z-index: 2; display: flex; width: 22px; height: 22px; align-items: center; justify-content: center; border: 1px solid var(--border); border-radius: 50%; background: var(--bg-card); color: var(--text-muted); font-size: 8px; font-weight: 600; }
.step.completed > span { border-color: var(--green); background: var(--green); color: white; }
.step small { margin-top: 7px; color: var(--text-muted); font-size: 6.5px; white-space: nowrap; }
.step.completed small { color: var(--text-primary); }
.step-line { height: 2px; flex: 1; margin-top: 10px; background: var(--border); }
.step-line.completed { background: var(--green); }

/* DEPARTMENT */
.department-card, .notifications-card, .events-card { min-height: 300px; }
.department-content { display: flex; align-items: center; gap: 22px; padding: 15px 18px 22px; }
.donut-chart { position: relative; display: flex; width: 150px; height: 150px; flex-shrink: 0; align-items: center; justify-content: center; border-radius: 50%; background: conic-gradient(#3b82f6 0 33.6%, #22c55e 33.6% 50%, #f59e0b 50% 60.9%, #8b5cf6 60.9% 70.3%, #ec4899 70.3% 78.9%, #d5dae3 78.9% 100%); }
.donut-chart::after { content: ""; position: absolute; width: 92px; height: 92px; border-radius: 50%; background: var(--bg-card); }
.donut-center { position: relative; z-index: 2; text-align: center; }
.donut-center strong { display: block; color: var(--text-primary); font-size: 20px; }
.donut-center span { color: var(--text-muted); font-size: 8px; }
.department-list { flex: 1; }
.department-row { display: flex; align-items: center; justify-content: space-between; padding: 5px 0; }
.department-name { display: flex; align-items: center; gap: 7px; color: var(--text-secondary); font-size: 8px; }
.department-dot { width: 7px; height: 7px; border-radius: 2px; }
.dept-blue { background: #3b82f6; }
.dept-green { background: #22c55e; }
.dept-orange { background: #f59e0b; }
.dept-purple { background: #8b5cf6; }
.dept-pink { background: #ec4899; }
.dept-gray { background: #d5dae3; }
.department-number { display: flex; gap: 6px; font-size: 8px; }
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
.unread-dot { width: 5px; height: 5px; flex-shrink: 0; border-radius: 100%; background: var(--primary); }

/* EVENTS */
.event-date { color: var(--text-secondary); font-size: 8px; white-space: nowrap; }
.event-date.soon { color: var(--primary); font-weight: 700; }
.event-red { background: var(--red-soft); color: var(--red); }
.events-more { display: block; width: 100%; margin: 8px 0 0; padding: 6px; border: 0; border-radius: 6px; background: transparent; color: var(--primary); font-family: inherit; font-size: 9px; font-weight: 600; text-align: center; cursor: pointer; }
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