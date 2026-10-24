<script setup lang="ts">
import {
  X,
  CalendarRange,
  Users,
} from 'lucide-vue-next'

import type {
  EmployeePayPeriod,
} from '~/types/employeePayPeriod'

defineProps<{
  open: boolean

  period:
    EmployeePayPeriod |
    null
}>()

const emit =
  defineEmits<{
    close: []
  }>()

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
      v-if="
        open &&
        period
      "
      class="overlay"
      @click.self="
        emit('close')
      "
    >

      <article class="modal">

        <header>

          <div class="heading">
            <CalendarRange :size="19" />

            <div>
              <h2>Pay Period Details</h2>

              <p>
                {{ period.periodCode }}
              </p>
            </div>
          </div>

          <button
            class="close"
            @click="emit('close')"
          >
            <X :size="18" />
          </button>

        </header>

        <div class="body">

          <section class="summary">

            <div>
              <span>Period</span>
              <strong>
                {{ period.periodName }}
              </strong>
            </div>

            <div>
              <span>Status</span>

              <StatusBadge
                :status="period.status"
              />
            </div>

            <div>
              <span>Cutoff Date</span>
              <strong>
                {{ period.cutoffDate }}
              </strong>
            </div>

            <div>
              <span>Pay Date</span>
              <strong>
                {{ period.payDate }}
              </strong>
            </div>

          </section>

          <section class="employee-summary">

            <Users :size="18" />

            <div>
              <span>
                Employee Payroll Progress
              </span>

              <strong>
                {{ period.completedEmployees }}
                completed ·
                {{ period.pendingEmployees }}
                pending ·
                {{ period.totalEmployees }}
                total
              </strong>
            </div>

          </section>

          <section class="amounts">

            <div>
              <span>Gross Amount</span>
              <strong>
                {{ money(period.grossAmount) }}
              </strong>
            </div>

            <div>
              <span>Deductions</span>
              <strong class="red">
                {{ money(period.totalDeductions) }}
              </strong>
            </div>

            <div>
              <span>Net Amount</span>
              <strong class="green">
                {{ money(period.netAmount) }}
              </strong>
            </div>

          </section>

          <section
            v-if="period.remarks"
            class="remarks"
          >
            <span>Remarks</span>

            <p>
              {{ period.remarks }}
            </p>
          </section>

        </div>

        <footer>
          <AppButton
            variant="secondary"
            @click="emit('close')"
          >
            Close
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
  background: rgba(3, 8, 18, 0.76);
  backdrop-filter: blur(4px);
}

.modal {
  width: 100%;
  max-width: 630px;
  border: 1px solid var(--border);
  border-radius: 13px;
  background: var(--bg-card);
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 18px;
  border-bottom: 1px solid var(--border-soft);
}

.heading {
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--primary);
}

h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 14px;
}

.heading p {
  margin: 3px 0 0;
  color: var(--primary);
  font-size: 8px;
}

.close {
  display: flex;
  width: 31px;
  height: 31px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
}

.body {
  padding: 17px 18px;
}

.summary {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.summary > div,
.amounts > div {
  padding: 10px;
  border: 1px solid var(--border-soft);
  border-radius: 7px;
  background: var(--bg-card-soft);
}

.summary span,
.summary strong,
.amounts span,
.amounts strong {
  display: block;
}

.summary span,
.amounts span,
.remarks span {
  color: var(--text-muted);
  font-size: 7px;
}

.summary strong,
.amounts strong {
  margin-top: 4px;
  color: var(--text-primary);
  font-size: 9px;
}

.employee-summary {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 10px;
  padding: 11px;
  border-radius: 8px;
  background: var(--primary-soft);
  color: var(--primary);
}

.employee-summary span,
.employee-summary strong {
  display: block;
}

.employee-summary span {
  color: var(--text-muted);
  font-size: 7px;
}

.employee-summary strong {
  margin-top: 3px;
  color: var(--text-primary);
  font-size: 9px;
}

.amounts {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 10px;
}

.red {
  color: var(--red) !important;
}

.green {
  color: var(--green) !important;
}

.remarks {
  margin-top: 10px;
  padding: 10px;
  border: 1px solid var(--border-soft);
  border-radius: 7px;
}

.remarks p {
  margin: 5px 0 0;
  color: var(--text-secondary);
  font-size: 8px;
}

footer {
  display: flex;
  justify-content: flex-end;
  padding: 13px 18px;
  border-top: 1px solid var(--border-soft);
}

@media (max-width: 600px) {
  .summary,
  .amounts {
    grid-template-columns: 1fr;
  }
}
</style>