<script setup lang="ts">
import {
  X,
  BadgeDollarSign,
  UserRound,
  CalendarDays,
  WalletCards,
  FileText,
  Save,
} from 'lucide-vue-next'

import type {
  PayrollPayBasis,
  PayrollRate,
  PayrollRateFormData,
  PayrollRateType,
} from '~/types/payrollRate'

interface EmployeeOption {
  id: number

  employeeNumber: string

  firstName: string
  middleName?: string
  lastName: string

  department: string
  position: string

  status: string
}

const props = defineProps<{
  open: boolean

  rate:
    PayrollRate | null

  employees:
    EmployeeOption[]

  rateTypes:
    PayrollRateType[]

  payBases:
    PayrollPayBasis[]
}>()

const emit = defineEmits<{
  close: []

  save: [
    data:
      PayrollRateFormData,
  ]
}>()

const {
  error,
} = useToast()

const form =
  reactive<PayrollRateFormData>({
    employeeId:
      null,

    rateType:
      'Employee',

    payBasis:
      'Daily',

    monthlyRate:
      null,

    dailyRate:
      null,

    hourlyRate:
      null,

    overtimeRate:
      null,

    restDayRate:
      null,

    regularHolidayRate:
      null,

    specialHolidayRate:
      null,

    nightDifferentialRate:
      null,

    tripRate:
      null,

    allowance:
      null,

    effectiveDate:
      '',

    remarks:
      '',
  })

const isEdit =
  computed(() => {
    return Boolean(
      props.rate,
    )
  })

const activeEmployees =
  computed(() => {
    return props.employees.filter(
      employee =>
        employee.status ===
        'Active',
    )
  })

const selectedEmployee =
  computed(() => {
    if (
      form.employeeId ===
      null
    ) {
      return null
    }

    return props.employees.find(
      employee =>
        employee.id ===
        form.employeeId,
    ) ?? null
  })

const employeeName = (
  employee:
    EmployeeOption,
) => {
  return [
    employee.firstName,
    employee.middleName,
    employee.lastName,
  ]
    .filter(Boolean)
    .join(' ')
}

const resetForm = () => {
  form.employeeId =
    null

  form.rateType =
    'Employee'

  form.payBasis =
    'Daily'

  form.monthlyRate =
    null

  form.dailyRate =
    null

  form.hourlyRate =
    null

  form.overtimeRate =
    null

  form.restDayRate =
    null

  form.regularHolidayRate =
    null

  form.specialHolidayRate =
    null

  form.nightDifferentialRate =
    null

  form.tripRate =
    null

  form.allowance =
    null

  form.effectiveDate =
    new Date()
      .toLocaleDateString(
        'en-CA',
      )

  form.remarks =
    ''
}

const loadRate = () => {
  if (!props.rate) {
    resetForm()

    return
  }

  form.employeeId =
    props.rate.employeeId

  form.rateType =
    props.rate.rateType

  form.payBasis =
    props.rate.payBasis

  form.monthlyRate =
    props.rate.monthlyRate ??
    null

  form.dailyRate =
    props.rate.dailyRate ??
    null

  form.hourlyRate =
    props.rate.hourlyRate ??
    null

  form.overtimeRate =
    props.rate.overtimeRate ??
    null

  form.restDayRate =
    props.rate.restDayRate ??
    null

  form.regularHolidayRate =
    props.rate.regularHolidayRate ??
    null

  form.specialHolidayRate =
    props.rate.specialHolidayRate ??
    null

  form.nightDifferentialRate =
    props.rate.nightDifferentialRate ??
    null

  form.tripRate =
    props.rate.tripRate ??
    null

  form.allowance =
    props.rate.allowance ??
    null

  form.effectiveDate =
    props.rate.effectiveDate

  form.remarks =
    props.rate.remarks ??
    ''
}

watch(
  [
    () => props.open,
    () => props.rate?.id,
  ],
  () => {
    if (props.open) {
      loadRate()
    }
  },
  {
    immediate: true,
  },
)

watch(
  () => form.rateType,
  value => {
    if (
      value !==
      'Driver'
    ) {
      form.tripRate =
        null
    }
  },
)

