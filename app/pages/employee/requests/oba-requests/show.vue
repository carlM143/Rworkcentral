<script setup lang="ts">
import { ArrowLeft, Briefcase, X } from 'lucide-vue-next'
import { getObaApiError, useObaRequest } from '~/composables/employee/oba-request/useObaRequest'
import ObaEmployeePicker from '~/components/employee/oba-request/ObaEmployeePicker.vue'
import type { ObaAvailableEmployee, ObaImage, ObaRequestRecord } from '~/types/employee/oba-request/obaRequest'

definePageMeta({ layout: false })
useHead({ title: 'OBA Request Details | Employee Portal — RWorkCentral' })

const route = useRoute()
const router = useRouter()
const api = useObaRequest()

const request = ref<ObaRequestRecord | null>(null)
const loading = ref(true)
const errorMessage = ref('')
const notice = ref('')
const isCancelling = ref(false)

const newEmployees = ref<ObaAvailableEmployee[]>([])
const isSavingEmployees = ref(false)
const removingId = ref<number | null>(null)

const requestId = computed(() => String(route.query.id || ''))
const isFiler = computed(() => Boolean(request.value?.is_filer))
const canCancel = computed(() =>
  isFiler.value && ['pending', 'dept_head_approved'].includes(request.value?.status ?? ''))
const canEditEmployees = computed(() => isFiler.value && request.value?.status === 'pending')
const coveredEmployeeIds = computed(() => (request.value?.oba_employees ?? []).map(e => e.employee_id))

const images = computed(() =>
  (request.value?.images ?? []).filter((img): img is ObaImage & { url: string } => Boolean(img.url)),
)

const statusClass = (value: string) => ({
  approved: 'green',
  pending: 'orange',
  dept_head_approved: 'blue',
  rejected: 'red',
} as Record<string, string>)[value] ?? 'neutral'
const statusLabel = (value: string) => ({
  pending: 'Pending',
  dept_head_approved: 'Dept. Head Approved',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
} as Record<string, string>)[value] ?? value

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })

const durationText = computed(() => {
  if (!request.value) return ''
  const mins = Math.round((new Date(request.value.time_to).getTime() - new Date(request.value.time_from).getTime()) / 60000)
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h ? (m ? `${h} hr ${m} min` : `${h} hr`) : `${m} min`
})

const filerName = computed(() => {
  const f = request.value?.filer
  return f ? `${f.firstname} ${f.lastname}`.trim() : '—'
})

const deptHeadText = computed(() => {
  const r = request.value
  if (!r) return ''
  switch (r.status) {
    case 'pending': return 'Awaiting approval'
    case 'dept_head_approved':
    case 'approved':
      return r.dept_head_acted_at ? `Approved · ${formatDate(r.dept_head_acted_at)}` : 'Approved'
    case 'rejected': return r.approved_by ? 'Approved' : 'Rejected'
    default: return '—'
  }
})

const hrText = computed(() => {
  const r = request.value
  if (!r) return ''
  switch (r.status) {
    case 'pending': return 'Waiting for Department Head'
    case 'dept_head_approved': return 'Awaiting approval'
    case 'approved': return 'Approved'
    case 'rejected': return r.approved_by ? 'Rejected' : '—'
    default: return '—'
  }
})

const load = async () => {
  if (!requestId.value) {
    errorMessage.value = 'No OBA request selected.'
    loading.value = false
    return
  }
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await api.show(requestId.value)
    if (!res.success) throw new Error(res.message || 'Could not load the OBA request.')
    request.value = res.data
  } catch (error: unknown) {
    request.value = null
    errorMessage.value = getObaApiError(error, 'Could not load the OBA request.')
  } finally {
    loading.value = false
  }
}

const cancelRequest = async () => {
  if (!request.value || !canCancel.value) return
  if (!confirm('Are you sure you want to cancel this OBA request?')) return
  isCancelling.value = true
  try {
    const res = await api.cancel(request.value.id)
    if (!res.success) throw new Error(res.message || 'Failed to cancel the request.')
    notice.value = res.message || 'OBA request cancelled successfully.'
    await load()
  } catch (error: unknown) {
    errorMessage.value = getObaApiError(error, 'Failed to cancel the request.')
  } finally {
    isCancelling.value = false
  }
}

const addEmployees = async () => {
  if (!request.value || !newEmployees.value.length || isSavingEmployees.value) return
  isSavingEmployees.value = true
  errorMessage.value = ''
  notice.value = ''
  try {
    const res = await api.addEmployees(request.value.id, newEmployees.value.map(e => e.id))
    if (!res.success) throw new Error(res.message || 'Failed to add employees.')
    request.value = res.data
    newEmployees.value = []
    notice.value = res.message || 'Employees added successfully.'
  } catch (error: unknown) {
    errorMessage.value = getObaApiError(error, 'Failed to add employees.')
  } finally {
    isSavingEmployees.value = false
  }
}

