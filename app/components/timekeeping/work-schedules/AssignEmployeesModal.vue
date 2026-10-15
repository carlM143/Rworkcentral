<script setup lang="ts">
import {
  X,
  Users,
  CalendarDays,
  Building2,
  BriefcaseBusiness,
  Check,
  Clock3,
} from 'lucide-vue-next'

import type {
  Employee,
} from '~/types/employee'

import type {
  WorkSchedule,
} from '~/types/workSchedule'

const props = defineProps<{
  open: boolean

  employees: Employee[]

  schedules: WorkSchedule[]

  assignments: Record<
    number,
    number | null
  >
}>()

const emit = defineEmits<{
  close: []

  save: [
    data: {
      scheduleId: number
      employeeIds: number[]
      effectiveDate: string
    },
  ]
}>()

const {
  error,
} = useToast()

/* =========================================================
   STATE
========================================================= */

const search = ref('')

const department = ref('')

const selectedScheduleId =
  ref<number | null>(null)

const effectiveDate =
  ref('')

const selectedEmployeeIds =
  ref<number[]>([])

/* =========================================================
   HELPERS
========================================================= */

const getToday = () => {
  const now =
    new Date()

  const local =
    new Date(
      now.getTime() -
      now.getTimezoneOffset() *
        60000,
    )

  return local
    .toISOString()
    .slice(0, 10)
}

const getFullName = (
  employee: Employee,
) => {
  return [
    employee.firstName,
    employee.middleName,
    employee.lastName,
  ]
    .filter(Boolean)
    .join(' ')
}

const getInitials = (
  employee: Employee,
) => {
  return `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`
    .toUpperCase()
}

const getScheduleName = (
  scheduleId?: number | null,
) => {
  if (!scheduleId) {
    return 'Not assigned'
  }

  return (
    props.schedules.find(
      schedule =>
        schedule.id === scheduleId,
    )?.name ??
    'Not assigned'
  )
}

const getEmployeeSchedule = (
  employeeId: number,
) => {
  return getScheduleName(
    props.assignments[
      employeeId
    ],
  )
}

/* =========================================================
   OPTIONS
========================================================= */

const departments =
  computed(() => {
    return [
      ...new Set(
        props.employees.map(
          employee =>
            employee.department,
        ),
      ),
    ].sort()
  })

const activeSchedules =
  computed(() => {
    return props.schedules.filter(
      schedule =>
        schedule.status ===
        'Active',
    )
  })

/* =========================================================
   SELECTED SCHEDULE
========================================================= */

const selectedSchedule =
  computed(() => {
    if (
      selectedScheduleId.value ===
      null
    ) {
      return undefined
    }

    return props.schedules.find(
      schedule =>
        schedule.id ===
        selectedScheduleId.value,
    )
  })

/* =========================================================
   FILTER EMPLOYEES
========================================================= */

const filteredEmployees =
  computed(() => {
    const keyword =
      search.value
        .trim()
        .toLowerCase()

    return props.employees.filter(
      employee => {
        const fullName =
          getFullName(
            employee,
          ).toLowerCase()

        const matchesSearch =
          !keyword ||
          fullName.includes(
            keyword,
          ) ||
          employee.employeeNumber
            .toLowerCase()
            .includes(
              keyword,
            ) ||
          employee.email
            .toLowerCase()
            .includes(
              keyword,
            ) ||
          employee.position
            .toLowerCase()
            .includes(
              keyword,
            )

        const matchesDepartment =
          !department.value ||
          employee.department ===
            department.value

        return (
          matchesSearch &&
          matchesDepartment &&
          employee.status ===
            'Active'
        )
      },
    )
  })

/* =========================================================
   ASSIGNMENT STATUS
========================================================= */

const isAlreadyAssigned = (
  employeeId: number,
) => {
  if (
    selectedScheduleId.value ===
    null
  ) {
    return false
  }

  return (
    props.assignments[
      employeeId
    ] ===
    selectedScheduleId.value
  )
}