const handleSave = () => {
  if (
    form.employeeId ===
    null
  ) {
    error(
      'Employee Required',
      'Please select an employee.',
    )

    return
  }

  if (
    !form.effectiveDate
  ) {
    error(
      'Effective Date Required',
      'Please select the effective date.',
    )

    return
  }

  if (
    form.payBasis ===
      'Monthly' &&
    !form.monthlyRate
  ) {
    error(
      'Monthly Rate Required',
      'Please enter the monthly rate.',
    )

    return
  }

  if (
    form.payBasis ===
      'Daily' &&
    !form.dailyRate
  ) {
    error(
      'Daily Rate Required',
      'Please enter the daily rate.',
    )

    return
  }

  if (
    form.payBasis ===
      'Hourly' &&
    !form.hourlyRate
  ) {
    error(
      'Hourly Rate Required',
      'Please enter the hourly rate.',
    )

    return
  }

  if (
    form.payBasis ===
      'Trip Based' &&
    (
      !form.dailyRate ||
      !form.tripRate
    )
  ) {
    error(
      'Driver Rate Required',
      'Please enter both the daily rate and trip rate.',
    )

    return
  }

  emit('save', {
    employeeId:
      form.employeeId,

    rateType:
      form.rateType,

    payBasis:
      form.payBasis,

    monthlyRate:
      form.monthlyRate,

    dailyRate:
      form.dailyRate,

    hourlyRate:
      form.hourlyRate,

    overtimeRate:
      form.overtimeRate,

    restDayRate:
      form.restDayRate,

    regularHolidayRate:
      form.regularHolidayRate,

    specialHolidayRate:
      form.specialHolidayRate,

    nightDifferentialRate:
      form.nightDifferentialRate,

    tripRate:
      form.tripRate,

    allowance:
      form.allowance,

    effectiveDate:
      form.effectiveDate,

    remarks:
      form.remarks.trim(),
  })
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

          <!-- HEADER -->

          <div class="modal-header">

            <div class="header-left">

              <div class="header-icon">
                <BadgeDollarSign :size="20" />
              </div>

              <div>

                <h2>
                  {{
                    isEdit
                      ? 'Edit Payroll Rate'
                      : 'Add Payroll Rate'
                  }}
                </h2>

                <p>
                  Configure employee compensation
                  and payroll premium rates.
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

            <!-- RATE INFORMATION -->

            <section class="section-card">

              <div class="section-heading">

                <UserRound :size="16" />

                <div>

                  <h3>
                    Rate Information
                  </h3>

                  <p>
                    Select employee, rate type and pay basis.
                  </p>

                </div>

              </div>

              <div class="form-grid">

                <div class="field-group full">

                  <label>
                    Employee
                    <span>*</span>
                  </label>

                  <select
                    v-model.number="
                      form.employeeId
                    "
                    class="native-input"
                  >

                    <option
                      :value="null"
                      disabled
                    >
                      Select Employee
                    </option>

                    <option
                      v-for="
                        employee in
                        activeEmployees
                      "
                      :key="
                        employee.id
                      "
                      :value="
                        employee.id
                      "
                    >
                      {{
                        employeeName(
                          employee,
                        )
                      }}
                      -
                      {{
                        employee.employeeNumber
                      }}
                    </option>

                  </select>

                </div>

                <div class="field-group">

                  <label>
                    Rate Type
                    <span>*</span>
                  </label>

                  <select
                    v-model="
                      form.rateType
                    "
                    class="native-input"
                  >

                    <option
                      v-for="
                        type in
                        rateTypes
                      "
                      :key="type"
                      :value="type"
                    >
                      {{ type }}
                    </option>

                  </select>

                </div>

                <div class="field-group">

                  <label>
                    Pay Basis
                    <span>*</span>
                  </label>

                  <select
                    v-model="
                      form.payBasis
                    "
                    class="native-input"
                  >

                    <option
                      v-for="
                        basis in
                        payBases
                      "
                      :key="basis"
                      :value="basis"
                    >
                      {{ basis }}
                    </option>

                  </select>

                </div>

              </div>

              <div
                v-if="
                  selectedEmployee
                "
                class="employee-preview"
              >

                <div>
                  <span>
                    Department
                  </span>

                  <strong>
                    {{
                      selectedEmployee.department
                    }}
                  </strong>
                </div>

                <div>
                  <span>
                    Position
                  </span>

                  <strong>
                    {{
                      selectedEmployee.position
                    }}
                  </strong>
                </div>

              </div>

            </section>

            <!-- BASIC -->

            <section class="section-card">

              <div class="section-heading">

                <WalletCards :size="16" />

                <div>

                  <h3>
                    Basic Compensation
                  </h3>

                  <p>
                    Enter the employee's base payroll rates.
                  </p>

                </div>

              </div>

              <div class="form-grid three">

                <div class="field-group">

                  <label>
                    Monthly Rate
                  </label>

                  <input
                    v-model.number="
                      form.monthlyRate
                    "
                    type="number"
                    min="0"
                    step="0.01"
                    class="native-input"
                    placeholder="0.00"
                  >

                </div>

                <div class="field-group">

                  <label>
                    Daily Rate
                  </label>

                  <input
                    v-model.number="
                      form.dailyRate
                    "
                    type="number"
                    min="0"
                    step="0.01"
                    class="native-input"
                    placeholder="0.00"
                  >

                </div>

                <div class="field-group">

                  <label>
                    Hourly Rate
                  </label>

                  <input
                    v-model.number="
                      form.hourlyRate
                    "
                    type="number"
                    min="0"
                    step="0.01"
                    class="native-input"
                    placeholder="0.00"
                  >

                </div>

              </div>

            </section>

            <!-- PREMIUM -->

            <section class="section-card">

              <div class="section-heading">

                <BadgeDollarSign :size="16" />

                <div>

                  <h3>
                    Premium Rates
                  </h3>

                  <p>
                    Configure overtime, rest day,
                    holiday and night differential rates.
                  </p>

                </div>

              </div>

              <div class="form-grid three">

                <div class="field-group">

                  <label>
                    OT Rate
                  </label>

                  <input
                    v-model.number="
                      form.overtimeRate
                    "
                    type="number"
                    min="0"
                    step="0.01"
                    class="native-input"
                    placeholder="0.00"
                  >

                </div>

                <div class="field-group">

                  <label>
                    Rest Day Rate
                  </label>

                  <input
                    v-model.number="
                      form.restDayRate
                    "
                    type="number"
                    min="0"
                    step="0.01"
                    class="native-input"
                    placeholder="0.00"
                  >

                </div>

                <div class="field-group">

                  <label>
                    Regular Holiday Rate
                  </label>

                  <input
                    v-model.number="
                      form.regularHolidayRate
                    "
                    type="number"
                    min="0"
                    step="0.01"
                    class="native-input"
                    placeholder="0.00"
                  >

                </div>

                <div class="field-group">

                  <label>
                    Special Holiday Rate
                  </label>

                  <input
                    v-model.number="
                      form.specialHolidayRate
                    "
                    type="number"
                    min="0"
                    step="0.01"
                    class="native-input"
                    placeholder="0.00"
                  >

                </div>

                <div class="field-group">

                  <label>
                    Night Differential
                  </label>

                  <input
                    v-model.number="
                      form.nightDifferentialRate
                    "
                    type="number"
                    min="0"
                    step="0.01"
                    class="native-input"
                    placeholder="0.00"
                  >

                </div>

                <div class="field-group">

                  <label>
                    Allowance
                  </label>

                  <input
                    v-model.number="
                      form.allowance
                    "
                    type="number"
                    min="0"
                    step="0.01"
                    class="native-input"
                    placeholder="0.00"
                  >

                </div>

              </div>

            </section>

            <!-- DRIVER -->

            <section
              v-if="
                form.rateType ===
                'Driver'
              "
              class="section-card"
            >

              <div class="section-heading">

                <BadgeDollarSign :size="16" />

                <div>

                  <h3>
                    Driver Rate
                  </h3>

                  <p>
                    Additional compensation for completed trips.
                  </p>

                </div>

              </div>

              <div class="field-group">

                <label>
                  Trip Rate
                  <span
                    v-if="
                      form.payBasis ===
                      'Trip Based'
                    "
                  >
                    *
                  </span>
                </label>

                <input
                  v-model.number="
                    form.tripRate
                  "
                  type="number"
                  min="0"
                  step="0.01"
                  class="native-input"
                  placeholder="0.00"
                >

              </div>

            </section>

            <!-- EFFECTIVE -->

            <section class="section-card">

              <div class="section-heading">

                <CalendarDays :size="16" />

                <div>

                  <h3>
                    Effective Date
                  </h3>

                  <p>
                    Define when the payroll rate becomes effective.
                  </p>

                </div>

              </div>

              <div class="field-group">

                <label>
                  Effective Date
                  <span>*</span>
                </label>

                <input
                  v-model="
                    form.effectiveDate
                  "
                  type="date"
                  class="native-input"
                >

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
                    Optional notes about this rate profile.
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
              Future effective dates will
              automatically use Scheduled status.
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
                    : 'Save Rate'
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
  max-width: 900px;

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
    var(--green-soft);

  color:
    var(--green);
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
}

