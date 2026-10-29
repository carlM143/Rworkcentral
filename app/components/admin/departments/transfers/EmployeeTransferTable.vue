<script setup lang="ts">

import { ref, onMounted, onUnmounted, nextTick } from 'vue'

import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  MoreHorizontal,
  UserRound,
  Eye,
  Pencil,
} from 'lucide-vue-next'

import type {
  EmployeeTransfer,
  EmployeeTransferStatus,
  EmployeeTransferType,
} from '~/types/employeeTransfer'

defineProps<{
  transfers:
    EmployeeTransfer[]
}>()


const emit = defineEmits<{
  view: [item: EmployeeTransfer]
  edit: [item: EmployeeTransfer]
}>()

const activeTransfer = ref<EmployeeTransfer | null>(null)
const actionButtonRef = ref<HTMLElement | null>(null)

const menuPosition = ref({
  top: 0,
  left: 0,
})

const closeActions = () => {
  activeTransfer.value = null
  actionButtonRef.value = null
}

const toggleActions = async (
  item: EmployeeTransfer,
  event: MouseEvent,
) => {
  if (activeTransfer.value?.id === item.id) {
    closeActions()
    return
  }

  actionButtonRef.value = event.currentTarget as HTMLElement
  activeTransfer.value = item

  await nextTick()

  const rect = actionButtonRef.value?.getBoundingClientRect()
  if (!rect) return

  const menuWidth = 210
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
  const item = activeTransfer.value

  closeActions()

  if (item) {
    emit(action, item)
  }
}

const handleOutsideClick = (event: MouseEvent) => {
  const target = event.target

  if (!(target instanceof Element)) return

  if (
    target.closest('.transfer-more-button') ||
    target.closest('.transfer-action-menu')
  ) {
    return
  }

  closeActions()
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeActions()
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
  document.addEventListener('keydown', handleEscape)
  window.addEventListener('scroll', closeActions, true)
  window.addEventListener('resize', closeActions)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
  document.removeEventListener('keydown', handleEscape)
  window.removeEventListener('scroll', closeActions, true)
  window.removeEventListener('resize', closeActions)
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

const typeClass = (
  type:
    EmployeeTransferType,
) => {
  if (
    type ===
    'Department Transfer'
  ) {
    return 'department'
  }

  if (
    type ===
    'Position Change'
  ) {
    return 'position'
  }

  return 'both'
}

const statusClass = (
  status:
    EmployeeTransferStatus,
) => {
  if (
    status ===
    'Completed'
  ) {
    return 'completed'
  }

  if (
    status ===
    'Approved'
  ) {
    return 'approved'
  }

  if (
    status ===
    'Pending'
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
    'Rejected'
  ) {
    return 'rejected'
  }

  return 'cancelled'
}
</script>

<template>
  <article class="table-card">

    <div class="table-heading">

      <div>

        <h3>
          Employee Transfers
        </h3>

        <p>
          Track employee department and position
          movements, effective dates and transfer
          approval status.
        </p>

      </div>

    </div>

    <div
      v-if="
        transfers.length
      "
      class="table-scroll"
    >

      <table>

        <thead>

          <tr>
            <th>Transfer No.</th>
            <th>Employee</th>
            <th>Transfer Type</th>
            <th>From</th>
            <th />
            <th>To</th>
            <th>Reason</th>
            <th>Requested Date</th>
            <th>Effective Date</th>
            <th>Status</th>
            <th>Requested By</th>
            <th>Reviewed By</th>
            <th>Remarks</th>
            <th />
          </tr>

        </thead>

        <tbody>

          <tr
            v-for="
              item in transfers
            "
            :key="
              item.id
            "
          >

            <!-- NUMBER -->

            <td>

              <strong class="transfer-number">
                {{
                  item.transferNumber
                }}
              </strong>

            </td>

            <!-- EMPLOYEE -->

            <td>

              <div class="employee-cell">

                <div class="employee-icon">

                  <UserRound
                    :size="16"
                  />

                </div>

                <div>

                  <strong>
                    {{
                      item.employeeName
                    }}
                  </strong>

                  <span>
                    {{
                      item.employeeNumber
                    }}
                  </span>

                </div>

              </div>

            </td>

            <!-- TYPE -->

            <td>

              <span
                class="type-badge"
                :class="
                  typeClass(
                    item.transferType,
                  )
                "
              >
                {{
                  item.transferType
                }}
              </span>

            </td>

            <!-- FROM -->

            <td>

              <div class="assignment-cell">

                <div class="assignment-line">

                  <Building2
                    :size="13"
                  />

                  <strong>
                    {{
                      item.fromDepartment
                    }}
                  </strong>

                </div>

                <div class="assignment-line secondary">

                  <BriefcaseBusiness
                    :size="12"
                  />

                  <span>
                    {{
                      item.fromPosition
                    }}
                  </span>

                </div>

              </div>

            </td>

            <!-- ARROW -->

            <td>

              <div class="transfer-arrow">

                <ArrowRight
                  :size="17"
                />

              </div>

            </td>

            <!-- TO -->

            <td>

              <div class="assignment-cell destination">

                <div class="assignment-line">

                  <Building2
                    :size="13"
                  />

                  <strong>
                    {{
                      item.toDepartment
                    }}
                  </strong>

                </div>

                <div class="assignment-line secondary">

                  <BriefcaseBusiness
                    :size="12"
                  />

                  <span>
                    {{
                      item.toPosition
                    }}
                  </span>

                </div>

              </div>

            </td>

            <!-- REASON -->

            <td>

              <p class="reason">
                {{
                  item.reason
                }}
              </p>

            </td>

            <!-- REQUEST DATE -->

            <td>

              <div class="date-cell">

                <CalendarDays
                  :size="13"
                />

                {{
                  formatDate(
                    item.requestedDate,
                  )
                }}

              </div>

            </td>

            <!-- EFFECTIVE -->

            <td>

              <strong class="effective-date">
                {{
                  formatDate(
                    item.effectiveDate,
                  )
                }}
              </strong>

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

                {{
                  item.status
                }}

              </span>

            </td>

            <!-- REQUESTED BY -->

            <td>

              <strong class="person-name">
                {{
                  item.requestedBy
                }}
              </strong>

            </td>

            <!-- REVIEWED BY -->

            <td>

              <div class="review-cell">

                <strong>
                  {{
                    item.reviewedBy ??
                    '—'
                  }}
                </strong>

                <span
                  v-if="
                    item.reviewedAt
                  "
                >
                  {{
                    new Date(
                      item.reviewedAt,
                    ).toLocaleDateString(
                      'en-US',
                      {
                        month:
                          'short',
                        day:
                          'numeric',
                        year:
                          'numeric',
                      },
                    )
                  }}
                </span>

              </div>

            </td>

            <!-- REMARKS -->

            <td>

              <p class="remarks">
                {{
                  item.remarks ||
                  'No remarks'
                }}
              </p>
            </td>

            <!-- ACTION -->
            <td class="transfer-actions-cell">
              <button
                type="button"
                class="transfer-more-button"
                :aria-label="`More actions for ${item.employeeName}`"
                aria-haspopup="menu"
                :aria-expanded="activeTransfer?.id === item.id"
                @click.stop="toggleActions(item, $event)"
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

      <ArrowRight
        :size="34"
      />

      <strong>
        No employee transfers found
      </strong>

      <span>
        Try changing your transfer filters.
      </span>

    </div>

  </article>

  
<Teleport to="body">
  <div
    v-if="activeTransfer"
    class="transfer-action-menu"
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
      <span>View Transfer</span>
    </button>

    <button
      type="button"
      role="menuitem"
      @click="selectAction('edit')"
    >
      <Pencil :size="15" />
      <span>Edit Transfer</span>
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

  font-size: 10px;
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;

  min-width: 2250px;

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

  font-size: 10px;

  vertical-align: middle;
}

