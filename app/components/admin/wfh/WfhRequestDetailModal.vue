<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Check,
  ClipboardList,
  X,
  CalendarDays,
  Clock,
  UserCheck,
  FileText,
  MessageSquare,
  History,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Hash,
  Ban,
} from 'lucide-vue-next'
import WfhModalShell from '~/components/admin/wfh/WfhModalShell.vue'
import WfhStatusPill from '~/components/admin/wfh/WfhStatusPill.vue'
import EmployeeLeaveDateCalendar from '~/components/employee/EmployeeLeaveDateCalendar.vue'
import { wfhErrorMessage } from '~/composables/admin/wfh/useWfhDocumentApi'
import { useWfhRequestApi, type WfhRequestRecord } from '~/composables/admin/wfh/useWfhRequestApi'
import { wfhDateText, wfhPeriodText } from '~/composables/admin/wfh/useWfhFormat'

type WfhRequestModalMode = 'view' | 'decide' | 'history'

const props = withDefaults(defineProps<{
  record: WfhRequestRecord
  initialMode?: WfhRequestModalMode
  initialAction?: 'approve' | 'reject'
}>(), {
  initialMode: 'view',
  initialAction: 'approve',
})

const emit = defineEmits<{
  close: []
  saved: [record: WfhRequestRecord, message: string]
  delete: [record: WfhRequestRecord]
}>()

const STATUS_LABELS: Record<string, string> = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' }

const api = useWfhRequestApi()
const mode = ref<WfhRequestModalMode>(props.initialMode)
const action = ref<'approve' | 'reject'>(props.initialAction)
const note = ref('')
const error = ref('')
const saving = ref(false)
const showCalendar = ref(false)
const showBreakdown = ref(true)

const title = computed(() => ({
  view: 'WFH Request Details',
  decide: action.value === 'approve' ? 'Approve WFH Request' : 'Reject WFH Request',
  history: 'Request History',
})[mode.value])

const subtitle = computed(() =>
  [props.record.employee.name, props.record.employee.department].filter(Boolean).join(' · '))

