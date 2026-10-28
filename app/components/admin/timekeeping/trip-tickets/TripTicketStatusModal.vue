<script setup lang="ts">
import {
  X,
  Send,
  Navigation,
  CircleCheck,
  CircleX,
  Clock3,
} from 'lucide-vue-next'

import type {
  TripTicket,
  TripTicketAction,
  TripTicketStatusFormData,
} from '~/types/tripTicket'

const props = defineProps<{
  open: boolean

  ticket:
    TripTicket | null

  action:
    TripTicketAction
}>()

const emit = defineEmits<{
  close: []

  save: [
    data:
      TripTicketStatusFormData,
  ]
}>()

const {
  error,
} = useToast()

const time =
  ref('')

const notes =
  ref('')

const title =
  computed(() => {
    if (
      props.action ===
      'issue'
    ) {
      return 'Issue Trip Ticket'
    }

    if (
      props.action ===
      'inUse'
    ) {
      return 'Mark Ticket as In Use'
    }

    if (
      props.action ===
      'complete'
    ) {
      return 'Complete Trip Ticket'
    }

    return 'Cancel Trip Ticket'
  })

const description =
  computed(() => {
    if (
      props.action ===
      'issue'
    ) {
      return 'Confirm that this trip ticket is ready to be issued.'
    }

    if (
      props.action ===
      'inUse'
    ) {
      return 'Record the actual departure time.'
    }

    if (
      props.action ===
      'complete'
    ) {
      return 'Record the actual return time.'
    }

    return 'Provide the reason for cancelling this ticket.'
  })

const icon =
  computed(() => {
    if (
      props.action ===
      'issue'
    ) {
      return Send
    }

    if (
      props.action ===
      'inUse'
    ) {
      return Navigation
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
      'issue'
    ) {
      return 'Issue Ticket'
    }

    if (
      props.action ===
      'inUse'
    ) {
      return 'Mark as In Use'
    }

    if (
      props.action ===
      'complete'
    ) {
      return 'Complete Ticket'
    }

    return 'Cancel Ticket'
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
    () => props.ticket?.id,
    () => props.action,
  ],
  () => {
    if (!props.open) {
      return
    }

    time.value =
      defaultTime()

    notes.value =
      ''
  },
  {
    immediate: true,
  },
)

const handleSave = () => {
  if (!props.ticket) {
    return
  }

  if (
    (
      props.action ===
        'inUse' ||
      props.action ===
        'complete'
    ) &&
    !time.value
  ) {
    error(
      'Time Required',
      'Please enter the actual trip time.',
    )

    return
  }

  if (
    props.action ===
      'cancel' &&
    !notes.value.trim()
  ) {
    error(
      'Cancellation Reason Required',
      'Please provide the reason for cancelling this ticket.',
    )

    return
  }

  emit('save', {
    ticketId:
      props.ticket.id,

    action:
      props.action,

    time:
      (
        props.action ===
          'inUse' ||
        props.action ===
          'complete'
      )
        ? time.value
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
          ticket
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

            <div class="ticket-summary">

              <div>
                <span>
                  Ticket No.
                </span>

                <strong>
                  {{
                    ticket.ticketNumber
                  }}
                </strong>
              </div>

              <div>
                <span>
                  Trip No.
                </span>

                <strong>
                  {{
                    ticket.tripNumber
                  }}
                </strong>
              </div>

              <div>
                <span>
                  Employee / Driver
                </span>

                <strong>
                  {{
                    ticket.employeeName
                  }}
                </strong>
              </div>

              <div>
                <span>
                  Current Status
                </span>

                <StatusBadge
                  :status="
                    ticket.status
                  "
                />
              </div>

            </div>

            <div
              v-if="
                action ===
                  'inUse' ||
                action ===
                  'complete'
              "
              class="field-group"
            >

              <label>
                <Clock3 :size="14" />

                {{
                  action ===
                  'inUse'
                    ? 'Actual Departure'
                    : 'Actual Return'
                }}

                <span>*</span>
              </label>

              <input
                v-model="time"
                type="time"
                class="native-input"
              >

            </div>

            <div class="field-group">

              <label>
                {{
                  action ===
                  'cancel'
                    ? 'Cancellation Reason'
                    : 'Notes'
                }}

                <span
                  v-if="
                    action ===
                    'cancel'
                  "
                >
                  *
                </span>
              </label>

              <textarea
                v-model="notes"
                rows="4"
                :placeholder="
                  action ===
                  'cancel'
                    ? 'Enter cancellation reason...'
                    : 'Optional notes...'
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

.header-icon.issue,
.header-icon.inUse {
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

.ticket-summary {
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

.ticket-summary > div {
  min-height: 55px;

  padding: 9px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card);
}

.ticket-summary span,
.ticket-summary strong {
  display: block;
}

.ticket-summary span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.ticket-summary strong {
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

  font-family: inherit;

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

  font-family: inherit;

  font-size: 10px;
  font-weight: 600;

  cursor: pointer;
}

.confirm-button.issue,
.confirm-button.inUse {
  background:
    var(--primary);
}

.confirm-button.complete {
  background:
    var(--green);
}

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