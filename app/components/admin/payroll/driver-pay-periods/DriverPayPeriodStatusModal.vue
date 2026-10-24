<script setup lang="ts">
import {
  X,
  FolderOpen,
  Play,
  CircleCheck,
  CircleX,
  Users,
} from 'lucide-vue-next'

import type {
  DriverPayPeriod,
  DriverPayPeriodAction,
  DriverPayPeriodStatusFormData,
} from '~/types/driverPayPeriod'

const props =
  defineProps<{
    open: boolean

    period:
      DriverPayPeriod | null

    action:
      DriverPayPeriodAction
  }>()

const emit =
  defineEmits<{
    close: []

    save: [
      data:
        DriverPayPeriodStatusFormData,
    ]
  }>()

const {
  error,
} = useToast()

const notes =
  ref('')

const title =
  computed(() => {
    switch (
      props.action
    ) {
      case 'open':
        return 'Open Driver Pay Period'

      case 'process':
        return 'Start Payroll Processing'

      case 'close':
        return 'Close Driver Pay Period'

      default:
        return 'Cancel Driver Pay Period'
    }
  })

const description =
  computed(() => {
    switch (
      props.action
    ) {
      case 'open':
        return 'Open this period so driver payroll records can be processed.'

      case 'process':
        return 'Begin processing all driver payroll records for this period.'

      case 'close':
        return 'Close and lock this payroll period after all drivers are completed.'

      default:
        return 'Cancel this driver payroll period.'
    }
  })

const icon =
  computed(() => {
    switch (
      props.action
    ) {
      case 'open':
        return FolderOpen

      case 'process':
        return Play

      case 'close':
        return CircleCheck

      default:
        return CircleX
    }
  })

const buttonLabel =
  computed(() => {
    switch (
      props.action
    ) {
      case 'open':
        return 'Open Period'

      case 'process':
        return 'Start Processing'

      case 'close':
        return 'Close Period'

      default:
        return 'Cancel Period'
    }
  })

const canClose =
  computed(() => {
    if (
      props.action !==
      'close'
    ) {
      return true
    }

    return (
      props.period
        ?.pendingDrivers ===
      0
    )
  })

watch(
  [
    () => props.open,
    () => props.period?.id,
    () => props.action,
  ],
  () => {
    if (
      props.open
    ) {
      notes.value =
        ''
    }
  },
  {
    immediate: true,
  },
)

const handleSave = () => {
  if (
    !props.period
  ) {
    return
  }

  if (
    props.action ===
      'cancel' &&
    !notes.value.trim()
  ) {
    error(
      'Cancellation Reason Required',
      'Please provide the reason for cancelling this pay period.',
    )

    return
  }

  if (
    props.action ===
      'close' &&
    !canClose.value
  ) {
    error(
      'Cannot Close Period',
      `${props.period.pendingDrivers} driver payroll record(s) are still pending.`,
    )

    return
  }

  emit(
    'save',
    {
      periodId:
        props.period.id,

      action:
        props.action,

      notes:
        notes.value.trim(),
    },
  )
}
</script>

<template>
  <Teleport to="body">

    <Transition name="modal">

      <div
        v-if="
          open &&
          period
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
                  :is="
                    icon
                  "
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
              class="close-button"
              @click="
                emit('close')
              "
            >
              <X :size="18" />
            </button>

          </div>

          <div class="modal-body">

            <div class="period-summary">

              <div>

                <span>
                  Period Code
                </span>

                <strong class="blue">
                  {{
                    period.periodCode
                  }}
                </strong>

              </div>

              <div>

                <span>
                  Period
                </span>

                <strong>
                  {{
                    period.periodName
                  }}
                </strong>

              </div>

              <div>

                <span>
                  Current Status
                </span>

                <StatusBadge
                  :status="
                    period.status
                  "
                />

              </div>

              <div>

                <span>
                  Total Drivers
                </span>

                <strong>
                  {{
                    period.totalDrivers
                  }}
                </strong>

              </div>

            </div>

            <div class="driver-summary">

              <Users :size="17" />

              <div>

                <span>
                  Payroll Progress
                </span>

                <strong>
                  {{
                    period.completedDrivers
                  }}
                  completed ·
                  {{
                    period.pendingDrivers
                  }}
                  pending
                </strong>

              </div>

            </div>

            <div
              v-if="
                action ===
                  'close' &&
                !canClose
              "
              class="warning-box"
            >

              <CircleX :size="16" />

              <div>

                <strong>
                  Period cannot be closed yet.
                </strong>

                <span>
                  {{
                    period.pendingDrivers
                  }}
                  driver payroll record(s)
                  are still pending.
                </span>

              </div>

            </div>

            <div
              v-if="
                action ===
                'cancel'
              "
              class="field"
            >

              <label>
                Cancellation Reason
                <span>*</span>
              </label>

              <textarea
                v-model="
                  notes
                "
                rows="4"
                placeholder="Enter cancellation reason..."
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
              Back
            </AppButton>

            <button
              type="button"
              class="confirm-button"
              :class="
                action
              "
              :disabled="
                action ===
                  'close' &&
                !canClose
              "
              @click="
                handleSave
              "
            >

              <component
                :is="
                  icon
                "
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

.period-summary {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 8px;
}

.period-summary > div {
  padding: 9px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card-soft);
}

.period-summary span,
.period-summary strong {
  display: block;
}

.period-summary span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.period-summary strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 9px;
}

.blue {
  color:
    var(--primary) !important;
}

.driver-summary {
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

.driver-summary span,
.driver-summary strong {
  display: block;
}

.driver-summary span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.driver-summary strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 9px;
}

.warning-box {
  display: flex;

  align-items: flex-start;

  gap: 8px;

  margin-top: 10px;

  padding: 10px;

  border:
    1px solid
    color-mix(
      in srgb,
      var(--red) 25%,
      var(--border)
    );

  border-radius: 7px;

  background:
    var(--red-soft);

  color:
    var(--red);
}

.warning-box strong,
.warning-box span {
  display: block;
}

.warning-box strong {
  font-size: 9px;
}

.warning-box span {
  margin-top: 3px;

  color:
    var(--text-secondary);

  font-size: 8px;
}

.field {
  margin-top: 12px;
}

.field label {
  display: block;

  margin-bottom: 6px;

  color:
    var(--text-primary);

  font-size: 10px;
  font-weight: 600;
}

.field label span {
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

  outline: 0;

  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);

  font-family:
    inherit;

  font-size: 10px;

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

  background:
    var(--green);

  color: white;

  font-family:
    inherit;

  font-size: 10px;
  font-weight: 600;

  cursor: pointer;
}

.confirm-button.cancel {
  background:
    var(--red);
}

.confirm-button:disabled {
  cursor:
    not-allowed;

  opacity: 0.45;
}
</style>