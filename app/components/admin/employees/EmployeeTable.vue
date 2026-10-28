<script setup lang="ts">
import {
  Users,
} from 'lucide-vue-next'

import type { Employee } from '~/types/employee'

const props = withDefaults(
  defineProps<{
    employees: Employee[]
    mode?: 'active' | 'inactive'
  }>(),
  {
    mode: 'active',
  },
)

const tableTitle = computed(() => {
  return props.mode === 'inactive'
    ? 'Inactive Employee Directory'
    : 'Employee Directory'
})

const tableDescription = computed(() => {
  return props.mode === 'inactive'
    ? 'View and manage inactive employee records.'
    : 'View and manage active employee records.'
})

const emptyTitle = computed(() => {
  return props.mode === 'inactive'
    ? 'No inactive employees found'
    : 'No employees found'
})

const getFullName = (
  employee: Employee,
) => {
  return [
    employee.firstName,
    employee.middleName,
    employee.lastName,
  ]
    .filter(Boolean)
    .join(' ')
}

const getInitials = (
  employee: Employee,
) => {
  return `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`
    .toUpperCase()
}

const formatDate = (
  date?: string,
) => {
  if (!date) {
    return 'Not provided'
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    },
  ).format(
    new Date(`${date}T00:00:00`),
  )
}

const emit = defineEmits<{
  statusChanged: [payload: { id: number; status: 'Active' | 'Inactive' }]
}>()



</script>

<template>
  <div class="table-card">
    <div class="table-heading">
      <div>
        <h3>
          {{ tableTitle }}
        </h3>

        <p>
          {{ tableDescription }}
        </p>
      </div>
    </div>

    <div
      v-if="employees.length"
      class="table-scroll"
    >
      <table class="employee-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Employee ID</th>
            <th>Department</th>
            <th>Position</th>
            <th>Employment</th>
            <th>Status</th>
            <th>
              {{
                mode === 'inactive'
                  ? 'Date Inactive'
                  : 'Date Hired'
              }}
            </th>
            <th class="action-column" />
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="employee in employees"
            :key="employee.id"
          >
            <td>
              <div class="employee-cell">
                <div class="employee-avatar">
                  {{ getInitials(employee) }}
                </div>

                <div class="employee-info">
                  <strong>
                    {{ getFullName(employee) }}
                  </strong>

                  <span>
                    {{ employee.email }}
                  </span>
                </div>
              </div>
            </td>

            <td>
              <span class="employee-number">
                {{ employee.employeeNumber }}
              </span>
            </td>

            <td>
              {{ employee.department }}
            </td>

            <td>
              {{ employee.position }}
            </td>

            <td>
              <StatusBadge
                :status="employee.employmentType"
              />
            </td>

            <td>
              <StatusBadge
                :status="employee.status"
              />
            </td>

            <td>
              {{
                formatDate(
                  mode === 'inactive'
                    ? employee.inactiveDate
                    : employee.dateHired,
                )
              }}
            </td>

            <td class="action-column">
              <EmployeeActions
                :employee="employee"
                :mode="mode"
                @status-changed="emit('statusChanged', $event)"
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
      <div class="empty-icon">
        <Users :size="24" />
      </div>

      <strong>
        {{ emptyTitle }}
      </strong>

      <p>
        Try changing your search or filters.
      </p>
    </div>
  </div>
</template>

<style scoped>
.table-card {
  position: relative;

  border: 1px solid var(--border);
  border-radius: 11px;

  background: var(--bg-card);

  box-shadow: var(--shadow);
}

.table-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 15px 17px;

  border-bottom: 1px solid var(--border-soft);
}

.table-heading h3 {
  margin: 0;

  color: var(--text-primary);

  font-size: 13px;
  font-weight: 700;
}

.table-heading p {
  margin: 4px 0 0;

  color: var(--text-muted);

  font-size: 9px;
}

.table-scroll {
  overflow-x: auto;
}

.employee-table {
  width: 100%;
  min-width: 1050px;

  border-collapse: collapse;
}

.employee-table th {
  padding: 11px 14px;

  border-bottom: 1px solid var(--border);

  background: var(--bg-card-soft);
  color: var(--text-secondary);

  font-size: 9px;
  font-weight: 650;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 0.35px;
}

.employee-table td {
  padding: 12px 14px;

  border-bottom: 1px solid var(--border-soft);

  color: var(--text-secondary);

  font-size: 10px;
}

.employee-table tbody tr:last-child td {
  border-bottom: 0;
}

.employee-table tbody tr {
  transition: background 0.15s ease;
}

.employee-table tbody tr:hover {
  background: var(--bg-card-soft);
}

.employee-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.employee-avatar {
  display: flex;
  width: 35px;
  height: 35px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background: var(--primary-soft);
  color: var(--primary);

  font-size: 10px;
  font-weight: 700;
}

.employee-info strong {
  display: block;

  margin-bottom: 3px;

  color: var(--text-primary);

  font-size: 10px;
  font-weight: 650;
}

.employee-info span {
  display: block;

  max-width: 190px;

  overflow: hidden;

  color: var(--text-muted);

  font-size: 8px;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.employee-number {
  color: var(--primary);
  font-weight: 600;
}

.action-column {
  width: 45px;
  text-align: right !important;
}

.empty-state {
  display: flex;
  min-height: 260px;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: 30px;

  text-align: center;
}

.empty-icon {
  display: flex;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;

  margin-bottom: 12px;

  border-radius: 12px;

  background: var(--primary-soft);
  color: var(--primary);
}

.empty-state strong {
  color: var(--text-primary);
  font-size: 13px;
}

.empty-state p {
  margin: 5px 0 0;

  color: var(--text-muted);
  font-size: 10px;
}
</style>