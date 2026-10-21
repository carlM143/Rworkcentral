
<script setup lang="ts">
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  CircleCheck,
  Copy,
  Eye,
  FilePenLine,
  History,
  MoreHorizontal,
  TrendingUp,
  UserMinus,
  UserPlus,
  UserRound,
} from 'lucide-vue-next'

import type {
  LifecycleEventType,
  LifecycleHistoryRecord,
  LifecycleHistoryStatus,
} from '~/types/lifecycleHistory'

const props = defineProps<{
  records: LifecycleHistoryRecord[]
}>()

const emit = defineEmits<{
  view: [record: LifecycleHistoryRecord]
  timeline: [record: LifecycleHistoryRecord]
  copy: [record: LifecycleHistoryRecord]
}>()

/* =========================================
   HELPERS
========================================= */

const formatDate = (value?: string) => {
  if (!value) return '—'

  const date = new Date(
    value.includes('T') ? value : `${value}T00:00:00`,
  )

  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

const eventClass = (type: LifecycleEventType) => {
  return type.toLowerCase().replace(/\s+/g, '-')
}

const eventIcon = (type: LifecycleEventType) => {
  const icons = {
    Onboarding: UserPlus,
    Regularization: BadgeCheck,
    Transfer: BriefcaseBusiness,
    Promotion: TrendingUp,
    'Employment Change': FilePenLine,
    Offboarding: UserMinus,
  }

  return icons[type]
}

const statusClass = (value: LifecycleHistoryStatus) => {
  if (value === 'Completed' || value === 'Effective') {
    return 'success'
  }

  if (value === 'Approved') return 'approved'
  if (value === 'Scheduled') return 'scheduled'
  if (value === 'In Progress') return 'progress'

  return 'cancelled'
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

const closeMenu = () => {
  openId.value = null
  triggerRef.value = null
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

  const width = menuRef.value?.offsetWidth ?? 205
  const height = menuRef.value?.offsetHeight ?? 150

  const padding = 8
  const gap = 6

  const left = Math.max(
    padding,
    Math.min(
      rect.right - width,
      window.innerWidth - width - padding,
    ),
  )

  const spaceBelow = window.innerHeight - rect.bottom

  const preferredTop = spaceBelow >= height + gap
    ? rect.bottom + gap
    : rect.top - height - gap

  const top = Math.max(
    padding,
    Math.min(
      preferredTop,
      window.innerHeight - height - padding,
    ),
  )

  menuStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  }
}

const runAction = (
  action: 'view' | 'timeline' | 'copy',
) => {
  const record = props.records.find(
    item => item.id === openId.value,
  )

  closeMenu()

  if (!record) return

  emit(action, record)
}

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
  window.addEventListener('scroll', closeMenu, true)
  window.addEventListener('resize', closeMenu)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleOutside)
  window.removeEventListener('scroll', closeMenu, true)
  window.removeEventListener('resize', closeMenu)
})

watch(
  () => props.records,
  closeMenu,
)
</script>

<template>
  <article class="history-card">
    <div class="table-heading">
      <div>
        <h3>Employee Lifecycle History</h3>

        <p>
          Consolidated historical record of employee onboarding,
          movements, employment changes and separation events.
        </p>
      </div>
    </div>

    <div
      v-if="records.length"
      class="table-scroll"
    >
      <table class="history-table">
        <thead>
          <tr>
            <th>Reference</th>
            <th>Employee</th>
            <th>Lifecycle Event</th>
            <th>Event Details</th>
            <th>Change</th>
            <th>Effective Date</th>
            <th>Processed By</th>
            <th>Approved By</th>
            <th>Status</th>
            <th>Description</th>
            <th>Remarks</th>
            <th class="action-column">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="item in records"
            :key="item.id"
          >
            <td>
              <strong class="reference">
                {{ item.referenceNumber }}
              </strong>
            </td>

            <td>
              <div class="employee-cell">
                <div class="employee-avatar">
                  <UserRound :size="16" />
                </div>

                <div class="employee-information">
                  <strong>{{ item.employeeName }}</strong>
                  <span>{{ item.employeeNumber }}</span>
                  <span>
                    {{ item.department }} · {{ item.position }}
                  </span>
                </div>
              </div>
            </td>

            <td>
              <span
                class="event-type"
                :class="eventClass(item.eventType)"
              >
                <component
                  :is="eventIcon(item.eventType)"
                  :size="13"
                />

                {{ item.eventType }}
              </span>
            </td>

            <td>
              <div class="event-title">
                <History :size="13" />
                <strong>{{ item.eventTitle }}</strong>
              </div>
            </td>

            <td>
              <div
                v-if="item.previousValue || item.newValue"
                class="change-display"
              >
                <div class="change-value old">
                  <small>Previous</small>
                  <strong>{{ item.previousValue || '—' }}</strong>
                </div>

                <span class="change-arrow">
                  <ArrowRight :size="14" />
                </span>

                <div class="change-value new">
                  <small>New</small>
                  <strong>{{ item.newValue || '—' }}</strong>
                </div>
              </div>

              <span v-else class="muted">—</span>
            </td>

            <td>
              <div class="date-cell">
                <CalendarDays :size="13" />
                <strong>{{ formatDate(item.effectiveDate) }}</strong>
              </div>
            </td>

            <td>
              <strong class="person-name">
                {{ item.processedBy }}
              </strong>
            </td>

            <td>
              <strong
                v-if="item.approvedBy"
                class="approved-name"
              >
                {{ item.approvedBy }}
              </strong>

              <span v-else class="muted">
                Pending
              </span>
            </td>

            <td>
              <span
                class="status-badge"
                :class="statusClass(item.status)"
              >
                <CircleCheck
                  v-if="
                    item.status === 'Completed' ||
                    item.status === 'Effective'
                  "
                  :size="11"
                />

                <span
                  v-else
                  class="status-dot"
                />

                {{ item.status }}
              </span>
            </td>

            <td>
              <p
                class="truncate-text"
                :title="item.description"
              >
                {{ item.description }}
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

            <td class="action-column">
              <button
                type="button"
                class="action-trigger"
                :aria-expanded="openId === item.id"
                :aria-label="`Actions for ${item.referenceNumber}`"
                @click.stop="toggleMenu(item.id, $event)"
              >
                <MoreHorizontal :size="18" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-else
      class="empty-state"
    >
      <History :size="30" />

      <strong>No lifecycle history found</strong>

      <span>
        Try changing your lifecycle history filters.
      </span>
    </div>

    <!-- TELEPORTED ACTION MENU -->

    <Teleport to="body">
      <div
        v-if="openId !== null"
        ref="menuRef"
        class="lifecycle-history-actions-menu"
        :style="menuStyle"
      >
        <button
          type="button"
          @click="runAction('view')"
        >
          <Eye :size="15" />
          View Event Details
        </button>

        <button
          type="button"
          @click="runAction('timeline')"
        >
          <History :size="15" />
          Employee Timeline
        </button>

        <div class="menu-divider"></div>

        <button
          type="button"
          @click="runAction('copy')"
        >
          <Copy :size="15" />
          Copy Reference
        </button>
      </div>
    </Teleport>
  </article>
