<script setup lang="ts">
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
  TimerReset,
  PencilLine,
  WalletCards,
  CheckCircle2,
  Circle,
  Cake,
  BriefcaseBusiness,
  FileWarning,
  AlertTriangle,
  BellRing,
  MoreHorizontal,
} from 'lucide-vue-next'

const stats = [
  {
    label: 'Total Employees',
    value: '256',
    description: 'Active employees',
    trend: '+12 from last month',
    type: 'blue',
    icon: Users,
  },
  {
    label: 'Present Today',
    value: '198',
    description: '77.3% of total',
    trend: 'Good attendance',
    type: 'green',
    icon: UserCheck,
  },
  {
    label: 'Late',
    value: '23',
    description: '9.0% of total',
    trend: 'Needs monitoring',
    type: 'orange',
    icon: Clock3,
  },
  {
    label: 'Absent',
    value: '18',
    description: '7.0% of total',
    trend: 'Today',
    type: 'red',
    icon: UserX,
  },
  {
    label: 'WFH / Remote',
    value: '32',
    description: '12.5% of total',
    trend: 'Approved today',
    type: 'purple',
    icon: House,
  },
]

const pendingRequests = [
  {
    label: 'Leave Request',
    subtitle: '6 for approval',
    count: 10,
    type: 'green',
    icon: Umbrella,
  },
  {
    label: 'Overtime Request',
    subtitle: '3 for approval',
    count: 7,
    type: 'orange',
    icon: TimerReset,
  },
  {
    label: 'Time Log Correction',
    subtitle: '5 for approval',
    count: 12,
    type: 'purple',
    icon: PencilLine,
  },
  {
    label: 'WFH Request',
    subtitle: '2 for approval',
    count: 6,
    type: 'blue',
    icon: House,
  },
  {
    label: 'Cash Advance Request',
    subtitle: '2 for approval',
    count: 3,
    type: 'green',
    icon: WalletCards,
  },
]

