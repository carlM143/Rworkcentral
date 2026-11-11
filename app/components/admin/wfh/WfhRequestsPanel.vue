<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  CalendarDays, Check, ClipboardList, Download, Eye, FileText, History, Plus,
  RefreshCw, ShieldCheck, Ban, X,
} from 'lucide-vue-next'
import PageHeader from '~/components/shared/PageHeader.vue'
import StatCard from '~/components/shared/StatCard.vue'
import BaseDataTable from '~/components/shared-table/BaseDataTable.vue'
import BaseTableFooter from '~/components/shared-table/BaseTableFooter.vue'
import WfhActionMenu from '~/components/admin/wfh/WfhActionMenu.vue'
import WfhFilters from '~/components/admin/wfh/WfhFilters.vue'
import WfhStatusPill from '~/components/admin/wfh/WfhStatusPill.vue'
import WfhRequestFormModal from '~/components/admin/wfh/WfhRequestFormModal.vue'
import WfhRequestDetailModal from '~/components/admin/wfh/WfhRequestDetailModal.vue'
import WfhDeleteConfirmModal from '~/components/admin/wfh/WfhDeleteConfirmModal.vue'
import { useWfhDocumentApi, wfhErrorMessage } from '~/composables/admin/wfh/useWfhDocumentApi'
import {
  useWfhRequestApi,
  type WfhEmployeeOption, type WfhRequestRecord,
} from '~/composables/admin/wfh/useWfhRequestApi'
import {
  useWfhPagination, wfhDateText, wfhDownloadCsv, wfhPeriodText,
  type WfhMenuItem,
} from '~/composables/admin/wfh/useWfhFormat'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
}

const api = useWfhRequestApi()
const documentApi = useWfhDocumentApi()

// =====================================================
// DATA
// =====================================================

const records = ref<WfhRequestRecord[]>([])
const employees = ref<WfhEmployeeOption[]>([])
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
    loadError.value = wfhErrorMessage(error, 'Unable to load WFH requests.')
  } finally {
    loading.value = false
  }
}

const loadEmployees = async () => {
  try {
    const response = await api.employees()
    employees.value = response.data
  } catch {
    employees.value = []
  }
}

onMounted(() => {
  load()
  loadEmployees()
})

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
    && (status.value === 'All' || r.status === status.value)
    && (department.value === 'All' || r.employee.department === department.value))
})

const { page, totalItems, totalPages, showingFrom, showingTo, pageRows } = useWfhPagination(() => filtered.value, 8)

watch([search, department, status], () => {
  page.value = 1
})

const count = (value: string) => records.value.filter(r => r.status === value).length

const stats = computed(() => [
  { label: 'Total Requests', value: records.value.length, description: 'All filed requests', icon: FileText, tone: 'blue' as const },
  { label: 'Pending', value: count('pending'), description: 'Awaiting HR decision', icon: CalendarDays, tone: 'orange' as const },
  { label: 'Approved', value: count('approved'), description: 'Moved to document review', icon: ShieldCheck, tone: 'green' as const },
  { label: 'Rejected', value: count('rejected'), description: 'Declined requests', icon: X, tone: 'red' as const },
])

// =====================================================
// ROW ACTIONS
// =====================================================

const menuItems = (record: WfhRequestRecord): WfhMenuItem[] => [
  { key: 'view', label: 'View Request', icon: Eye },
  ...(record.status === 'pending'
    ? [
        { key: 'approve', label: 'Approve', icon: Check },
        { key: 'reject', label: 'Reject', icon: X, danger: true },
      ]
    : []),
  ...(record.status === 'approved'
    ? [{ key: 'documents', label: 'Open Document Review', icon: ClipboardList }]
    : []),
  { key: 'history', label: 'View History', icon: History, dividerBefore: true },
  ...(['pending', 'approved'].includes(record.status) ? [{ key: 'cancel', label: 'Cancel WFH', icon: Ban, danger: true, dividerBefore: true }] : []),
]

const detailRecord = ref<WfhRequestRecord | null>(null)
const detailMode = ref<'view' | 'decide' | 'history'>('view')
const detailAction = ref<'approve' | 'reject'>('approve')
const createOpen = ref(false)
const deleteRecord = ref<WfhRequestRecord | null>(null)
const deleteBusy = ref(false)
const deleteError = ref('')

const onAction = (record: WfhRequestRecord, key: string) => {
  if (key === 'cancel') {
    deleteRecord.value = record
    deleteError.value = ''
    return
  }
  if (key === 'documents') {
    navigateTo('/admin/wfh/documents')
    return
  }
  detailMode.value = key === 'approve' || key === 'reject' ? 'decide' : (key as 'view' | 'history')
  detailAction.value = key === 'reject' ? 'reject' : 'approve'
  detailRecord.value = record
}

