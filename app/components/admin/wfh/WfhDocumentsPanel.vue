<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  CalendarDays, Check, ClipboardList, Download, FileText, History, Paperclip,
  RefreshCw, RotateCcw, Upload, X,
} from 'lucide-vue-next'
import PageHeader from '~/components/shared/PageHeader.vue'
import StatCard from '~/components/shared/StatCard.vue'
import BaseDataTable from '~/components/shared-table/BaseDataTable.vue'
import BaseTableFooter from '~/components/shared-table/BaseTableFooter.vue'
import WfhActionMenu from '~/components/admin/wfh/WfhActionMenu.vue'
import WfhFilters from '~/components/admin/wfh/WfhFilters.vue'
import WfhStatusPill from '~/components/admin/wfh/WfhStatusPill.vue'
import WfhDocumentModal from '~/components/admin/wfh/WfhDocumentModal.vue'
import {
  useWfhDocumentApi, wfhErrorMessage,
  type WfhDocumentRecord,
} from '~/composables/admin/wfh/useWfhDocumentApi'
import {
  useWfhPagination, wfhDownloadCsv, wfhPeriodText,
  type WfhMenuItem,
} from '~/composables/admin/wfh/useWfhFormat'

type DocMode = 'days' | 'upload' | 'request' | 'history'

const STATUS_LABELS: Record<string, string> = {
  for_review: 'For Review',
  returned: 'Returned',
  incomplete: 'Incomplete',
  completed: 'Completed',
}

const api = useWfhDocumentApi()

// =====================================================
// DATA
// =====================================================

const records = ref<WfhDocumentRecord[]>([])
const loading = ref(false)
const loadError = ref('')
const flash = ref('')

const load = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const response = await api.list()
    records.value = response.data
  } catch (error) {
    loadError.value = wfhErrorMessage(error, 'Unable to load WFH documents. Check that the API is running.')
  } finally {
    loading.value = false
  }
}

onMounted(load)

// =====================================================
// FILTERS + PAGINATION
// =====================================================

const search = ref('')
const department = ref('All')
const status = ref('All')

const departments = computed(() =>
  [...new Set(records.value.map(r => r.employee.department).filter((d): d is string => Boolean(d)))])

const statusOptions = Object.entries(STATUS_LABELS) as [string, string][]

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return records.value.filter(r =>
    [r.request_no, r.employee.name, r.employee.emp_id, r.employee.department, r.reason]
      .join(' ').toLowerCase().includes(q)
    && (status.value === 'All' || r.document_status === status.value)
    && (department.value === 'All' || r.employee.department === department.value))
})

const { page, totalItems, totalPages, showingFrom, showingTo, pageRows } = useWfhPagination(() => filtered.value, 8)

watch([search, department, status], () => {
  page.value = 1
})

const sum = (pick: (r: WfhDocumentRecord) => number) => records.value.reduce((n, r) => n + pick(r), 0)

const stats = computed(() => [
  { label: 'Approved WFH Requests', value: records.value.length, description: 'With daily tracking', icon: FileText, tone: 'blue' as const },
  { label: 'Days for Review', value: sum(r => r.counts.submitted), description: 'Submitted, awaiting HR', icon: CalendarDays, tone: 'orange' as const },
  { label: 'Returned Days', value: sum(r => r.counts.returned), description: 'Waiting for resubmission', icon: RotateCcw, tone: 'red' as const },
  { label: 'Attachments', value: sum(r => r.counts.attachments), description: 'Images and documents', icon: Paperclip, tone: 'purple' as const },
])

// =====================================================
// ROW ACTIONS
// =====================================================

const menuItems: WfhMenuItem[] = [
  { key: 'days', label: 'Review Days', icon: ClipboardList },
  { key: 'upload', label: 'Attach Document', icon: Upload },
  { key: 'request', label: 'View Request', icon: FileText },
  { key: 'history', label: 'View History', icon: History, dividerBefore: true },
]

const modalRecord = ref<WfhDocumentRecord | null>(null)
const modalMode = ref<DocMode>('days')

const open = (record: WfhDocumentRecord, mode: string) => {
  modalMode.value = mode as DocMode
  modalRecord.value = record
}

const onUpdated = (record: WfhDocumentRecord, message?: string) => {
  const index = records.value.findIndex(r => r.id === record.id)
  if (index >= 0) records.value[index] = record
  if (message) flash.value = message
}

