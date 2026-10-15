<script setup lang="ts">
import {
  WalletCards,
  Banknote,
  Landmark,
  BadgeDollarSign,
  CalendarClock,
  Info,
} from 'lucide-vue-next'

const {
  form,
} = useEmployeeForm()

const salaryTypes = [
  'Monthly',
  'Daily',
  'Hourly',
]

const payrollGroups = [
  'Regular Employees',
  'Monthly Employees',
  'Daily Employees',
  'Drivers',
  'Contractual Employees',
  'Project-Based Employees',
]

const banks = [
  'BDO',
  'BPI',
  'Metrobank',
  'Landbank',
  'UnionBank',
  'Security Bank',
  'RCBC',
  'PNB',
  'Other',
]

const salaryDisplay = computed(() => {
  if (form.value.salaryType === 'Monthly') {
    return form.value.basicSalary
      ? `₱${Number(form.value.basicSalary).toLocaleString()}`
      : 'Not provided'
  }

  if (form.value.salaryType === 'Daily') {
    return form.value.dailyRate
      ? `₱${Number(form.value.dailyRate).toLocaleString()} / day`
      : 'Not provided'
  }

  if (form.value.salaryType === 'Hourly') {
    return form.value.hourlyRate
      ? `₱${Number(form.value.hourlyRate).toLocaleString()} / hour`
      : 'Not provided'
  }

  return 'Not provided'
})

const allowanceDisplay = computed(() => {
  if (!form.value.allowance) {
    return 'No allowance'
  }

  return `₱${Number(
    form.value.allowance,
  ).toLocaleString()}`
})
</script>

<template>
  <FormSection
    title="Payroll Information"
    description="Configure the employee's compensation, payroll classification and payment information."
    :icon="WalletCards"
  >
    <div class="payroll-layout">

      <!-- =============================================
           LEFT SUMMARY
      ============================================== -->
      <aside class="summary-column">

        <div class="summary-heading">
          <div class="summary-main-icon">
            <WalletCards :size="28" />
          </div>

          <strong>
            Payroll Setup
          </strong>

          <span>
            Employee compensation
          </span>
        </div>

        <div class="payroll-summary">

          <div class="summary-item">
            <div class="summary-icon">
              <CalendarClock :size="15" />
            </div>

            <div>
              <span>
                Salary Type
              </span>

              <strong>
                {{
                  form.salaryType ||
                  'Not selected'
                }}
              </strong>
            </div>
          </div>

          <div class="summary-item">
            <div class="summary-icon">
              <BadgeDollarSign :size="15" />
            </div>

            <div>
              <span>
                Primary Rate
              </span>

              <strong>
                {{ salaryDisplay }}
              </strong>
            </div>
          </div>

          <div class="summary-item">
            <div class="summary-icon">
              <Banknote :size="15" />
            </div>

            <div>
              <span>
                Allowance
              </span>

              <strong>
                {{ allowanceDisplay }}
              </strong>
            </div>
          </div>

          <div class="summary-item">
            <div class="summary-icon">
              <Landmark :size="15" />
            </div>

            <div>
              <span>
                Payroll Group
              </span>

              <strong>
                {{
                  form.payrollGroup ||
                  'Not selected'
                }}
              </strong>
            </div>
          </div>

        </div>

        <div class="summary-note">
          Payroll settings will serve as the
          employee's default compensation setup.
          Actual payroll calculations will later
          use attendance, overtime, leave,
          deductions and adjustments.
        </div>

      </aside>

      <!-- =============================================
           RIGHT FORM
      ============================================== -->
      <div class="payroll-form">

        <!-- =========================================
             COMPENSATION
        ========================================== -->
        <div class="section-title">
          <div class="section-title-icon">
            <BadgeDollarSign :size="17" />
          </div>

          <div>
            <strong>
              Compensation Setup
            </strong>

            <span>
              Define the employee's salary type,
              base rate and recurring allowance.
            </span>
          </div>
        </div>

        <div class="form-grid two-column">

          <!-- SALARY TYPE -->
          <div class="form-field">
            <label class="field-label">
              Salary Type
              <span>*</span>
            </label>

            <AppSelect
              v-model="form.salaryType"
              :options="salaryTypes"
              placeholder="Select salary type"
            />

            <small class="field-hint">
              Determines which rate will be used
              as the employee's primary pay basis.
            </small>
          </div>

          <!-- PAYROLL GROUP -->
          <div class="form-field">
            <label class="field-label">
              Payroll Group
              <span>*</span>
            </label>

            <AppSelect
              v-model="form.payrollGroup"
              :options="payrollGroups"
              placeholder="Select payroll group"
            />

            <small class="field-hint">
              Used for payroll grouping and
              cutoff processing.
            </small>
          </div>

        </div>

        <!-- MONTHLY -->
        <div
          v-if="form.salaryType === 'Monthly'"
          class="rate-container"
        >
          <div class="form-field">
            <label class="field-label">
              Basic Monthly Salary
              <span>*</span>
            </label>

            <div class="money-field">
              <span class="currency">
                ₱
              </span>

              <AppInput
                v-model="form.basicSalary"
                placeholder="0.00"
              />
            </div>

            <small class="field-hint">
              Employee's standard monthly basic
              salary before deductions.
            </small>
          </div>
        </div>

        <!-- DAILY -->
        <div
          v-else-if="form.salaryType === 'Daily'"
          class="rate-container"
        >
          <div class="form-field">
            <label class="field-label">
              Daily Rate
              <span>*</span>
            </label>

            <div class="money-field">
              <span class="currency">
                ₱
              </span>

              <AppInput
                v-model="form.dailyRate"
                placeholder="0.00"
              />
            </div>

            <small class="field-hint">
              Standard compensation for one
              regular working day.
            </small>
          </div>
        </div>

        <!-- HOURLY -->
        <div
          v-else-if="form.salaryType === 'Hourly'"
          class="rate-container"
        >
          <div class="form-field">
            <label class="field-label">
              Hourly Rate
              <span>*</span>
            </label>

            <div class="money-field">
              <span class="currency">
                ₱
              </span>

              <AppInput
                v-model="form.hourlyRate"
                placeholder="0.00"
              />
            </div>

            <small class="field-hint">
              Standard compensation for one
              working hour.
            </small>
          </div>
        </div>

        <!-- ALLOWANCE -->
        <div class="form-grid two-column form-row">

          <div class="form-field">
            <label class="field-label">
              Fixed Allowance
            </label>

            <div class="money-field">
              <span class="currency">
                ₱
              </span>

              <AppInput
                v-model="form.allowance"
                placeholder="0.00"
              />
            </div>

            <small class="field-hint">
              Optional recurring employee
              allowance.
            </small>
          </div>

          <div class="empty-column" />

        </div>

        <!-- =========================================
             BANK
        ========================================== -->
        <div class="section-divider" />

        <div class="section-title">
          <div class="section-title-icon green">
            <Landmark :size="17" />
          </div>

          <div>
            <strong>
              Bank / Payment Information
            </strong>

            <span>
              Enter the employee's payroll
              disbursement account if applicable.
            </span>
          </div>
        </div>

        <div class="form-grid two-column">

          <div class="form-field">
            <label class="field-label">
              Bank Name
            </label>

            <AppSelect
              v-model="form.bankName"
              :options="banks"
              placeholder="Select bank"
            />
          </div>

          <div class="form-field">
            <label class="field-label">
              Account Name
            </label>

            <AppInput
              v-model="form.accountName"
              placeholder="Enter account holder name"
            />
          </div>

        </div>

        <div class="form-grid two-column form-row">

          <div class="form-field">
            <label class="field-label">
              Account Number
            </label>

            <AppInput
              v-model="form.accountNumber"
              placeholder="Enter account number"
            />

            <small class="field-hint">
              Stored as employee payroll
              disbursement information.
            </small>
          </div>

          <div class="empty-column" />

        </div>

        <!-- =========================================
             INFO CARD
        ========================================== -->
        <div class="payroll-info">
          <div class="info-icon">
            <Info :size="18" />
          </div>

          <div>
            <strong>
              Payroll Calculation
            </strong>

            <p>
              This page only defines the employee's
              default payroll setup. The actual
              payroll computation will later include
              attendance, overtime, rest days,
              holidays, leave, loans, deductions,
              adjustments and government
              contributions.
            </p>
          </div>
        </div>

      </div>
    </div>
  </FormSection>
