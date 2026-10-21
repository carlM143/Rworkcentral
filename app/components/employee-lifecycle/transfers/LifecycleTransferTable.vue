
<script setup lang="ts">
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleX,
  ClipboardCheck,
  Eye,
  MapPin,
  MoreHorizontal,
  Pencil,
  RefreshCcw,
  UserRound,
} from 'lucide-vue-next'

import type {
  LifecycleTransfer,
  LifecycleTransferStatus,
  LifecycleTransferType,
} from '~/types/lifecycleTransfer'

const props = defineProps<{
  records: LifecycleTransfer[]
}>()

const emit = defineEmits<{
  view: [record: LifecycleTransfer]
  edit: [record: LifecycleTransfer]
  status: [record: LifecycleTransfer]
  approve: [record: LifecycleTransfer]
  complete: [record: LifecycleTransfer]
  cancel: [record: LifecycleTransfer]
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

const statusClass = (value: LifecycleTransferStatus) => {
  return value.toLowerCase().replace(/\s+/g, '-')
}

const typeClass = (value: LifecycleTransferType) => {
  if (value === 'Department Transfer') return 'department'
  if (value === 'Position Transfer') return 'position'
  if (value === 'Branch Transfer') return 'branch'
  if (value === 'Client Assignment Transfer') return 'client'

  return 'internal'
}

/* =========================================
   ACTION DROPDOWN
========================================= */

const openId = ref<number | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)

const menuStyle = ref({
  top: '0px',
  left: '0px',
})

const activeRecord = computed(() => {
  return props.records.find(record => record.id === openId.value)
})

const closeMenu = () => {
  openId.value = null
}

const toggleMenu = async (id: number, event: MouseEvent) => {
  if (openId.value === id) {
    closeMenu()
    return
  }

  triggerRef.value = event.currentTarget as HTMLElement
  openId.value = id

  await nextTick()

  if (!triggerRef.value) return

  const rect = triggerRef.value.getBoundingClientRect()

  const width = menuRef.value?.offsetWidth ?? 210
  const height = menuRef.value?.offsetHeight ?? 220

  const gap = 6
  const padding = 8

  let top = rect.bottom + gap

  if (top + height > window.innerHeight - padding) {
    top = rect.top - height - gap
  }

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

/* =========================================
   ACTION EVENTS
========================================= */

type TransferAction =
  | 'view'
  | 'edit'
  | 'status'
  | 'approve'
  | 'complete'
  | 'cancel'

const performAction = (action: TransferAction) => {
  const record = activeRecord.value

  closeMenu()

  if (!record) return

  const finalStatuses: LifecycleTransferStatus[] = [
    'Effective',
    'Rejected',
    'Cancelled',
  ]

  if (action !== 'view' && finalStatuses.includes(record.status)) {
    return
  }

  if (
    action === 'approve' &&
    record.status !== 'Pending Approval'
  ) {
    return
  }

  if (
    action === 'complete' &&
    !['Approved', 'Scheduled'].includes(record.status)
  ) {
    return
  }

  emit(action, record)
}

/* =========================================
   CLICK OUTSIDE
========================================= */

const handleOutsideClick = (event: MouseEvent) => {
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
  document.addEventListener('mousedown', handleOutsideClick)
  window.addEventListener('resize', closeMenu)
  window.addEventListener('scroll', closeMenu, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleOutsideClick)
  window.removeEventListener('resize', closeMenu)
  window.removeEventListener('scroll', closeMenu, true)
})
</script>

