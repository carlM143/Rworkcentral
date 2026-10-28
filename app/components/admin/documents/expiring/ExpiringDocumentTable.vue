<script setup lang="ts">
import {
  CalendarClock,
  FileText,
  MoreHorizontal,
  UserRound,
} from 'lucide-vue-next'

import type {
  ExpiringDocument,
  ExpiringDocumentStatus,
} from '~/types/expiringDocument'

const props =
  defineProps<{
    documents:
      ExpiringDocument[]

    getDaysRemaining:
      (
        expiryDate: string,
      ) => number

    getDocumentStatus:
      (
        expiryDate: string,
      ) => ExpiringDocumentStatus
  }>()

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

const statusClass = (
  status:
    ExpiringDocumentStatus,
) => {
  if (
    status === 'Expired'
  ) {
    return 'expired'
  }

  if (
    status === 'Critical'
  ) {
    return 'critical'
  }

  if (
    status ===
    'Expiring Soon'
  ) {
    return 'soon'
  }

  return 'monitor'
}

const daysText = (
  expiryDate: string,
) => {
  const days =
    props.getDaysRemaining(
      expiryDate,
    )

  if (days < 0) {
    const value =
      Math.abs(days)

    return `${value} ${
      value === 1
        ? 'day'
        : 'days'
    } overdue`
  }

  if (days === 0) {
    return 'Expires today'
  }

  return `${days} ${
    days === 1
      ? 'day'
      : 'days'
  } left`
}
</script>

<template>
  <article class="table-card">

    <div class="table-heading">

      <div>

        <h3>
          Expiring Documents
        </h3>

        <p>
          Monitor employee documents approaching
          expiration and records requiring renewal.
        </p>

      </div>

    </div>

    <div
      v-if="
        documents.length
      "
      class="table-scroll"
    >

      <table>

        <thead>

          <tr>
            <th>Employee</th>
            <th>Department</th>
            <th>Category</th>
            <th>Document</th>
            <th>Document No.</th>
            <th>Issued Date</th>
            <th>Expiry Date</th>
            <th>Days Remaining</th>
            <th>Expiry Status</th>
            <th>Issuing Authority</th>
            <th>Remarks</th>
            <th />
          </tr>

        </thead>

        <tbody>

          <tr
            v-for="
              item in documents
            "
            :key="
              item.id
            "
          >

            <!-- EMPLOYEE -->

            <td>

              <div class="employee-cell">

                <div class="employee-icon">

                  <UserRound
                    :size="16"
                  />

                </div>

                <div>

                  <strong>
                    {{
                      item.employeeName
                    }}
                  </strong>

                  <span>
                    {{
                      item.employeeNumber
                    }}
                    ·
                    {{
                      item.position
                    }}
                  </span>

                </div>

              </div>

            </td>

            <!-- DEPARTMENT -->

            <td>

              <strong class="department">
                {{
                  item.department
                }}
              </strong>

            </td>

            <!-- CATEGORY -->

            <td>

              <span class="category-badge">
                {{
                  item.category
                }}
              </span>

            </td>

            <!-- DOCUMENT -->

            <td>

              <div class="document-cell">

                <FileText
                  :size="14"
                />

                <strong>
                  {{
                    item.documentName
                  }}
                </strong>

              </div>

            </td>

            <!-- NUMBER -->

            <td>

              <span class="document-number">
                {{
                  item.documentNumber ||
                  '—'
                }}
              </span>

            </td>

            <!-- ISSUED -->

            <td>

              <span class="date-value">
                {{
                  formatDate(
                    item.issuedDate,
                  )
                }}
              </span>

            </td>

            <!-- EXPIRY -->

            <td>

              <div class="expiry-date">

                <CalendarClock
                  :size="14"
                />

                <strong>
                  {{
                    formatDate(
                      item.expiryDate,
                    )
                  }}
                </strong>

              </div>

            </td>

            <!-- DAYS -->

            <td>

              <strong
                class="days-remaining"
                :class="
                  statusClass(
                    getDocumentStatus(
                      item.expiryDate,
                    ),
                  )
                "
              >
                {{
                  daysText(
                    item.expiryDate,
                  )
                }}
              </strong>

            </td>

            <!-- STATUS -->

            <td>

              <span
                class="status-badge"
                :class="
                  statusClass(
                    getDocumentStatus(
                      item.expiryDate,
                    ),
                  )
                "
              >

                <span class="status-dot" />

                {{
                  getDocumentStatus(
                    item.expiryDate,
                  )
                }}

              </span>

            </td>

            <!-- AUTHORITY -->

            <td>

              <span class="authority">
                {{
                  item.issuingAuthority ||
                  '—'
                }}
              </span>

            </td>

            <!-- REMARKS -->

            <td>

              <p class="remarks">
                {{
                  item.remarks ||
                  'No remarks'
                }}
              </p>

            </td>

            <!-- ACTION -->

            <td>

              <button
                type="button"
                class="action-button"
                title="Actions will be added later"
              >

                <MoreHorizontal
                  :size="18"
                />

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

      <CalendarClock
        :size="34"
      />

      <strong>
        No expiring documents found
      </strong>

      <span>
        Try changing your document filters.
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
    16px 17px;

  border-bottom:
    1px solid
    var(--border-soft);
}

