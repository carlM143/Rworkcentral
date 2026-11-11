<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import {
  AlertTriangle,
  Ban,
  CalendarDays,
  FileText,
  Info,
  Paperclip,
  Trash2,
  User,
  X,
} from 'lucide-vue-next'
import { wfhPeriodText } from '~/composables/admin/wfh/useWfhFormat'
import type { WfhDocumentRecord } from '~/composables/admin/wfh/useWfhDocumentApi'
import type { WfhRequestRecord } from '~/composables/admin/wfh/useWfhRequestApi'

type AnyWfhRecord = WfhDocumentRecord | WfhRequestRecord

const props = withDefaults(defineProps<{
  record: AnyWfhRecord
  busy?: boolean
  errorMessage?: string
  mode?: 'delete' | 'cancel'
}>(), {
  busy: false,
  errorMessage: '',
  mode: 'delete',
})

const emit = defineEmits<{
  close: []
  confirm: [id: number]
}>()

const isCancel = computed(() => props.mode === 'cancel')

const attachmentsCount = computed(() => props.record?.counts?.attachments ?? 0)
const submittedDaysCount = computed(() => props.record?.counts?.submitted ?? 0)
const acceptedDaysCount = computed(() => props.record?.counts?.accepted ?? 0)
const timeLogsCount = computed(() => props.record?.counts?.time_logs ?? 0)

