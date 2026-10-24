<script setup lang="ts">
import {
  Building2,
  CalendarDays,
  MoreHorizontal,
  ReceiptText,
} from 'lucide-vue-next'

import type {
  BillingRate,
  BillingRateStatus,
  BillingRateType,
} from '~/types/billingRate'

defineProps<{
  rates: BillingRate[]
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

const formatDate = (
  value?: string,
) => {
  if (!value) {
    return '—'
  }

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

const rateUnit = (
  type: BillingRateType,
) => {
  if (type === 'Hourly') {
    return '/ hr'
  }

  if (type === 'Daily') {
    return '/ day'
  }

  if (type === 'Monthly') {
    return '/ month'
  }

  if (type === 'Per Trip') {
    return '/ trip'
  }

  return ''
}

const rateTypeClass = (
  type: BillingRateType,
) => {
  if (type === 'Hourly') {
    return 'hourly'
  }

  if (type === 'Daily') {
    return 'daily'
  }

  if (type === 'Monthly') {
    return 'monthly'
  }

  if (type === 'Per Trip') {
    return 'trip'
  }

  return 'fixed'
}

const statusClass = (
  status: BillingRateStatus,
) => {
  if (status === 'Active') {
    return 'active'
  }

  if (status === 'Scheduled') {
    return 'scheduled'
  }

  if (status === 'Expired') {
    return 'expired'
  }

  return 'inactive'
}
</script>

<template>
  <article class="table-card">

    <!-- HEADER -->

    <div class="table-heading">

      <div>

        <h3>
          Billing Rates
        </h3>

        <p>
          Review master billing rates used for client
          billing computation and rate effectivity.
        </p>

      </div>

    </div>

    <!-- TABLE -->

    <div
      v-if="rates.length"
      class="table-scroll"
    >

      <table>

        <thead>

          <tr>
            <th>Rate Code</th>
            <th>Client</th>
            <th>Position / Service</th>
            <th>Rate Type</th>
            <th>Regular Rate</th>
            <th>OT Rate</th>
            <th>Holiday Rate</th>
            <th>Night Diff.</th>
            <th>Effective Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Created By</th>
            <th />
          </tr>

        </thead>

        <tbody>

          <tr
            v-for="rate in rates"
            :key="rate.id"
          >

            <!-- RATE CODE -->

            <td>

              <div class="rate-code">

                <ReceiptText
                  :size="13"
                />

                <strong>
                  {{ rate.rateCode }}
                </strong>

              </div>

            </td>

            <!-- CLIENT -->

            <td>

              <div class="client-cell">

                <div class="client-icon">

                  <Building2
                    :size="15"
                  />

                </div>

                <div>

                  <strong>
                    {{ rate.clientName }}
                  </strong>

                  <span>
                    {{ rate.clientCode }}
                  </span>

                </div>

              </div>

            </td>

            <!-- POSITION -->

            <td>

              <strong class="position">
                {{ rate.positionOrService }}
              </strong>

            </td>

            <!-- TYPE -->

            <td>

              <span
                class="rate-type-badge"
                :class="
                  rateTypeClass(
                    rate.rateType,
                  )
                "
              >
                {{ rate.rateType }}
              </span>

            </td>

            <!-- REGULAR RATE -->

            <td>

              <div class="regular-rate">

                <strong>
                  {{
                    money(
                      rate.regularRate,
                    )
                  }}
                </strong>

                <span>
                  {{
                    rateUnit(
                      rate.rateType,
                    )
                  }}
                </span>

              </div>

            </td>

            <!-- OT -->

            <td>

              <span
                v-if="
                  rate.overtimeRate >
                  0
                "
                class="ot-rate"
              >
                {{
                  money(
                    rate.overtimeRate,
                  )
                }}
                / hr
              </span>

              <span
                v-else
                class="empty-value"
              >
                —
              </span>

            </td>

            <!-- HOLIDAY -->

            <td>

              <span
                v-if="
                  rate.holidayRate >
                  0
                "
              >
                {{
                  money(
                    rate.holidayRate,
                  )
                }}
              </span>

              <span
                v-else
                class="empty-value"
              >
                —
              </span>

            </td>

            <!-- ND -->

            <td>

              <span
                v-if="
                  rate.nightDifferentialRate >
                  0
                "
                class="nd-rate"
              >
                {{
                  money(
                    rate.nightDifferentialRate,
                  )
                }}
              </span>

              <span
                v-else
                class="empty-value"
              >
                —
              </span>

            </td>

            <!-- EFFECTIVE -->

            <td>

              <div class="date-cell">

                <CalendarDays
                  :size="12"
                />

                {{
                  formatDate(
                    rate.effectiveDate,
                  )
                }}

              </div>

            </td>

            <!-- END DATE -->

            <td>

              <span
                :class="{
                  'end-date':
                    rate.endDate,
                }"
              >
                {{
                  formatDate(
                    rate.endDate,
                  )
                }}
              </span>

            </td>

            <!-- STATUS -->

            <td>

              <span
                class="status-badge"
                :class="
                  statusClass(
                    rate.status,
                  )
                "
              >

                <span class="status-dot" />

                {{ rate.status }}

              </span>

            </td>

            <!-- CREATED BY -->

            <td>

              <div class="created-cell">

                <strong>
                  {{ rate.createdBy }}
                </strong>

                <span>
                  Rate creator
                </span>

              </div>

            </td>

            <!-- ACTION -->

            <td>

              <button
                type="button"
                class="action-button"
                title="Actions will be added later"
              >

                <MoreHorizontal
                  :size="17"
                />

              </button>

            </td>

          </tr>

        </tbody>

      </table>

    </div>

    <!-- EMPTY -->

    <div
      v-else
      class="empty-state"
    >

      <ReceiptText
        :size="31"
      />

      <strong>
        No billing rates found
      </strong>

      <span>
        Try changing your billing rate filters.
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

  font-size: 9px;
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;

  min-width: 1900px;

  border-collapse:
    collapse;
}

