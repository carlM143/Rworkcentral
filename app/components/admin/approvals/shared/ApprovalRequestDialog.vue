<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ShieldCheck, Check, X, RotateCcw } from 'lucide-vue-next'
import type { ApprovalUiKind, ApprovalUiRecord } from '~/utils/approvalUi'
import EmployeeLeaveDateCalendar from '~/components/employee/EmployeeLeaveDateCalendar.vue'

const props = withDefaults(defineProps<{
  open: boolean
  kind: ApprovalUiKind
  mode?: string
  request: ApprovalUiRecord | null
  processing?: boolean
}>(), {
  mode: 'view',
  processing: false,
})

const emit = defineEmits<{
  close: []
  approve: []
  reject: []
  revert: []
}>()

const formatDate = (value: string | null | undefined) => {
  if (!value) return '—'
  const date = new Date(`${value.slice(0, 10)}T12:00:00`)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      }).format(date)
}

const formatTime = (value: string | null | undefined) => {
  if (!value) return '—'
  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(parsed)
  }
  const [hour, minute] = String(value).split(':').map(Number)
  if (Number.isNaN(hour)) return value
  const d = new Date()
  d.setHours(hour ?? 0, minute ?? 0, 0, 0)
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(d)
}

const getDayName = (value: string | null | undefined) => {
  if (!value) return ''
  const date = new Date(`${value.slice(0, 10)}T12:00:00`)
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('en-US', { weekday: 'long' })
}

const requestType = computed(() => {
  if (!props.request) return ''
  if (props.kind === 'Overtime') return 'Overtime'
  if (props.kind === 'Leave') return 'Leave'
  return String(props.request.type || props.kind)
})

const isPending = computed(() => {
  const st = String(props.request?.status ?? '').toLowerCase()
  return st === 'pending' || st === 'for review'
})

const canUndo = computed(() => {
  const st = String(props.request?.status ?? '').toLowerCase()
  return st === 'approved' || st === 'rejected'
})

const calendarStart = ref('')
const calendarEnd = ref('')

watch(() => props.request, (req) => {
  if (!req) return
  const fallback = (req.requestDate || req.overtimeDate || req.undertimeDate || req.startDate || '').slice(0, 10)
  const firstDate = req.dates?.[0]?.leave_date?.slice(0, 10)
  const lastDate = req.dates?.[req.dates.length - 1]?.leave_date?.slice(0, 10)
  calendarStart.value = req.start || firstDate || fallback
  calendarEnd.value = req.end || lastDate || calendarStart.value
}, { immediate: true })

const scheduledDates = computed(() => {
  if (!props.request || requestType.value !== 'Leave') return []
  if (Array.isArray(props.request.dates) && props.request.dates.length > 0) {
    return props.request.dates
  }
  const s = calendarStart.value
  if (!s) return []
  return [{
    id: 0,
    leave_date: s,
    day_type: 'whole_day' as const,
    day_value: 1,
  }]
})

const totalScheduledDays = computed(() => {
  if (props.request?.totalDays && props.request.totalDays > 0) {
    return props.request.totalDays
  }
  return scheduledDates.value.reduce((acc: number, curr: any) => acc + (Number(curr.day_value) || 1), 0)
})

