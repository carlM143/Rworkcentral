<script setup lang="ts">
import { CalendarDays } from 'lucide-vue-next'

import type {
  EmployeeLeaveCredit,
  EmployeeLeaveCreditStatus,
} from '~/types/employeeLeaveCredit'

defineProps<{
  rows: EmployeeLeaveCredit[]
}>()

const statusLabel = (status: EmployeeLeaveCreditStatus) => {
  const labels: Record<EmployeeLeaveCreditStatus, string> = {
    eligible: 'Eligible',
    not_yet_eligible: 'Not Yet Eligible',
    not_eligible: 'Not Eligible',
    no_policy: 'No Policy',
  }

  return labels[status]
}

const statusClass = (status: EmployeeLeaveCreditStatus) => {
  return {
    eligible: 'eligible',
    not_yet_eligible: 'pending',
    not_eligible: 'ineligible',
    no_policy: 'neutral',
  }[status]
}

const formatCredits = (value: number) =>
  Number(value).toLocaleString('en-PH', {
    maximumFractionDigits: 2,
  })
</script>

<template>
  <div class="table-card">
    <div class="table-heading">
      <div>
        <h2>Employee Leave Entitlements</h2>
        <p>Applicable leave policies based on employment type and service.</p>
      </div>
    </div>

    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Leave Type</th>
            <th>Employment Type</th>
            <th>Available Credits</th>
            <th>Pay</th>
            <th>Minimum Service</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="leave in rows"
            :key="`${leave.leave_type_id}-${leave.leave_policy_id ?? 'none'}-${leave.pay}`"
          >
            <td>
              <div class="leave-name">
                <span class="leave-icon">
                  <CalendarDays :size="16" />
                </span>

                <div>
                  <strong>{{ leave.leave_type }}</strong>
                  <small>{{ leave.leave_code }}</small>
                </div>
              </div>
            </td>

            <td>{{ leave.employment_type }}</td>

            
            <td>
              <div class="credit-value">
                <strong class="credit-number">
                  {{ formatCredits(leave.available_credits) }}
                </strong>
              </div>
            </td>

            <td>
              <span
                class="pay-badge"
                :class="leave.pay.toLowerCase()"
              >
                {{ leave.pay }}
              </span>
            </td>

            <td>
              {{ leave.min_service_months }}
              {{ leave.min_service_months === 1 ? 'month' : 'months' }}
            </td>

            <td>
              <span
                class="status-badge"
                :class="statusClass(leave.status)"
              >
                <span class="status-dot" />
                {{ statusLabel(leave.status) }}
              </span>
            </td>
          </tr>

          <tr v-if="!rows.length">
            <td colspan="6" class="empty-state">
              No active leave types are configured.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="table-footer">
      Showing <strong>{{ rows.length }}</strong>
      leave {{ rows.length === 1 ? 'entry' : 'entries' }}
    </div>
  </div>
</template>

<style scoped>
.table-card {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.table-heading {
  padding: 17px;
}

.table-heading h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 700;
}

.table-heading p {
  margin: 5px 0 0;
  color: var(--text-secondary);
  font-size: 11px;
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 11px;
}

th {
  padding: 14px 16px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}

td {
  padding: 14px 16px;
  border-top: 1px solid var(--border-soft);
  color: var(--text-secondary);
  vertical-align: middle;
}

tbody tr:hover {
  background: var(--bg-card-soft);
}

.leave-name {
  display: flex;
  align-items: center;
  gap: 10px;
}

.leave-icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 8px;
  background: var(--primary-soft);
  color: var(--primary);
}

.leave-name strong,
.leave-name small {
  display: block;
}

.leave-name strong {
  color: var(--text-primary);
  font-size: 11px;
  white-space: nowrap;
}

.leave-name small {
  margin-top: 3px;
  color: var(--primary);
  font-size: 10px;
}

.credit-number {
  color: var(--text-primary);
  font-size: 12px;
}

.unit {
  display: block;
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 10px;
}

.pay-badge,
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 9px;
  border-radius: 6px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}

.pay-badge.paid,
.status-badge.eligible {
  background: var(--green-soft);
  color: var(--green);
}

.pay-badge.unpaid,
.status-badge.pending {
  background: var(--orange-soft);
  color: var(--orange);
}

.status-badge.ineligible {
  background: var(--red-soft);
  color: var(--red);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.empty-state {
  padding: 30px;
  text-align: center;
  color: var(--text-muted);
}

.table-footer {
  padding: 13px 16px;
  border-top: 1px solid var(--border-soft);
  color: var(--text-muted);
  font-size: 10px;
}

.table-footer strong {
  color: var(--text-primary);
}

@media (max-width: 850px) {
  table {
    min-width: 720px;
  }
}
</style>