const removeEmployee = async (obaEmployeeId: number) => {
  if (!request.value || removingId.value !== null) return
  removingId.value = obaEmployeeId
  errorMessage.value = ''
  notice.value = ''
  try {
    const res = await api.removeEmployee(request.value.id, obaEmployeeId)
    if (!res.success) throw new Error(res.message || 'Failed to remove the employee.')
    request.value = res.data
    notice.value = res.message || 'Employee removed successfully.'
  } catch (error: unknown) {
    errorMessage.value = getObaApiError(error, 'Failed to remove the employee.')
  } finally {
    removingId.value = null
  }
}

const goBack = () => router.push('/employee/requests/oba-requests')

onMounted(load)
watch(requestId, load)

// Success messages show as a toast, like the other modules.
const { success: toastSuccess } = useToast()
watch(notice, (value) => {
  if (!value) return
  toastSuccess(/cancel/i.test(value) ? 'OBA request cancelled' : 'OBA request updated', value)
  notice.value = ''
}, { immediate: true })
</script>

<template>
  <section class="oba-page">
    <header class="page-header">
      <button type="button" class="back-button" aria-label="Back to OBA requests" @click="goBack"><ArrowLeft :size="20" /></button>
      <div>
        <p class="eyebrow">Official Business Authorization</p>
        <h1>OBA Request Details</h1>
        <p v-if="request" class="page-description">#{{ request.id }}</p>
      </div>
    </header>

    <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>
    <p v-if="loading" class="state">Loading...</p>

    <article v-if="request" class="card">
      <div class="card-heading">
        <div class="title"><span class="section-icon"><Briefcase :size="20" /></span><div><h2>{{ request.destination }}</h2><p>{{ formatDate(request.date_request) }}</p></div></div>
        <span class="badge" :class="statusClass(request.status)">{{ statusLabel(request.status) }}</span>
      </div>

      <dl class="detail-grid">
        <div><dt>Start</dt><dd>{{ formatDateTime(request.time_from) }}</dd></div>
        <div><dt>End</dt><dd>{{ formatDateTime(request.time_to) }}</dd></div>
        <div><dt>Duration</dt><dd>{{ durationText }}</dd></div>
        <div><dt>Destination</dt><dd>{{ request.destination }}</dd></div>
        <div><dt>Filed by</dt><dd>{{ filerName }}</dd></div>
        <div><dt>Department Head</dt><dd>{{ deptHeadText }}</dd></div>
        <div><dt>HR</dt><dd>{{ hrText }}</dd></div>
        <div class="wide"><dt>Particulars / Reason</dt><dd class="reason">{{ request.reason }}</dd></div>
        <div v-if="request.rejection_reason" class="wide"><dt>Rejection reason</dt><dd class="reason">{{ request.rejection_reason }}</dd></div>

        <div v-if="request.oba_employees?.length || canEditEmployees" class="wide">
          <dt>Employees covered</dt>
          <dd class="chips">
            <span v-for="emp in request.oba_employees" :key="emp.id" class="chip">
              {{ emp.employee_name }}
              <button
                v-if="canEditEmployees && (request.oba_employees?.length ?? 0) > 1"
                type="button"
                class="chip-remove"
                :aria-label="`Remove ${emp.employee_name}`"
                :disabled="removingId === emp.id"
                @click="removeEmployee(emp.id)"
              ><X :size="12" /></button>
            </span>
          </dd>

          <div v-if="canEditEmployees" class="add-employees">
            <ObaEmployeePicker v-model="newEmployees" :exclude-ids="coveredEmployeeIds" :disabled="isSavingEmployees" />
            <button
              v-if="newEmployees.length"
              type="button"
              class="add-button"
              :disabled="isSavingEmployees"
              @click="addEmployees"
            >{{ isSavingEmployees ? 'Adding…' : `Add ${newEmployees.length} employee${newEmployees.length > 1 ? 's' : ''}` }}</button>
          </div>
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

      <div class="actions">
        <button v-if="canCancel" type="button" class="danger-button" :disabled="isCancelling" @click="cancelRequest">
          {{ isCancelling ? 'Cancelling…' : 'Cancel Request' }}
        </button>
        <button type="button" class="close-button" @click="goBack">Back</button>
      </div>
    </article>
  </section>
