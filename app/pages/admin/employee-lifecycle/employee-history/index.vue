<script setup lang="ts">
import { ArrowLeft, UserRound, CalendarDays, History } from 'lucide-vue-next'
definePageMeta({ layout: 'admin' })
interface Employee {
  employeeId: number; employeeNumber: string; employeeName: string; department: string; position: string; employmentType: string; dateHired: string
}
interface HistoryEvent {
  id: string; category: string; title: string; date: string | null; description: string; actor: string | null; status: string; attachmentName?: string | null
}
const { $api } = useNuxtApp()
const route = useRoute()
const employees = ref<Employee[]>([])
const loading = ref(false)
const error = ref('')
const search = ref('')
const department = ref('')
const currentPage = ref(1)
const employee = ref<Employee | null>(null)
const events = ref<HistoryEvent[]>([])
const historyLoading = ref(false)
const historyError = ref('')
const selectedId = computed(() => typeof route.query.employee === 'string' ? route.query.employee : '')
const departments = computed(() => [...new Set(employees.value.map(e => e.department))].sort())
const filtered = computed(() => employees.value.filter(e => (!department.value || e.department === department.value) &&
  [e.employeeName, e.employeeNumber, e.department, e.employmentType].join(' ').toLowerCase().includes(search.value.trim().toLowerCase())))
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / 10)))
const page = computed(() => filtered.value.slice((currentPage.value - 1) * 10, currentPage.value * 10))
watch([search, department], () => { currentPage.value = 1 })
watch(totalPages, total => { currentPage.value = Math.min(currentPage.value, total) })
const load = async () => {
  loading.value = true; error.value = ''
  try { employees.value = (await $api<{ data: Employee[] }>('/admin/lifecycle/employees')).data }
  catch (err: any) { error.value = err?.data?.message || 'Unable to load employees.' }
  finally { loading.value = false }
}
let requestId = 0
const loadHistory = async () => {
  const request = ++requestId
  employee.value = null; events.value = []; historyError.value = ''
  if (!selectedId.value) { historyLoading.value = false; return }
  historyLoading.value = true
  try {
    const response = await $api<{ data: { employee: Employee; events: HistoryEvent[] } }>(`/admin/lifecycle/employees/${encodeURIComponent(selectedId.value)}/history`)
    if (request === requestId) { employee.value = response.data.employee; events.value = response.data.events }
  } catch (err: any) { if (request === requestId) historyError.value = err?.status === 404 ? 'Employee not found.' : err?.data?.message || 'Unable to load employee history.' }
  finally { if (request === requestId) historyLoading.value = false }
}
watch(selectedId, loadHistory)
onMounted(() => { load(); loadHistory() })
const dateLabel = (date: string | null) => {
  if (!date) return 'Date unavailable'
  const value = new Date(date.length === 10 ? `${date}T00:00:00` : date.replace(' ', 'T'))
  return Number.isNaN(value.getTime()) ? date : value.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <section class="employee-history-page">
    <PageHeader title="Employee Lifecycle History" description="Select an employee to view employment progression, milestone evaluations and offboarding history." />
    <template v-if="!selectedId">
      <div class="filters"><AppInput v-model="search" searchable clearable placeholder="Search employee, ID or employment type…" /><AppSelect v-model="department" :options="departments" placeholder="All departments" /><AppButton variant="secondary" @click="search = ''; department = ''">Reset</AppButton></div>
      <p v-if="loading" role="status">Loading employees…</p>
      <p v-else-if="error" role="alert">{{ error }} <AppButton variant="secondary" @click="load">Retry</AppButton></p>
      <div v-else class="table-card">
        <div class="table-heading"><h2>Employees</h2><span>{{ filtered.length }} employees</span></div>
        <div class="table-scroll"><table><thead><tr><th>Employee</th><th>Department / Position</th><th>Current Employment Type</th><th>Date Hired</th><th>History</th></tr></thead><tbody>
          <tr v-for="e in page" :key="e.employeeId">
            <td><NuxtLink :to="{ query: { employee: e.employeeId } }" class="employee-link">{{ e.employeeName }}</NuxtLink><small>{{ e.employeeNumber }}</small></td>
            <td>{{ e.department }}<small>{{ e.position }}</small></td><td><span class="type-badge">{{ e.employmentType }}</span></td><td>{{ dateLabel(e.dateHired) }}</td>
            <td><NuxtLink :to="{ query: { employee: e.employeeId } }" class="view-link"><History :size="15" /> View History</NuxtLink></td>
          </tr>
          <tr v-if="!page.length"><td colspan="5" class="empty">No employees found.</td></tr>
        </tbody></table></div>
        <footer><span>{{ filtered.length }} employees</span><AppPagination v-model="currentPage" :total-pages="totalPages" /></footer>
      </div>
    </template>
    <template v-else>
      <NuxtLink :to="{ query: {} }" class="back-link"><ArrowLeft :size="16" /> Back to Employees</NuxtLink>
      <p v-if="historyLoading" role="status">Loading employee history…</p>
      <p v-else-if="historyError" role="alert">{{ historyError }} <AppButton variant="secondary" @click="loadHistory">Retry</AppButton></p>
      <template v-else-if="employee">
        <div class="employee-summary"><div class="avatar"><UserRound :size="26" /></div><div><h2>{{ employee.employeeName }}</h2><p>{{ employee.employeeNumber }} · {{ employee.department }} · {{ employee.position }}</p><span class="type-badge">Current: {{ employee.employmentType }}</span></div></div>
        <section class="timeline-card" aria-label="Employee lifecycle timeline">
          <h2>Lifecycle Timeline</h2><p class="muted">Oldest to newest · Based on recorded employment changes and saved lifecycle records.</p>
          <p v-if="!events.length" class="empty">No lifecycle history recorded for this employee yet.</p>
          <ol v-else class="timeline"><li v-for="event in events" :key="event.id"><span class="timeline-dot" /><article>
            <div class="event-meta"><span>{{ event.category }}</span><time :datetime="event.date || undefined"><CalendarDays :size="13" />{{ dateLabel(event.date) }}</time></div>
            <h3>{{ event.title }}</h3><p class="description">{{ event.description }}</p>
            <p v-if="event.attachmentName" class="muted">Attachment: {{ event.attachmentName }}</p>
            <small v-if="event.actor">Recorded by {{ event.actor }}</small><span class="event-status">{{ event.status }}</span>
          </article></li></ol>
        </section>
      </template>
    </template>
  </section>
</template>

<style scoped>
.employee-history-page { max-width: 1680px; margin: 0 auto; }.filters { display: grid; grid-template-columns: 1fr 240px auto; gap: 10px; margin-bottom: 18px; }
.table-card, .employee-summary, .timeline-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; box-shadow: var(--shadow); }
.table-heading, footer { display: flex; align-items: center; justify-content: space-between; padding: 16px; gap: 12px; font-size: 12px; color: var(--text-muted); } h2 { font-size: 17px; margin: 0; color: var(--text-primary); }
.table-scroll { overflow-x: auto; } table { width: 100%; border-collapse: collapse; text-align: left; font-size: 12px; } th, td { padding: 16px; border-bottom: 1px solid var(--border); } th { color: var(--text-muted); font-size: 11px; } td { color: var(--text-primary); }
small { display: block; margin-top: 5px; color: var(--text-muted); font-size: 11px; }.employee-link { font-weight: 650; color: var(--primary); text-decoration: none; }.employee-link:hover { text-decoration: underline; }.view-link, .back-link { display: inline-flex; align-items: center; gap: 6px; color: var(--primary); text-decoration: none; font-size: 12px; }.back-link { margin-bottom: 18px; }
.type-badge, .event-status { display: inline-block; border-radius: 6px; background: var(--bg-card-soft); color: var(--primary); padding: 5px 9px; font-size: 11px; }.employee-summary { display: flex; align-items: center; gap: 16px; padding: 24px; margin-bottom: 20px; }.employee-summary p { color: var(--text-muted); font-size: 12px; }.avatar { padding: 16px; border-radius: 50%; color: var(--primary); background: var(--bg-card-soft); }
.timeline-card { padding: 24px; }.muted { color: var(--text-muted); font-size: 12px; }.timeline { list-style: none; padding: 0 0 0 14px; margin: 28px 0 0; }.timeline li { position: relative; border-left: 2px solid var(--border); padding: 0 0 24px 28px; }.timeline li:last-child { border-color: transparent; padding-bottom: 0; }.timeline-dot { position: absolute; left: -7px; top: 6px; width: 12px; height: 12px; border-radius: 50%; background: var(--primary); }
article { border: 1px solid var(--border); border-radius: 10px; padding: 18px; }.event-meta { display: flex; justify-content: space-between; gap: 12px; color: var(--text-muted); font-size: 11px; }time { display: inline-flex; align-items: center; gap: 5px; }h3 { font-size: 15px; margin: 12px 0; color: var(--text-primary); }.description { white-space: pre-wrap; overflow-wrap: anywhere; font-size: 12px; line-height: 1.7; color: var(--text-primary); }.event-status { margin-top: 12px; }.empty { padding: 30px; text-align: center; color: var(--text-muted); font-size: 13px; }
@media (max-width: 650px) { .filters { grid-template-columns: 1fr; }.timeline-card, .employee-summary { padding: 16px; }.event-meta { flex-direction: column; }.timeline li { padding-left: 18px; }.employee-summary { align-items: flex-start; } }
</style>
