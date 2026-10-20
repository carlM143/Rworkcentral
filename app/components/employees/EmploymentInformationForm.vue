<script setup lang="ts">
import {
  BriefcaseBusiness,
  Building2,
  UserRound,
  CalendarDays,
  Clock3,
  MapPin,
  BadgeCheck,
} from 'lucide-vue-next'

const {
  form,
} = useEmployeeForm()

/*
|--------------------------------------------------------------------------
| Mock Options
|--------------------------------------------------------------------------
| UI muna tayo.
| Later, papalitan natin ito ng Laravel API data.
|--------------------------------------------------------------------------
*/

const departments = [
  'Human Resources',
  'Operations',
  'Finance',
  'Billing',
  'Information Technology',
  'Administration',
  'Sales',
]

const positions = [
  'HR Manager',
  'HR Officer',
  'HR Assistant',
  'Operations Manager',
  'Supervisor',
  'Driver',
  'Dispatcher',
  'Accountant',
  'Payroll Officer',
  'Billing Officer',
  'Billing Assistant',
  'IT Officer',
  'Administrative Assistant',
]

const supervisors = [
  'Maria Santos',
  'Juan Dela Cruz',
  'Leo Martinez',
  'Claire Villanueva',
  'Robert Castillo',
]

const employmentTypes = [
  'Regular',
  'Probationary',
  'Contractual',
  'Project-Based',
]

const employmentStatuses = [
  'Active',
  'Inactive',
  'On Leave',
]

const branches = [
  'Main Branch',
  'Davao Branch',
  'Tagum Branch',
  'Client Site',
  'Field Assignment',
]

const {
  schedules,
} = useWorkSchedules()

const workSchedules =
  computed(() => {
    return schedules.value
      .filter(
        schedule =>
          schedule.status === 'Active',
      )
      .map(
        schedule =>
          schedule.name,
      )
  })

const restDays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const employeeSummary = computed(() => {
  const name = [
    form.value.firstName,
    form.value.middleName,
    form.value.lastName,
  ]
    .filter(Boolean)
    .join(' ')

  return name || 'New Employee'
})
</script>