<template>
  <article class="transfer-table-card">
    <!-- HEADER -->
    <div class="table-heading">
      <div>
        <h3>Employee Transfer Records</h3>

        <p>
          Track department, position, branch and assignment
          movements across the employee lifecycle.
        </p>
      </div>
    </div>

    <!-- TABLE -->
    <div v-if="records.length" class="table-scroll">
      <table class="transfer-table">
        <thead>
          <tr>
            <th>Transfer No.</th>
            <th>Employee</th>
            <th>Transfer Type</th>
            <th>Current Assignment</th>
            <th class="arrow-column"></th>
            <th>New Assignment</th>
            <th>Requested Date</th>
            <th>Effective Date</th>
            <th>Requested By</th>
            <th>Approved By</th>
            <th>Status</th>
            <th>Reason</th>
            <th>Remarks</th>
            <th class="action-column">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="item in records"
            :key="item.id"
          >
            <!-- TRANSFER NUMBER -->
            <td>
              <strong class="transfer-number">
                {{ item.transferNumber }}
              </strong>
            </td>

            <!-- EMPLOYEE -->
            <td>
              <div class="employee-cell">
                <div class="employee-avatar">
                  <UserRound :size="16" />
                </div>

                <div class="employee-info">
                  <strong>{{ item.employeeName }}</strong>
                  <span>{{ item.employeeNumber }}</span>
                </div>
              </div>
            </td>

            <!-- TRANSFER TYPE -->
            <td>
              <span
                class="type-badge"
                :class="typeClass(item.transferType)"
              >
                {{ item.transferType }}
              </span>
            </td>

            <!-- CURRENT ASSIGNMENT -->
            <td>
              <div class="assignment-card current">
                <div class="assignment-title">
                  <Building2 :size="13" />
                  <strong>{{ item.currentDepartment }}</strong>
                </div>

                <span>{{ item.currentPosition }}</span>

                <div class="branch-row">
                  <MapPin :size="11" />
                  {{ item.currentBranch }}
                </div>
              </div>
            </td>

            <!-- ARROW -->
            <td class="arrow-column">
              <div class="transfer-arrow">
                <ArrowRight :size="16" />
              </div>
            </td>

            <!-- NEW ASSIGNMENT -->
            <td>
              <div class="assignment-card destination">
                <div class="assignment-title">
                  <Building2 :size="13" />
                  <strong>{{ item.newDepartment }}</strong>
                </div>

                <span>{{ item.newPosition }}</span>

                <div class="branch-row">
                  <MapPin :size="11" />
                  {{ item.newBranch }}
                </div>
              </div>
            </td>

            <!-- REQUESTED DATE -->
            <td>
              <div class="date-cell">
                <CalendarDays :size="13" />
                {{ formatDate(item.requestedDate) }}
              </div>
            </td>

            <!-- EFFECTIVE DATE -->
            <td>
              <div class="date-cell effective-date">
                <CalendarDays :size="13" />

                <strong>
                  {{ formatDate(item.effectiveDate) }}
                </strong>
              </div>
            </td>

            <!-- REQUESTED BY -->
            <td>
              <strong class="person-name">
                {{ item.requestedBy }}
              </strong>
            </td>

            <!-- APPROVED BY -->
            <td>
              <strong
                v-if="item.approvedBy"
                class="person-name approved-person"
              >
                {{ item.approvedBy }}
              </strong>

              <span v-else class="pending-text">
                Pending
              </span>
            </td>

            <!-- STATUS -->
            <td>
              <span
                class="status-badge"
                :class="statusClass(item.status)"
              >
                <span class="status-dot"></span>
                {{ item.status }}
              </span>
            </td>

            <!-- REASON -->
            <td>
              <p class="reason-text" :title="item.reason">
                {{ item.reason }}
              </p>
            </td>

            <!-- REMARKS -->
            <td>
              <p
                class="remarks-text"
                :title="item.remarks || 'No remarks'"
              >
                {{ item.remarks || 'No remarks' }}
              </p>
            </td>

            <!-- ACTIONS -->
            <td class="action-column">
              <button
                type="button"
                class="action-trigger"
                aria-label="Transfer actions"
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

    <!-- EMPTY STATE -->
    <div v-else class="empty-state">
      <ArrowRight :size="30" />

      <strong>No employee transfers found</strong>

      <span>
        Try changing the filters or create a new transfer.
      </span>
    </div>

    <!-- ACTION MENU -->
    <Teleport to="body">
      <div
        v-if="openId !== null"
        ref="menuRef"
        class="lifecycle-transfer-actions-menu"
        :style="menuStyle"
      >
        <button
          type="button"
          @click="performAction('view')"
        >
          <Eye :size="15" />
          View Transfer
        </button>

        <template
          v-if="
            activeRecord &&
            !['Effective', 'Rejected', 'Cancelled'].includes(activeRecord.status)
          "
        >
          <button
            type="button"
            @click="performAction('edit')"
          >
            <Pencil :size="15" />
            Edit Transfer
          </button>

          <button
            type="button"
            @click="performAction('status')"
          >
            <RefreshCcw :size="15" />
            Update Status
          </button>

          <button
            v-if="activeRecord.status === 'Pending Approval'"
            type="button"
            class="success-action"
            @click="performAction('approve')"
          >
            <ClipboardCheck :size="15" />
            Approve Transfer
          </button>

          <button
            v-if="['Approved', 'Scheduled'].includes(activeRecord.status)"
            type="button"
            class="success-action"
            @click="performAction('complete')"
          >
            <CheckCircle2 :size="15" />
            Complete Transfer
          </button>

          <div class="menu-divider"></div>

          <button
            type="button"
            class="danger-action"
            @click="performAction('cancel')"
          >
            <CircleX :size="15" />
            Cancel Transfer
          </button>
        </template>
      </div>
    </Teleport>
  </article>
