<script setup lang="ts">
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MoreHorizontal,
  Eye,
  History,
  X,
  FileText,
  CalendarClock,
  Timer,
  UserRound,
  WalletCards,
} from 'lucide-vue-next'

import type {
  ApprovedOvertime,
  ApprovedOvertimePayrollStatus,
  ApprovedOvertimeType,
} from '~/types/approvedOvertime'

defineProps<{
  records:
    ApprovedOvertime[]
}>()

const formatDate = (
  value: string,
) => {
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

const formatDateTime = (
  value: string,
) => {
  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    },
  ).format(
    new Date(value),
  )
}

const formatTime = (
  value: string,
) => {
  const [
    hour,
    minute,
  ] =
    value
      .split(':')
      .map(Number)

  const date =
    new Date()

  date.setHours(
    hour ?? 0,
    minute ?? 0,
    0,
    0,
  )

  return new Intl.DateTimeFormat(
    'en-US',
    {
      hour: 'numeric',
      minute: '2-digit',
    },
  ).format(date)
}

const typeClass = (
  type:
    ApprovedOvertimeType,
) => {
  if (
    type ===
    'Regular OT'
  ) {
    return 'regular'
  }

  if (
    type ===
    'Rest Day OT'
  ) {
    return 'rest-day'
  }

  return 'holiday'
}

const payrollClass = (
  status:
    ApprovedOvertimePayrollStatus,
) => {
  if (
    status ===
    'Ready for Payroll'
  ) {
    return 'ready'
  }

  if (
    status ===
    'Included in Payroll'
  ) {
    return 'included'
  }

  return 'processed'
}

// View-only actions; existing approved OT data is never modified.
const router = useRouter()
const activeMenuId = ref<number | null>(null)
const menuPosition = ref({ top: 0, left: 0 })
const menuElement = ref<HTMLElement | null>(null)
const selectedRecord = ref<ApprovedOvertime | null>(null)
const activeModal = ref<'details' | 'payroll' | null>(null)

const closeMenu = () => { activeMenuId.value = null }
const toggleActions = (item: ApprovedOvertime, event: MouseEvent) => {
  if (activeMenuId.value === item.id) { closeMenu(); return }
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const width = 220
  menuPosition.value = {
    left: Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8)),
    top: rect.bottom + 8 + 145 > window.innerHeight
      ? Math.max(8, rect.top - 145)
      : rect.bottom + 8,
  }
  activeMenuId.value = item.id
}
const showDetails = (item: ApprovedOvertime) => {
  selectedRecord.value = item
  activeModal.value = 'details'
  closeMenu()
}
const showPayroll = (item: ApprovedOvertime) => {
  selectedRecord.value = item
  activeModal.value = 'payroll'
  closeMenu()
}
const showHistory = (item: ApprovedOvertime) => {
  closeMenu()
  router.push({ path: '/overtime-history', query: { search: item.requestNumber } })
}
const closeModal = () => { activeModal.value = null; selectedRecord.value = null }
const onDocumentPointer = (event: PointerEvent) => {
  const target = event.target as HTMLElement | null
  if (target?.closest('[data-ot-action]') || menuElement.value?.contains(target)) return
  closeMenu()
}
const onEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') { closeModal(); closeMenu() }
}
onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointer)
  document.addEventListener('keydown', onEscape)
  window.addEventListener('resize', closeMenu)
  window.addEventListener('scroll', closeMenu, true)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointer)
  document.removeEventListener('keydown', onEscape)
  window.removeEventListener('resize', closeMenu)
  window.removeEventListener('scroll', closeMenu, true)
})
</script>