<template>
  <FormSection
    title="Employment Information"
    description="Set the employee's official work assignment, position and employment details."
    :icon="BriefcaseBusiness"
  >
    <div class="employment-layout">

      <!-- =========================================
           EMPLOYEE SUMMARY
      ========================================== -->
      <aside class="summary-column">
        <div class="employee-summary">
          <div class="summary-avatar">
            <UserRound :size="28" />
          </div>

          <strong>
            {{ employeeSummary }}
          </strong>

          <span>
            {{
              form.employeeNumber ||
              'Employee ID not assigned'
            }}
          </span>
        </div>

        <div class="summary-box">
          <div class="summary-item">
            <div class="summary-icon">
              <Building2 :size="15" />
            </div>

            <div>
              <span>
                Department
              </span>

              <strong>
                {{
                  form.department ||
                  'Not selected'
                }}
              </strong>
            </div>
          </div>

          <div class="summary-item">
            <div class="summary-icon">
              <BadgeCheck :size="15" />
            </div>

            <div>
              <span>
                Employment Type
              </span>

              <strong>
                {{
                  form.employmentType ||
                  'Not selected'
                }}
              </strong>
            </div>
          </div>

          <div class="summary-item">
            <div class="summary-icon">
              <MapPin :size="15" />
            </div>

            <div>
              <span>
                Work Location
              </span>

              <strong>
                {{
                  form.branch ||
                  'Not selected'
                }}
              </strong>
            </div>
          </div>
        </div>

        <div class="summary-note">
          Employment details will be used by
          Timekeeping, Leave, Payroll and
          Approval workflows.
        </div>
      </aside>

      <!-- =========================================
           FORM
      ========================================== -->
      <div class="employment-form">

        <!-- BASIC EMPLOYMENT DETAILS -->
        <div class="section-title">
          <div class="section-title-icon">
            <BriefcaseBusiness :size="16" />
          </div>

          <div>
            <strong>
              Basic Employment Details
            </strong>

            <span>
              Employee number, hiring date and
              employment classification.
            </span>
          </div>
        </div>

        <div class="form-grid two-column">
          <!-- EMPLOYEE ID -->
          <div class="form-field">
            <label class="field-label">
              Employee ID
              <span>*</span>
            </label>

            <AppInput
              v-model="form.employeeNumber"
              placeholder="e.g. EMP-001"
            />

            <small class="field-hint">
              Unique employee identification number.
            </small>
          </div>

          <!-- DATE HIRED -->
          <AppDateInput
            v-model="form.dateHired"
            label="Date Hired"
            required
          />
        </div>

        <div class="form-grid two-column form-row">
          <!-- EMPLOYMENT TYPE -->
          <div class="form-field">
            <label class="field-label">
              Employment Type
              <span>*</span>
            </label>

            <AppSelect
              v-model="form.employmentType"
              :options="employmentTypes"
              placeholder="Select employment type"
            />
          </div>

          <!-- EMPLOYMENT STATUS -->
          <div class="form-field">
            <label class="field-label">
              Employment Status
              <span>*</span>
            </label>

            <AppSelect
              v-model="form.employmentStatus"
              :options="employmentStatuses"
              placeholder="Select employment status"
            />
          </div>
        </div>

        <!-- ASSIGNMENT -->
        <div class="section-divider" />

        <div class="section-title">
          <div class="section-title-icon green">
            <Building2 :size="16" />
          </div>

          <div>
            <strong>
              Organization Assignment
            </strong>

            <span>
              Assign the employee to a department,
              position and reporting supervisor.
            </span>
          </div>
        </div>

        <div class="form-grid two-column">
          <!-- DEPARTMENT -->
          <div class="form-field">
            <label class="field-label">
              Department
              <span>*</span>
            </label>

            <AppSelect
              v-model="form.department"
              :options="departments"
              placeholder="Select department"
            />
          </div>

          <!-- POSITION -->
          <div class="form-field">
            <label class="field-label">
              Position / Designation
              <span>*</span>
            </label>

            <AppSelect
              v-model="form.position"
              :options="positions"
              placeholder="Select position"
            />
          </div>
        </div>

        <div class="form-grid two-column form-row">
          <!-- SUPERVISOR -->
          <div class="form-field">
            <label class="field-label">
              Immediate Supervisor
            </label>

            <AppSelect
              v-model="form.supervisor"
              :options="supervisors"
              placeholder="Select supervisor"
            />

            <small class="field-hint">
              Used for approval routing and
              reporting structure.
            </small>
          </div>

          <!-- BRANCH -->
          <div class="form-field">
            <label class="field-label">
              Branch / Work Location
            </label>

            <AppSelect
              v-model="form.branch"
              :options="branches"
              placeholder="Select work location"
            />
          </div>
        </div>

        <!-- WORK SCHEDULE -->
        <div class="section-divider" />

        <div class="section-title">
          <div class="section-title-icon orange">
            <Clock3 :size="16" />
          </div>

          <div>
            <strong>
              Work Schedule
            </strong>

            <span>
              Define the employee's default work
              schedule and rest day.
            </span>
          </div>
        </div>

        <div class="form-grid two-column">
          <!-- SCHEDULE -->
          <div class="form-field">
            <label class="field-label">
              Work Schedule
            </label>

            <AppSelect
              v-model="form.workSchedule"
              :options="workSchedules"
              placeholder="Select work schedule"
            />

            <small class="field-hint">
              Used as basis for attendance, late and
              undertime calculations.
            </small>
          </div>

          <!-- REST DAY -->
            <div class="form-field">
              <label class="field-label">
                Rest Day
              </label>

              <div class="rest-day-options">

                <label
                  v-for="day in restDays"
                  :key="day"
                  class="rest-day-option"
                  :class="{
                    selected:
                      form.restDay === day,
                  }"
                >

                  <input
                    v-model="form.restDay"
                    type="radio"
                    name="employee-rest-day"
                    :value="day"
                  >

                  <span class="radio-control" />

                  <span class="radio-label">
                    {{ day }}
                  </span>

                </label>

              </div>

              <small class="field-hint">
                Select the employee's default weekly rest day.
              </small>
            </div>
        </div>

        <!-- INFORMATION -->
        <div class="integration-note">
          <CalendarDays :size="18" />

          <div>
            <strong>
              HRIS Integration
            </strong>

            <span>
              Department, schedule and employment
              information will later connect to
              Timekeeping, Leave, Overtime, Payroll
              and Reports.
            </span>
          </div>
        </div>
      </div>
    </div>
  </FormSection>
</template>

<style scoped>
.employment-layout {
  display: grid;

  grid-template-columns:
    230px minmax(0, 1fr);

  gap: 24px;
}

/* ==============================
   SUMMARY
============================== */

.summary-column {
  padding-right: 22px;

  border-right:
    1px solid var(--border-soft);
}

.employee-summary {
  display: flex;
  flex-direction: column;
  align-items: center;

  padding-bottom: 18px;

  text-align: center;
}

.summary-avatar {
  display: flex;
  width: 72px;
  height: 72px;
  align-items: center;
  justify-content: center;

  margin-bottom: 10px;

  border-radius: 50%;

  background: var(--primary-soft);
  color: var(--primary);
}