const isSelected = (
  employeeId: number,
) => {
  return selectedEmployeeIds.value.includes(
    employeeId,
  )
}

/* =========================================================
   SELECT EMPLOYEE
========================================================= */

const toggleEmployee = (
  employeeId: number,
) => {
  if (
    isAlreadyAssigned(
      employeeId,
    )
  ) {
    return
  }

  if (
    selectedEmployeeIds.value.includes(
      employeeId,
    )
  ) {
    selectedEmployeeIds.value =
      selectedEmployeeIds.value.filter(
        id =>
          id !== employeeId,
      )

    return
  }

  selectedEmployeeIds.value.push(
    employeeId,
  )
}

/* =========================================================
   SELECT ALL
========================================================= */

const selectableFilteredEmployees =
  computed(() => {
    return filteredEmployees.value.filter(
      employee =>
        !isAlreadyAssigned(
          employee.id,
        ),
    )
  })

const allFilteredSelected =
  computed(() => {
    if (
      !selectableFilteredEmployees
        .value.length
    ) {
      return false
    }

    return selectableFilteredEmployees
      .value.every(
        employee =>
          selectedEmployeeIds
            .value
            .includes(
              employee.id,
            ),
      )
  })

const toggleSelectAll = () => {
  const ids =
    selectableFilteredEmployees
      .value.map(
        employee =>
          employee.id,
      )

  if (
    allFilteredSelected.value
  ) {
    selectedEmployeeIds.value =
      selectedEmployeeIds.value.filter(
        id =>
          !ids.includes(id),
      )

    return
  }

  selectedEmployeeIds.value = [
    ...new Set([
      ...selectedEmployeeIds.value,
      ...ids,
    ]),
  ]
}

/* =========================================================
   RESET
========================================================= */

const resetModal = () => {
  search.value = ''

  department.value = ''

  selectedEmployeeIds.value =
    []

  effectiveDate.value =
    getToday()

  selectedScheduleId.value =
    activeSchedules.value[0]
      ?.id ?? null
}

watch(
  () => props.open,
  value => {
    if (value) {
      resetModal()
    }
  },
)

watch(
  selectedScheduleId,
  () => {
    selectedEmployeeIds.value =
      selectedEmployeeIds.value.filter(
        employeeId =>
          !isAlreadyAssigned(
            employeeId,
          ),
      )
  },
)

/* =========================================================
   CLOSE
========================================================= */

const handleClose = () => {
  emit('close')
}

/* =========================================================
   SAVE
========================================================= */

const handleSave = () => {
  if (
    selectedScheduleId.value ===
    null
  ) {
    error(
      'Schedule Required',
      'Please select a work schedule.',
    )

    return
  }

  if (!effectiveDate.value) {
    error(
      'Effective Date Required',
      'Please select an effective date.',
    )

    return
  }

  if (
    !selectedEmployeeIds
      .value.length
  ) {
    error(
      'Select Employees',
      'Please select at least one employee.',
    )

    return
  }

  emit('save', {
    scheduleId:
      selectedScheduleId.value,

    employeeIds: [
      ...selectedEmployeeIds.value,
    ],

    effectiveDate:
      effectiveDate.value,
  })
}
</script>