<template>
  <article class="table-card">

    <div class="table-heading">

      <div>

        <h3>
          Approved Overtime
        </h3>

        <p>
          Approved overtime records ready for
          payroll processing and payroll history.
        </p>

      </div>

    </div>

    <div
      v-if="
        records.length
      "
      class="table-scroll"
    >

      <table>

        <thead>
          <tr>
            <th>OT No.</th>
            <th>Employee</th>
            <th>Department</th>
            <th>OT Date</th>
            <th>Schedule</th>
            <th>OT Type</th>
            <th>Requested</th>
            <th>Approved</th>
            <th>Reason</th>
            <th>Approved By</th>
            <th>Approved Date</th>
            <th>Payroll Period</th>
            <th>Payroll Status</th>
            <th />
          </tr>
        </thead>

        <tbody>

          <tr
            v-for="
              item in records
            "
            :key="
              item.id
            "
          >

            <!-- OT NUMBER -->

            <td>

              <strong class="request-number">
                {{
                  item.requestNumber
                }}
              </strong>

            </td>

            <!-- EMPLOYEE -->

            <td>

              <div class="employee-cell">

                <div class="employee-icon">

                  <UserRound
                    :size="15"
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
                    ·
                    {{
                      item.position
                    }}
                  </span>

                </div>

              </div>

            </td>

            <!-- DEPARTMENT -->

            <td>

              <strong class="department">
                {{
                  item.department
                }}
              </strong>

            </td>

            <!-- DATE -->

            <td>

              <div class="date-cell">

                <CalendarDays
                  :size="13"
                />

                {{
                  formatDate(
                    item.overtimeDate,
                  )
                }}

              </div>

            </td>

            <!-- TIME -->

            <td>

              <div class="schedule-cell">

                <Clock3
                  :size="13"
                />

                {{
                  formatTime(
                    item.startTime,
                  )
                }}
                –
                {{
                  formatTime(
                    item.endTime,
                  )
                }}

              </div>

            </td>

            <!-- TYPE -->

            <td>

              <span
                class="type-badge"
                :class="
                  typeClass(
                    item.overtimeType,
                  )
                "
              >
                {{
                  item.overtimeType
                }}
              </span>

            </td>

            <!-- REQUESTED -->

            <td>

              <div class="hour-cell requested">

                <Timer
                  :size="13"
                />

                <strong>
                  {{
                    item.requestedHours
                  }}
                  hrs
                </strong>

              </div>

            </td>

            <!-- APPROVED -->

            <td>

              <div class="hour-cell approved">

                <CheckCircle2
                  :size="13"
                />

                <strong>
                  {{
                    item.approvedHours
                  }}
                  hrs
                </strong>

              </div>

            </td>

            <!-- REASON -->

            <td>

              <div class="reason-cell">

                <strong>
                  {{
                    item.reason
                  }}
                </strong>

                <span
                  v-if="
                    item.remarks
                  "
                >
                  {{
                    item.remarks
                  }}
                </span>

              </div>

            </td>

            <!-- APPROVED BY -->

            <td>

              <strong class="approved-by">
                {{
                  item.approvedBy
                }}
              </strong>

            </td>

            <!-- APPROVED DATE -->

            <td>

              <span class="approved-date">
                {{
                  formatDateTime(
                    item.approvedAt,
                  )
                }}
              </span>

            </td>

            <!-- PERIOD -->

            <td>

              <span class="payroll-period">
                {{
                  item.payrollPeriod ??
                  '—'
                }}
              </span>

            </td>

            <!-- PAYROLL STATUS -->

            <td>

              <span
                class="payroll-status"
                :class="
                  payrollClass(
                    item.payrollStatus,
                  )
                "
              >

                <WalletCards
                  :size="12"
                />

                {{
                  item.payrollStatus
                }}

              </span>

            </td>

            <!-- ACTION -->

            <td>

              <button
                type="button"
                class="action-button"
                :aria-expanded="activeMenuId === item.id"
                :aria-label="`Actions for ${item.requestNumber}`"
                data-ot-action
                @click.stop="toggleActions(item, $event)"
              >

                <MoreHorizontal
                  :size="18"
                />

              </button>

            </td>

          </tr>

        </tbody>

      </table>

    </div>

    <!-- EMPTY -->

    <div
      v-else
      class="empty-state"
    >

      <CheckCircle2
        :size="34"
      />

      <strong>
        No approved overtime found
      </strong>

      <span>
        Try changing your overtime filters.
      </span>

    </div>

  </article>

  <!-- Teleport prevents the horizontal table scrollbar from clipping the menu. -->
  <Teleport to="body">
    <div
      v-if="activeMenuId !== null"
      ref="menuElement"
      class="ot-action-menu"
      :style="{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }"
      role="menu"
    >
      <button type="button" role="menuitem" @click="showDetails(records.find(r => r.id === activeMenuId)!)">
        <Eye :size="15" /> View OT Details
      </button>
      <button type="button" role="menuitem" @click="showPayroll(records.find(r => r.id === activeMenuId)!)">
        <CalendarClock :size="15" /> View Payroll Period
      </button>
      <div class="ot-menu-divider" />
      <button type="button" role="menuitem" @click="showHistory(records.find(r => r.id === activeMenuId)!)">
        <History :size="15" /> View Overtime History
      </button>
    </div>

    <Transition name="ot-modal">
      <div v-if="activeModal && selectedRecord" class="ot-modal-backdrop" @click.self="closeModal">
        <section class="ot-modal-panel" role="dialog" aria-modal="true" aria-labelledby="ot-dialog-title">
          <header class="ot-modal-header">
            <div class="ot-modal-heading">
              <div class="ot-modal-icon"><FileText v-if="activeModal === 'details'" :size="19" /><WalletCards v-else :size="19" /></div>
              <div>
                <h2 id="ot-dialog-title">{{ activeModal === 'details' ? 'Approved Overtime Details' : 'Payroll Period Details' }}</h2>
                <p>{{ selectedRecord.requestNumber }} · {{ selectedRecord.employeeName }}</p>
              </div>
            </div>
            <button type="button" class="ot-close-button" aria-label="Close" @click="closeModal"><X :size="17" /></button>
          </header>

          <div class="ot-modal-content">
            <div class="ot-employee-summary">
              <span class="ot-avatar"><UserRound :size="21" /></span>
              <div><strong>{{ selectedRecord.employeeName }}</strong><p>{{ selectedRecord.employeeNumber }} · {{ selectedRecord.position }} · {{ selectedRecord.department }}</p></div>
            </div>

            <template v-if="activeModal === 'details'">
              <h3 class="ot-section-title">Overtime Information</h3>
              <div class="ot-detail-grid">
                <div class="ot-detail"><span>OT Request No.</span><strong>{{ selectedRecord.requestNumber }}</strong></div>
                <div class="ot-detail"><span>Overtime Date</span><strong>{{ formatDate(selectedRecord.overtimeDate) }}</strong></div>
                <div class="ot-detail"><span>Schedule</span><strong>{{ formatTime(selectedRecord.startTime) }} – {{ formatTime(selectedRecord.endTime) }}</strong></div>
                <div class="ot-detail"><span>OT Type</span><strong>{{ selectedRecord.overtimeType }}</strong></div>
                <div class="ot-detail"><span>Requested Hours</span><strong>{{ selectedRecord.requestedHours }} hrs</strong></div>
                <div class="ot-detail"><span>Approved Hours</span><strong class="ot-green">{{ selectedRecord.approvedHours }} hrs</strong></div>
              </div>
              <h3 class="ot-section-title">Reason and Approval</h3>
              <div class="ot-note"><span>Reason for Overtime</span><p>{{ selectedRecord.reason }}</p></div>
              <div v-if="selectedRecord.remarks" class="ot-note"><span>Approval Remarks</span><p>{{ selectedRecord.remarks }}</p></div>
              <div class="ot-detail-grid">
                <div class="ot-detail"><span>Approved By</span><strong>{{ selectedRecord.approvedBy }}</strong></div>
                <div class="ot-detail"><span>Approval Date</span><strong>{{ formatDateTime(selectedRecord.approvedAt) }}</strong></div>
                <div class="ot-detail"><span>Payroll Period</span><strong>{{ selectedRecord.payrollPeriod || '—' }}</strong></div>
                <div class="ot-detail"><span>Payroll Status</span><strong>{{ selectedRecord.payrollStatus }}</strong></div>
              </div>
            </template>

            <template v-else>
              <h3 class="ot-section-title">Payroll Information</h3>
              <div class="ot-detail-grid">
                <div class="ot-detail"><span>Payroll Period</span><strong>{{ selectedRecord.payrollPeriod || 'Not assigned' }}</strong></div>
                <div class="ot-detail"><span>Payroll Status</span><strong>{{ selectedRecord.payrollStatus }}</strong></div>
                <div class="ot-detail"><span>Approved OT Hours</span><strong class="ot-green">{{ selectedRecord.approvedHours }} hrs</strong></div>
                <div class="ot-detail"><span>OT Type</span><strong>{{ selectedRecord.overtimeType }}</strong></div>
                <div class="ot-detail"><span>OT Date</span><strong>{{ formatDate(selectedRecord.overtimeDate) }}</strong></div>
                <div class="ot-detail"><span>Approved Date</span><strong>{{ formatDateTime(selectedRecord.approvedAt) }}</strong></div>
              </div>
              <div class="ot-note"><span>Payroll Details</span><p>Payroll reference, payment amount and payslip are not yet available in the current approved overtime data.</p></div>
            </template>
          </div>
          <footer class="ot-modal-footer"><button type="button" @click="closeModal">Close Details</button></footer>
        </section>
      </div>
    </Transition>
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

  min-width: 2150px;

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