const hasData = computed(() => {
  if (props.record?.has_data !== undefined) return Boolean(props.record.has_data)
  return (
    attachmentsCount.value > 0 ||
    submittedDaysCount.value > 0 ||
    acceptedDaysCount.value > 0 ||
    timeLogsCount.value > 0
  )
})

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && !props.busy) {
    emit('close')
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <Teleport to="body">
    <div class="wfh-delete-overlay" @click.self="!busy && emit('close')">
      <div
        class="wfh-delete-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wfh-delete-title"
      >
        <!-- Modal Header -->
        <header class="wfh-delete-head">
          <div class="head-icon-shell" :class="{ 'has-data': hasData, 'is-cancel': isCancel && !hasData }">
            <AlertTriangle v-if="hasData" :size="20" />
            <Ban v-else-if="isCancel" :size="20" />
            <Trash2 v-else :size="20" />
          </div>
          <div class="head-copy">
            <p class="head-eyebrow">{{ isCancel ? 'CONFIRM CANCELLATION' : 'CONFIRM DELETION' }}</p>
            <h2 id="wfh-delete-title">{{ isCancel ? 'Cancel WFH Request' : 'Delete WFH Request' }}</h2>
          </div>
          <button
            type="button"
            class="close-btn"
            aria-label="Close"
            :disabled="busy"
            @click="emit('close')"
          >
            <X :size="18" />
          </button>
        </header>

        <!-- Body -->
        <div class="wfh-delete-body">
          <!-- Request summary card -->
          <div class="target-card">
            <div class="target-row">
              <span class="target-label"><FileText :size="13" /> Request No.</span>
              <strong class="target-val accent">{{ record.request_no }}</strong>
            </div>
            <div class="target-row">
              <span class="target-label"><User :size="13" /> Employee</span>
              <strong class="target-val">
                {{ record.employee.name }}
                <small v-if="record.employee.emp_id" class="emp-badge">
                  #{{ record.employee.emp_id }}
                </small>
              </strong>
            </div>
            <div class="target-row">
              <span class="target-label"><CalendarDays :size="13" /> WFH Period</span>
              <span class="target-val">
                {{ wfhPeriodText(record.start_date, record.end_date) }}
                ({{ record.number_of_days }} {{ record.number_of_days === 1 ? 'day' : 'days' }})
              </span>
            </div>
          </div>

          <!-- Notification / Warning banner if data exists -->
          <div v-if="hasData" class="data-warning-banner" role="alert">
            <div class="warning-title">
              <AlertTriangle :size="16" />
              <strong>Warning: This WFH request already contains data!</strong>
            </div>
            <p class="warning-subtitle">
              The following files and records have already been submitted under this request:
            </p>

            <ul class="data-breakdown-list">
              <li v-if="attachmentsCount > 0">
                <Paperclip :size="14" />
                <span>
                  <strong>{{ attachmentsCount }}</strong>
                  uploaded Proof of Work {{ attachmentsCount === 1 ? 'attachment' : 'attachments' }} (images/documents)
                </span>
              </li>

              <li v-if="acceptedDaysCount > 0">
                <CalendarDays :size="14" />
                <span>
                  <strong>{{ acceptedDaysCount }}</strong>
                  {{ acceptedDaysCount === 1 ? 'day has' : 'days have' }} already been verified as complete attendance
                </span>
              </li>

              <li v-if="submittedDaysCount > 0 && acceptedDaysCount === 0">
                <CalendarDays :size="14" />
                <span>
                  <strong>{{ submittedDaysCount }}</strong>
                  {{ submittedDaysCount === 1 ? 'day is' : 'days are' }} submitted and awaiting admin verification
                </span>
              </li>

              <li v-if="timeLogsCount > 0">
                <FileText :size="14" />
                <span>
                  <strong>{{ timeLogsCount }}</strong>
                  timekeeping attendance log(s) recorded in the database
                </span>
              </li>
            </ul>

            <div class="consequence-note">
              <template v-if="isCancel">
                Cancelling this request will revoke the WFH schedule. The request and existing proof and attendance records will be retained for history; existing attendance is not automatically reversed.
              </template>
              <template v-else>
                Deleting this request will permanently remove the WFH schedule, all uploaded Proof of Work attachments, and any attendance records created from this request.
              </template>
            </div>
          </div>

          <!-- Notice if no data exists -->
          <div v-else class="clean-info-banner">
            <Info :size="16" />
            <span>
              This request has no submitted Proof of Work attachments or verified attendance logs.
            </span>
          </div>

          <!-- Final confirmation prompt -->
          <p class="confirm-prompt">
            <template v-if="isCancel">
              Are you sure you want to cancel the WFH request
              <strong>{{ record.request_no }}</strong>?
            </template>
            <template v-else>
              Are you sure you want to delete the WFH request
              <strong>{{ record.request_no }}</strong>? This action cannot be undone.
            </template>
          </p>

          <p v-if="errorMessage" class="error-banner" role="alert">
            {{ errorMessage }}
          </p>
        </div>

        <!-- Footer actions -->
        <footer class="wfh-delete-foot">
          <button
            type="button"
            class="btn-cancel"
            :disabled="busy"
            @click="emit('close')"
          >
            Cancel
          </button>
          <button
            type="button"
            class="btn-delete"
            :class="{ 'btn-cancel-action': isCancel }"
            :disabled="busy"
            @click="emit('confirm', record.id)"
          >
            <component :is="isCancel ? Ban : Trash2" :size="15" />
            <span>{{ busy ? (isCancel ? 'Cancelling…' : 'Deleting…') : (isCancel ? 'Yes, Cancel WFH' : 'Yes, Delete Request') }}</span>
          </button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.wfh-delete-overlay {
  position: fixed;
  inset: 0;
  z-index: 16000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(3, 10, 24, 0.78);
  backdrop-filter: blur(4px);
}

.wfh-delete-modal {
  width: min(540px, 96vw);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border, #29364d);
  border-radius: 14px;
  background: var(--bg-card, #131e30);
  color: var(--text-primary, #f8fafc);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.55);
}

.wfh-delete-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--border, #29364d);
}

.head-icon-shell {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 9px;
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  flex-shrink: 0;
}

.head-icon-shell.has-data {
  background: rgba(245, 158, 11, 0.14);
  color: #f59e0b;
}

.head-icon-shell.is-cancel {
  background: rgba(249, 115, 22, 0.14);
  color: #f97316;
}

.head-copy {
  flex: 1;
  min-width: 0;
}

.head-eyebrow {
  margin: 0 0 2px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.8px;
  color: var(--text-muted, #7c8da8);
}

.wfh-delete-head h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary, #f8fafc);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-muted, #7c8da8);
  cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease;
}

.close-btn:hover:not(:disabled) {
  background: var(--bg-card-soft, #182438);
  color: var(--text-primary, #f8fafc);
}

.wfh-delete-body {
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.target-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  border: 1px solid var(--border, #29364d);
  border-radius: 9px;
  background: var(--bg-card-soft, #182438);
  font-size: 12.5px;
}

.target-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.target-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted, #7c8da8);
  font-size: 11.5px;
}

.target-val {
  color: var(--text-primary, #f8fafc);
  font-weight: 600;
}

.target-val.accent {
  color: var(--primary, #327bff);
  font-family: monospace;
}

.emp-badge {
  display: inline-block;
  margin-left: 6px;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--border, #29364d);
  font-size: 10.5px;
  font-weight: 600;
  color: var(--text-secondary, #a2b0c6);
}

/* Warning banner when data exists */
.data-warning-banner {
  padding: 14px;
  border: 1px solid rgba(245, 158, 11, 0.35);
  border-radius: 10px;
  background: rgba(245, 158, 11, 0.08);
  color: var(--text-primary, #f8fafc);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.warning-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fbbf24;
  font-size: 13px;
}

.warning-subtitle {
  margin: 0;
  font-size: 12px;
  color: var(--text-secondary, #a2b0c6);
}

.data-breakdown-list {
  margin: 4px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.data-breakdown-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #fde68a;
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(245, 158, 11, 0.12);
}

.data-breakdown-list li strong {
  color: #ffffff;
}

.consequence-note {
  margin-top: 4px;
  font-size: 11.5px;
  line-height: 1.45;
  color: #fca5a5;
  padding-top: 8px;
  border-top: 1px dashed rgba(245, 158, 11, 0.3);
}

/* Clean info banner when no data exists */
.clean-info-banner {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 11px 14px;
  border: 1px solid var(--border, #29364d);
  border-radius: 9px;
  background: var(--bg-card-soft, #182438);
  color: var(--text-secondary, #a2b0c6);
  font-size: 12px;
}

.confirm-prompt {
  margin: 2px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-primary, #f8fafc);
}

.error-banner {
  margin: 0;
  padding: 10px 12px;
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  font-size: 12px;
}

.wfh-delete-foot {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid var(--border, #29364d);
  background: var(--bg-card, #131e30);
}

.btn-cancel {
  padding: 9px 16px;
  border: 1px solid var(--border, #29364d);
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary, #a2b0c6);
  font: inherit;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-cancel:hover:not(:disabled) {
  background: var(--bg-card-soft, #182438);
  color: var(--text-primary, #f8fafc);
}

.btn-delete {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  border: 1px solid #dc2626;
  border-radius: 8px;
  background: #dc2626;
  color: #ffffff;
  font: inherit;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(220, 38, 38, 0.3);
  transition: all 0.15s ease;
}

.btn-delete:hover:not(:disabled) {
  background: #b91c1c;
  border-color: #b91c1c;
}

.btn-delete.btn-cancel-action {
  border-color: #ea580c;
  background: #ea580c;
  box-shadow: 0 4px 14px rgba(234, 88, 12, 0.3);
}

.btn-delete.btn-cancel-action:hover:not(:disabled) {
  background: #c2410c;
  border-color: #c2410c;
}

.btn-delete:disabled,
.btn-cancel:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
