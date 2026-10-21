
<script setup lang="ts">
import {
  ArrowRight,
  CalendarDays,
  FilePenLine,
  MoreHorizontal,
  UserRound,
  Eye,
  Pencil,
  Send,
  CheckCircle2,
  CalendarCheck,
  BadgeCheck,
  CircleX,
} from 'lucide-vue-next'

import type {
  EmploymentChangeRecord,
  EmploymentChangeStatus,
  EmploymentChangeType,
} from '~/types/employmentChange'

const props = defineProps<{
  records: EmploymentChangeRecord[]
}>()

type ChangeAction =
  | 'view'
  | 'edit'
  | 'submit'
  | 'approve'
  | 'schedule'
  | 'effective'
  | 'reject'
  | 'cancel'

const emit = defineEmits<{
  view: [record: EmploymentChangeRecord]
  edit: [record: EmploymentChangeRecord]
  submit: [record: EmploymentChangeRecord]
  approve: [record: EmploymentChangeRecord]
  schedule: [record: EmploymentChangeRecord]
  effective: [record: EmploymentChangeRecord]
  reject: [record: EmploymentChangeRecord]
  cancel: [record: EmploymentChangeRecord]
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

const statusClass = (value: EmploymentChangeStatus) => {
  return value.toLowerCase().replace(/\s+/g, '-')
}

const typeClass = (value: EmploymentChangeType) => {
  return value.toLowerCase().replace(/\s+/g, '-')
}

/* =========================================
   THREE-DOTS MENU
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

const actions = computed(() => {
  const record = activeRecord.value

  if (!record) return []

  const items: {
    name: ChangeAction
    label: string
    icon: typeof Eye
    tone?: string
  }[] = [
    {
      name: 'view',
      label: 'View Employment Change',
      icon: Eye,
    },
  ]

  const finalStatuses: EmploymentChangeStatus[] = [
    'Effective',
    'Rejected',
    'Cancelled',
  ]

  if (finalStatuses.includes(record.status)) {
    return items
  }

  items.push({
    name: 'edit',
    label: 'Edit Employment Change',
    icon: Pencil,
  })

  if (record.status === 'Draft') {
    items.push({
      name: 'submit',
      label: 'Submit for Review',
      icon: Send,
    })
  }

  if (record.status === 'For Review') {
    items.push({
      name: 'submit',
      label: 'Submit for Approval',
      icon: Send,
    })
  }

  if (record.status === 'Pending Approval') {
    items.push({
      name: 'approve',
      label: 'Approve Change',
      icon: CheckCircle2,
      tone: 'success',
    })

    items.push({
      name: 'reject',
      label: 'Reject Change',
      icon: CircleX,
      tone: 'danger',
    })
  }

  if (record.status === 'Approved') {
    items.push({
      name: 'schedule',
      label: 'Schedule Change',
      icon: CalendarCheck,
    })

    items.push({
      name: 'effective',
      label: 'Mark as Effective',
      icon: BadgeCheck,
      tone: 'success',
    })
  }

  if (record.status === 'Scheduled') {
    items.push({
      name: 'effective',
      label: 'Mark as Effective',
      icon: BadgeCheck,
      tone: 'success',
    })
  }

  items.push({
    name: 'cancel',
    label: 'Cancel Change',
    icon: CircleX,
    tone: 'danger',
  })

  return items
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
  const height = menuRef.value?.offsetHeight ?? 210

  const gap = 6
  const padding = 8

  const spaceBelow = window.innerHeight - rect.bottom

  let top = spaceBelow >= height + gap
    ? rect.bottom + gap
    : rect.top - height - gap

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

const performAction = (action: ChangeAction) => {
  const record = activeRecord.value

  if (!record) return

  if (!actions.value.some(item => item.name === action)) {
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
    case 'submit':
      emit('submit', record)
      break
    case 'approve':
      emit('approve', record)
      break
    case 'schedule':
      emit('schedule', record)
      break
    case 'effective':
      emit('effective', record)
      break
    case 'reject':
      emit('reject', record)
      break
    case 'cancel':
      emit('cancel', record)
      break
  }
}

/* =========================================
   CLICK OUTSIDE / LIFECYCLE
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
      <h3>Employment Changes</h3>
      <p>
        Track changes to employee employment terms,
        work arrangements, contracts, compensation and status.
      </p>
    </div>

    <div v-if="records.length" class="table-scroll">
      <table class="change-table">
        <thead>
          <tr>
            <th>Change No.</th>
            <th>Employee</th>
            <th>Department</th>
            <th>Change Type</th>
            <th>Current Value</th>
            <th></th>
            <th>New Value</th>
            <th>Requested Date</th>
            <th>Effective Date</th>
            <th>Requested By</th>
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
                {{ item.changeNumber }}
              </strong>
            </td>

            <td>
              <div class="employee-cell">
                <span class="employee-avatar">
                  <UserRound :size="16" />
                </span>

                <div>
                  <strong>{{ item.employeeName }}</strong>
                  <small>
                    {{ item.employeeNumber }} · {{ item.position }}
                  </small>
                </div>
              </div>
            </td>

            <td>
              <strong class="department-name">
                {{ item.department }}
              </strong>
            </td>

            <td>
              <span
                class="type-badge"
                :class="typeClass(item.changeType)"
              >
                {{ item.changeType }}
              </span>
            </td>

            <td>
              <div class="value-card">
                <small>Current</small>
                <strong>{{ item.currentValue }}</strong>
              </div>
            </td>

            <td>
              <span class="change-arrow">
                <ArrowRight :size="16" />
              </span>
            </td>

            <td>
              <div class="value-card new">
                <small>New</small>
                <strong>{{ item.newValue }}</strong>
              </div>
            </td>

            <td>
              <div class="date-cell">
                <CalendarDays :size="13" />
                {{ formatDate(item.requestedDate) }}
              </div>
            </td>

            <td>
              <div class="date-cell effective-date">
                <CalendarDays :size="13" />
                <strong>{{ formatDate(item.effectiveDate) }}</strong>
              </div>
            </td>

            <td>
              <strong class="person-name">
                {{ item.requestedBy }}
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
              <p class="reason-text" :title="item.reason">
                {{ item.reason }}
              </p>
            </td>

            <td>
              <p
                class="remarks-text"
                :title="item.remarks || 'No remarks'"
              >
                {{ item.remarks || 'No remarks' }}
              </p>
            </td>

            <td class="actions-column">
              <button
                type="button"
                class="action-trigger"
                aria-label="Employment change actions"
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
      <FilePenLine :size="28" />
      <strong>No employment changes found</strong>
      <span>Try changing your employment change filters.</span>
    </div>

    <Teleport to="body">
      <div
        v-if="openId !== null"
        ref="menuRef"
        class="employment-change-menu"
        :style="menuStyle"
      >
        <button
          v-for="action in actions"
          :key="action.name"
          type="button"
          :class="action.tone"
          @click="performAction(action.name)"
        >
          <component :is="action.icon" :size="15" />
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

.change-table {
  width: 100%;
  min-width: 2350px;
  border-collapse: collapse;
}

.change-table th {
  padding: 11px 12px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 9px;
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
}

.change-table td {
  padding: 12px;
  border-top: 1px solid var(--border-soft);
  color: var(--text-secondary);
  font-size: 10px;
  vertical-align: middle;
}

.change-table tbody tr:hover {
  background: var(--bg-card-soft);
}

.record-number {
  color: var(--primary);
  white-space: nowrap;
}

.employee-cell {
  display: flex;
  min-width: 195px;
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
  background: var(--primary-soft);
  color: var(--primary);
}

.employee-cell strong,
.employee-cell small {
  display: block;
}

.employee-cell strong,
.department-name,
.person-name {
  color: var(--text-primary);
  font-size: 10px;
  white-space: nowrap;
}

.employee-cell small {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 9px;
}

.type-badge,
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

.type-badge.employment-type-change,
.status-badge.approved {
  background: var(--primary-soft);
  color: var(--primary);
}

.type-badge.contract-extension,
.status-badge.scheduled {
  background: var(--purple-soft);
  color: var(--purple);
}

.type-badge.work-arrangement-change,
.type-badge.compensation-adjustment,
.status-badge.effective {
  background: var(--green-soft);
  color: var(--green);
}

.type-badge.reporting-line-change,
.status-badge.for-review,
.status-badge.pending-approval {
  background: var(--orange-soft);
  color: var(--orange);
}

.type-badge.employment-status-change,
.status-badge.rejected,
.status-badge.cancelled {
  background: var(--red-soft);
  color: var(--red);
}

.status-badge.draft {
  background: var(--bg-card-soft);
  color: var(--text-muted);
}

.status-dot {
  width: 5px;
  height: 5px;
  flex-shrink: 0;
  border-radius: 50%;
  background: currentColor;
}

.value-card {
  width: 195px;
  padding: 9px 10px;
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  background: var(--bg-card-soft);
}

.value-card.new {
  border-color: var(--primary);
  background: var(--primary-soft);
}

.value-card small,
.value-card strong {
  display: block;
}

.value-card small {
  color: var(--text-muted);
  font-size: 8px;
  text-transform: uppercase;
}

.value-card strong {
  margin-top: 4px;
  color: var(--text-primary);
  font-size: 10px;
  line-height: 1.45;
}

.change-arrow {
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--primary-soft);
  color: var(--primary);
}

.date-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.date-cell svg {
  color: var(--text-muted);
}

.effective-date svg {
  color: var(--green);
}

.effective-date strong {
  color: var(--text-primary);
}

.approved-person {
  color: var(--green);
  white-space: nowrap;
}

.pending-text {
  color: var(--text-muted);
  font-style: italic;
}

.reason-text,
.remarks-text {
  width: 195px;
  margin: 0;
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remarks-text {
  width: 160px;
  color: var(--text-muted);
}

/* =========================================
   ACTIONS — NOT STICKY
========================================= */

.actions-column {
  position: static !important;
  width: 65px;
  text-align: center !important;
}

.action-trigger {
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

.action-trigger:hover,
.action-trigger[aria-expanded="true"] {
  border-color: var(--border);
  background: var(--bg-card-soft);
  color: var(--primary);
}

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
.employment-change-menu {
  position: fixed;
  z-index: 10020;
  width: 235px;
  padding: 6px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.25);
}

.employment-change-menu button {
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

.employment-change-menu button:hover {
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

.employment-change-menu button.success {
  color: var(--green);
}

.employment-change-menu button.danger {
  color: var(--red);
}
</style>
