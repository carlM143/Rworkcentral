<script setup lang="ts">
import {
  X,
  BadgeCheck,
  CircleX,
  CircleCheck,
  Clock3,
} from 'lucide-vue-next'

import type {
  FieldLeaveAction,
  FieldLeaveRecord,
  FieldLeaveStatusFormData,
} from '~/types/fieldLeave'

const props = defineProps<{
  open: boolean

  record:
    FieldLeaveRecord | null

  action:
    FieldLeaveAction
}>()

const emit = defineEmits<{
  close: []

  save: [
    data:
      FieldLeaveStatusFormData,
  ]
}>()

const {
  error,
} = useToast()

const completionTime =
  ref('')

const notes =
  ref('')

const title =
  computed(() => {
    if (
      props.action ===
      'approve'
    ) {
      return 'Approve Field Leave'
    }

    if (
      props.action ===
      'reject'
    ) {
      return 'Reject Field Leave'
    }

    if (
      props.action ===
      'complete'
    ) {
      return 'Complete Field Leave'
    }

    return 'Cancel Field Leave'
  })

const description =
  computed(() => {
    if (
      props.action ===
      'approve'
    ) {
      return 'Confirm approval of this field leave request.'
    }

    if (
      props.action ===
      'reject'
    ) {
      return 'Provide the reason for rejecting this request.'
    }

    if (
      props.action ===
      'complete'
    ) {
      return 'Record the actual completion time.'
    }

    return 'Provide the reason for cancelling this request.'
  })

const icon =
  computed(() => {
    if (
      props.action ===
      'approve'
    ) {
      return BadgeCheck
    }

    if (
      props.action ===
      'complete'
    ) {
      return CircleCheck
    }

    return CircleX
  })

const buttonLabel =
  computed(() => {
    if (
      props.action ===
      'approve'
    ) {
      return 'Approve Request'
    }

    if (
      props.action ===
      'reject'
    ) {
      return 'Reject Request'
    }

    if (
      props.action ===
      'complete'
    ) {
      return 'Mark as Completed'
    }

    return 'Cancel Request'
  })

const defaultTime = () => {
  const now =
    new Date()

  return `${String(
    now.getHours(),
  ).padStart(
    2,
    '0',
  )}:${String(
    now.getMinutes(),
  ).padStart(
    2,
    '0',
  )}`
}

watch(
  [
    () => props.open,
    () => props.record?.id,
    () => props.action,
  ],
  () => {
    if (!props.open) {
      return
    }

    completionTime.value =
      defaultTime()

    notes.value =
      ''
  },
  {
    immediate: true,
  },
)

const handleSave = () => {
  if (!props.record) {
    return
  }

  if (
    props.action ===
      'complete' &&
    !completionTime.value
  ) {
    error(
      'Completion Time Required',
      'Please enter the actual completion time.',
    )

    return
  }

  if (
    (
      props.action ===
        'reject' ||
      props.action ===
        'cancel'
    ) &&
    !notes.value.trim()
  ) {
    error(
      'Reason Required',
      'Please provide a reason before continuing.',
    )

    return
  }

  emit('save', {
    requestId:
      props.record.id,

    action:
      props.action,

    completionTime:
      props.action ===
      'complete'
        ? completionTime.value
        : undefined,

    notes:
      notes.value.trim(),
  })
}
</script>

