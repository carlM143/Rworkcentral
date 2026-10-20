<script setup lang="ts">
import {
  CircleMinus,
  CirclePlus,
  SlidersHorizontal,
  UserRound,
  X,
} from 'lucide-vue-next'

import type {
  LeaveBalance,
  LeaveCreditAdjustmentFormData,
  LeaveCreditKey,
  LeaveCreditType,
} from '~/types/leaveBalance'

const props =
  defineProps<{
    open: boolean

    balances:
      LeaveBalance[]

    selectedBalance?:
      LeaveBalance |
      null

    leaveTypes:
      LeaveCreditType[]
  }>()

const emit =
  defineEmits<{
    close: []

    save: [
      data:
        LeaveCreditAdjustmentFormData,
    ]
  }>()

const form =
  reactive<LeaveCreditAdjustmentFormData>({
    employeeId:
      0,

    leaveType:
      'Vacation Leave',

    adjustmentType:
      'Add Credits',

    days:
      1,

    reason:
      '',
  })

const creditKeys:
  Record<
    LeaveCreditType,
    LeaveCreditKey
  > = {
    'Vacation Leave':
      'vacationLeave',

    'Sick Leave':
      'sickLeave',

    'Emergency Leave':
      'emergencyLeave',

    'Special Leave':
      'specialLeave',
  }

const employeeBalance =
  computed(() => {
    return props.balances.find(
      balance =>
        balance.employeeId ===
        Number(
          form.employeeId,
        ),
    )
  })

const selectedCredit =
  computed(() => {
    if (
      !employeeBalance.value
    ) {
      return null
    }

    return employeeBalance.value[
      creditKeys[
        form.leaveType
      ]
    ]
  })

const projectedAllocated =
  computed(() => {
    if (
      !selectedCredit.value
    ) {
      return 0
    }

    if (
      form.adjustmentType ===
      'Add Credits'
    ) {
      return (
        selectedCredit.value
          .allocated +
        Number(
          form.days || 0,
        )
      )
    }

    return Math.max(
      selectedCredit.value.used,
      selectedCredit.value
        .allocated -
        Number(
          form.days || 0,
        ),
    )
  })

const projectedAvailable =
  computed(() => {
    if (
      !selectedCredit.value
    ) {
      return 0
    }

    return Math.max(
      0,
      projectedAllocated.value -
        selectedCredit.value.used,
    )
  })

const invalidDeduction =
  computed(() => {
    if (
      form.adjustmentType !==
        'Deduct Credits' ||
      !selectedCredit.value
    ) {
      return false
    }

    return (
      Number(
        form.days,
      ) >
      selectedCredit.value.available
    )
  })

const resetForm = () => {
  form.employeeId =
    props.selectedBalance
      ?.employeeId ??
    0

  form.leaveType =
    'Vacation Leave'

  form.adjustmentType =
    'Add Credits'

  form.days =
    1

  form.reason =
    ''
}

watch(
  () =>
    props.open,
  value => {
    if (value) {
      resetForm()
    }
  },
)

watch(
  () =>
    props.selectedBalance,
  () => {
    if (
      props.open
    ) {
      resetForm()
    }
  },
)

const handleSave = () => {
  if (
    !form.employeeId ||
    !form.leaveType ||
    !form.adjustmentType ||
    Number(
      form.days,
    ) <= 0 ||
    !form.reason.trim() ||
    invalidDeduction.value
  ) {
    return
  }

  emit(
    'save',
    {
      ...form,

      employeeId:
        Number(
          form.employeeId,
        ),

      days:
        Number(
          form.days,
        ),

      reason:
        form.reason.trim(),
    },
  )
}
</script>

