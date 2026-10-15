<script setup lang="ts">
import {
  X,
  Play,
  CircleCheck,
  CircleX,
  Clock3,
} from 'lucide-vue-next'

import type {
  ManageTrip,
  TripStatusAction,
  TripStatusFormData,
} from '~/types/manageTrip'

const props = defineProps<{
  open: boolean

  trip:
    ManageTrip | null

  action:
    TripStatusAction
}>()

const emit = defineEmits<{
  close: []

  save: [
    data:
      TripStatusFormData,
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
      'start'
    ) {
      return 'Start Trip'
    }

    if (
      props.action ===
      'complete'
    ) {
      return 'Complete Trip'
    }

    return 'Cancel Trip'
  })

const description =
  computed(() => {
    if (
      props.action ===
      'start'
    ) {
      return 'Record the actual departure time.'
    }

    if (
      props.action ===
      'complete'
    ) {
      return 'Record the actual return time.'
    }

    return 'Provide the reason for cancelling this trip.'
  })

const icon =
  computed(() => {
    if (
      props.action ===
      'start'
    ) {
      return Play
    }

    if (
      props.action ===
      'complete'
    ) {
      return CircleCheck
    }

    return CircleX
  })

const defaultTime = () => {
  const now =
    new Date()

  const hours =
    String(
      now.getHours(),
    ).padStart(
      2,
      '0',
    )

  const minutes =
    String(
      now.getMinutes(),
    ).padStart(
      2,
      '0',
    )

  return `${hours}:${minutes}`
}

watch(
  [
    () => props.open,
    () => props.trip?.id,
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
  if (!props.trip) {
    return
  }

  if (
    props.action !==
      'cancel' &&
    !time.value
  ) {
    error(
      'Time Required',
      'Please provide the actual trip time.',
    )

    return
  }

  if (
    props.action ===
      'cancel' &&
    !notes.value.trim()
  ) {
    error(
      'Reason Required',
      'Please enter the reason for cancelling this trip.',
    )

    return
  }

  emit('save', {
    tripId:
      props.trip.id,

    action:
      props.action,

    time:
      props.action ===
      'cancel'
        ? undefined
        : time.value,

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
          trip
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
                  :size="20"
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

            <div class="trip-summary">

              <div>
                <span>
                  Trip Number
                </span>

                <strong>
                  {{ trip.tripNumber }}
                </strong>
              </div>

              <div>
                <span>
                  Employee / Driver
                </span>

                <strong>
                  {{ trip.employeeName }}
                </strong>
              </div>

              <div>
                <span>
                  Route
                </span>

                <strong>
                  {{ trip.origin }}
                  →
                  {{ trip.destination }}
                </strong>
              </div>

            </div>

            <div
              v-if="
                action !==
                'cancel'
              "
              class="field-group"
            >

              <label>
                <Clock3 :size="14" />

                {{
                  action === 'start'
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
                  action === 'cancel'
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
                  action === 'cancel'
                    ? 'Enter reason for cancellation...'
                    : 'Optional trip notes...'
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

              {{
                action === 'start'
                  ? 'Start Trip'
                  : action === 'complete'
                    ? 'Complete Trip'
                    : 'Cancel Trip'
              }}
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

  padding: 16px 18px;

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

.header-icon.start {
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
  margin: 4px 0 0;

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

  background: transparent;

  color:
    var(--text-secondary);
}

.modal-body {
  padding: 16px 18px;
}

.trip-summary {
  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 8px;

  padding: 12px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 8px;

  background:
    var(--bg-card-soft);
}

.trip-summary
div:last-child {
  grid-column:
    1 / -1;
}

.trip-summary > div {
  padding: 9px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card);
}

.trip-summary span,
.trip-summary strong {
  display: block;
}

.trip-summary span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.trip-summary strong {
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

  padding: 13px 18px;

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

.confirm-button.start {
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