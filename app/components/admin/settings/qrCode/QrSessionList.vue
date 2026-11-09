<!-- Attendance QR: sessions generated on this device (open, revoke, remove). -->
<script setup lang="ts">
import { Ban, Eye, Trash2 } from 'lucide-vue-next'
import type { QrSessionRecord, QrSessionStatus } from '~/types/qrCode/qrCode'
import { qrSessionStatus } from '~/composables/admin/qrCode/useQrCode'

const props = defineProps<{
  sessions: QrSessionRecord[]
  currentId?: number | null
  loading?: boolean
}>()

const emit = defineEmits<{
  open: [sessionId: number]
  revoke: [sessionId: number]
  remove: [sessionId: number]
}>()

// Re-evaluate statuses every 30s so sessions move from Scheduled -> Active -> Expired.
const now = ref(Date.now())
let clock: ReturnType<typeof setInterval> | null = null
onMounted(() => { clock = setInterval(() => { now.value = Date.now() }, 30_000) })
onBeforeUnmount(() => { if (clock) clearInterval(clock) })

const statusLabel: Record<QrSessionStatus, string> = {
  active: 'Active',
  scheduled: 'Scheduled',
  expired: 'Expired',
  revoked: 'Revoked',
}

const rows = computed(() =>
  props.sessions.map(session => ({ session, status: qrSessionStatus(session, now.value) })),
)

const formatDateTime = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}
</script>

<template>
  <article class="qr-card">
    <div class="card-heading">
      <h3>QR Sessions</h3>
      <p>Sessions generated from this browser. Open an active one to display it again, or revoke it to stop all scans.</p>
    </div>

    <p v-if="!rows.length" class="empty">No QR sessions yet. Generate one to get started.</p>

    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Session</th>
            <th>Active Window</th>
            <th>Status</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="{ session, status } in rows" :key="session.id" :class="{ current: session.id === currentId }">
            <td>
              <strong>{{ session.name }}</strong>
              <small>#{{ session.id }}<template v-if="session.id === currentId"> · Displaying</template></small>
            </td>
            <td class="nowrap">
              {{ formatDateTime(session.starts_at) }}
              <small>to {{ formatDateTime(session.ends_at) }}</small>
            </td>
            <td><span class="status-pill" :class="status">{{ statusLabel[status] }}</span></td>
            <td>
              <div class="actions">
                <button
                  v-if="status === 'active' && session.id !== currentId"
                  type="button" class="action" title="Display QR code"
                  :disabled="loading" @click="emit('open', session.id)"
                >
                  <Eye :size="14" /> Display
                </button>
                <button
                  v-if="status === 'active' || status === 'scheduled'"
                  type="button" class="action danger" title="Revoke session"
                  :disabled="loading" @click="emit('revoke', session.id)"
                >
                  <Ban :size="14" /> Revoke
                </button>
                <button
                  v-if="status === 'expired' || status === 'revoked'"
                  type="button" class="action" title="Remove from this list"
                  :disabled="loading" @click="emit('remove', session.id)"
                >
                  <Trash2 :size="14" /> Remove
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </article>
</template>

<style scoped>
.qr-card{overflow:hidden;border:1px solid var(--border);border-radius:11px;background:var(--bg-card);box-shadow:var(--shadow)}
.card-heading{padding:15px 16px;border-bottom:1px solid var(--border-soft)}
.card-heading h3{margin:0;color:var(--text-primary);font-size:14px;font-weight:700}
.card-heading p{margin:5px 0 0;color:var(--text-muted);font-size:11px;line-height:1.5}
.empty{margin:0;padding:22px 16px;color:var(--text-muted);font-size:11px}
.table-wrap{overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:11px}
th{padding:10px 14px;border-bottom:1px solid var(--border-soft);color:var(--text-secondary);font-weight:650;text-align:left;white-space:nowrap}
td{padding:11px 14px;border-bottom:1px solid var(--border-soft);color:var(--text-primary);vertical-align:middle}
tr:last-child td{border-bottom:0}
tr.current td{background:var(--primary-soft)}
td strong{display:block;font-weight:650}
td small{display:block;margin-top:3px;color:var(--text-muted);font-size:10px}
.nowrap{white-space:nowrap}
.text-right{text-align:right}
.status-pill{display:inline-flex;padding:3px 9px;border-radius:999px;font-size:9px;font-weight:700}
.status-pill.active{background:var(--green-soft);color:var(--green)}
.status-pill.scheduled{background:var(--primary-soft);color:var(--primary)}
.status-pill.expired{background:var(--orange-soft);color:var(--orange)}
.status-pill.revoked{background:var(--red-soft);color:var(--red)}
.actions{display:flex;justify-content:flex-end;gap:6px}
.action{display:inline-flex;align-items:center;gap:5px;padding:5px 9px;border:1px solid var(--border-soft);border-radius:6px;background:var(--bg-card-soft);color:var(--text-secondary);font:inherit;font-size:10px;font-weight:600;cursor:pointer;white-space:nowrap}
.action:hover:not(:disabled){border-color:var(--primary);color:var(--primary)}
.action.danger:hover:not(:disabled){border-color:var(--red);color:var(--red)}
.action:disabled{opacity:.55;cursor:not-allowed}
</style>
