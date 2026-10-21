
<script setup lang="ts">
import {
  ArrowRight,
  CalendarDays,
  CircleDollarSign,
  MoreHorizontal,
  TrendingUp,
  UserRound,
  Eye,
  Pencil,
  Send,
  CheckCircle2,
  CalendarCheck,
  BadgeCheck,
  CircleX,
  X,
} from 'lucide-vue-next'

import type {
  PromotionRecord,
  PromotionStatus,
  PromotionType,
} from '~/types/promotion'

const props = defineProps<{
  records: PromotionRecord[]
}>()

type PromotionAction =
  | 'view'
  | 'edit'
  | 'submit'
  | 'approve'
  | 'schedule'
  | 'effective'
  | 'reject'
  | 'cancel'

const emit = defineEmits<{
  view: [record: PromotionRecord]
  edit: [record: PromotionRecord]
  submit: [record: PromotionRecord]
  approve: [record: PromotionRecord]
  schedule: [record: PromotionRecord]
  effective: [record: PromotionRecord]
  reject: [record: PromotionRecord]
  cancel: [record: PromotionRecord]
}>()

/* =========================================
   FORMAT HELPERS
========================================= */

const formatDate = (value?: string) => {
  if (!value) return '—'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

const formatMoney = (value: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(value)
}

const statusClass = (value: PromotionStatus) => {
  return value.toLowerCase().replace(/\s+/g, '-')
}

const typeClass = (value: PromotionType) => {
  return value.toLowerCase().replace(/\s+/g, '-')
}

/* =========================================
   ACTION MENU STATE
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

const isFinal = (status: PromotionStatus) => {
  return ['Effective', 'Rejected', 'Cancelled'].includes(status)
}

const actions = computed(() => {
  const record = activeRecord.value

  if (!record) return []

  const items: {
    name: PromotionAction
    label: string
    icon: typeof Eye
    tone?: string
  }[] = [
    {
      name: 'view',
      label: 'View Promotion',
      icon: Eye,
    },
  ]

  if (isFinal(record.status)) return items

  items.push({
    name: 'edit',
    label: 'Edit Promotion',
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
      label: 'Approve Promotion',
      icon: CheckCircle2,
      tone: 'success',
    })

    items.push({
      name: 'reject',
      label: 'Reject Promotion',
      icon: X,
      tone: 'danger',
    })
  }

  if (record.status === 'Approved') {
    items.push({
      name: 'schedule',
      label: 'Schedule Promotion',
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
    label: 'Cancel Promotion',
    icon: CircleX,
    tone: 'danger',
  })

  return items
})

/* =========================================
   DROPDOWN POSITION
========================================= */

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
  const width = menuRef.value?.offsetWidth ?? 205
  const height = menuRef.value?.offsetHeight ?? 200
  const gap = 6
  const padding = 8

  const availableBelow = window.innerHeight - rect.bottom

  let top = availableBelow >= height + gap
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

const performAction = (action: PromotionAction) => {
  const record = activeRecord.value

  if (!record) return

  if (!actions.value.some(item => item.name === action)) {
    closeMenu()
    return
  }

  closeMenu()
  emit(action, record)
}

/* =========================================
   LIFECYCLE
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
  <article class="promotion-card">
    <div class="table-heading">
      <h3>Employee Promotions</h3>
      <p>
        Track employee position, grade and salary advancement
        throughout the employee lifecycle.
      </p>
    </div>

    <div v-if="records.length" class="table-scroll">
      <table class="promotion-table">
        <thead>
          <tr>
            <th>Promotion No.</th>
            <th>Employee</th>
            <th>Department</th>
            <th>Promotion Type</th>
            <th>Current Position</th>
            <th></th>
            <th>New Position</th>
            <th>Grade</th>
            <th>Current Salary</th>
            <th>New Salary</th>
            <th>Increase</th>
            <th>Recommended By</th>
            <th>Approved By</th>
            <th>Recommendation Date</th>
            <th>Effective Date</th>
            <th>Status</th>
            <th>Reason</th>
            <th class="actions-col">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="item in records"
            :key="item.id"
          >
            <td>
              <strong class="record-number">
                {{ item.promotionNumber }}
              </strong>
            </td>

            <td>
              <div class="employee-cell">
                <span class="employee-icon">
                  <UserRound :size="16" />
                </span>

                <div>
                  <strong>{{ item.employeeName }}</strong>
                  <small>{{ item.employeeNumber }}</small>
                </div>
              </div>
            </td>

            <td>
              <strong class="normal-strong">
                {{ item.department }}
              </strong>
            </td>

            <td>
              <span
                class="type-badge"
                :class="typeClass(item.promotionType)"
              >
                {{ item.promotionType }}
              </span>
            </td>

            <td>
              <div class="position-card">
                <small>Current</small>
                <strong>{{ item.currentPosition }}</strong>
              </div>
            </td>

            <td>
              <span class="arrow-icon">
                <ArrowRight :size="16" />
              </span>
            </td>

            <td>
              <div class="position-card promoted">
                <small>Promoted To</small>
                <strong>{{ item.newPosition }}</strong>
              </div>
            </td>

            <td>
              <div class="grade-cell">
                <span>{{ item.currentGrade }}</span>
                <ArrowRight :size="13" />
                <strong>{{ item.newGrade }}</strong>
              </div>
            </td>

            <td class="muted-money">
              {{ formatMoney(item.currentSalary) }}
            </td>

            <td>
              <strong class="normal-strong">
                {{ formatMoney(item.newSalary) }}
              </strong>
            </td>

            <td>
              <div
                class="increase-cell"
                :class="{ negative: item.salaryIncrease < 0 }"
              >
                <CircleDollarSign :size="14" />

                <div>
                  <strong>
                    {{ item.salaryIncrease >= 0 ? '+' : '−' }}
                    {{ formatMoney(Math.abs(item.salaryIncrease)) }}
                  </strong>

                  <small>
                    {{ item.increasePercentage >= 0 ? '+' : '' }}
                    {{ item.increasePercentage.toFixed(2) }}%
                  </small>
                </div>
              </div>
            </td>

            <td>
              <strong class="normal-strong">
                {{ item.recommendedBy }}
              </strong>
            </td>

            <td>
              <strong
                v-if="item.approvedBy"
                class="approved-person"
              >
                {{ item.approvedBy }}
              </strong>

              <span v-else class="muted-money">
                Pending
              </span>
            </td>

            <td>
              <div class="date-cell">
                <CalendarDays :size="13" />
                {{ formatDate(item.recommendationDate) }}
              </div>
            </td>

            <td>
              <div class="date-cell effective-date">
                <CalendarDays :size="13" />
                <strong>{{ formatDate(item.effectiveDate) }}</strong>
              </div>
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

            <td class="actions-col">
              <button
                type="button"
                class="actions-trigger"
                aria-label="Promotion actions"
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
      <TrendingUp :size="28" />
      <strong>No promotion records found</strong>
      <span>Try changing your promotion filters.</span>
    </div>

    <Teleport to="body">
      <div
        v-if="openId !== null"
        ref="menuRef"
        class="promotion-actions-menu"
        :style="menuStyle"
      >
        <template v-for="action in actions" :key="action.name">
          <button
            type="button"
            :class="action.tone"
            @click="performAction(action.name)"
          >
            <component :is="action.icon" :size="15" />
            {{ action.label }}
          </button>
        </template>
      </div>
    </Teleport>
  </article>
</template>

<style scoped>
.promotion-card {
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

.promotion-table {
  width: 100%;
  min-width: 2600px;
  border-collapse: collapse;
}

.promotion-table th {
  padding: 11px 12px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 9px;
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
}

.promotion-table td {
  padding: 12px;
  border-top: 1px solid var(--border-soft);
  color: var(--text-secondary);
  font-size: 10px;
  vertical-align: middle;
}

.promotion-table tbody tr:hover {
  background: var(--bg-card-soft);
}

.record-number {
  color: var(--primary);
  white-space: nowrap;
}

.employee-cell {
  display: flex;
  min-width: 170px;
  align-items: center;
  gap: 9px;
}

.employee-icon {
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

.employee-cell strong,
.employee-cell small {
  display: block;
}

.employee-cell strong,
.normal-strong {
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
  gap: 6px;
  padding: 5px 9px;
  border-radius: 20px;
  font-size: 9px;
  font-weight: 650;
  white-space: nowrap;
}

.type-badge.position-promotion,
.status-badge.approved {
  background: var(--primary-soft);
  color: var(--primary);
}

.type-badge.grade-promotion,
.status-badge.scheduled {
  background: var(--purple-soft);
  color: var(--purple);
}

.type-badge.salary-promotion,
.status-badge.effective {
  background: var(--green-soft);
  color: var(--green);
}

.type-badge.leadership-promotion,
.status-badge.for-review,
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

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

.position-card {
  width: 175px;
  padding: 9px;
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  background: var(--bg-card-soft);
}

.position-card.promoted {
  background: var(--green-soft);
}

.position-card small,
.position-card strong {
  display: block;
}

.position-card small {
  color: var(--text-muted);
  font-size: 8px;
}

.position-card strong {
  margin-top: 4px;
  color: var(--text-primary);
  font-size: 10px;
}

.arrow-icon {
  display: flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--green-soft);
  color: var(--green);
}

.grade-cell,
.date-cell,
.increase-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.grade-cell strong {
  color: var(--primary);
}

.muted-money {
  color: var(--text-muted);
  white-space: nowrap;
}

.increase-cell,
.approved-person {
  color: var(--green);
}

.increase-cell.negative {
  color: var(--red);
}

.increase-cell strong,
.increase-cell small {
  display: block;
}

.increase-cell small {
  margin-top: 3px;
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

.reason-text {
  width: 210px;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions-col {
  position: static !important;
  width: 65px;
  text-align: center !important;
}

.actions-trigger {
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

.actions-trigger:hover,
.actions-trigger[aria-expanded="true"] {
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
.promotion-actions-menu {
  position: fixed;
  z-index: 10020;
  width: 210px;
  padding: 6px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.25);
}

.promotion-actions-menu button {
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

.promotion-actions-menu button:hover {
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

.promotion-actions-menu button.success {
  color: var(--green);
}

.promotion-actions-menu button.danger {
  color: var(--red);
}
</style>
