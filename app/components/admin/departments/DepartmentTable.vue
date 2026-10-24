<script setup lang="ts">
import BaseDataTable from '~/components/shared-table/BaseDataTable.vue'
import type { Department } from '~/types/department'

defineProps<{ departments: Department[] }>()

const emit = defineEmits<{
  edit: [department: Department]
  delete: [department: Department]
}>()
</script>

<template>
  <BaseDataTable
    title="Department Directory"
    description="Manage organizational departments and workforce assignments."
    :has-rows="departments.length > 0"
    empty-title="No departments found"
    empty-description="Try changing your department filters."
  >
    <template #headers>
      <th>Department</th>
      <th>Code</th>
      <th>Employees</th>
      <th>Positions</th>
      <th>Status</th>
      <th />
    </template>

    <template #rows>
      <tr v-for="department in departments" :key="department.id">
        <td>{{ department.name }}</td>
        <td>{{ department.code }}</td>
        <td>{{ department.employeeCount }}</td>
        <td>{{ department.positionCount }}</td>
        <td><StatusBadge :status="department.status" /></td>
        <td><DepartmentActions :department="department" :employee-count="department.employeeCount" :position-count="department.positionCount" @edit="emit('edit', $event)" @delete="emit('delete', $event)" /></td>
      </tr>
    </template>
  </BaseDataTable>
</template>