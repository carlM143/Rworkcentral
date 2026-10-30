
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import {
  MoreHorizontal,
  Eye,
  Pencil,
  History,
  UserRound,
  X,
  Clock3,
  Send,
  LoaderCircle,
} from 'lucide-vue-next'
import type { TimeLogRecord } from '~/types/timekeeping'

const props = defineProps<{
  log: TimeLogRecord
}>()

const { $api } = useNuxtApp()

type ModalName = 'view' | 'correction' | 'history' | 'employee' | null

interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

interface Correction {
  id: number
  status: string
  correction_type: string
  priority: string
  reason: string
  review_remarks: string | null
  created_at: string
  reviewed_at: string | null
  requested_time_in: string | null
  requested_time_out: string | null
  requested_break_out: string | null
  requested_break_in: string | null
}

interface EmployeeDetail {
  id: number
  emp_id?: string
  firstname?: string
  middlename?: string | null
  lastname?: string
  birthday?: string
  gender?: string
  civil_status?: string
  status?: boolean | number
}

interface TimeLogDetail {
  id: number
  employee_name: string
  employee_number: string
  department: string
  work_date: string
  schedule: string
  time_in: string | null
  time_out: string | null
  break_out: string | null
  break_in: string | null
  late_minutes: number
  undertime_minutes: number
  worked_hours: number | null
  status: string
  source: string | null
  remarks: string | null
}

const open = ref(false)
const modal = ref<ModalName>(null)
const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const success = ref('')

const detail = ref<TimeLogDetail | null>(null)
const historyRecords = ref<Correction[]>([])
const employeeDetail = ref<EmployeeDetail | null>(null)

const attachment = ref<File | null>(null)

const form = ref({
  correction_type: 'time_in_out',
  priority: 'normal',
  requested_time_in: '',
  requested_time_out: '',
  requested_break_out: '',
  requested_break_in: '',
  reason: '',
})

const timeTo24 = (value?: string | null): string => {
  if (!value) return ''

  const match = value.match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i,
  )

  if (!match) {
    return /^\d{2}:\d{2}$/.test(value)
      ? value
      : ''
  }

  let hour = Number(match[1])
  const minute = match[2]
  const period = match[3]?.toUpperCase()

  if (period === 'PM' && hour < 12) hour += 12
  if (period === 'AM' && hour === 12) hour = 0

  return `${String(hour).padStart(2, '0')}:${minute}`
}

const formatDateTime = (value?: string | null) => {
  if (!value) return '—'

  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString('en-PH', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
}

const formatRequestTime = (value?: string | null) => {
  if (!value) return '—'
  return value.slice(11, 16) || value
}

const triggerRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)

const dropdownStyle = ref({
  top: '0px',
  left: '0px',
})

const closeMenu = () => {
  open.value = false
}

const updateDropdownPosition = () => {
  if (!triggerRef.value) return

  const rect = triggerRef.value.getBoundingClientRect()

  const menuWidth = 195
  const menuHeight = dropdownRef.value?.offsetHeight ?? 190
  const gap = 5

  const left = Math.max(
    8,
    Math.min(
      rect.right - menuWidth,
      window.innerWidth - menuWidth - 8,
    ),
  )

  const spaceBelow = window.innerHeight - rect.bottom

  const top =
    spaceBelow >= menuHeight + gap
      ? rect.bottom + gap
      : Math.max(8, rect.top - menuHeight - gap)

  dropdownStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  }
}

const toggleMenu = async () => {
  if (open.value) {
    closeMenu()
    return
  }

  updateDropdownPosition()
  open.value = true

  await nextTick()
  updateDropdownPosition()
}

const onDocumentClick = (event: MouseEvent) => {
  const target = event.target

  if (!(target instanceof Node)) return

  if (triggerRef.value?.contains(target)) return
  if (dropdownRef.value?.contains(target)) return

  closeMenu()
}

const closeOnScroll = () => {
  if (open.value) {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  window.addEventListener('scroll', closeOnScroll, true)
  window.addEventListener('resize', closeOnScroll)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  window.removeEventListener('scroll', closeOnScroll, true)
  window.removeEventListener('resize', closeOnScroll)
})

