
<script setup lang="ts">
import { computed } from 'vue'
import { Eye } from 'lucide-vue-next'
import BaseDataTable from '~/components/shared-table/BaseDataTable.vue'

import type {
  EmployeeLeaveBalance,
  LeaveBalance,
} from '~/types/leaveBalance'

const props = defineProps<{
  balances: EmployeeLeaveBalance[]
  leaveTypes: string[]
}>()

const router = useRouter()

const viewBalance = (employee: EmployeeLeaveBalance) => {
  void router.push({
    path: '/admin/leave-management/leave-balances/show',
    query: { employee: String(employee.employee_id) },
  })
}

// FORMAT NUMBERS
const format = (value: number): string =>
  Number(value.toFixed(2)).toLocaleString('en-US')

// LEAVE RECORDS PER TYPE
const recordsForType = (
  employee: EmployeeLeaveBalance,
  type: string,
): LeaveBalance[] =>
  employee.records.filter(
    item =>
      (item.leave_type ||
        `Policy #${item.leave_policy_id}`) === type,
  )

// STATUS LABEL
const statusLabel = (status: string): string =>
  ({
    healthy: 'Healthy',
    low: 'Low Balance',
    none: 'No Credits',
  } as Record<string, string>)[status] || status

// STATUS COLORS
const statusStyle = (status: string) => {
  const colors: Record<string, {
    background: string
    color: string
  }> = {
    healthy: {
      background: 'var(--green-soft, rgba(16,185,129,.12))',
      color: 'var(--green, #10b981)',
    },
    low: {
      background: 'var(--orange-soft, rgba(245,158,11,.12))',
      color: 'var(--orange, #f59e0b)',
    },
    none: {
      background: 'var(--red-soft, rgba(239,68,68,.12))',
      color: 'var(--red, #ef4444)',
    },
  }

  return {
    fontWeight: 500,
    ...(colors[status] || {
      background: 'var(--bg-card-soft)',
      color: 'var(--text-secondary)',
    }),
  }
}

// TABLE WIDTH BASED ON LEAVE TYPES
const tableMinWidth = computed(() =>
  `${Math.max(800, 500 + props.leaveTypes.length * 180)}px`,
)
</script>

<template>
  <BaseDataTable
    title="Employee Leave Balances"
    description="Review remaining leave credits for each employee."
    :has-rows="balances.length > 0"
    :min-width="tableMinWidth"
    empty-title="No employee leave balances found"
    empty-description="No leave credit records are available."
  >
    <!-- TABLE HEADERS -->
    <template #headers>
      <th>Employee</th>
      <th>Department</th>

      <th
        v-for="type in leaveTypes"
        :key="type"
      >
        {{ type }}
      </th>

      <th>Status</th>
      <th style="text-align: right">Actions</th>
    </template>

    <!-- TABLE ROWS -->
    <template #rows>
      <tr
        v-for="employee in balances"
        :key="employee.employee_id"
      >
        <!-- EMPLOYEE -->
        <td>
          <div
            style="
              display: flex;
              flex-direction: column;
              gap: 4px;
              min-width: 170px;
            "
          >
            <span
              style="
                color: var(--text-primary);
                font-weight: 600;
              "
            >
              {{ employee.employee }}
            </span>

            <span
              style="
                color: var(--text-muted);
                font-size: 12px;
                font-weight: 400;
              "
            >
              EMP-{{ employee.emp_id ?? employee.employee_id }}
            </span>
          </div>
        </td>

        <!-- DEPARTMENT -->
        <td>
          {{ employee.department || '—' }}
        </td>

        <!-- DYNAMIC LEAVE TYPE COLUMNS -->
        <td
          v-for="type in leaveTypes"
          :key="type"
        >
          <div
            v-for="record in recordsForType(employee, type)"
            :key="record.leave_policy_id"
            style="
              min-width: 125px;
              padding: 6px 0;
              border-bottom: 1px solid var(--border-soft);
            "
          >
            <!-- AVAILABLE CREDITS -->
            <div
              style="
                display: flex;
                align-items: center;
                gap: 8px;
              "
            >
              <span
                :style="{
                  color:
                    record.available <= 0
                      ? 'var(--red, #ef4444)'
                      : 'var(--text-primary)',
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                }"
              >
                {{ format(record.available) }}
              </span>

            </div>

            <!-- MULTIPLE POLICIES -->
            <span
              v-if="recordsForType(employee, type).length > 1"
              style="
                display: block;
                margin-top: 4px;
                color: var(--text-muted);
                font-size: 12px;
                font-weight: 400;
              "
            >
              Policy #{{ record.leave_policy_id }}

              <template
                v-if="
                  record.policy_paid !== null &&
                  record.policy_paid !== undefined
                "
              >
                ·
                {{ record.policy_paid ? 'Paid' : 'Unpaid' }}
              </template>
            </span>
          </div>

          <!-- NO LEAVE CREDIT -->
          <span
            v-if="!recordsForType(employee, type).length"
            style="color: var(--text-muted)"
          >
            —
          </span>
        </td>

        <!-- STATUS -->
        <td>
          <span class="status-badge" :style="statusStyle(employee.status)">
            {{ statusLabel(employee.status) }}
          </span>
        </td>

        <!-- ACTIONS -->
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
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 11px;
  white-space: nowrap;
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