</template>

<style scoped>
.history-card {
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
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
}

.history-table {
  width: 100%;
  min-width: 2250px;
  border-collapse: collapse;
}

.history-table th {
  padding: 12px 13px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 9px;
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
}

.history-table td {
  padding: 12px 13px;
  border-top: 1px solid var(--border-soft);
  color: var(--text-secondary);
  font-size: 10px;
  vertical-align: middle;
}

.history-table tbody tr:hover {
  background: var(--bg-card-soft);
}

.reference {
  color: var(--primary);
  font-size: 10px;
  white-space: nowrap;
}

.employee-cell {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 200px;
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

.employee-information strong,
.employee-information span {
  display: block;
}

.employee-information strong {
  color: var(--text-primary);
  font-size: 10px;
}

.employee-information span {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 9px;
}

.event-type {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 9px;
  border-radius: 20px;
  font-size: 9px;
  font-weight: 650;
  white-space: nowrap;
}

.event-type.onboarding,
.event-type.employment-change {
  background: var(--primary-soft);
  color: var(--primary);
}

.event-type.regularization {
  background: var(--green-soft);
  color: var(--green);
}

.event-type.transfer {
  background: var(--purple-soft);
  color: var(--purple);
}

.event-type.promotion {
  background: var(--orange-soft);
  color: var(--orange);
}

.event-type.offboarding {
  background: var(--red-soft);
  color: var(--red);
}

.event-title {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 170px;
}

.event-title svg {
  color: var(--text-muted);
}

.event-title strong,
.person-name {
  color: var(--text-primary);
  font-size: 10px;
}

.change-display {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 330px;
}

.change-value {
  width: 140px;
  min-height: 43px;
  padding: 7px 9px;
  border: 1px solid var(--border-soft);
  border-radius: 7px;
  background: var(--bg-card-soft);
}

.change-value.new {
  border-color: color-mix(
    in srgb,
    var(--green) 25%,
    var(--border)
  );
  background: var(--green-soft);
}

.change-value small,
.change-value strong {
  display: block;
}

.change-value small {
  color: var(--text-muted);
  font-size: 8px;
  text-transform: uppercase;
}

.change-value strong {
  margin-top: 4px;
  color: var(--text-primary);
  font-size: 9px;
}

.change-arrow {
  display: flex;
  width: 25px;
  height: 25px;
  flex-shrink: 0;
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

.date-cell svg,
.approved-name {
  color: var(--green);
}

.date-cell strong {
  color: var(--text-primary);
}

.person-name,
.approved-name {
  white-space: nowrap;
}

.muted {
  color: var(--text-muted);
}

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

.status-badge.success {
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

.status-badge.progress {
  background: var(--orange-soft);
  color: var(--orange);
}

.status-badge.cancelled {
  background: var(--red-soft);
  color: var(--red);
}

.truncate-text {
  width: 210px;
  margin: 0;
  overflow: hidden;
  font-size: 10px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.truncate-text.remarks {
  width: 170px;
  color: var(--text-muted);
}

/* ACTIONS - NOT STICKY */

.action-column {
  width: 65px;
  text-align: center !important;
  position: static;
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
  min-height: 250px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 9px;
  color: var(--text-muted);
}

.empty-state strong {
  color: var(--text-primary);
  font-size: 13px;
}

.empty-state span {
  font-size: 10px;
}
</style>

<style>
.lifecycle-history-actions-menu {
  position: fixed;
  z-index: 10030;
  width: 205px;
  padding: 6px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.25);
}

.lifecycle-history-actions-menu button {
  display: flex;
  width: 100%;
  min-height: 36px;
  align-items: center;
  gap: 9px;
  padding: 0 10px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 11px;
  text-align: left;
  cursor: pointer;
}

.lifecycle-history-actions-menu button:hover {
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

.lifecycle-history-actions-menu .menu-divider {
  margin: 5px 4px;
  border-top: 1px solid var(--border-soft);
}
</style>