</template>

<style scoped>
.transfer-table-card {
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

.transfer-table {
  width: 100%;
  min-width: 2050px;
  border-collapse: collapse;
}

.transfer-table th {
  padding: 11px 12px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 9px;
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
}

.transfer-table td {
  padding: 11px 12px;
  border-top: 1px solid var(--border-soft);
  color: var(--text-secondary);
  font-size: 10px;
  vertical-align: middle;
}

.transfer-table tbody tr:hover {
  background: var(--bg-card-soft);
}

.transfer-number {
  color: var(--primary);
  white-space: nowrap;
}

.employee-cell {
  display: flex;
  min-width: 175px;
  align-items: center;
  gap: 9px;
}

.employee-avatar {
  display: flex;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--primary-soft);
  color: var(--primary);
}

.employee-info strong,
.employee-info span {
  display: block;
}

.employee-info strong {
  color: var(--text-primary);
  font-size: 10px;
}

.employee-info span {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 9px;
}

.type-badge {
  display: inline-flex;
  padding: 5px 9px;
  border-radius: 20px;
  font-size: 9px;
  font-weight: 650;
  white-space: nowrap;
}

.type-badge.department {
  background: var(--primary-soft);
  color: var(--primary);
}

.type-badge.position {
  background: var(--purple-soft);
  color: var(--purple);
}

.type-badge.branch {
  background: var(--orange-soft);
  color: var(--orange);
}

.type-badge.client {
  background: var(--green-soft);
  color: var(--green);
}

.type-badge.internal {
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

.assignment-card {
  min-width: 185px;
  padding: 9px 10px;
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  background: var(--bg-card-soft);
}

.assignment-card.destination {
  border-color: var(--border);
  background: var(--primary-soft);
}

.assignment-title,
.branch-row {
  display: flex;
  align-items: center;
  gap: 5px;
}

.assignment-title svg {
  color: var(--primary);
}

.assignment-title strong {
  color: var(--text-primary);
  font-size: 10px;
}

.assignment-card > span {
  display: block;
  margin-top: 4px;
  color: var(--text-secondary);
  font-size: 9px;
}

.branch-row {
  margin-top: 5px;
  color: var(--text-muted);
  font-size: 9px;
}

.arrow-column {
  width: 40px;
  text-align: center !important;
}

.transfer-arrow {
  display: flex;
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

.effective-date strong,
.person-name {
  color: var(--text-primary);
  white-space: nowrap;
}

.approved-person {
  color: var(--green);
}

.pending-text {
  color: var(--text-muted);
  font-style: italic;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 9px;
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

.status-badge.effective {
  background: var(--green-soft);
  color: var(--green);
}

.status-badge.approved {
  background: var(--primary-soft);
  color: var(--primary);
}

.status-badge.scheduled {
  background: var(--purple-soft);
  color: var(--purple);
}

.status-badge.pending-approval {
  background: var(--orange-soft);
  color: var(--orange);
}

.status-badge.rejected,
.status-badge.cancelled {
  background: var(--red-soft);
  color: var(--red);
}

.status-badge.draft {
  background: var(--bg-card-soft);
  color: var(--text-muted);
}

.reason-text,
.remarks-text {
  width: 180px;
  margin: 0;
  overflow: hidden;
  color: var(--text-secondary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remarks-text {
  color: var(--text-muted);
}

/* =========================================
   ACTIONS - NOT STICKY
========================================= */

.action-column {
  width: 58px;
  position: static !important;
  left: auto !important;
  right: auto !important;
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
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.action-trigger:hover,
.action-trigger[aria-expanded="true"] {
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
.lifecycle-transfer-actions-menu {
  position: fixed;
  z-index: 10020;
  width: 210px;
  padding: 6px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.25);
}

.lifecycle-transfer-actions-menu button {
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

.lifecycle-transfer-actions-menu button:hover {
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

.lifecycle-transfer-actions-menu .success-action {
  color: var(--green);
}

.lifecycle-transfer-actions-menu .danger-action {
  color: var(--red);
}

.lifecycle-transfer-actions-menu .menu-divider {
  margin: 5px 4px;
  border-top: 1px solid var(--border-soft);
}
</style>