.table-heading h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 15px;
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

table {
  width: 100%;

  min-width: 2050px;

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

  font-size: 10px;
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

  font-size: 10px;

  vertical-align: middle;
}

tbody tr:hover {
  background:
    var(--bg-card-soft);
}

/* EMPLOYEE */

.employee-cell {
  display: flex;

  min-width: 225px;

  align-items: center;

  gap: 9px;
}

.employee-icon {
  display: flex;

  width: 35px;
  height: 35px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
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

  font-size: 9px;
}

.department {
  color:
    var(--text-primary);

  white-space: nowrap;
}

/* CATEGORY */

.category-badge {
  display: inline-flex;

  padding:
    5px 9px;

  border-radius: 20px;

  background:
    var(--primary-soft);

  color:
    var(--primary);

  font-size: 9px;
  font-weight: 650;

  white-space: nowrap;
}

/* DOCUMENT */

.document-cell {
  display: flex;

  min-width: 200px;

  align-items: center;

  gap: 6px;
}

.document-cell svg {
  color:
    var(--primary);
}

.document-cell strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.document-number,
.date-value,
.authority {
  white-space: nowrap;
}

/* EXPIRY */

.expiry-date {
  display: flex;

  align-items: center;

  gap: 5px;

  white-space: nowrap;
}

.expiry-date svg {
  color:
    var(--orange);
}

.expiry-date strong {
  color:
    var(--text-primary);
}

/* DAYS */

.days-remaining {
  font-size: 10px;

  white-space: nowrap;
}

.days-remaining.expired {
  color:
    var(--red);
}

.days-remaining.critical {
  color:
    var(--orange);
}

.days-remaining.soon {
  color:
    var(--purple);
}

.days-remaining.monitor {
  color:
    var(--primary);
}

/* STATUS */

.status-badge {
  display: inline-flex;

  align-items: center;

  gap: 5px;

  padding:
    5px 8px;

  border-radius: 20px;

  font-size: 9px;
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

.status-badge.expired {
  background:
    var(--red-soft);

  color:
    var(--red);
}

.status-badge.critical {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.status-badge.soon {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.status-badge.monitor {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

/* REMARKS */

.remarks {
  width: 220px;

  margin: 0;

  overflow: hidden;

  color:
    var(--text-secondary);

  font-size: 10px;

  text-overflow: ellipsis;

  white-space: nowrap;
}

/* ACTION */

.action-button {
  display: flex;

  width: 32px;
  height: 32px;

  align-items: center;
  justify-content: center;

  border:
    1px solid transparent;

  border-radius: 7px;

  background:
    transparent;

  color:
    var(--text-secondary);
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

  min-height: 260px;

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

  font-size: 12px;
}

.empty-state span {
  font-size: 10px;
}
</style>