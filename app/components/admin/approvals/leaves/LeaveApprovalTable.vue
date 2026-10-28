
<script setup lang="ts">
import { ClipboardList, Check, UserRound } from 'lucide-vue-next'
import type { LeaveApproval } from '~/types/leaveApproval'

withDefaults(defineProps<{
  requests: LeaveApproval[]
  statusFilter?: string
}>(), { statusFilter: 'pending' })

const emit = defineEmits<{ review: [request: LeaveApproval] }>()

const formatDate = (value: string | null) => {
  if (!value) return '—'
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}
</script>

<template>
  <article class="table-card">
    <div class="table-heading">
      <h3>Leave Requests</h3>
      <p>Review employee leave requests and their requested payment treatment.</p>
    </div>

    <div v-if="requests.length" class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Request No.</th>
            <th>Employee</th>
            <th>Leave Type</th>
            <th>Requested Pay</th>
            <th>Leave Policy</th>
            <th>Request Date</th>
            <th>Reason</th>
            <th>Status</th>
            <th class="actions-header">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in requests" :key="item.id">
            <td>
              <strong class="request-number">{{ item.request_no }}</strong>
            </td>

            <td>
              <div class="employee-cell">
                <div class="employee-avatar"><UserRound :size="15" /></div>
                <div class="cell-info">
                  <strong>{{ item.employee?.name || 'Unknown Employee' }}</strong>
                  <span>ID: {{ item.employee?.emp_id ?? '—' }}</span>
                </div>
              </div>
            </td>

            <td>
              <div class="cell-info">
                <strong>{{ item.leave_type }}</strong>
                <span>{{ item.leave_code || '—' }}</span>
              </div>
            </td>

            <td>
              <span class="badge" :class="item.requested_pay_type">
                {{ item.requested_pay_type === 'paid' ? 'Paid Leave' : 'Unpaid Leave' }}
              </span>
            </td>

            <td>
              <div class="cell-info">
                <strong>Policy #{{ item.leave_policy_id }}</strong>
                <span :class="item.policy_status === 'approved' ? 'valid' : 'warning'">
                  {{ item.policy_status || 'Not available' }}
                </span>
              </div>
            </td>

            <td>{{ formatDate(item.request_date) }}</td>

            <td>
              <p class="reason" :title="item.reason || ''">
                {{ item.reason || 'No reason provided' }}
              </p>
            </td>

            <td>
              <span class="badge status" :class="item.status">
                <span class="status-dot" />
                {{ item.status }}
              </span>
            </td>

            <td class="actions-cell">
              <button
                v-if="item.status === 'pending'"
                type="button"
                class="review-button"
                @click="emit('review', item)"
              >
                <Check :size="13" />
                Review
              </button>

              <span v-else class="completed-label">
                {{ item.status === 'approved' ? 'Reviewed' : 'No action' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-state">
      <ClipboardList :size="30" />
      <strong>No Leave Requests Found</strong>
      <span>
        {{ statusFilter === 'pending'
          ? 'There are no pending leave requests.'
          : 'No records match your selected filters.' }}
      </span>
    </div>
  </article>
</template>

<style scoped>
.table-card{overflow:hidden;border:1px solid var(--border);border-radius:11px;background:var(--bg-card);box-shadow:var(--shadow)}
.table-heading{padding:16px 17px;border-bottom:1px solid var(--border-soft)}
.table-heading h3{margin:0;color:var(--text-primary);font-size:14px;font-weight:700}
.table-heading p{margin:5px 0 0;color:var(--text-muted);font-size:10px}
.table-scroll{overflow-x:auto}
table{width:100%;min-width:1250px;border-collapse:collapse}
th{padding:12px 13px;background:var(--bg-card-soft);color:var(--text-secondary);font-size:10px;font-weight:700;text-align:left;text-transform:uppercase;white-space:nowrap}
td{padding:13px;border-top:1px solid var(--border-soft);color:var(--text-secondary);font-size:10px;vertical-align:middle}
tbody tr:hover{background:var(--bg-card-soft)}
.request-number{color:var(--primary);white-space:nowrap}
.employee-cell{display:flex;align-items:center;gap:9px;min-width:170px}
.employee-avatar{display:flex;width:31px;height:31px;flex-shrink:0;align-items:center;justify-content:center;border-radius:50%;background:var(--primary-soft);color:var(--primary)}
.cell-info strong,.cell-info span{display:block}
.cell-info strong{color:var(--text-primary);font-size:10px}
.cell-info span{margin-top:4px;color:var(--text-muted);font-size:9px}
.cell-info .valid{color:var(--green)}
.cell-info .warning{color:var(--orange)}
.badge{display:inline-flex;align-items:center;gap:6px;padding:5px 9px;border-radius:20px;font-size:9px;font-weight:650;white-space:nowrap;text-transform:capitalize}
.badge.paid,.badge.approved{background:var(--green-soft);color:var(--green)}
.badge.unpaid,.badge.cancelled{background:var(--bg-card-soft);color:var(--text-secondary)}
.badge.pending{background:var(--orange-soft);color:var(--orange)}
.badge.rejected{background:var(--red-soft);color:var(--red)}
.status-dot{width:5px;height:5px;border-radius:50%;background:currentColor}
.reason{max-width:190px;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.actions-header,.actions-cell{text-align:right}
.review-button{display:inline-flex;align-items:center;gap:6px;padding:8px 11px;border:1px solid var(--primary);border-radius:7px;background:var(--primary-soft);color:var(--primary);font-family:inherit;font-size:10px;font-weight:650;cursor:pointer}
.review-button:hover{background:var(--primary);color:#fff}
.completed-label{color:var(--text-muted);font-size:9px}
.empty-state{display:flex;min-height:240px;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:var(--text-muted)}
.empty-state strong{color:var(--text-primary);font-size:12px}
.empty-state span{font-size:10px}
</style>
