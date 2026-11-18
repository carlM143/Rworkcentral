<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowLeft, Ban, FileText, Pencil, Send, Trash2, Upload, Users, X } from 'lucide-vue-next'
import AppConfirmModal from '~/components/shared/AppConfirmModal.vue'
import WageOrderForm from '~/components/admin/compensation/WageOrderForm.vue'
import {
  WAGE_STATUS_LABELS,
  peso,
  useWageOrders,
  wageApiError,
  wageDate,
  type WageMeta,
  type WageOrderDetail,
  type WageOrderPayload,
} from '~/composables/admin/compensation/useWageOrders'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const router = useRouter()
const api = useWageOrders()
const { success, error: toastError } = useToast()

const LIST = '/admin/settings/compensation/wage-orders'
const id = Number(route.params.id)

const order = ref<WageOrderDetail | null>(null)
const meta = ref<WageMeta | null>(null)
const loading = ref(true)
const loadError = ref('')

const load = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const [o, m] = await Promise.all([api.show(id), meta.value ? Promise.resolve({ data: meta.value }) : api.meta()])
    order.value = o.data
    meta.value = m.data
  } catch (err) {
    loadError.value = wageApiError(err, 'Unable to load this wage order.').message
  } finally {
    loading.value = false
  }
}

onMounted(load)

// =====================================================
// EDIT
// =====================================================

const editing = ref(false)
const saving = ref(false)
const errors = ref<Record<string, string[]>>({})

const save = async (payload: WageOrderPayload) => {
  saving.value = true
  errors.value = {}
  try {
    const response = await api.update(id, payload)
    order.value = response.data
    editing.value = false
    success('Wage order updated', response.message)
  } catch (err) {
    const e = wageApiError(err, 'Unable to save the wage order.')
    errors.value = e.errors
    toastError('Unable to save', e.message)
  } finally {
    saving.value = false
  }
}

// =====================================================
// ACTIONS
// =====================================================

type Action = 'publish' | 'cancel' | 'delete'
const confirm = ref<Action | null>(null)
const acting = ref(false)
const actionError = ref('')

const ACTIONS: Record<Action, { title: string, message: string, label: string, danger: boolean }> = {
  publish: {
    title: 'Publish this wage order?',
    message: 'The new minimum applies from the effective date and appears in Regional Rates. After publishing, apply it to employees.',
    label: 'Publish',
    danger: false,
  },
  cancel: {
    title: 'Cancel this wage order?',
    message: 'Its rates will no longer apply and the previous minimum is used again. Salary adjustments already created from it are not changed.',
    label: 'Cancel wage order',
    danger: true,
  },
  delete: {
    title: 'Delete this draft?',
    message: 'The draft and its rates are removed permanently.',
    label: 'Delete',
    danger: true,
  },
}

const run = async () => {
  const action = confirm.value
  if (!action) return
  acting.value = true
  actionError.value = ''
  try {
    if (action === 'delete') {
      await api.destroy(id)
      confirm.value = null
      success('Draft deleted', 'The wage order was removed.')
      await router.push(LIST)
      return
    }
    const response = action === 'publish' ? await api.publish(id) : await api.cancel(id)
    order.value = response.data
    confirm.value = null
    success('Wage order updated', response.message)
  } catch (err) {
    actionError.value = wageApiError(err, 'Unable to update the wage order.').message
  } finally {
    acting.value = false
  }
}

// =====================================================
// DOCUMENT
// =====================================================

const uploading = ref(false)

const onFile = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (file.size > 10 * 1024 * 1024) {
    toastError('File too large', 'Upload a PDF or image up to 10 MB.')
    return
  }
  uploading.value = true
  try {
    order.value = (await api.uploadDocument(id, file)).data
    success('Document uploaded', file.name)
  } catch (err) {
    toastError('Unable to upload', wageApiError(err, 'Please try again.').message)
  } finally {
    uploading.value = false
  }
}

const removeDocument = async () => {
  if (!window.confirm('Remove the attached document?')) return
  try {
    order.value = (await api.deleteDocument(id)).data
  } catch (err) {
    toastError('Unable to remove', wageApiError(err, 'Please try again.').message)
  }
}
</script>

