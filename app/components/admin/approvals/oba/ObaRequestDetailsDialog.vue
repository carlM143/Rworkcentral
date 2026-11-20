<script setup lang="ts">
import { X } from 'lucide-vue-next'
import type { ObaImage, ObaRequestRecord } from '~/types/oba-request/obaRequest'

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  dept_head_approved: 'Dept. Head Approved',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
}
const statusLabel = (value: string) => statusLabels[value] ?? value
const statusClass = (value: string) =>
  value === 'approved' ? 'green'
    : value === 'pending' ? 'orange'
      : value === 'dept_head_approved' ? 'blue'
        : value === 'rejected' ? 'red' : 'neutral'
const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
const employeeNames = (record: ObaRequestRecord) =>
  (record.oba_employees ?? []).map(employee => employee.employee_name)

const props = defineProps<{ request: ObaRequestRecord | null }>()
const emit = defineEmits<{ close: [] }>()

const dialog = ref<HTMLDialogElement | null>(null)

const images = computed(() =>
  (props.request?.images ?? []).filter((img): img is ObaImage & { url: string } => Boolean(img.url)),
)

watch(() => props.request, async request => {
  await nextTick()
  if (request && !dialog.value?.open) dialog.value?.showModal()
  if (!request && dialog.value?.open) dialog.value.close()
})

const close = () => dialog.value?.close()
</script>

<template>
  <dialog ref="dialog" class="details-dialog" aria-label="OBA request details" @close="emit('close')" @click="($event.target === dialog) && close()">
    <template v-if="request">
      <div class="dialog-head">
        <div>
          <h2>{{ request.destination }}</h2>
          <p>#{{ request.id }} · Filed by {{ request.filer_name || '—' }}</p>
        </div>
        <div class="dialog-head-right">
          <span class="badge" :class="statusClass(request.status)">{{ statusLabel(request.status) }}</span>
          <button type="button" class="close-icon" aria-label="Close details" @click="close"><X :size="18" /></button>
        </div>
      </div>

      <dl class="detail-grid">
        <div><dt>Department</dt><dd>{{ request.department_name || '—' }}</dd></div>
        <div><dt>Date</dt><dd>{{ formatDate(request.date_request) }}</dd></div>
        <div><dt>Departure</dt><dd>{{ formatDateTime(request.time_from) }}</dd></div>
        <div><dt>Return</dt><dd>{{ formatDateTime(request.time_to) }}</dd></div>
        <div v-if="request.dept_head_acted_at"><dt>Dept. Head Acted</dt><dd>{{ formatDateTime(request.dept_head_acted_at) }}</dd></div>
        <div class="wide"><dt>Reason / Details</dt><dd class="reason">{{ request.reason }}</dd></div>
        <div class="wide">
          <dt>Employees ({{ employeeNames(request).length }})</dt>
          <dd class="chips"><span v-for="emp in request.oba_employees" :key="emp.id" class="chip">{{ emp.employee_name }}</span></dd>
        </div>
      </dl>

      <div class="images">
        <h3>Supporting Images</h3>
        <div v-if="images.length" class="thumbs">
          <a v-for="img in images" :key="img.id" :href="img.url" target="_blank" rel="noopener" class="thumb">
            <img :src="img.url" :alt="`Supporting image ${img.id}`">
          </a>
        </div>
        <p v-else class="muted">No supporting images attached.</p>
      </div>

      <div class="dialog-actions"><button type="button" class="close-button" @click="close">Close</button></div>
    </template>
  </dialog>
</template>

<style scoped>
.details-dialog { width: min(640px, calc(100% - 24px)); max-height: calc(100dvh - 32px); padding: 0; border: 1px solid var(--border); border-radius: 14px; background: var(--bg-card); color: var(--text-primary); box-shadow: 0 15px 60px #0003; overflow: hidden; }
.details-dialog::backdrop { background: #04152d80; backdrop-filter: blur(2px); }
.details-dialog[open] { display: flex; flex-direction: column; }
h2 { margin: 0; font-size: 15px; }
h3 { margin: 0 0 10px; font-size: 12px; }
p { margin: 4px 0 0; color: var(--text-secondary); font-size: 12px; }
.dialog-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 16px 20px; border-bottom: 1px solid var(--border-soft); }
.dialog-head-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.close-icon { display: grid; place-items: center; width: 34px; height: 34px; border: 0; border-radius: 8px; background: var(--bg-card-soft); color: var(--text-secondary); }
.badge { display: inline-block; padding: 5px 9px; border-radius: 5px; font-size: 10px; font-weight: 600; white-space: nowrap; }
.green { background: var(--green-soft); color: var(--green); }
.orange { background: var(--orange-soft); color: var(--orange); }
.blue { background: var(--primary-soft); color: var(--primary); }
.red { background: var(--red-soft); color: var(--red); }
.neutral { background: var(--bg-card-soft); color: var(--text-secondary); }
.detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; margin: 0; padding: 20px; overflow-y: auto; }
.detail-grid dt { margin-bottom: 6px; color: var(--text-secondary); font-size: 10px; }
.detail-grid dd { margin: 0; font-size: 12px; overflow-wrap: anywhere; }
.wide { grid-column: 1 / -1; }
.reason { white-space: pre-wrap; line-height: 1.7; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip { padding: 5px 10px; border: 1px solid var(--border); border-radius: 999px; background: var(--bg-card-soft); font-size: 11px; }
.images { padding: 0 20px 18px; }
.muted { color: var(--text-muted); }
.thumbs { display: flex; flex-wrap: wrap; gap: 10px; }
.thumb { display: block; width: 110px; height: 88px; overflow: hidden; border: 1px solid var(--border); border-radius: 9px; }
.thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.dialog-actions { display: flex; justify-content: flex-end; padding: 12px 20px; border-top: 1px solid var(--border-soft); }
.close-button { min-height: 38px; padding: 0 16px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); color: var(--text-primary); font-size: 12px; font-weight: 600; }
@media (max-width: 640px) { .detail-grid { grid-template-columns: 1fr; gap: 14px; } }
</style>