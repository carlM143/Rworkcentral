
<script setup lang="ts">
import {
  X,
  House,
  UserRound,
  CalendarDays,
  MapPin,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock3,
} from 'lucide-vue-next'

import type {
  WfhApproval,
} from '~/types/wfhApproval'

type ModalMode = 'view' | 'review' | 'approve' | 'reject'

const props = defineProps<{
  open: boolean
  request: WfhApproval | null
  mode: ModalMode
}>()

const emit = defineEmits<{
  close: []
  approve: [request: WfhApproval, remarks: string]
  reject: [request: WfhApproval, remarks: string]
}>()

const remarks = ref('')
const decision = ref<'approve' | 'reject'>('approve')
const errorMessage = ref('')

const canProcess = computed(() => {
  return !!props.request &&
    ['Pending', 'For Review'].includes(props.request.status)
})

const modalTitle = computed(() => {
  const titles: Record<ModalMode, string> = {
    view: 'WFH Request Details',
    review: 'Review WFH Request',
    approve: 'Approve WFH Request',
    reject: 'Reject WFH Request',
  }

  return titles[props.mode]
})

const effectiveDecision = computed(() => {
  return props.mode === 'review'
    ? decision.value
    : props.mode === 'reject'
      ? 'reject'
      : 'approve'
})

const formatDate = (value?: string) => {
  if (!value) return '—'

  const parsed = new Date(
    value.includes('T') ? value : `${value}T00:00:00`,
  )

  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
}

watch(
  () => [props.open, props.request?.id, props.mode],
  () => {
    remarks.value = ''
    decision.value = 'approve'
    errorMessage.value = ''
  },
)

const close = () => {
  emit('close')
}

const submit = () => {
  if (!props.request || !canProcess.value) return

  if (
    effectiveDecision.value === 'reject' &&
    !remarks.value.trim()
  ) {
    errorMessage.value = 'Rejection reason is required.'
    return
  }

  errorMessage.value = ''

  if (effectiveDecision.value === 'approve') {
    emit('approve', props.request, remarks.value.trim())
  } else {
    emit('reject', props.request, remarks.value.trim())
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.open) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open && request"
      class="wfh-modal-overlay"
      @click.self="close"
    >
      <section
        class="wfh-modal"
        role="dialog"
        aria-modal="true"
        :aria-label="modalTitle"
      >
        <header class="modal-header">
          <div class="modal-heading">
            <span class="heading-icon">
              <House :size="19" />
            </span>

            <div>
              <h2>{{ modalTitle }}</h2>
              <p>{{ request.requestNumber }}</p>
            </div>
          </div>

          <button
            type="button"
            class="close-button"
            aria-label="Close"
            @click="close"
          >
            <X :size="18" />
          </button>
        </header>

        <div class="modal-body">
          <div class="employee-summary">
            <span class="employee-avatar">
              <UserRound :size="21" />
            </span>

            <div class="employee-info">
              <strong>{{ request.employeeName }}</strong>
              <span>
                {{ request.employeeNumber }} · {{ request.position }}
              </span>
              <small>{{ request.department }}</small>
            </div>

            <span class="status-pill">
              {{ request.status }}
            </span>
          </div>

          <section class="detail-section">
            <h3>
              <CalendarDays :size="15" />
              WFH Schedule
            </h3>

            <div class="details-grid">
              <div class="detail-item">
                <label>Request Type</label>
                <strong>{{ request.requestType }}</strong>
              </div>

              <div class="detail-item">
                <label>Total WFH Days</label>
                <strong>{{ request.totalDays }}</strong>
              </div>

              <div class="detail-item">
                <label>Start Date</label>
                <strong>{{ formatDate(request.startDate) }}</strong>
              </div>

              <div class="detail-item">
                <label>End Date</label>
                <strong>{{ formatDate(request.endDate) }}</strong>
              </div>

              <div class="detail-item">
                <label>Work Location</label>
                <strong>
                  <MapPin :size="12" />
                  {{ request.workLocation }}
                </strong>
              </div>

              <div class="detail-item">
                <label>Immediate Supervisor</label>
                <strong>{{ request.immediateSupervisor }}</strong>
              </div>
            </div>
          </section>

          <section class="detail-section">
            <h3>
              <ClipboardCheck :size="15" />
              Request Information
            </h3>

            <div class="description-block">
              <label>Reason for WFH</label>
              <p>{{ request.reason }}</p>
            </div>

            <div class="description-block">
              <label>Proposed Work Plan</label>
              <p>{{ request.workPlan }}</p>
            </div>
          </section>

          <section class="detail-section">
            <h3>
              <Clock3 :size="15" />
              Review Information
            </h3>

            <div class="details-grid">
              <div class="detail-item">
                <label>Filed Date</label>
                <strong>{{ formatDate(request.filedAt) }}</strong>
              </div>

              <div class="detail-item">
                <label>Reviewed By</label>
                <strong>{{ request.reviewedBy || 'Not yet reviewed' }}</strong>
              </div>

              <div class="detail-item">
                <label>Reviewed Date</label>
                <strong>{{ formatDate(request.reviewedAt) }}</strong>
              </div>
            </div>

            <div
              v-if="request.remarks"
              class="description-block existing-remarks"
            >
              <label>Existing Remarks</label>
              <p>{{ request.remarks }}</p>
            </div>
          </section>

          <section
            v-if="mode !== 'view' && canProcess"
            class="detail-section"
          >
            <h3>
              <ClipboardCheck :size="15" />
              Approval Decision
            </h3>

            <div
              v-if="mode === 'review'"
              class="decision-options"
            >
              <label
                class="decision-option"
                :class="{ active: decision === 'approve' }"
              >
                <input
                  v-model="decision"
                  type="radio"
                  value="approve"
                />

                <CheckCircle2 :size="16" />
                Approve
              </label>

              <label
                class="decision-option"
                :class="{ active: decision === 'reject' }"
              >
                <input
                  v-model="decision"
                  type="radio"
                  value="reject"
                />

                <XCircle :size="16" />
                Reject
              </label>
            </div>

            <div class="remarks-field">
              <label>
                {{
                  effectiveDecision === 'reject'
                    ? 'Rejection Reason *'
                    : 'Approval Remarks (Optional)'
                }}
              </label>

              <textarea
                v-model="remarks"
                rows="4"
                :placeholder="
                  effectiveDecision === 'reject'
                    ? 'Explain why this request is rejected...'
                    : 'Enter approval remarks...'
                "
                @input="errorMessage = ''"
              />

              <p v-if="errorMessage" class="error-text">
                {{ errorMessage }}
              </p>
            </div>
          </section>
        </div>

        <footer class="modal-footer">
          <button
            type="button"
            class="secondary-button"
            @click="close"
          >
            {{ mode === 'view' ? 'Close' : 'Cancel' }}
          </button>

          <button
            v-if="mode !== 'view' && canProcess"
            type="button"
            class="primary-button"
            :class="{
              danger: effectiveDecision === 'reject',
            }"
            @click="submit"
          >
            <CheckCircle2
              v-if="effectiveDecision === 'approve'"
              :size="15"
            />

            <XCircle v-else :size="15" />

            {{
              effectiveDecision === 'approve'
                ? 'Confirm Approval'
                : 'Confirm Rejection'
            }}
          </button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.wfh-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  background: rgba(3, 9, 23, 0.75);
  backdrop-filter: blur(5px);
}

