<script setup lang="ts">
import {
  BadgeDollarSign,
  UserRound,
  Car,
} from 'lucide-vue-next'

import PayrollRateActions from '~/components/payroll/rates/PayrollRateActions.vue'

import type {
  PayrollRate,
} from '~/types/payrollRate'

defineProps<{
  rates: PayrollRate[]
}>()

const emit = defineEmits<{
  view: [rate: PayrollRate]
  edit: [rate: PayrollRate]
  employee: [rate: PayrollRate]
  history: [rate: PayrollRate]
  activate: [rate: PayrollRate]
  deactivate: [rate: PayrollRate]
}>()

const currency = (
  value?: number,
) => {
  if (
    value === undefined ||
    value === null
  ) {
    return '—'
  }

  return new Intl.NumberFormat(
    'en-PH',
    {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    },
  ).format(value)
}

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

const getPrimaryRate = (
  rate: PayrollRate,
) => {
  if (
    rate.payBasis ===
    'Monthly'
  ) {
    return currency(
      rate.monthlyRate,
    )
  }

  if (
    rate.payBasis ===
    'Hourly'
  ) {
    return currency(
      rate.hourlyRate,
    )
  }

  if (
    rate.payBasis ===
    'Trip Based'
  ) {
    return currency(
      rate.tripRate,
    )
  }

  return currency(
    rate.dailyRate,
  )
}

const getPrimaryLabel = (
  rate: PayrollRate,
) => {
  if (
    rate.payBasis ===
    'Monthly'
  ) {
    return 'Monthly'
  }

  if (
    rate.payBasis ===
    'Hourly'
  ) {
    return 'Hourly'
  }

  if (
    rate.payBasis ===
    'Trip Based'
  ) {
    return 'Trip Rate'
  }

  return 'Daily'
}
</script>

<template>
  <article class="table-card">

    <div class="table-heading">

      <div>

        <h3>
          Payroll Rate Directory
        </h3>

        <p>
          Manage employee and driver compensation,
          premium rates and effective payroll rates.
        </p>

      </div>

    </div>

    <div
      v-if="
        rates.length
      "
      class="table-scroll"
    >

      <table class="rate-table">

        <thead>
          <tr>
            <th>Rate Code</th>
            <th>Employee</th>
            <th>Department</th>
            <th>Rate Type</th>
            <th>Pay Basis</th>
            <th>Basic Rate</th>
            <th>Hourly Rate</th>
            <th>OT Rate</th>
            <th>Trip Rate</th>
            <th>Effective Date</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>

        <tbody>

          <tr
            v-for="
              rate in rates
            "
            :key="
              rate.id
            "
          >

            <td>

              <div class="code-cell">

                <div class="code-icon">
                  <BadgeDollarSign :size="15" />
                </div>

                <strong>
                  {{ rate.rateCode }}
                </strong>

              </div>

            </td>

            <td>

              <div class="employee-cell">

                <div
                  class="employee-icon"
                  :class="
                    rate.rateType ===
                    'Driver'
                      ? 'driver'
                      : ''
                  "
                >
                  <Car
                    v-if="
                      rate.rateType ===
                      'Driver'
                    "
                    :size="15"
                  />

                  <UserRound
                    v-else
                    :size="15"
                  />
                </div>

                <div>

                  <strong>
                    {{
                      rate.employeeName
                    }}
                  </strong>

                  <span>
                    {{
                      rate.employeeNumber
                    }}
                    ·
                    {{
                      rate.position
                    }}
                  </span>

                </div>

              </div>

            </td>

            <td>
              {{
                rate.department
              }}
            </td>

            <td>

              <span
                class="type-pill"
                :class="
                  rate.rateType ===
                  'Driver'
                    ? 'driver'
                    : ''
                "
              >
                {{
                  rate.rateType
                }}
              </span>

            </td>

            <td>
              <strong class="basis">
                {{
                  rate.payBasis
                }}
              </strong>
            </td>

            <td>

              <div class="money-cell">

                <span>
                  {{
                    getPrimaryLabel(
                      rate,
                    )
                  }}
                </span>

                <strong>
                  {{
                    getPrimaryRate(
                      rate,
                    )
                  }}
                </strong>

              </div>

            </td>

            <td>
              <strong class="money">
                {{
                  currency(
                    rate.hourlyRate,
                  )
                }}
              </strong>
            </td>

            <td>
              <strong class="money">
                {{
                  currency(
                    rate.overtimeRate,
                  )
                }}
              </strong>
            </td>

            <td>
              <strong
                :class="{
                  money:
                    rate.tripRate,
                  muted:
                    !rate.tripRate,
                }"
              >
                {{
                  currency(
                    rate.tripRate,
                  )
                }}
              </strong>
            </td>

            <td>
              <span class="date">
                {{
                  formatDate(
                    rate.effectiveDate,
                  )
                }}
              </span>
            </td>

            <td>

              <StatusBadge
                :status="
                  rate.status
                "
              />

            </td>

            <td>

              <PayrollRateActions
                :rate="rate"
                @view="
                  emit(
                    'view',
                    rate,
                  )
                "
                @edit="
                  emit(
                    'edit',
                    rate,
                  )
                "
                @employee="
                  emit(
                    'employee',
                    rate,
                  )
                "
                @history="
                  emit(
                    'history',
                    rate,
                  )
                "
                @activate="
                  emit(
                    'activate',
                    rate,
                  )
                "
                @deactivate="
                  emit(
                    'deactivate',
                    rate,
                  )
                "
              />

            </td>

          </tr>

        </tbody>

      </table>

    </div>

    <div
      v-else
      class="empty-state"
    >

      <BadgeDollarSign :size="30" />

      <strong>
        No payroll rates found
      </strong>

      <span>
        Try changing your filters.
      </span>

    </div>

  </article>