<template>
  <Teleport to="body">

    <Transition name="modal-fade">

      <div
        v-if="open"
        class="modal-overlay"
        @click.self="
          emit('close')
        "
      >

        <article class="modal-card">

          <!-- HEADER -->

          <header class="modal-header">

            <div class="header-main">

              <div class="header-icon">

                <SlidersHorizontal
                  :size="18"
                />

              </div>

              <div>

                <h2>
                  Adjust Leave Credits
                </h2>

                <p>
                  Manually add or deduct employee leave allocation.
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

          </header>

          <div class="modal-body">

            <!-- EMPLOYEE -->

            <section class="form-section">

              <div class="section-heading">

                <UserRound
                  :size="15"
                />

                <div>

                  <h3>
                    Employee
                  </h3>

                  <p>
                    Select the employee whose leave balance will be adjusted.
                  </p>

                </div>

              </div>

              <label class="field">

                <span>
                  Employee *
                </span>

                <select
                  v-model.number="
                    form.employeeId
                  "
                >

                  <option
                    :value="0"
                    disabled
                  >
                    Select employee
                  </option>

                  <option
                    v-for="
                      balance in balances
                    "
                    :key="
                      balance.employeeId
                    "
                    :value="
                      balance.employeeId
                    "
                  >
                    {{ balance.employeeNumber }}
                    -
                    {{ balance.employeeName }}
                  </option>

                </select>

              </label>

              <div
                v-if="
                  employeeBalance
                "
                class="employee-preview"
              >

                <div class="employee-avatar">
                  {{
                    employeeBalance
                      .employeeName
                      .charAt(0)
                  }}
                </div>

                <div>

                  <strong>
                    {{ employeeBalance.employeeName }}
                  </strong>

                  <span>
                    {{ employeeBalance.employeeNumber }}
                    ·
                    {{ employeeBalance.department }}
                    ·
                    {{ employeeBalance.position }}
                  </span>

                </div>

              </div>

            </section>

            <!-- CREDIT -->

            <section class="form-section">

              <div class="section-heading">

                <SlidersHorizontal
                  :size="15"
                />

                <div>

                  <h3>
                    Credit Adjustment
                  </h3>

                  <p>
                    Select the leave type and adjustment to apply.
                  </p>

                </div>

              </div>

              <label class="field">

                <span>
                  Leave Type *
                </span>

                <select
                  v-model="
                    form.leaveType
                  "
                >

                  <option
                    v-for="
                      type in leaveTypes
                    "
                    :key="type"
                    :value="type"
                  >
                    {{ type }}
                  </option>

                </select>

              </label>

              <!-- CURRENT -->

              <div
                v-if="
                  selectedCredit
                "
                class="credit-summary"
              >

                <div>

                  <span>
                    ALLOCATED
                  </span>

                  <strong>
                    {{ selectedCredit.allocated }}
                  </strong>

                </div>

                <div>

                  <span>
                    USED
                  </span>

                  <strong>
                    {{ selectedCredit.used }}
                  </strong>

                </div>

                <div>

                  <span>
                    AVAILABLE
                  </span>

                  <strong class="green">
                    {{ selectedCredit.available }}
                  </strong>

                </div>

              </div>

              <!-- TYPE -->

              <div class="adjustment-options">

                <button
                  type="button"
                  :class="{
                    active:
                      form.adjustmentType ===
                      'Add Credits',
                  }"
                  @click="
                    form.adjustmentType =
                      'Add Credits'
                  "
                >

                  <CirclePlus
                    :size="17"
                  />

                  <div>

                    <strong>
                      Add Credits
                    </strong>

                    <span>
                      Increase allocated leave credits.
                    </span>

                  </div>

                </button>

                <button
                  type="button"
                  :class="{
                    active:
                      form.adjustmentType ===
                      'Deduct Credits',
                  }"
                  @click="
                    form.adjustmentType =
                      'Deduct Credits'
                  "
                >

                  <CircleMinus
                    :size="17"
                  />

                  <div>

                    <strong>
                      Deduct Credits
                    </strong>

                    <span>
                      Reduce available leave allocation.
                    </span>

                  </div>

                </button>

              </div>

              <label class="field">

                <span>
                  Number of Days *
                </span>

                <input
                  v-model.number="
                    form.days
                  "
                  type="number"
                  min="1"
                  step="1"
                >

              </label>

              <p
                v-if="
                  invalidDeduction
                "
                class="validation-message"
              >
                Maximum deductible amount is
                {{ selectedCredit?.available }}
                day(s).
              </p>

              <!-- PREVIEW -->

              <div
                v-if="
                  selectedCredit
                "
                class="preview-card"
              >

                <div>

                  <span>
                    CURRENT AVAILABLE
                  </span>

                  <strong>
                    {{ selectedCredit.available }}
                  </strong>

                </div>

                <div class="preview-arrow">
                  →
                </div>

                <div>

                  <span>
                    NEW AVAILABLE
                  </span>

                  <strong class="green">
                    {{ projectedAvailable }}
                  </strong>

                </div>

              </div>

              <label class="field">

                <span>
                  Reason *
                </span>

                <textarea
                  v-model="
                    form.reason
                  "
                  rows="4"
                  placeholder="Example: Annual allocation correction, HR-approved adjustment..."
                />
              </label>

            </section>

          </div>

          <footer class="modal-footer">

            <AppButton
              variant="secondary"
              @click="
                emit('close')
              "
            >
              Cancel
            </AppButton>

            <AppButton
              :icon="SlidersHorizontal"
              @click="
                handleSave
              "
            >
              Save Adjustment
            </AppButton>

          </footer>

        </article>

      </div>

    </Transition>

  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  z-index: 99990;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;

  background:
    rgba(3, 10, 24, 0.78);

  backdrop-filter:
    blur(4px);
}

.modal-card {
  width: 100%;
  max-width: 680px;

  max-height:
    calc(100vh - 40px);

  overflow-y: auto;

  border:
    1px solid var(--border);

  border-radius: 14px;

  background:
    var(--bg-card);

  box-shadow:
    0 25px 70px
    rgba(0, 0, 0, 0.3);
}

