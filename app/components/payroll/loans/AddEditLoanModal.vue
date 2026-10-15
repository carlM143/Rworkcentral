<script setup lang="ts">
import {
  X,
  WalletCards,
  UserRound,
  BadgeDollarSign,
  CalendarDays,
  FileText,
  Paperclip,
  Save,
} from 'lucide-vue-next'

import type {
  LoanFormData,
  LoanRecord,
  LoanType,
} from '~/types/loan'

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

const props =
  defineProps<{
    open: boolean

    loan:
      LoanRecord | null

    employees:
      EmployeeOption[]

    loanTypes:
      LoanType[]
  }>()

const emit =
  defineEmits<{
    close: []

    save: [
      data:
        LoanFormData,
    ]
  }>()

const {
  error,
} = useToast()

const form =
  reactive<LoanFormData>({
    employeeId:
      null,

    loanType:
      'Salary Loan',

    principalAmount:
      null,

    monthlyDeduction:
      null,

    startDate:
      '',

    endDate:
      '',

    remarks:
      '',

    attachmentName:
      '',
  })

const fileKey =
  ref(0)

const isEdit =
  computed(() => {
    return Boolean(
      props.loan,
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

const estimatedMonths =
  computed(() => {
    if (
      !form.principalAmount ||
      !form.monthlyDeduction
    ) {
      return 0
    }

    return Math.ceil(
      form.principalAmount /
        form.monthlyDeduction,
    )
  })

const resetForm = () => {
  form.employeeId =
    null

  form.loanType =
    'Salary Loan'

  form.principalAmount =
    null

  form.monthlyDeduction =
    null

  form.startDate =
    ''

  form.endDate =
    ''

  form.remarks =
    ''

  form.attachmentName =
    ''

  fileKey.value++
}

const loadLoan = () => {
  if (!props.loan) {
    resetForm()

    return
  }

  form.employeeId =
    props.loan.employeeId

  form.loanType =
    props.loan.loanType

  form.principalAmount =
    props.loan.principalAmount

  form.monthlyDeduction =
    props.loan.monthlyDeduction

  form.startDate =
    props.loan.startDate

  form.endDate =
    props.loan.endDate

  form.remarks =
    props.loan.remarks ??
    ''

  form.attachmentName =
    props.loan
      .attachment
      ?.name ??
    ''
}

watch(
  [
    () => props.open,
    () => props.loan?.id,
  ],
  () => {
    if (props.open) {
      loadLoan()
    }
  },
  {
    immediate: true,
  },
)

const handleFile = (
  event: Event,
) => {
  const input =
    event.target as HTMLInputElement

  form.attachmentName =
    input.files?.[0]
      ?.name ??
    ''
}

const removeFile = () => {
  form.attachmentName =
    ''

  fileKey.value++
}

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
    !form.principalAmount ||
    form.principalAmount <= 0
  ) {
    error(
      'Principal Amount Required',
      'Please enter a valid loan amount.',
    )

    return
  }

  if (
    !form.monthlyDeduction ||
    form.monthlyDeduction <= 0
  ) {
    error(
      'Monthly Deduction Required',
      'Please enter the payroll deduction amount.',
    )

    return
  }

  if (
    form.monthlyDeduction >
    form.principalAmount
  ) {
    error(
      'Invalid Deduction',
      'Monthly deduction cannot be greater than the principal amount.',
    )

    return
  }

  if (
    !form.startDate ||
    !form.endDate
  ) {
    error(
      'Loan Dates Required',
      'Please provide the loan start and end dates.',
    )

    return
  }

  if (
    form.endDate <
    form.startDate
  ) {
    error(
      'Invalid Date Range',
      'End date cannot be earlier than the start date.',
    )

    return
  }

  emit('save', {
    ...form,

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

          <div class="modal-header">

            <div class="header-left">

              <div class="header-icon">
                <WalletCards :size="20" />
              </div>

              <div>

                <h2>
                  {{
                    isEdit
                      ? 'Edit Loan'
                      : 'Add Loan'
                  }}
                </h2>

                <p>
                  Configure employee loan
                  and payroll deduction information.
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

            <!-- EMPLOYEE -->

            <section class="section-card">

              <div class="section-heading">

                <UserRound :size="16" />

                <div>

                  <h3>
                    Employee Information
                  </h3>

                  <p>
                    Select the employee receiving the loan.
                  </p>

                </div>

              </div>

              <div class="field">

                <label>
                  Employee *
                </label>

                <select
                  v-model.number="
                    form.employeeId
                  "
                  class="input"
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

            <!-- LOAN INFO -->

            <section class="section-card">

              <div class="section-heading">

                <BadgeDollarSign :size="16" />

                <div>

                  <h3>
                    Loan Information
                  </h3>

                  <p>
                    Enter the principal and payroll deduction.
                  </p>

                </div>

              </div>

              <div class="form-grid">

                <div class="field">

                  <label>
                    Loan Type *
                  </label>

                  <select
                    v-model="
                      form.loanType
                    "
                    class="input"
                  >

                    <option
                      v-for="
                        type in
                        loanTypes
                      "
                      :key="type"
                      :value="type"
                    >
                      {{ type }}
                    </option>

                  </select>

                </div>

                <div class="field">

                  <label>
                    Principal Amount *
                  </label>

                  <input
                    v-model.number="
                      form.principalAmount
                    "
                    type="number"
                    min="0"
                    class="input"
                    placeholder="0.00"
                  >

                </div>

                <div class="field">

                  <label>
                    Monthly Deduction *
                  </label>

                  <input
                    v-model.number="
                      form.monthlyDeduction
                    "
                    type="number"
                    min="0"
                    class="input"
                    placeholder="0.00"
                  >

                </div>

                <div class="estimate">

                  <span>
                    Estimated Duration
                  </span>

                  <strong>
                    {{
                      estimatedMonths ||
                      0
                    }}
                    month(s)
                  </strong>

                </div>

              </div>

            </section>

            <!-- DATES -->

            <section class="section-card">

              <div class="section-heading">

                <CalendarDays :size="16" />

                <div>

                  <h3>
                    Loan Period
                  </h3>

                  <p>
                    Define when deductions begin and end.
                  </p>

                </div>

              </div>

              <div class="form-grid">

                <div class="field">

                  <label>
                    Start Date *
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
                    End Date *
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

            <!-- REMARKS -->

            <section class="section-card">

              <div class="section-heading">

                <FileText :size="16" />

                <div>

                  <h3>
                    Remarks
                  </h3>

                  <p>
                    Add optional notes for this loan.
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

            <!-- ATTACHMENT -->

            <section class="section-card">

              <div class="section-heading">

                <Paperclip :size="16" />

                <div>

                  <h3>
                    Attachment
                  </h3>

                  <p>
                    Optional supporting document.
                  </p>

                </div>

              </div>

              <label
                v-if="
                  !form.attachmentName
                "
                class="upload"
              >

                <Paperclip :size="20" />

                <strong>
                  Upload Document
                </strong>

                <span>
                  PDF, JPG or PNG
                </span>

                <input
                  :key="fileKey"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  @change="
                    handleFile
                  "
                >

              </label>

              <div
                v-else
                class="file-row"
              >

                <Paperclip :size="17" />

                <strong>
                  {{
                    form.attachmentName
                  }}
                </strong>

                <button
                  @click="
                    removeFile
                  "
                >
                  <X :size="14" />
                </button>

              </div>

            </section>

          </div>

          <div class="modal-footer">

            <span>
              New loans will be submitted as Pending.
            </span>

            <div>

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
                    : 'Save Loan'
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
  max-width: 850px;

  max-height:
    calc(100vh - 40px);

  flex-direction: column;

  overflow: hidden;

  border:
    1px solid var(--border);

  border-radius: 13px;

  background:
    var(--bg-card);
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
    var(--purple-soft);

  color:
    var(--purple);
}

.modal-header h2 {
  margin: 0;

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

.form-grid,
.employee-preview {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 9px;
}

.field label {
  display: block;

  margin-bottom: 6px;

  color:
    var(--text-primary);

  font-size: 9px;
  font-weight: 600;
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
  padding: 10px;

  resize: vertical;
}

.input:focus,
textarea:focus {
  border-color:
    var(--primary);
}

.employee-preview {
  margin-top: 9px;
}

.employee-preview > div,
.estimate {
  padding: 9px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card);
}

.employee-preview span,
.employee-preview strong,
.estimate span,
.estimate strong {
  display: block;
}

.employee-preview span,
.estimate span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.employee-preview strong,
.estimate strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 9px;
}

.estimate strong {
  color:
    var(--primary);
}

.upload {
  display: flex;

  min-height: 100px;

  flex-direction: column;

  align-items: center;
  justify-content: center;

  gap: 5px;

  border:
    1px dashed var(--border);

  border-radius: 8px;

  background:
    var(--bg-card);

  color:
    var(--primary);

  cursor: pointer;
}

.upload input {
  display: none;
}

.upload strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.upload span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.file-row {
  display: flex;

  align-items: center;

  gap: 8px;

  padding: 10px;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    var(--bg-card);

  color:
    var(--primary);
}

.file-row strong {
  flex: 1;

  color:
    var(--text-primary);

  font-size: 9px;
}

.file-row button {
  display: flex;

  width: 29px;
  height: 29px;

  align-items: center;
  justify-content: center;

  border:
    1px solid var(--border);

  border-radius: 6px;

  background:
    transparent;

  color:
    var(--text-muted);
}

.modal-footer {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 10px;

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

.modal-footer > div {
  display: flex;

  gap: 8px;
}

@media (max-width: 650px) {
  .form-grid,
  .employee-preview {
    grid-template-columns:
      1fr;
  }
}
</style>