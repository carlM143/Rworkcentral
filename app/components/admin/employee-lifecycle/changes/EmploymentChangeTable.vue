
<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'

import {
  ArrowRight,
  CalendarDays,
  FilePenLine,
  MoreHorizontal,
  UserRound,
  Eye,
  Pencil,
} from 'lucide-vue-next'

import type {
  EmploymentChangeRecord,
  EmploymentChangeStatus,
  EmploymentChangeType,
} from '~/types/employmentChange'

defineProps<{
  records: EmploymentChangeRecord[]
}>()

const emit = defineEmits<{
  view: [item: EmploymentChangeRecord]
  edit: [item: EmploymentChangeRecord]
}>()

const activeRecord = ref<EmploymentChangeRecord | null>(null)
const menuPosition = ref({ top: 0, left: 0 })

const formatDate = (value?: string) => {
  if (!value) return '—'

  const date = new Date(`${value.slice(0, 10)}T00:00:00`)

  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

const statusClass = (status: EmploymentChangeStatus) => {
  switch (status) {
    case 'Effective': return 'effective'
    case 'Approved': return 'approved'
    case 'Scheduled': return 'scheduled'
    case 'Pending Approval': return 'pending'
    case 'For Review': return 'review'
    case 'Rejected':
    case 'Cancelled': return 'rejected'
    default: return 'draft'
  }
}

const typeClass = (type: EmploymentChangeType) => {
  switch (type) {
    case 'Employment Type Change': return 'employment'
    case 'Contract Extension': return 'contract'
    case 'Work Arrangement Change': return 'arrangement'
    case 'Reporting Line Change': return 'reporting'
    case 'Compensation Adjustment': return 'compensation'
    default: return 'status'
  }
}

const closeMenu = () => {
  activeRecord.value = null
}

const toggleMenu = async (
  item: EmploymentChangeRecord,
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
  const width = 225
  const height = 102
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

const selectAction = (action: 'view' | 'edit') => {
  const item = activeRecord.value

  closeMenu()

  if (!item) return

  emit(action, item)
}

const handleOutsideClick = (event: MouseEvent) => {
  if (!(event.target instanceof Element)) return

  if (
    event.target.closest('.ec-action-button') ||
    event.target.closest('.ec-action-menu')
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
  <article class="ec-table-card">
    <div class="ec-table-heading">
      <h3>Employment Changes</h3>
      <p>
        Track changes to employee employment terms, work arrangements,
        contracts, compensation and status.
      </p>
    </div>

    <div v-if="records.length" class="ec-table-scroll">
      <table>
        <thead>
          <tr>
            <th>Change No.</th>
            <th>Employee</th>
            <th>Department</th>
            <th>Change Type</th>
            <th>Current Value</th>
            <th />
            <th>New Value</th>
            <th>Requested Date</th>
            <th>Effective Date</th>
            <th>Requested By</th>
            <th>Approved By</th>
            <th>Status</th>
            <th>Reason</th>
            <th>Remarks</th>
            <th class="ec-actions-heading">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in records" :key="item.id">
            <!-- CHANGE NUMBER -->
            <td>
              <strong class="ec-record-number">
                {{ item.changeNumber }}
              </strong>
            </td>

            <!-- EMPLOYEE -->
            <td>
              <div class="ec-employee-cell">
                <div class="ec-employee-avatar">
                  <UserRound :size="17" />
                </div>

                <div class="ec-employee-info">
                  <strong>{{ item.employeeName }}</strong>
                  <span>
                    {{ item.employeeNumber }} · {{ item.position }}
                  </span>
                </div>
              </div>
            </td>

            <!-- DEPARTMENT -->
            <td>
              <strong class="ec-department">
                {{ item.department }}
              </strong>
            </td>

            <!-- CHANGE TYPE -->
            <td>
              <span
                class="ec-type-badge"
                :class="typeClass(item.changeType)"
              >
                {{ item.changeType }}
              </span>
            </td>

            <!-- CURRENT VALUE -->
            <td>
              <div class="ec-value-card">
                <span>Current</span>
                <strong>{{ item.currentValue }}</strong>
              </div>
            </td>

            <!-- ARROW -->
            <td>
              <div class="ec-change-arrow">
                <ArrowRight :size="18" />
              </div>
            </td>

            <!-- NEW VALUE -->
            <td>
              <div class="ec-value-card new">
                <span>New</span>
                <strong>{{ item.newValue }}</strong>
              </div>
            </td>

            <!-- REQUESTED DATE -->
            <td>
              <div class="ec-date-cell">
                <CalendarDays :size="13" />
                {{ formatDate(item.requestedDate) }}
              </div>
            </td>

            <!-- EFFECTIVE DATE -->
            <td>
              <div class="ec-date-cell effective">
                <CalendarDays :size="13" />
                <strong>{{ formatDate(item.effectiveDate) }}</strong>
              </div>
            </td>

            <!-- REQUESTED BY -->
            <td>
              <strong class="ec-person">
                {{ item.requestedBy }}
              </strong>
            </td>

            <!-- APPROVED BY -->
            <td>
              <strong
                v-if="item.approvedBy"
                class="ec-person approved"
              >
                {{ item.approvedBy }}
              </strong>

              <span v-else class="ec-pending-text">
                Pending
              </span>
            </td>

            <!-- STATUS -->
            <td>
              <span
                class="ec-status-badge"
                :class="statusClass(item.status)"
              >
                <span class="ec-status-dot" />
                {{ item.status }}
              </span>
            </td>

            <!-- REASON -->
            <td>
              <p class="ec-truncated" :title="item.reason">
                {{ item.reason }}
              </p>
            </td>

            <!-- REMARKS -->
            <td>
              <p
                class="ec-truncated remarks"
                :title="item.remarks || 'No remarks'"
              >
                {{ item.remarks || 'No remarks' }}
              </p>
            </td>

            <!-- ACTIONS -->
            <td class="ec-actions-cell">
              <button
                type="button"
                class="ec-action-button"
                :aria-label="`Actions for ${item.changeNumber}`"
                :aria-expanded="activeRecord?.id === item.id"
                aria-haspopup="menu"
                @click.stop="toggleMenu(item, $event)"
              >
                <MoreHorizontal :size="18" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="ec-empty-state">
      <FilePenLine :size="36" />
      <strong>No employment changes found</strong>
      <span>Try changing your employment change filters.</span>
    </div>
  </article>

  <!-- TELEPORTED ACTIONS MENU -->
  <Teleport to="body">
    <div
      v-if="activeRecord"
      class="ec-action-menu"
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
        View Employment Change
      </button>

      <button
        type="button"
        role="menuitem"
        @click="selectAction('edit')"
      >
        <Pencil :size="15" />
        Edit Employment Change
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
.ec-table-card {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.ec-table-heading {
  padding: 16px 17px;
  border-bottom: 1px solid var(--border-soft);
}

.ec-table-heading h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 700;
}

.ec-table-heading p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 11px;
}

.ec-table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 2500px;
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

.ec-record-number {
  color: var(--primary);
  white-space: nowrap;
}

.ec-employee-cell {
  display: flex;
  min-width: 230px;
  align-items: center;
  gap: 9px;
}

.ec-employee-avatar {
  display: flex;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: var(--primary-soft);
  color: var(--primary);
}

.ec-employee-info strong,
.ec-employee-info span {
  display: block;
}

.ec-employee-info strong {
  color: var(--text-primary);
  font-size: 11px;
}

.ec-employee-info span {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 9.5px;
}

.ec-department,
.ec-person {
  color: var(--text-primary);
  white-space: nowrap;
}

.ec-person.approved {
  color: var(--green);
}

.ec-pending-text {
  color: var(--text-muted);
  font-style: italic;
}

.ec-type-badge,
.ec-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 8px;
  border-radius: 20px;
  font-size: 9px;
  font-weight: 650;
  white-space: nowrap;
}

.ec-type-badge.employment,
.ec-status-badge.approved {
  background: var(--primary-soft);
  color: var(--primary);
}

.ec-type-badge.contract,
.ec-status-badge.scheduled {
  background: var(--purple-soft);
  color: var(--purple);
}

.ec-type-badge.arrangement,
.ec-type-badge.compensation,
.ec-status-badge.effective {
  background: var(--green-soft);
  color: var(--green);
}

.ec-type-badge.reporting,
.ec-status-badge.pending,
.ec-status-badge.review {
  background: var(--orange-soft);
  color: var(--orange);
}

.ec-type-badge.status,
.ec-status-badge.rejected {
  background: var(--red-soft);
  color: var(--red);
}

.ec-status-badge.draft {
  background: var(--bg-card-soft);
  color: var(--text-muted);
}

.ec-status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

.ec-value-card {
  width: 220px;
  padding: 9px 10px;
  border: 1px solid var(--border-soft);
  border-radius: 9px;
  background: var(--bg-card-soft);
}

.ec-value-card.new {
  border-color: var(--primary);
  background: var(--primary-soft);
}

.ec-value-card span,
.ec-value-card strong {
  display: block;
}

.ec-value-card span {
  color: var(--text-muted);
  font-size: 8px;
  font-weight: 600;
  text-transform: uppercase;
}

.ec-value-card strong {
  margin-top: 4px;
  color: var(--text-primary);
  font-size: 10px;
  line-height: 1.45;
}

.ec-change-arrow {
  display: flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--primary-soft);
  color: var(--primary);
}

.ec-date-cell {
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.ec-date-cell svg {
  color: var(--text-muted);
}

.ec-date-cell.effective svg {
  color: var(--green);
}

.ec-date-cell.effective strong {
  color: var(--text-primary);
}

.ec-truncated {
  width: 230px;
  margin: 0;
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ec-truncated.remarks {
  width: 190px;
  color: var(--text-muted);
}

.ec-actions-heading,
.ec-actions-cell {
  text-align: right;
}

.ec-action-button {
  display: inline-flex;
  width: 34px;
  height: 34px;
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

.ec-action-button:hover,
.ec-action-button[aria-expanded='true'] {
  border-color: var(--border);
  background: var(--bg-card-soft);
  color: var(--primary);
}

.ec-empty-state {
  display: flex;
  min-height: 280px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-muted);
}

.ec-empty-state strong {
  color: var(--text-primary);
  font-size: 13px;
}

.ec-empty-state span {
  font-size: 11px;
}
</style>

<style>
.ec-action-menu {
  position: fixed;
  z-index: 99999;
  width: 225px;
  padding: 6px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3);
}

.ec-action-menu button {
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

.ec-action-menu button svg {
  flex-shrink: 0;
  color: var(--text-secondary);
}

.ec-action-menu button:hover {
  background: var(--bg-card-soft);
  color: var(--primary);
}

.ec-action-menu button:hover svg {
  color: var(--primary);
}
</style>