</template>

<style scoped>
.payroll-layout {
  display: grid;
  grid-template-columns:
    230px minmax(0, 1fr);
  gap: 24px;
}

/* =============================
   SUMMARY
============================= */

.summary-column {
  padding-right: 22px;

  border-right:
    1px solid var(--border-soft);
}

.summary-heading {
  display: flex;
  flex-direction: column;
  align-items: center;

  padding-bottom: 18px;

  text-align: center;
}

.summary-main-icon {
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

.summary-heading strong {
  color: var(--text-primary);

  font-size: 12px;
  font-weight: 700;
}

.summary-heading span {
  margin-top: 3px;

  color: var(--text-muted);

  font-size: 9px;
}

.payroll-summary {
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

/* =============================
   FORM
============================= */

.payroll-form {
  min-width: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 9px;

  margin-bottom: 15px;
}

.section-title-icon {
  display: flex;

  width: 32px;
  height: 32px;

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

/* =============================
   GRID
============================= */

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

/* =============================
   RATE
============================= */

.rate-container {
  max-width: calc(50% - 7px);

  margin-top: 16px;
}

.money-field {
  position: relative;
}

.currency {
  position: absolute;

  top: 50%;
  left: 13px;

  z-index: 2;

  transform: translateY(-50%);

  color: var(--text-muted);

  font-size: 11px;
  font-weight: 600;

  pointer-events: none;
}

.money-field :deep(input) {
  padding-left: 30px;
}

.section-divider {
  height: 1px;

  margin: 24px 0 18px;

  background: var(--border-soft);
}

/* =============================
   INFO
============================= */

.payroll-info {
  display: flex;
  align-items: flex-start;
  gap: 10px;

  margin-top: 24px;
  padding: 13px;

  border: 1px solid
    color-mix(
      in srgb,
      var(--primary) 18%,
      var(--border)
    );

  border-radius: 9px;

  background:
    color-mix(
      in srgb,
      var(--primary-soft) 55%,
      var(--bg-card)
    );
}

.info-icon {
  display: flex;

  width: 34px;
  height: 34px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background: var(--primary-soft);
  color: var(--primary);
}

.payroll-info strong {
  display: block;

  color: var(--text-primary);

  font-size: 10px;
}

.payroll-info p {
  margin: 4px 0 0;

  color: var(--text-secondary);

  font-size: 8px;
  line-height: 1.55;
}

/* =============================
   RESPONSIVE
============================= */

@media (max-width: 900px) {
  .payroll-layout {
    grid-template-columns: 1fr;
  }

  .summary-column {
    max-width: 450px;
    width: 100%;

    margin: 0 auto;
    padding-right: 0;
    padding-bottom: 20px;

    border-right: 0;
    border-bottom:
      1px solid var(--border-soft);
  }
}

@media (max-width: 650px) {
  .two-column {
    grid-template-columns: 1fr;
  }

  .rate-container {
    max-width: none;
  }

  .empty-column {
    display: none;
  }
}
</style>