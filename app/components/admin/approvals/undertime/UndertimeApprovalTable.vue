<script setup lang="ts">
import { Check, ClipboardList, Clock3, TimerReset, UserRound } from 'lucide-vue-next'
import type { UndertimeRequest } from '~/types/undertimeRequest'

defineProps<{
  requests: UndertimeRequest[]
  approvingId?: number | null
}>()

const emit = defineEmits<{ approve: [request: UndertimeRequest] }>()

const formatDate = (value: string) => new Intl.DateTimeFormat('en-PH', {
  month: 'short', day: 'numeric', year: 'numeric',
}).format(new Date(`${value.slice(0, 10)}T00:00:00`))

const formatTime = (value: string) => {
  const date = new Date(value)
  if (!Number.isNaN(date.getTime())) {
    return new Intl.DateTimeFormat('en-PH', { hour: 'numeric', minute: '2-digit' }).format(date)
  }
  const [hour, minute] = value.split(':').map(Number)
  const localTime = new Date()
  localTime.setHours(hour ?? 0, minute ?? 0, 0, 0)
  return new Intl.DateTimeFormat('en-PH', { hour: 'numeric', minute: '2-digit' }).format(localTime)
}
</script>

<template>
  <article class="table-card">
    <div class="table-heading">
      <h3>Undertime Requests</h3>
      <p>Review employee undertime schedules, reasons and approval status.</p>
    </div>

    <div v-if="requests.length" class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Request No.</th><th>Employee</th><th>Date</th><th>Requested Out</th>
            <th>Scheduled Out</th><th>Minutes</th><th>Reason</th><th>Status</th><th>Approver</th><th class="actions-header">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in requests" :key="item.id">
            <td><strong class="request-number">{{ item.requestNumber }}</strong></td>
            <td>
              <div class="employee-cell">
                <div class="employee-avatar"><UserRound :size="15" /></div>
                <div class="cell-info"><strong>{{ item.employeeName }}</strong><span>{{ item.employeeNumber }}</span></div>
              </div>
            </td>
            <td>{{ formatDate(item.undertimeDate) }}</td>
            <td><span class="time"><Clock3 :size="13" />{{ formatTime(item.requestedTimeOut) }}</span></td>
            <td>{{ formatTime(item.scheduledTimeOut) }}</td>
            <td><span class="minutes"><TimerReset :size="13" />{{ item.requestedMinutes }} min</span></td>
            <td><p class="reason" :title="item.reason">{{ item.reason }}</p></td>
            <td><span class="badge" :class="item.status.toLowerCase()"><span class="status-dot" />{{ item.status }}</span></td>
            <td>{{ item.reviewedBy ?? '-' }}</td>
            <td class="actions-cell">
              <button
                v-if="item.status === 'Pending'"
                type="button"
                class="approve-button"
                :disabled="approvingId === item.id"
                @click="emit('approve', item)"
              >
                <Check :size="13" />
                {{ approvingId === item.id ? 'Approving...' : 'Approve' }}
              </button>
              <span v-else class="completed-label">{{ item.status === 'Approved' ? 'Reviewed' : 'No action' }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-state">
      <ClipboardList :size="30" />
      <strong>No Undertime Requests Found</strong>
      <span>No records match your selected filters.</span>
    </div>
  </article>
</template>

<style scoped>
.table-card{overflow:hidden;border:1px solid var(--border);border-radius:11px;background:var(--bg-card);box-shadow:var(--shadow)}
.table-heading{padding:16px 17px;border-bottom:1px solid var(--border-soft)}.table-heading h3{margin:0;color:var(--text-primary);font-size:14px}.table-heading p{margin:5px 0 0;color:var(--text-muted);font-size:10px}
.table-scroll{overflow-x:auto}table{width:100%;min-width:1350px;border-collapse:collapse}th,td{padding:12px 13px;border-top:1px solid var(--border-soft);color:var(--text-secondary);font-size:10px;text-align:left;vertical-align:middle}th{border-top:0;background:var(--bg-card-soft);font-weight:700;text-transform:uppercase;white-space:nowrap}tbody tr:hover{background:var(--bg-card-soft)}
.request-number{color:var(--primary);white-space:nowrap}.employee-cell{display:flex;align-items:center;gap:9px;min-width:170px}.employee-avatar{display:flex;width:31px;height:31px;flex-shrink:0;align-items:center;justify-content:center;border-radius:50%;background:var(--primary-soft);color:var(--primary)}.cell-info strong,.cell-info span{display:block}.cell-info strong{color:var(--text-primary)}.cell-info span{margin-top:4px;color:var(--text-muted);font-size:9px}.time,.minutes{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}.reason{max-width:220px;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.badge{display:inline-flex;align-items:center;gap:5px;padding:5px 8px;border-radius:20px;font-size:9px;font-weight:650}.status-dot{width:5px;height:5px;border-radius:50%;background:currentColor}.badge.pending{background:var(--orange-soft);color:var(--orange)}.badge.approved{background:var(--green-soft);color:var(--green)}.badge.rejected,.badge.cancelled{background:var(--red-soft);color:var(--red)}
.actions-header,.actions-cell{text-align:right}.approve-button{display:inline-flex;align-items:center;gap:6px;padding:8px 11px;border:1px solid var(--primary);border-radius:7px;background:var(--primary-soft);color:var(--primary);font:inherit;font-size:10px;font-weight:650;cursor:pointer}.approve-button:hover{background:var(--primary);color:#fff}.approve-button:disabled{cursor:wait;opacity:.55}.completed-label{color:var(--text-muted);font-size:9px}
.empty-state{display:flex;min-height:240px;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:var(--text-muted)}.empty-state strong{color:var(--text-primary);font-size:12px}.empty-state span{font-size:10px}
</style>
