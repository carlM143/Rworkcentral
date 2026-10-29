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
} from 'lucide-vue-next'

import { ref, nextTick, onMounted, onUnmounted } from 'vue'

import type {
  PromotionRecord,
  PromotionStatus,
  PromotionType,
} from '~/types/promotion'

defineProps<{
  records:
    PromotionRecord[]
}>()


const emit = defineEmits<{
  view: [item: PromotionRecord]
  edit: [item: PromotionRecord]
}>()

const activeRecord = ref<PromotionRecord | null>(null)

const menuPosition = ref({
  top: 0,
  left: 0,
})

const closeMenu = () => {
  activeRecord.value = null
}

const toggleMenu = async (
  item: PromotionRecord,
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

  const menuWidth = 205
  const menuHeight = 100
  const gap = 6

  menuPosition.value = {
    left: Math.max(
      8,
      Math.min(
        rect.right - menuWidth,
        window.innerWidth - menuWidth - 8,
      ),
    ),
    top:
      rect.bottom + menuHeight + gap > window.innerHeight
        ? Math.max(8, rect.top - menuHeight - gap)
        : rect.bottom + gap,
  }
}

const selectAction = (action: 'view' | 'edit') => {
  const item = activeRecord.value

  closeMenu()

  if (!item) return

  if (action === 'view') {
    emit('view', item)
  } else {
    emit('edit', item)
  }
}

const handleOutsideClick = (event: MouseEvent) => {
  const target = event.target

  if (!(target instanceof Element)) return

  if (
    target.closest('.promotion-action-button') ||
    target.closest('.promotion-dropdown')
  ) {
    return
  }

  closeMenu()
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') closeMenu()
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('scroll', closeMenu, true)
  window.addEventListener('resize', closeMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('scroll', closeMenu, true)
  window.removeEventListener('resize', closeMenu)
})

const formatDate = (
  value?: string,
) => {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    },
  ).format(
    new Date(
      `${value}T00:00:00`,
    ),
  )
}

const formatMoney = (
  value: number,
) => {
  return new Intl.NumberFormat(
    'en-PH',
    {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0,
    },
  ).format(value)
}

const statusClass = (
  status:
    PromotionStatus,
) => {
  if (
    status ===
    'Effective'
  ) {
    return 'effective'
  }

  if (
    status ===
    'Approved'
  ) {
    return 'approved'
  }

  if (
    status ===
    'Scheduled'
  ) {
    return 'scheduled'
  }

  if (
    status ===
    'Pending Approval'
  ) {
    return 'pending'
  }

  if (
    status ===
    'For Review'
  ) {
    return 'review'
  }

  if (
    status ===
      'Rejected' ||
    status ===
      'Cancelled'
  ) {
    return 'rejected'
  }

  return 'draft'
}

const typeClass = (
  type:
    PromotionType,
) => {
  if (
    type ===
    'Position Promotion'
  ) {
    return 'position'
  }

  if (
    type ===
    'Grade Promotion'
  ) {
    return 'grade'
  }

  if (
    type ===
    'Salary Promotion'
  ) {
    return 'salary'
  }

  return 'leadership'
}
</script>