th {
  padding:
    12px 13px;

  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);

  font-size: 9px;
  font-weight: 700;

  text-align: left;

  text-transform:
    uppercase;

  white-space: nowrap;
}

td {
  padding:
    13px;

  border-top:
    1px solid
    var(--border-soft);

  color:
    var(--text-secondary);

  font-size: 9px;

  vertical-align:
    middle;
}

tbody tr:hover {
  background:
    var(--bg-card-soft);
}

/* RATE CODE */

.rate-code {
  display: flex;

  align-items: center;

  gap: 5px;

  color:
    var(--primary);

  white-space: nowrap;
}

.rate-code strong {
  font-size: 9px;
}

/* CLIENT */

.client-cell {
  display: flex;

  min-width: 220px;

  align-items: center;

  gap: 8px;
}

.client-icon {
  display: flex;

  width: 33px;
  height: 33px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.client-cell strong,
.client-cell span {
  display: block;
}

.client-cell strong {
  color:
    var(--text-primary);

  font-size: 9px;
}

.client-cell span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 8px;
}

/* POSITION */

.position {
  color:
    var(--text-primary);

  white-space: nowrap;
}

/* RATE TYPE */

.rate-type-badge {
  display: inline-flex;

  padding:
    5px 8px;

  border-radius: 20px;

  font-size: 8px;
  font-weight: 650;

  white-space: nowrap;
}

.rate-type-badge.hourly {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.rate-type-badge.daily {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.rate-type-badge.monthly {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.rate-type-badge.trip {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.rate-type-badge.fixed {
  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);
}

/* RATE */

.regular-rate {
  min-width: 105px;
}

.regular-rate strong,
.regular-rate span {
  display: block;
}

.regular-rate strong {
  color:
    var(--text-primary);

  font-size: 10px;

  white-space: nowrap;
}

.regular-rate span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 7px;
}

.ot-rate {
  color:
    var(--purple);

  white-space: nowrap;
}

.nd-rate {
  color:
    var(--primary);

  white-space: nowrap;
}

.empty-value {
  color:
    var(--text-muted);
}

/* DATE */

.date-cell {
  display: flex;

  align-items: center;

  gap: 5px;

  white-space: nowrap;
}

.date-cell svg {
  color:
    var(--text-muted);
}

.end-date {
  white-space: nowrap;
}

/* STATUS */

.status-badge {
  display: inline-flex;

  align-items: center;

  gap: 5px;

  padding:
    5px 8px;

  border-radius: 20px;

  font-size: 8px;
  font-weight: 650;

  white-space: nowrap;
}

.status-dot {
  width: 5px;
  height: 5px;

  border-radius: 50%;

  background:
    currentColor;
}

.status-badge.active {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.status-badge.scheduled {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.status-badge.expired {
  background:
    var(--red-soft);

  color:
    var(--red);
}

.status-badge.inactive {
  background:
    var(--bg-card-soft);

  color:
    var(--text-muted);
}

/* CREATED */

.created-cell {
  min-width: 120px;
}

.created-cell strong,
.created-cell span {
  display: block;
}

.created-cell strong {
  color:
    var(--text-primary);

  font-size: 9px;
}

.created-cell span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 8px;
}

/* ACTION */

.action-button {
  display: flex;

  width: 31px;
  height: 31px;

  align-items: center;
  justify-content: center;

  border:
    1px solid transparent;

  border-radius: 7px;

  background:
    transparent;

  color:
    var(--text-secondary);

  cursor: pointer;
}

.action-button:hover {
  border-color:
    var(--border);

  background:
    var(--bg-card-soft);

  color:
    var(--primary);
}

/* EMPTY */

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