.modal-header {
  position: sticky;
  z-index: 5;
  top: 0;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 12px;

  padding:
    16px 18px;

  border-bottom:
    1px solid var(--border);

  background:
    var(--bg-card);
}

.header-main {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon {
  display: flex;

  width: 39px;
  height: 39px;

  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.modal-header h2 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 14px;
}

.modal-header p {
  margin: 3px 0 0;

  color:
    var(--text-muted);

  font-size: 8px;
}

.close-button {
  display: flex;

  width: 31px;
  height: 31px;

  align-items: center;
  justify-content: center;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    transparent;

  color:
    var(--text-secondary);

  cursor: pointer;
}

.modal-body {
  padding:
    17px 18px;
}

.form-section + .form-section {
  margin-top: 18px;
}

.section-heading {
  display: flex;

  align-items: center;

  gap: 8px;

  margin-bottom: 9px;

  color:
    var(--primary);
}

.section-heading h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 10px;
}

.section-heading p {
  margin: 2px 0 0;

  color:
    var(--text-muted);

  font-size: 7px;
}

.field {
  display: flex;

  flex-direction: column;

  gap: 5px;

  margin-top: 10px;
}

.field > span {
  color:
    var(--text-secondary);

  font-size: 8px;
  font-weight: 600;
}

.field select,
.field input,
.field textarea {
  width: 100%;

  box-sizing: border-box;

  border:
    1px solid var(--border);

  border-radius: 7px;

  outline: 0;

  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);

  font-family: inherit;

  font-size: 9px;
}

.field select,
.field input {
  height: 40px;

  padding:
    0 10px;
}

.field textarea {
  padding: 10px;

  resize: vertical;
}

.field select:focus,
.field input:focus,
.field textarea:focus {
  border-color:
    var(--primary);
}

.employee-preview {
  display: flex;

  align-items: center;

  gap: 9px;

  margin-top: 8px;

  padding: 9px;

  border:
    1px solid var(--border-soft);

  border-radius: 8px;

  background:
    var(--bg-card-soft);
}

.employee-avatar {
  display: flex;

  width: 35px;
  height: 35px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background:
    var(--primary-soft);

  color:
    var(--primary);

  font-size: 11px;
  font-weight: 700;
}

.employee-preview strong,
.employee-preview span {
  display: block;
}

.employee-preview strong {
  color:
    var(--text-primary);

  font-size: 9px;
}

.employee-preview span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 7px;
}

.credit-summary {
  display: grid;

  grid-template-columns:
    repeat(3, 1fr);

  gap: 7px;

  margin-top: 10px;
}

.credit-summary > div {
  padding: 10px;

  border:
    1px solid var(--border-soft);

  border-radius: 8px;

  background:
    var(--bg-card-soft);
}

.credit-summary span,
.credit-summary strong {
  display: block;
}

.credit-summary span {
  color:
    var(--text-muted);

  font-size: 6px;
}

.credit-summary strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 13px;
}

.green {
  color:
    var(--green) !important;
}

.adjustment-options {
  display: grid;

  grid-template-columns:
    repeat(2, 1fr);

  gap: 8px;

  margin-top: 10px;
}

.adjustment-options button {
  display: flex;

  min-height: 67px;

  align-items: flex-start;

  gap: 8px;

  padding: 10px;

  border:
    1px solid var(--border);

  border-radius: 8px;

  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);

  font-family: inherit;

  text-align: left;

  cursor: pointer;
}

.adjustment-options button.active {
  border-color:
    var(--primary);

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.adjustment-options strong,
.adjustment-options span {
  display: block;
}

.adjustment-options strong {
  color:
    var(--text-primary);

  font-size: 8px;
}

.adjustment-options span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 7px;
}

.preview-card {
  display: grid;

  grid-template-columns:
    1fr auto 1fr;

  align-items: center;

  gap: 10px;

  margin-top: 10px;

  padding: 10px;

  border:
    1px solid var(--border-soft);

  border-radius: 8px;

  background:
    var(--green-soft);
}

.preview-card span,
.preview-card strong {
  display: block;
}

.preview-card span {
  color:
    var(--text-muted);

  font-size: 6px;
}

.preview-card strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 14px;
}

.preview-arrow {
  color:
    var(--green);

  font-size: 18px;
}

.validation-message {
  margin:
    5px 0 0;

  color:
    var(--red);

  font-size: 7px;
}

.modal-footer {
  position: sticky;
  bottom: 0;

  display: flex;

  justify-content: flex-end;

  gap: 7px;

  padding:
    13px 18px;

  border-top:
    1px solid var(--border);

  background:
    var(--bg-card);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition:
    opacity 0.18s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 650px) {
  .credit-summary,
  .adjustment-options {
    grid-template-columns:
      1fr;
  }
}
</style>