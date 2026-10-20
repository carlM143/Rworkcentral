<script setup lang="ts">
import {
  Download,
  FileSpreadsheet,
  FileText,
  Table2,
  X,
} from 'lucide-vue-next'

type ExportFormat =
  | 'Excel'
  | 'PDF'
  | 'CSV'

defineProps<{
  open: boolean
  recordCount: number

  period?: string
  department?: string
  payrollStatus?: string
  paymentStatus?: string
  dateFrom?: string
  dateTo?: string
}>()

const emit =
  defineEmits<{
    close: []

    export: [
      format:
        ExportFormat,
    ]
  }>()

const format =
  ref<ExportFormat>(
    'Excel',
  )

const formats = [
  {
    value:
      'Excel' as const,

    icon:
      FileSpreadsheet,

    description:
      'Detailed payroll ledger for spreadsheet review.',
  },

  {
    value:
      'PDF' as const,

    icon:
      FileText,

    description:
      'Printable payroll ledger report.',
  },

  {
    value:
      'CSV' as const,

    icon:
      Table2,

    description:
      'Raw payroll records for data processing.',
  },
]
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
              <Download :size="18" />
            </div>

            <div>

              <h2>
                Export Employee Payroll
              </h2>

              <p>
                Export records based on the current ledger filters.
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

          <div class="summary">

            <div>
              <span>RECORDS</span>

              <strong>
                {{ recordCount }}
              </strong>
            </div>

            <div>
              <span>PAY PERIOD</span>

              <strong>
                {{ period || 'All' }}
              </strong>
            </div>

            <div>
              <span>DEPARTMENT</span>

              <strong>
                {{ department || 'All' }}
              </strong>
            </div>

            <div>
              <span>PAYROLL STATUS</span>

              <strong>
                {{ payrollStatus || 'All' }}
              </strong>
            </div>

          </div>

          <div class="secondary-summary">

            <span>
              Payment Status:
              <strong>
                {{ paymentStatus || 'All' }}
              </strong>
            </span>

            <span>
              Period:
              <strong>
                {{ dateFrom || 'Beginning' }}
                →
                {{ dateTo || 'Latest' }}
              </strong>
            </span>

          </div>

          <h3>
            Export Format
          </h3>

          <div class="formats">

            <button
              v-for="
                item in
                formats
              "
              :key="
                item.value
              "
              type="button"
              :class="{
                active:
                  format ===
                  item.value,
              }"
              @click="
                format =
                  item.value
              "
            >

              <component
                :is="
                  item.icon
                "
                :size="19"
              />

              <strong>
                {{ item.value }}
              </strong>

              <span>
                {{ item.description }}
              </span>

            </button>

          </div>

          <div class="included">

            <strong>
              Included Data
            </strong>

            <span>
              Employee details, pay period,
              basic pay, overtime, allowances,
              gross pay, government contributions,
              deductions, net pay, payroll status,
              payment status and references.
            </span>

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
            :icon="Download"
            @click="
              emit(
                'export',
                format,
              )
            "
          >
            Export {{ format }}
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

  padding:
    15px 18px;

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
  margin:
    3px 0 0;

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
  padding:
    17px 18px;
}

.summary {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 7px;
}

.summary > div {
  padding: 9px;

  border:
    1px solid var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card-soft);
}

.summary span,
.summary strong {
  display: block;
}

.summary span {
  color:
    var(--text-muted);

  font-size: 6px;
}

.summary strong {
  margin-top: 3px;

  overflow: hidden;

  color:
    var(--text-primary);

  font-size: 8px;

  text-overflow: ellipsis;

  white-space: nowrap;
}

.secondary-summary {
  display: flex;

  gap: 15px;

  margin-top: 8px;

  padding: 9px;

  border-radius: 7px;

  background:
    var(--bg-card-soft);

  color:
    var(--text-muted);

  font-size: 7px;
}

.secondary-summary strong {
  color:
    var(--text-primary);
}

h3 {
  margin:
    16px 0 8px;

  color:
    var(--text-primary);

  font-size: 9px;
}

.formats {
  display: grid;

  grid-template-columns:
    repeat(3, minmax(0, 1fr));

  gap: 7px;
}

.formats button {
  display: flex;

  min-height: 105px;

  flex-direction: column;

  align-items:
    flex-start;

  gap: 6px;

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

.formats button.active {
  border-color:
    var(--primary);

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.formats strong {
  font-size: 8px;
}

.formats span {
  color:
    var(--text-muted);

  font-size: 7px;
}

.included {
  margin-top: 11px;

  padding: 10px;

  border-radius: 7px;

  background:
    var(--bg-card-soft);
}

.included strong,
.included span {
  display: block;
}

.included strong {
  color:
    var(--text-primary);

  font-size: 8px;
}

.included span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 7px;
}

footer {
  display: flex;

  justify-content: flex-end;

  gap: 7px;

  padding:
    13px 18px;

  border-top:
    1px solid var(--border-soft);
}

@media (max-width: 600px) {
  .summary,
  .formats {
    grid-template-columns: 1fr;
  }

  .secondary-summary {
    flex-direction: column;
  }
}
</style>