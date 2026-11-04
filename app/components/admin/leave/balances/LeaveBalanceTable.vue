<script setup lang="ts">
import { Eye } from 'lucide-vue-next'
import BaseDataTable from '~/components/shared-table/BaseDataTable.vue'
import type { EmployeeLeaveBalance } from '~/types/leaveBalance'

defineProps<{
  balances: EmployeeLeaveBalance[]
}>()

const router = useRouter()

const viewBalance = (employee: EmployeeLeaveBalance) => {
  void router.push({
    path: '/admin/leave-management/leave-balances/show',
    query: { employee: String(employee.employee_id) },
  })
}

const format = (value: number): string =>
  Number(value.toFixed(2)).toLocaleString('en-US')
</script>

<template>
  <BaseDataTable
    title="Employee Leave Balances"
    description="Review each employee's total available leave credit."
    :has-rows="balances.length > 0"
    min-width="900px"
    empty-title="No employee leave balances found"
    empty-description="No leave credit records are available."
  >
    <template #headers>
      <th>Employee</th>
      <th>Department</th>
      <th>Position</th>
      <th>Employment Type</th>
      <th>Total Available Credit</th>
      <th style="text-align: right">Actions</th>
    </template>

    <template #rows>
      <tr
        v-for="employee in balances"
        :key="employee.employee_id"
      >
        <td>
          <div class="employee-cell">
            <span class="employee-name">
              {{ employee.employee }}
            </span>
            <span class="employee-number">
              EMP-{{ employee.emp_id ?? employee.employee_id }}
            </span>
          </div>
        </td>

        <td>{{ employee.department || '—' }}</td>
        <td>{{ employee.position || '—' }}</td>
        <td>{{ employee.employmentType || '—' }}</td>

        <td>
          <span
            class="available-credit"
            :class="{ empty: employee.totalAvailable <= 0 }"
          >
            {{ format(employee.totalAvailable) }}
          </span>
        </td>

        <td style="text-align: right">
          <button
            type="button"
            class="view-button"
            :aria-label="`View leave balances for ${employee.employee}`"
            title="View Leave Balance"
            @click="viewBalance(employee)"
          >
            <Eye :size="16" />
          </button>
        </td>
      </tr>
    </template>
  </BaseDataTable>
</template>

<style scoped>
.employee-cell {
  display: flex;
  min-width: 170px;
  flex-direction: column;
  gap: 4px;
}

.employee-name {
  color: var(--text-primary);
  font-weight: 600;
}

.employee-number {
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 400;
}

.available-credit {
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.available-credit.empty {
  color: var(--red, #ef4444);
}

.view-button {
  display: inline-flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: border-color .18s ease, background .18s ease, color .18s ease;
}

.view-button:hover {
  border-color: var(--primary);
  background: var(--primary-soft);
  color: var(--primary);
}
</style>
