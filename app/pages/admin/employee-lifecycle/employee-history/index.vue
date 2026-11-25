<script setup lang="ts">
import { ArrowLeft, CalendarDays, Download, History, RotateCcw } from 'lucide-vue-next'
import BaseDataTable from '~/components/shared-table/BaseDataTable.vue'
import type { EmployeeMilestone } from '~/types/lifecycleErd'

definePageMeta({ layout: 'admin' })
interface Employee {
  employeeId: number; employeeNumber: string; employeeName: string; department: string; position: string; employmentType: string; dateHired: string
  lastLifecycleActivityAt?: string | null
}
interface HistoryEvent {
  id: string; category: string; title: string; date: string | null; description: string | null; actor: string | null; status: string
  dateLabel?: string; dueDate?: string | null; attachmentName?: string | null; evaluationDocumentId?: number | null
}
const { $api } = useNuxtApp()
const toast = useToast()
const route = useRoute()
const employees = ref<Employee[]>([])
const directoryLoaded = ref(false)
const loading = ref(false)
const error = ref('')
const search = ref('')
const department = ref('')
const employmentType = ref('')
const currentPage = ref(1)
const employee = ref<Employee | null>(null)
const events = ref<HistoryEvent[]>([])
const pendingMilestones = ref<EmployeeMilestone[]>([])
const downloadingProof = ref<number | null>(null)
const historyLoading = ref(false)
const historyError = ref('')
const selectedId = computed(() => typeof route.query.employee === 'string' ? route.query.employee : '')
const departments = computed(() => [...new Set(employees.value.map(e => e.department))].sort())
const employmentTypes = computed(() => [...new Set(employees.value.map(e => e.employmentType))].sort())
const employeeNumberLabel = (number: string) => /^EMP-/i.test(number) ? number : `EMP-${number}`
const filtered = computed(() => employees.value.filter(e => (!department.value || e.department === department.value) &&
  (!employmentType.value || e.employmentType === employmentType.value) &&
  [e.employeeName, e.employeeNumber, employeeNumberLabel(e.employeeNumber), e.department, e.position, e.employmentType]
    .join(' ').toLowerCase().includes(search.value.trim().toLowerCase())))
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / 10)))
const page = computed(() => filtered.value.slice((currentPage.value - 1) * 10, currentPage.value * 10))
watch([search, department, employmentType], () => { currentPage.value = 1 })
watch(totalPages, total => { currentPage.value = Math.min(currentPage.value, total) })
const load = async () => {
  loading.value = true; error.value = ''
  try {
    employees.value = (await $api<{ data: Employee[] }>('/admin/lifecycle/employees', { query: { lifecycle_activity: 1 } })).data
    directoryLoaded.value = true
  }
  catch (err: any) { error.value = err?.data?.message || 'Unable to load employees.' }
  finally { loading.value = false }
}
let requestId = 0
const loadHistory = async () => {
  const request = ++requestId
  employee.value = null; events.value = []; pendingMilestones.value = []; historyError.value = ''
  if (!selectedId.value) { historyLoading.value = false; return }
  historyLoading.value = true
  try {
    const response = await $api<{ data: { employee: Employee; events: HistoryEvent[]; pendingMilestones?: EmployeeMilestone[] } }>(`/admin/lifecycle/employees/${encodeURIComponent(selectedId.value)}/history`)
    if (request === requestId) {
      employee.value = response.data.employee
      events.value = response.data.events
      pendingMilestones.value = response.data.pendingMilestones ?? []
    }
  } catch (err: any) { if (request === requestId) historyError.value = err?.status === 404 ? 'Employee not found.' : err?.data?.message || 'Unable to load employee history.' }
  finally { if (request === requestId) historyLoading.value = false }
}
const loadView = () => {
  void loadHistory()
  if (!selectedId.value && !directoryLoaded.value && !loading.value) void load()
}
watch(selectedId, loadView)
onMounted(loadView)
const dateLabel = (date: string | null) => {
  if (!date) return 'Date unavailable'
  const value = new Date(date.length === 10 ? `${date}T00:00:00` : date.replace(' ', 'T'))
  return Number.isNaN(value.getTime()) ? date : value.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const targetLabel = (milestone: EmployeeMilestone) => milestone.reviewWindowStart && milestone.reviewWindowEnd
  ? `${dateLabel(milestone.reviewWindowStart)} – ${dateLabel(milestone.reviewWindowEnd)}`
  : dateLabel(milestone.dueDate)

const downloadProof = async (event: HistoryEvent) => {
  if (!employee.value || !event.evaluationDocumentId || downloadingProof.value !== null) return
  downloadingProof.value = event.evaluationDocumentId
  try {
    const blob = await $api<Blob>(`/admin/employees/${employee.value.employeeId}/lifecycle-evaluations/${event.evaluationDocumentId}`, { responseType: 'blob' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = event.attachmentName || 'evaluation'
    link.click()
    URL.revokeObjectURL(url)
  } catch {
    toast.error('Unable to download proof', 'Please try again.')
  } finally {
    downloadingProof.value = null
  }
}
</script>

<template>
  <section class="employee-history-page">
    <PageHeader
      title="Employee Lifecycle History"
      :description="selectedId ? 'Review this employee’s pending milestones and recorded lifecycle events.' : 'Find an employee to view their milestones, employment changes, and offboarding records.'"
    />
    <template v-if="!selectedId">
      <p v-if="error" role="alert">{{ error }} <AppButton variant="secondary" @click="load">Retry</AppButton></p>
      <BaseDataTable v-else title="Employees" description="Most recent recorded lifecycle changes first." :has-rows="page.length > 0" :loading="loading" compact min-width="680px" empty-title="No employees found">
        <template #heading-actions><span class="record-count">{{ filtered.length }} {{ filtered.length === 1 ? 'employee' : 'employees' }}</span></template>
        <template #toolbar>
          <div class="filters">
            <AppInput v-model="search" searchable clearable aria-label="Search employees" placeholder="Search employee, ID, or position…" />
            <AppSelect v-model="department" :options="departments" aria-label="Filter by department" placeholder="All departments" />
            <AppSelect v-model="employmentType" :options="employmentTypes" aria-label="Filter by employment type" placeholder="All employment types" />
            <AppButton variant="secondary" :icon="RotateCcw" @click="search = ''; department = ''; employmentType = ''">Reset</AppButton>
          </div>
        </template>
        <template #headers>
          <th>Employee</th><th>Department / Position</th><th>Employment Type</th><th>Hire Date</th><th class="align-right">History</th>
        </template>
        <template #rows>
          <tr v-for="person in page" :key="person.employeeId">
            <td>
              <NuxtLink :to="{ query: { employee: person.employeeId } }" class="employee-link">{{ person.employeeName }}</NuxtLink>
              <small class="cell-meta">{{ employeeNumberLabel(person.employeeNumber) }}</small>
            </td>
            <td>{{ person.department }}<small class="cell-meta">{{ person.position }}</small></td>
            <td><span class="badge" :class="{ 'badge-pending': person.employmentType === 'Probationary' }">{{ person.employmentType }}</span></td>
            <td>{{ dateLabel(person.dateHired) }}</td>
            <td class="align-right">
              <NuxtLink :to="{ query: { employee: person.employeeId } }" class="view-link" :aria-label="`View history for ${person.employeeName}`">
                <History :size="15" aria-hidden="true" /> View History
              </NuxtLink>
            </td>
          </tr>
        </template>
      </BaseDataTable>

      <!-- PAGINATION (below the table, like other modules) -->
      <div v-if="!error" class="lc-table-footer">
        <p>
          Showing
          <strong>{{ filtered.length ? (currentPage - 1) * 10 + 1 : 0 }}–{{ Math.min(currentPage * 10, filtered.length) }}</strong>
          of
          <strong>{{ filtered.length }}</strong>
          employees
        </p>
        <AppPagination v-model="currentPage" :total-pages="totalPages" />
      </div>
    </template>
    <template v-else>
      <NuxtLink :to="{ query: {} }" class="back-link"><ArrowLeft :size="16" aria-hidden="true" /> Back to Employees</NuxtLink>
      <div v-if="historyLoading" class="lc-loading" role="status" aria-live="polite">
        <span class="lc-spinner" aria-hidden="true" />
        <strong>Loading employee history...</strong>
      </div>
      <p v-else-if="historyError" role="alert">{{ historyError }} <AppButton variant="secondary" @click="loadHistory">Retry</AppButton></p>
      <template v-else-if="employee">
        <section class="history-card employee-summary" aria-labelledby="history-employee-name">
          <div class="section-heading">
            <h2 id="history-employee-name">{{ employee.employeeName }}</h2>
            <span class="badge" :class="{ 'badge-pending': employee.employmentType === 'Probationary' }">Current: {{ employee.employmentType }}</span>
          </div>
          <dl class="summary-details">
            <div><dt>Employee ID</dt><dd>{{ employeeNumberLabel(employee.employeeNumber) }}</dd></div>
            <div><dt>Department</dt><dd>{{ employee.department }}</dd></div>
            <div><dt>Position</dt><dd>{{ employee.position }}</dd></div>
            <div><dt>Hire Date</dt><dd>{{ dateLabel(employee.dateHired) }}</dd></div>
          </dl>
        </section>

        <section class="history-card" aria-labelledby="pending-milestones-title">
          <div class="section-heading"><h2 id="pending-milestones-title">Pending Milestones</h2><span class="record-count">{{ pendingMilestones.length }} pending</span></div>
          <p v-if="!pendingMilestones.length" class="muted empty">No pending milestones for this employee.</p>
          <ul v-else class="pending-list">
            <li v-for="milestone in pendingMilestones" :key="milestone.id">
              <div>
                <h3>{{ milestone.stageName }}</h3>
                <p class="muted">{{ milestone.policyName }}</p>
                <p v-if="milestone.remarks" class="description">{{ milestone.remarks }}</p>
              </div>
              <div class="pending-target">
                <span class="muted">{{ milestone.reviewWindowStart && milestone.reviewWindowEnd ? 'Review window' : 'Target date' }}</span>
                <strong>{{ targetLabel(milestone) }}</strong>
              </div>
            </li>
          </ul>
        </section>

        <section class="history-card" aria-labelledby="lifecycle-timeline-title">
          <div class="section-heading"><h2 id="lifecycle-timeline-title">Lifecycle Timeline</h2><span class="record-count">Oldest first</span></div>
          <p v-if="!events.length" class="muted empty">No lifecycle history recorded for this employee yet.</p>
          <ol v-else class="timeline">
            <li v-for="event in events" :key="event.id">
              <article class="event-card">
                <div class="event-meta">
                  <span>{{ event.category }}</span>
                  <time v-if="event.date" :datetime="event.date">
                    <CalendarDays :size="13" aria-hidden="true" />
                    {{ event.dateLabel ? `${event.dateLabel}: ` : '' }}{{ dateLabel(event.date) }}
                  </time>
                </div>
                <div class="event-heading">
                  <h3>{{ event.title }}</h3>
                  <span v-if="event.status && event.category !== 'Employment' && event.category !== 'Employment Type Change'"
                    class="badge" :class="{ 'badge-completed': event.status === 'Completed' }">{{ event.status }}</span>
                </div>
                <p v-if="event.description" class="description">{{ event.description }}</p>
                <div v-if="event.actor || event.dueDate || event.attachmentName" class="event-details">
                  <span v-if="event.actor" class="muted">Recorded by {{ event.actor }}</span>
                  <span v-if="event.dueDate" class="muted">Target date: {{ dateLabel(event.dueDate) }}</span>
                  <button v-if="event.attachmentName && event.evaluationDocumentId" class="proof-link" type="button"
                    :disabled="downloadingProof !== null" :aria-label="`Download proof: ${event.attachmentName}`" @click="downloadProof(event)">
                    <Download :size="14" aria-hidden="true" /> {{ event.attachmentName }}
                  </button>
                  <span v-else-if="event.attachmentName" class="muted">Proof: {{ event.attachmentName }}</span>
                </div>
              </article>
            </li>
          </ol>
        </section>
      </template>
    </template>
  </section>
</template>

<style scoped>
.employee-history-page { max-width: 1680px; margin: 0 auto; }
.filters { display: grid; grid-template-columns: minmax(0, 1fr) minmax(140px, 220px) minmax(140px, 220px) auto; gap: 10px; }
.align-right { text-align: right; }
.lc-table-footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 13px 3px 0; }
.lc-table-footer p { margin: 0; color: var(--text-muted); font-size: 12px; }
.lc-table-footer strong { color: var(--text-primary); font-weight: 650; }
@media (max-width: 650px) { .lc-table-footer { align-items: flex-start; flex-direction: column; } }
.record-count, .muted, .cell-meta, dt { color: var(--text-muted); font-size: 12px; }
.cell-meta { display: block; margin-top: 3px; }
.employee-link { font-weight: 650; color: var(--text-primary); text-decoration: none; }
.view-link, .back-link, .proof-link { display: inline-flex; align-items: center; gap: 6px; color: var(--primary); text-decoration: none; font-size: 12px; }
.employee-link:hover, .view-link:hover, .back-link:hover, .proof-link:hover { text-decoration: underline; }
.back-link { margin-bottom: 14px; }
.proof-link { padding: 0; border: 0; background: none; font-family: inherit; cursor: pointer; overflow-wrap: anywhere; }
.proof-link svg, time svg { flex-shrink: 0; }
.proof-link:disabled { cursor: wait; }
.badge { display: inline-block; border-radius: 999px; background: var(--primary-soft); color: var(--primary); padding: 4px 9px; font-size: 11px; font-weight: 600; }
.badge-pending { background: var(--orange-soft); color: var(--orange); }
.badge-completed { background: var(--green-soft); color: var(--green); }
.history-card { margin-bottom: 14px; padding: 18px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
.section-heading, .event-heading, .event-meta { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 6px 12px; }
h2, h3 { margin: 0; color: var(--text-primary); }
h2 { font-size: 16px; }
h3 { font-size: 13px; }
.summary-details { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin: 14px 0 0; }
dd { margin: 4px 0 0; color: var(--text-primary); font-size: 13px; font-weight: 600; overflow-wrap: anywhere; }
.pending-list, .timeline { list-style: none; padding: 0; margin: 12px 0 0; }
.pending-list li { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px; padding: 12px 0; border-top: 1px solid var(--border-soft); }
.pending-list li:last-child { padding-bottom: 0; }
.pending-target { display: grid; gap: 4px; font-size: 12px; }
.timeline { padding-left: 5px; }
.timeline li { position: relative; padding: 0 0 12px 16px; border-left: 1px solid var(--border); }
.timeline li::before { content: ''; position: absolute; top: 14px; left: -4px; width: 7px; height: 7px; border-radius: 50%; background: var(--primary); }
.timeline li:last-child { border-color: transparent; padding-bottom: 0; }
.event-card { display: grid; gap: 6px; padding: 10px 14px; border: 1px solid var(--border-soft); border-radius: 8px; }
.event-meta { color: var(--text-muted); font-size: 11px; }
time { display: inline-flex; align-items: center; gap: 5px; }
.event-details { display: flex; flex-wrap: wrap; gap: 6px 16px; }
.pending-list p, .description { margin: 4px 0 0; }
.description { white-space: pre-wrap; overflow-wrap: anywhere; font-size: 12px; line-height: 1.6; color: var(--text-secondary); }
.empty { margin: 10px 0 0; }
@media (max-width: 800px) {
  .filters, .summary-details { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 480px) {
  .filters { grid-template-columns: 1fr; }
  .history-card { padding: 14px; }
}

.lc-loading { display: flex; min-height: 220px; flex-direction: column; align-items: center; justify-content: center; gap: 10px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); color: var(--text-secondary); font-size: 13px; }
.lc-spinner { width: 22px; height: 22px; border: 2px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: lc-spin 0.7s linear infinite; }
@keyframes lc-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .lc-spinner { animation: none; } }
</style>
