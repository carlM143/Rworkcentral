<script setup lang="ts">
import {
  X,
  FileText,
  BarChart3,
  ReceiptText,
  CreditCard,
} from 'lucide-vue-next'

type ReportType =
  | 'Summary'
  | 'Detailed Payroll'
  | 'Payment Status'

defineProps<{
  open: boolean
  recordCount: number
  grossPay: number
  deductions: number
  netPay: number
}>()

const emit =
  defineEmits<{
    close: []
    generate: [type: ReportType]
  }>()

const reportType =
  ref<ReportType>(
    'Summary',
  )

const reportTypes = [
  {
    value:
      'Summary' as const,

    icon:
      BarChart3,

    description:
      'Overall completed payroll totals and record count.',
  },

  {
    value:
      'Detailed Payroll' as const,

    icon:
      ReceiptText,

    description:
      'Detailed earnings, deductions and net pay per driver.',
  },

  {
    value:
      'Payment Status' as const,

    icon:
      CreditCard,

    description:
      'Payment release status and payroll references.',
  },
]

const money = (
  value: number,
) => {
  return new Intl.NumberFormat(
    'en-PH',
    {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    },
  ).format(value)
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
              <FileText :size="18" />
            </div>

            <div>

              <h2>
                Driver Payroll Report
              </h2>

              <p>
                Generate a report from completed driver payroll records.
              </p>

            </div>

          </div>

          <button
            class="close"
            @click="
              emit('close')
            "
          >
            <X :size="18" />
          </button>

        </header>

        <div class="body">

          <div class="stats">

            <div>
              <span>RECORDS</span>

              <strong>
                {{ recordCount }}
              </strong>
            </div>

            <div>
              <span>GROSS PAY</span>

              <strong>
                {{ money(grossPay) }}
              </strong>
            </div>

            <div>
              <span>DEDUCTIONS</span>

              <strong class="red">
                {{ money(deductions) }}
              </strong>
            </div>

            <div>
              <span>NET PAY</span>

              <strong class="green">
                {{ money(netPay) }}
              </strong>
            </div>

          </div>

          <h3>
            Report Type
          </h3>

          <div class="report-types">

            <button
              v-for="
                item in
                reportTypes
              "
              :key="
                item.value
              "
              type="button"
              :class="{
                active:
                  reportType ===
                  item.value,
              }"
              @click="
                reportType =
                  item.value
              "
            >

              <component
                :is="
                  item.icon
                "
                :size="17"
              />

              <div>

                <strong>
                  {{ item.value }}
                </strong>

                <span>
                  {{ item.description }}
                </span>

              </div>

            </button>

          </div>

          <div class="notice">
            Actual PDF/Excel report generation will be connected when the payroll backend is integrated.
          </div>

        </div>

        <footer>

          <AppButton
            variant="secondary"
            @click="
              emit('close')
            "
          >
            Cancel
          </AppButton>

          <AppButton
            :icon="FileText"
            @click="
              emit(
                'generate',
                reportType,
              )
            "
          >
            Generate Report
          </AppButton>

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

  background:
    rgba(3, 8, 18, 0.77);

  backdrop-filter:
    blur(4px);
}

.modal {
  width: 100%;
  max-width: 650px;

  border:
    1px solid var(--border);

  border-radius: 13px;

  background:
    var(--bg-card);
}

header {
  display: flex;

  align-items: center;
  justify-content: space-between;

  padding: 15px 18px;

  border-bottom:
    1px solid var(--border-soft);
}

.heading {
  display: flex;

  align-items: center;

  gap: 9px;
}

.icon {
  display: flex;

  width: 38px;
  height: 38px;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

h2 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 14px;
}

.heading p {
  margin: 3px 0 0;

  color:
    var(--text-muted);

  font-size: 8px;
}

.close {
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
}

.body {
  padding: 17px 18px;
}

.stats {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 7px;
}

.stats > div {
  padding: 9px;

  border:
    1px solid var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card-soft);
}

.stats span,
.stats strong {
  display: block;
}

.stats span {
  color:
    var(--text-muted);

  font-size: 6px;
}

.stats strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 8px;
}

.red {
  color:
    var(--red) !important;
}

.green {
  color:
    var(--green) !important;
}

h3 {
  margin: 16px 0 8px;

  color:
    var(--text-primary);

  font-size: 9px;
}

.report-types {
  display: flex;

  flex-direction: column;

  gap: 7px;
}

.report-types button {
  display: flex;

  align-items: flex-start;

  gap: 9px;

  padding: 10px;

  border:
    1px solid var(--border);

  border-radius: 8px;

  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);

  text-align: left;

  cursor: pointer;
}

.report-types button.active {
  border-color:
    var(--primary);

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.report-types strong,
.report-types span {
  display: block;
}

.report-types strong {
  color:
    var(--text-primary);

  font-size: 8px;
}

.report-types span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 7px;
}

.notice {
  margin-top: 11px;

  padding: 10px;

  border-radius: 7px;

  background:
    var(--orange-soft);

  color:
    var(--text-secondary);

  font-size: 8px;
}

footer {
  display: flex;

  justify-content: flex-end;

  gap: 7px;

  padding: 13px 18px;

  border-top:
    1px solid var(--border-soft);
}

@media (max-width: 600px) {
  .stats {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}
</style>