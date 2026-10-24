<script setup lang="ts">
import {
  X,
  CalendarRange,
  CalendarDays,
  FileText,
  Save,
} from 'lucide-vue-next'

import type {
  DriverPayPeriod,
  DriverPayPeriodFormData,
} from '~/types/driverPayPeriod'

const props =
  defineProps<{
    open: boolean

    period:
      DriverPayPeriod | null
  }>()

const emit =
  defineEmits<{
    close: []

    save: [
      data:
        DriverPayPeriodFormData,
    ]
  }>()

const {
  error,
} = useToast()

const form =
  reactive<
    DriverPayPeriodFormData
  >({
    periodName:
      '',

    startDate:
      '',

    endDate:
      '',

    cutoffDate:
      '',

    payDate:
      '',

    remarks:
      '',
  })

const isEdit =
  computed(() => {
    return Boolean(
      props.period,
    )
  })

const formatPeriodName = () => {
  if (
    !form.startDate ||
    !form.endDate
  ) {
    return
  }

  const start =
    new Date(
      `${form.startDate}T00:00:00`,
    )

  const end =
    new Date(
      `${form.endDate}T00:00:00`,
    )

  const startFormatter =
    new Intl.DateTimeFormat(
      'en-US',
      {
        month: 'long',
        day: 'numeric',
      },
    )

  const endFormatter =
    new Intl.DateTimeFormat(
      'en-US',
      {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      },
    )

  form.periodName =
    `${startFormatter.format(
      start,
    )}–${endFormatter.format(
      end,
    )}`
}

const resetForm = () => {
  form.periodName =
    ''

  form.startDate =
    ''

  form.endDate =
    ''

  form.cutoffDate =
    ''

  form.payDate =
    ''

  form.remarks =
    ''
}

