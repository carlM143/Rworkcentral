<script setup lang="ts">
import { ArrowLeft, CalendarDays, FileText, Paperclip, Pencil, Umbrella, X } from 'lucide-vue-next'
import ConfirmationModal from '~/components/ui/ConfirmationModal.vue'
import { employeeRequestError, useLeave } from '~/composables/employee/leave/useLeave'
import type { LeaveRequestRecord } from '~/types/employee/leave/leave'

// /employee/leave/show?id=123
definePageMeta({ layout: false, middleware: 'employee' })
useHead({ title: 'Leave Request | Employee Portal — RWorkCentral' })

const BASE = '/employee/leave'

const route = useRoute()
const api = useLeave()
const { success, error: showError } = useToast()

const id = computed(() => Number(route.query.id))
const request = ref<LeaveRequestRecord | null>(null)
const loading = ref(true)
const loadError = ref('')

const load = async () => {
  loading.value = true
  loadError.value = ''
  try {
    request.value = Number.isInteger(id.value) && id.value > 0 ? await api.find(id.value) : null
    if (!request.value) loadError.value = 'Leave request not found. Verify the link or return to your request list.'
  } catch (cause) {
    loadError.value = employeeRequestError(cause, 'Unable to load the leave request.')
  } finally {
    loading.value = false
  }
}

onMounted(() => void load())

const isPending = computed(() => request.value?.status.toLowerCase() === 'pending')

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(`${value.slice(0, 10)}T12:00:00`)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

const statusLabel = (value: string) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
const badgeClass = (value: string) => {
  const status = value.toLowerCase()
  return status === 'approved' ? 'green' : status === 'pending' ? 'orange' : 'neutral'
}
const dayTypeLabel = (value: string) => (value === 'half_day' ? 'Half day' : 'Whole day')
const payTypeLabel = (value?: string | null) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : '—')

/* Cancel */
const confirmOpen = ref(false)
const cancelling = ref(false)

const confirmCancel = async () => {
  if (!request.value) return
  cancelling.value = true
  try {
    const res = await api.cancel(request.value.raw_id)
    success('Leave Request Cancelled', res.message || 'Your leave request was cancelled.')
    confirmOpen.value = false
    await load()
  } catch (cause) {
    showError('Unable to Cancel', employeeRequestError(cause, 'The leave request could not be cancelled.'))
  } finally {
    cancelling.value = false
  }
}
</script>

<template>
  <section class="show-page">
    <NuxtLink :to="BASE" class="back-link"><ArrowLeft :size="16" /> Back to Leave Requests</NuxtLink>

    <div class="heading">
      <div class="heading-icon"><Umbrella :size="24" /></div>
      <div>
        <h1>{{ request?.type || 'Leave Request' }}</h1>
        <p>{{ request ? `${request.id} · Filed ${formatDate(request.request_date)}` : 'Leave request details' }}</p>
      </div>
      <span v-if="request" class="badge heading-badge" :class="badgeClass(request.status)">{{ statusLabel(request.status) }}</span>
    </div>

    <div v-if="loading" class="card missing">Loading leave request…</div>
    <div v-else-if="!request" class="card missing">{{ loadError }}</div>

    <template v-else>
      <article class="card">
        <dl class="info-grid">
          <div><dt>Leave Type</dt><dd>{{ request.type }}</dd></div>
          <div><dt>Period</dt><dd>{{ formatDate(request.start) }}<template v-if="request.end && request.end !== request.start"> – {{ formatDate(request.end) }}</template></dd></div>
          <div><dt>Total Days</dt><dd>{{ request.total_days }} day(s)</dd></div>
          <div><dt>Paid / Unpaid</dt><dd>{{ request.total_paid_days }} paid · {{ request.total_unpaid_days }} unpaid</dd></div>
          <div><dt>Requested Pay</dt><dd>{{ payTypeLabel(request.requested_pay_type) }}</dd></div>
          <div><dt>Approved Pay</dt><dd>{{ payTypeLabel(request.approved_pay_type) }}</dd></div>
        </dl>
      </article>

      <article class="card">
        <h2><CalendarDays :size="16" /> Leave Dates</h2>
        <div class="dates-table">
          <div class="dates-row head"><span>Date</span><span>Duration</span><span>Pay</span></div>
          <div v-for="date in request.dates" :key="date.id" class="dates-row">
            <span>{{ formatDate(date.leave_date) }}</span>
            <span>{{ dayTypeLabel(date.day_type) }} ({{ date.day_value }})</span>
            <span>{{ payTypeLabel(date.approved_pay_type || date.requested_pay_type) }}</span>
          </div>
          <p v-if="!request.dates.length" class="muted">No dates recorded.</p>
        </div>
      </article>

      <article class="card">
        <h2><FileText :size="16" /> Reason</h2>
        <p class="reason">{{ request.reason || 'No reason provided.' }}</p>
        <a v-if="request.file_url" :href="request.file_url" target="_blank" rel="noopener noreferrer" class="attachment">
          <Paperclip :size="14" /> {{ request.image?.name || 'View attachment' }}
        </a>
      </article>

      <div class="actions">
        <NuxtLink :to="BASE" class="secondary">Close</NuxtLink>
        <template v-if="isPending">
          <button type="button" class="danger" @click="confirmOpen = true"><X :size="15" /> Cancel Request</button>
          <NuxtLink :to="{ path: `${BASE}/edit`, query: { id: String(request.raw_id) } }" class="primary"><Pencil :size="15" /> Edit Request</NuxtLink>
        </template>
      </div>
    </template>

    <ConfirmationModal
      :open="confirmOpen"
      title="Cancel Leave Request?"
      :message="request ? `${request.type} (${request.id}) will be cancelled. This cannot be undone.` : ''"
      :confirm-text="cancelling ? 'Cancelling…' : 'Cancel Request'"
      cancel-text="Keep Request"
      variant="danger"
      :loading="cancelling"
      @confirm="confirmCancel"
      @cancel="!cancelling && (confirmOpen = false)"
    />
  </section>
