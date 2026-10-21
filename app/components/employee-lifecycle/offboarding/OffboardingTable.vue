
<script setup lang="ts">
import {
  CalendarDays,
  ClipboardCheck,
  Eye,
  FilePenLine,
  MoreHorizontal,
  Pencil,
  PlayCircle,
  Send,
  UserRound,
  WalletCards,
  CheckCircle2,
  CircleX,
} from 'lucide-vue-next'

import type {
  OffboardingRecord,
  OffboardingStatus,
} from '~/types/offboarding'

const props = defineProps<{
  records: OffboardingRecord[]
}>()

type ActionName =
  | 'view'
  | 'edit'
  | 'start'
  | 'clearance'
  | 'review'
  | 'ready'
  | 'complete'
  | 'cancel'

const emit = defineEmits<{
  view: [record: OffboardingRecord]
  edit: [record: OffboardingRecord]
  start: [record: OffboardingRecord]
  clearance: [record: OffboardingRecord]
  review: [record: OffboardingRecord]
  ready: [record: OffboardingRecord]
  complete: [record: OffboardingRecord]
  cancel: [record: OffboardingRecord]
}>()

/* =========================================
   HELPERS
========================================= */

const formatDate = (value?: string) => {
  if (!value) return '—'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

const statusClass = (status: OffboardingStatus) => {
  const classes: Record<OffboardingStatus, string> = {
    Draft: 'draft',
    'Pending Clearance': 'pending',
    'Clearance In Progress': 'progress',
    'For Review': 'review',
    'Ready for Final Pay': 'final-pay',
    Completed: 'completed',
    Cancelled: 'cancelled',
  }

  return classes[status]
}

const typeClass = (type: string) => {
  return type.toLowerCase().replace(/\s+/g, '-')
}

const finalPayClass = (status: string) => {
  return status.toLowerCase().replace(/\s+/g, '-')
}

/* =========================================
   ACTIONS MENU
========================================= */

const openId = ref<number | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)

const menuStyle = ref({
  top: '0px',
  left: '0px',
})

const activeRecord = computed(() => {
  return props.records.find(
    record => record.id === openId.value,
  )
})

const menuActions = computed(() => {
  const record = activeRecord.value

  if (!record) return []

  const actions: {
    name: ActionName
    label: string
    icon: typeof Eye
    danger?: boolean
  }[] = [
    {
      name: 'view',
      label: 'View Offboarding',
      icon: Eye,
    },
  ]

  if (
    record.status === 'Completed' ||
    record.status === 'Cancelled'
  ) {
    return actions
  }

  actions.push({
    name: 'edit',
    label: 'Edit Offboarding',
    icon: Pencil,
  })

  if (record.status === 'Draft') {
    actions.push({
      name: 'start',
      label: 'Start Clearance',
      icon: PlayCircle,
    })
  }

  if (
    record.status === 'Pending Clearance' ||
    record.status === 'Clearance In Progress' ||
    record.status === 'For Review'
  ) {
    actions.push({
      name: 'clearance',
      label: 'Manage Clearance',
      icon: ClipboardCheck,
    })
  }

  if (
    record.status === 'Clearance In Progress' ||
    record.status === 'Pending Clearance'
  ) {
    actions.push({
      name: 'review',
      label: 'Submit for Review',
      icon: Send,
    })
  }

  if (record.status === 'For Review') {
    actions.push({
      name: 'ready',
      label: 'Mark Ready for Final Pay',
      icon: WalletCards,
    })
  }

  if (record.status === 'Ready for Final Pay') {
    actions.push({
      name: 'complete',
      label: 'Complete Offboarding',
      icon: CheckCircle2,
    })
  }

  actions.push({
    name: 'cancel',
    label: 'Cancel Offboarding',
    icon: CircleX,
    danger: true,
  })

  return actions
})

const closeMenu = () => {
  openId.value = null
}

