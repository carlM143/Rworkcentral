<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import {
  CalendarDays,
  ClipboardCheck,
  Eye,
  MoreHorizontal,
  Pencil,
  UserRound,
} from 'lucide-vue-next'

type OffboardingStatus =
  | 'Draft'
  | 'Pending Clearance'
  | 'Clearance In Progress'
  | 'For Review'
  | 'Ready for Final Pay'
  | 'Completed'
  | 'Cancelled'

interface OffboardingRecord {
  id: number | string
  offboardingNumber: string
  employeeName: string
  employeeNumber: string
  position: string
  department: string
  offboardingType: string
  exitInterviewDate?: string
  finalPayStatus?: string
  initiatedBy: string
  approvedBy?: string
  status: OffboardingStatus | string
  reason: string
  remarks?: string
}

defineProps<{
  records: OffboardingRecord[]
}>()

const emit = defineEmits<{
  view: [item: OffboardingRecord]
  edit: [item: OffboardingRecord]
}>()

const activeRecord = ref<OffboardingRecord | null>(null)
const menuPosition = ref({ top: 0, left: 0 })

const formatDate = (value?: string) => {
  if (!value) return 'Not Scheduled'
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

const statusClass = (status: string) => {
  switch (status) {
    case 'Completed': return 'completed'
    case 'Ready for Final Pay': return 'final-pay'
    case 'Clearance In Progress': return 'in-progress'
    case 'Pending Clearance': return 'pending'
    case 'For Review': return 'review'
    case 'Cancelled': return 'cancelled'
    default: return 'draft'
  }
}

const finalPayClass = (status?: string) => {
  switch (status) {
    case 'Released': return 'released'
    case 'Ready for Release': return 'ready'
    case 'For Review': return 'review'
    default: return 'not-started'
  }
}

const closeMenu = () => {
  activeRecord.value = null
}

const toggleMenu = async (item: OffboardingRecord, event: MouseEvent) => {
  if (activeRecord.value?.id === item.id) {
    closeMenu()
    return
  }

  const button = event.currentTarget as HTMLElement
  activeRecord.value = item

  await nextTick()

  const rect = button.getBoundingClientRect()
  const width = 220
  const height = 104
  const gap = 6

  menuPosition.value = {
    left: Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8)),
    top: rect.bottom + height + gap > window.innerHeight
      ? Math.max(8, rect.top - height - gap)
      : rect.bottom + gap,
  }
}

const selectAction = (action: 'view' | 'edit') => {
  const item = activeRecord.value
  closeMenu()
  if (!item) return

  if (action === 'view') emit('view', item)
  else emit('edit', item)
}

const handleOutsideClick = (event: MouseEvent) => {
  if (!(event.target instanceof Element)) return
  if (event.target.closest('.ob-action-button') || event.target.closest('.ob-action-menu')) return
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
  <article class="ob-table-card">
    <div class="ob-table-heading">
      <h3>Employee Offboarding</h3>
      <p>
        Monitor employee separation, clearance, exit interview and final pay readiness.
      </p>
    </div>

    <div v-if="records.length" class="ob-table-scroll">
      <table>
        <thead>
          <tr>
            <th>Offboarding No.</th>
            <th>Employee</th>
            <th>Department</th>
            <th>Offboarding Type</th>
            <th>Exit Interview</th>
            <th>Final Pay</th>
            <th>Initiated By</th>
            <th>Approved By</th>
            <th>Status</th>
            <th>Reason</th>
            <th>Remarks</th>
            <th class="ob-actions-heading">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in records" :key="item.id">
            <td>
              <strong class="ob-record-number">
                {{ item.offboardingNumber }}
              </strong>
            </td>

            <td>
              <div class="ob-employee-cell">
                <div class="ob-employee-avatar">
                  <UserRound :size="17" />
                </div>

                <div class="ob-employee-info">
                  <strong>{{ item.employeeName }}</strong>
                  <span>{{ item.employeeNumber }} · {{ item.position }}</span>
                </div>
              </div>
            </td>

            <td>
              <strong class="ob-department">{{ item.department }}</strong>
            </td>

            <td>
              <span class="ob-type-badge">
                {{ item.offboardingType }}
              </span>
            </td>

            <td>
              <div class="ob-date-cell">
                <CalendarDays :size="13" />
                <strong v-if="item.exitInterviewDate">
                  {{ formatDate(item.exitInterviewDate) }}
                </strong>
                <span v-else>Not Scheduled</span>
              </div>
            </td>

            <td>
              <span class="ob-final-pay-badge" :class="finalPayClass(item.finalPayStatus)">
                {{ item.finalPayStatus || 'Not Started' }}
              </span>
            </td>

            <td>
              <strong class="ob-person">{{ item.initiatedBy }}</strong>
            </td>

            <td>
              <strong v-if="item.approvedBy" class="ob-person approved">
                {{ item.approvedBy }}
              </strong>
              <span v-else class="ob-pending-text">Pending</span>
            </td>

            <td>
              <span class="ob-status-badge" :class="statusClass(item.status)">
                <span class="ob-status-dot" />
                {{ item.status }}
              </span>
            </td>

            <td>
              <p class="ob-truncated" :title="item.reason">
                {{ item.reason }}
              </p>
            </td>

            <td>
              <p class="ob-truncated remarks" :title="item.remarks || 'No remarks'">
                {{ item.remarks || 'No remarks' }}
              </p>
            </td>

            <td class="ob-actions-cell">
              <button
                type="button"
                class="ob-action-button"
                :aria-label="`Actions for ${item.offboardingNumber}`"
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

    <div v-else class="ob-empty-state">
      <ClipboardCheck :size="36" />
      <strong>No offboarding records found</strong>
      <span>Try changing your offboarding filters.</span>
    </div>
  </article>

  <Teleport to="body">
    <div
      v-if="activeRecord"
      class="ob-action-menu"
      role="menu"
      :style="{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }"
    >
      <button type="button" role="menuitem" @click="selectAction('view')">
        <Eye :size="15" />
        View Offboarding
      </button>

      <button type="button" role="menuitem" @click="selectAction('edit')">
        <Pencil :size="15" />
        Edit Offboarding
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
.ob-table-card {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.ob-table-heading {
  padding: 16px 17px;
  border-bottom: 1px solid var(--border-soft);
}

.ob-table-heading h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 700;
}

.ob-table-heading p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 11px;
}