</template>

<style scoped>
.oba-page { width: min(100%, 860px); margin: 0 auto; padding-bottom: 24px; }
.page-header { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 18px; }
.back-button { display: grid; place-items: center; flex: 0 0 42px; width: 42px; height: 42px; padding: 0; border: 1px solid var(--border); border-radius: 11px; background: var(--bg-card); color: var(--text-primary); cursor: pointer; }
.back-button:hover { border-color: var(--primary); color: var(--primary); }
.eyebrow { margin: 0 0 3px; color: var(--primary); font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
h1 { margin: 0; color: var(--text-primary); font-size: clamp(22px, 3vw, 28px); line-height: 1.2; }
h2 { margin: 0; color: var(--text-primary); font-size: 15px; }
h3 { margin: 0 0 10px; color: var(--text-primary); font-size: 12px; }
p { margin: 3px 0 0; color: var(--text-secondary); font-size: 12px; line-height: 1.6; }
.feedback { margin: 0 0 14px; padding: 12px 15px; border-radius: 9px; background: var(--green-soft); color: var(--green); }
.form-error { margin: 0 0 14px; padding: 11px 13px; border: 1px solid #ef444440; border-radius: 9px; background: #ef444414; color: var(--red, #ef4444); font-size: 12px; }
.state, .muted { color: var(--text-muted); }
.card { border: 1px solid var(--border); border-radius: 14px; background: var(--bg-card); box-shadow: var(--shadow); }
.card-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 18px 20px; border-bottom: 1px solid var(--border-soft); border-radius: 14px 14px 0 0; }
.title { display: flex; align-items: center; gap: 12px; min-width: 0; }
.section-icon { display: grid; place-items: center; flex: 0 0 42px; width: 42px; height: 42px; border-radius: 11px; background: var(--primary-soft); color: var(--primary); }
.badge { display: inline-block; padding: 5px 9px; border-radius: 5px; font-size: 10px; font-weight: 600; white-space: nowrap; }
.green { color: var(--green); background: var(--green-soft); }
.orange { color: var(--orange); background: var(--orange-soft); }
.blue { color: var(--primary); background: var(--primary-soft); }
.red { color: var(--red, #ef4444); background: var(--red-soft, #ef444414); }
.neutral { color: var(--text-secondary); background: var(--bg-card-soft); }
.detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; margin: 0; padding: 20px; }
.detail-grid dt { margin-bottom: 7px; color: var(--text-secondary); font-size: 10px; }
.detail-grid dd { margin: 0; color: var(--text-primary); font-size: 12px; overflow-wrap: anywhere; }
.wide { grid-column: 1 / -1; }
.reason { white-space: pre-wrap; line-height: 1.7; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip { display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px; border: 1px solid var(--border); border-radius: 999px; background: var(--bg-card-soft); font-size: 11px; }
.chip-remove { display: grid; place-items: center; width: 18px; height: 18px; margin-right: -4px; padding: 0; border: 0; border-radius: 50%; background: transparent; color: var(--text-muted); cursor: pointer; }
.chip-remove:hover { background: var(--red-soft, #ef444414); color: var(--red, #ef4444); }
.chip-remove:disabled { opacity: .5; cursor: wait; }
.add-employees { display: grid; gap: 10px; margin-top: 12px; }
.add-button { width: fit-content; min-height: 38px; padding: 0 16px; border: 1px solid var(--primary); border-radius: 8px; background: var(--primary); color: #fff; font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
.add-button:disabled { opacity: .6; cursor: wait; }
.images { padding: 0 20px 20px; }
.thumbs { display: flex; flex-wrap: wrap; gap: 10px; }
.thumb { display: block; width: 120px; height: 96px; overflow: hidden; border: 1px solid var(--border); border-radius: 9px; }
.thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.actions { display: flex; justify-content: flex-end; gap: 10px; padding: 14px 20px; border-top: 1px solid var(--border-soft); border-radius: 0 0 14px 14px; }
.actions button { min-height: 40px; padding: 0 16px; border-radius: 8px; font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
.close-button { border: 1px solid var(--border); background: var(--bg-card-soft); color: var(--text-primary); }
.danger-button { border: 1px solid #fca5a5; background: var(--bg-card); color: #dc2626; }
.danger-button:hover { background: #fee2e2; border-color: #dc2626; }
.actions button:disabled { opacity: .6; cursor: default; }
@media (max-width: 520px) {
  .detail-grid { grid-template-columns: 1fr; gap: 16px; }
  .actions { flex-direction: column-reverse; }
  .actions button { width: 100%; min-height: 44px; }
}
</style>