const activeDateStrings = computed<string[]>(() => {
  if (Array.isArray(props.request?.dates) && props.request.dates.length > 0) {
    const list = props.request.dates
      .map((d: any) => (d.leave_date || d.date || '').slice(0, 10))
      .filter(Boolean)
    return Array.from(new Set(list)).sort()
  }
  if (calendarStart.value && calendarEnd.value && calendarStart.value === calendarEnd.value) {
    return [calendarStart.value.slice(0, 10)]
  }
  return []
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open && request" class="modal-overlay" @click.self="!processing && emit('close')">
      <article
        class="approval-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-modal-title"
      >
        <header class="modal-header">
          <div class="heading">
            <div class="modal-icon"><ShieldCheck :size="19" /></div>
            <div>
              <h3 id="preview-modal-title">Preview {{ requestType }} Request</h3>
              <p>Review employee request details and confirm your decision.</p>
            </div>
          </div>

          <button
            type="button"
            class="close-button"
            :disabled="processing"
            aria-label="Close preview"
            @click="emit('close')"
          >
            <X :size="17" />
          </button>
        </header>

        <div class="modal-body">
          <div class="section-title">Request Information</div>

          <div class="review-row">
            <span>Reference Number</span>
            <strong class="reference">{{ request.reference || request.requestNumber || `#${request.id}` }}</strong>
          </div>

          <div class="review-row">
            <span>Employee</span>
            <strong>{{ request.employeeName || 'Unknown Employee' }}</strong>
          </div>

          <div class="review-row">
            <span>Employee ID</span>
            <strong>{{ request.employeeNumber || '—' }}</strong>
          </div>

          <div class="review-row">
            <span>Department</span>
            <strong>{{ request.department || '—' }}</strong>
          </div>

          <div class="review-row">
            <span>Request Type</span>
            <strong>{{ requestType }}</strong>
          </div>

          <div class="review-row">
            <span>Request Title</span>
            <strong>{{ request.title || request.overtimeType || requestType }}</strong>
          </div>

          <div class="review-row">
            <span>Status</span>
            <span class="status-badge" :class="String(request.status || 'pending').toLowerCase()">
              {{ request.status || 'Pending' }}
            </span>
          </div>

          <div class="review-row">
            <span>Target / Request Date</span>
            <strong>{{ formatDate(request.requestDate || request.overtimeDate || request.undertimeDate) }}</strong>
          </div>

          <!-- Leave Specific Rows -->
          <template v-if="requestType === 'Leave'">
            <div class="review-row">
              <span>Start Date</span>
              <strong>{{ formatDate(calendarStart) }}</strong>
            </div>

            <div class="review-row">
              <span>End Date</span>
              <strong>{{ formatDate(calendarEnd) }}</strong>
            </div>

            <div v-if="request.requestedPayType" class="review-row">
              <span>Requested Payment Type</span>
              <span class="pay-badge" :class="request.requestedPayType">
                {{ request.requestedPayType === 'paid' ? 'Paid Leave' : 'Unpaid Leave' }}
              </span>
            </div>

            <!-- Employee POV Leave Date Calendar -->
            <div v-if="calendarStart" class="calendar-input-group">
              <label class="calendar-group-label">
                <span>Leave Schedule Calendar</span>
              </label>
              <EmployeeLeaveDateCalendar
                v-model:start="calendarStart"
                v-model:end="calendarEnd"
                :active-dates="activeDateStrings"
                :total-days="totalScheduledDays"
                readonly
              />
            </div>

            <!-- Employee POV Scheduled Leave Days Breakdown -->
            <div v-if="scheduledDates.length > 0" class="view-leave-dates">
              <h3>
                Scheduled Leave Days ({{ totalScheduledDays }} Total Day{{ totalScheduledDays === 1 ? '' : 's' }})
              </h3>
              <div class="view-dates-grid">
                <div
                  v-for="(d, dIdx) in scheduledDates"
                  :key="d.id || d.leave_date"
                  class="view-date-item"
                >
                  <div class="view-date-header">
                    <span class="view-date-day">Day {{ dIdx + 1 }} · {{ getDayName(d.leave_date) }}</span>
                    <span
                      class="day-type-badge"
                      :class="d.day_type === 'half_day' ? 'badge-half' : 'badge-whole'"
                    >
                      {{ d.day_type === 'half_day' ? 'Half Day (0.5)' : 'Whole Day (1.0)' }}
                    </span>
                  </div>
                  <strong class="view-date-val">{{ formatDate(d.leave_date) }}</strong>
                </div>
              </div>
            </div>
          </template>

          <!-- Overtime Specific Rows -->
          <template v-else-if="requestType === 'Overtime'">
            <div class="review-row">
              <span>Overtime Type</span>
              <strong>{{ request.overtimeType || 'Regular OT' }}</strong>
            </div>

            <div v-if="request.startTime" class="review-row">
              <span>Start Time</span>
              <strong>{{ formatTime(request.startTime) }}</strong>
            </div>

            <div v-if="request.endTime" class="review-row">
              <span>End Time</span>
              <strong>{{ formatTime(request.endTime) }}</strong>
            </div>

            <div v-if="request.requestedHours !== undefined" class="review-row">
              <span>Requested Hours</span>
              <strong>{{ request.requestedHours }} hrs</strong>
            </div>

            <div v-if="request.approvedHours !== undefined" class="review-row">
              <span>Approved Hours</span>
              <strong>{{ request.approvedHours }} hrs</strong>
            </div>

            <div class="review-row">
              <span>Supervisor</span>
              <strong>{{ (request.immediateSupervisor && request.immediateSupervisor !== '—') ? request.immediateSupervisor : 'Not assigned' }}</strong>
            </div>

            <div v-if="request.filedAt || request.submittedAt" class="review-row">
              <span>Filed Date</span>
              <strong>{{ formatDate(request.filedAt || request.submittedAt) }}</strong>
            </div>

            <div v-if="request.reviewedBy || request.approver" class="review-row">
              <span>Reviewed By</span>
              <strong>{{ request.reviewedBy || request.approver }}</strong>
            </div>

            <div v-if="request.reviewedAt" class="review-row">
              <span>Reviewed At</span>
              <strong>{{ formatDate(request.reviewedAt) }}</strong>
            </div>

            <div v-if="request.remarks" class="review-row">
              <span>Remarks</span>
              <strong>{{ request.remarks }}</strong>
            </div>
          </template>

          <!-- Undertime Specific Rows -->
          <template v-else-if="requestType === 'Undertime'">
            <div v-if="request.requestedTimeOut" class="review-row">
              <span>Requested Time Out</span>
              <strong>{{ formatTime(request.requestedTimeOut) }}</strong>
            </div>

            <div v-if="request.scheduledTimeOut" class="review-row">
              <span>Scheduled Time Out</span>
              <strong>{{ formatTime(request.scheduledTimeOut) }}</strong>
            </div>

            <div v-if="request.requestedMinutes !== undefined" class="review-row">
              <span>Requested Undertime</span>
              <strong>{{ request.requestedMinutes }} mins</strong>
            </div>

            <div v-if="request.requestedAt || request.submittedAt" class="review-row">
              <span>Filed Date</span>
              <strong>{{ formatDate(request.requestedAt || request.submittedAt) }}</strong>
            </div>

            <div v-if="request.reviewedBy" class="review-row">
              <span>Reviewed By</span>
              <strong>{{ request.reviewedBy }}</strong>
            </div>

            <div v-if="request.reviewedAt" class="review-row">
              <span>Reviewed At</span>
              <strong>{{ formatDate(request.reviewedAt) }}</strong>
            </div>
          </template>

          <div class="reason-section">
            <span>Reason / Details</span>
            <p>{{ request.description || request.reason || 'No reason provided.' }}</p>
          </div>
        </div>

        <footer class="modal-footer">
          <button
            type="button"
            class="cancel-button"
            :disabled="processing"
            @click="emit('close')"
          >
            Cancel
          </button>

          <button
            v-if="canUndo"
            type="button"
            class="revert-button"
            :disabled="processing"
            @click="emit('revert')"
          >
            <RotateCcw :size="15" />
            {{ processing ? 'Reverting...' : 'Undo / Revert to Pending' }}
          </button>

          <template v-if="isPending">
            <button
              type="button"
              class="reject-button"
              :disabled="processing"
              @click="emit('reject')"
            >
              <X :size="15" />
              {{ processing ? 'Processing...' : 'Reject' }}
            </button>

            <button
              type="button"
              class="approve-button"
              :disabled="processing"
              @click="emit('approve')"
            >
              <Check :size="15" />
              {{ processing ? 'Approving...' : 'Approve' }}
            </button>
          </template>
        </footer>
      </article>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay{position:fixed;inset:0;z-index:99990;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(3,8,18,.78);backdrop-filter:blur(4px)}
.approval-modal{width:100%;max-width:580px;max-height:calc(100dvh - 36px);display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--border);border-radius:12px;background:var(--bg-card);box-shadow:0 25px 70px rgba(0,0,0,.35)}
.modal-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:17px 19px;border-bottom:1px solid var(--border-soft)}
.heading{display:flex;align-items:center;gap:10px}
.modal-icon{display:flex;width:39px;height:39px;flex-shrink:0;align-items:center;justify-content:center;border-radius:9px;background:var(--green-soft);color:var(--green)}
.heading h3{margin:0;color:var(--text-primary);font-size:14px}
.heading p{margin:4px 0 0;color:var(--text-muted);font-size:9px}
.close-button{display:flex;width:32px;height:32px;flex-shrink:0;align-items:center;justify-content:center;border:1px solid var(--border);border-radius:7px;background:transparent;color:var(--text-secondary);cursor:pointer}
.modal-body{overflow-y:auto;padding:17px 19px}
.section-title{margin-bottom:10px;color:var(--text-primary);font-size:11px;font-weight:700}
.review-row{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:10px 0;border-bottom:1px solid var(--border-soft)}
.review-row>span:first-child{color:var(--text-muted);font-size:10px}
.review-row strong{max-width:65%;color:var(--text-primary);font-size:10px;font-weight:650;text-align:right;overflow-wrap:anywhere}
.review-row .reference{color:var(--primary)}
.status-badge,.pay-badge{display:inline-flex;padding:5px 9px;border-radius:20px;font-size:9px;font-weight:650;text-transform:capitalize}
.status-badge.pending{background:var(--orange-soft);color:var(--orange)}
.status-badge.approved,.pay-badge.paid{background:var(--green-soft);color:var(--green)}
.status-badge.rejected{background:var(--red-soft);color:var(--red)}
.pay-badge.unpaid{background:var(--bg-card-soft);color:var(--text-secondary)}