const exportCsv = () => {
  wfhDownloadCsv('wfh-document-review.csv', [
    ['Request No.', 'Employee No.', 'Employee', 'Department', 'From', 'To', 'Scheduled Days', 'Accepted', 'For Review', 'Returned', 'Attachments', 'Document Status'],
    ...filtered.value.map(d => [
      d.request_no, d.employee.emp_id, d.employee.name, d.employee.department, d.start_date, d.end_date,
      d.counts.expected, d.counts.accepted, d.counts.submitted, d.counts.returned, d.counts.attachments,
      STATUS_LABELS[d.document_status],
    ]),
  ])
}
</script>

<template>
  <section class="wfh-page">
    <PageHeader
      title="WFH Document Review"
      description="Review the daily proof of work employees submit for approved work-from-home requests."
    >
      <button type="button" class="btn ghost" :disabled="loading" @click="load"><RefreshCw :size="15" /> Refresh</button>
      <button type="button" class="btn ghost" :disabled="!filtered.length" @click="exportCsv"><Download :size="15" /> Export</button>
    </PageHeader>

    <div class="stats-grid">
      <StatCard
        v-for="s in stats"
        :key="s.label"
        :label="s.label"
        :value="s.value"
        :description="s.description"
        :icon="s.icon"
        :tone="s.tone"
      />
    </div>

    <p v-if="flash" class="flash" role="status">
      <Check :size="15" /> {{ flash }}
      <button type="button" class="flash-close" aria-label="Dismiss" @click="flash = ''"><X :size="15" /></button>
    </p>

    <WfhFilters
      v-model:search="search"
      v-model:department="department"
      v-model:status="status"
      :departments="departments"
      :status-options="statusOptions"
    />

    <BaseDataTable
      title="Approved WFH Requests"
      description="Open a request to review each scheduled WFH day."
      :has-rows="pageRows.length > 0"
      :loading="loading"
      :empty-title="records.length ? 'No requests match your filters' : 'No approved WFH requests yet'"
      :empty-description="records.length ? 'Try adjusting your filters.' : 'Approve a request in WFH Requests to start daily review.'"
    >
      <template #headers>
        <th>Request / Employee</th>
        <th>Department</th>
        <th>WFH Period</th>
        <th>Days Accepted</th>
        <th>Attachments</th>
        <th>Status</th>
        <th class="text-right">Actions</th>
      </template>

      <template #rows>
        <tr v-for="d in pageRows" :key="d.id">
          <td>
            <span class="request-no">{{ d.request_no }}</span>
            <strong class="person">{{ d.employee.name }}</strong>
            <small class="emp-id">{{ d.employee.emp_id }}</small>
          </td>
          <td>{{ d.employee.department || '—' }}</td>
          <td>{{ wfhPeriodText(d.start_date, d.end_date) }}</td>
          <td>{{ d.counts.accepted }} / {{ d.counts.expected }}</td>
          <td>
            <button type="button" class="text-action" @click="open(d, 'days')">
              <Paperclip :size="13" /> {{ d.counts.attachments }} attachments
            </button>
          </td>
          <td><WfhStatusPill :status="d.document_status" :label="STATUS_LABELS[d.document_status] ?? d.document_status" /></td>
          <td class="text-right">
            <WfhActionMenu
              :items="menuItems"
              :label="`Actions for ${d.request_no}`"
              @select="key => open(d, key)"
            />
          </td>
        </tr>
      </template>

      <template v-if="loadError" #empty>
        <strong>Unable to load WFH documents</strong>
        <span>{{ loadError }}</span>
        <button type="button" class="btn ghost" @click="load">Try again</button>
      </template>
    </BaseDataTable>

    <BaseTableFooter
      v-model="page"
      :showing-from="showingFrom"
      :showing-to="showingTo"
      :total-items="totalItems"
      :total-pages="totalPages"
      item-label="requests"
    />

    <WfhDocumentModal
      v-if="modalRecord"
      :key="`${modalRecord.id}-${modalMode}`"
      :record="modalRecord"
      :initial-mode="modalMode"
      @close="modalRecord = null"
      @updated="onUpdated"
    />
  </section>
</template>

<style scoped src="../../../assets/css/wfh-panel.css"></style>