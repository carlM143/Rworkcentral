
<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  CircleCheck,
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

defineProps<{
  records: LifecycleHistoryRecord[]
}>()

const emit = defineEmits<{
  view: [item: LifecycleHistoryRecord]
  timeline: [item: LifecycleHistoryRecord]
}>()

const activeRecord = ref<LifecycleHistoryRecord | null>(null)
const menuPosition = ref({ top: 0, left: 0 })

const formatDate = (value?: string) => {
  if (!value) return '—'

  const date = new Date(`${value.slice(0, 10)}T00:00:00`)

  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date)
}

const eventClass = (type: LifecycleEventType) => {
  const classes: Record<string, string> = {
    Onboarding: 'onboarding',
    Regularization: 'regularization',
    Transfer: 'transfer',
    Promotion: 'promotion',
    'Employment Change': 'change',
    Offboarding: 'offboarding',
  }

  return classes[type] || 'change'
}

const eventIcon = (type: LifecycleEventType) => {
  const icons: Record<string, any> = {
    Onboarding: UserPlus,
    Regularization: BadgeCheck,
    Transfer: BriefcaseBusiness,
    Promotion: TrendingUp,
    'Employment Change': FilePenLine,
    Offboarding: UserMinus,
  }

  return icons[type] || History
}

const statusClass = (status: LifecycleHistoryStatus) => {
  if (status === 'Completed' || status === 'Effective') return 'success'
  if (status === 'Approved') return 'approved'
  if (status === 'Scheduled') return 'scheduled'
  if (status === 'In Progress') return 'progress'
  return 'cancelled'
}

const closeMenu = () => {
  activeRecord.value = null
}

const toggleMenu = async (
  item: LifecycleHistoryRecord,
  event: MouseEvent,
) => {
  if (activeRecord.value?.id === item.id) {
    closeMenu()
    return
  }

  const button = event.currentTarget as HTMLElement
  activeRecord.value = item

  await nextTick()

  const rect = button.getBoundingClientRect()
  const width = 215
  const height = 100
  const gap = 6

  menuPosition.value = {
    left: Math.max(
      8,
      Math.min(rect.right - width, window.innerWidth - width - 8),
    ),
    top: rect.bottom + height + gap > window.innerHeight
      ? Math.max(8, rect.top - height - gap)
      : rect.bottom + gap,
  }
}

const selectAction = (action: 'view' | 'timeline') => {
  const record = activeRecord.value
  closeMenu()

  if (!record) return

  if (action === 'view') {
    emit('view', record)
  } else {
    emit('timeline', record)
  }
}

const handleOutsideClick = (event: MouseEvent) => {
  if (!(event.target instanceof Element)) return

  if (
    event.target.closest('.lh-action-button') ||
    event.target.closest('.lh-action-menu')
  ) return

  closeMenu()
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') closeMenu()
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', closeMenu)
  window.addEventListener('scroll', closeMenu, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', closeMenu)
  window.removeEventListener('scroll', closeMenu, true)
})
</script>

<template>
  <article class="history-card">
    <div class="table-heading">
      <h3>Employee Lifecycle History</h3>
      <p>
        Consolidated historical record of employee onboarding, movements,
        employment changes and separation events.
      </p>
    </div>

    <div v-if="records.length" class="table-scroll">
      <table>
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
            <th class="actions-header">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in records" :key="item.id">
            <td>
              <strong class="reference">
                {{ item.referenceNumber }}
              </strong>
            </td>

            <td>
              <div class="employee-cell">
                <div class="employee-avatar">
                  <UserRound :size="17" />
                </div>

                <div class="employee-info">
                  <strong>{{ item.employeeName }}</strong>
                  <span>{{ item.employeeNumber }}</span>
                  <span>{{ item.department }} · {{ item.position }}</span>
                </div>
              </div>
            </td>

            <td>
              <div class="event-type" :class="eventClass(item.eventType)">
                <component :is="eventIcon(item.eventType)" :size="14" />
                <span>{{ item.eventType }}</span>
              </div>
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
                <div class="change-value">
                  <span>Previous</span>
                  <strong>{{ item.previousValue || '—' }}</strong>
                </div>

                <div class="change-arrow">
                  <ArrowRight :size="15" />
                </div>

                <div class="change-value new">
                  <span>New</span>
                  <strong>{{ item.newValue || '—' }}</strong>
                </div>
              </div>

              <span v-else class="not-applicable">—</span>
            </td>

            <td>
              <div class="date-cell">
                <CalendarDays :size="13" />
                <strong>{{ formatDate(item.effectiveDate) }}</strong>
              </div>
            </td>

            <td>
              <strong class="person-name">{{ item.processedBy }}</strong>
            </td>

            <td>
              <strong v-if="item.approvedBy" class="person-name approved">
                {{ item.approvedBy }}
              </strong>
              <span v-else class="pending-text">Pending</span>
            </td>

            <td>
              <span class="status-badge" :class="statusClass(item.status)">
                <CircleCheck
                  v-if="item.status === 'Completed' || item.status === 'Effective'"
                  :size="11"
                />
                <span v-else class="status-dot" />
                {{ item.status }}
              </span>
            </td>

            <td>
              <p class="description" :title="item.description">
                {{ item.description }}
              </p>
            </td>

            <td>
              <p class="remarks" :title="item.remarks || 'No remarks'">
                {{ item.remarks || 'No remarks' }}
              </p>
            </td>

            <td class="actions-cell">
              <button
                type="button"
                class="lh-action-button"
                :aria-label="`Actions for ${item.referenceNumber}`"
                aria-haspopup="menu"
                :aria-expanded="activeRecord?.id === item.id"
                @click.stop="toggleMenu(item, $event)"
              >
                <MoreHorizontal :size="18" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-state">
      <History :size="36" />
      <strong>No lifecycle history found</strong>
      <span>Try changing your lifecycle history filters.</span>
    </div>
  </article>

  <Teleport to="body">
    <div
      v-if="activeRecord"
      class="lh-action-menu"
      role="menu"
      :style="{
        top: `${menuPosition.top}px`,
        left: `${menuPosition.left}px`,
      }"
    >
      <button
        type="button"
        role="menuitem"
        @click="selectAction('view')"
      >
        <Eye :size="15" />
        <span>View History Details</span>
      </button>

      <button
        type="button"
        role="menuitem"
        @click="selectAction('timeline')"
      >
        <History :size="15" />
        <span>View Employee Timeline</span>
      </button>
    </div>
  </Teleport>
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
  padding: 16px 17px;
  border-bottom: 1px solid var(--border-soft);
}

