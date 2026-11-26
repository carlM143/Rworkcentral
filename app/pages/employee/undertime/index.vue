<script setup lang="ts">
import { Clock, Clock3, Paperclip, Plus, Search, X } from 'lucide-vue-next'
import UndertimeTable from '~/components/employee/undertime/UndertimeTable.vue'
import ConfirmationModal from '~/components/ui/ConfirmationModal.vue'
import DepartmentApprovalProgress from '~/components/admin/approvals/DepartmentApprovalProgress.vue'
import { employeeRequestError } from '~/composables/employee/leave/useLeave'
import { useUndertime } from '~/composables/employee/undertime/useUndertime'
import type { EmployeeRequest } from '~/composables/employee/useEmployeePortal'
import type { UndertimeRequestRecord } from '~/types/employee/undertime/undertime'
import { requestClock, undertimeDuration } from '~/utils/employeeRequestTime'

definePageMeta({ layout: false, middleware: 'employee' })
useHead({ title: 'Undertime Requests | Employee Portal — RWorkCentral' })

const route = useRoute()
const api = useUndertime()
const { profile } = useEmployeePortal()
const { success, error: showError } = useToast()

/* =========================================================
   LIST
========================================================= */

const requests = ref<UndertimeRequestRecord[]>([])
const loading = ref(false)
const loadError = ref('')
const search = ref('')
const status = ref('All')

const load = async () => {
  loading.value = true
  loadError.value = ''
  try {
    requests.value = await api.list()
  } catch (cause) {
    requests.value = []
    loadError.value = employeeRequestError(cause, 'Unable to load your undertime requests.')
  } finally {
    loading.value = false
  }
}

const filtered = computed(() => requests.value.filter((request) => {
  if (status.value !== 'All' && request.status.toLowerCase() !== status.value.toLowerCase()) return false
  const keyword = search.value.trim().toLowerCase()
  if (!keyword) return true
  return [request.id, request.start, request.reason, request.status]
    .some(value => String(value ?? '').toLowerCase().includes(keyword))
}))

const countBy = (value: string) => requests.value.filter(request => request.status.toLowerCase() === value).length
const stats = computed(() => [
  { label: 'Total Requests', value: requests.value.length, note: 'Recorded submissions' },
  { label: 'Pending', value: countBy('pending'), note: 'Awaiting HR review' },
  { label: 'Approved', value: countBy('approved'), note: 'Approved by HR' },
])

/* =========================================================
   HELPERS
========================================================= */