const closeModal = () => {
  if (submitting.value) return

  modal.value = null
  error.value = ''
  success.value = ''
}

const openModal = async (name: ModalName) => {
  closeMenu()

  modal.value = name
  error.value = ''
  success.value = ''
  detail.value = null
  employeeDetail.value = null
  historyRecords.value = []
  attachment.value = null

  form.value = {
    correction_type: 'time_in_out',
    priority: 'normal',
    requested_time_in: timeTo24(props.log.timeIn),
    requested_time_out: timeTo24(props.log.timeOut),
    requested_break_out: timeTo24(props.log.breakOut),
    requested_break_in: timeTo24(props.log.breakIn),
    reason: '',
  }

  loading.value = true

  try {
    if (name === 'view' || name === 'correction') {
      const response = await $api<ApiResponse<TimeLogDetail>>(
        `/admin/time-logs/${props.log.id}`,
      )

      detail.value = response.data
    }

    if (name === 'history' || name === 'correction') {
      const response = await $api<ApiResponse<Correction[]>>(
        `/admin/time-logs/${props.log.id}/correction-history`,
      )

      historyRecords.value = response.data ?? []
    }

    if (name === 'employee') {
      const response = await $api<ApiResponse<EmployeeDetail>>(
        `/admin/employees/${props.log.employeeId}`,
      )

      employeeDetail.value = response.data
    }
  } catch (err: any) {
    error.value =
      err?.data?.message ||
      err?.message ||
      'Unable to load information.'
  } finally {
    loading.value = false
  }
}

const hasPending = () =>
  historyRecords.value.some(
    item => item.status === 'pending',
  )

const handleFile = (event: Event) => {
  const input = event.target as HTMLInputElement
  attachment.value = input.files?.[0] ?? null
}