<template>
  <Teleport to="body">

    <Transition name="modal">

      <div
        v-if="open"
        class="modal-backdrop"
        @click.self="handleClose"
      >

        <div class="modal-card">

          <!-- HEADER -->

          <div class="modal-header">

            <div class="header-left">

              <div class="header-icon">
                <Users :size="20" />
              </div>

              <div>
                <h2>
                  Assign Employees
                </h2>

                <p>
                  Assign one or more employees
                  to a work schedule.
                </p>
              </div>

            </div>

            <button
              type="button"
              class="close-button"
              @click="handleClose"
            >
              <X :size="18" />
            </button>

          </div>

          <!-- BODY -->

          <div class="modal-body">

            <!-- ASSIGNMENT SETTINGS -->

            <section class="form-section">

              <div class="section-heading">

                <div class="section-icon blue">
                  <Clock3 :size="17" />
                </div>

                <div>
                  <h3>
                    Schedule Assignment
                  </h3>

                  <p>
                    Select the target schedule
                    and effective date.
                  </p>
                </div>

              </div>

              <div class="assignment-grid">

                <div class="field-group">

                  <label>
                    Work Schedule
                    <span>*</span>
                  </label>

                  <select
                    v-model.number="
                      selectedScheduleId
                    "
                    class="native-select"
                  >
                    <option
                      :value="null"
                      disabled
                    >
                      Select schedule
                    </option>

                    <option
                      v-for="schedule in activeSchedules"
                      :key="schedule.id"
                      :value="schedule.id"
                    >
                      {{ schedule.name }}
                      ·
                      {{ schedule.code }}
                    </option>
                  </select>

                </div>

                <div class="field-group">

                  <label>
                    Effective Date
                    <span>*</span>
                  </label>

                  <div class="date-field">

                    <CalendarDays
                      :size="15"
                    />

                    <input
                      v-model="
                        effectiveDate
                      "
                      type="date"
                    >

                  </div>

                </div>

              </div>

              <div
                v-if="selectedSchedule"
                class="schedule-preview"
              >

                <div>

                  <span>
                    Selected Schedule
                  </span>

                  <strong>
                    {{
                      selectedSchedule.name
                    }}
                  </strong>

                </div>

                <div>

                  <span>
                    Working Hours
                  </span>

                  <strong>
                    <template
                      v-if="
                        selectedSchedule.timeIn &&
                        selectedSchedule.timeOut
                      "
                    >
                      {{
                        selectedSchedule.timeIn
                      }}
                      -
                      {{
                        selectedSchedule.timeOut
                      }}
                    </template>

                    <template v-else>
                      Flexible
                    </template>
                  </strong>

                </div>

                <div>

                  <span>
                    Rest Day
                  </span>

                  <strong>
                    {{
                      selectedSchedule.restDays.join(
                        ', ',
                      )
                    }}
                  </strong>

                </div>

              </div>

            </section>

            <!-- EMPLOYEE FILTER -->

            <section class="employee-section">

              <div class="employee-section-heading">

                <div>
                  <h3>
                    Select Employees
                  </h3>

                  <p>
                    Choose employees to assign
                    to the selected schedule.
                  </p>
                </div>

                <span class="selected-counter">
                  {{
                    selectedEmployeeIds.length
                  }}
                  selected
                </span>

              </div>

              <div class="filters">

                <div class="search-field">

                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle
                      cx="11"
                      cy="11"
                      r="8"
                    />

                    <path
                      d="m21 21-4.3-4.3"
                    />
                  </svg>

                  <input
                    v-model="search"
                    type="text"
                    placeholder="Search employee, ID or position..."
                  >

                </div>

                <select
                  v-model="department"
                  class="department-select"
                >
                  <option value="">
                    All Departments
                  </option>

                  <option
                    v-for="item in departments"
                    :key="item"
                    :value="item"
                  >
                    {{ item }}
                  </option>
                </select>

              </div>

              <!-- LIST -->

              <div class="employee-list">

                <div class="employee-list-header">

                  <button
                    type="button"
                    class="select-all"
                    @click="
                      toggleSelectAll
                    "
                  >
                    <span
                      class="checkbox"
                      :class="{
                        checked:
                          allFilteredSelected,
                      }"
                    >
                      <Check
                        v-if="
                          allFilteredSelected
                        "
                        :size="12"
                      />
                    </span>

                    Select All
                  </button>

                  <span>
                    {{
                      filteredEmployees.length
                    }}
                    employee(s)
                  </span>

                </div>

                <button
                  v-for="employee in filteredEmployees"
                  :key="employee.id"
                  type="button"
                  class="employee-row"
                  :class="{
                    selected:
                      isSelected(
                        employee.id,
                      ),

                    disabled:
                      isAlreadyAssigned(
                        employee.id,
                      ),
                  }"
                  @click="
                    toggleEmployee(
                      employee.id,
                    )
                  "
                >

                  <span
                    class="checkbox"
                    :class="{
                      checked:
                        isSelected(
                          employee.id,
                        ),

                      disabled:
                        isAlreadyAssigned(
                          employee.id,
                        ),
                    }"
                  >
                    <Check
                      v-if="
                        isSelected(
                          employee.id,
                        )
                      "
                      :size="12"
                    />
                  </span>

                  <div class="avatar">
                    {{
                      getInitials(
                        employee,
                      )
                    }}
                  </div>

                  <div class="employee-info">

                    <strong>
                      {{
                        getFullName(
                          employee,
                        )
                      }}
                    </strong>

                    <span>
                      {{
                        employee.employeeNumber
                      }}
                    </span>

                  </div>

                  <div class="employee-meta">

                    <div>
                      <Building2
                        :size="13"
                      />

                      <span>
                        {{
                          employee.department
                        }}
                      </span>
                    </div>

                    <div>
                      <BriefcaseBusiness
                        :size="13"
                      />

                      <span>
                        {{
                          employee.position
                        }}
                      </span>
                    </div>

                  </div>

                  <div class="current-schedule">

                    <span>
                      Current Schedule
                    </span>

                    <strong>
                      {{
                        getEmployeeSchedule(
                          employee.id,
                        )
                      }}
                    </strong>

                    <small
                      v-if="
                        isAlreadyAssigned(
                          employee.id,
                        )
                      "
                    >
                      Already assigned
                    </small>

                  </div>

                </button>

                <div
                  v-if="
                    !filteredEmployees.length
                  "
                  class="empty-state"
                >
                  <Users :size="26" />

                  <strong>
                    No employees found
                  </strong>

                  <p>
                    Try changing your search
                    or department filter.
                  </p>
                </div>

              </div>

            </section>

          </div>

          <!-- FOOTER -->

          <div class="modal-footer">

            <div class="selection-summary">

              <Users :size="15" />

              <span>
                <strong>
                  {{
                    selectedEmployeeIds.length
                  }}
                </strong>

                employee(s) selected
              </span>

            </div>

            <div class="footer-actions">

              <AppButton
                variant="secondary"
                @click="handleClose"
              >
                Cancel
              </AppButton>

              <AppButton
                :icon="Users"
                :disabled="
                  !selectedEmployeeIds.length
                "
                @click="handleSave"
              >
                Assign Schedule
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

  backdrop-filter: blur(3px);
}

