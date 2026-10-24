<script setup lang="ts">
import {
  Building2,
  Eye,
} from 'lucide-vue-next'

import type {
  BillingRecord,
} from '~/types/billing'

defineProps<{
  records: BillingRecord[]
}>()

const {
  info,
} = useToast()

const currency = (
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

const viewRecord = (
  record: BillingRecord,
) => {
  info(
    'Billing Details',
    `${record.clientName} billing details will be available in the billing processing module.`,
  )
}
</script>

<template>
  <article class="billing-table-card">

    <div class="table-heading">
      <div>
        <h3>
          Client Billing Preview
        </h3>

        <p>
          Preliminary billing computation for the current period.
        </p>
      </div>
    </div>

    <div class="table-scroll">

      <table class="billing-table">

        <thead>
          <tr>
            <th>Client</th>
            <th>Employees</th>
            <th>Regular Hours</th>
            <th>OT Hours</th>
            <th>Regular Amount</th>
            <th>OT Amount</th>
            <th>Adjustments</th>
            <th>Total Billing</th>
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
              <div class="client-cell">

                <div class="client-icon">
                  <Building2 :size="15" />
                </div>

                <div>
                  <strong>
                    {{ record.clientName }}
                  </strong>

                  <span>
                    {{ record.clientCode }}

                    <template v-if="record.department">
                      · {{ record.department }}
                    </template>
                  </span>

                  <small v-if="record.issue">
                    {{ record.issue }}
                  </small>
                </div>

              </div>
            </td>

            <td>
              {{ record.employees }}
            </td>

            <td>
              {{ record.regularHours }}
            </td>

            <td>
              <strong
                :class="{
                  overtime:
                    record.overtimeHours > 0,
                }"
              >
                {{ record.overtimeHours }}
              </strong>
            </td>

            <td>
              {{ currency(record.regularAmount) }}
            </td>

            <td>
              {{ currency(record.overtimeAmount) }}
            </td>

            <td>
              <span
                :class="{
                  negative:
                    record.adjustments < 0,
                }"
              >
                {{ currency(record.adjustments) }}
              </span>
            </td>

            <td>
              <strong class="total">
                {{ currency(record.totalAmount) }}
              </strong>
            </td>

            <td>
              <StatusBadge
                :status="record.status"
              />
            </td>

            <td>
              <button
                type="button"
                class="view-button"
                @click="viewRecord(record)"
              >
                <Eye :size="14" />
              </button>
            </td>

          </tr>
        </tbody>

      </table>

    </div>

  </article>
</template>

<style scoped>
.billing-table-card {
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

.billing-table {
  width: 100%;

  min-width: 1350px;

  border-collapse: collapse;
}

.billing-table th {
  padding: 10px 11px;

  border-bottom:
    1px solid var(--border);

  background: var(--bg-card-soft);

  color: var(--text-secondary);

  font-size: 8px;

  text-align: left;
  text-transform: uppercase;
}

.billing-table td {
  padding: 11px;

  border-bottom:
    1px solid var(--border-soft);

  color: var(--text-secondary);

  font-size: 9px;
}

.billing-table tbody tr:last-child td {
  border-bottom: 0;
}

.billing-table tbody tr:hover {
  background: var(--bg-card-soft);
}

.client-cell {
  display: flex;
  align-items: center;

  gap: 8px;
}

.client-icon {
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

.client-cell strong,
.client-cell span,
.client-cell small {
  display: block;
}

.client-cell strong {
  color: var(--text-primary);

  font-size: 9px;
}

.client-cell span {
  margin-top: 2px;

  color: var(--text-muted);

  font-size: 7px;
}

.client-cell small {
  margin-top: 3px;

  color: var(--red);

  font-size: 7px;
}

.overtime {
  color: var(--orange);
}

.negative {
  color: var(--red);
}

.total {
  color: var(--text-primary);
}

.view-button {
  display: inline-flex;

  width: 29px;
  height: 29px;

  align-items: center;
  justify-content: center;

  border: 1px solid var(--border);
  border-radius: 6px;

  background: transparent;
  color: var(--text-secondary);
}

.view-button:hover {
  background: var(--primary-soft);
  color: var(--primary);
}
</style>