const submitCorrection = async () => {
  if (submitting.value || hasPending()) return

  submitting.value = true
  error.value = ''
  success.value = ''

  try {
    const payload = new FormData()

    payload.append('time_log_id', String(props.log.id))
    payload.append('correction_type', form.value.correction_type)
    payload.append('priority', form.value.priority)
    payload.append('reason', form.value.reason)

    const fields = [
      'requested_time_in',
      'requested_time_out',
      'requested_break_out',
      'requested_break_in',
    ] as const

    for (const field of fields) {
      if (form.value[field]) {
        payload.append(field, form.value[field])
      }
    }

    if (attachment.value) {
      payload.append('attachment', attachment.value)
    }

    await $api('/admin/time-log-corrections', {
      method: 'POST',
      body: payload,
    })

    success.value =
      'Correction request submitted successfully. Status: Pending.'

    const response = await $api<ApiResponse<Correction[]>>(
      `/admin/time-logs/${props.log.id}/correction-history`,
    )

    historyRecords.value = response.data ?? []
  } catch (err: any) {
    const validationErrors = err?.data?.errors

    error.value = validationErrors
      ? Object.values(validationErrors)
          .flat()
          .join(' ')
      : err?.data?.message ||
        err?.message ||
        'Unable to submit correction.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div
    class="time-log-actions"
    :class="`time-log-action-${log.id}`"
  >
    <button
      ref="triggerRef"
      type="button"
      class="action-trigger"
      :aria-expanded="open"
      aria-haspopup="menu"
      aria-label="Time log actions"
      @click.stop="toggleMenu"
    >
      <MoreHorizontal :size="17" />
    </button>

  <Teleport to="body">
    <div
      v-if="open"
      ref="dropdownRef"
      class="action-dropdown"
      :style="dropdownStyle"
      @click.stop
    >
      <button @click="openModal('view')">
        <Eye :size="15" />
        View Time Log
      </button>

      <button
        class="correction-action"
        @click="openModal('correction')"
      >
        <Pencil :size="15" />
        Request Correction
      </button>

      <button @click="openModal('history')">
        <History :size="15" />
        Correction History
      </button>

      <div class="dropdown-divider" />

      <button @click="openModal('employee')">
        <UserRound :size="15" />
        View Employee
      </button>
    </div>
  </Teleport>

  <!-- KEEP THE EXISTING MODAL TELEPORT HERE -->

    <Teleport to="body">
      <div
        v-if="modal"
        class="time-log-action-overlay"
        @click.self="closeModal"
      >
        <div class="time-log-action-modal">
          <div class="action-modal-header">
            <div>
              <h3>
                {{
                  modal === 'view'
                    ? 'View Time Log'
                    : modal === 'correction'
                      ? 'Request Time Log Correction'
                      : modal === 'history'
                        ? 'Correction History'
                        : 'Employee Details'
                }}
              </h3>

              <p>
                {{ log.employeeName }} · {{ log.employeeNumber }}
              </p>
            </div>

            <button class="close-modal" @click="closeModal">
              <X :size="18" />
            </button>
          </div>

          <div class="action-modal-content">
            <div v-if="loading" class="modal-loading">
              <LoaderCircle :size="20" class="spin" />
              Loading information...
            </div>

            <div v-if="error" class="modal-error">
              {{ error }}
            </div>

            <div v-if="success" class="modal-success">
              {{ success }}
            </div>

            <template v-if="!loading && detail && modal === 'view'">
              <div class="details-grid">
                <div>
                  <span>Employee</span>
                  <strong>{{ detail.employee_name }}</strong>
                </div>
                <div>
                  <span>Employee ID</span>
                  <strong>{{ detail.employee_number }}</strong>
                </div>
                <div>
                  <span>Department</span>
                  <strong>{{ detail.department }}</strong>
                </div>
                <div>
                  <span>Work Date</span>
                  <strong>{{ detail.work_date }}</strong>
                </div>
                <div>
                  <span>Schedule</span>
                  <strong>{{ detail.schedule }}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>{{ detail.status }}</strong>
                </div>
                <div>
                  <span>Time In</span>
                  <strong>{{ detail.time_in || '—' }}</strong>
                </div>
                <div>
                  <span>Time Out</span>
                  <strong>{{ detail.time_out || '—' }}</strong>
                </div>
                <div>
                  <span>Break Out</span>
                  <strong>{{ detail.break_out || '—' }}</strong>
                </div>
                <div>
                  <span>Break In</span>
                  <strong>{{ detail.break_in || '—' }}</strong>
                </div>
                <div>
                  <span>Late</span>
                  <strong>{{ detail.late_minutes }} min</strong>
                </div>
                <div>
                  <span>Undertime</span>
                  <strong>{{ detail.undertime_minutes }} min</strong>
                </div>
                <div>
                  <span>Hours Worked</span>
                  <strong>
                    {{ detail.worked_hours === null
                      ? '—'
                      : `${Number(detail.worked_hours).toFixed(2)} hrs` }}
                  </strong>
                </div>
                <div>
                  <span>Source</span>
                  <strong>{{ detail.source || '—' }}</strong>
                </div>
                <div class="full">
                  <span>Remarks</span>
                  <strong>{{ detail.remarks || 'No remarks' }}</strong>
                </div>
              </div>
            </template>

            <template v-if="!loading && modal === 'correction' && detail">
              <div class="current-record">
                <Clock3 :size="17" />
                <div>
                  <strong>Current Attendance</strong>
                  <p>
                    {{ detail.work_date }} ·
                    {{ detail.time_in || '—' }} –
                    {{ detail.time_out || '—' }}
                  </p>
                </div>
              </div>

              <div v-if="hasPending()" class="pending-message">
                This time log already has a Pending correction request.
                Review that request before submitting another one.
              </div>

              <form v-else class="correction-form" @submit.prevent="submitCorrection">
                <label>
                  <span>Correction Type</span>
                  <select v-model="form.correction_type" required>
                    <option value="time_in_out">Time In &amp; Out</option>
                    <option value="time_in">Time In Only</option>
                    <option value="time_out">Time Out Only</option>
                    <option value="break_times">Break Times</option>
                  </select>
                </label>

                <div class="form-grid">
                  <label
                    v-if="['time_in', 'time_in_out'].includes(form.correction_type)"
                  >
                    <span>Requested Time In</span>
                    <input
                      v-model="form.requested_time_in"
                      type="time"
                      required
                    />
                  </label>

                  <label
                    v-if="['time_out', 'time_in_out'].includes(form.correction_type)"
                  >
                    <span>Requested Time Out</span>
                    <input
                      v-model="form.requested_time_out"
                      type="time"
                      required
                    />
                  </label>

                  <label v-if="form.correction_type === 'break_times'">
                    <span>Requested Break Out</span>
                    <input
                      v-model="form.requested_break_out"
                      type="time"
                      required
                    />
                  </label>

                  <label v-if="form.correction_type === 'break_times'">
                    <span>Requested Break In</span>
                    <input
                      v-model="form.requested_break_in"
                      type="time"
                      required
                    />
                  </label>
                </div>

                <label>
                  <span>Priority</span>
                  <select v-model="form.priority" required>
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </label>

                <label>
                  <span>Reason for Correction</span>
                  <textarea
                    v-model="form.reason"
                    rows="4"
                    required
                    minlength="10"
                    maxlength="2000"
                    placeholder="Explain why the attendance record needs correction..."
                  />
                </label>

                <label>
                  <span>Supporting Attachment (Optional)</span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    @change="handleFile"
                  />
                  <small>JPG, PNG or PDF · Maximum 5 MB</small>
                </label>

                <div class="correction-notice">
                  Submitting does not immediately change attendance.
                  An authorized reviewer must approve this request.
                </div>

                <div class="form-footer">
                  <button
                    class="submit-correction"
                    type="submit"
                    :disabled="submitting"
                  >
                    <LoaderCircle
                      v-if="submitting"
                      :size="15"
                      class="spin"
                    />
                    <Send v-else :size="15" />

                    {{ submitting ? 'Submitting...' : 'Submit Request' }}
                  </button>
                </div>
              </form>
            </template>

            <template v-if="!loading && modal === 'history'">
              <div v-if="!historyRecords.length" class="empty-history">
                No correction requests found for this time log.
              </div>

              <div
                v-for="item in historyRecords"
                :key="item.id"
                class="history-item"
              >
                <div class="history-heading">
                  <strong>Request #{{ item.id }}</strong>
                  <span :class="['history-badge', item.status]">
                    {{ item.status }}
                  </span>
                </div>

                <p>{{ item.reason }}</p>

                <div class="history-meta">
                  <span>Type: {{ item.correction_type }}</span>
                  <span>Priority: {{ item.priority }}</span>
                  <span>Submitted: {{ formatDateTime(item.created_at) }}</span>
                  <span>
                    Proposed In: {{ formatRequestTime(item.requested_time_in) }}
                  </span>
                  <span>
                    Proposed Out: {{ formatRequestTime(item.requested_time_out) }}
                  </span>
                </div>

                <p v-if="item.review_remarks">
                  Reviewer remarks: {{ item.review_remarks }}
                </p>
              </div>
            </template>

            <template v-if="!loading && modal === 'employee' && employeeDetail">
              <div class="details-grid">
                <div>
                  <span>Employee Number</span>
                  <strong>{{ employeeDetail.emp_id || log.employeeNumber }}</strong>
                </div>

                <div>
                  <span>Full Name</span>
                  <strong>
                    {{ [
                      employeeDetail.firstname,
                      employeeDetail.middlename,
                      employeeDetail.lastname,
                    ].filter(Boolean).join(' ') }}
                  </strong>
                </div>

                <div>
                  <span>Department</span>
                  <strong>{{ log.department }}</strong>
                </div>

                <div>
                  <span>Gender</span>
                  <strong>{{ employeeDetail.gender || '—' }}</strong>
                </div>

                <div>
                  <span>Birthday</span>
                  <strong>{{ employeeDetail.birthday || '—' }}</strong>
                </div>

                <div>
                  <span>Civil Status</span>
                  <strong>{{ employeeDetail.civil_status || '—' }}</strong>
                </div>
              </div>
            </template>
          </div>

          <div class="action-modal-footer">
            <button @click="closeModal">Close</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.time-log-actions {
  position: relative;
}

.action-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.action-trigger:hover {
  border-color: var(--border);
  color: var(--primary);
}

.action-dropdown {
  position: fixed;
  z-index: 100000;
  width: 195px;
  padding: 6px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.25);
}

.action-dropdown button {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 10px;
  text-align: left;
  cursor: pointer;
}

.action-dropdown button:hover {
  background: var(--primary-soft);
  color: var(--primary);
}

.action-dropdown .correction-action {
  color: var(--primary);
}

.dropdown-divider {
  height: 1px;
  margin: 5px 0;
  background: var(--border);
}

.time-log-action-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(3, 11, 28, .7);
  backdrop-filter: blur(6px);
}

