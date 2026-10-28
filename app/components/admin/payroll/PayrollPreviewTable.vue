<script setup lang="ts">
import {
  Users,
  Eye,
} from 'lucide-vue-next'

import type {
  PayrollPreviewRecord,
} from '~/types/payroll'

defineProps<{
  records: PayrollPreviewRecord[]
}>()

const emit = defineEmits<{ view: [record: PayrollPreviewRecord] }>()

const formatCurrency = (
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

const viewPayroll = (record: PayrollPreviewRecord) => emit('view', record)
</script>

<template>
  <article class="payroll-table-card">

    <div class="table-heading">
      <div>
        <h3>
          Employee Payroll Preview
        </h3>

        <p>
          Preliminary payroll computation for the current period.
        </p>
      </div>
    </div>

    <div class="table-scroll">
      <table class="payroll-table">

        <thead>
          <tr>
            <th>Employee</th>
            <th>Basic Pay</th>
            <th>OT</th>
            <th>Allowance</th>
            <th>Deductions</th>
            <th>Net Pay</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="record in records"
            :key="record.id"
          >
            <td>
              <div class="employee-cell">
                <div class="employee-icon">
                  <Users :size="15" />
                </div>

                <div>
                  <strong>
                    {{ record.employeeName }}
                  </strong>

                  <span>
                    {{ record.employeeNumber }}
                    ·
                    {{ record.department }}
                  </span>

                  <small v-if="record.issue">
                    {{ record.issue }}
                  </small>
                </div>
              </div>
            </td>

            <td>
              {{ formatCurrency(record.basicPay) }}
            </td>

            <td>
              {{ formatCurrency(record.overtimePay) }}
            </td>

            <td>
              {{ formatCurrency(record.allowance) }}
            </td>

            <td class="deduction">
              -{{ formatCurrency(record.deductions) }}
            </td>

            <td>
              <strong class="net-pay">
                {{ formatCurrency(record.netPay) }}
              </strong>
            </td>

            <td>
              <StatusBadge
                :status="record.status"
              />
            </td>

            <td class="action-column">
              <button
                type="button"
                class="view-button"
                aria-label="View payroll details" title="View payroll details"
                @click="viewPayroll(record)"
              >
                <Eye :size="15" />
              </button>
            </td>
          </tr>
        </tbody>

      </table>
    </div>

  </article>
</template>

<style scoped>
.payroll-table-card {
  overflow: hidden;

  border: 1px solid var(--border);
  border-radius: 11px;

  background: var(--bg-card);

  box-shadow: var(--shadow);
}

.table-heading {
  padding: 13px 15px;

  border-bottom:
    1px solid var(--border-soft);
}

.table-heading h3 {
  margin: 0;

  color: var(--text-primary);

  font-size: 11px;
}

.table-heading p {
  margin: 3px 0 0;

  color: var(--text-muted);

  font-size: 8px;
}

.table-scroll {
  overflow-x: auto;
}

.payroll-table {
  width: 100%;

  min-width: 950px;

  border-collapse: collapse;
}

.payroll-table th {
  padding: 10px 12px;

  border-bottom:
    1px solid var(--border);

  background: var(--bg-card-soft);
  color: var(--text-secondary);

  font-size: 8px;

  text-align: left;
  text-transform: uppercase;
}

.payroll-table td {
  padding: 11px 12px;

  border-bottom:
    1px solid var(--border-soft);

  color: var(--text-secondary);

  font-size: 9px;
}

.payroll-table tbody tr:last-child td {
  border-bottom: 0;
}

.payroll-table tbody tr:hover {
  background: var(--bg-card-soft);
}

.employee-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.employee-icon {
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

.employee-cell strong,
.employee-cell span,
.employee-cell small {
  display: block;
}

.employee-cell strong {
  color: var(--text-primary);

  font-size: 9px;
}

.employee-cell span {
  margin-top: 2px;

  color: var(--text-muted);

  font-size: 7px;
}

.employee-cell small {
  margin-top: 3px;

  color: var(--red);

  font-size: 7px;
}

.deduction {
  color: var(--red) !important;
}

.net-pay {
  color: var(--text-primary);
}

.action-column {
  width: 45px;
}

.view-button {
  display: flex;

  width: 30px;
  height: 30px;

  align-items: center;
  justify-content: center;

  border: 1px solid var(--border);
  border-radius: 7px;

  background: transparent;
  color: var(--text-secondary);
}

.view-button:hover {
  background: var(--primary-soft);
  color: var(--primary);
}
</style>