<template>
  <article class="table-card">

    <div class="table-heading">

      <div>

        <h3>
          Employee Promotions
        </h3>

        <p>
          Track employee position, grade and salary
          advancement throughout the employee lifecycle.
        </p>

      </div>

    </div>

    <div
      v-if="records.length"
      class="table-scroll"
    >

      <table>

        <thead>

          <tr>
            <th>Promotion No.</th>
            <th>Employee</th>
            <th>Department</th>
            <th>Promotion Type</th>
            <th>Current Position</th>
            <th />
            <th>New Position</th>
            <th>Current Salary</th>
            <th>New Salary</th>
            <th>Increase</th>
            <th>Recommended By</th>
            <th>Approved By</th>
            <th>Recommendation Date</th>
            <th>Effective Date</th>
            <th>Status</th>
            <th>Reason</th>
            <th />
          </tr>

        </thead>

        <tbody>

          <tr
            v-for="item in records"
            :key="item.id"
          >

            <!-- NO -->

            <td>

              <strong class="record-number">
                {{ item.promotionNumber }}
              </strong>

            </td>

            <!-- EMPLOYEE -->

            <td>

              <div class="employee-cell">

                <div class="employee-avatar">

                  <UserRound
                    :size="17"
                  />

                </div>

                <div>

                  <strong>
                    {{ item.employeeName }}
                  </strong>

                  <span>
                    {{ item.employeeNumber }}
                  </span>

                </div>

              </div>

            </td>

            <!-- DEPARTMENT -->

            <td>

              <strong class="department-name">
                {{ item.department }}
              </strong>

            </td>

            <!-- TYPE -->

            <td>

              <span
                class="type-badge"
                :class="
                  typeClass(
                    item.promotionType,
                  )
                "
              >
                {{ item.promotionType }}
              </span>

            </td>

            <!-- CURRENT POSITION -->

            <td>

              <div class="position-card current">

                <span>
                  Current
                </span>

                <strong>
                  {{ item.currentPosition }}
                </strong>

              </div>

            </td>

            <!-- ARROW -->

            <td>

              <div class="promotion-arrow">

                <ArrowRight
                  :size="18"
                />

              </div>

            </td>

            <!-- NEW POSITION -->

            <td>

              <div class="position-card promoted">

                <span>
                  Promoted To
                </span>

                <strong>
                  {{ item.newPosition }}
                </strong>

              </div>

            </td>


            <!-- CURRENT SALARY -->

            <td>

              <span class="old-salary">
                {{
                  formatMoney(
                    item.currentSalary,
                  )
                }}
              </span>

            </td>

            <!-- NEW SALARY -->

            <td>

              <strong class="new-salary">
                {{
                  formatMoney(
                    item.newSalary,
                  )
                }}
              </strong>

            </td>

            <!-- INCREASE -->

            <td>

              <div class="salary-increase">

                <CircleDollarSign
                  :size="13"
                />

                <div>

                  <strong>
                    +
                    {{
                      formatMoney(
                        item.salaryIncrease,
                      )
                    }}
                  </strong>

                  <span>
                    +
                    {{
                      item.increasePercentage.toFixed(
                        2,
                      )
                    }}%
                  </span>

                </div>

              </div>

            </td>

            <!-- RECOMMENDED -->

            <td>

              <strong class="person-name">
                {{ item.recommendedBy }}
              </strong>

            </td>

            <!-- APPROVED -->

            <td>

              <strong
                v-if="item.approvedBy"
                class="person-name approved-person"
              >
                {{ item.approvedBy }}
              </strong>

              <span
                v-else
                class="pending-text"
              >
                Pending
              </span>

            </td>

            <!-- RECOMMEND DATE -->

            <td>

              <div class="date-cell">

                <CalendarDays
                  :size="13"
                />

                {{
                  formatDate(
                    item.recommendationDate,
                  )
                }}

              </div>

            </td>

            <!-- EFFECTIVE -->

            <td>

              <div class="date-cell effective-date">

                <CalendarDays
                  :size="13"
                />

                <strong>
                  {{
                    formatDate(
                      item.effectiveDate,
                    )
                  }}
                </strong>

              </div>

            </td>

            <!-- STATUS -->

            <td>

              <span
                class="status-badge"
                :class="
                  statusClass(
                    item.status,
                  )
                "
              >

                <span class="status-dot" />

                {{ item.status }}

              </span>

            </td>

            <!-- REASON -->

            <td>

              <p
                class="reason-text"
                :title="item.reason"
              >
                {{ item.reason }}
              </p>

            </td>

           <!-- ACTIONS -->
            <td class="promotion-actions-cell">
              <button
                type="button"
                class="promotion-action-button"
                :aria-label="`Actions for ${item.employeeName}`"
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

    <div
      v-else
      class="empty-state"
    >

      <TrendingUp
        :size="36"
      />

      <strong>
        No promotion records found
      </strong>

      <span>
        Try changing your promotion filters.
      </span>

    </div>

  </article>

  
<Teleport to="body">
  <div
    v-if="activeRecord"
    class="promotion-dropdown"
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
      <span>View Promotion</span>
    </button>

    <button
      type="button"
      role="menuitem"
      @click="selectAction('edit')"
    >
      <Pencil :size="15" />
      <span>Edit Promotion</span>
    </button>
  </div>
</Teleport>
</template>

<style scoped>
.table-card {
  overflow: hidden;

  border:
    1px solid var(--border);

  border-radius: 11px;

  background:
    var(--bg-card);

  box-shadow:
    var(--shadow);
}

.table-heading {
  padding:
    16px 17px;

  border-bottom:
    1px solid var(--border-soft);
}

.table-heading h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 15px;
}

.table-heading p {
  margin:
    5px 0 0;

  color:
    var(--text-muted);

  font-size: 11px;
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 2650px;
  border-collapse: collapse;
}

th {
  padding:
    12px 13px;

  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);

  font-size: 10px;
  font-weight: 700;

  text-align: left;

  text-transform: uppercase;

  white-space: nowrap;
}

td {
  padding:
    13px;

  border-top:
    1px solid var(--border-soft);

  color:
    var(--text-secondary);

  font-size: 10.5px;

  vertical-align: middle;
}

tbody tr:hover {
  background:
    var(--bg-card-soft);
}

.record-number {
  color:
    var(--primary);

  white-space: nowrap;
}

/* EMPLOYEE */

.employee-cell {
  display: flex;

  min-width: 180px;

  align-items: center;

  gap: 9px;
}

.employee-avatar {
  display: flex;

  width: 36px;
  height: 36px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.employee-cell strong,
.employee-cell span {
  display: block;
}

.employee-cell strong {
  color:
    var(--text-primary);

  font-size: 11px;
}

.employee-cell span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 9.5px;
}