.time-log-action-modal {
  width: min(680px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  color: var(--text-primary);
  box-shadow: 0 25px 65px rgba(0, 0, 0, .3);
}

.action-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 17px;
  border-bottom: 1px solid var(--border);
}

.action-modal-header h3 {
  margin: 0;
  font-size: 15px;
}

.action-modal-header p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.close-modal {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.action-modal-content {
  padding: 17px;
}

.details-grid,
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.details-grid > div {
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
}

.details-grid .full {
  grid-column: 1 / -1;
}

.details-grid span,
.details-grid strong {
  display: block;
}

.details-grid span {
  color: var(--text-muted);
  font-size: 9px;
}

.details-grid strong {
  margin-top: 5px;
  font-size: 11px;
  overflow-wrap: anywhere;
}

.current-record {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
}

.current-record strong {
  font-size: 11px;
}

.current-record p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.correction-form {
  display: flex;
  flex-direction: column;
  gap: 13px;
  margin-top: 15px;
}

.correction-form label {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.correction-form label span {
  font-size: 10px;
  font-weight: 650;
}

.correction-form input,
.correction-form select,
.correction-form textarea {
  width: 100%;
  min-height: 38px;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font-size: 11px;
  outline: 0;
}

.correction-form input:focus,
.correction-form select:focus,
.correction-form textarea:focus {
  border-color: var(--primary);
}

.correction-form small {
  color: var(--text-muted);
  font-size: 9px;
}

.correction-notice,
.pending-message {
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--primary-soft);
  color: var(--text-secondary);
  font-size: 10px;
  line-height: 1.6;
}

.pending-message {
  margin-top: 12px;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
}

.submit-correction {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  border: 0;
  border-radius: 7px;
  background: var(--primary);
  color: white;
  font-size: 11px;
  cursor: pointer;
}

.submit-correction:disabled {
  opacity: .5;
}

.action-modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 13px 17px;
  border-top: 1px solid var(--border);
}

