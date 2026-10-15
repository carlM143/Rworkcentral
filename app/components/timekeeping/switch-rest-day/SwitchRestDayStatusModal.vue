<script setup lang="ts">
import {
  X,
  CircleCheck,
  CircleX,
  RefreshCw,
} from 'lucide-vue-next'

import type {
  SwitchRestDayAction,
  SwitchRestDayRecord,
  SwitchRestDayStatusFormData,
} from '~/types/switchRestDay'

const props = defineProps<{
  open: boolean

  record:
    SwitchRestDayRecord | null

  action:
    SwitchRestDayAction
}>()

const emit = defineEmits<{
  close: []

  save: [
    data:
      SwitchRestDayStatusFormData,
  ]
}>()

const {
  error,
} = useToast()

const notes =
  ref('')

const title =
  computed(() => {
    if (
      props.action ===
      'approve'
    ) {
      return 'Approve Rest Day Switch'
    }

    if (
      props.action ===
      'reject'
    ) {
      return 'Reject Rest Day Switch'
    }

    return 'Cancel Rest Day Switch'
  })

const description =
  computed(() => {
    if (
      props.action ===
      'approve'
    ) {
      return 'Confirm approval of this rest day switch request.'
    }

    if (
      props.action ===
      'reject'
    ) {
      return 'Provide the reason for rejecting this request.'
    }

    return 'Provide the reason for cancelling this request.'
  })

const icon =
  computed(() => {
    if (
      props.action ===
      'approve'
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

    return 'Cancel Request'
  })

watch(
  [
    () => props.open,
    () => props.record?.id,
    () => props.action,
  ],
  () => {
    if (props.open) {
      notes.value =
        ''
    }
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
                :class="
                  action
                "
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

            <!-- REQUEST -->

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
                  Current Rest Day
                </span>

                <strong>
                  {{
                    record.currentRestDay
                  }}
                </strong>

              </div>

              <div>

                <span>
                  Requested Rest Day
                </span>

                <strong class="blue">
                  {{
                    record.requestedRestDay
                  }}
                </strong>

              </div>

            </div>

            <div class="switch-summary">

              <RefreshCw :size="16" />

              <div>

                <span>
                  Requested Change
                </span>

                <strong>
                  {{
                    record.currentRestDay
                  }}
                  →
                  {{
                    record.requestedRestDay
                  }}
                </strong>

              </div>

            </div>

            <div class="field-group">

              <label>

                {{
                  action === 'approve'
                    ? 'Approval Notes'
                    : action === 'reject'
                      ? 'Rejection Reason'
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
              :class="
                action
              "
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

.blue {
  color:
    var(--primary) !important;
}

.switch-summary {
  display: flex;

  align-items: center;

  gap: 8px;

  margin-top: 10px;

  padding: 10px;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.switch-summary span,
.switch-summary strong {
  display: block;
}

.switch-summary span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.switch-summary strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 10px;
}

.field-group {
  margin-top: 12px;
}

.field-group label {
  display: block;

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

textarea {
  width: 100%;

  min-height: 90px;

  padding: 10px;

  border:
    1px solid var(--border);

  border-radius: 7px;

  outline: none;

  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);

  font-family: inherit;

  font-size: 10px;

  resize: vertical;
}

textarea:focus {
  border-color:
    var(--primary);
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

  font-family: inherit;

  font-size: 10px;
  font-weight: 600;

  cursor: pointer;
}

.confirm-button.approve {
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