.department-name {
  color:
    var(--text-primary);

  white-space: nowrap;
}

/* TYPE */

.type-badge {
  display: inline-flex;

  padding:
    5px 8px;

  border-radius: 20px;

  font-size: 9px;
  font-weight: 650;

  white-space: nowrap;
}

.type-badge.position {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.type-badge.grade {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.type-badge.salary {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.type-badge.leadership {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

/* POSITIONS */

.position-card {
  width: 190px;

  padding:
    8px 10px;

  border:
    1px solid var(--border-soft);

  border-radius: 8px;

  background:
    var(--bg-card-soft);
}

.position-card.promoted {
  border-color:
    color-mix(
      in srgb,
      var(--green) 25%,
      var(--border)
    );

  background:
    var(--green-soft);
}

.position-card span,
.position-card strong {
  display: block;
}

.position-card span {
  color:
    var(--text-muted);

  font-size: 8.5px;

  text-transform:
    uppercase;
}

.position-card strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 10px;
}

/* ARROW */

.promotion-arrow {
  display: flex;

  width: 32px;
  height: 32px;

  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background:
    var(--green-soft);

  color:
    var(--green);
}

.grade-change span {
  color:
    var(--text-muted);
}

.grade-change svg {
  color:
    var(--primary);
}

.grade-change strong {
  color:
    var(--primary);
}

/* SALARY */

.old-salary {
  color:
    var(--text-muted);

  white-space: nowrap;
}

.new-salary {
  color:
    var(--text-primary);

  white-space: nowrap;
}

.salary-increase {
  display: flex;

  align-items: center;

  gap: 6px;

  min-width: 105px;

  color:
    var(--green);
}

.salary-increase strong,
.salary-increase span {
  display: block;
}

.salary-increase strong {
  font-size: 10px;
}

.salary-increase span {
  margin-top: 2px;

  font-size: 9px;
}

/* PEOPLE */

.person-name {
  color:
    var(--text-primary);

  white-space: nowrap;
}

.approved-person {
  color:
    var(--green);
}

.pending-text {
  color:
    var(--text-muted);

  font-style: italic;
}

/* DATE */

.date-cell {
  display: flex;

  align-items: center;

  gap: 5px;

  white-space: nowrap;
}

.date-cell svg {
  color:
    var(--text-muted);
}

.effective-date svg {
  color:
    var(--green);
}

.effective-date strong {
  color:
    var(--text-primary);
}

/* STATUS */

.status-badge {
  display: inline-flex;

  align-items: center;

  gap: 5px;

  padding:
    5px 8px;

  border-radius: 20px;

  font-size: 9px;
  font-weight: 650;

  white-space: nowrap;
}

.status-dot {
  width: 5px;
  height: 5px;

  border-radius: 50%;

  background:
    currentColor;
}

.status-badge.effective {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.status-badge.approved {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.status-badge.scheduled {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.status-badge.pending,
.status-badge.review {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.status-badge.rejected {
  background:
    var(--red-soft);

  color:
    var(--red);
}

.status-badge.draft {
  background:
    var(--bg-card-soft);

  color:
    var(--text-muted);
}

/* REASON */

.reason-text {
  width: 240px;

  margin: 0;

  overflow: hidden;

  color:
    var(--text-secondary);

  font-size: 10px;

  text-overflow: ellipsis;

  white-space: nowrap;
}

/* ACTION */

.action-button {
  display: flex;

  width: 32px;
  height: 32px;

  align-items: center;
  justify-content: center;

  border:
    1px solid transparent;

  border-radius: 7px;

  background:
    transparent;

  color:
    var(--text-secondary);
}

.action-button:hover {
  border-color:
    var(--border);

  background:
    var(--bg-card-soft);

  color:
    var(--primary);
}

/* EMPTY */

.empty-state {
  display: flex;

  min-height: 280px;

  flex-direction: column;

  align-items: center;
  justify-content: center;

  gap: 8px;

  color:
    var(--text-muted);
}

.empty-state strong {
  color:
    var(--text-primary);

  font-size: 13px;
}

.empty-state span {
  font-size: 11px;
}
.promotion-actions-cell {
  text-align: right;
}

.promotion-action-button {
  display: inline-flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.18s ease;
}

.promotion-action-button:hover,
.promotion-action-button[aria-expanded='true'] {
  border-color: var(--border);
  background: var(--bg-card-soft);
  color: var(--primary);
}

.promotion-dropdown {
  position: fixed;
  z-index: 99999;
  width: 205px;
  padding: 6px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3);
}

.promotion-dropdown button {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
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

.promotion-dropdown button:hover {
  background: var(--bg-card-soft);
  color: var(--primary);
}

.promotion-dropdown button svg {
  color: var(--text-secondary);
}

.promotion-dropdown button:hover svg {
  color: var(--primary);
}
</style>