.wfh-modal {
  display: flex;
  width: 100%;
  max-width: 680px;
  max-height: 90vh;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid var(--border);
}

.modal-heading {
  display: flex;
  align-items: center;
  gap: 11px;
}

.heading-icon,
.employee-avatar {
  display: flex;
  width: 39px;
  height: 39px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: var(--primary-soft);
  color: var(--primary);
}

.modal-heading h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 14px;
}

.modal-heading p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.close-button {
  display: flex;
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

.close-button:hover {
  border-color: var(--border);
  background: var(--bg-card-soft);
}

.modal-body {
  overflow-y: auto;
  padding: 18px;
}

.employee-summary {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 13px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
}

.employee-info {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 4px;
}

.employee-info strong {
  color: var(--text-primary);
  font-size: 12px;
}

.employee-info span,
.employee-info small {
  color: var(--text-muted);
  font-size: 10px;
}

.status-pill {
  padding: 6px 10px;
  border-radius: 20px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 10px;
  font-weight: 650;
}

.detail-section {
  margin-top: 19px;
}

.detail-section h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-soft);
  color: var(--text-primary);
  font-size: 12px;
}

.detail-section h3 svg {
  color: var(--primary);
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 15px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-item label,
.description-block label,
.remarks-field label {
  color: var(--text-muted);
  font-size: 10px;
}

.detail-item strong {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 600;
}

.description-block {
  margin-bottom: 10px;
  padding: 12px;
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  background: var(--bg-card-soft);
}

.description-block p {
  margin: 7px 0 0;
  color: var(--text-primary);
  font-size: 11px;
  line-height: 1.7;
}

.existing-remarks {
  margin-top: 12px;
}

.decision-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 13px;
}

.decision-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 13px;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 11px;
  cursor: pointer;
}

.decision-option.active {
  border-color: var(--primary);
  background: var(--primary-soft);
  color: var(--primary);
}

.decision-option input {
  accent-color: var(--primary);
}

.remarks-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.remarks-field textarea {
  width: 100%;
  padding: 11px;
  border: 1px solid var(--border);
  border-radius: 8px;
  outline: none;
  resize: vertical;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 11px;
  line-height: 1.6;
}

.remarks-field textarea:focus {
  border-color: var(--primary);
}

.error-text {
  margin: 0;
  color: var(--red);
  font-size: 10px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  padding: 14px 18px;
  border-top: 1px solid var(--border);
}

.secondary-button,
.primary-button {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 14px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: transparent;
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.primary-button {
  border-color: var(--primary);
  background: var(--primary);
  color: white;
}

.primary-button.danger {
  border-color: var(--red);
  background: var(--red);
}

@media (max-width: 550px) {
  .details-grid,
  .decision-options {
    grid-template-columns: 1fr;
  }

  .employee-summary {
    flex-wrap: wrap;
  }
}
</style>