.table-heading h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 700;
}

.table-heading p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 11px;
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 2550px;
  border-collapse: collapse;
}

th {
  padding: 12px 13px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
}

td {
  padding: 13px;
  border-top: 1px solid var(--border-soft);
  color: var(--text-secondary);
  font-size: 10.5px;
  vertical-align: middle;
}

tbody tr:hover {
  background: var(--bg-card-soft);
}

.reference {
  color: var(--primary);
  white-space: nowrap;
}

.employee-cell {
  display: flex;
  min-width: 225px;
  align-items: center;
  gap: 9px;
}

.employee-avatar {
  display: flex;
  width: 37px;
  height: 37px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: var(--primary-soft);
  color: var(--primary);
}

.employee-info strong,
.employee-info span {
  display: block;
}

.employee-info strong {
  color: var(--text-primary);
  font-size: 11px;
}

.employee-info span {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 9.5px;
}

.event-type {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 8px;
  border-radius: 8px;
  font-size: 9px;
  font-weight: 650;
  white-space: nowrap;
}

.event-type.onboarding,
.event-type.change {
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
  min-width: 180px;
  align-items: center;
  gap: 6px;
}

.event-title svg {
  color: var(--text-muted);
}

.event-title strong {
  color: var(--text-primary);
  font-size: 10.5px;
}

.change-display {
  display: flex;
  min-width: 410px;
  align-items: center;
  gap: 8px;
}

.change-value {
  width: 165px;
  padding: 8px 9px;
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  background: var(--bg-card-soft);
}

.change-value.new {
  border-color: var(--green);
  background: var(--green-soft);
}

.change-value span,
.change-value strong {
  display: block;
}

.change-value span {
  color: var(--text-muted);
  font-size: 8px;
  font-weight: 600;
  text-transform: uppercase;
}

.change-value strong {
  margin-top: 3px;
  color: var(--text-primary);
  font-size: 9.5px;
  line-height: 1.4;
}

.change-arrow {
  display: flex;
  width: 27px;
  height: 27px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--primary-soft);
  color: var(--primary);
}

.not-applicable,
.pending-text {
  color: var(--text-muted);
}

.pending-text {
  font-style: italic;
}

.date-cell {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--green);
  white-space: nowrap;
}

.date-cell strong {
  color: var(--text-primary);
}

.person-name {
  color: var(--text-primary);
  white-space: nowrap;
}

.person-name.approved {
  color: var(--green);
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

.description,
.remarks {
  width: 235px;
  margin: 0;
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remarks {
  width: 190px;
  color: var(--text-muted);
}

.actions-header,
.actions-cell {
  text-align: right;
}

.lh-action-button {
  display: inline-flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.18s ease;
}

.lh-action-button:hover,
.lh-action-button[aria-expanded='true'] {
  border-color: var(--border);
  background: var(--bg-card-soft);
  color: var(--primary);
}

.empty-state {
  display: flex;
  min-height: 280px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-muted);
}

.empty-state strong {
  color: var(--text-primary);
  font-size: 13px;
}

.empty-state span {
  font-size: 11px;
}
</style>

<style>
.lh-action-menu {
  position: fixed;
  z-index: 99999;
  width: 215px;
  padding: 6px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3);
}

.lh-action-menu button {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  padding: 11px 12px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 11px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
}

.lh-action-menu button svg {
  flex-shrink: 0;
  color: var(--text-secondary);
}

.lh-action-menu button:hover {
  background: var(--bg-card-soft);
  color: var(--primary);
}

.lh-action-menu button:hover svg {
  color: var(--primary);
}
</style>