const handleDeleteConfirm = async (id: number) => {
  deleteBusy.value = true
  deleteError.value = ''
  try {
    const res = await documentApi.cancel(id)
    await load()
    flash.value = res?.message || 'WFH request cancelled successfully.'
    deleteRecord.value = null
  } catch (error: unknown) {
    deleteError.value = wfhErrorMessage(error, 'Failed to cancel WFH request.')
  } finally {
    deleteBusy.value = false
  }
}

const onSaved = (record: WfhRequestRecord, message: string) => {
  const index = records.value.findIndex(r => r.id === record.id)
  if (index >= 0) records.value[index] = record
  else records.value.unshift(record)
  flash.value = message
  detailRecord.value = null
  createOpen.value = false
}

const exportCsv = () => {
  wfhDownloadCsv('wfh-requests.csv', [
    ['Request No.', 'Employee No.', 'Employee', 'Department', 'From', 'To', 'No. of Days', 'Request Date', 'Supervisor', 'Status', 'Decided By', 'Decided On', 'Remarks'],
    ...filtered.value.map(r => [
      r.request_no, r.employee.emp_id, r.employee.name, r.employee.department, r.start_date, r.end_date,
      r.number_of_days, r.request_date, r.supervisor_name, STATUS_LABELS[r.status], r.approved_by, r.approved_at, r.remarks,
    ]),
  ])
}
</script>

<template>
  <section class="wfh-page">
    <PageHeader
      title="WFH Requests"
      description="File and decide employee work-from-home requests. Approved requests move to WFH Document Review."
    >
      <button type="button" class="btn ghost" :disabled="loading" @click="load"><RefreshCw :size="15" /> Refresh</button>
      <button type="button" class="btn ghost" :disabled="!filtered.length" @click="exportCsv"><Download :size="15" /> Export</button>
      <button type="button" class="btn primary" @click="createOpen = true"><Plus :size="15" /> New WFH Request</button>
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
      title="Filed WFH Requests"
      description="Approve or reject pending requests from the actions menu."
      :has-rows="pageRows.length > 0"
      :loading="loading"
      :empty-title="records.length ? 'No requests match your filters' : 'No WFH requests yet'"
      :empty-description="records.length ? 'Try adjusting your filters.' : 'Use New WFH Request to file one.'"
    >
      <template #headers>
        <th>Request / Employee</th>
        <th>Department</th>
        <th>WFH Period</th>
        <th>No. of Days</th>
        <th>Request Date</th>
        <th>Status</th>
        <th class="text-right">Actions</th>
      </template>

      <template #rows>
        <tr v-for="r in pageRows" :key="r.id">
          <td>
            <span class="request-no">{{ r.request_no }}</span>
            <strong class="person">{{ r.employee.name }}</strong>
            <small class="emp-id">{{ r.employee.emp_id }}</small>
          </td>
          <td>{{ r.employee.department || '—' }}</td>
          <td>{{ wfhPeriodText(r.start_date, r.end_date) }}</td>
          <td>{{ r.number_of_days }} {{ r.number_of_days === 1 ? 'day' : 'days' }}</td>
          <td>{{ wfhDateText(r.request_date) }}</td>
          <td><WfhStatusPill :status="r.status" :label="STATUS_LABELS[r.status] ?? r.status" /></td>
          <td class="text-right">
            <WfhActionMenu
              :items="menuItems(r)"
              :label="`Actions for ${r.request_no}`"
              @select="key => onAction(r, key)"
            />
          </td>
        </tr>
      </template>

      <template v-if="loadError" #empty>
        <strong>Unable to load WFH requests</strong>
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

    <WfhRequestFormModal
      v-if="createOpen"
      :employees="employees"
      @close="createOpen = false"
      @saved="onSaved"
    />

    <WfhRequestDetailModal
      v-if="detailRecord"
      :key="`${detailRecord.id}-${detailMode}-${detailAction}`"
      :record="detailRecord"
      :initial-mode="detailMode"
      :initial-action="detailAction"
      @close="detailRecord = null"
      @saved="onSaved"
      @delete="r => { detailRecord = null; deleteRecord = r; }"
    />

    <WfhDeleteConfirmModal
      v-if="deleteRecord"
      :record="deleteRecord"
      :busy="deleteBusy"
      :error-message="deleteError"
      mode="cancel"
      @close="deleteRecord = null"
      @confirm="handleDeleteConfirm"
    />
  </section>
</template>

<style scoped src="../../../assets/css/wfh-panel.css"></style>