</template>

<style scoped>
.table-card {
  overflow: hidden;

  border:
    1px solid var(--border);

  border-radius: 11px;

  background:
    var(--bg-card);

  box-shadow:
    var(--shadow);
}

.table-heading {
  padding:
    15px 16px;

  border-bottom:
    1px solid
    var(--border-soft);
}

.table-heading h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 14px;
}

.table-heading p {
  margin:
    5px 0 0;

  color:
    var(--text-muted);

  font-size: 10px;
}

.table-scroll {
  overflow-x: auto;
}

.rate-table {
  width: 100%;

  min-width: 1550px;

  border-collapse:
    collapse;
}

.rate-table th {
  padding:
    12px 13px;

  border-bottom:
    1px solid var(--border);

  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);

  font-size: 9px;
  font-weight: 700;

  text-align: left;
  text-transform: uppercase;

  white-space: nowrap;
}

.rate-table td {
  padding: 13px;

  border-bottom:
    1px solid
    var(--border-soft);

  color:
    var(--text-secondary);

  font-size: 10px;

  vertical-align: middle;
}

.rate-table
tbody
tr:last-child
td {
  border-bottom: 0;
}

.rate-table
tbody
tr:hover {
  background:
    var(--bg-card-soft);
}

.code-cell,
.employee-cell {
  display: flex;

  align-items: center;

  gap: 8px;
}

.code-icon,
.employee-icon {
  display: flex;

  width: 34px;
  height: 34px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.employee-icon.driver {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.code-cell strong {
  color:
    var(--primary);

  font-size: 9px;
}

.employee-cell {
  min-width: 180px;
}

.employee-cell strong,
.employee-cell span {
  display: block;
}

.employee-cell strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.employee-cell span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 8px;
}

.type-pill {
  display: inline-flex;

  padding:
    5px 8px;

  border-radius: 20px;

  background:
    var(--purple-soft);

  color:
    var(--purple);

  font-size: 8px;
  font-weight: 650;
}

.type-pill.driver {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.basis,
.money,
.date {
  color:
    var(--text-primary);

  font-size: 9px;

  white-space: nowrap;
}

.money-cell span,
.money-cell strong {
  display: block;
}

.money-cell span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.money-cell strong {
  margin-top: 3px;

  color:
    var(--green);

  font-size: 10px;
}

.muted {
  color:
    var(--text-muted);
}

.empty-state {
  display: flex;

  min-height: 250px;

  flex-direction: column;

  align-items: center;
  justify-content: center;

  gap: 7px;

  color:
    var(--text-muted);
}

.empty-state strong {
  color:
    var(--text-primary);

  font-size: 11px;
}

.empty-state span {
  font-size: 9px;
}
</style>