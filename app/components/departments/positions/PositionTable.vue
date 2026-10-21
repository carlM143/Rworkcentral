<script setup lang="ts">
import {
  BriefcaseBusiness,
  Building2,
  Users,
} from 'lucide-vue-next'

import type {
  Position,
  PositionLevel,
  PositionStatus,
} from '~/types/position'

defineProps<{
  positions: Position[]
}>()

const emit = defineEmits<{ edit: [position: Position] }>()

const formatCurrency = (
  value?: number,
) => {
  if (
    value === undefined
  ) {
    return '—'
  }

  return new Intl.NumberFormat(
    'en-PH',
    {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0,
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
    new Date(value),
  )
}

const levelClass = (
  level:
    PositionLevel,
) => {
  if (
    level ===
    'Manager' ||
    level ===
    'Executive'
  ) {
    return 'manager'
  }

  if (
    level ===
    'Supervisor'
  ) {
    return 'supervisor'
  }

  if (
    level ===
    'Senior'
  ) {
    return 'senior'
  }

  if (
    level ===
    'Entry Level'
  ) {
    return 'entry'
  }

  return 'staff'
}

const statusClass = (
  status:
    PositionStatus,
) => {
  return status ===
    'Active'
    ? 'active'
    : 'inactive'
}

const vacancyCount = (
  item: Position,
) => {
  return Math.max(
    0,
    item.approvedHeadcount -
      item.currentHeadcount,
  )
}
</script>

<template>
  <article class="table-card">

    <!-- HEADER -->

    <div class="table-heading">

      <div>

        <h3>
          Positions & Designations
        </h3>

        <p>
          Manage company job positions,
          department assignments, approved
          headcount and vacancies.
        </p>

      </div>

    </div>

    <!-- TABLE -->

    <div
      v-if="
        positions.length
      "
      class="table-scroll"
    >

      <table>

        <thead>

          <tr>
            <th>Position</th>
            <th>Department</th>
            <th>Level</th>
            <th>Description</th>
            <th>Headcount</th>
            <th>Approved Slots</th>
            <th>Vacancies</th>
            <th>Salary Range</th>
            <th>Status</th>
            <th>Last Updated</th>
            <th />
          </tr>

        </thead>

        <tbody>

          <tr
            v-for="
              item in positions
            "
            :key="
              item.id
            "
          >

            <!-- POSITION -->

            <td>

              <div class="position-cell">

                <div class="position-icon">

                  <BriefcaseBusiness
                    :size="16"
                  />

                </div>

                <div>

                  <strong>
                    {{
                      item.name
                    }}
                  </strong>

                  <span>
                    {{
                      item.code
                    }}
                  </span>

                </div>

              </div>

            </td>

            <!-- DEPARTMENT -->

            <td>

              <div class="department-cell">

                <Building2
                  :size="13"
                />

                <strong>
                  {{
                    item.department
                  }}
                </strong>

              </div>

            </td>

            <!-- LEVEL -->

            <td>

              <span
                class="level-badge"
                :class="
                  levelClass(
                    item.level,
                  )
                "
              >
                {{
                  item.level
                }}
              </span>

            </td>

            <!-- DESCRIPTION -->

            <td>

              <p class="description">
                {{
                  item.description
                }}
              </p>

            </td>

            <!-- CURRENT -->

            <td>

              <div class="headcount-cell">

                <Users
                  :size="13"
                />

                <strong>
                  {{
                    item.currentHeadcount
                  }}
                </strong>

                <span>
                  employees
                </span>

              </div>

            </td>

            <!-- APPROVED -->

            <td>

              <strong class="approved-headcount">
                {{
                  item.approvedHeadcount
                }}
              </strong>

            </td>

            <!-- VACANCIES -->

            <td>

              <span
                class="vacancy-badge"
                :class="{
                  available:
                    vacancyCount(
                      item,
                    ) > 0,
                  full:
                    vacancyCount(
                      item,
                    ) === 0,
                }"
              >

                {{
                  vacancyCount(
                    item,
                  )
                }}

                {{
                  vacancyCount(
                    item,
                  ) === 1
                    ? 'vacancy'
                    : 'vacancies'
                }}

              </span>

            </td>

            <!-- SALARY -->

            <td>

              <div class="salary-cell">

                <strong>
                  {{
                    formatCurrency(
                      item.minimumSalary,
                    )
                  }}
                </strong>

                <span>
                  to
                </span>

                <strong>
                  {{
                    formatCurrency(
                      item.maximumSalary,
                    )
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
                    item.updatedAt,
                  )
                }}
              </span>

            </td>

            <!-- ACTION -->

            <td>

              <PositionActions :position="item" @edit="emit('edit', $event)" />

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

      <BriefcaseBusiness
        :size="34"
      />

      <strong>
        No positions found
      </strong>

      <span>
        Try changing your position filters.
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

  min-width: 1800px;

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
    1px solid var(--border-soft);

  color:
    var(--text-secondary);

  font-size: 10px;

  vertical-align:
    middle;
}

tbody tr:hover {
  background:
    var(--bg-card-soft);
}

/* POSITION */

.position-cell {
  display: flex;

  min-width: 215px;

  align-items: center;

  gap: 9px;
}

.position-icon {
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

.position-cell strong,
.position-cell span {
  display: block;
}

.position-cell strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.position-cell span {
  margin-top: 3px;

  color:
    var(--primary);

  font-size: 9px;
  font-weight: 600;
}

/* DEPARTMENT */

.department-cell {
  display: flex;

  align-items: center;

  gap: 6px;

  min-width: 145px;

  color:
    var(--text-primary);
}

.department-cell svg {
  color:
    var(--text-muted);
}

/* LEVEL */

.level-badge {
  display: inline-flex;

  padding:
    5px 8px;

  border-radius: 20px;

  font-size: 9px;
  font-weight: 650;

  white-space: nowrap;
}

.level-badge.entry {
  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);
}

.level-badge.staff {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.level-badge.senior {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.level-badge.supervisor {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.level-badge.manager {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

/* DESCRIPTION */

.description {
  width: 270px;

  margin: 0;

  color:
    var(--text-secondary);

  font-size: 10px;

  line-height: 1.5;
}

/* HEADCOUNT */

.headcount-cell {
  display: flex;

  align-items: center;

  gap: 5px;

  white-space: nowrap;
}

.headcount-cell svg {
  color:
    var(--primary);
}

.headcount-cell strong {
  color:
    var(--text-primary);

  font-size: 11px;
}

.headcount-cell span {
  color:
    var(--text-muted);

  font-size: 9px;
}

.approved-headcount {
  color:
    var(--text-primary);

  font-size: 11px;
}

/* VACANCY */

.vacancy-badge {
  display: inline-flex;

  padding:
    5px 8px;

  border-radius: 20px;

  font-size: 9px;
  font-weight: 650;

  white-space: nowrap;
}

.vacancy-badge.available {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.vacancy-badge.full {
  background:
    var(--green-soft);

  color:
    var(--green);
}

/* SALARY */

.salary-cell {
  min-width: 145px;
}

.salary-cell strong,
.salary-cell span {
  display: block;
}

.salary-cell strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.salary-cell span {
  margin:
    2px 0;

  color:
    var(--text-muted);

  font-size: 9px;
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

.status-badge.active {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.status-badge.inactive {
  background:
    var(--red-soft);

  color:
    var(--red);
}

.updated-date {
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