.employee-summary strong {
  max-width: 190px;

  overflow: hidden;

  color: var(--text-primary);

  font-size: 12px;
  font-weight: 700;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.employee-summary span {
  margin-top: 4px;

  color: var(--text-muted);

  font-size: 9px;
}

.summary-box {
  overflow: hidden;

  border: 1px solid var(--border);
  border-radius: 10px;

  background: var(--bg-card-soft);
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 9px;

  padding: 11px;

  border-bottom:
    1px solid var(--border-soft);
}

.summary-item:last-child {
  border-bottom: 0;
}

.summary-icon {
  display: flex;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background: var(--primary-soft);
  color: var(--primary);
}

.summary-item span,
.summary-item strong {
  display: block;
}

.summary-item span {
  color: var(--text-muted);

  font-size: 8px;
}

.summary-item strong {
  margin-top: 2px;

  color: var(--text-primary);

  font-size: 9px;
  font-weight: 600;
}

.summary-note {
  margin-top: 13px;

  padding: 10px;

  border-radius: 8px;

  background: var(--primary-soft);
  color: var(--text-secondary);

  font-size: 8px;
  line-height: 1.55;
}

/* ==============================
   FORM
============================== */

.employment-form {
  min-width: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 9px;

  margin-bottom: 14px;
}

.section-title-icon {
  display: flex;
  width: 31px;
  height: 31px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background: var(--primary-soft);
  color: var(--primary);
}

.section-title-icon.green {
  background: var(--green-soft);
  color: var(--green);
}

.section-title-icon.orange {
  background: var(--orange-soft);
  color: var(--orange);
}

.section-title strong,
.section-title span {
  display: block;
}

.section-title strong {
  color: var(--text-primary);

  font-size: 11px;
  font-weight: 650;
}

.section-title span {
  margin-top: 2px;

  color: var(--text-muted);

  font-size: 8px;
}

/* GRID */

.form-grid {
  display: grid;

  gap: 14px;
}

.two-column {
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
}

.form-row {
  margin-top: 16px;
}

.form-field {
  min-width: 0;
}

.field-label {
  display: block;

  margin-bottom: 7px;

  color: var(--text-secondary);

  font-size: 10px;
  font-weight: 600;
}

.field-label span {
  color: var(--red);
}

.field-hint {
  display: block;

  margin-top: 5px;

  color: var(--text-muted);

  font-size: 8px;
}

/* DIVIDER */

.section-divider {
  height: 1px;

  margin: 24px 0 18px;

  background: var(--border-soft);
}

/* INTEGRATION */

.integration-note {
  display: flex;
  align-items: flex-start;
  gap: 10px;

  margin-top: 22px;
  padding: 12px;

  border:
    1px solid
    color-mix(
      in srgb,
      var(--primary) 20%,
      var(--border)
    );

  border-radius: 9px;

  background:
    color-mix(
      in srgb,
      var(--primary-soft) 55%,
      var(--bg-card)
    );

  color: var(--primary);
}

.integration-note svg {
  flex-shrink: 0;
}

.integration-note strong,
.integration-note span {
  display: block;
}

.integration-note strong {
  color: var(--text-primary);

  font-size: 9px;
}

.integration-note span {
  margin-top: 3px;

  color: var(--text-secondary);

  font-size: 8px;
  line-height: 1.5;
}

/* ==============================
   REST DAY RADIO
============================== */

.rest-day-options {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 7px;
}

.rest-day-option {
  position: relative;

  display: flex;

  min-height: 38px;

  align-items: center;

  gap: 8px;

  padding: 0 10px;

  border:
    1px solid var(--border);

  border-radius: 8px;

  background:
    var(--bg-card);

  color:
    var(--text-secondary);

  font-size: 9px;

  cursor: pointer;

  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    color 0.15s ease;
}

.rest-day-option:hover {
  border-color:
    var(--primary);
}

.rest-day-option.selected {
  border-color:
    var(--primary);

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.rest-day-option input {
  position: absolute;

  width: 1px;
  height: 1px;

  opacity: 0;

  pointer-events: none;
}

.radio-control {
  position: relative;

  width: 15px;
  height: 15px;

  flex-shrink: 0;

  border:
    1.5px solid var(--border);

  border-radius: 50%;

  background:
    var(--bg-card);
}

.rest-day-option.selected
.radio-control {
  border-color:
    var(--primary);
}

.rest-day-option.selected
.radio-control::after {
  position: absolute;

  top: 50%;
  left: 50%;

  width: 7px;
  height: 7px;

  transform:
    translate(-50%, -50%);

  border-radius: 50%;

  background:
    var(--primary);

  content: '';
}

.radio-label {
  font-weight: 550;
}

@media (max-width: 1100px) {
  .rest-day-options {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .rest-day-options {
    grid-template-columns: 1fr;
  }
}

/* RESPONSIVE */

@media (max-width: 900px) {
  .employment-layout {
    grid-template-columns: 1fr;
  }

  .summary-column {
    padding-right: 0;
    padding-bottom: 20px;

    border-right: 0;
    border-bottom:
      1px solid var(--border-soft);
  }

  .summary-column {
    max-width: 450px;
    width: 100%;
    margin: 0 auto;
  }
}

@media (max-width: 600px) {
  .two-column {
    grid-template-columns: 1fr;
  }
}
</style>