const initials = computed(() => {
  const parts = (props.record.employee.name || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'EM'
  return parts.slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('')
})

const daysLabel = computed(() => `${props.record.number_of_days} ${props.record.number_of_days === 1 ? 'day' : 'days'}`)

const excludedRestDays = computed(() => {
  const cal = props.record.calendar_days ?? 0
  return Math.max(0, cal - props.record.number_of_days)
})

const calendarStart = computed(() => props.record.start_date || '')
const calendarEnd = computed(() => props.record.end_date || '')

const history = computed(() => {
  const r = props.record
  const events = [{ when: r.request_date, action: 'Request filed', actor: r.employee.name, notes: r.reason }]
  if (r.status !== 'pending' && r.approved_at) {
    events.push({
      when: r.approved_at,
      action: r.status === 'approved' ? 'Request approved' : 'Request rejected',
      actor: r.approved_by ?? '—',
      notes: r.remarks ?? '',
    })
  }
  return events.reverse()
})

const startDecision = (next: 'approve' | 'reject') => {
  action.value = next
  note.value = ''
  error.value = ''
  mode.value = 'decide'
}

const submit = async () => {
  if (action.value === 'reject' && !note.value.trim()) {
    error.value = 'Enter the reason for rejecting this request.'
    return
  }
  saving.value = true
  error.value = ''
  try {
    const response = action.value === 'approve'
      ? await api.approve(props.record.id, note.value.trim())
      : await api.reject(props.record.id, note.value.trim())
    emit('saved', response.data, response.message)
  } catch (err) {
    error.value = wfhErrorMessage(err, 'Unable to save the decision.')
  } finally {
    saving.value = false
  }
}

const openDocuments = () => navigateTo('/admin/wfh/documents')
</script>

<template>
  <WfhModalShell
    :eyebrow="record.request_no"
    :title="title"
    :subtitle="subtitle"
    :busy="saving"
    @close="emit('close')"
  >
    <!-- VIEW -->
    <template v-if="mode === 'view'">
      <!-- Employee Profile Banner -->
      <div class="emp-banner">
        <div class="emp-banner-left">
          <div class="emp-avatar">{{ initials }}</div>
          <div class="emp-meta">
            <strong class="emp-name">{{ record.employee.name }}</strong>
            <div class="emp-sub">
              <span><Hash :size="11" /> {{ record.employee.emp_id }}</span>
              <span class="dot">·</span>
              <span><Briefcase :size="11" /> {{ record.employee.position || '—' }}</span>
              <template v-if="record.employee.department">
                <span class="dot">·</span>
                <span>{{ record.employee.department }}</span>
              </template>
            </div>
          </div>
        </div>
        <div class="emp-banner-right">
          <WfhStatusPill :status="record.status" :label="STATUS_LABELS[record.status] ?? record.status" />
          <button type="button" class="history-chip-btn" @click="mode = 'history'">
            <History :size="13" /> History
          </button>
        </div>
      </div>

      <!-- Summary Info Grid -->
      <div class="info-grid">
        <div class="info-card">
          <div class="info-card-label"><CalendarDays :size="13" /> <span>WFH Period</span></div>
          <strong>{{ wfhPeriodText(record.start_date, record.end_date) }}</strong>
        </div>

        <div class="info-card highlight-card">
          <div class="info-card-label"><Clock :size="13" /> <span>Scheduled WFH Days</span></div>
          <div class="days-row">
            <strong>{{ daysLabel }}</strong>
            <span v-if="excludedRestDays > 0" class="rest-excluded-tag">
              {{ excludedRestDays }} rest {{ excludedRestDays === 1 ? 'day' : 'days' }} off
            </span>
          </div>
        </div>

        <div class="info-card">
          <div class="info-card-label"><Clock :size="13" /> <span>Assigned Schedule</span></div>
          <strong>
            {{ record.schedule_name || record.schedule_code || 'Standard Schedule' }}
            <span v-if="record.schedule_code && record.schedule_name" class="code-tag">{{ record.schedule_code }}</span>
          </strong>
        </div>

        <div class="info-card">
          <div class="info-card-label"><UserCheck :size="13" /> <span>Supervisor</span></div>
          <strong>{{ record.supervisor_name }}</strong>
        </div>

        <div class="info-card">
          <div class="info-card-label"><CalendarDays :size="13" /> <span>Request Date</span></div>
          <strong>{{ wfhDateText(record.request_date) }}</strong>
        </div>

        <div class="info-card">
          <div class="info-card-label">
            <UserCheck :size="13" />
            <span>{{ record.status === 'rejected' ? 'Rejected By' : 'Approved By' }}</span>
          </div>
          <strong>
            {{ record.status === 'pending' ? 'Not yet decided' : record.approved_by || '—' }}
            <small v-if="record.approved_at" class="decided-date">on {{ wfhDateText(record.approved_at) }}</small>
          </strong>
        </div>
      </div>

      <!-- Daily Schedule Breakdown & Visual Calendar -->
      <div v-if="record.breakdown?.length" class="schedule-section">
        <div class="schedule-section-head">
          <div class="schedule-section-title">
            <Clock :size="14" />
            <span>Scheduled Days & Shift Breakdown</span>
          </div>
          <div class="schedule-section-toggles">
            <button type="button" class="toggle-pill-btn" @click="showCalendar = !showCalendar">
              <CalendarDays :size="12" />
              <span>{{ showCalendar ? 'Hide Calendar' : 'Calendar View' }}</span>
            </button>
            <button type="button" class="toggle-pill-btn" @click="showBreakdown = !showBreakdown">
              <span>{{ showBreakdown ? 'Hide Days' : 'Show Days' }}</span>
              <component :is="showBreakdown ? ChevronUp : ChevronDown" :size="13" />
            </button>
          </div>
        </div>

        <div v-if="showCalendar && calendarStart" class="readonly-calendar-wrap">
          <EmployeeLeaveDateCalendar
            :start="calendarStart"
            :end="calendarEnd"
            :active-dates="record.working_dates"
            :total-days="record.number_of_days"
            readonly
            hide-presets
          />
        </div>

        <div v-if="showBreakdown" class="breakdown-grid">
          <div
            v-for="item in record.breakdown"
            :key="item.date"
            class="breakdown-card"
            :class="item.is_working_day ? 'is-work' : 'is-rest'"
          >
            <span class="b-date">{{ item.date }}</span>
            <span class="b-day">{{ item.day_name }}</span>
            <span class="b-shift">
              <Clock v-if="item.is_working_day" :size="11" />
              {{ item.is_working_day ? (item.schedule_time || 'Regular Shift') : 'Rest day (Off)' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Reason Box -->
      <div class="detail-box">
        <div class="detail-box-head">
          <FileText :size="14" />
          <span>Reason for WFH</span>
        </div>
        <p class="detail-box-text">{{ record.reason }}</p>
      </div>

      <!-- HR Remarks Box -->
      <div v-if="record.remarks" class="detail-box remarks-box" :class="record.status">
        <div class="detail-box-head">
          <MessageSquare :size="14" />
          <span>HR / Admin Remarks</span>
        </div>
        <p class="detail-box-text">{{ record.remarks }}</p>
      </div>

      <div class="modal-actions">
        <button v-if="['pending', 'approved'].includes(record.status)" type="button" class="btn reject" @click="emit('delete', record)">
          <Ban :size="15" /> Cancel WFH
        </button>
        <template v-if="record.status === 'pending'">
          <button class="btn reject" @click="startDecision('reject')"><X :size="15" /> Reject</button>
          <button class="btn approve" @click="startDecision('approve')"><Check :size="15" /> Approve</button>
        </template>
        <button v-else-if="record.status === 'approved'" class="btn primary" @click="openDocuments">
          <ClipboardList :size="15" /> Open Document Review
        </button>
        <button v-else class="btn ghost" @click="emit('close')">Close</button>
      </div>
    </template>

    <!-- DECIDE -->
    <template v-else-if="mode === 'decide'">
      <div class="review-note">
        {{ action === 'approve' ? 'Approve' : 'Reject' }} the WFH request of <strong>{{ record.employee.name }}</strong>
        for <strong>{{ wfhPeriodText(record.start_date, record.end_date) }}</strong> ({{ daysLabel }}).
        <template v-if="action === 'approve'"> Once approved, the request appears in WFH Document Review for daily proof of work.</template>
      </div>

      <div class="detail-box">
        <div class="detail-box-head">
          <FileText :size="14" />
          <span>Reason for WFH</span>
        </div>
        <p class="detail-box-text">{{ record.reason }}</p>
      </div>

      <label for="req-note">HR remarks {{ action === 'reject' ? '(required)' : '(optional)' }}</label>
      <textarea
        id="req-note"
        v-model="note"
        rows="4"
        :placeholder="action === 'reject' ? 'Explain why the request is rejected...' : 'Optional note'"
      />
      <p v-if="error" class="error">{{ error }}</p>

      <div class="modal-actions">
        <button class="btn ghost" :disabled="saving" @click="mode = 'view'">Back</button>
        <button class="btn" :class="action === 'approve' ? 'approve' : 'reject'" :disabled="saving" @click="submit">
          {{ saving ? 'Saving...' : action === 'approve' ? 'Approve request' : 'Reject request' }}
        </button>
      </div>
    </template>

    <!-- HISTORY -->
    <template v-else>
      <div class="history-top">
        <button type="button" class="btn ghost btn-sm" @click="mode = 'view'">
          <ArrowLeft :size="14" /> Back to Details
        </button>
      </div>
      <div v-for="(h, i) in history" :key="i" class="timeline">
        <strong>{{ h.action }}</strong>
        <p>{{ wfhDateText(h.when) }} · {{ h.actor }}</p>
        <small v-if="h.notes">{{ h.notes }}</small>
      </div>
    </template>
  </WfhModalShell>
</template>

<style scoped>
.emp-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 14px 16px;
  margin-bottom: 16px;
  border-radius: 10px;
  border: 1px solid var(--border, #29364d);
  background: var(--bg-card-soft, #182438);
}

.emp-banner-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.emp-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(50, 123, 255, 0.16);
  border: 1px solid rgba(50, 123, 255, 0.35);
  color: var(--primary, #327bff);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  flex-shrink: 0;
}

.emp-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.emp-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary, #f8fafc);
}

.emp-sub {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  font-size: 11px;
  color: var(--text-secondary, #a2b0c6);
}

.emp-sub span {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.dot {
  opacity: 0.5;
}

.emp-banner-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.history-chip-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 7px;
  border: 1px solid var(--border, #29364d);
  background: var(--bg-card, #131e30);
  color: var(--text-secondary, #a2b0c6);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.history-chip-btn:hover {
  color: var(--text-primary, #f8fafc);
  border-color: var(--primary, #327bff);
}

.info-card-label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted, #7c8da8);
  font-size: 11px;
  font-weight: 500;
}

.highlight-card {
  border-color: rgba(16, 185, 129, 0.3) !important;
  background: rgba(16, 185, 129, 0.05) !important;
}

.days-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 5px;
}

.days-row strong {
  margin-top: 0 !important;
}

.rest-excluded-tag {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 5px;
  background: rgba(245, 158, 11, 0.14);
  color: #f59e0b;
}

.code-tag {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  margin-left: 4px;
  border-radius: 4px;
  background: var(--bg-card, #131e30);
  border: 1px solid var(--border, #29364d);
  color: var(--text-secondary, #a2b0c6);
}

.decided-date {
  display: inline !important;
  font-weight: 400;
  margin-left: 4px;
  color: var(--text-muted, #7c8da8);
}

/* Schedule Breakdown Section */
.schedule-section {
  margin-bottom: 16px;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid var(--border, #29364d);
  background: var(--bg-card-soft, #182438);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.schedule-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.schedule-section-title {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary, #f8fafc);
}

.schedule-section-toggles {
  display: flex;
  align-items: center;
  gap: 6px;
}

.toggle-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  border-radius: 6px;
  border: 1px solid var(--border, #29364d);
  background: var(--bg-card, #131e30);
  color: var(--text-secondary, #a2b0c6);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.toggle-pill-btn:hover {
  color: var(--text-primary, #f8fafc);
}

.readonly-calendar-wrap {
  margin-top: 2px;
}

.breakdown-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
  gap: 8px;
}

.breakdown-card {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--border, #29364d);
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 11px;
}

.breakdown-card.is-work {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.24);
}

.breakdown-card.is-rest {
  background: rgba(245, 158, 11, 0.08);
  border-color: rgba(245, 158, 11, 0.24);
}

.b-date {
  font-weight: 700;
  color: var(--text-primary, #f8fafc);
}

.b-day {
  font-size: 10px;
  color: var(--text-secondary, #a2b0c6);
}

.b-shift {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 600;
  margin-top: 2px;
}

.breakdown-card.is-work .b-shift {
  color: #10b981;
}

.breakdown-card.is-rest .b-shift {
  color: #f59e0b;
}

/* Detail Boxes */
.detail-box {
  padding: 13px 15px;
  border-radius: 10px;
  border: 1px solid var(--border, #29364d);
  background: var(--bg-card-soft, #182438);
  margin-bottom: 12px;
}

.detail-box-head {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary, #f8fafc);
  margin-bottom: 6px;
}

.detail-box-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-secondary, #a2b0c6);
  white-space: pre-wrap;
}

.remarks-box.rejected {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.06);
}

.remarks-box.approved {
  border-color: rgba(16, 185, 129, 0.35);
  background: rgba(16, 185, 129, 0.06);
}

.history-top {
  margin-bottom: 14px;
}

.btn-sm {
  min-height: 32px !important;
  padding: 0 10px !important;
  font-size: 11px !important;
}
</style>