.ob-table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 1850px;
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

.ob-record-number {
  color: var(--primary);
  white-space: nowrap;
}

.ob-employee-cell {
  display: flex;
  min-width: 230px;
  align-items: center;
  gap: 9px;
}

.ob-employee-avatar {
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

.ob-employee-info strong,
.ob-employee-info span {
  display: block;
}

.ob-employee-info strong {
  color: var(--text-primary);
  font-size: 11px;
}

.ob-employee-info span {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 9.5px;
}

.ob-department,
.ob-person {
  color: var(--text-primary);
  white-space: nowrap;
}

.ob-person.approved {
  color: var(--green);
}

.ob-pending-text {
  color: var(--text-muted);
  font-style: italic;
}

.ob-type-badge {
  display: inline-flex;
  align-items: center;
  padding: 5px 9px;
  border-radius: 20px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 9px;
  font-weight: 650;
  white-space: nowrap;
}

.ob-date-cell {
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.ob-date-cell svg {
  color: var(--text-muted);
}

.ob-date-cell strong {
  color: var(--text-primary);
}

.ob-final-pay-badge,
.ob-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 9px;
  border-radius: 20px;
  font-size: 9px;
  font-weight: 650;
  white-space: nowrap;
}

.ob-final-pay-badge.not-started,
.ob-status-badge.draft {
  background: var(--bg-card-soft);
  color: var(--text-muted);
}

.ob-final-pay-badge.ready,
.ob-status-badge.final-pay {
  background: var(--purple-soft);
  color: var(--purple);
}

.ob-final-pay-badge.review,
.ob-status-badge.review,
.ob-status-badge.pending {
  background: var(--orange-soft);
  color: var(--orange);
}

.ob-final-pay-badge.released,
.ob-status-badge.completed {
  background: var(--green-soft);
  color: var(--green);
}

.ob-status-badge.in-progress {
  background: var(--primary-soft);
  color: var(--primary);
}

.ob-status-badge.cancelled {
  background: var(--red-soft);
  color: var(--red);
}

.ob-status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

.ob-truncated {
  width: 220px;
  margin: 0;
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ob-truncated.remarks {
  width: 210px;
  color: var(--text-muted);
}

.ob-actions-heading,
.ob-actions-cell {
  text-align: right;
}

.ob-action-button {
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
  transition: all .18s ease;
}

.ob-action-button:hover,
.ob-action-button[aria-expanded='true'] {
  border-color: var(--border);
  background: var(--bg-card-soft);
  color: var(--primary);
}

.ob-empty-state {
  display: flex;
  min-height: 280px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-muted);
}

.ob-empty-state strong {
  color: var(--text-primary);
  font-size: 13px;
}

.ob-empty-state span {
  font-size: 11px;
}
</style>

<style>
.ob-action-menu {
  position: fixed;
  z-index: 99999;
  width: 220px;
  padding: 6px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  box-shadow: 0 16px 40px rgba(0, 0, 0, .3);
}

.ob-action-menu button {
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

.ob-action-menu button svg {
  flex-shrink: 0;
  color: var(--text-secondary);
}

.ob-action-menu button:hover {
  background: var(--bg-card-soft);
  color: var(--primary);
}

.ob-action-menu button:hover svg {
  color: var(--primary);
}
</style>