.form-grid.three {
  grid-template-columns:
    repeat(
      3,
      minmax(0, 1fr)
    );
}

.field-group.full {
  grid-column:
    1 / -1;
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

.native-input,
textarea {
  width: 100%;

  border:
    1px solid var(--border);

  border-radius: 7px;

  outline: none;

  background:
    var(--bg-card);

  color:
    var(--text-primary);

  font-family: inherit;

  font-size: 10px;
}

.native-input {
  height: 39px;

  padding:
    0 10px;
}

textarea {
  min-height: 90px;

  padding: 10px;

  resize: vertical;
}

.native-input:focus,
textarea:focus {
  border-color:
    var(--primary);
}

.employee-preview {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 8px;

  margin-top: 10px;
}

.employee-preview > div {
  padding: 9px;

  border:
    1px solid var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card);
}

.employee-preview span,
.employee-preview strong {
  display: block;
}

.employee-preview span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.employee-preview strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 9px;
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

  align-items: center;

  gap: 8px;
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

@media (max-width: 760px) {
  .form-grid,
  .form-grid.three,
  .employee-preview {
    grid-template-columns:
      1fr;
  }

  .field-group.full {
    grid-column:
      auto;
  }

  .modal-footer {
    align-items:
      stretch;

    flex-direction:
      column;
  }

  .footer-actions {
    justify-content:
      flex-end;
  }
}
</style>