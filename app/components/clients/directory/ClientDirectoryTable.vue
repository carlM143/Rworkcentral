<script setup lang="ts">
import {
  Building2,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Store,
  UsersRound,
} from 'lucide-vue-next'

import type {
  ClientDirectoryRecord,
} from '~/composables/useClientDirectory'

defineProps<{
  clients:
    ClientDirectoryRecord[]
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

const contractClass = (
  status: string,
) => {
  if (
    status ===
    'Active'
  ) {
    return 'active'
  }

  if (
    status ===
    'Expiring Soon'
  ) {
    return 'expiring'
  }

  return 'expired'
}
</script>

<template>
  <article class="table-card">

    <!-- HEADER -->

    <div class="table-heading">

      <div>

        <h3>
          Client Directory
        </h3>

        <p>
          View and manage registered clients,
          contact information, employee assignments
          and contract status.
        </p>

      </div>

    </div>

    <!-- TABLE -->

    <div
      v-if="
        clients.length
      "
      class="table-scroll"
    >

      <table>

        <thead>

          <tr>
            <th>Client Code</th>
            <th>Client</th>
            <th>Industry</th>
            <th>Contact Person</th>
            <th>Contact Details</th>
            <th>Location</th>
            <th>Branches</th>
            <th>Employees</th>
            <th>Contract</th>
            <th>Client Status</th>
            <th>Started</th>
            <th />
          </tr>

        </thead>

        <tbody>

          <tr
            v-for="
              client in clients
            "
            :key="
              client.id
            "
          >

            <!-- CODE -->

            <td>

              <strong class="client-code">
                {{
                  client.code
                }}
              </strong>

            </td>

            <!-- CLIENT -->

            <td>

              <div class="client-cell">

                <div class="client-icon">

                  <Building2
                    :size="16"
                  />

                </div>

                <div>

                  <strong>
                    {{
                      client.name
                    }}
                  </strong>

                  <span>
                    {{
                      client.branches
                    }}
                    {{
                      client.branches === 1
                        ? 'branch'
                        : 'branches'
                    }}
                  </span>

                </div>

              </div>

            </td>

            <!-- INDUSTRY -->

            <td>

              <span class="industry-badge">
                {{
                  client.industry ||
                  'Not specified'
                }}
              </span>

            </td>

            <!-- CONTACT -->

            <td>

              <strong class="contact-person">
                {{
                  client.contactPerson
                }}
              </strong>

            </td>

            <!-- CONTACT DETAILS -->

            <td>

              <div class="contact-details">

                <span
                  v-if="
                    client.email
                  "
                >

                  <Mail :size="11" />

                  {{
                    client.email
                  }}

                </span>

                <span
                  v-if="
                    client.phone
                  "
                >

                  <Phone :size="11" />

                  {{
                    client.phone
                  }}

                </span>

              </div>

            </td>

            <!-- LOCATION -->

            <td>

              <div class="location-cell">

                <MapPin :size="12" />

                <span>
                  {{
                    client.address ||
                    'Not specified'
                  }}
                </span>

              </div>

            </td>

            <!-- BRANCHES -->

            <td>

              <div class="count-cell">

                <Store :size="13" />

                <strong>
                  {{
                    client.branches
                  }}
                </strong>

              </div>

            </td>

            <!-- ASSIGNED EMPLOYEES -->

            <td>

              <div class="employees-cell">

                <UsersRound
                  :size="13"
                />

                <strong>
                  {{
                    client.assignedEmployees
                  }}
                </strong>

              </div>

            </td>

            <!-- CONTRACT -->

            <td>

              <span
                class="contract-badge"
                :class="
                  contractClass(
                    client.contractStatus,
                  )
                "
              >

                {{
                  client.contractStatus
                }}

              </span>

            </td>

            <!-- STATUS -->

            <td>

              <StatusBadge
                :status="
                  client.status
                "
              />

            </td>

            <!-- STARTED -->

            <td>

              <span class="date-value">
                {{
                  formatDate(
                    client.dateStarted,
                  )
                }}
              </span>

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

      <Building2
        :size="32"
      />

      <strong>
        No clients found
      </strong>

      <span>
        Try changing your client filters.
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

  vertical-align: middle;
}

tbody tr:hover {
  background:
    var(--bg-card-soft);
}

/* CLIENT CODE */

.client-code {
  color:
    var(--primary);

  font-size: 9px;

  white-space: nowrap;
}

/* CLIENT */

.client-cell {
  display: flex;

  min-width: 230px;

  align-items: center;

  gap: 9px;
}

.client-icon {
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

.client-cell strong,
.client-cell span {
  display: block;
}

.client-cell strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.client-cell span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 8px;
}

/* INDUSTRY */

.industry-badge {
  display: inline-flex;

  padding:
    5px 7px;

  border-radius: 5px;

  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);

  font-size: 8px;

  white-space: nowrap;
}

/* CONTACT */

.contact-person {
  color:
    var(--text-primary);

  font-size: 9px;

  white-space: nowrap;
}

.contact-details {
  min-width: 205px;
}

.contact-details span {
  display: flex;

  align-items: center;

  gap: 5px;

  margin:
    2px 0;

  color:
    var(--text-secondary);

  font-size: 8px;

  white-space: nowrap;
}

/* LOCATION */

.location-cell {
  display: flex;

  min-width: 180px;

  align-items: center;

  gap: 5px;

  color:
    var(--text-secondary);
}

.location-cell svg {
  flex-shrink: 0;

  color:
    var(--text-muted);
}

/* COUNTS */

.count-cell,
.employees-cell {
  display: inline-flex;

  align-items: center;

  gap: 5px;
}

.count-cell {
  color:
    var(--purple);
}

.employees-cell {
  color:
    var(--primary);
}

.count-cell strong,
.employees-cell strong {
  font-size: 10px;
}

/* CONTRACT */

.contract-badge {
  display: inline-flex;

  padding:
    5px 8px;

  border-radius: 20px;

  font-size: 8px;
  font-weight: 650;

  white-space: nowrap;
}

.contract-badge.active {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.contract-badge.expiring {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.contract-badge.expired {
  background:
    var(--red-soft);

  color:
    var(--red);
}

/* DATE */

.date-value {
  color:
    var(--text-secondary);

  white-space: nowrap;
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