const toggleMenu = async (
  id: number,
  event: MouseEvent,
) => {
  if (openId.value === id) {
    closeMenu()
    return
  }

  triggerRef.value = event.currentTarget as HTMLElement
  openId.value = id

  await nextTick()

  if (!triggerRef.value) return

  const rect = triggerRef.value.getBoundingClientRect()

  const width = menuRef.value?.offsetWidth ?? 225
  const height = menuRef.value?.offsetHeight ?? 220
  const padding = 8

  const spaceBelow = window.innerHeight - rect.bottom

  let top = spaceBelow >= height + 6
    ? rect.bottom + 6
    : rect.top - height - 6

  top = Math.max(
    padding,
    Math.min(top, window.innerHeight - height - padding),
  )

  const left = Math.max(
    padding,
    Math.min(
      rect.right - width,
      window.innerWidth - width - padding,
    ),
  )

  menuStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  }
}

const performAction = (action: ActionName) => {
  const record = activeRecord.value

  if (!record) return

  if (!menuActions.value.some(item => item.name === action)) {
    closeMenu()
    return
  }

  closeMenu()

  switch (action) {
    case 'view':
      emit('view', record)
      break

    case 'edit':
      emit('edit', record)
      break

    case 'start':
      emit('start', record)
      break

    case 'clearance':
      emit('clearance', record)
      break

    case 'review':
      emit('review', record)
      break

    case 'ready':
      emit('ready', record)
      break

    case 'complete':
      emit('complete', record)
      break

    case 'cancel':
      emit('cancel', record)
      break
  }
}

/* =========================================
   CLICK OUTSIDE
========================================= */

const handleOutside = (event: MouseEvent) => {
  const target = event.target as Node

  if (
    triggerRef.value?.contains(target) ||
    menuRef.value?.contains(target)
  ) {
    return
  }

  closeMenu()
}

onMounted(() => {
  document.addEventListener('mousedown', handleOutside)
  window.addEventListener('resize', closeMenu)
  window.addEventListener('scroll', closeMenu, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleOutside)
  window.removeEventListener('resize', closeMenu)
  window.removeEventListener('scroll', closeMenu, true)
})
</script>

