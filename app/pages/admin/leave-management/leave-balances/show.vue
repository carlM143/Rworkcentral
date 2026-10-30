<script setup lang="ts">
import { ArrowLeft, CalendarDays, RefreshCw, UserRound, WalletCards } from 'lucide-vue-next'
import BaseDataTable from '~/components/shared-table/BaseDataTable.vue'
import { useLeaveBalances } from '~/composables/admin/leave-balances/useLeaveBalances'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Employee Leave Balance | RWorkCentral' })

const route = useRoute()
const router = useRouter()
const { employeeBalances, loading, loadError, loadBalances } = useLeaveBalances()

const employeeId = computed(() => Number(route.query.employee))
const employee = computed(() => employeeBalances.value.find(item => item.employee_id === employeeId.value) || null)

const format = (value: number) => Number(Number(value || 0).toFixed(2)).toLocaleString('en-US')
const formatUsed = (value: number) => Number(value || 0) === 0 ? '—' : format(Math.abs(Number(value)))
const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}
const statusLabel = computed(() => employee.value?.status === 'low'
  ? 'Low Balance'
  : employee.value?.status === 'none' ? 'No Credits' : 'Healthy')

onMounted(() => void loadBalances())

const goBack = () => router.push('/admin/leave-management/leave-balances')
</script>

<template>
  <section class="balance-details-page">
    <button type="button" class="back-button" @click="goBack">
      <ArrowLeft :size="15" />
      Back to Leave Balances
    </button>

    <div v-if="loading" class="state-card">
      <RefreshCw :size="18" class="spin" />
      Loading employee leave balances...
    </div>

    <div v-else-if="loadError" class="state-card error-state" role="alert">
      <div><strong>Unable to Load Leave Balance</strong><p>{{ loadError }}</p></div>
      <AppButton variant="secondary" size="sm" @click="loadBalances">Retry</AppButton>
    </div>

    <div v-else-if="!employee" class="state-card error-state" role="alert">
      <div><strong>Leave Balance Not Found</strong><p>The selected employee does not have an available leave-balance record.</p></div>
      <AppButton variant="secondary" size="sm" @click="goBack">Return</AppButton>
    </div>

    <template v-else>
      <PageHeader
        title="Employee Leave Balance"
        description="Review the employee's current leave credits and balance details."
      />

      <article class="employee-card">
        <span class="employee-icon"><UserRound :size="22" /></span>
        <div class="employee-details">
          <h2>{{ employee.employee }}</h2>
          <p>EMP-{{ employee.emp_id ?? employee.employee_id }} · {{ employee.department || 'No department' }}</p>
        </div>
        <span class="status-badge" :class="employee.status">{{ statusLabel }}</span>
      </article>

      <div class="summary-grid">
        <article><span class="summary-icon blue"><WalletCards :size="19" /></span><div><small>Allocated Credits</small><strong>{{ format(employee.totalAllocated) }}</strong></div></article>
        <article><span class="summary-icon orange"><CalendarDays :size="19" /></span><div><small>Used Credits</small><strong>{{ format(employee.totalUsed) }}</strong></div></article>
        <article><span class="summary-icon green"><WalletCards :size="19" /></span><div><small>Remaining Credits</small><strong>{{ format(employee.totalAvailable) }}</strong></div></article>
      </div>

      <BaseDataTable
        title="Leave Credit Records"
        description="Credit details are loaded from the employee leave-balance API."
        :has-rows="employee.records.length > 0"
        min-width="900px"
        empty-title="No leave credit records"
        empty-description="This employee does not have any recorded leave credits."
      >
        <template #headers>
          <th>Leave Type</th>
          <th>Cycle</th>
          <th>Allocated</th>
          <th>Used</th>
          <th>Remaining</th>
        </template>

        <template #rows>
          <tr v-for="record in employee.records" :key="`${record.leave_policy_id}-${record.cycle_start}`">
            <td class="record-type">
              <strong>{{ record.leave_type || `Policy #${record.leave_policy_id}` }}</strong>
              <small>{{ record.policy_paid === true ? 'Paid' : record.policy_paid === false ? 'Unpaid' : '—' }}</small>
            </td>
            <td>{{ formatDate(record.cycle_start) }} – {{ formatDate(record.cycle_end) }}</td>
            <td>{{ format(record.allocated) }}</td>
            <td>{{ formatUsed(record.deductions) }}</td>
            <td><strong class="remaining" :class="{ empty: record.available <= 0 }">{{ format(record.available) }}</strong></td>
          </tr>
        </template>
      </BaseDataTable>
    </template>
  </section>
</template>

<style scoped>
.balance-details-page{width:100%;max-width:1450px;margin:0 auto;padding-bottom:30px}
.back-button{display:inline-flex;align-items:center;gap:7px;margin-bottom:14px;padding:0;border:0;background:transparent;color:var(--primary);font-size:11px;font-weight:650;cursor:pointer}
.employee-card{display:flex;align-items:center;gap:13px;margin-top:18px;padding:18px;border:1px solid var(--border);border-radius:12px;background:var(--bg-card)}
.employee-icon,.summary-icon{display:grid;place-items:center;flex:0 0 auto;border-radius:10px;background:var(--primary-soft);color:var(--primary)}
.employee-icon{width:44px;height:44px}.employee-details{min-width:0;flex:1}.employee-details h2{margin:0;color:var(--text-primary);font-size:16px}.employee-details p{margin:5px 0 0;color:var(--text-muted);font-size:11px}
.status-badge{padding:6px 11px;border-radius:999px;font-size:11px;font-weight:650;white-space:nowrap}.status-badge.healthy{background:var(--green-soft);color:var(--green)}.status-badge.low{background:var(--orange-soft);color:var(--orange)}.status-badge.none{background:var(--red-soft);color:var(--red)}
.summary-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:14px 0}.summary-grid article{display:flex;align-items:center;gap:11px;padding:16px;border:1px solid var(--border);border-radius:11px;background:var(--bg-card)}.summary-icon{width:38px;height:38px}.summary-icon.green{background:var(--green-soft);color:var(--green)}.summary-icon.orange{background:var(--orange-soft);color:var(--orange)}.summary-grid small,.summary-grid strong{display:block}.summary-grid small{color:var(--text-muted);font-size:10px}.summary-grid strong{margin-top:4px;color:var(--text-primary);font-size:18px}
.record-type small{display:block;margin-top:4px;color:var(--text-muted);font-size:11px}.remaining.empty{color:var(--red)}
.state-card{display:flex;align-items:center;justify-content:center;gap:10px;min-height:150px;padding:22px;border:1px solid var(--border);border-radius:12px;background:var(--bg-card);color:var(--text-secondary);font-size:12px}.error-state{justify-content:space-between}.error-state strong{color:var(--red)}.error-state p{margin:5px 0 0;color:var(--text-muted)}.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
@media(max-width:700px){.employee-card{align-items:flex-start;flex-wrap:wrap}.status-badge{margin-left:57px}.summary-grid{grid-template-columns:1fr}.state-card{align-items:flex-start;flex-direction:column}}
</style>
