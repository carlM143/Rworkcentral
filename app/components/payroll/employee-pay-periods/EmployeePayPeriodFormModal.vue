<script setup lang="ts">
import {
  X,
  CalendarRange,
  Save,
} from 'lucide-vue-next'

import type {
  EmployeePayPeriod,
} from '~/types/employeePayPeriod'

const props =
  defineProps<{
    open: boolean

    period:
      EmployeePayPeriod |
      null
  }>()

const emit =
  defineEmits<{
    close: []

    save: [
      payload: {
        periodName: string
        startDate: string
        endDate: string
        cutoffDate: string
        payDate: string
        remarks: string
      },
    ]
  }>()

const {
  error,
} = useToast()

const form =
  reactive({
    periodName: '',
    startDate: '',
    endDate: '',
    cutoffDate: '',
    payDate: '',
    remarks: '',
  })

const isEdit =
  computed(
    () => Boolean(
      props.period,
    ),
  )

const reset = () => {
  form.periodName = ''
  form.startDate = ''
  form.endDate = ''
  form.cutoffDate = ''
  form.payDate = ''
  form.remarks = ''
}

const load = () => {
  if (!props.period) {
    reset()
    return
  }

  form.periodName =
    props.period.periodName

  form.startDate =
    props.period.startDate

  form.endDate =
    props.period.endDate

  form.cutoffDate =
    props.period.cutoffDate

  form.payDate =
    props.period.payDate

  form.remarks =
    props.period.remarks ?? ''
}

watch(
  [
    () => props.open,
    () => props.period?.id,
  ],
  () => {
    if (props.open) {
      load()
    }
  },
)

const handleSave = () => {
  if (
    !form.periodName.trim()
  ) {
    error(
      'Period Name Required',
      'Please enter the employee pay period name.',
    )
    return
  }

  if (
    !form.startDate ||
    !form.endDate ||
    !form.cutoffDate ||
    !form.payDate
  ) {
    error(
      'Required Dates Missing',
      'Complete all payroll period dates.',
    )
    return
  }

  if (
    form.endDate <
    form.startDate
  ) {
    error(
      'Invalid Period',
      'End date cannot be earlier than start date.',
    )
    return
  }

  emit('save', {
    periodName:
      form.periodName.trim(),

    startDate:
      form.startDate,

    endDate:
      form.endDate,

    cutoffDate:
      form.cutoffDate,

    payDate:
      form.payDate,

    remarks:
      form.remarks.trim(),
  })
}
</script>

<template>
  <Teleport to="body">

    <div
      v-if="open"
      class="overlay"
      @click.self="
        emit('close')
      "
    >

      <article class="modal">

        <header>

          <div class="heading">

            <div class="icon">
              <CalendarRange :size="19" />
            </div>

            <div>
              <h2>
                {{
                  isEdit
                    ? 'Edit Employee Pay Period'
                    : 'Create Employee Pay Period'
                }}
              </h2>

              <p>
                Configure employee payroll coverage,
                cutoff and pay date.
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

          <div class="field full">
            <label>
              Period Name *
            </label>

            <input
              v-model="form.periodName"
              placeholder="Example: October 1–15, 2026"
            >
          </div>

          <div class="grid">

            <div class="field">
              <label>Start Date *</label>

              <input
                v-model="form.startDate"
                type="date"
              >
            </div>

            <div class="field">
              <label>End Date *</label>

              <input
                v-model="form.endDate"
                type="date"
              >
            </div>

            <div class="field">
              <label>Cutoff Date *</label>

              <input
                v-model="form.cutoffDate"
                type="date"
              >
            </div>

            <div class="field">
              <label>Pay Date *</label>

              <input
                v-model="form.payDate"
                type="date"
              >
            </div>

          </div>

          <div class="field full">
            <label>Remarks</label>

            <textarea
              v-model="form.remarks"
              rows="4"
              placeholder="Optional payroll period remarks..."
            />
          </div>

        </div>

        <footer>

          <span>
            New employee pay periods will start as Draft.
          </span>

          <div>
            <AppButton
              variant="secondary"
              @click="emit('close')"
            >
              Cancel
            </AppButton>

            <AppButton
              :icon="Save"
              @click="handleSave"
            >
              {{
                isEdit
                  ? 'Save Changes'
                  : 'Create Pay Period'
              }}
            </AppButton>
          </div>

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
  max-width: 700px;
  border: 1px solid var(--border);
  border-radius: 13px;
  background: var(--bg-card);
  overflow: hidden;
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid var(--border-soft);
}

.heading {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon {
  display: flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: var(--primary-soft);
  color: var(--primary);
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
  width: 32px;
  height: 32px;
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

.grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.field {
  margin-bottom: 12px;
}

.field label {
  display: block;
  margin-bottom: 6px;
  color: var(--text-primary);
  font-size: 9px;
  font-weight: 600;
}

input,
textarea {
  box-sizing: border-box;
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 9px;
  outline: none;
}

input {
  height: 39px;
  padding: 0 10px;
}

textarea {
  padding: 10px;
  resize: vertical;
}

input:focus,
textarea:focus {
  border-color: var(--primary);
}

footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 18px;
  border-top: 1px solid var(--border-soft);
}

footer > span {
  color: var(--text-muted);
  font-size: 8px;
}

footer > div {
  display: flex;
  gap: 7px;
}

@media (max-width: 600px) {
  .grid {
    grid-template-columns: 1fr;
  }

  footer {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>