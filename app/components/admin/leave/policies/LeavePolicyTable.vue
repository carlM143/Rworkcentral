
<script setup lang="ts">
import { CalendarDays, Pencil, Trash2, BookOpen } from 'lucide-vue-next'
import BaseDataTable from '~/components/shared-table/BaseDataTable.vue'
import type { LeavePolicy } from '~/types/leavePolicy'

withDefaults(defineProps<{
  policies: LeavePolicy[]
  busy?: boolean
}>(), { busy: false })

const emit = defineEmits<{
  edit: [policy: LeavePolicy]
  delete: [policy: LeavePolicy]
}>()

const formatDate = (value: string) => {
  if (!value) return '—'
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value)
</script>

<template>
  <BaseDataTable
    title="Leave Policies"
    description="Manage employee leave eligibility, credits, carry-over, approvals and validity."
    :has-rows="policies.length > 0"
    min-width="1330px"
    empty-title="No leave policies found"
    empty-description="Create a leave policy or adjust your filters."
  >
    <template #headers>
      <th>Leave Type</th>
      <th>Employment Type</th>
      <th>Annual Credits</th>
      <th>Eligible</th>
      <th>Pay</th>
      <th>Min. Service</th>
      <th>Carry Over</th>
      <th>Approval</th>
      <th>Effective Dates</th>
      <th>Status</th>
      <th class="action-header">Actions</th>
    </template>

    <template #rows>
      <tr v-for="policy in policies" :key="policy.id">
        <td>
          <div class="leave-cell">
            <div class="leave-icon">
              <BookOpen :size="15" />
            </div>
            <div class="leave-info">
              <strong>{{ policy.leaveTypeName }}</strong>
              <span>{{ policy.leaveTypeCode || `Policy #${policy.id}` }}</span>
            </div>
          </div>
        </td>

        <td>
          <strong class="employment-name">{{ policy.employmentTypeName }}</strong>
        </td>

        <td>
          <strong class="credits">{{ formatNumber(policy.annualCredits) }}</strong>
          <span class="small-note">days</span>
        </td>

        <td>
          <span class="pill" :class="policy.isEligible ? 'positive' : 'negative'">
            {{ policy.isEligible ? 'Eligible' : 'Not Eligible' }}
          </span>
        </td>

        <td>
          <span class="pill" :class="policy.isPaid ? 'positive' : 'neutral'">
            {{ policy.isPaid ? 'Paid' : 'Unpaid' }}
          </span>
        </td>

        <td>
          <strong class="text-value">{{ policy.minServiceMonths }}</strong>
          <span class="small-note">months</span>
        </td>

        <td>
          <div class="detail-cell">
            <strong>{{ policy.allowCarryOver ? 'Allowed' : 'Not Allowed' }}</strong>
            <span v-if="policy.allowCarryOver">
              Max {{ formatNumber(policy.maxCarryOverDays) }} days
            </span>
          </div>
        </td>

        <td>
          <span class="pill" :class="policy.requiresApproval ? 'neutral' : 'positive'">
            {{ policy.requiresApproval ? 'Required' : 'Not Required' }}
          </span>
        </td>

        <td>
          <div class="date-cell">
            <CalendarDays :size="13" />
            <div>
              <strong>{{ formatDate(policy.effectiveFrom) }}</strong>
              <span>To: {{ formatDate(policy.effectiveTo) }}</span>
            </div>
          </div>
        </td>

        <td>
          <span class="pill" :class="policy.status === 'approved' ? 'positive' : 'pending'">
            <span class="dot" />
            {{ policy.status === 'approved' ? 'Approved' : 'Pending' }}
          </span>
        </td>

        <td>
          <div class="actions">
            <button
              type="button"
              class="action-button"
              title="Edit Policy"
              :aria-label="`Edit ${policy.leaveTypeName} policy`"
              :disabled="busy"
              @click="emit('edit', policy)"
            >
              <Pencil :size="15" />
            </button>

            <button
              type="button"
              class="action-button danger"
              title="Delete Policy"
              :aria-label="`Delete ${policy.leaveTypeName} policy`"
              :disabled="busy"
              @click="emit('delete', policy)"
            >
              <Trash2 :size="15" />
            </button>
          </div>
        </td>
      </tr>
    </template>
  </BaseDataTable>
</template>

<style scoped>
.leave-cell{display:flex;min-width:170px;align-items:center;gap:9px}
.leave-icon{display:flex;width:34px;height:34px;flex-shrink:0;align-items:center;justify-content:center;border-radius:8px;background:var(--primary-soft);color:var(--primary)}
.leave-info strong,.leave-info span{display:block}
.leave-info strong,.employment-name{color:var(--text-primary);font-size:10px;font-weight:700}
.leave-info span{margin-top:4px;color:var(--primary);font-size:9px}
.credits{color:var(--text-primary);font-size:11px}
.small-note{display:block;margin-top:3px;color:var(--text-muted);font-size:8px}
.text-value{color:var(--text-primary);font-size:10px}
.pill{display:inline-flex;align-items:center;gap:5px;padding:5px 8px;border-radius:20px;font-size:9px;font-weight:650;white-space:nowrap}
.pill.positive{background:var(--green-soft);color:var(--green)}
.pill.negative{background:var(--red-soft);color:var(--red)}
.pill.pending{background:var(--orange-soft);color:var(--orange)}
.pill.neutral{background:var(--bg-card-soft);color:var(--text-secondary)}
.dot{width:5px;height:5px;border-radius:50%;background:currentColor}
.detail-cell strong,.detail-cell span{display:block}
.detail-cell strong{color:var(--text-primary);font-size:9px}
.detail-cell span{margin-top:4px;color:var(--text-muted);font-size:8px}
.date-cell{display:flex;align-items:center;gap:7px;color:var(--primary)}
.date-cell strong,.date-cell span{display:block;white-space:nowrap}
.date-cell strong{color:var(--text-primary);font-size:9px}
.date-cell span{margin-top:3px;color:var(--text-muted);font-size:8px}
.action-header{text-align:right}
.actions{display:flex;justify-content:flex-end;gap:6px}
.action-button{display:flex;width:30px;height:30px;align-items:center;justify-content:center;border:1px solid var(--border);border-radius:7px;background:transparent;color:var(--text-secondary);cursor:pointer}
.action-button:hover{background:var(--primary-soft);color:var(--primary)}
.action-button.danger:hover{background:var(--red-soft);color:var(--red)}
.action-button:disabled{opacity:.4;cursor:not-allowed}
</style>