.modal-card {
  display: flex;

  width: 100%;
  max-width: 980px;
  max-height: calc(100vh - 40px);

  flex-direction: column;

  overflow: hidden;

  border: 1px solid var(--border);
  border-radius: 13px;

  background: var(--bg-card);

  box-shadow:
    0 24px 80px
    rgba(0, 0, 0, 0.4);
}

/* HEADER */

.modal-header {
  display: flex;

  flex-shrink: 0;

  align-items: center;
  justify-content: space-between;

  gap: 15px;

  padding: 16px 18px;

  border-bottom:
    1px solid var(--border-soft);
}

.header-left {
  display: flex;

  align-items: center;

  gap: 11px;
}

.header-icon {
  display: flex;

  width: 42px;
  height: 42px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 10px;

  background: var(--primary-soft);
  color: var(--primary);
}

.modal-header h2 {
  margin: 0;

  color: var(--text-primary);

  font-size: 16px;
  font-weight: 700;
}

.modal-header p {
  margin: 4px 0 0;

  color: var(--text-muted);

  font-size: 10px;
}

.close-button {
  display: flex;

  width: 34px;
  height: 34px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border: 1px solid var(--border);
  border-radius: 7px;

  background: transparent;
  color: var(--text-secondary);

  cursor: pointer;
}

/* BODY */

.modal-body {
  flex: 1;

  overflow-y: auto;

  padding: 17px 18px;
}

/* FORM SECTION */

