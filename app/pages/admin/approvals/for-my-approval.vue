<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Briefcase, CalendarDays, Check, Clock3, House, RefreshCw, TimerReset, Users, X } from 'lucide-vue-next'
import {
  supervisorApprovalError as teamApprovalError,
  useSupervisorApprovals as useTeamApprovals,
  type TeamApprovalItem,
  type TeamApprovalsResponse,
  type TeamRequestType,
} from '~/composables/admin/approvals/useSupervisorApprovals'

definePageMeta({ layout: 'admin' })
useHead({ title: 'For My Approval | RWorkCentral' })

const route = useRoute()
const api = useTeamApprovals()

const TYPES: { value: TeamRequestType | 'all', label: string, icon: unknown }[] = [
  { value: 'all', label: 'All', icon: Users },
  { value: 'leave', label: 'Leave', icon: CalendarDays },
  { value: 'overtime', label: 'Overtime', icon: TimerReset },
  { value: 'undertime', label: 'Undertime', icon: Clock3 },
  { value: 'wfh', label: 'Work From Home', icon: House },
  { value: 'oba', label: 'Official Business', icon: Briefcase },
]

const type = ref<TeamRequestType | 'all'>(
  (['leave', 'overtime', 'undertime', 'wfh', 'oba'] as const).includes(route.query.type as TeamRequestType)
    ? route.query.type as TeamRequestType
    : 'all',
)
const tab = ref<'pending' | 'history'>('pending')
const result = ref<TeamApprovalsResponse | null>(null)
const loading = ref(true)
const loadError = ref('')