const pad = (value: number) => String(value).padStart(2, '0')
const today = () => {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(`${value.slice(0, 10)}T12:00:00`)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

const durationText = (minutes: number | null) => {
  if (!minutes || minutes <= 0) return 'Enter valid times'
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return hours ? `${hours} hr${hours === 1 ? '' : 's'}${rest ? ` ${rest} min` : ''}` : `${rest} min`
}

const statusLabel = (value: string) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
const badgeClass = (value: string) => {
  const status = value.toLowerCase()
  return status === 'approved' ? 'green' : status === 'pending' ? 'orange' : 'neutral'
}

/* =========================================================
   CREATE / EDIT POPUP
   Undertime must fall inside the employee's shift for that day.
========================================================= */

const formOpen = ref(false)
const editing = ref<UndertimeRequestRecord | null>(null)
const saving = ref(false)
const formError = ref('')
const imageLoading = ref(false)
const image = ref<EmployeeRequest['image']>()
const formKey = ref(0)

const form = reactive({ date: '', leaveAt: '', endTime: '', reason: '' })

const shift = computed(() => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date)) return null
  const day = new Date(`${form.date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long' })
  return profile.value.workDays.find(item => item.day === day && item.start) ?? null
})

const minutes = computed(() =>
  shift.value ? undertimeDuration(shift.value.start, shift.value.end, form.leaveAt, form.endTime) : null,
)

// Picking another date resets the end time to that day's shift end
watch(() => form.date, () => {
  if (formOpen.value && !editing.value) form.endTime = shift.value?.end || ''
})

const openCreate = () => {
  editing.value = null
  Object.assign(form, { date: today(), leaveAt: '', endTime: '', reason: '' })
  form.endTime = shift.value?.end || ''
  image.value = undefined
  formError.value = ''
  formKey.value++
  formOpen.value = true
}

const openEdit = (request: UndertimeRequestRecord) => {
  detail.value = null
  editing.value = request
  Object.assign(form, {
    date: request.start.slice(0, 10),
    leaveAt: request.timing.requestedTimeOut || request.timing.startTime,
    endTime: request.timing.scheduledTimeOut || request.timing.endTime,
    reason: request.reason,
  })
  image.value = request.image ? { ...request.image } : undefined
  formError.value = ''
  formKey.value++
  formOpen.value = true
}

const closeForm = () => {
  if (!saving.value) formOpen.value = false
}

const save = async () => {
  if (saving.value || imageLoading.value) return
  if (!form.date) { formError.value = 'Choose the undertime date.'; return }
  if (!shift.value) { formError.value = 'No working shift is assigned on this day. Select a working day or contact HR.'; return }
  if (minutes.value === null) {
    formError.value = `Enter a start and end time within your shift (${requestClock(shift.value.start)} – ${requestClock(shift.value.end)}).`
    return
  }
  if (!form.reason.trim()) { formError.value = 'Please provide a reason for your request.'; return }

  // Only a newly picked image is sent; removing the current one sends remove_image
  const newImage = image.value?.dataUrl?.startsWith('data:') ? image.value.dataUrl : undefined
  const removeImage = Boolean(editing.value?.image && !image.value)
  const payload = {
    undertime_date: form.date,
    requested_time: form.leaveAt,
    scheduled_time: form.endTime,
    requested_minutes: minutes.value,
    reason: form.reason.trim(),
    image: removeImage ? null : newImage,
    remove_image: removeImage,
  }

  saving.value = true
  formError.value = ''
  try {
    const res = editing.value
      ? await api.update(editing.value.raw_id, payload)
      : await api.create(payload)
    success(
      editing.value ? 'Undertime Request Updated' : 'Undertime Request Submitted',
      res.message || (editing.value ? 'Your undertime request was updated.' : 'Your undertime request was sent to HR.'),
    )
    formOpen.value = false
    await load()
  } catch (cause) {
    formError.value = employeeRequestError(cause, editing.value ? 'Unable to update the request.' : 'Unable to submit the request.')
  } finally {
    saving.value = false
  }
}

/* =========================================================
   DETAILS & CANCEL
========================================================= */

const detail = ref<UndertimeRequestRecord | null>(null)
const cancelTarget = ref<UndertimeRequestRecord | null>(null)
const cancellingId = ref<number | null>(null)

const askCancel = (request: UndertimeRequestRecord) => {
  detail.value = null
  cancelTarget.value = request
}

const confirmCancel = async () => {
  const target = cancelTarget.value
  if (!target) return
  cancellingId.value = target.raw_id
  try {
    const res = await api.cancel(target.raw_id)
    success('Undertime Request Cancelled', res.message || 'Your undertime request was cancelled.')
    await load()
  } catch (cause) {
    showError('Unable to Cancel', employeeRequestError(cause, 'The undertime request could not be cancelled.'))
  } finally {
    cancellingId.value = null
    cancelTarget.value = null
  }
}

onMounted(async () => {
  await load()
  // Dashboard links: ?new=1 opens the form; ?edit=<id> opens that pending request for editing
  if (route.query.new === '1') openCreate()
  const editId = Number(route.query.edit)
  const toEdit = editId ? requests.value.find(request => request.raw_id === editId) : null
  if (toEdit?.status.toLowerCase() === 'pending') openEdit(toEdit)
  else if (toEdit) detail.value = toEdit
})
</script>

<template>
  <section class="request-page">
    <header class="page-header">
      <div>
        <h1>Undertime Requests</h1>
        <p>Request to leave before your shift ends and track its approval status.</p>
      </div>
      <button type="button" class="primary-button" @click="openCreate">
        <Plus :size="17" /> New Undertime Request
      </button>
    </header>

    <p v-if="loadError" class="error-message" role="alert">
      {{ loadError }} <button type="button" @click="load">Retry</button>
    </p>

    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <span>{{ stat.label }}</span><strong>{{ stat.value }}</strong><small>{{ stat.note }}</small>
      </div>
    </div>

    <article class="table-card">
      <div class="table-header">
        <div>
          <h2>Request History</h2>
          <p>Your undertime requests with their time and duration.</p>
        </div>
        <div class="filters">
          <label class="search-field">
            <Search :size="16" />
            <input v-model="search" type="search" placeholder="Search requests..." aria-label="Search undertime requests">
          </label>
          <select v-model="status" aria-label="Filter by status">
            <option>All</option><option>Pending</option><option>Approved</option><option>Rejected</option><option>Cancelled</option>
          </select>
        </div>
      </div>

      <UndertimeTable
        :requests="filtered"
        :loading="loading"
        :cancelling-id="cancellingId"
        @view="request => (detail = request)"
        @edit="openEdit"
        @cancel="askCancel"
      />
    </article>

    <Teleport to="body">
      <!-- Create / edit -->
      <div v-if="formOpen" class="overlay" @click.self="closeForm">
        <form class="dialog" role="dialog" aria-modal="true" aria-labelledby="ut-form-title" @submit.prevent="save">
          <div class="dialog-heading">
            <h2 id="ut-form-title"><Clock3 :size="18" /> {{ editing ? 'Edit' : 'New' }} Undertime Request</h2>
            <button type="button" class="icon-button" aria-label="Close" :disabled="saving" @click="closeForm"><X :size="18" /></button>
          </div>

          <fieldset :disabled="saving" class="fields">
            <label class="full"><span>Undertime Date <b>*</b></span><input v-model="form.date" type="date" required></label>
            <p v-if="shift" class="full shift-note">
              Scheduled shift: <strong>{{ requestClock(shift.start) }} – {{ requestClock(shift.end) }}</strong>
            </p>
            <p v-else class="full form-error">No working shift is assigned on this day. Select a working day or contact HR.</p>
            <label>
              <span>Undertime Start (leave at) <b>*</b></span>
              <input v-model="form.leaveAt" type="time" :min="shift?.start || undefined" :max="shift?.end || undefined" required>
            </label>
            <label>
              <span>Undertime End <b>*</b></span>
              <input v-model="form.endTime" type="time" :min="form.leaveAt || shift?.start || undefined" :max="shift?.end || undefined" required>
            </label>
            <p class="full duration"><Clock :size="14" /> Requested duration: <strong>{{ durationText(minutes) }}</strong></p>
            <label class="full"><span>Reason <b>*</b></span><textarea v-model="form.reason" rows="3" maxlength="1000" required placeholder="Explain why you need to leave early..." /></label>
            <EmployeeRequestImageUpload :key="formKey" v-model="image" :required="false" class="full" @busy="imageLoading = $event" />
          </fieldset>

          <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>

          <div class="dialog-actions">
            <button type="button" class="secondary" :disabled="saving" @click="closeForm">Cancel</button>
            <button type="submit" class="primary" :disabled="saving || imageLoading || !shift">
              {{ saving ? 'Saving…' : imageLoading ? 'Preparing Image…' : editing ? 'Update Request' : 'Submit Request' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Details -->
      <div v-if="detail" class="overlay" @click.self="detail = null">
        <section class="dialog" role="dialog" aria-modal="true" aria-labelledby="ut-detail-title">
          <div class="dialog-heading">
            <h2 id="ut-detail-title"><Clock3 :size="18" /> {{ detail.id }}</h2>
            <span class="badge" :class="badgeClass(detail.status)">{{ statusLabel(detail.status) }}</span>
            <button type="button" class="icon-button" aria-label="Close" @click="detail = null"><X :size="18" /></button>
          </div>
          <dl class="details">
            <div><dt>Date</dt><dd>{{ formatDate(detail.start) }}</dd></div>
            <div><dt>Leave At</dt><dd>{{ requestClock(detail.timing.requestedTimeOut) }}</dd></div>
            <div><dt>Scheduled Time Out</dt><dd>{{ requestClock(detail.timing.scheduledTimeOut) }}</dd></div>
            <div><dt>Duration</dt><dd>{{ durationText(detail.timing.requestedMinutes) }}</dd></div>
            <div class="full"><dt>Reason</dt><dd class="reason">{{ detail.reason || 'No reason provided.' }}</dd></div>
            <div v-if="detail.file_url" class="full">
              <dt>Attachment</dt>
              <dd><a :href="detail.file_url" target="_blank" rel="noopener noreferrer" class="attachment"><Paperclip :size="14" /> {{ detail.image?.name || 'View attachment' }}</a></dd>
            </div>
          </dl>
          <DepartmentApprovalProgress :approvals="detail.department_approvals" :department-status="detail.department_approval_status" :status="detail.status" :reviewed-by="detail.reviewed_by" :reviewed-at="detail.reviewed_at" />
          <div class="dialog-actions">
            <button type="button" class="secondary" @click="detail = null">Close</button>
            <template v-if="detail.status.toLowerCase() === 'pending'">
              <button type="button" class="danger" @click="askCancel(detail)">Cancel Request</button>
              <button type="button" class="primary" @click="openEdit(detail)">Edit Request</button>
            </template>
          </div>
        </section>
      </div>
    </Teleport>

    <ConfirmationModal
      :open="!!cancelTarget"
      title="Cancel Undertime Request?"
      :message="cancelTarget ? `Undertime request ${cancelTarget.id} on ${formatDate(cancelTarget.start)} will be cancelled. This cannot be undone.` : ''"
      :confirm-text="cancellingId ? 'Cancelling…' : 'Cancel Request'"
      cancel-text="Keep Request"
      variant="danger"
      :loading="!!cancellingId"
      @confirm="confirmCancel"
      @cancel="!cancellingId && (cancelTarget = null)"
    />
  </section>
</template>

<style scoped>
/* Same frame as the other employee request pages (e.g. Time Log Correction) */
.request-page { max-width: 1660px; margin: 0 auto; color: var(--text-primary); }
.page-header, .table-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.page-header { align-items: flex-start; margin-bottom: 22px; }
h1 { margin: 0 0 7px; font-size: 27px; letter-spacing: -.6px; }
h2 { margin: 0 0 6px; font-size: 15px; }
p { margin: 0; color: var(--text-secondary); font-size: 12px; line-height: 1.6; }
.primary-button { display: inline-flex; align-items: center; justify-content: center; gap: 9px; min-height: 41px; padding: 10px 17px; border: 0; border-radius: 9px; background: linear-gradient(135deg, #1f68f2, #2878ff); color: #fff; font: inherit; font-size: 12px; font-weight: 600; white-space: nowrap; cursor: pointer; }
.error-message { margin-bottom: 15px; padding: 12px 15px; border-radius: 9px; background: var(--red-soft, #fee2e2); color: var(--red, #b91c1c); }
.error-message button { margin-left: 8px; padding: 3px 10px; border: 1px solid currentColor; border-radius: 6px; background: transparent; color: inherit; font: inherit; cursor: pointer; }
.stats-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 13px; margin-bottom: 18px; }
.stat-card { display: flex; flex-direction: column; gap: 7px; min-height: 102px; padding: 18px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); box-shadow: var(--shadow); }
.stat-card span { color: var(--text-secondary); font-size: 11px; }
.stat-card strong { font-size: 27px; line-height: 1.2; }
.stat-card small { color: var(--text-muted); font-size: 10px; }
.table-card { overflow: hidden; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); box-shadow: var(--shadow); }
.table-header { padding: 18px; }
.filters { display: flex; align-items: center; gap: 10px; }
.search-field { display: flex; align-items: center; gap: 8px; min-width: 225px; padding: 0 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); color: var(--text-muted); }
.search-field input { width: 100%; min-width: 0; height: 38px; border: 0; outline: 0; background: transparent; color: var(--text-primary); font: inherit; font-size: 12px; }
.filters select { min-width: 115px; height: 40px; padding: 0 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); color: var(--text-primary); font: inherit; font-size: 12px; }

/* Popups */
.overlay { position: fixed; inset: 0; z-index: 900; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(0, 0, 0, .6); backdrop-filter: blur(2px); }
.dialog { width: min(620px, 100%); max-height: calc(100vh - 40px); overflow-y: auto; padding: 22px; border: 1px solid var(--border); border-radius: 14px; background: var(--bg-card); color: var(--text-primary); box-shadow: 0 24px 60px rgba(0, 0, 0, .35); }
.dialog-heading { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
.dialog-heading h2 { display: flex; flex: 1; align-items: center; gap: 8px; margin: 0; }
.dialog-heading h2 svg { color: var(--primary); }
.icon-button { display: grid; width: 34px; height: 34px; place-items: center; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text-secondary); cursor: pointer; }
.fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin: 0; padding: 0; border: 0; }
.fields label { display: flex; min-width: 0; flex-direction: column; gap: 7px; color: var(--text-secondary); font-size: 12px; }
.fields b { color: var(--red, #dc2626); }
.fields input:not([type="checkbox"]), .fields textarea { width: 100%; min-height: 42px; box-sizing: border-box; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; outline: 0; background: var(--bg-card-soft); color: var(--text-primary); font: inherit; font-size: 13px; }
.fields textarea { min-height: 90px; resize: vertical; }
.fields input:focus, .fields textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 2px var(--primary-soft); }
.fields .checkbox { flex-direction: row; align-items: center; gap: 8px; color: var(--text-primary); }
.full { grid-column: 1 / -1; }
.duration { display: flex; align-items: center; gap: 6px; padding: 10px 12px; border-radius: 8px; background: var(--primary-soft); color: var(--text-secondary); }
.duration strong { color: var(--primary); }
.shift-note { padding: 10px 12px; border-radius: 8px; background: var(--bg-card-soft); }
.shift-note strong { color: var(--text-primary); }
.form-error { margin-top: 14px; color: var(--red, #dc2626); }
.details { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin: 0; }
.details dt { color: var(--text-secondary); font-size: 11px; }
.details dd { margin: 5px 0 0; font-size: 13px; font-weight: 600; }
.details .reason { font-weight: 400; line-height: 1.6; white-space: pre-line; }
.attachment { display: inline-flex; align-items: center; gap: 6px; color: var(--primary); }
.dialog-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 10px; margin-top: 20px; }
.dialog-actions button { display: inline-flex; min-height: 40px; align-items: center; justify-content: center; padding: 10px 17px; border-radius: 8px; font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
.dialog-actions button:disabled { opacity: .55; cursor: not-allowed; }
.secondary { border: 1px solid var(--border); background: transparent; color: var(--text-primary); }
.danger { border: 1px solid var(--red); background: transparent; color: var(--red); }
.primary { border: 0; background: linear-gradient(135deg, #1f68f2, #2878ff); color: #fff; }
.badge { display: inline-block; padding: 5px 9px; border-radius: 6px; font-size: 11px; font-weight: 600; white-space: nowrap; }
.green { background: var(--green-soft); color: var(--green); }
.orange { background: var(--orange-soft); color: var(--orange); }
.neutral { background: var(--bg-card-soft); color: var(--text-secondary); }

@media (max-width: 850px) { .page-header, .table-header { flex-wrap: wrap; } .filters { width: 100%; } .search-field { flex: 1; } }
@media (max-width: 640px) {
  h1 { font-size: 22px; line-height: 1.3; }
  .page-header { gap: 14px; }
  .page-header .primary-button { width: 100%; }
  .stats-grid { gap: 8px; }
  .stat-card { min-width: 0; min-height: 90px; padding: 10px; }
  .stat-card strong { font-size: 22px; }
  .table-header { gap: 14px; padding: 14px; }
  .filters { flex-wrap: wrap; }
  .search-field, .filters select { width: 100%; min-width: 100%; }
  .overlay { padding: 10px; }
  .dialog { padding: 16px; }
  .fields, .details { grid-template-columns: 1fr; }
  .dialog-actions > * { flex: 1; }
}
</style>
