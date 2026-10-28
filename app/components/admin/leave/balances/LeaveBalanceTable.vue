
<script setup lang="ts">
import { SlidersHorizontal, UserRound } from 'lucide-vue-next'
import type {
  EmployeeLeaveBalance,
  LeaveBalance,
} from '~/types/leaveBalance'

defineProps<{
  balances: EmployeeLeaveBalance[]
  leaveTypes: string[]
}>()

const emit = defineEmits<{
  adjust: [record: LeaveBalance]
}>()

const format = (value: number) =>
  Number(value.toFixed(2)).toLocaleString()

const recordsForType = (
  employee: EmployeeLeaveBalance,
  type: string,
) => employee.records.filter(
  item => (item.leave_type || `Policy #${item.leave_policy_id}`) === type,
)

const statusLabel = (status: string) => ({
  healthy: 'Healthy',
  low: 'Low Balance',
  none: 'No Credits',
}[status] || status)
</script>

<template>
  <div class="table-card">
    <div class="table-heading">
      <h3>Employee Leave Balances</h3>
      <p>Review allocated, used and remaining leave credits for each employee.</p>
    </div>

    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Department</th>
            <th v-for="type in leaveTypes" :key="type">{{ type }}</th>
            <th>Total Allocated</th>
            <th>Total Used</th>
            <th>Available</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="employee in balances" :key="employee.employee_id">
            <td>
              <div class="employee-cell">
                <span class="avatar"><UserRound :size="15" /></span>
                <div>
                  <strong>{{ employee.employee }}</strong>
                  <small>EMP-{{ employee.emp_id ?? employee.employee_id }}</small>
                </div>
              </div>
            </td>

            <td>
              <span class="department">{{ employee.department || '—' }}</span>
            </td>

            <td v-for="type in leaveTypes" :key="type">
              <div
                v-for="record in recordsForType(employee, type)"
                :key="record.leave_policy_id"
                class="credit-cell"
              >
                <div class="credit-heading">
                  <strong :class="{ negative: record.available <= 0 }">
                    {{ format(record.available) }}
                  </strong>

                  <button
                    class="adjust-icon"
                    type="button"
                    title="Adjust this leave policy's credits"
                    @click="emit('adjust', record)"
                  >
                    <SlidersHorizontal :size="13" />
                  </button>
                </div>

                <small>
                  {{ format(Math.max(0, -record.deductions - Math.max(0, record.reversals))) }}
                  used / {{ format(record.allocated) }} allocated
                </small>

                <small v-if="recordsForType(employee, type).length > 1">
                  Policy #{{ record.leave_policy_id }}
                  <template v-if="record.policy_paid !== null && record.policy_paid !== undefined">
                    · {{ record.policy_paid ? 'Paid' : 'Unpaid' }}
                  </template>
                </small>
              </div>

              <span
                v-if="!recordsForType(employee, type).length"
                class="empty-credit"
              >—</span>
            </td>

            <td class="number">{{ format(employee.totalAllocated) }}</td>
            <td class="number used">{{ format(employee.totalUsed) }}</td>
            <td class="number available">{{ format(employee.totalAvailable) }}</td>

            <td>
              <span class="status" :class="employee.status">
                <span class="dot" />
                {{ statusLabel(employee.status) }}
              </span>
            </td>
          </tr>

          <tr v-if="!balances.length">
            <td :colspan="leaveTypes.length + 6" class="empty-state">
              No employee leave balances found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.table-card{overflow:hidden;border:1px solid var(--border,#29364b);border-radius:12px;background:var(--bg-card,#141e2d)}
.table-heading{padding:18px 16px 15px;border-bottom:1px solid var(--border,#29364b)}
.table-heading h3{margin:0;color:var(--text-primary,#fff);font-size:13px;font-weight:700}
.table-heading p{margin:5px 0 0;color:var(--text-muted,#94a3b8);font-size:10px}
.table-scroll{overflow-x:auto}
table{width:100%;min-width:1050px;border-collapse:collapse}
thead{background:var(--bg-secondary,#1a2637)}
th{padding:13px 12px;text-align:left;white-space:nowrap;color:var(--text-secondary,#b0bdd0);font-size:9px;font-weight:700;text-transform:uppercase}
td{padding:14px 12px;border-top:1px solid var(--border,#29364b);color:var(--text-primary,#fff);font-size:10px;vertical-align:middle}
tbody tr:hover{background:rgba(100,116,139,.045)}
.employee-cell{display:flex;align-items:center;gap:9px;min-width:170px}
.avatar{display:flex;width:33px;height:33px;flex-shrink:0;align-items:center;justify-content:center;border-radius:9px;background:#18335d;color:#3b82f6}
.employee-cell strong{display:block;font-size:10px}
.employee-cell small{display:block;margin-top:4px;color:var(--text-muted,#94a3b8);font-size:9px}
.department{white-space:nowrap;font-weight:600}
.credit-cell{min-width:115px;padding:3px 0 6px}
.credit-cell+.credit-cell{border-top:1px dashed var(--border,#29364b);padding-top:9px}
.credit-heading{display:flex;justify-content:space-between;align-items:center;gap:8px}
.credit-heading strong{font-size:12px}
.credit-heading strong.negative{color:#ef4444}
.credit-cell small{display:block;margin-top:3px;color:var(--text-muted,#94a3b8);font-size:9px;white-space:nowrap}
.adjust-icon{display:inline-flex;align-items:center;justify-content:center;width:23px;height:23px;border:1px solid var(--border,#29364b);border-radius:6px;background:transparent;color:var(--text-secondary,#b0bdd0);cursor:pointer}
.adjust-icon:hover{color:#3b82f6;border-color:#3b82f6}
.number{font-weight:700;white-space:nowrap}
.used{color:#f59e0b}
.available{color:#10b981}
.empty-credit{color:var(--text-muted,#94a3b8)}
.status{display:inline-flex;align-items:center;gap:5px;padding:6px 9px;border-radius:20px;font-size:9px;font-weight:700;white-space:nowrap}
.status.healthy{background:#123b2c;color:#10b981}
.status.low{background:#453518;color:#f59e0b}
.status.none{background:#481e29;color:#ef4444}
.dot{width:5px;height:5px;border-radius:50%;background:currentColor}
.empty-state{text-align:center;padding:35px;color:var(--text-muted,#94a3b8)}
</style>