const departments = [
  {
    name: 'Operations',
    count: 86,
    percent: 33.6,
    className: 'dept-blue',
  },
  {
    name: 'Finance',
    count: 42,
    percent: 16.4,
    className: 'dept-green',
  },
  {
    name: 'HR',
    count: 28,
    percent: 10.9,
    className: 'dept-orange',
  },
  {
    name: 'IT',
    count: 24,
    percent: 9.4,
    className: 'dept-purple',
  },
  {
    name: 'Sales',
    count: 22,
    percent: 8.6,
    className: 'dept-pink',
  },
  {
    name: 'Others',
    count: 54,
    percent: 21.1,
    className: 'dept-gray',
  },
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

const upcomingEvents = [
  {
    label: 'Employee Birthday',
    person: 'Juan Dela Cruz',
    date: 'May 27',
    type: 'purple',
    icon: Cake,
  },
  {
    label: 'Work Anniversary',
    person: 'Anna Reyes (3 years)',
    date: 'May 28',
    type: 'blue',
    icon: BriefcaseBusiness,
  },
  {
    label: 'Regularization',
    person: '5 employees',
    date: 'May 30',
    type: 'green',
    icon: UserCheck,
  },
  {
    label: 'Contract Expiration',
    person: '3 employees',
    date: 'Jun 02',
    type: 'orange',
    icon: FileWarning,
  },
]
</script>

<template>
  <section class="dashboard-page">
    <!-- PAGE HEADER -->
    <div class="dashboard-header">
      <div>
        <h1>
          Dashboard
        </h1>

        <p class="welcome-text">
          Good morning,
          <strong>Maria!</strong>
          👋
        </p>

        <p class="header-subtitle">
          Here's what's happening in your
          organization today.
        </p>
      </div>

      <div class="header-actions">
        <button class="date-button">
          <span>
            May 26, 2026 (Tue)
          </span>

          <CalendarDays :size="17" />
        </button>

        <button class="quick-action">
          <span class="plus">
            +
          </span>

          Quick Action

          <ChevronDown :size="16" />
        </button>
      </div>
    </div>

    <!-- SUMMARY CARDS -->
    <div class="stats-grid">
      <article
        v-for="stat in stats"
        :key="stat.label"
        class="stat-card"
      >
        <div
          class="stat-icon"
          :class="`stat-${stat.type}`"
        >
          <component
            :is="stat.icon"
            :size="21"
          />
        </div>

        <div class="stat-content">
          <p class="stat-label">
            {{ stat.label }}
          </p>

          <h2>
            {{ stat.value }}
          </h2>

          <p class="stat-description">
            {{ stat.description }}
          </p>

          <p
            class="stat-trend"
            :class="`trend-${stat.type}`"
          >
            {{ stat.trend }}
          </p>
        </div>
      </article>
    </div>

    <!-- MAIN GRID -->
    <div class="dashboard-grid">
      <!-- ATTENDANCE -->
      <article class="dashboard-card attendance-card">
        <div class="card-header">
          <div>
            <h3>
              Attendance Overview
            </h3>

            <p>
              Weekly attendance performance
            </p>
          </div>

          <button class="small-filter">
            This Week
            <ChevronDown :size="14" />
          </button>
        </div>

        <div class="legend">
          <span>
            <i class="legend-dot green" />
            Present
          </span>

          <span>
            <i class="legend-dot orange" />
            Late
          </span>

          <span>
            <i class="legend-dot red" />
            Absent
          </span>
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

            <svg
              class="chart-svg"
              viewBox="0 0 700 220"
              preserveAspectRatio="none"
            >
              <polyline
                class="line-present"
                points="
                  15,64
                  125,55
                  235,47
                  345,68
                  455,56
                  565,86
                  675,140
                "
              />

              <polyline
                class="line-late"
                points="
                  15,174
                  125,170
                  235,176
                  345,168
                  455,171
                  565,182
                  675,189
                "
              />

              <polyline
                class="line-absent"
                points="
                  15,186
                  125,183
                  235,184
                  345,185
                  455,187
                  565,190
                  675,193
                "
              />

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

      <!-- PENDING REQUESTS -->
      <article class="dashboard-card pending-card">
        <div class="card-header">
          <div>
            <h3>
              Pending Requests
            </h3>

            <p>
              Requests waiting for action
            </p>
          </div>

          <button class="view-all">
            View all
            <ArrowUpRight :size="14" />
          </button>
        </div>

        <div class="request-list">
          <div
            v-for="request in pendingRequests"
            :key="request.label"
            class="request-row"
          >
            <div
              class="request-icon"
              :class="`request-${request.type}`"
            >
              <component
                :is="request.icon"
                :size="17"
              />
            </div>

            <div class="request-info">
              <strong>
                {{ request.label }}
              </strong>

              <span>
                {{ request.subtitle }}
              </span>
            </div>

            <span
              class="request-count"
              :class="`count-${request.type}`"
            >
              {{ request.count }}
            </span>
          </div>
        </div>
      </article>

      <!-- PAYROLL / BILLING -->
      <div class="status-column">
        <article class="dashboard-card status-card">
          <div class="card-header">
            <div>
              <h3>
                Payroll Status
              </h3>

              <p>
                Current payroll cutoff
              </p>
            </div>

            <button class="view-all">
              View all
            </button>
          </div>

          <div class="status-box payroll-box">
            <div class="status-box-top">
              <strong>
                May 16–31, 2026 Cutoff
              </strong>

              <span class="status-badge review">
                For Review
              </span>
            </div>

            <div class="stepper">
              <div class="step completed">
                <span>
                  <CheckCircle2 :size="18" />
                </span>

                <small>Draft</small>
              </div>

              <div class="step-line completed" />

              <div class="step completed">
                <span>2</span>
                <small>Review</small>
              </div>

              <div class="step-line" />

              <div class="step">
                <span>3</span>
                <small>Approval</small>
              </div>

              <div class="step-line" />

              <div class="step">
                <span>4</span>
                <small>Finalized</small>
              </div>

              <div class="step-line" />

              <div class="step">
                <span>5</span>
                <small>Paid</small>
              </div>
            </div>
          </div>
        </article>

        <article class="dashboard-card status-card">
          <div class="card-header">
            <div>
              <h3>
                Billing Status
              </h3>

              <p>
                Current billing cutoff
              </p>
            </div>

            <button class="view-all">
              View all
            </button>
          </div>

          <div class="status-box billing-box">
            <div class="status-box-top">
              <strong>
                May 16–31, 2026 Cutoff
              </strong>

              <span class="status-badge progress">
                In Progress
              </span>
            </div>

            <div class="stepper blue-stepper">
              <div class="step completed">
                <span>
                  <CheckCircle2 :size="18" />
                </span>

                <small>Draft</small>
              </div>

              <div class="step-line completed" />

              <div class="step completed">
                <span>2</span>
                <small>Review</small>
              </div>

              <div class="step-line" />

              <div class="step">
                <span>3</span>
                <small>Approval</small>
              </div>

              <div class="step-line" />

              <div class="step">
                <span>4</span>
                <small>Finalized</small>
              </div>

              <div class="step-line" />

              <div class="step">
                <span>5</span>
                <small>Sent</small>
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- DEPARTMENT -->
      <article class="dashboard-card department-card">
        <div class="card-header">
          <div>
            <h3>
              Department Headcount
            </h3>

            <p>
              Workforce distribution
            </p>
          </div>

          <button class="view-all">
            View all
          </button>
        </div>

        <div class="department-content">
          <div class="donut-chart">
            <div class="donut-center">
              <strong>
                256
              </strong>

              <span>Total</span>
            </div>
          </div>

          <div class="department-list">
            <div
              v-for="department in departments"
              :key="department.name"
              class="department-row"
            >
              <div class="department-name">
                <span
                  class="department-dot"
                  :class="department.className"
                />

                {{ department.name }}
              </div>

              <div class="department-number">
                <strong>
                  {{ department.count }}
                </strong>

                <span>
                  {{ department.percent }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </article>

      <!-- NOTIFICATIONS -->
      <article class="dashboard-card notifications-card">
        <div class="card-header">
          <div>
            <h3>
              Recent Notifications
            </h3>

            <p>
              Latest HR activities
            </p>
          </div>

          <button class="view-all">
            View all
          </button>
        </div>

        <div class="notification-list">
          <div
            v-for="item in notifications"
            :key="item.title"
            class="notification-row"
          >
            <div
              class="activity-icon"
              :class="`activity-${item.type}`"
            >
              <component
                :is="item.icon"
                :size="17"
              />
            </div>

            <div class="activity-content">
              <strong>
                {{ item.title }}
              </strong>

              <span>
                {{ item.meta }}
              </span>
            </div>

            <span class="unread-dot" />
          </div>
        </div>
      </article>

      <!-- UPCOMING -->
      <article class="dashboard-card events-card">
        <div class="card-header">
          <div>
            <h3>
              Upcoming Events
            </h3>

            <p>
              Important employee dates
            </p>
          </div>

          <button class="view-all">
            View Calendar
          </button>
        </div>

        <div class="events-list">
          <div
            v-for="event in upcomingEvents"
            :key="event.label"
            class="event-row"
          >
            <div
              class="event-icon"
              :class="`event-${event.type}`"
            >
              <component
                :is="event.icon"
                :size="17"
              />
            </div>

            <div class="event-info">
              <strong>
                {{ event.label }}
              </strong>

              <span>
                {{ event.person }}
              </span>
            </div>

            <span class="event-date">
              {{ event.date }}
            </span>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.dashboard-page {
  width: 100%;
  max-width: 1660px;
  margin: 0 auto;
}

/* HEADER */

.dashboard-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  margin-bottom: 22px;
}

.dashboard-header h1 {
  margin: 0;

  color: var(--text-primary);

  font-size: 27px;
  font-weight: 750;
  letter-spacing: -0.7px;
}

.welcome-text {
  margin: 6px 0 0;

  color: var(--text-primary);

  font-size: 14px;
}

.header-subtitle {
  margin: 4px 0 0;

  color: var(--text-secondary);

  font-size: 12px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-button,
.quick-action {
  display: flex;
  height: 41px;
  align-items: center;
  gap: 10px;

  padding: 0 14px;

  border-radius: 9px;

  font-size: 12px;
  font-weight: 500;
}

.date-button {
  border:
    1px solid var(--border);

  background: var(--bg-card);
  color: var(--text-secondary);
}

.quick-action {
  border: 0;

  background:
    linear-gradient(
      135deg,
      #1f68f2,
      #2878ff
    );

  color: white;

  box-shadow:
    0 5px 12px rgba(36, 107, 253, 0.23);
}

.quick-action .plus {
  font-size: 20px;
  font-weight: 300;
}

/* STAT CARDS */

.stats-grid {
  display: grid;

  grid-template-columns:
    repeat(5, minmax(0, 1fr));

  gap: 13px;

  margin-bottom: 13px;
}

.stat-card {
  display: flex;
  min-height: 132px;
  gap: 12px;

  padding: 17px;

  border:
    1px solid var(--border);

  border-radius: 12px;

  background: var(--bg-card);

  box-shadow: var(--shadow);

  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.stat-card:hover {
  transform: translateY(-2px);

  border-color:
    color-mix(
      in srgb,
      var(--primary) 25%,
      var(--border)
    );
}

.stat-icon {
  display: flex;
  width: 39px;
  height: 39px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;

  border-radius: 50%;
}

.stat-blue {
  background: var(--primary-soft);
  color: var(--primary);
}

.stat-green {
  background: var(--green-soft);
  color: var(--green);
}

.stat-orange {
  background: var(--orange-soft);
  color: var(--orange);
}

.stat-red {
  background: var(--red-soft);
  color: var(--red);
}

.stat-purple {
  background: var(--purple-soft);
  color: var(--purple);
}

.stat-label {
  margin: 2px 0 5px;

  color: var(--text-secondary);

  font-size: 11px;
  font-weight: 500;
}

.stat-content h2 {
  margin: 0 0 5px;

  color: var(--text-primary);

  font-size: 24px;
  line-height: 1;
  letter-spacing: -0.5px;
}

.stat-description,
.stat-trend {
  margin: 0;

  font-size: 10px;
}

.stat-description {
  color: var(--text-muted);
}

.stat-trend {
  margin-top: 9px;
}

.trend-blue {
  color: var(--primary);
}

.trend-green {
  color: var(--green);
}

.trend-orange {
  color: var(--orange);
}

.trend-red {
  color: var(--red);
}

.trend-purple {
  color: var(--purple);
}

/* DASHBOARD GRID */

.dashboard-grid {
  display: grid;

  grid-template-columns:
    minmax(0, 1.55fr)
    minmax(285px, 0.95fr)
    minmax(320px, 1.05fr);

  gap: 13px;
}

.dashboard-card {
  border:
    1px solid var(--border);

  border-radius: 12px;

  background: var(--bg-card);

  box-shadow: var(--shadow);
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  padding: 16px 17px 13px;
}

.card-header h3 {
  margin: 0;

  color: var(--text-primary);

  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.15px;
}

.card-header p {
  margin: 4px 0 0;

  color: var(--text-muted);

  font-size: 9px;
}

.view-all,
.small-filter {
  display: flex;
  align-items: center;
  gap: 5px;

  border: 0;

  background: transparent;
  color: var(--primary);

  font-size: 10px;
  font-weight: 500;
}

.small-filter {
  padding: 7px 9px;

  border:
    1px solid var(--border);

  border-radius: 7px;

  color: var(--text-secondary);
}

/* ATTENDANCE */

.attendance-card {
  min-height: 360px;
}

.legend {
  display: flex;
  gap: 22px;

  padding: 0 18px 10px;

  color: var(--text-secondary);

  font-size: 9px;
}

.legend span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 7px;
  height: 7px;

  border-radius: 100%;
}

.legend-dot.green {
  background: var(--green);
}

.legend-dot.orange {
  background: var(--orange);
}

.legend-dot.red {
  background: var(--red);
}

.chart-wrapper {
  display: flex;

  height: 245px;

  padding:
    8px 18px 15px 14px;
}

.chart-y-axis {
  display: flex;
  width: 33px;
  flex-direction: column;
  justify-content: space-between;

  padding-bottom: 25px;

  color: var(--text-muted);

  font-size: 8px;
}

.chart-area {
  position: relative;

  flex: 1;
}

.grid-line {
  position: absolute;
  left: 0;
  right: 0;

  height: 1px;

  background: var(--border-soft);
}

.line-1 {
  top: 0;
}

.line-2 {
  top: 20%;
}

.line-3 {
  top: 40%;
}

.line-4 {
  top: 60%;
}

.line-5 {
  top: 80%;
}

.chart-svg {
  position: absolute;
  inset: 0 0 26px;

  width: 100%;
  height:
    calc(100% - 26px);

  overflow: visible;
}

.chart-svg polyline {
  fill: none;

  stroke-width: 2.2;

  vector-effect:
    non-scaling-stroke;
}

.line-present {
  stroke: var(--green);
}

.line-late {
  stroke: var(--orange);
}

.line-absent {
  stroke: var(--red);
}

.present-points {
  fill: var(--green);
}

.late-points {
  fill: var(--orange);
}

.absent-points {
  fill: var(--red);
}

.x-labels {
  position: absolute;
  right: -5px;
  bottom: 0;
  left: -4px;

  display: flex;
  justify-content: space-between;

  color: var(--text-muted);

  font-size: 8px;
}

/* REQUESTS */

.pending-card {
  min-height: 360px;
}

.request-list {
  padding:
    0 16px 9px;
}

.request-row {
  display: flex;
  min-height: 52px;
  align-items: center;
  gap: 10px;

  border-bottom:
    1px solid var(--border-soft);
}

.request-row:last-child {
  border-bottom: 0;
}

.request-icon,
.activity-icon,
.event-icon {
  display: flex;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;

  border-radius: 50%;
}

.request-green,
.event-green {
  background: var(--green-soft);
  color: var(--green);
}

.request-orange,
.event-orange {
  background: var(--orange-soft);
  color: var(--orange);
}

.request-purple,
.event-purple {
  background: var(--purple-soft);
  color: var(--purple);
}

.request-blue,
.event-blue {
  background: var(--primary-soft);
  color: var(--primary);
}

.request-info,
.activity-content,
.event-info {
  min-width: 0;
  flex: 1;
}

.request-info strong,
.activity-content strong,
.event-info strong {
  display: block;

  color: var(--text-primary);

  font-size: 10px;
  font-weight: 600;
}

.request-info span,
.activity-content span,
.event-info span {
  display: block;

  margin-top: 3px;

  color: var(--text-muted);

  font-size: 8px;
}

.request-count {
  font-size: 12px;
  font-weight: 700;
}

.count-green {
  color: var(--green);
}

.count-orange {
  color: var(--orange);
}

.count-purple {
  color: var(--purple);
}

.count-blue {
  color: var(--primary);
}

/* STATUS */

.status-column {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.status-card {
  flex: 1;
}

.status-box {
  margin: 0 14px 14px;
  padding: 12px;

  border-radius: 9px;
}

.payroll-box {
  border:
    1px solid
    color-mix(
      in srgb,
      var(--green) 20%,
      var(--border)
    );

  background:
    color-mix(
      in srgb,
      var(--green-soft) 60%,
      var(--bg-card)
    );
}

.billing-box {
  border:
    1px solid
    color-mix(
      in srgb,
      var(--primary) 20%,
      var(--border)
    );

  background:
    color-mix(
      in srgb,
      var(--primary-soft) 55%,
      var(--bg-card)
    );
}

.status-box-top {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 8px;
}

.status-box-top strong {
  color: var(--text-primary);

  font-size: 9px;
}

.status-badge {
  padding: 4px 7px;

  border-radius: 5px;

  font-size: 7px;
  font-weight: 700;
  text-transform: uppercase;
}

.status-badge.review {
  background: var(--green-soft);
  color: var(--green);
}

.status-badge.progress {
  background: var(--primary-soft);
  color: var(--primary);
}

.stepper {
  display: flex;
  align-items: flex-start;

  margin-top: 22px;
}

.step {
  position: relative;

  display: flex;
  width: 38px;
  flex-shrink: 0;
  flex-direction: column;
  align-items: center;
}

.step > span {
  position: relative;
  z-index: 2;

  display: flex;
  width: 22px;
  height: 22px;
  align-items: center;
  justify-content: center;

  border:
    1px solid var(--border);

  border-radius: 50%;

  background: var(--bg-card);
  color: var(--text-muted);

  font-size: 8px;
  font-weight: 600;
}

.step.completed > span {
  border-color: var(--green);

  background: var(--green);
  color: white;
}

.blue-stepper .step.completed > span {
  border-color: var(--primary);

  background: var(--primary);
}

.step small {
  margin-top: 7px;

  color: var(--text-muted);

  font-size: 6.5px;
  white-space: nowrap;
}

.step.completed small {
  color: var(--text-primary);
}

.step-line {
  height: 2px;
  flex: 1;

  margin-top: 10px;

  background: var(--border);
}

.step-line.completed {
  background: var(--green);
}

.blue-stepper .step-line.completed {
  background: var(--primary);
}

/* DEPARTMENT */

.department-card,
.notifications-card,
.events-card {
  min-height: 300px;
}

.department-content {
  display: flex;
  align-items: center;
  gap: 22px;

  padding:
    15px 18px 22px;
}

.donut-chart {
  position: relative;

  display: flex;
  width: 150px;
  height: 150px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background:
    conic-gradient(
      #3b82f6 0 33.6%,
      #22c55e 33.6% 50%,
      #f59e0b 50% 60.9%,
      #8b5cf6 60.9% 70.3%,
      #ec4899 70.3% 78.9%,
      #d5dae3 78.9% 100%
    );
}

.donut-chart::after {
  content: "";

  position: absolute;

  width: 92px;
  height: 92px;

  border-radius: 50%;

  background: var(--bg-card);
}

.donut-center {
  position: relative;
  z-index: 2;

  text-align: center;
}

.donut-center strong {
  display: block;

  color: var(--text-primary);

  font-size: 20px;
}

.donut-center span {
  color: var(--text-muted);

  font-size: 8px;
}

.department-list {
  flex: 1;
}

.department-row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 5px 0;
}

.department-name {
  display: flex;
  align-items: center;
  gap: 7px;

  color: var(--text-secondary);

  font-size: 8px;
}

.department-dot {
  width: 7px;
  height: 7px;

  border-radius: 2px;
}

.dept-blue {
  background: #3b82f6;
}

.dept-green {
  background: #22c55e;
}

.dept-orange {
  background: #f59e0b;
}

.dept-purple {
  background: #8b5cf6;
}

.dept-pink {
  background: #ec4899;
}

.dept-gray {
  background: #d5dae3;
}

.department-number {
  display: flex;
  gap: 6px;

  font-size: 8px;
}

.department-number strong {
  color: var(--text-primary);
}

.department-number span {
  color: var(--text-muted);
}

/* NOTIFICATIONS */

.notification-list,
.events-list {
  padding:
    0 16px 10px;
}

.notification-row,
.event-row {
  display: flex;
  min-height: 53px;
  align-items: center;
  gap: 10px;

  border-bottom:
    1px solid var(--border-soft);
}

.notification-row:last-child,
.event-row:last-child {
  border-bottom: 0;
}

.activity-success {
  background: var(--green-soft);
  color: var(--green);
}

.activity-warning {
  background: var(--orange-soft);
  color: var(--orange);
}

.activity-purple {
  background: var(--purple-soft);
  color: var(--purple);
}

.activity-danger {
  background: var(--red-soft);
  color: var(--red);
}

.unread-dot {
  width: 5px;
  height: 5px;

  flex-shrink: 0;

  border-radius: 100%;

  background: var(--primary);
}

/* EVENTS */

.event-date {
  color: var(--text-secondary);

  font-size: 8px;
  white-space: nowrap;
}

/* RESPONSIVE */

@media (max-width: 1400px) {
  .stats-grid {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }

  .dashboard-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .status-column {
    grid-column: span 2;

    display: grid;

    grid-template-columns:
      repeat(2, 1fr);
  }
}

@media (max-width: 920px) {
  .stats-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .status-column {
    grid-column: auto;

    grid-template-columns: 1fr;
  }
}

@media (max-width: 650px) {
  .dashboard-header {
    flex-direction: column;
    gap: 16px;
  }

  .header-actions {
    width: 100%;
  }

  .date-button,
  .quick-action {
    flex: 1;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .department-content {
    flex-direction: column;
  }

  .department-list {
    width: 100%;
  }
}

@media (max-width: 440px) {
  .header-actions {
    flex-direction: column;
  }

  .date-button,
  .quick-action {
    width: 100%;
  }
}
</style>