const load = async () => {
  loading.value = true
  loadError.value = ''
  try {
    result.value = await api.list({ type: type.value, tab: tab.value })
  } catch (err) {
    loadError.value = teamApprovalError(err, 'Unable to load team approvals.')
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch([type, tab], load)

const items = computed(() => result.value?.data ?? [])
const count = (t: TeamRequestType | 'all') => (t === 'all' ? result.value?.counts.total : result.value?.counts[t]) ?? 0

const dateTime = (v: string | null) =>
  v ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(v.replace(' ', 'T'))) : '—'

// =====================================================
// APPROVE / REJECT
// =====================================================

const acting = ref<TeamApprovalItem | null>(null)
const mode = ref<'approve' | 'reject'>('approve')
const remarks = ref('')
const busy = ref(false)
const actionError = ref('')
const notice = ref('')

const open = (item: TeamApprovalItem, m: 'approve' | 'reject') => {
  acting.value = item
  mode.value = m
  remarks.value = ''
  actionError.value = ''
}

const submit = async () => {
  const item = acting.value
  if (!item) return
  if (mode.value === 'reject' && !remarks.value.trim()) {
    actionError.value = 'Enter the reason for rejecting.'
    return
  }
  busy.value = true
  actionError.value = ''
  try {
    const response = mode.value === 'approve'
      ? await api.approve(item.type, item.id, remarks.value.trim() || undefined)
      : await api.reject(item.type, item.id, remarks.value.trim())
    notice.value = response.message
    acting.value = null
    await load()
  } catch (err) {
    actionError.value = teamApprovalError(err, 'Unable to update the request.')
  } finally {
    busy.value = false
  }
}

const headStatusLabel: Record<string, string> = {
  approved: 'Approved',
  rejected: 'Rejected',
  overridden: 'Approved by HR',
  pending: 'Waiting for you',
  skipped: '—',
}
</script>

<template>
  <section class="team-page">
    <header class="page-header">
      <div>
        <h1>For My Approval</h1>
        <p>
          Requests filed by employees that need your approval first. After you approve, HR gives the final approval.
          <template v-if="result?.departments.length"> You head {{ result.departments.join(', ') }}.</template>
        </p>
      </div>
      <button type="button" class="ghost" :disabled="loading" @click="load"><RefreshCw :size="15" /> Refresh</button>
    </header>

    <p v-if="notice" class="notice" role="status">{{ notice }} <button type="button" aria-label="Dismiss" @click="notice = ''"><X :size="14" /></button></p>

    <template v-if="true">
      <nav class="tabs" aria-label="Status">
        <button type="button" :class="{ active: tab === 'pending' }" @click="tab = 'pending'">
          Pending <span v-if="count('all')" class="badge">{{ count('all') }}</span>
        </button>
        <button type="button" :class="{ active: tab === 'history' }" @click="tab = 'history'">History</button>
      </nav>

      <div class="chips" role="group" aria-label="Request type">
        <button
          v-for="t in TYPES"
          :key="t.value"
          type="button"
          class="chip"
          :class="{ active: type === t.value }"
          :aria-pressed="type === t.value"
          @click="type = t.value"
        >
          <component :is="t.icon" :size="14" />
          {{ t.label }}
          <span v-if="tab === 'pending' && count(t.value)" class="chip-count">{{ count(t.value) }}</span>
        </button>
      </div>

      <p v-if="loadError" class="error" role="alert">{{ loadError }}</p>
      <div v-else-if="loading && !result" class="state">Loading...</div>
      <div v-else-if="!items.length" class="state">
        <strong>{{ tab === 'pending' ? 'Nothing to approve' : 'No history yet' }}</strong>
        <span>{{ tab === 'pending' ? 'New requests from your team will appear here.' : 'Requests you act on will appear here.' }}</span>
      </div>

      <ul v-else class="list" :class="{ dim: loading }">
        <li v-for="item in items" :key="`${item.type}-${item.id}`" class="card">
          <div class="card-main">
            <span class="type" :class="item.type">{{ item.type_label }}</span>
            <strong>{{ item.employee }}</strong>
            <small>{{ item.emp_id }} · {{ item.request_no }} · filed {{ dateTime(item.filed_at) }}</small>
            <p class="summary">{{ item.summary }}</p>
            <p v-if="item.reason" class="reason">“{{ item.reason }}”</p>
            <p v-if="tab === 'history'" class="decision" :class="item.head_status">
              {{ headStatusLabel[item.head_status] }}<template v-if="item.head_by && result?.sees_all"> ({{ item.head_by }})</template> · {{ dateTime(item.acted_at) }}
              <template v-if="item.head_remarks"> — {{ item.head_remarks }}</template>
            </p>
          </div>
          <div v-if="tab === 'pending'" class="card-actions">
            <button type="button" class="btn reject" @click="open(item, 'reject')"><X :size="15" /> Reject</button>
            <button type="button" class="btn approve" @click="open(item, 'approve')"><Check :size="15" /> Approve</button>
          </div>
        </li>
      </ul>
    </template>

    <!-- CONFIRM -->
    <div v-if="acting" class="backdrop" @click.self="acting = null">
      <form class="dialog" role="dialog" aria-modal="true" aria-labelledby="ta-title" @submit.prevent="submit">
        <h2 id="ta-title">{{ mode === 'approve' ? 'Approve' : 'Reject' }} {{ acting.type_label.toLowerCase() }} request?</h2>
        <p>{{ acting.employee }} · {{ acting.request_no }}<br>{{ acting.summary }}</p>
        <label for="ta-remarks">{{ mode === 'approve' ? 'Remarks (optional)' : 'Reason for rejecting' }}</label>
        <textarea id="ta-remarks" v-model="remarks" rows="3" maxlength="1000" />
        <p v-if="mode === 'approve'" class="hint">After your approval, the request goes to HR for the final approval.</p>
        <p v-if="actionError" class="error" role="alert">{{ actionError }}</p>
        <div class="dialog-actions">
          <button type="button" class="ghost" :disabled="busy" @click="acting = null">Cancel</button>
          <button type="submit" class="btn" :class="mode" :disabled="busy">{{ busy ? 'Saving...' : mode === 'approve' ? 'Approve' : 'Reject' }}</button>
        </div>
      </form>
    </div>
  </section>
</template>

<style scoped>
.team-page { display: grid; gap: 14px; width: 100%; max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 12px; }
.page-header h1 { margin: 0; font-size: 24px; }
.page-header p { margin: 4px 0 0; color: var(--text-secondary, #667085); font-size: 13px; }

.ghost { display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 14px; border: 1px solid var(--border, #e6eaf0); border-radius: 9px; background: transparent; color: var(--text-primary, #172033); font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
.notice { display: flex; align-items: center; justify-content: space-between; margin: 0; padding: 10px 12px; border-radius: 9px; background: var(--green-soft, #eaf8f1); color: var(--green, #16a663); font-size: 13px; }
.notice button { border: 0; background: transparent; color: inherit; cursor: pointer; }
.error { margin: 0; color: var(--red, #ef4444); font-size: 13px; }

.state { display: flex; min-height: 180px; flex-direction: column; align-items: center; justify-content: center; gap: 6px; border: 1px solid var(--border, #e6eaf0); border-radius: 12px; background: var(--bg-card, #fff); color: var(--text-muted, #98a2b3); font-size: 13px; text-align: center; }
.state strong { color: var(--text-primary, #172033); font-size: 15px; }

.tabs { display: flex; gap: 6px; border-bottom: 1px solid var(--border, #e6eaf0); }
.tabs button { display: inline-flex; align-items: center; gap: 6px; padding: 10px 14px; border: 0; border-bottom: 2px solid transparent; background: transparent; color: var(--text-secondary, #667085); font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
.tabs button.active { border-color: var(--primary, #246bfd); color: var(--text-primary, #172033); }
.badge { padding: 1px 7px; border-radius: 999px; background: var(--red, #ef4444); color: #fff; font-size: 11px; }

.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip { display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 12px; border: 1px solid var(--border, #e6eaf0); border-radius: 999px; background: var(--bg-card, #fff); color: var(--text-secondary, #667085); font-family: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
.chip.active { border-color: var(--primary, #246bfd); background: var(--primary-soft, #edf4ff); color: var(--text-primary, #172033); }
.chip-count { padding: 0 6px; border-radius: 999px; background: var(--primary, #246bfd); color: #fff; font-size: 10px; }

.list { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }
.list.dim { opacity: 0.6; }
.card { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 14px; padding: 16px; border: 1px solid var(--border, #e6eaf0); border-radius: 12px; background: var(--bg-card, #fff); }
.card-main { display: grid; min-width: 0; flex: 1; gap: 3px; }
.card-main strong { font-size: 15px; }
.card-main small { color: var(--text-muted, #98a2b3); font-size: 12px; }
.type { width: fit-content; padding: 2px 9px; border-radius: 999px; font-size: 11px; font-weight: 700; background: var(--primary-soft, #edf4ff); color: var(--primary, #246bfd); }
.type.overtime { background: var(--orange-soft, #fff6df); color: var(--orange, #f59e0b); }
.type.undertime { background: var(--red-soft, #fff0f0); color: var(--red, #ef4444); }
.type.oba { background: var(--purple-soft, #f2edff); color: var(--purple, #7c4dff); }
.type.wfh { background: var(--green-soft, #eaf8f1); color: var(--green, #16a663); }
.summary { margin: 6px 0 0; color: var(--text-primary, #172033); font-size: 13px; font-weight: 600; }
.reason { margin: 2px 0 0; color: var(--text-secondary, #667085); font-size: 13px; font-style: italic; }
.decision { margin: 6px 0 0; font-size: 12px; font-weight: 600; }
.decision.approved, .decision.overridden { color: var(--green, #16a663); }
.decision.rejected { color: var(--red, #ef4444); }

.card-actions { display: flex; gap: 8px; }
.btn { display: inline-flex; align-items: center; gap: 6px; height: 38px; padding: 0 16px; border: 1px solid transparent; border-radius: 9px; font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer; }
.btn.approve { background: var(--green, #16a663); color: #fff; }
.btn.reject { border-color: var(--red, #ef4444); background: transparent; color: var(--red, #ef4444); }
.btn:disabled, .ghost:disabled { opacity: 0.6; cursor: not-allowed; }
button:focus-visible, textarea:focus-visible { outline: 2px solid var(--primary, #246bfd); outline-offset: 2px; }

.backdrop { position: fixed; inset: 0; z-index: 300; display: grid; place-items: center; padding: 16px; background: rgba(5, 15, 30, 0.6); }
.dialog { display: grid; width: 100%; max-width: 440px; gap: 8px; padding: 22px; border: 1px solid var(--border, #e6eaf0); border-radius: 14px; background: var(--bg-card, #fff); }
.dialog h2 { margin: 0; font-size: 17px; }
.dialog p { margin: 0; color: var(--text-secondary, #667085); font-size: 13px; line-height: 1.5; }
.dialog label { margin-top: 6px; font-size: 12px; font-weight: 700; }
.dialog textarea { padding: 10px; border: 1px solid var(--border, #e6eaf0); border-radius: 9px; background: var(--bg-card-soft, #f8fafc); color: var(--text-primary, #172033); font-family: inherit; font-size: 13px; resize: vertical; }
.hint { font-size: 12px !important; }
.dialog-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }

@media (max-width: 640px) {
  .card-actions { width: 100%; }
  .card-actions .btn { flex: 1; justify-content: center; }
}
</style>