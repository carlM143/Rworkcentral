<script setup lang="ts">
import {
  X,
  FolderOpen,
  Play,
  CircleCheck,
  CircleX,
} from 'lucide-vue-next'

import type {
  EmployeePayPeriod,
} from '~/types/employeePayPeriod'

type Action =
  | 'open'
  | 'process'
  | 'close'
  | 'cancel'

const props =
  defineProps<{
    open: boolean

    period:
      EmployeePayPeriod |
      null

    action: Action
  }>()

const emit =
  defineEmits<{
    close: []

    confirm: [
      payload: {
        action: Action
        reason: string
      },
    ]
  }>()

const reason =
  ref('')

watch(
  () => props.open,
  value => {
    if (value) {
      reason.value = ''
    }
  },
)

const icon =
  computed(() => {
    if (props.action === 'open') {
      return FolderOpen
    }

    if (props.action === 'process') {
      return Play
    }

    if (props.action === 'close') {
      return CircleCheck
    }

    return CircleX
  })

const title =
  computed(() => {
    if (props.action === 'open') {
      return 'Open Pay Period'
    }

    if (props.action === 'process') {
      return 'Start Payroll Processing'
    }

    if (props.action === 'close') {
      return 'Close Pay Period'
    }

    return 'Cancel Pay Period'
  })

const handleConfirm = () => {
  if (
    props.action === 'cancel' &&
    !reason.value.trim()
  ) {
    return
  }

  emit('confirm', {
    action:
      props.action,

    reason:
      reason.value.trim(),
  })
}
</script>

<template>
  <Teleport to="body">

    <div
      v-if="
        open &&
        period
      "
      class="overlay"
      @click.self="
        emit('close')
      "
    >

      <article class="modal">

        <header>

          <div class="heading">

            <div
              class="icon"
              :class="{
                danger:
                  action ===
                  'cancel',
              }"
            >
              <component
                :is="icon"
                :size="18"
              />
            </div>

            <div>
              <h2>{{ title }}</h2>

              <p>
                {{ period.periodCode }}
              </p>
            </div>

          </div>

          <button
            class="close"
            @click="emit('close')"
          >
            <X :size="18" />
          </button>

        </header>

        <div class="body">

          <div class="period-card">

            <span>Payroll Period</span>

            <strong>
              {{ period.periodName }}
            </strong>

            <small>
              {{ period.completedEmployees }}
              completed ·
              {{ period.pendingEmployees }}
              pending
            </small>

          </div>

          <div
            v-if="
              action === 'close' &&
              period.pendingEmployees > 0
            "
            class="warning"
          >
            This period still has
            {{ period.pendingEmployees }}
            pending employee payroll record(s).
          </div>

          <div
            v-if="action === 'cancel'"
            class="field"
          >
            <label>
              Cancellation Reason *
            </label>

            <textarea
              v-model="reason"
              rows="4"
              placeholder="Enter cancellation reason..."
            />
          </div>

        </div>

        <footer>

          <AppButton
            variant="secondary"
            @click="emit('close')"
          >
            Back
          </AppButton>

          <button
            type="button"
            class="confirm"
            :class="{
              danger:
                action ===
                'cancel',
            }"
            :disabled="
              action === 'close' &&
              period.pendingEmployees > 0
            "
            @click="handleConfirm"
          >
            <component
              :is="icon"
              :size="14"
            />

            Confirm
          </button>

        </footer>

      </article>

    </div>

  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  z-index: 99990;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(3, 8, 18, 0.76);
  backdrop-filter: blur(4px);
}

.modal {
  width: 100%;
  max-width: 550px;
  border: 1px solid var(--border);
  border-radius: 13px;
  background: var(--bg-card);
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 18px;
  border-bottom: 1px solid var(--border-soft);
}

.heading {
  display: flex;
  align-items: center;
  gap: 9px;
}

.icon {
  display: flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--green-soft);
  color: var(--green);
}

.icon.danger {
  background: var(--red-soft);
  color: var(--red);
}

h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 14px;
}

.heading p {
  margin: 3px 0 0;
  color: var(--text-muted);
  font-size: 8px;
}

.close {
  display: flex;
  width: 31px;
  height: 31px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
}

.body {
  padding: 17px 18px;
}

.period-card {
  padding: 11px;
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  background: var(--bg-card-soft);
}

.period-card span,
.period-card strong,
.period-card small {
  display: block;
}

.period-card span {
  color: var(--text-muted);
  font-size: 7px;
}

.period-card strong {
  margin-top: 3px;
  color: var(--text-primary);
  font-size: 10px;
}

.period-card small {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 7px;
}

.warning {
  margin-top: 10px;
  padding: 10px;
  border-radius: 7px;
  background: var(--red-soft);
  color: var(--red);
  font-size: 8px;
}

.field {
  margin-top: 12px;
}

.field label {
  display: block;
  margin-bottom: 6px;
  color: var(--text-primary);
  font-size: 9px;
}

textarea {
  box-sizing: border-box;
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 9px;
  resize: vertical;
}

footer {
  display: flex;
  justify-content: flex-end;
  gap: 7px;
  padding: 13px 18px;
  border-top: 1px solid var(--border-soft);
}

.confirm {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  gap: 6px;
  padding: 0 13px;
  border: 0;
  border-radius: 7px;
  background: var(--green);
  color: white;
  font-family: inherit;
  font-size: 9px;
  font-weight: 600;
  cursor: pointer;
}

.confirm.danger {
  background: var(--red);
}

.confirm:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>