<template>
  <article class="table-card">
    <div class="table-heading">
      <h3>Employee Offboarding</h3>

      <p>
        Monitor employee separation, exit interviews,
        clearance status and final pay readiness.
      </p>
    </div>

    <div v-if="records.length" class="table-scroll">
      <table class="offboarding-table">
        <thead>
          <tr>
            <th>Offboarding No.</th>
            <th>Employee</th>
            <th>Department</th>
            <th>Offboarding Type</th>
            <th>Notice Date</th>
            <th>Last Working Day</th>
            <th>Separation Date</th>
            <th>Exit Interview</th>
            <th>Final Pay</th>
            <th>Initiated By</th>
            <th>Approved By</th>
            <th>Status</th>
            <th>Reason</th>
            <th>Remarks</th>
            <th class="actions-column">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="item in records"
            :key="item.id"
          >
            <td>
              <strong class="record-number">
                {{ item.offboardingNumber }}
              </strong>
            </td>

            <td>
              <div class="employee-cell">
                <div class="employee-avatar">
                  <UserRound :size="16" />
                </div>

                <div>
                  <strong>{{ item.employeeName }}</strong>
                  <span>{{ item.employeeNumber }}</span>
                  <span>{{ item.position }}</span>
                </div>
              </div>
            </td>

            <td>
              <strong class="department">
                {{ item.department }}
              </strong>
            </td>

            <td>
              <span
                class="type-badge"
                :class="typeClass(item.offboardingType)"
              >
                {{ item.offboardingType }}
              </span>
            </td>

            <td>
              <div class="date-cell">
                <CalendarDays :size="13" />
                {{ formatDate(item.noticeDate) }}
              </div>
            </td>

            <td>
              <div class="date-cell last-day">
                <CalendarDays :size="13" />
                <strong>
                  {{ formatDate(item.lastWorkingDay) }}
                </strong>
              </div>
            </td>

            <td>
              <strong class="separation-date">
                {{ formatDate(item.separationDate) }}
              </strong>
            </td>

            <td>
              <div
                v-if="item.exitInterviewDate"
                class="exit-date"
              >
                <ClipboardCheck :size="13" />
                {{ formatDate(item.exitInterviewDate) }}
              </div>

              <span v-else class="pending-text">
                Not Scheduled
              </span>
            </td>

            <td>
              <span
                class="final-pay-badge"
                :class="finalPayClass(item.finalPayStatus)"
              >
                <WalletCards :size="12" />
                {{ item.finalPayStatus }}
              </span>
            </td>

            <td>
              <strong class="person-name">
                {{ item.initiatedBy }}
              </strong>
            </td>

            <td>
              <strong
                v-if="item.approvedBy"
                class="approved-person"
              >
                {{ item.approvedBy }}
              </strong>

              <span v-else class="pending-text">
                Pending
              </span>
            </td>

            <td>
              <span
                class="status-badge"
                :class="statusClass(item.status)"
              >
                <span class="status-dot"></span>
                {{ item.status }}
              </span>
            </td>

            <td>
              <p class="truncate-text" :title="item.reason">
                {{ item.reason }}
              </p>
            </td>

            <td>
              <p
                class="truncate-text remarks"
                :title="item.remarks || 'No remarks'"
              >
                {{ item.remarks || 'No remarks' }}
              </p>
            </td>

            <td class="actions-column">
              <button
                type="button"
                class="action-button"
                aria-label="Offboarding actions"
                :aria-expanded="openId === item.id"
                @click.stop="toggleMenu(item.id, $event)"
              >
                <MoreHorizontal :size="18" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-state">
      <UserRound :size="30" />

      <strong>No offboarding records found</strong>

      <span>
        Try changing your offboarding filters.
      </span>
    </div>

    <Teleport to="body">
      <div
        v-if="openId !== null"
        ref="menuRef"
        class="offboarding-actions-menu"
        :style="menuStyle"
      >
        <button
          v-for="action in menuActions"
          :key="action.name"
          type="button"
          :class="{ danger: action.danger }"
          @click="performAction(action.name)"
        >
          <component
            :is="action.icon"
            :size="15"
          />

          {{ action.label }}
        </button>
      </div>
    </Teleport>
  </article>
</template>

<style scoped>
.table-card {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.table-heading {
  padding: 15px 17px;
  border-bottom: 1px solid var(--border-soft);
}

.table-heading h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 700;
}

.table-heading p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
}

.offboarding-table {
  width: 100%;
  min-width: 2080px;
  border-collapse: collapse;
}

.offboarding-table th {
  padding: 11px 13px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 9px;
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
}

.offboarding-table td {
  padding: 12px 13px;
  border-top: 1px solid var(--border-soft);
  color: var(--text-secondary);
  font-size: 10px;
  vertical-align: middle;
}

.offboarding-table tbody tr:hover {
  background: var(--bg-card-soft);
}

.record-number {
  color: var(--primary);
  white-space: nowrap;
}

.employee-cell {
  display: flex;
  min-width: 190px;
  align-items: center;
  gap: 9px;
}

.employee-avatar {
  display: flex;
  width: 35px;
  height: 35px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--red-soft);
  color: var(--red);
}

.employee-cell strong,
.employee-cell span {
  display: block;
}

.employee-cell strong {
  color: var(--text-primary);
  font-size: 10px;
}

.employee-cell span {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 9px;
}

.department,
.person-name {
  color: var(--text-primary);
  white-space: nowrap;
}

.approved-person {
  color: var(--green);
  white-space: nowrap;
}

/* =========================================
   TYPE
========================================= */