/* Calendar Input Group */
.calendar-input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 14px;
}
.calendar-group-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.calendar-group-label span {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
}

/* View Dialog Dates Breakdown */
.view-leave-dates {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--border-soft);
}
.view-leave-dates h3 {
  font-size: 12px;
  margin: 0 0 10px;
  color: var(--text-primary);
}
.view-dates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 8px;
  margin-bottom: 4px;
}
.view-date-item {
  padding: 8px 10px;
  background: var(--bg-card-soft);
  border: 1px solid var(--border);
  border-radius: 7px;
}
.view-date-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  margin-bottom: 4px;
}
.view-date-day {
  color: var(--text-muted);
  font-weight: 500;
}
.view-date-val {
  font-size: 12px;
  color: var(--text-primary);
}
.day-type-badge {
  display: inline-block;
  font-size: 9px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}
.badge-whole {
  background: var(--green-soft);
  color: var(--green);
}
.badge-half {
  background: var(--orange-soft);
  color: var(--orange);
}

.reason-section{padding:14px 0 4px}
.reason-section span{color:var(--text-muted);font-size:10px}
.reason-section p{margin:8px 0 0;color:var(--text-primary);font-size:10px;line-height:1.6;overflow-wrap:anywhere}
.modal-footer{display:flex;justify-content:flex-end;gap:9px;padding:14px 19px;border-top:1px solid var(--border-soft)}
.cancel-button,.approve-button,.reject-button,.revert-button{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:38px;padding:0 14px;border:1px solid var(--border);border-radius:7px;font-family:inherit;font-size:10px;font-weight:650;cursor:pointer}
.cancel-button{background:transparent;color:var(--text-secondary)}
.approve-button{border-color:var(--green);background:var(--green);color:#fff}
.reject-button{border-color:var(--red);background:var(--red-soft);color:var(--red)}
.reject-button:hover{background:var(--red);color:#fff}
.revert-button{border-color:var(--orange);background:var(--orange-soft);color:var(--orange)}
.revert-button:hover{background:var(--orange);color:#fff}
button:disabled{opacity:.5;cursor:not-allowed}
</style>