.form-section {
  padding: 15px;

  border: 1px solid var(--border-soft);
  border-radius: 10px;

  background: var(--bg-card-soft);
}

.section-heading {
  display: flex;

  align-items: center;

  gap: 9px;

  margin-bottom: 14px;
}

.section-icon {
  display: flex;

  width: 35px;
  height: 35px;

  align-items: center;
  justify-content: center;

  border-radius: 8px;
}

.section-icon.blue {
  background: var(--primary-soft);
  color: var(--primary);
}

.section-heading h3,
.employee-section-heading h3 {
  margin: 0;

  color: var(--text-primary);

  font-size: 12px;
  font-weight: 700;
}

.section-heading p,
.employee-section-heading p {
  margin: 3px 0 0;

  color: var(--text-muted);

  font-size: 9px;
}

.assignment-grid {
  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 12px;
}

.field-group label {
  display: block;

  margin-bottom: 6px;

  color: var(--text-primary);

  font-size: 10px;
  font-weight: 600;
}

.field-group label span {
  color: var(--red);
}

.native-select,
.date-field {
  width: 100%;
  height: 39px;

  border: 1px solid var(--border);
  border-radius: 7px;

  background: var(--bg-card);
  color: var(--text-primary);
}

.native-select {
  padding: 0 10px;

  outline: none;

  font-family: inherit;
  font-size: 10px;
}

.date-field {
  display: flex;

  align-items: center;

  gap: 8px;

  padding: 0 10px;

  color: var(--text-muted);
}

.date-field input {
  min-width: 0;

  flex: 1;

  border: 0;
  outline: 0;

  background: transparent;
  color: var(--text-primary);

  font-family: inherit;
  font-size: 10px;

  color-scheme: dark;
}

html:not(.dark)
.date-field input {
  color-scheme: light;
}

.schedule-preview {
  display: grid;

  grid-template-columns:
    repeat(3, minmax(0, 1fr));

  gap: 8px;

  margin-top: 12px;
}

.schedule-preview > div {
  padding: 10px;

  border: 1px solid var(--border-soft);
  border-radius: 7px;

  background: var(--bg-card);
}

.schedule-preview span,
.schedule-preview strong {
  display: block;
}

.schedule-preview span {
  color: var(--text-muted);

  font-size: 8px;
}

.schedule-preview strong {
  margin-top: 4px;

  color: var(--text-primary);

  font-size: 10px;
}

/* EMPLOYEE SECTION */

.employee-section {
  margin-top: 13px;

  overflow: hidden;

  border: 1px solid var(--border);
  border-radius: 10px;
}

.employee-section-heading {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 10px;

  padding: 13px 14px;

  border-bottom:
    1px solid var(--border-soft);
}

.selected-counter {
  display: inline-flex;

  padding: 5px 9px;

  border-radius: 20px;

  background: var(--primary-soft);
  color: var(--primary);

  font-size: 9px;
  font-weight: 650;
}

/* FILTER */

.filters {
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    210px;

  gap: 8px;

  padding: 10px;

  border-bottom:
    1px solid var(--border-soft);

  background: var(--bg-card-soft);
}

.search-field {
  display: flex;

  height: 38px;

  align-items: center;

  gap: 8px;

  padding: 0 10px;

  border: 1px solid var(--border);
  border-radius: 7px;

  background: var(--bg-card);
  color: var(--text-muted);
}

.search-field input {
  min-width: 0;

  flex: 1;

  border: 0;
  outline: 0;

  background: transparent;
  color: var(--text-primary);

  font-size: 10px;
}

.department-select {
  height: 38px;

  padding: 0 9px;

  border: 1px solid var(--border);
  border-radius: 7px;

  outline: none;

  background: var(--bg-card);
  color: var(--text-primary);

  font-size: 10px;
}

/* LIST */

.employee-list {
  max-height: 350px;

  overflow-y: auto;
}

.employee-list-header {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 10px;

  padding: 9px 12px;

  border-bottom:
    1px solid var(--border-soft);
}

