<script setup lang="ts">
import {
  BookOpenText,
  CalendarDays,
  MoreHorizontal,
  ShieldCheck,
  UserCheck,
} from 'lucide-vue-next'

import type {
  CompanyPolicy,
  CompanyPolicyStatus,
} from '~/types/companyPolicy'

defineProps<{
  policies:
    CompanyPolicy[]
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
    CompanyPolicyStatus,
) => {
  if (
    status ===
    'Published'
  ) {
    return 'published'
  }

  if (
    status ===
    'Draft'
  ) {
    return 'draft'
  }

  return 'archived'
}

const acknowledgmentPercent = (
  item: CompanyPolicy,
) => {
  if (
    !item.acknowledgmentRequired ||
    item.totalEmployees <= 0
  ) {
    return 0
  }

  return Math.round(
    (
      item.acknowledgedEmployees /
      item.totalEmployees
    ) *
      100,
  )
}
</script>

<template>
  <article class="table-card">

    <div class="table-heading">

      <div>

        <h3>
          Company Policies
        </h3>

        <p>
          Manage official company policies,
          versions, effective dates and employee
          acknowledgment requirements.
        </p>

      </div>

    </div>

    <div
      v-if="
        policies.length
      "
      class="table-scroll"
    >

      <table>

        <thead>

          <tr>
            <th>Policy</th>
            <th>Category</th>
            <th>Summary</th>
            <th>Version</th>
            <th>Effective Date</th>
            <th>Review Date</th>
            <th>Acknowledgment</th>
            <th>Acknowledgment Progress</th>
            <th>Owner</th>
            <th>Status</th>
            <th>Last Updated</th>
            <th />
          </tr>

        </thead>

        <tbody>

          <tr
            v-for="
              item in policies
            "
            :key="
              item.id
            "
          >

            <!-- POLICY -->

            <td>

              <div class="policy-cell">

                <div class="policy-icon">

                  <BookOpenText
                    :size="16"
                  />

                </div>

                <div>

                  <strong>
                    {{
                      item.title
                    }}
                  </strong>

                  <span>
                    {{
                      item.policyNumber
                    }}
                  </span>

                </div>

              </div>

            </td>

            <!-- CATEGORY -->

            <td>

              <span class="category-badge">
                {{
                  item.category
                }}
              </span>

            </td>

            <!-- SUMMARY -->

            <td>

              <p class="summary">
                {{
                  item.summary
                }}
              </p>

            </td>

            <!-- VERSION -->

            <td>

              <span class="version">
                {{
                  item.version
                }}
              </span>

            </td>

            <!-- EFFECTIVE -->

            <td>

              <div class="date-cell">

                <CalendarDays
                  :size="13"
                />

                <strong>
                  {{
                    formatDate(
                      item.effectiveDate,
                    )
                  }}
                </strong>

              </div>

            </td>

            <!-- REVIEW -->

            <td>

              <span class="review-date">
                {{
                  formatDate(
                    item.reviewDate,
                  )
                }}
              </span>

            </td>

            <!-- ACK REQUIREMENT -->

            <td>

              <span
                class="ack-badge"
                :class="
                  item.acknowledgmentRequired
                    ? 'required'
                    : 'not-required'
                "
              >

                <ShieldCheck
                  :size="12"
                />

                {{
                  item.acknowledgmentRequired
                    ? 'Required'
                    : 'Not Required'
                }}

              </span>

            </td>

            <!-- PROGRESS -->

            <td>

              <div
                v-if="
                  item.acknowledgmentRequired
                "
                class="ack-progress"
              >

                <div class="ack-progress-header">

                  <span>
                    {{
                      item.acknowledgedEmployees
                    }}
                    /
                    {{
                      item.totalEmployees
                    }}
                  </span>

                  <strong>
                    {{
                      acknowledgmentPercent(
                        item,
                      )
                    }}%
                  </strong>

                </div>

                <div class="progress-track">

                  <div
                    class="progress-bar"
                    :style="{
                      width:
                        `${acknowledgmentPercent(
                          item,
                        )}%`,
                    }"
                  />

                </div>

              </div>

              <span
                v-else
                class="not-applicable"
              >
                Not applicable
              </span>

            </td>

            <!-- OWNER -->

            <td>

              <div class="owner-cell">

                <UserCheck
                  :size="13"
                />

                <strong>
                  {{
                    item.owner
                  }}
                </strong>

              </div>

            </td>

            <!-- STATUS -->

            <td>

              <span
                class="status-badge"
                :class="
                  statusClass(
                    item.status,
                  )
                "
              >

                <span class="status-dot" />

                {{
                  item.status
                }}

              </span>

            </td>

            <!-- UPDATED -->

            <td>

              <span class="updated-date">
                {{
                  formatDate(
                    item.updatedAt.slice(
                      0,
                      10,
                    ),
                  )
                }}
              </span>

            </td>

            <!-- ACTION -->

            <td>

              <button
                type="button"
                class="action-button"
                title="Policy actions will be added later"
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

      <BookOpenText
        :size="34"
      />

      <strong>
        No company policies found
      </strong>

      <span>
        Try changing your company policy filters.
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
    1px solid var(--border-soft);
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

  min-width: 2100px;

  border-collapse: collapse;
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

  text-transform: uppercase;

  white-space: nowrap;
}