tbody tr:hover {
  background:
    var(--bg-card-soft);
}

.transfer-number {
  color:
    var(--primary);

  font-size: 10px;

  white-space: nowrap;
}

/* EMPLOYEE */

.employee-cell {
  display: flex;

  min-width: 190px;

  align-items: center;

  gap: 9px;
}

.employee-icon {
  display: flex;

  width: 35px;
  height: 35px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

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

  font-size: 10px;
}

.employee-cell span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 9px;
}

/* TYPE */

.type-badge {
  display: inline-flex;

  padding:
    5px 9px;

  border-radius: 20px;

  font-size: 9px;
  font-weight: 650;

  white-space: nowrap;
}

.type-badge.department {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.type-badge.position {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.type-badge.both {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

/* ASSIGNMENTS */

.assignment-cell {
  min-width: 185px;

  padding:
    7px 9px;

  border:
    1px solid var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card-soft);
}

.assignment-cell.destination {
  border-color:
    color-mix(
      in srgb,
      var(--primary)
      20%,
      var(--border)
    );

  background:
    var(--primary-soft);
}

.assignment-line {
  display: flex;

  align-items: center;

  gap: 6px;

  color:
    var(--text-primary);
}

.assignment-line.secondary {
  margin-top: 5px;

  color:
    var(--text-secondary);
}

.assignment-line strong {
  font-size: 10px;
}

.assignment-line span {
  font-size: 9px;
}

.assignment-line svg {
  flex-shrink: 0;

  color:
    var(--text-muted);
}

.transfer-arrow {
  display: flex;

  width: 30px;
  height: 30px;

  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

/* REASON */

.reason {
  width: 235px;

  margin: 0;

  color:
    var(--text-secondary);

  font-size: 10px;

  line-height: 1.45;
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

.effective-date {
  color:
    var(--text-primary);

  white-space: nowrap;
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

.status-badge.pending {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.status-badge.review {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.status-badge.approved {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.status-badge.completed {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.status-badge.rejected {
  background:
    var(--red-soft);

  color:
    var(--red);
}

.status-badge.cancelled {
  background:
    var(--bg-card-soft);

  color:
    var(--text-muted);
}

.person-name {
  color:
    var(--text-primary);

  white-space: nowrap;
}

/* REVIEW */

.review-cell {
  min-width: 120px;
}

.review-cell strong,
.review-cell span {
  display: block;
}

.review-cell strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.review-cell span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 9px;
}

/* REMARKS */

.remarks {
  width: 190px;

  margin: 0;

  overflow: hidden;

  color:
    var(--text-secondary);

  font-size: 10px;

  text-overflow: ellipsis;

  white-space: nowrap;
}

/* ACTION */

.transfer-actions-cell {
  text-align: right;
}

.transfer-more-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.18s ease;
}

.transfer-more-button:hover,
.transfer-more-button[aria-expanded='true'] {
  border-color: var(--border);
  background: var(--bg-card-soft);
  color: var(--primary);
}

.transfer-more-button:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
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

  min-height: 260px;

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

  font-size: 12px;
}

.empty-state span {
  font-size: 10px;
}

.transfer-action-menu {
  position: fixed;
  z-index: 99999;
  width: 210px;
  padding: 6px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3);
}

.transfer-action-menu button {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 11px 12px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
}

.transfer-action-menu button:hover {
  background: var(--bg-card-soft);
  color: var(--primary);
}

.transfer-action-menu button svg {
  flex-shrink: 0;
  color: var(--text-secondary);
}

.transfer-action-menu button:hover svg {
  color: var(--primary);
}
</style>