<template>
  <section class="wage-page">
    <button type="button" class="back-link" @click="router.push(LIST)">
      <ArrowLeft :size="14" /> Back to Wage Orders
    </button>

    <div v-if="loading" class="state">Loading wage order...</div>
    <div v-else-if="loadError || !order" class="state">
      <strong>Unable to load this wage order</strong>
      <span>{{ loadError }}</span>
      <AppButton variant="secondary" @click="router.push(LIST)">Back to Wage Orders</AppButton>
    </div>

    <template v-else>
      <PageHeader :title="order.order_no" :description="order.title">
        <template v-if="!editing">
          <AppButton v-if="order.status !== 'cancelled'" variant="secondary" :icon="Pencil" @click="editing = true">Edit</AppButton>
          <AppButton v-if="order.status === 'draft'" variant="secondary" :icon="Trash2" @click="confirm = 'delete'">Delete</AppButton>
          <AppButton v-if="order.status === 'published'" variant="secondary" :icon="Ban" @click="confirm = 'cancel'">Cancel Order</AppButton>
          <AppButton v-if="order.status === 'draft'" :icon="Send" @click="confirm = 'publish'">Publish</AppButton>
          <AppButton v-if="order.status === 'published'" :icon="Users" @click="router.push(`${LIST}/${id}/apply`)">Apply to Employees</AppButton>
        </template>
      </PageHeader>

      <WageOrderForm
        v-if="editing && meta"
        :meta="meta"
        :initial="order"
        :saving="saving"
        :errors="errors"
        submit-label="Save Changes"
        @save="save"
        @cancel="editing = false"
      />

      <template v-else>
        <!-- SUMMARY -->
        <section class="summary">
          <div>
            <span class="eyebrow">{{ order.region_name }}</span>
            <h2>{{ order.order_no }}</h2>
            <p>{{ order.title }}</p>
          </div>
          <span class="status" :class="order.display_status">{{ WAGE_STATUS_LABELS[order.display_status] }}</span>
        </section>

        <p v-if="order.status === 'draft'" class="notice">
          This wage order is a <strong>draft</strong>. Publish it to use its rates and to apply it to employees.
        </p>
        <p v-else-if="order.status === 'published'" class="notice info">
          <template v-if="order.adjustments_created">
            Applied to <strong>{{ order.adjustments_created }}</strong> employee{{ order.adjustments_created === 1 ? '' : 's' }} so far.
          </template>
          <template v-else>Not applied to any employee yet.</template>
          <button type="button" class="inline-link" @click="router.push(`${LIST}/${id}/apply`)">Apply to employees →</button>
        </p>

        <div class="grid">
          <div class="column">
            <section class="panel">
              <header class="panel-header">
                <h3>New Minimum Rates</h3>
                <p>Effective {{ wageDate(order.effective_date) }}, in full.</p>
              </header>
              <div class="table-wrap">
                <table class="table">
                  <thead>
                    <tr>
                      <th scope="col">Classification</th>
                      <th scope="col">Previous</th>
                      <th scope="col">New daily minimum</th>
                      <th scope="col">Increase</th>
                      <th scope="col"><span class="sr-only">State</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="r in order.rates" :key="r.id">
                      <td>{{ r.classification_name }}</td>
                      <td>{{ peso(r.previous_rate) }}</td>
                      <td><strong>{{ peso(r.daily_rate) }}</strong></td>
                      <td class="good">{{ r.increase !== null && r.increase !== undefined ? `+${peso(r.increase)}` : '—' }}</td>
                      <td>
                        <span v-if="r.in_force" class="tag in-force">In force</span>
                        <span v-else-if="order.display_status === 'scheduled'" class="tag upcoming">Upcoming</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <aside class="column">
            <section class="panel">
              <header class="panel-header"><h3>Details</h3></header>
              <dl class="details">
                <div><dt>Region</dt><dd>{{ order.region_name }}</dd></div>
                <div><dt>Effective</dt><dd>{{ wageDate(order.effective_date) }}</dd></div>
                <div><dt>Applied to</dt><dd>{{ order.adjustments_created }} employee{{ order.adjustments_created === 1 ? '' : 's' }}</dd></div>
                <div><dt>Recorded by</dt><dd>{{ order.created_by || '—' }}</dd></div>
                <div v-if="order.remarks" class="stacked"><dt>Remarks</dt><dd>{{ order.remarks }}</dd></div>
              </dl>
            </section>

            <section class="panel">
              <header class="panel-header">
                <h3>Official Document</h3>
                <p>A copy of the wage order (PDF or image).</p>
              </header>
              <div class="doc">
                <a v-if="order.document_url" :href="order.document_url" target="_blank" rel="noopener" class="doc-link">
                  <FileText :size="16" /> {{ order.document_name || 'View document' }}
                </a>
                <p v-else class="muted">No document attached.</p>
                <div class="doc-actions">
                  <label class="upload" :class="{ busy: uploading }">
                    <Upload :size="14" /> {{ uploading ? 'Uploading...' : order.document_url ? 'Replace' : 'Upload' }}
                    <input type="file" accept="application/pdf,image/jpeg,image/png" class="sr-only" :disabled="uploading" @change="onFile">
                  </label>
                  <button v-if="order.document_url" type="button" class="remove" @click="removeDocument"><X :size="14" /> Remove</button>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </template>
    </template>

    <AppConfirmModal
      v-if="confirm"
      :title="ACTIONS[confirm].title"
      :message="ACTIONS[confirm].message"
      :confirm-label="ACTIONS[confirm].label"
      :danger="ACTIONS[confirm].danger"
      :busy="acting"
      :error="actionError"
      @close="confirm = null"
      @confirm="run"
    />
  </section>