.action-modal-footer button {
  padding: 9px 15px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font-size: 10px;
  cursor: pointer;
}

.history-item {
  margin-bottom: 10px;
  padding: 13px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
}

.history-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.history-heading strong {
  font-size: 12px;
}

.history-item p {
  color: var(--text-secondary);
  font-size: 11px;
  line-height: 1.6;
}

.history-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 15px;
  color: var(--text-muted);
  font-size: 10px;
}

.history-badge {
  padding: 5px 8px;
  border-radius: 20px;
  background: var(--orange-soft);
  color: var(--orange);
  font-size: 9px;
  text-transform: capitalize;
}

.history-badge.approved {
  background: var(--green-soft);
  color: var(--green);
}

.history-badge.rejected {
  background: var(--red-soft);
  color: var(--red);
}

.modal-loading,
.empty-history {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 100px;
  color: var(--text-muted);
  font-size: 11px;
}

.modal-error,
.modal-success {
  margin-bottom: 12px;
  padding: 11px;
  border-radius: 7px;
  font-size: 11px;
}

.modal-error {
  background: var(--red-soft);
  color: var(--red);
}

.modal-success {
  background: var(--green-soft);
  color: var(--green);
}

.spin {
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  to { transform: rotate(360deg); }
}

@media (max-width: 600px) {
  .details-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .details-grid .full {
    grid-column: auto;
  }
}
</style>