.request-number {
  color:
    var(--primary);

  font-size: 10px;

  white-space: nowrap;
}

/* EMPLOYEE */

.employee-cell {
  display: flex;

  min-width: 230px;

  align-items: center;

  gap: 8px;
}

.employee-icon {
  display: flex;

  width: 34px;
  height: 34px;

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

.department {
  color:
    var(--text-primary);

  font-size: 10px;

  white-space: nowrap;
}

/* DATE / TIME */

.date-cell,
.schedule-cell {
  display: flex;

  align-items: center;

  gap: 5px;

  white-space: nowrap;
}

.date-cell svg,
.schedule-cell svg {
  color:
    var(--text-muted);
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

.type-badge.regular {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.type-badge.rest-day {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.type-badge.holiday {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

/* HOURS */

.hour-cell {
  display: inline-flex;

  align-items: center;

  gap: 4px;

  white-space: nowrap;
}

.hour-cell.requested {
  color:
    var(--orange);
}

.hour-cell.approved {
  color:
    var(--green);
}

.hour-cell strong {
  font-size: 10px;
}

/* REASON */

.reason-cell {
  min-width: 240px;

  max-width: 290px;
}

.reason-cell strong,
.reason-cell span {
  display: block;
}

.reason-cell strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.reason-cell span {
  overflow: hidden;

  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 9px;

  text-overflow: ellipsis;

  white-space: nowrap;
}

.approved-by {
  color:
    var(--text-primary);

  white-space: nowrap;
}

.approved-date,
.payroll-period {
  white-space: nowrap;
}

/* PAYROLL STATUS */

.payroll-status {
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

.payroll-status.ready {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.payroll-status.included {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.payroll-status.processed {
  background:
    var(--green-soft);

  color:
    var(--green);
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

/* Action dropdown and view-only modals */
.ot-action-menu { position: fixed; z-index: 10000; width: 220px; padding: 6px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-card); box-shadow: 0 16px 40px rgba(0,0,0,.25); }
.ot-action-menu button { display: flex; align-items: center; gap: 10px; width: 100%; padding: 11px 10px; border: 0; border-radius: 7px; background: transparent; color: var(--text-primary); text-align: left; font-size: 11px; cursor: pointer; }
.ot-action-menu button:hover { background: var(--primary-soft); color: var(--primary); }
.ot-menu-divider { height: 1px; margin: 4px 0; background: var(--border); }
.ot-modal-backdrop { position: fixed; inset: 0; z-index: 10001; display: flex; align-items: center; justify-content: center; padding: 18px; background: rgba(3,12,29,.76); backdrop-filter: blur(5px); }
.ot-modal-panel { width: min(100%, 630px); max-height: 90vh; overflow-y: auto; border: 1px solid var(--border); border-radius: 13px; background: var(--bg-card); box-shadow: 0 25px 65px rgba(0,0,0,.3); }
.ot-modal-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 18px; border-bottom: 1px solid var(--border); }
.ot-modal-heading { display: flex; align-items: center; gap: 10px; min-width: 0; }
.ot-modal-icon { display: grid; place-items: center; width: 38px; height: 38px; flex-shrink: 0; border-radius: 9px; background: var(--primary-soft); color: var(--primary); }
.ot-modal-heading h2 { margin: 0; color: var(--text-primary); font-size: 13px; }
.ot-modal-heading p { margin: 4px 0 0; color: var(--text-muted); font-size: 10px; }
.ot-close-button { display: grid; place-items: center; width: 30px; height: 30px; border: 1px solid var(--border); border-radius: 7px; background: transparent; color: var(--text-secondary); cursor: pointer; }
.ot-close-button:hover { color: var(--red); background: var(--red-soft); }
.ot-modal-content { padding: 17px 18px; }
.ot-employee-summary { display: flex; align-items: center; gap: 10px; padding: 12px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-card-soft); }
.ot-avatar { display: grid; place-items: center; width: 40px; height: 40px; flex-shrink: 0; border-radius: 9px; background: var(--primary-soft); color: var(--primary); }
.ot-employee-summary strong { font-size: 12px; color: var(--text-primary); }
.ot-employee-summary p { margin: 4px 0 0; font-size: 10px; color: var(--text-muted); }
.ot-section-title { margin: 19px 0 10px; font-size: 11px; color: var(--text-primary); }
.ot-detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 9px; }
.ot-detail { display: flex; flex-direction: column; gap: 7px; padding: 11px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); }
.ot-detail span, .ot-note span { font-size: 9px; color: var(--text-muted); }
.ot-detail strong { font-size: 11px; color: var(--text-primary); overflow-wrap: anywhere; }
.ot-detail strong.ot-green { color: var(--green); }
.ot-note { margin-bottom: 9px; padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); }
.ot-note p { margin: 6px 0 0; font-size: 11px; line-height: 1.6; color: var(--text-primary); overflow-wrap: anywhere; }
.ot-modal-footer { display: flex; justify-content: flex-end; padding: 13px 18px; border-top: 1px solid var(--border); }
.ot-modal-footer button { padding: 10px 16px; border: 0; border-radius: 8px; background: var(--primary); color: #fff; font-size: 11px; font-weight: 600; cursor: pointer; }
.ot-modal-enter-active,.ot-modal-leave-active { transition: opacity .18s ease; }
.ot-modal-enter-from,.ot-modal-leave-to { opacity: 0; }
@media (max-width: 550px) { .ot-detail-grid { grid-template-columns: 1fr; } .ot-modal-content,.ot-modal-header,.ot-modal-footer { padding: 13px; } }
</style>
