<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ShieldCheck, Check, X, AlertTriangle, RotateCcw } from 'lucide-vue-next'
import type { LeaveApproval } from '~/types/leaveApproval'
import EmployeeLeaveDateCalendar from '~/components/employee/EmployeeLeaveDateCalendar.vue'

const props = withDefaults(defineProps<{
  request: LeaveApproval | null
  approving?: boolean
  blockedReason?: string
}>(), {
  approving: false,
  blockedReason: '',
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

const getDayName = (value: string | null | undefined) => {
  if (!value) return ''
  const date = new Date(`${value.slice(0, 10)}T12:00:00`)
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('en-US', { weekday: 'long' })
}

const calendarStart = ref('')
const calendarEnd = ref('')

watch(() => props.request, (req) => {
  if (!req) return
  const fallback = req.request_date ? req.request_date.slice(0, 10) : ''
  const firstDate = req.dates?.[0]?.leave_date?.slice(0, 10)
  const lastDate = req.dates?.[req.dates.length - 1]?.leave_date?.slice(0, 10)
  calendarStart.value = req.start || firstDate || fallback
  calendarEnd.value = req.end || lastDate || calendarStart.value
}, { immediate: true })

const scheduledDates = computed(() => {
  if (!props.request) return []
  if (props.request.dates && props.request.dates.length > 0) {
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
  if (props.request?.total_days && props.request.total_days > 0) {
    return props.request.total_days
  }
  return scheduledDates.value.reduce((acc, curr) => acc + (Number(curr.day_value) || 1), 0)
})

const activeDateStrings = computed<string[]>(() => {
  if (props.request?.dates && props.request.dates.length > 0) {
    const list = props.request.dates
      .map(d => (d.leave_date || '').slice(0, 10))
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
    <div v-if="request" class="modal-overlay" @click.self="!approving && emit('close')">
      <article
        class="approval-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="approval-title"
      >
        <header class="modal-header">
          <div class="heading">
            <div class="modal-icon"><ShieldCheck :size="19" /></div>
            <div>
              <h3 id="approval-title">Preview Leave Request</h3>
              <p>Review employee information and leave schedule before confirming your decision.</p>
            </div>
          </div>

          <button
            type="button"
            class="close-button"
            :disabled="approving"
            aria-label="Close review"
            @click="emit('close')"
          >
            <X :size="17" />
          </button>
        </header>

        <div class="modal-body">
          <div class="section-title">Request Information</div>

          <div class="review-row">
            <span>Request Number</span>
            <strong class="reference">{{ request.request_no }}</strong>
          </div>

          <div class="review-row">
            <span>Employee</span>
            <strong>{{ request.employee?.name || 'Unknown Employee' }}</strong>
          </div>

          <div class="review-row">
            <span>Employee ID</span>
            <strong>{{ request.employee?.emp_id ?? '—' }}</strong>
          </div>

          <div class="review-row">
            <span>Leave Type</span>
            <strong>{{ request.leave_type }}</strong>
          </div>

          <div class="review-row">
            <span>Date Filed</span>
            <strong>{{ formatDate(request.request_date) }}</strong>
          </div>

          <div class="review-row">
            <span>Start Date</span>
            <strong>{{ formatDate(calendarStart) }}</strong>
          </div>

          <div class="review-row">
            <span>End Date</span>
            <strong>{{ formatDate(calendarEnd) }}</strong>
          </div>

          <div class="review-row">
            <span>Requested Payment Type</span>
            <span class="pay-badge" :class="request.requested_pay_type">
              {{ request.requested_pay_type === 'paid' ? 'Paid Leave' : 'Unpaid Leave' }}
            </span>
          </div>

          <div class="review-row">
            <span>Leave Policy</span>
            <strong>#{{ request.leave_policy_id }}</strong>
          </div>

          <div class="review-row">
            <span>Policy Status</span>
            <strong class="capitalize">{{ request.policy_status || 'Not available' }}</strong>
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

          <div class="reason-section">
            <span>Reason for Leave</span>
            <p>{{ request.reason || 'No reason provided.' }}</p>
          </div>

          <div v-if="blockedReason" class="notice blocked">
            <AlertTriangle :size="17" />
            <div>
              <strong>Approval Cannot Proceed</strong>
              <p>{{ blockedReason }}</p>
            </div>
          </div>

          <div v-else class="notice ready">
            <ShieldCheck :size="17" />
            <div>
              <strong>Initial Policy Check Passed</strong>
              <p>The assigned policy is approved, eligible and matches the requested payment type.</p>
            </div>
          </div>

          <p class="verification-note">
            Full leave-date, credit-balance and service-eligibility checks are not yet implemented. This action should not be used for final payroll processing until those validations are added.
          </p>
        </div>

        <footer class="modal-footer">
          <button type="button" class="cancel-button" :disabled="approving" @click="emit('close')">
            Cancel
          </button>

          <button
            v-if="request.status !== 'pending' && request.status !== 'cancelled'"
            type="button"
            class="revert-button"
            :disabled="approving"
            @click="emit('revert')"
          >
            <RotateCcw :size="15" />
            {{ approving ? 'Reverting...' : 'Undo / Revert to Pending' }}
          </button>

          <template v-if="request.status === 'pending'">
            <button
              type="button"
              class="reject-button"
              :disabled="approving"
              @click="emit('reject')"
            >
              <X :size="15" />
              {{ approving ? 'Processing...' : 'Reject' }}
            </button>

            <button
              type="button"
              class="approve-button"
              :disabled="approving || !!blockedReason"
              @click="emit('approve')"
            >
              <Check :size="15" />
              {{ approving ? 'Approving...' : 'Approve' }}
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
.capitalize{text-transform:capitalize}
.pay-badge{display:inline-flex;padding:5px 9px;border-radius:20px;font-size:9px;font-weight:650}
.pay-badge.paid{background:var(--green-soft);color:var(--green)}
.pay-badge.unpaid{background:var(--bg-card-soft);color:var(--text-secondary)}

/* Calendar Input Group (matches EmployeePortalView.vue) */
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

/* View Dialog Dates Breakdown (matches EmployeePortalView.vue) */
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

.reason-section{padding:14px 0}
.reason-section span{color:var(--text-muted);font-size:10px}
.reason-section p{margin:8px 0 0;color:var(--text-primary);font-size:10px;line-height:1.6;overflow-wrap:anywhere}
.notice{display:flex;align-items:flex-start;gap:9px;padding:12px;border:1px solid var(--border);border-radius:8px}
.notice svg{flex-shrink:0}
.notice strong{display:block;font-size:10px}
.notice p{margin:4px 0 0;font-size:9px;line-height:1.6}
.notice.blocked{background:var(--red-soft);color:var(--red)}
.notice.ready{background:var(--green-soft);color:var(--green)}
.verification-note{margin:12px 0 0;color:var(--text-muted);font-size:9px;line-height:1.6}
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
