<!-- payroll table component -->
<script setup lang="ts">
import {
  Users,
  CalendarDays,
} from 'lucide-vue-next'

import type {
  PayrollGroup,
} from '~/types/payroll/payroll-groups/payrollGroup'

defineProps<{
  groups: PayrollGroup[]
  loading: boolean
  showingFrom: number
  showingTo: number
  totalItems: number
  totalPages: number
}>()

const currentPage = defineModel<number>('page', {
  default: 1,
})

const emit = defineEmits<{
  action: [
    action: 'view' | 'edit' | 'employees' | 'delete',
    group: PayrollGroup,
  ]
}>()

const frequencyLabel = (frequency: string) => {
  const labels: Record<string, string> = {
    weekly: 'Weekly',
    bi_weekly: 'Bi-weekly',
    semi_monthly: 'Semi-monthly',
    monthly: 'Monthly',
  }

  return labels[frequency] || frequency
}
</script>

<template>
  <BaseDataTable
    title="Payroll Groups"
    description="Manage payroll groups, payment frequencies and employee assignments."
    :has-rows="groups.length > 0"
    :loading="loading"
    min-width="900px"
    empty-title="No payroll groups found"
    empty-description="Create a payroll group to get started."
  >
    <template #headers>
      <th>Group ID</th>
      <th>Group Name</th>
      <th>Pay Frequency</th>
      <th>Employees</th>
      <th>Payroll Records</th>
      <th>Status</th>
      <th class="text-right">Actions</th>
    </template>

    <template #rows>
      <tr
        v-for="group in groups"
        :key="group.id"
      >
        <td>
          <strong class="group-id">
            #{{ group.id }}
          </strong>
        </td>

        <td>
          <div class="group-cell">
            <div>
              <strong>{{ group.group_name }}</strong>
            </div>
          </div>
        </td>

        <td>
          <div class="frequency">
            <CalendarDays :size="14" />
            {{ frequencyLabel(group.frequency) }}
          </div>
        </td>

        <td>
          <strong>
            {{ group.current_employee_count ?? 0 }}
          </strong>
          <span class="muted"> employees</span>
        </td>

        <td>
          {{ group.payrolls_count ?? 0 }}
        </td>

        <td>
          <span
            class="status-pill"
            :class="group.is_active ? 'status-pill--active' : 'status-pill--inactive'"
          >
            {{ group.is_active ? 'Active' : 'Inactive' }}
          </span>
        </td>

        <td class="text-right">
          <PayrollGroupActions
            :group="group"
            @select="(action, item) => emit('action', action, item)"
          />
        </td>
      </tr>
    </template>

    <template #bottom>
      <BaseTableFooter
        v-model="currentPage"
        :showing-from="showingFrom"
        :showing-to="showingTo"
        :total-items="totalItems"
        :total-pages="totalPages"
        item-label="payroll groups"
      />
    </template>
  </BaseDataTable>
</template>

<style scoped>
.group-id {
  color: var(--primary);
  font-size: 12px;
}

.group-cell {
  display: flex;
  min-width: 230px;
  align-items: center;
  gap: 10px;
}

.group-icon {
  display: grid;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 8px;
  background: var(--primary-soft);
  color: var(--primary);
}

.group-cell strong,
.group-cell span {
  display: block;
}

.group-cell strong {
  color: var(--text-primary);
  font-size: 12px;
}

.group-cell span {
  max-width: 230px;
  margin-top: 3px;
  overflow: hidden;
  color: var(--text-muted);
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.frequency {
  display: flex;
  align-items: center;
  gap: 7px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.status-pill--active {
  background: rgb(34 197 94 / 11%);
  color: #22c55e;
}

.status-pill--inactive {
  background: rgb(248 113 113 / 11%);
  color: #f87171;
}

.muted {
  color: var(--text-muted);
  font-size: 10px;
}
</style>