<template>
  <Teleport to="body">

    <Transition name="modal">

      <div
        v-if="
          open &&
          record
        "
        class="modal-backdrop"
        @click.self="
          emit('close')
        "
      >

        <div class="modal-card">

          <div class="modal-header">

            <div class="header-left">

              <div
                class="header-icon"
                :class="action"
              >

                <component
                  :is="icon"
                  :size="19"
                />

              </div>

              <div>

                <h2>
                  {{ title }}
                </h2>

                <p>
                  {{ description }}
                </p>

              </div>

            </div>

            <button
              type="button"
              class="close-button"
              @click="
                emit('close')
              "
            >
              <X :size="18" />
            </button>

          </div>

          <div class="modal-body">

            <div class="request-summary">

              <div>
                <span>
                  Request No.
                </span>

                <strong>
                  {{
                    record.requestNumber
                  }}
                </strong>
              </div>

              <div>
                <span>
                  Employee
                </span>

                <strong>
                  {{
                    record.employeeName
                  }}
                </strong>
              </div>

              <div>
                <span>
                  Field Date
                </span>

                <strong>
                  {{
                    record.fieldDate
                  }}
                </strong>
              </div>

              <div>
                <span>
                  Current Status
                </span>

                <StatusBadge
                  :status="
                    record.status
                  "
                />
              </div>

            </div>

            <div
              v-if="
                action ===
                'complete'
              "
              class="field-group"
            >

              <label>
                <Clock3 :size="14" />

                Actual Completion Time

                <span>*</span>
              </label>

              <input
                v-model="
                  completionTime
                "
                type="time"
                class="native-input"
              >

            </div>

            <div class="field-group">

              <label>

                {{
                  action === 'approve'
                    ? 'Approval Notes'
                    : action === 'reject'
                      ? 'Rejection Reason'
                      : action === 'complete'
                        ? 'Completion Notes'
                        : 'Cancellation Reason'
                }}

                <span
                  v-if="
                    action ===
                      'reject' ||
                    action ===
                      'cancel'
                  "
                >
                  *
                </span>

              </label>

              <textarea
                v-model="
                  notes
                "
                rows="4"
                :placeholder="
                  action === 'approve'
                    ? 'Optional approval notes...'
                    : action === 'reject'
                      ? 'Enter rejection reason...'
                      : action === 'complete'
                        ? 'Optional completion notes...'
                        : 'Enter cancellation reason...'
                "
              />

            </div>

          </div>

          <div class="modal-footer">

            <AppButton
              variant="secondary"
              @click="
                emit('close')
              "
            >
              Cancel
            </AppButton>

            <button
              type="button"
              class="confirm-button"
              :class="action"
              @click="
                handleSave
              "
            >

              <component
                :is="icon"
                :size="15"
              />

              {{ buttonLabel }}

            </button>

          </div>

        </div>

      </div>

    </Transition>

  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;

  z-index: 9999;

  display: flex;

  align-items: center;
  justify-content: center;

  padding: 20px;

  background:
    rgba(3, 8, 18, 0.76);

  backdrop-filter:
    blur(3px);
}

.modal-card {
  width: 100%;
  max-width: 580px;

  overflow: hidden;

  border:
    1px solid var(--border);

  border-radius: 13px;

  background:
    var(--bg-card);

  box-shadow:
    0 24px 80px
    rgba(0, 0, 0, 0.4);
}

.modal-header {
  display: flex;

  align-items: center;
  justify-content: space-between;

  padding:
    16px 18px;

  border-bottom:
    1px solid
    var(--border-soft);
}

.header-left {
  display: flex;

  align-items: center;

  gap: 10px;
}

.header-icon {
  display: flex;

  width: 40px;
  height: 40px;

  align-items: center;
  justify-content: center;

  border-radius: 9px;
}

.header-icon.approve {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.header-icon.complete {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.header-icon.reject,
.header-icon.cancel {
  background:
    var(--red-soft);

  color:
    var(--red);
}

.modal-header h2 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 15px;
}

.modal-header p {
  margin:
    4px 0 0;

  color:
    var(--text-muted);

  font-size: 9px;
}

.close-button {
  display: flex;

  width: 34px;
  height: 34px;

  align-items: center;
  justify-content: center;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    transparent;

  color:
    var(--text-secondary);
}

.modal-body {
  padding:
    16px 18px;
}

.request-summary {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 8px;

  padding: 11px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 8px;

  background:
    var(--bg-card-soft);
}

.request-summary > div {
  min-height: 55px;

  padding: 9px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card);
}

.request-summary span,
.request-summary strong {
  display: block;
}

.request-summary span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.request-summary strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 9px;
}

.field-group {
  margin-top: 12px;
}

.field-group label {
  display: flex;

  align-items: center;

  gap: 5px;

  margin-bottom: 6px;

  color:
    var(--text-primary);

  font-size: 10px;
  font-weight: 600;
}

.field-group label span {
  color:
    var(--red);
}

.native-input,
textarea {
  width: 100%;

  border:
    1px solid var(--border);

  border-radius: 7px;

  outline: none;

  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);

  font-family:
    inherit;

  font-size: 10px;
}

.native-input {
  height: 40px;

  padding:
    0 10px;
}

textarea {
  min-height: 90px;

  padding: 10px;

  resize: vertical;
}

.modal-footer {
  display: flex;

  justify-content: flex-end;

  gap: 8px;

  padding:
    13px 18px;

  border-top:
    1px solid
    var(--border-soft);

  background:
    var(--bg-card-soft);
}

.confirm-button {
  display: inline-flex;

  min-height: 36px;

  align-items: center;

  gap: 6px;

  padding:
    0 13px;

  border: 0;

  border-radius: 7px;

  color: white;

  font-family:
    inherit;

  font-size: 10px;
  font-weight: 600;

  cursor: pointer;
}

.confirm-button.approve {
  background:
    var(--primary);
}

.confirm-button.complete {
  background:
    var(--green);
}

.confirm-button.reject,
.confirm-button.cancel {
  background:
    var(--red);
}

.modal-enter-active,
.modal-leave-active {
  transition:
    opacity 0.15s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>