<script setup lang="ts">
import {
  Landmark,
  ShieldCheck,
  BadgeCheck,
  FileCheck2,
  Info,
} from 'lucide-vue-next'

const {
  form,
} = useEmployeeForm()

const governmentSummary = computed(() => [
  {
    label: 'SSS',
    value: form.value.sssNumber,
    icon: ShieldCheck,
  },
  {
    label: 'PhilHealth',
    value: form.value.philHealthNumber,
    icon: BadgeCheck,
  },
  {
    label: 'Pag-IBIG',
    value: form.value.pagIbigNumber,
    icon: FileCheck2,
  },
  {
    label: 'TIN',
    value: form.value.tinNumber,
    icon: Landmark,
  },
])
</script>

<template>
  <FormSection
    title="Government Information"
    description="Enter the employee's government identification and statutory contribution details."
    :icon="Landmark"
  >
    <div class="government-layout">

      <!-- =====================================
           LEFT SUMMARY
      ====================================== -->
      <aside class="summary-column">
        <div class="summary-heading">
          <div class="summary-icon-main">
            <Landmark :size="27" />
          </div>

          <strong>
            Government Records
          </strong>

          <span>
            Statutory information
          </span>
        </div>

        <div class="government-summary">
          <div
            v-for="item in governmentSummary"
            :key="item.label"
            class="summary-item"
          >
            <div class="summary-icon">
              <component
                :is="item.icon"
                :size="15"
              />
            </div>

            <div>
              <span>
                {{ item.label }}
              </span>

              <strong>
                {{
                  item.value ||
                  'Not provided'
                }}
              </strong>
            </div>
          </div>
        </div>

        <div class="summary-note">
          These records will be used for
          government contributions, payroll
          deductions and statutory reports.
        </div>
      </aside>

      <!-- =====================================
           RIGHT FORM
      ====================================== -->
      <div class="government-form">

        <!-- SECTION HEADER -->
        <div class="section-title">
          <div class="section-title-icon">
            <ShieldCheck :size="17" />
          </div>

          <div>
            <strong>
              Statutory Identification
            </strong>

            <span>
              Enter the employee's registered
              government numbers.
            </span>
          </div>
        </div>

        <!-- SSS / PHILHEALTH -->
        <div class="form-grid two-column">

          <div class="form-field">
            <label class="field-label">
              SSS Number
            </label>

            <AppInput
              v-model="form.sssNumber"
              placeholder="00-0000000-0"
            />

            <small class="field-hint">
              Example: 34-1234567-8
            </small>
          </div>

          <div class="form-field">
            <label class="field-label">
              PhilHealth Number
            </label>

            <AppInput
              v-model="form.philHealthNumber"
              placeholder="00-000000000-0"
            />

            <small class="field-hint">
              Enter the employee's PhilHealth ID number.
            </small>
          </div>

        </div>

        <!-- PAGIBIG / TIN -->
        <div class="form-grid two-column form-row">

          <div class="form-field">
            <label class="field-label">
              Pag-IBIG MID Number
            </label>

            <AppInput
              v-model="form.pagIbigNumber"
              placeholder="0000-0000-0000"
            />

            <small class="field-hint">
              12-digit Pag-IBIG Membership ID.
            </small>
          </div>

          <div class="form-field">
            <label class="field-label">
              TIN
            </label>

            <AppInput
              v-model="form.tinNumber"
              placeholder="000-000-000-000"
            />

            <small class="field-hint">
              Employee Tax Identification Number.
            </small>
          </div>

        </div>

        <!-- DIVIDER -->
        <div class="section-divider" />

        <!-- INFO -->
        <div class="information-card">
          <div class="information-icon">
            <Info :size="18" />
          </div>

          <div>
            <strong>
              Government Contribution Integration
            </strong>

            <p>
              These numbers will later connect
              directly to SSS, PhilHealth,
              Pag-IBIG and tax-related payroll
              reports.
            </p>
          </div>
        </div>

        <!-- USAGE PREVIEW -->
        <div class="usage-grid">

          <div class="usage-card">
            <ShieldCheck :size="18" />

            <div>
              <strong>
                Payroll
              </strong>

              <span>
                Contribution deductions
              </span>
            </div>
          </div>

          <div class="usage-card">
            <FileCheck2 :size="18" />

            <div>
              <strong>
                Remittance
              </strong>

              <span>
                Government reports
              </span>
            </div>
          </div>

          <div class="usage-card">
            <BadgeCheck :size="18" />

            <div>
              <strong>
                Employee Profile
              </strong>

              <span>
                Centralized records
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  </FormSection>
</template>

<style scoped>
.government-layout {
  display: grid;
  grid-template-columns:
    230px minmax(0, 1fr);
  gap: 24px;
}

/* =========================
   LEFT SUMMARY
========================= */

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

.summary-icon-main {
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

.government-summary {
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

/* =========================
   FORM
========================= */

.government-form {
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

.field-hint {
  display: block;

  margin-top: 5px;

  color: var(--text-muted);

  font-size: 8px;
}

.section-divider {
  height: 1px;

  margin: 24px 0 18px;

  background: var(--border-soft);
}

/* =========================
   INFORMATION CARD
========================= */

.information-card {
  display: flex;
  align-items: flex-start;
  gap: 11px;

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

.information-icon {
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

.information-card strong {
  display: block;

  color: var(--text-primary);

  font-size: 10px;
}

.information-card p {
  margin: 4px 0 0;

  color: var(--text-secondary);

  font-size: 8px;
  line-height: 1.5;
}

/* =========================
   USAGE
========================= */

.usage-grid {
  display: grid;

  grid-template-columns:
    repeat(3, minmax(0, 1fr));

  gap: 10px;

  margin-top: 14px;
}

.usage-card {
  display: flex;
  align-items: center;
  gap: 9px;

  padding: 11px;

  border: 1px solid var(--border);
  border-radius: 9px;

  background: var(--bg-card-soft);

  color: var(--primary);
}

.usage-card strong,
.usage-card span {
  display: block;
}

.usage-card strong {
  color: var(--text-primary);

  font-size: 9px;
}

.usage-card span {
  margin-top: 2px;

  color: var(--text-muted);

  font-size: 8px;
}

/* =========================
   RESPONSIVE
========================= */

@media (max-width: 900px) {
  .government-layout {
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
  .two-column,
  .usage-grid {
    grid-template-columns: 1fr;
  }
}
</style>