.type-badge {
  display: inline-flex;
  align-items: center;
  padding: 5px 8px;
  border-radius: 20px;
  font-size: 9px;
  font-weight: 650;
  white-space: nowrap;
}

.type-badge.resignation {
  background: var(--primary-soft);
  color: var(--primary);
}

.type-badge.end-of-contract {
  background: var(--purple-soft);
  color: var(--purple);
}

.type-badge.retirement {
  background: var(--green-soft);
  color: var(--green);
}

.type-badge.termination {
  background: var(--red-soft);
  color: var(--red);
}

.type-badge.redundancy {
  background: var(--orange-soft);
  color: var(--orange);
}

/* =========================================
   DATES
========================================= */

.date-cell,
.exit-date {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.date-cell svg {
  color: var(--text-muted);
}

.last-day svg {
  color: var(--orange);
}

.last-day strong,
.separation-date {
  color: var(--text-primary);
  white-space: nowrap;
}

.exit-date {
  color: var(--purple);
}

.pending-text {
  color: var(--text-muted);
  font-style: italic;
  white-space: nowrap;
}

/* =========================================
   FINAL PAY
========================================= */

.final-pay-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 8px;
  border-radius: 20px;
  font-size: 9px;
  font-weight: 650;
  white-space: nowrap;
}

.final-pay-badge.not-started {
  background: var(--bg-card-soft);
  color: var(--text-muted);
}

.final-pay-badge.for-processing,
.final-pay-badge.for-review {
  background: var(--orange-soft);
  color: var(--orange);
}

.final-pay-badge.ready-for-release {
  background: var(--purple-soft);
  color: var(--purple);
}

.final-pay-badge.released {
  background: var(--green-soft);
  color: var(--green);
}

/* =========================================
   STATUS
========================================= */

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 8px;
  border-radius: 20px;
  font-size: 9px;
  font-weight: 650;
  white-space: nowrap;
}

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

.status-badge.draft {
  background: var(--bg-card-soft);
  color: var(--text-muted);
}

.status-badge.pending,
.status-badge.review {
  background: var(--orange-soft);
  color: var(--orange);
}

.status-badge.progress {
  background: var(--primary-soft);
  color: var(--primary);
}

.status-badge.final-pay {
  background: var(--purple-soft);
  color: var(--purple);
}

.status-badge.completed {
  background: var(--green-soft);
  color: var(--green);
}

.status-badge.cancelled {
  background: var(--red-soft);
  color: var(--red);
}

/* =========================================
   TEXT
========================================= */

.truncate-text {
  width: 190px;
  margin: 0;
  overflow: hidden;
  color: var(--text-secondary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.truncate-text.remarks {
  width: 145px;
  color: var(--text-muted);
}

/* =========================================
   ACTIONS
========================================= */

.actions-column {
  position: static !important;
  width: 70px;
  text-align: center !important;
}

.action-button {
  display: inline-flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.action-button:hover,
.action-button[aria-expanded="true"] {
  border-color: var(--border);
  background: var(--bg-card-soft);
  color: var(--primary);
}

/* =========================================
   EMPTY
========================================= */

.empty-state {
  display: flex;
  min-height: 240px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 9px;
  color: var(--text-muted);
}

.empty-state strong {
  color: var(--text-primary);
  font-size: 12px;
}

.empty-state span {
  font-size: 10px;
}
</style>

<style>
.offboarding-actions-menu {
  position: fixed;
  z-index: 10020;
  width: 225px;
  padding: 6px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.25);
}

.offboarding-actions-menu button {
  display: flex;
  width: 100%;
  min-height: 36px;
  align-items: center;
  gap: 9px;
  padding: 0 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 11px;
  text-align: left;
  cursor: pointer;
}

.offboarding-actions-menu button:hover {
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

.offboarding-actions-menu button.danger {
  color: var(--red);
}

.offboarding-actions-menu button.danger:hover {
  background: var(--red-soft);
}
</style>
