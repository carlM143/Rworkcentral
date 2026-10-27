<script setup lang="ts">
import { employeeLeavePolicy } from '~/utils/employeeLeavePolicy'

const { profile } = useEmployeePortal()
const leaveYear = new Date().getFullYear()
const leaveTypes = computed(() => employeeLeavePolicy(profile.value.employmentType))
const days = (value: number | null) => value === null ? 'HR assessment required' : `${value} ${value === 1 ? 'day' : 'days'}`
const detailsOpen = ref(false)
const selectedName = ref('')
const selectedLeave = computed(() => leaveTypes.value.find(leave => leave.name === selectedName.value))
const viewLeave = (name: string) => { selectedName.value = name; detailsOpen.value = true }
</script>

<template>
  <article class="leave-card">
    <header><div><h2>Annual Leave Credits &amp; Eligibility</h2><p>Leave Year: <strong>{{ leaveYear }}</strong> · January 1–December 31</p><p>Employment Type: <strong>{{ profile.employmentType || 'Not provided' }}</strong></p></div><NuxtLink to="/employee/requests" class="request-link">Go to Requests</NuxtLink></header>
    <div class="reset-info"><strong>Next annual reset: January 1, {{ leaveYear + 1 }}</strong><p>Current leave year ends December 31, {{ leaveYear }}. Under this illustrative calendar-year policy, annual company credits renew on January 1. Carryover and unused-credit treatment require HR confirmation. Automatic balance resets are not connected yet.</p></div>
    <p class="policy-note">Company leave credits below are annual allowances for {{ leaveYear }}, not monthly credits. These are illustrative frontend company rules and balances, not a confirmed HR ledger. Available Days shows the remaining configured credits. Used days currently start at zero and are not calculated from existing request history; local requests do not deduct credits. “Available to request” is not an approval or a guarantee of paid leave. HR must confirm the leave year, credits, service requirements and supporting documents. Statutory rights are assessed separately.</p>
    <p class="mobile-table-hint">Tap a leave row for full credits, eligibility, policy and reset details.</p>
    <div class="table-scroll" role="region" aria-label="Leave types and eligibility" tabindex="0">
      <table class="mobile-compact-table"><thead><tr><th scope="col">Leave Type</th><th scope="col" class="mobile-hide">Category</th><th scope="col" class="mobile-hide">Allocated Days</th><th scope="col">Used Days</th><th scope="col">Available Days</th><th scope="col">Your Eligibility</th><th scope="col" class="mobile-hide">Requirements / Policy</th></tr></thead><tbody>
        <tr v-for="leave in leaveTypes" :key="leave.name" class="record-row" @click="viewLeave(leave.name)"><th scope="row"><button type="button" class="row-open-button" :aria-label="`Open ${leave.name} credits`" @click.stop="viewLeave(leave.name)">{{ leave.name }}</button></th><td class="mobile-hide">{{ leave.category }}</td><td class="mobile-hide">{{ days(leave.allocated) }}</td><td><span class="mobile-hide">{{ days(leave.used) }}</span><span class="mobile-only">{{ leave.used === null ? 'HR review' : days(leave.used) }}</span></td><td><strong><span class="mobile-hide">{{ days(leave.available) }}</span><span class="mobile-only">{{ leave.available === null ? 'HR review' : days(leave.available) }}</span></strong></td><td><span class="badge" :class="leave.status === 'Available to request' ? 'available' : leave.canRequest ? 'review' : 'unavailable'"><span class="mobile-hide">{{ leave.status }}</span><span class="mobile-only">{{ leave.status === 'Available to request' ? 'Eligible' : leave.canRequest ? 'HR review' : 'Not eligible' }}</span></span></td><td class="rule mobile-hide">{{ leave.rule }}</td></tr>
      </tbody></table>
    </div>
    <EmployeeRecordDialog v-model="detailsOpen" title="Leave Credit Details" :subtitle="selectedName">
      <dl v-if="selectedLeave" class="record-fields"><div><dt>Leave Type</dt><dd>{{ selectedLeave.name }}</dd></div><div><dt>Category</dt><dd>{{ selectedLeave.category }}</dd></div><div><dt>Employment Type</dt><dd>{{ profile.employmentType }}</dd></div><div><dt>Eligibility</dt><dd>{{ selectedLeave.status }}</dd></div><div><dt>Allocated Days</dt><dd>{{ days(selectedLeave.allocated) }}</dd></div><div><dt>Used Days</dt><dd>{{ days(selectedLeave.used) }}</dd></div><div><dt>Available Days</dt><dd>{{ days(selectedLeave.available) }}</dd></div><div><dt>Annual Leave Year</dt><dd>{{ leaveYear }} · January 1–December 31</dd></div><div><dt>Next Annual Reset</dt><dd>January 1, {{ leaveYear + 1 }}</dd></div><div class="wide"><dt>Requirements / Policy</dt><dd>{{ selectedLeave.rule }}</dd></div><div class="wide"><dt>Important</dt><dd>Frontend reference credits only. HR must confirm eligibility, balances, carryover and statutory rights. Automatic resets are not connected.</dd></div></dl>
    </EmployeeRecordDialog>
  </article>
</template>

<style scoped>
.reset-info { margin: 0 18px 16px; padding: 12px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--primary-soft); }.reset-info strong { color: var(--primary); font-size: 12px; }
@media(max-width: 850px) { .leave-card header { padding: 16px; }.leave-card p { font-size: 13px; }.leave-card .request-link { display: inline-flex; align-items: center; min-height: 44px; font-size: 13px; }.leave-card .badge { white-space: normal; min-width: 130px; line-height: 1.5; }.leave-card .reset-info strong { font-size: 13px; } }
.leave-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; box-shadow: var(--shadow); }header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 18px; }h2 { margin: 0; font-size: 14px; }p { font-size: 11px; line-height: 1.7; color: var(--text-secondary); margin: 6px 0 0; }.request-link { color: var(--primary); font-size: 11px; }.policy-note { margin: 0; padding: 0 18px 18px; }.table-scroll { overflow-x: auto; }.table-scroll:focus-visible { outline: 2px solid var(--primary); outline-offset: -2px; }table { width: 100%; border-collapse: collapse; text-align: left; font-size: 11px; }th, td { padding: 14px 18px; border-top: 1px solid var(--border-soft); }thead th { background: var(--bg-card-soft); color: var(--text-secondary); font-weight: 500; white-space: nowrap; }tbody th { font-weight: 600; white-space: nowrap; }td { color: var(--text-secondary); }.rule { min-width: 240px; line-height: 1.7; }.badge { display: inline-block; border-radius: 5px; padding: 6px 8px; font-size: 10px; white-space: nowrap; }.available { color: var(--green); background: var(--green-soft); }.review { color: var(--orange); background: var(--orange-soft); }.unavailable { color: var(--text-secondary); background: var(--bg-card-soft); }
</style>