</template>

<style scoped>
.wage-page { width: 100%; max-width: 1400px; margin: 0 auto; display: grid; gap: 14px; }
.back-link { display: inline-flex; width: fit-content; align-items: center; gap: 6px; padding: 0; border: 0; background: transparent; color: var(--primary); font-family: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
.back-link:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }

.state { display: flex; min-height: 220px; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); color: var(--text-muted); font-size: 13px; }
.state strong { color: var(--text-primary); font-size: 15px; }

.summary { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 20px; border: 1px solid var(--border); border-radius: 12px; background: linear-gradient(180deg, rgba(59, 130, 246, 0.1), var(--bg-card)); }
.eyebrow { color: var(--text-secondary); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; }
.summary h2 { margin: 4px 0; font-size: 22px; }
.summary p { margin: 0; color: var(--text-secondary); font-size: 13px; }

.notice { margin: 0; padding: 10px 12px; border-radius: 9px; background: var(--orange-soft); color: var(--orange); font-size: 12px; }
.notice.info { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; background: var(--primary-soft); color: var(--text-secondary); }
.inline-link { margin-left: auto; padding: 0; border: 0; background: transparent; color: var(--primary); font-family: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
.inline-link:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }

.grid { display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(280px, 1fr); gap: 14px; align-items: start; }
.column { display: grid; gap: 14px; }

.panel { overflow: hidden; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
.panel-header { padding: 14px 18px; border-bottom: 1px solid var(--border-soft); }
.panel-header h3 { margin: 0; font-size: 15px; }
.panel-header p { margin: 3px 0 0; color: var(--text-secondary); font-size: 12px; }

.table-wrap { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; font-size: 13px; }
.table th { padding: 10px 18px; color: var(--text-secondary); font-size: 11px; font-weight: 700; text-align: left; text-transform: uppercase; letter-spacing: 0.05em; }
.table td { padding: 12px 18px; border-top: 1px solid var(--border-soft); color: var(--text-secondary); white-space: nowrap; }
.table td strong { color: var(--text-primary); }
.good { color: var(--green) !important; }

.tag { padding: 3px 9px; border-radius: 999px; font-size: 11px; font-weight: 700; }
.tag.in-force { background: var(--green-soft); color: var(--green); }
.tag.upcoming { background: var(--purple-soft); color: var(--purple); }

.status { display: inline-block; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; background: var(--bg-card-soft); color: var(--text-secondary); }
.status.active { background: var(--green-soft); color: var(--green); }
.status.scheduled { background: var(--purple-soft); color: var(--purple); }
.status.draft { background: var(--orange-soft); color: var(--orange); }
.status.cancelled { background: var(--red-soft); color: var(--red); }

.details { display: grid; margin: 0; padding: 6px 18px 14px; }
.details div { display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border-soft); font-size: 13px; }
.details div:last-child { border-bottom: 0; }
.details div.stacked { flex-direction: column; gap: 6px; }
.details dt { color: var(--text-secondary); }
.details dd { margin: 0; font-weight: 600; text-align: right; }
.details div.stacked dd { font-weight: 500; text-align: left; line-height: 1.5; }

.doc { display: grid; gap: 12px; padding: 14px 18px 18px; }
.doc-link { display: inline-flex; align-items: center; gap: 8px; color: var(--primary); font-size: 13px; font-weight: 600; word-break: break-all; }
.muted { margin: 0; color: var(--text-muted); font-size: 13px; }
.doc-actions { display: flex; gap: 8px; }

.upload, .remove {
  display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 12px; border: 1px solid var(--border); border-radius: 8px;
  background: transparent; color: var(--text-primary); font-family: inherit; font-size: 12px; font-weight: 600; cursor: pointer;
}

.upload.busy { opacity: 0.6; cursor: wait; }
.upload:focus-within, .remove:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.remove:hover { border-color: var(--red); color: var(--red); }

.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

@media (max-width: 1000px) { .grid { grid-template-columns: 1fr; } }
</style>