td {
  padding:
    13px;

  border-top:
    1px solid var(--border-soft);

  color:
    var(--text-secondary);

  font-size: 10px;

  vertical-align: middle;
}

tbody tr:hover {
  background:
    var(--bg-card-soft);
}

/* POLICY */

.policy-cell {
  display: flex;

  min-width: 235px;

  align-items: center;

  gap: 9px;
}

.policy-icon {
  display: flex;

  width: 36px;
  height: 36px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.policy-cell strong,
.policy-cell span {
  display: block;
}

.policy-cell strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.policy-cell span {
  margin-top: 3px;

  color:
    var(--primary);

  font-size: 9px;
  font-weight: 650;
}

/* CATEGORY */

.category-badge {
  display: inline-flex;

  padding:
    5px 9px;

  border-radius: 20px;

  background:
    var(--purple-soft);

  color:
    var(--purple);

  font-size: 9px;
  font-weight: 650;

  white-space: nowrap;
}

/* SUMMARY */

.summary {
  width: 280px;

  margin: 0;

  color:
    var(--text-secondary);

  font-size: 10px;

  line-height: 1.45;
}

/* VERSION */

.version {
  display: inline-flex;

  padding:
    5px 8px;

  border:
    1px solid var(--border);

  border-radius: 6px;

  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);

  font-size: 9px;
  font-weight: 700;
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
    var(--primary);
}

.date-cell strong {
  color:
    var(--text-primary);
}

.review-date,
.updated-date {
  white-space: nowrap;
}

/* ACK */

.ack-badge {
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

.ack-badge.required {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.ack-badge.not-required {
  background:
    var(--bg-card-soft);

  color:
    var(--text-muted);
}

/* PROGRESS */

.ack-progress {
  width: 155px;
}

.ack-progress-header {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 8px;

  margin-bottom: 5px;
}

.ack-progress-header span {
  color:
    var(--text-secondary);

  font-size: 9px;
}

.ack-progress-header strong {
  color:
    var(--text-primary);

  font-size: 9px;
}

.progress-track {
  overflow: hidden;

  height: 5px;

  border-radius: 20px;

  background:
    var(--border-soft);
}

.progress-bar {
  height: 100%;

  border-radius: inherit;

  background:
    var(--primary);
}

.not-applicable {
  color:
    var(--text-muted);

  font-size: 9px;

  white-space: nowrap;
}

/* OWNER */

.owner-cell {
  display: flex;

  min-width: 130px;

  align-items: center;

  gap: 5px;

  color:
    var(--text-primary);
}

.owner-cell svg {
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

.status-badge.published {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.status-badge.draft {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.status-badge.archived {
  background:
    var(--bg-card-soft);

  color:
    var(--text-muted);
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