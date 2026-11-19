
<script setup lang="ts">
import BaseDataTable from '~/components/shared-table/BaseDataTable.vue'
import EmployeeRatesActions from './employeeRatesActions.vue'

import type { EmployeeSalaryRate } from '~/types/employeeSalaryRates/employeeSalaryRate'

withDefaults(defineProps<{
  rates: EmployeeSalaryRate[]
  loading?: boolean
}>(), {
  loading: false,
})

const emit = defineEmits<{
  view: [rate: EmployeeSalaryRate]
}>()

const money = (value: number | string): string =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(Number(value ?? 0))
</script>

<template>
  <BaseDataTable
    title="Employee Salary Rate Directory"
    description="Manage employee salary setups, salary types and compensation details."
    :has-rows="rates.length > 0"
    :loading="loading"
    min-width="1050px"
    empty-title="No salary setups found"
    empty-description="No employee salary setups match your filters."
  >
    <template #headers>
      <th>Employee</th>
      <th>Department</th>
      <th>Position</th>
      <th>Salary Type</th>
      <th>Basic Salary</th>
      <th>Allowance</th>
      <th>Status</th>

    </template>

    <template #rows>
      <tr
        v-for="rate in rates"
        :key="rate.id"
      >
        <td>
          <div class="flex flex-col gap-1">
            <strong
              class="font-semibold"
              :style="{ color: 'var(--text-primary)' }"
            >
              {{ rate.employee_name }}
            </strong>
          </div>
        </td>

        <td>{{ rate.department_name }}</td>

        <td>{{ rate.position_name }}</td>

        <td>
          <span class="font-medium">
            {{ rate.salary_type_name }}
          </span>
        </td>

        <td>
          <strong
            class="font-semibold tabular-nums"
            :style="{ color: 'var(--text-primary)' }"
          >
            {{ money(rate.basic_salary) }}
          </strong>
        </td>

        <td>
          <span class="tabular-nums">
            {{ money(rate.allowance) }}
          </span>
        </td>
        <td>
          <span
            class="status-pill"
            :class="rate.status ? 'status-pill--active' : 'status-pill--inactive'"
          >
            {{ rate.status ? 'Active' : 'Inactive' }}
          </span>
        </td>
      </tr>
    </template>
  </BaseDataTable>
</template>