.employee-list-header > span {
  color: var(--text-muted);

  font-size: 9px;
}

.select-all {
  display: flex;

  align-items: center;

  gap: 7px;

  border: 0;

  background: transparent;
  color: var(--text-secondary);

  font-size: 9px;

  cursor: pointer;
}

.checkbox {
  display: inline-flex;

  width: 18px;
  height: 18px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border: 1px solid var(--border);
  border-radius: 4px;

  background: var(--bg-card);

  color: white;
}

.checkbox.checked {
  border-color: var(--primary);

  background: var(--primary);
}

.checkbox.disabled {
  opacity: 0.4;
}

.employee-row {
  display: grid;

  width: 100%;

  grid-template-columns:
    18px
    38px
    minmax(150px, 1fr)
    minmax(220px, 1.2fr)
    minmax(150px, 0.8fr);

  align-items: center;

  gap: 10px;

  padding: 10px 12px;

  border: 0;
  border-bottom:
    1px solid var(--border-soft);

  background: transparent;

  color: inherit;

  text-align: left;

  cursor: pointer;
}

.employee-row:last-child {
  border-bottom: 0;
}

.employee-row:hover {
  background: var(--bg-card-soft);
}

.employee-row.selected {
  background: var(--primary-soft);
}

.employee-row.disabled {
  cursor: default;

  opacity: 0.65;
}

.avatar {
  display: flex;

  width: 36px;
  height: 36px;

  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background: var(--primary-soft);
  color: var(--primary);

  font-size: 10px;
  font-weight: 700;
}

.employee-info strong,
.employee-info span {
  display: block;
}

.employee-info strong {
  color: var(--text-primary);

  font-size: 11px;
  font-weight: 650;
}

.employee-info span {
  margin-top: 3px;

  color: var(--text-muted);

  font-size: 8px;
}

.employee-meta {
  display: flex;

  flex-direction: column;

  gap: 5px;
}

.employee-meta > div {
  display: flex;

  align-items: center;

  gap: 6px;

  color: var(--text-secondary);

  font-size: 9px;
}

.current-schedule span,
.current-schedule strong,
.current-schedule small {
  display: block;
}

.current-schedule span {
  color: var(--text-muted);

  font-size: 8px;
}

.current-schedule strong {
  margin-top: 3px;

  color: var(--text-primary);

  font-size: 9px;
}

.current-schedule small {
  margin-top: 3px;

  color: var(--green);

  font-size: 8px;
}

.empty-state {
  display: flex;

  min-height: 180px;

  flex-direction: column;

  align-items: center;
  justify-content: center;

  color: var(--text-muted);

  text-align: center;
}

.empty-state strong {
  margin-top: 8px;

  color: var(--text-primary);

  font-size: 11px;
}

.empty-state p {
  margin: 4px 0 0;

  font-size: 9px;
}

/* FOOTER */

.modal-footer {
  display: flex;

  flex-shrink: 0;

  align-items: center;
  justify-content: space-between;

  gap: 15px;

  padding: 13px 18px;

  border-top:
    1px solid var(--border-soft);

  background: var(--bg-card-soft);
}

.selection-summary {
  display: flex;

  align-items: center;

  gap: 7px;

  color: var(--text-secondary);

  font-size: 9px;
}

.selection-summary strong {
  color: var(--primary);
}

.footer-actions {
  display: flex;

  gap: 8px;
}

/* TRANSITION */

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.15s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* RESPONSIVE */

@media (max-width: 800px) {
  .assignment-grid,
  .schedule-preview,
  .filters {
    grid-template-columns: 1fr;
  }

  .employee-row {
    grid-template-columns:
      18px
      38px
      minmax(0, 1fr);
  }

  .employee-meta,
  .current-schedule {
    grid-column:
      3 / -1;
  }
}

@media (max-width: 600px) {
  .modal-footer {
    align-items: stretch;

    flex-direction: column;
  }

  .footer-actions {
    justify-content: flex-end;
  }
}
</style>