const loadPeriod = () => {
  if (!props.period) {
    resetForm()

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
    props.period.remarks ??
    ''
}

watch(
  [
    () => props.open,
    () => props.period?.id,
  ],
  () => {
    if (
      props.open
    ) {
      loadPeriod()
    }
  },
  {
    immediate: true,
  },
)

watch(
  [
    () => form.startDate,
    () => form.endDate,
  ],
  () => {
    if (
      !isEdit.value
    ) {
      formatPeriodName()
    }
  },
)

const handleSave = () => {
  if (
    !form.periodName.trim()
  ) {
    error(
      'Period Name Required',
      'Please enter the pay period name.',
    )

    return
  }

  if (
    !form.startDate ||
    !form.endDate
  ) {
    error(
      'Period Dates Required',
      'Please select the start and end dates.',
    )

    return
  }

  if (
    form.endDate <
    form.startDate
  ) {
    error(
      'Invalid Period',
      'End date cannot be earlier than the start date.',
    )

    return
  }

  if (
    !form.cutoffDate
  ) {
    error(
      'Cutoff Date Required',
      'Please select the payroll cutoff date.',
    )

    return
  }

  if (
    form.cutoffDate <
    form.endDate
  ) {
    error(
      'Invalid Cutoff Date',
      'Cutoff date cannot be earlier than the period end date.',
    )

    return
  }

  if (
    !form.payDate
  ) {
    error(
      'Pay Date Required',
      'Please select the payroll pay date.',
    )

    return
  }

  if (
    form.payDate <
    form.cutoffDate
  ) {
    error(
      'Invalid Pay Date',
      'Pay date cannot be earlier than the cutoff date.',
    )

    return
  }

  emit(
    'save',
    {
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
    },
  )
}
</script>

<template>
  <Teleport to="body">

    <Transition name="modal">

      <div
        v-if="open"
        class="modal-backdrop"
        @click.self="
          emit('close')
        "
      >

        <div class="modal-card">

          <div class="modal-header">

            <div class="header-left">

              <div class="header-icon">
                <CalendarRange :size="20" />
              </div>

              <div>

                <h2>
                  {{
                    isEdit
                      ? 'Edit Driver Pay Period'
                      : 'Create Driver Pay Period'
                  }}
                </h2>

                <p>
                  Configure the payroll cutoff
                  and payment schedule for drivers.
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

            <!-- PERIOD -->

            <section class="section-card">

              <div class="section-heading">

                <CalendarRange :size="16" />

                <div>

                  <h3>
                    Period Information
                  </h3>

                  <p>
                    Define the driver payroll coverage dates.
                  </p>

                </div>

              </div>

              <div class="field full">

                <label>
                  Period Name
                  <span>*</span>
                </label>

                <input
                  v-model="
                    form.periodName
                  "
                  type="text"
                  class="input"
                  placeholder="Example: September 1–15, 2026"
                >

              </div>

              <div class="form-grid">

                <div class="field">

                  <label>
                    Start Date
                    <span>*</span>
                  </label>

                  <input
                    v-model="
                      form.startDate
                    "
                    type="date"
                    class="input"
                  >

                </div>

                <div class="field">

                  <label>
                    End Date
                    <span>*</span>
                  </label>

                  <input
                    v-model="
                      form.endDate
                    "
                    type="date"
                    class="input"
                  >

                </div>

              </div>

            </section>

            <!-- SCHEDULE -->

            <section class="section-card">

              <div class="section-heading">

                <CalendarDays :size="16" />

                <div>

                  <h3>
                    Payroll Schedule
                  </h3>

                  <p>
                    Configure cutoff and payment dates.
                  </p>

                </div>

              </div>

              <div class="form-grid">

                <div class="field">

                  <label>
                    Cutoff Date
                    <span>*</span>
                  </label>

                  <input
                    v-model="
                      form.cutoffDate
                    "
                    type="date"
                    class="input"
                  >

                </div>

                <div class="field">

                  <label>
                    Pay Date
                    <span>*</span>
                  </label>

                  <input
                    v-model="
                      form.payDate
                    "
                    type="date"
                    class="input"
                  >

                </div>

              </div>

            </section>

            <!-- REMARKS -->

            <section class="section-card">

              <div class="section-heading">

                <FileText :size="16" />

                <div>

                  <h3>
                    Remarks
                  </h3>

                  <p>
                    Optional notes for this payroll period.
                  </p>

                </div>

              </div>

              <textarea
                v-model="
                  form.remarks
                "
                rows="4"
                placeholder="Enter remarks..."
              />

            </section>

          </div>

          <div class="modal-footer">

            <span>
              New driver pay periods start with Draft status.
            </span>

            <div class="footer-actions">

              <AppButton
                variant="secondary"
                @click="
                  emit('close')
                "
              >
                Cancel
              </AppButton>

              <AppButton
                :icon="Save"
                @click="
                  handleSave
                "
              >
                {{
                  isEdit
                    ? 'Save Changes'
                    : 'Create Pay Period'
                }}
              </AppButton>

            </div>

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
  display: flex;

  width: 100%;
  max-width: 760px;

  max-height:
    calc(100vh - 40px);

  flex-direction: column;

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

  width: 42px;
  height: 42px;

  align-items: center;
  justify-content: center;

  border-radius: 10px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.modal-header h2 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 16px;
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
  flex: 1;

  overflow-y: auto;

  padding:
    16px 18px;
}

.section-card {
  padding: 14px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 9px;

  background:
    var(--bg-card-soft);
}

.section-card +
.section-card {
  margin-top: 11px;
}

.section-heading {
  display: flex;

  align-items: center;

  gap: 8px;

  margin-bottom: 12px;

  color:
    var(--primary);
}

.section-heading h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 11px;
}

.section-heading p {
  margin:
    3px 0 0;

  color:
    var(--text-muted);

  font-size: 8px;
}

.form-grid {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 10px;

  margin-top: 10px;
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

.input,
textarea {
  width: 100%;

  border:
    1px solid var(--border);

  border-radius: 7px;

  outline: 0;

  background:
    var(--bg-card);

  color:
    var(--text-primary);

  font-family:
    inherit;

  font-size: 10px;
}

.input {
  height: 39px;

  padding:
    0 10px;
}

textarea {
  min-height: 90px;

  padding: 10px;

  resize: vertical;
}

.input:focus,
textarea:focus {
  border-color:
    var(--primary);
}

.modal-footer {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 12px;

  padding:
    13px 18px;

  border-top:
    1px solid
    var(--border-soft);

  background:
    var(--bg-card-soft);
}

.modal-footer > span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.footer-actions {
  display: flex;

  gap: 8px;
}

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns:
      1fr;
  }

  .modal-footer {
    align-items:
      stretch;

    flex-direction:
      column;
  }
}
</style>