</template>

<style scoped>
/* Same frame as the Time Log Correction form/show pages */
.show-page { max-width: 930px; margin: 0 auto; color: var(--text-primary); }
.back-link { display: inline-flex; align-items: center; gap: 7px; margin-bottom: 20px; color: var(--primary); font-size: 12px; font-weight: 600; text-decoration: none; }
.heading { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
.heading-icon { display: grid; flex-shrink: 0; width: 52px; height: 52px; place-items: center; border-radius: 12px; background: var(--primary-soft); color: var(--primary); }
.heading h1 { margin: 0 0 5px; font-size: 24px; }
.heading p { margin: 0; color: var(--text-secondary); font-size: 12px; }
.heading-badge { margin-left: auto; }
.card { margin-bottom: 14px; padding: 22px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); box-shadow: var(--shadow); }
.card h2 { display: flex; align-items: center; gap: 8px; margin: 0 0 14px; font-size: 15px; }
.card h2 svg { color: var(--primary); }
.missing { color: var(--text-secondary); font-size: 13px; }
.info-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; margin: 0; }
.info-grid dt { color: var(--text-secondary); font-size: 11px; }
.info-grid dd { margin: 6px 0 0; font-size: 13px; font-weight: 600; }
.dates-table { display: grid; }
.dates-row { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 12px; padding: 10px 0; border-top: 1px solid var(--border-soft); font-size: 12px; }
.dates-row.head { border-top: 0; color: var(--text-secondary); font-size: 11px; }
.muted { color: var(--text-muted); font-size: 12px; }
.reason { margin: 0; color: var(--text-secondary); font-size: 13px; line-height: 1.7; white-space: pre-line; }
.attachment { display: inline-flex; align-items: center; gap: 6px; margin-top: 14px; color: var(--primary); font-size: 12px; font-weight: 600; }
.badge { display: inline-block; padding: 5px 9px; border-radius: 6px; font-size: 11px; font-weight: 600; white-space: nowrap; }
.green { background: var(--green-soft); color: var(--green); }
.orange { background: var(--orange-soft); color: var(--orange); }
.neutral { background: var(--bg-card-soft); color: var(--text-secondary); }
.actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 10px; margin-top: 6px; }
.actions a, .actions button { display: inline-flex; min-height: 40px; align-items: center; justify-content: center; gap: 7px; padding: 10px 17px; border-radius: 8px; font: inherit; font-size: 12px; font-weight: 600; text-decoration: none; cursor: pointer; }
.secondary { border: 1px solid var(--border); color: var(--text-primary); }
.danger { border: 1px solid var(--red); background: transparent; color: var(--red); }
.primary { border: 0; background: linear-gradient(135deg, #1f68f2, #2878ff); color: #fff; }
@media (max-width: 640px) {
  .card { padding: 16px; }
  .heading { flex-wrap: wrap; }
  .heading h1 { font-size: 20px; }
  .info-grid { grid-template-columns: 1fr 1fr; }
  .actions > * { flex: 1; }
}
</style>
