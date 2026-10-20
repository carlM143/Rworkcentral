<script setup lang="ts">
import {
  CalendarDays,
  FilePlus2,
  Save,
  UserRound,
  X,
} from 'lucide-vue-next'

import type {
  Employee,
} from '~/types/employee'

import type {
  LeaveRequestFormData,
  LeaveTypeName,
} from '~/types/leave'

const props =
  defineProps<{
    open: boolean

    employees:
      Employee[]

    leaveTypes:
      LeaveTypeName[]
  }>()

const emit =
  defineEmits<{
    close: []

    save: [
      data:
        LeaveRequestFormData,
    ]
  }>()

const form =
  reactive<LeaveRequestFormData>({
    employeeId:
      0,

    leaveType:
      'Vacation Leave',

    dateFrom:
      '',

    dateTo:
      '',

    days:
      0,

    reason:
      '',
  })

const selectedEmployee =
  computed(() => {
    return props.employees.find(
      employee =>
        employee.id ===
        Number(
          form.employeeId,
        ),
    )
  })

const calculateDays = () => {
  if (
    !form.dateFrom ||
    !form.dateTo
  ) {
    form.days =
      0

    return
  }

  const start =
    new Date(
      `${form.dateFrom}T00:00:00`,
    )

  const end =
    new Date(
      `${form.dateTo}T00:00:00`,
    )

  if (
    end < start
  ) {
    form.days =
      0

    return
  }

  const diff =
    end.getTime() -
    start.getTime()

  form.days =
    Math.floor(
      diff /
        86400000,
    ) + 1
}

watch(
  [
    () =>
      form.dateFrom,

    () =>
      form.dateTo,
  ],
  calculateDays,
)

const resetForm = () => {
  form.employeeId =
    0

  form.leaveType =
    props.leaveTypes[0] ??
    'Vacation Leave'

  form.dateFrom =
    ''

  form.dateTo =
    ''

  form.days =
    0

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

const handleSubmit = () => {
  if (
    !form.employeeId ||
    !form.leaveType ||
    !form.dateFrom ||
    !form.dateTo ||
    form.days <= 0
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

      reason:
        form.reason?.trim() ||
        undefined,
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

          <header class="modal-header">

            <div class="header-main">

              <div class="header-icon">

                <FilePlus2
                  :size="18"
                />

              </div>

              <div>

                <h2>
                  File Leave Request
                </h2>

                <p>
                  Create an employee leave request for approval.
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
                    Employee Information
                  </h3>

                  <p>
                    Select the employee filing the leave.
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
                      employee in employees
                    "
                    :key="
                      employee.id
                    "
                    :value="
                      employee.id
                    "
                  >
                    {{ employee.employeeNumber }}
                    -
                    {{ employee.firstName }}
                    {{ employee.lastName }}
                  </option>

                </select>

              </label>

              <div
                v-if="
                  selectedEmployee
                "
                class="employee-preview"
              >

                <div class="employee-icon">

                  <UserRound
                    :size="16"
                  />

                </div>

                <div>

                  <strong>
                    {{ selectedEmployee.firstName }}
                    {{ selectedEmployee.lastName }}
                  </strong>

                  <span>
                    {{ selectedEmployee.employeeNumber }}
                    ·
                    {{ selectedEmployee.department }}
                    ·
                    {{ selectedEmployee.position }}
                  </span>

                </div>

              </div>

            </section>

            <!-- LEAVE -->

            <section class="form-section">

              <div class="section-heading">

                <CalendarDays
                  :size="15"
                />

                <div>

                  <h3>
                    Leave Information
                  </h3>

                  <p>
                    Select leave type and requested dates.
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
                    :key="
                      type
                    "
                    :value="
                      type
                    "
                  >
                    {{ type }}
                  </option>

                </select>

              </label>

              <div class="date-grid">

                <label class="field">

                  <span>
                    From *
                  </span>

                  <input
                    v-model="
                      form.dateFrom
                    "
                    type="date"
                  >

                </label>

                <label class="field">

                  <span>
                    To *
                  </span>

                  <input
                    v-model="
                      form.dateTo
                    "
                    type="date"
                    :min="
                      form.dateFrom ||
                      undefined
                    "
                  >

                </label>

              </div>

              <div class="days-card">

                <span>
                  REQUESTED LEAVE
                </span>

                <strong>
                  {{ form.days }}
                  day<span
                    v-if="
                      form.days !== 1
                    "
                  >s</span>
                </strong>

                <small>
                  UI preview only. Final payable/working-day computation will follow company leave policy.
                </small>

              </div>

              <label class="field reason-field">

                <span>
                  Reason
                </span>

                <textarea
                  v-model="
                    form.reason
                  "
                  rows="4"
                  placeholder="Enter reason for leave..."
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
              :icon="Save"
              @click="
                handleSubmit
              "
            >
              Submit Request
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

  flex-shrink: 0;

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
  margin:
    3px 0 0;

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
  margin:
    2px 0 0;

  color:
    var(--text-muted);

  font-size: 7px;
}

.field {
  display: flex;

  flex-direction: column;

  gap: 5px;
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
  box-sizing: border-box;

  width: 100%;

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

.employee-icon {
  display: flex;

  width: 34px;
  height: 34px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
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

.date-grid {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 10px;

  margin-top: 10px;
}

.days-card {
  margin-top: 10px;

  padding: 11px;

  border:
    1px solid var(--border-soft);

  border-radius: 8px;

  background:
    var(--green-soft);
}

.days-card span,
.days-card strong,
.days-card small {
  display: block;
}

.days-card span {
  color:
    var(--green);

  font-size: 6px;
  font-weight: 700;
}

.days-card strong {
  margin-top: 3px;

  color:
    var(--green);

  font-size: 14px;
}

.days-card small {
  margin-top: 4px;

  color:
    var(--text-secondary);

  font-size: 7px;
}

.reason-field {
  margin-top: 10px;
}

.modal-footer {
  position: sticky;
  z-index: 5;
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
  .date-grid {
    grid-template-columns:
      1fr;
  }
}
</style>