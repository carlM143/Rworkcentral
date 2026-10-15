<script setup lang="ts">
import {
  UserRound,
  Eye,
  ArrowRight,
} from 'lucide-vue-next'

import type {
  LifecycleTransaction,
} from '~/types/employeeLifecycle'

defineProps<{
  transactions:
    LifecycleTransaction[]
}>()

const emit = defineEmits<{
  view: [
    transaction:
      LifecycleTransaction,
  ]
}>()

const formatDate = (
  value: string,
) => {
  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    },
  ).format(
    new Date(
      `${value}T00:00:00`,
    ),
  )
}

const transactionClass = (
  type: string,
) => {
  return type
    .toLowerCase()
    .replace(/\s+/g, '-')
}
</script>

<template>
  <article class="transactions-card">

    <div class="table-heading">

      <div>
        <h3>
          Lifecycle Transactions
        </h3>

        <p>
          Monitor employee movements,
          employment changes and lifecycle processes.
        </p>
      </div>

    </div>

    <div
      v-if="transactions.length"
      class="table-scroll"
    >
      <table class="transactions-table">

        <thead>
          <tr>
            <th>Employee</th>
            <th>Transaction</th>
            <th>Change</th>
            <th>Effective Date</th>
            <th>Requested By</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="transaction in transactions"
            :key="transaction.id"
          >

            <td>
              <div class="employee-cell">

                <div class="employee-icon">
                  <UserRound :size="16" />
                </div>

                <div>
                  <strong>
                    {{ transaction.employeeName }}
                  </strong>

                  <span>
                    {{ transaction.employeeNumber }}
                    ·
                    {{ transaction.department }}
                  </span>
                </div>

              </div>
            </td>

            <td>
              <div class="transaction-cell">

                <span
                  class="transaction-type"
                  :class="
                    transactionClass(
                      transaction.type,
                    )
                  "
                >
                  {{ transaction.type }}
                </span>

                <small>
                  {{ transaction.reference }}
                </small>

              </div>
            </td>

            <td>
              <div class="change-cell">

                <template
                  v-if="
                    transaction.currentValue ||
                    transaction.newValue
                  "
                >
                  <span>
                    {{
                      transaction.currentValue ||
                      '—'
                    }}
                  </span>

                  <ArrowRight :size="13" />

                  <strong>
                    {{
                      transaction.newValue ||
                      '—'
                    }}
                  </strong>
                </template>

                <span v-else>
                  No change information
                </span>

              </div>
            </td>

            <td>
              {{
                formatDate(
                  transaction.effectiveDate,
                )
              }}
            </td>

            <td>
              {{ transaction.requestedBy }}
            </td>

            <td>
              <StatusBadge
                :status="transaction.status"
              />
            </td>

            <td>
              <button
                type="button"
                class="view-button"
                title="View transaction"
                @click="
                  emit(
                    'view',
                    transaction,
                  )
                "
              >
                <Eye :size="15" />
              </button>
            </td>

          </tr>
        </tbody>

      </table>
    </div>

    <div
      v-else
      class="empty-state"
    >
      <UserRound :size="25" />

      <strong>
        No lifecycle transactions found
      </strong>

      <span>
        Try changing your filters.
      </span>
    </div>

  </article>
</template>

<style scoped>
.transactions-card {
  overflow: hidden;

  border: 1px solid var(--border);
  border-radius: 11px;

  background: var(--bg-card);

  box-shadow: var(--shadow);
}

/* =========================================
   HEADER
========================================= */

.table-heading {
  padding: 15px 16px;

  border-bottom:
    1px solid var(--border-soft);
}

.table-heading h3 {
  margin: 0;

  color: var(--text-primary);

  font-size: 14px;
  font-weight: 700;
}

.table-heading p {
  margin: 5px 0 0;

  color: var(--text-muted);

  font-size: 11px;

  line-height: 1.5;
}

/* =========================================
   TABLE
========================================= */

.table-scroll {
  width: 100%;

  overflow-x: auto;
}

.transactions-table {
  width: 100%;
  min-width: 1100px;

  border-collapse: collapse;
}

.transactions-table th {
  padding: 12px 14px;

  border-bottom:
    1px solid var(--border);

  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);

  font-size: 10px;
  font-weight: 700;

  text-align: left;
  text-transform: uppercase;

  letter-spacing: 0.2px;

  white-space: nowrap;
}

.transactions-table td {
  padding: 13px 14px;

  border-bottom:
    1px solid var(--border-soft);

  color:
    var(--text-secondary);

  font-size: 11px;

  vertical-align: middle;
}

.transactions-table tbody tr:last-child td {
  border-bottom: 0;
}

.transactions-table tbody tr:hover {
  background:
    var(--bg-card-soft);
}

/* =========================================
   EMPLOYEE
========================================= */

.employee-cell {
  display: flex;

  align-items: center;

  gap: 10px;

  min-width: 220px;
}

.employee-icon {
  display: flex;

  width: 38px;
  height: 38px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.employee-cell strong {
  display: block;

  color:
    var(--text-primary);

  font-size: 12px;
  font-weight: 650;
}

.employee-cell span {
  display: block;

  margin-top: 4px;

  color:
    var(--text-muted);

  font-size: 9px;
}

/* =========================================
   TRANSACTION TYPE
========================================= */

.transaction-cell {
  min-width: 150px;
}

.transaction-type {
  display: inline-flex;

  min-height: 25px;

  align-items: center;

  padding: 4px 9px;

  border-radius: 20px;

  font-size: 9px;
  font-weight: 650;
}

.transaction-type.onboarding {
  background: var(--primary-soft);
  color: var(--primary);
}

.transaction-type.regularization {
  background: var(--green-soft);
  color: var(--green);
}

.transaction-type.transfer {
  background: var(--orange-soft);
  color: var(--orange);
}

.transaction-type.promotion {
  background: var(--purple-soft);
  color: var(--purple);
}

.transaction-type.employment-change {
  background: var(--primary-soft);
  color: var(--primary);
}

.transaction-type.offboarding {
  background: var(--red-soft);
  color: var(--red);
}

.transaction-cell small {
  display: block;

  margin-top: 5px;

  color: var(--text-muted);

  font-size: 9px;
}

/* =========================================
   CHANGE
========================================= */

.change-cell {
  display: flex;

  min-width: 190px;

  align-items: center;

  gap: 7px;
}

.change-cell span {
  color:
    var(--text-secondary);

  font-size: 10px;
}

.change-cell strong {
  color:
    var(--text-primary);

  font-size: 11px;
}

.change-cell svg {
  flex-shrink: 0;

  color:
    var(--text-muted);
}

/* =========================================
   STATUS
========================================= */

.transactions-card :deep(.status-badge) {
  min-height: 27px;

  padding: 4px 10px;

  font-size: 10px;

  white-space: nowrap;
}

/* =========================================
   ACTION
========================================= */

.view-button {
  display: inline-flex;

  width: 32px;
  height: 32px;

  align-items: center;
  justify-content: center;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background: transparent;

  color:
    var(--text-secondary);

  cursor: pointer;
}

.view-button:hover {
  border-color:
    var(--primary);

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

/* =========================================
   EMPTY
========================================= */

.empty-state {
  display: flex;

  min-height: 250px;

  flex-direction: column;

  align-items: center;
  justify-content: center;

  gap: 8px;

  color:
    var(--text-muted);
}

.empty-state strong {
  color:
    var(--text-primary);

  font-size: 13px;
}

.empty-state span {
  font-size: 10px;
}
</style>