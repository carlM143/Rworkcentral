<script setup lang="ts">
import { Users } from 'lucide-vue-next'
import type { Employee } from '~/types/employee'

const props = withDefaults(
  defineProps<{
    employees: Employee[]
    mode?: 'active' | 'inactive'
  }>(),
  { mode: 'active' },
)

const emit = defineEmits<{
  statusChanged: [payload: { id: number; status: 'Active' | 'Inactive' }]
}>()

const tableTitle = computed(() =>
  props.mode === 'inactive' ? 'Inactive Employee Directory' : 'Employee Directory',
)

const tableDescription = computed(() =>
  props.mode === 'inactive'
    ? 'View and manage inactive employee records.'
    : 'View and manage active employee records.',
)

const emptyTitle = computed(() =>
  props.mode === 'inactive' ? 'No inactive employees found' : 'No employees found',
)

const getFullName = (employee: Employee): string =>
  [employee.firstName, employee.middleName, employee.lastName]
    .filter(Boolean)
    .join(' ')

const formatDate = (date?: string): string => {
  if (!date) return 'Not provided'

  const parsed = new Date(`${date.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return 'Not provided'

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(parsed)
}
</script>

<template>
  <div class="table-card">
    <div class="table-heading">
      <div>
        <h3>{{ tableTitle }}</h3>
        <p>{{ tableDescription }}</p>
      </div>
    </div>

    <div v-if="employees.length" class="table-scroll">
      <table class="employee-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Employee ID</th>
            <th>Email</th>
            <th>Department</th>
            <th>Position</th>
            <th>Employment</th>
            <th>Status</th>
            <th>{{ mode === 'inactive' ? 'Date Inactive' : 'Date Hired' }}</th>
            <th class="action-column" aria-label="Actions" />
          </tr>
        </thead>

        <tbody>
          <tr v-for="employee in employees" :key="employee.id">
            <td>
              <div class="employee-cell">
        
                <div class="employee-info">
                  <strong>{{ getFullName(employee) }}</strong>
      
                </div>
              </div>
            </td>
            <td><span class="employee-number">{{ employee.employeeNumber }}</span></td>
            <td><span class="employee-info">{{ employee.email }}</span></td>
            
            <td>{{ employee.department }}</td>
            <td>{{ employee.position }}</td>
            <td><StatusBadge :status="employee.employmentType" /></td>
            <td><StatusBadge :status="employee.status" /></td>
            <td>
              {{ formatDate(mode === 'inactive' ? employee.inactiveDate : employee.dateHired) }}
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

    <div v-else class="empty-state">
      <div class="empty-icon"><Users :size="24" /></div>
      <strong>{{ emptyTitle }}</strong>
      <p>Try changing your search or filters.</p>
    </div>
  </div>
</template>

<style scoped>
/* Align Employee Directory typography with the Contribution Types table. */
.table-card {
  --employee-title-font: 17px;
  --employee-description-font: 12px;
  --employee-column-font: 12px;
  --employee-row-font: 13px;
  --employee-secondary-font: 12px;

  position: relative;
  min-width: 0;
  overflow: visible;

  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.table-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 17px;
  border-bottom: 1px solid var(--border-soft);
}
.table-heading h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--employee-title-font);
  font-weight: 700;
  line-height: 1.4;
}
.table-heading p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: var(--employee-description-font);
  line-height: 1.5;
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
}
.employee-table {
  width: 100%;
  min-width: 1150px;
  border-collapse: collapse;
}
.employee-table th {
  padding: 13px 15px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: var(--employee-column-font);
  font-weight: 700;
  line-height: 1.4;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: .025em;
  white-space: nowrap;
}
.employee-table td {
  padding: 14px 15px;
  border-bottom: 1px solid var(--border-soft);
  color: var(--text-secondary);
  font-size: var(--employee-row-font);
  font-weight: 500;
  line-height: 1.5;
  vertical-align: middle;
}
.employee-table tbody tr:last-child td { border-bottom: 0; }
.employee-table tbody tr { transition: background-color .15s ease; }
.employee-table tbody tr:hover { background: var(--bg-card-soft); }
.employee-cell {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 215px;
}
.employee-avatar {
  display: flex;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 12px;
  font-weight: 700;
}
.employee-info { min-width: 0; }
.employee-info strong {
  display: block;
  margin-bottom: 3px;
  color: var(--text-primary);
  font-size: var(--employee-row-font);
  font-weight: 700;
  line-height: 1.4;
}
.employee-info span {
  display: block;
  max-width: 240px;
  overflow: hidden;
  color: var(--text-muted);
  font-size: var(--employee-secondary-font);
  line-height: 1.45;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.employee-number {
  color: var(--primary);
  font-size: var(--employee-row-font);
  font-weight: 650;
}
.action-column {
  width: 52px;
  text-align: right !important;
  white-space: nowrap;
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
  font-size: 14px;
}
.empty-state p {
  margin: 6px 0 0;
  color: var(--text-muted);
  font-size: 12px;
}
@media (max-width: 650px) {
  .table-heading { padding: 14px; }
  .employee-table th,
  .employee-table td { padding-left: 12px; padding-right: 12px; }
}
@media (prefers-reduced-motion: reduce) {
  .employee-table tbody tr { transition: none; }
}
</style>
