
<script setup lang="ts">
import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  UserRound,
} from 'lucide-vue-next'

import type {
  Recommendation,
  RegularizationRecord,
  RegularizationStatus,
} from '~/types/regularization'

const props = defineProps<{
  records: RegularizationRecord[]
}>()

const emit = defineEmits<{
  view: [record: RegularizationRecord]
  edit: [record: RegularizationRecord]
  status: [record: RegularizationRecord]
  recommendation: [record: RegularizationRecord]
  complete: [record: RegularizationRecord]
}>()

const openId = ref<number | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)

const menuStyle = ref({
  top: '0px',
  left: '0px',
})

const activeRecord = computed(() => {
  return props.records.find(item => item.id === openId.value)
})

const formatDate = (value?: string) => {
  if (!value) return '—'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

const statusClass = (value: RegularizationStatus) => {
  return value.toLowerCase().replace(/\s+/g, '-')
}

const recommendationClass = (value: Recommendation) => {
  if (value === 'For Regularization') return 'positive'
  if (value === 'Extend Probation') return 'extended'
  if (value === 'Not Recommended') return 'negative'

  return 'pending'
}

/* =========================================
   ACTION MENU
========================================= */

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
  const width = menuRef.value?.offsetWidth ?? 210
  const height = menuRef.value?.offsetHeight ?? 210

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

type ActionName =
  | 'view'
  | 'edit'
  | 'status'
  | 'recommendation'
  | 'complete'

const handleAction = (action: ActionName) => {
  const record = activeRecord.value

  closeMenu()

  if (!record) return

  if (record.status === 'Regularized' && action !== 'view') {
    return
  }

  if (action === 'complete' && record.status !== 'Approved') {
    return
  }

  switch (action) {
    case 'view':
      emit('view', record)
      break

    case 'edit':
      emit('edit', record)
      break

    case 'status':
      emit('status', record)
      break

    case 'recommendation':
      emit('recommendation', record)
      break

    case 'complete':
      emit('complete', record)
      break
  }
}

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
  <article class="table-card">
    <!-- HEADER -->
    <div class="table-heading">
      <h3>Employee Regularization</h3>

      <p>
        Track probationary employees, review status,
        HR recommendations and regularization decisions.
      </p>
    </div>

    <!-- TABLE -->
    <div v-if="records.length" class="table-scroll">
      <table class="regularization-table">
        <thead>
          <tr>
            <th>Regularization No.</th>
            <th>Employee</th>
            <th>Department</th>
            <th>Date Hired</th>
            <th>Probation End</th>
            <th>Target Regularization</th>
            <th>Evaluation</th>
            <th>Recommendation</th>
            <th>Reviewed By</th>
            <th>Approved By</th>
            <th>Effective Date</th>
            <th>Status</th>
            <th>Remarks</th>
            <th class="action-column">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="item in records"
            :key="item.id"
          >
            <!-- REFERENCE -->
            <td>
              <strong class="record-number">
                {{ item.regularizationNumber }}
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

                  <span>
                    {{ item.employeeNumber }} · {{ item.position }}
                  </span>
                </div>
              </div>
            </td>

            <!-- DEPARTMENT -->
            <td>
              <strong class="department">
                {{ item.department }}
              </strong>
            </td>

            <!-- DATE HIRED -->
            <td>
              <div class="date-cell">
                <CalendarDays :size="13" />
                {{ formatDate(item.dateHired) }}
              </div>
            </td>

            <!-- PROBATION END -->
            <td>
              <div class="date-cell probation-date">
                <CalendarDays :size="13" />

                <div>
                  <strong>
                    {{ formatDate(item.probationEndDate) }}
                  </strong>

                  <span>
                    {{ item.probationMonths }} months
                  </span>
                </div>
              </div>
            </td>

            <!-- TARGET -->
            <td>
              <strong class="target-date">
                {{ formatDate(item.targetRegularizationDate) }}
              </strong>
            </td>

            <!-- EVALUATION -->
            <td>
              <span
                class="evaluation-badge"
                :class="statusClass(item.evaluationStatus)"
              >
                {{ item.evaluationStatus }}
              </span>
            </td>

            <!-- RECOMMENDATION -->
            <td>
              <span
                class="recommendation-badge"
                :class="recommendationClass(item.recommendation)"
              >
                {{ item.recommendation }}
              </span>
            </td>

            <!-- REVIEWED BY -->
            <td>
              <strong class="person-name">
                {{ item.reviewedBy || 'Not assigned' }}
              </strong>
            </td>

            <!-- APPROVED BY -->
            <td>
              <div
                v-if="item.approvedBy"
                class="approval-cell"
              >
                <CheckCircle2 :size="13" />

                <div>
                  <strong>{{ item.approvedBy }}</strong>

                  <span>
                    {{ formatDate(item.approvalDate) }}
                  </span>
                </div>
              </div>

              <span v-else class="muted-text">
                Pending
              </span>
            </td>

            <!-- EFFECTIVE DATE -->
            <td>
              <strong class="effective-date">
                {{ formatDate(item.effectiveDate) }}
              </strong>
            </td>

            <!-- STATUS -->
            <td>
              <span
                class="status-badge"
                :class="statusClass(item.status)"
              >
                <span class="status-dot" />
                {{ item.status }}
              </span>
            </td>

            <!-- REMARKS -->
            <td>
              <p
                class="remarks"
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
                aria-label="Regularization actions"
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
      <ClipboardCheck :size="29" />

      <strong>No regularization records found</strong>

      <span>
        Try changing the filters or process a new regularization.
      </span>
    </div>

    <!-- TELEPORTED ACTIONS -->
    <Teleport to="body">
      <div
        v-if="openId !== null"
        ref="menuRef"
        class="regularization-action-menu"
        :style="menuStyle"
      >
        <button
          type="button"
          @click="handleAction('view')"
        >
          <Eye :size="15" />
          View Regularization
        </button>

        <template v-if="activeRecord?.status !== 'Regularized'">
          <button
            type="button"
            @click="handleAction('edit')"
          >
            <Pencil :size="15" />
            Edit Regularization
          </button>

          <button
            type="button"
            @click="handleAction('status')"
          >
            <RefreshCw :size="15" />
            Update Status
          </button>

          <button
            type="button"
            @click="handleAction('recommendation')"
          >
            <ClipboardCheck :size="15" />
            Record Recommendation
          </button>

          <template v-if="activeRecord?.status === 'Approved'">
            <div class="menu-divider" />

            <button
              type="button"
              class="complete-action"
              @click="handleAction('complete')"
            >
              <CheckCircle2 :size="15" />
              Complete Regularization
            </button>
          </template>
        </template>
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

.regularization-table {
  width: 100%;
  min-width: 1900px;
  border-collapse: collapse;
}

.regularization-table th {
  padding: 12px 13px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 9px;
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
}

.regularization-table td {
  padding: 12px 13px;
  border-bottom: 1px solid var(--border-soft);
  color: var(--text-secondary);
  font-size: 10px;
  vertical-align: middle;
}

.regularization-table tbody tr:last-child td {
  border-bottom: 0;
}

.regularization-table tbody tr:hover {
  background: var(--bg-card-soft);
}

.record-number {
  color: var(--primary);
  font-size: 10px;
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

.department,
.person-name,
.target-date,
.effective-date {
  color: var(--text-primary);
  white-space: nowrap;
}

.date-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.date-cell svg {
  flex-shrink: 0;
  color: var(--text-muted);
}

.probation-date svg {
  color: var(--orange);
}

.probation-date strong,
.probation-date span {
  display: block;
}

.probation-date strong {
  color: var(--text-primary);
}

.probation-date span {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 9px;
}

.evaluation-badge,
.recommendation-badge,
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

.evaluation-badge.completed,
.recommendation-badge.positive,
.status-badge.regularized {
  background: var(--green-soft);
  color: var(--green);
}

.evaluation-badge.in-progress,
.status-badge.approved,
.status-badge.for-review {
  background: var(--primary-soft);
  color: var(--primary);
}

.evaluation-badge.pending,
.status-badge.for-evaluation,
.status-badge.extended,
.recommendation-badge.extended {
  background: var(--orange-soft);
  color: var(--orange);
}

.status-badge.recommended {
  background: var(--purple-soft);
  color: var(--purple);
}

.status-badge.not-recommended,
.recommendation-badge.negative {
  background: var(--red-soft);
  color: var(--red);
}

.recommendation-badge.pending {
  background: var(--bg-card-soft);
  color: var(--text-muted);
}

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

.approval-cell {
  display: flex;
  min-width: 125px;
  align-items: flex-start;
  gap: 6px;
}

.approval-cell svg {
  flex-shrink: 0;
  color: var(--green);
}

.approval-cell strong,
.approval-cell span {
  display: block;
}

.approval-cell strong {
  color: var(--text-primary);
  font-size: 10px;
}

.approval-cell span {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 9px;
}

.muted-text {
  color: var(--text-muted);
}

.remarks {
  width: 185px;
  margin: 0;
  overflow: hidden;
  color: var(--text-secondary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-column {
  width: 55px;
  text-align: center !important;
  position: static !important;
  right: auto !important;
  left: auto !important;
}

/* BORDERLESS UNTIL HOVER */

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
    border-color 0.15s ease,
    background 0.15s ease,
    color 0.15s ease;
}

.action-trigger:hover,
.action-trigger[aria-expanded="true"] {
  border-color: var(--border);
  background: var(--bg-card-soft);
  color: var(--primary);
}

.empty-state {
  display: flex;
  min-height: 230px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 20px;
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
.regularization-action-menu {
  position: fixed;
  z-index: 10020;
  width: 210px;
  padding: 6px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.25);
}

.regularization-action-menu button {
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

.regularization-action-menu button:hover {
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

.regularization-action-menu button.complete-action {
  color: var(--green);
}

.regularization-action-menu .menu-divider {
  margin: 5px 4px;
  border-top: 1px solid var(--border-soft);
}
</style>
