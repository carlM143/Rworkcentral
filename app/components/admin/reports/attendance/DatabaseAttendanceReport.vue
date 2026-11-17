<script setup lang="ts">
import { Download, RefreshCw, Users, Clock3, CalendarDays, X } from 'lucide-vue-next'

type Day = { date: string; status: string; scheduledIn: string | null; scheduledOut: string | null; timeIn: string | null; timeOut: string | null; source: string; correction: string; holiday: string; leaveDays: number; lateMinutes: number; undertimeMinutes: number; workedMinutes: number; overtimeMinutes: number; remarks: string }
type Row = { id: number; employeeNumber: string; employeeName: string; department: string; location: string; position: string; active: boolean; hasLogs: boolean; scheduledDays: number; presentDays: number; absentDays: number; leaveDays: number; lateCount: number; lateMinutes: number; undertimeMinutes: number; workedMinutes: number; overtimeMinutes: number; missingPunchDays: number; days?: Day[] }
type Report = { data: Row[]; totals: Record<string, number>; options: { departments: { id: number; name: string }[]; locations: { id: number; name: string }[] }; period: { start: string; end: string }; generatedAt: string }
const { $api } = useNuxtApp()
const toast = useToast()
const localDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const defaults = () => ({ start: localDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)), end: localDate(new Date()), search: '', department_id: '', location_id: '', employee_status: 'all', condition: '' })
const filters = reactive(defaults())
const applied = ref({ ...filters })
const report = ref<Report | null>(null)
const loading = ref(false)
const error = ref('')
const page = ref(1)
const perPage = ref(15)
const pages = computed(() => Math.max(1, Math.ceil((report.value?.data.length || 0) / perPage.value)))
const rows = computed(() => report.value?.data.slice((page.value - 1) * perPage.value, page.value * perPage.value) || [])
const totals = computed(() => report.value?.totals || {})
const hours = (minutes: number) => (Number(minutes || 0) / 60).toFixed(2)
const query = (value: Record<string, unknown>) => Object.fromEntries(Object.entries(value).filter(([, v]) => v !== '' && v !== null && v !== undefined))
const message = (e: any) => Object.values(e?.data?.errors || {}).flat().join(' ') || e?.data?.message || 'Unable to load attendance report.'
const load = async () => {
  if (loading.value) return
  loading.value = true
  error.value = ''
  try {
    const snapshot = { ...filters }
    report.value = await $api<Report>('/admin/reports/attendance', { query: query(snapshot) })
    applied.value = snapshot
    page.value = 1
  } catch (e) { error.value = message(e) }
  finally { loading.value = false }
}
const reset = () => { Object.assign(filters, defaults()); void load() }
const detail = ref<Row | null>(null)
const detailLoading = ref(false)
const detailError = ref('')
const dialog = ref<HTMLDialogElement | null>(null)
let detailRequest = 0
const closeDetails = () => { detailRequest++; dialog.value?.close(); detail.value = null; detailLoading.value = false }
const openDetails = async (row: Row) => {
  const request = ++detailRequest
  detail.value = row
  detailError.value = ''
  detailLoading.value = true
  dialog.value?.showModal()
  try {
    const data = await $api<Report>('/admin/reports/attendance', { query: query({ ...applied.value, condition: '', employee_id: row.id, details: 1 }) })
    if (request === detailRequest) {
      if (!data.data[0]) throw new Error('Employee no longer matches the report.')
      detail.value = data.data[0]
    }
  } catch (e) { if (request === detailRequest) detailError.value = message(e) }
  finally { if (request === detailRequest) detailLoading.value = false }
}
const exportFormat = ref('xlsx')
const exportScope = ref('summary')
const exporting = ref(false)
const summaryHeaders = ['Employee ID', 'Employee', 'Department', 'Location', 'Position', 'Active', 'Has attendance records', 'Scheduled days', 'Present days', 'Absent days', 'Leave days', 'Late occurrences', 'Late minutes', 'Undertime minutes', 'Worked hours', 'Approved OT hours', 'Missing punch days']
const summaryRow = (r: Row) => [r.employeeNumber, r.employeeName, r.department, r.location, r.position, r.active ? 'Yes' : 'No', r.hasLogs ? 'Yes' : 'No', r.scheduledDays, r.presentDays, r.absentDays, r.leaveDays, r.lateCount, r.lateMinutes, r.undertimeMinutes, Number(hours(r.workedMinutes)), Number(hours(r.overtimeMinutes)), r.missingPunchDays]
const dailyHeaders = ['Employee ID', 'Employee', 'Date', 'Status', 'Scheduled in', 'Scheduled out', 'Time in', 'Time out', 'Source', 'Holiday', 'Leave days', 'Late minutes', 'Undertime minutes', 'Worked hours', 'Approved OT hours', 'Correction status', 'Remarks']
const dailyRows = (data: Row[]) => data.flatMap(r => (r.days || []).map(d => [r.employeeNumber, r.employeeName, d.date, d.status, d.scheduledIn || '', d.scheduledOut || '', d.timeIn || '', d.timeOut || '', d.source, d.holiday, d.leaveDays, d.lateMinutes, d.undertimeMinutes, Number(hours(d.workedMinutes)), Number(hours(d.overtimeMinutes)), d.correction, d.remarks]))
const download = async (employeeId?: number) => {
  if (!report.value || exporting.value) return
  exporting.value = true
  try {
    const daily = !!employeeId || exportScope.value === 'daily'
    const data = await $api<Report>('/admin/reports/attendance', { query: query({ ...applied.value, ...(employeeId ? { employee_id: employeeId, condition: '' } : {}), details: daily ? 1 : 0 }) })
    const metadata = [['Attendance Report', daily ? 'Daily details' : 'Employee summary'], ['Period', `${data.period.start} to ${data.period.end}`], ['Generated at', data.generatedAt],
      ['Filters', JSON.stringify({ ...applied.value, ...(employeeId ? { employee_id: employeeId } : {}) })],
      ['Totals', ...Object.entries(data.totals).map(([key, value]) => `${key}: ${value}`)],
      ['Note', 'Scheduled days include future dates. Absences exclude today/future dates, approved leave, rest days and covered non-working holidays. Unknown schedules/end dates are not assumed absent.'], []]
    const headers = daily ? dailyHeaders : summaryHeaders
    const body = daily ? dailyRows(data.data) : data.data.map(summaryRow)
    let blob: Blob
    if (exportFormat.value === 'csv') {
      const escape = (v: unknown) => `"${String(typeof v === 'string' && /^[\s]*[=+\-@]/.test(v) ? `'${v}` : v ?? '').replaceAll('"', '""')}"`
      blob = new Blob(['\uFEFF', [...metadata, headers, ...body].map(row => row.map(escape).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' })
    } else {
      const ExcelJS = await import('exceljs')
      const workbook = new ExcelJS.default.Workbook()
      const sheet = workbook.addWorksheet(daily ? 'Daily attendance' : 'Employee summary')
      sheet.addRows([...metadata, headers, ...body])
      sheet.getRow(metadata.length + 1).font = { bold: true }
      sheet.views = [{ state: 'frozen', ySplit: metadata.length + 1 }]
      sheet.columns.forEach((column, index) => { column.width = index === 1 ? 30 : 22 })
      sheet.autoFilter = { from: { row: metadata.length + 1, column: 1 }, to: { row: metadata.length + 1, column: headers.length } }
      blob = new Blob([await workbook.xlsx.writeBuffer() as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    }
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `attendance-${daily ? 'daily' : 'summary'}-${data.period.start}-${data.period.end}.${exportFormat.value}`
    link.click()
    URL.revokeObjectURL(url)
  } catch (e) { toast.error('Export failed', message(e)) }
  finally { exporting.value = false }
}
watch(perPage, () => { page.value = 1 })
onMounted(load)
</script>

<template>
  <section class="attendance-report">
    <PageHeader title="Attendance Report" description="Database attendance for every employee, with overall totals and daily records." />
    <form class="filters panel" @submit.prevent="load">
      <label>From<input v-model="filters.start" type="date" required /></label>
      <label>To<input v-model="filters.end" type="date" required :min="filters.start" /></label>
      <label>Employee<input v-model="filters.search" placeholder="Name or employee ID" /></label>
      <label>Department<select v-model="filters.department_id"><option value="">All departments</option><option v-for="d in report?.options.departments" :key="d.id" :value="d.id">{{ d.name }}</option></select></label>
      <label>Location<select v-model="filters.location_id"><option value="">All locations</option><option v-for="l in report?.options.locations" :key="l.id" :value="l.id">{{ l.name }}</option></select></label>
      <label>Employee status<select v-model="filters.employee_status"><option value="all">All employees</option><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
      <label>Attendance condition<select v-model="filters.condition"><option value="">All attendance</option><option value="absent">Has absences</option><option value="late">Has late attendance</option><option value="missing">Has missing punches</option><option value="no_logs">No attendance records</option></select></label>
      <div class="actions"><button class="primary" :disabled="loading" type="submit"><RefreshCw :size="16" />{{ loading ? 'Loading…' : 'Apply filters' }}</button><button type="button" :disabled="loading" @click="reset">Reset</button></div>
    </form>
    <p v-if="error" class="error" role="alert">{{ error }} <button @click="load">Retry</button></p>
    <p v-if="loading" role="status">Loading database records…</p>
    <template v-if="report">
      <div class="period"><strong>{{ report.period.start }} — {{ report.period.end }}</strong><span>All {{ report.data.length }} matching employees · Updated {{ new Date(report.generatedAt).toLocaleString() }}</span></div>
      <div class="stats">
        <article class="panel"><Users :size="20" /><strong>{{ totals.employees }}</strong><span>Employees</span></article>
        <article class="panel"><CalendarDays :size="20" /><strong>{{ totals.scheduledDays }}</strong><span>Scheduled employee-days</span></article>
        <article class="panel"><strong>{{ totals.presentDays }}</strong><span>Present employee-days</span></article>
        <article class="panel"><strong>{{ totals.absentDays }}</strong><span>Absent employee-days</span></article>
        <article class="panel"><strong>{{ totals.leaveDays }}</strong><span>Approved leave days</span></article>
        <article class="panel"><strong>{{ totals.lateCount }} / {{ totals.lateMinutes }} min</strong><span>Late days / chargeable minutes</span></article>
        <article class="panel"><strong>{{ totals.undertimeMinutes }} min</strong><span>Undertime</span></article>
        <article class="panel"><Clock3 :size="20" /><strong>{{ hours(totals.workedMinutes) }} h</strong><span>Recorded worked hours</span></article>
        <article class="panel"><strong>{{ hours(totals.overtimeMinutes) }} h</strong><span>Approved overtime</span></article>
        <article class="panel"><strong>{{ totals.missingPunchDays }}</strong><span>Days with missing punches</span></article>
      </div>
      <p class="note">Totals cover all filtered employees, not just this page. Presence requires a time-in; incomplete logs are flagged. Absences count only past scheduled days, excluding approved leave and covered non-working holidays. Half-day leave can produce fractional absences. Unknown schedules or inactive end dates require review. Department/location filters use current assignments; recorded schedule snapshots and available revisions determine daily schedules.</p>
      <div class="export-bar">
        <label>Export<select v-model="exportScope"><option value="summary">All matching employees — summary</option><option value="daily">All matching employees — daily details</option></select></label>
        <label>Format<select v-model="exportFormat"><option value="xlsx">Excel (.xlsx)</option><option value="csv">CSV</option></select></label>
        <button :disabled="exporting || loading || !report.data.length" @click="download()"><Download :size="16" />{{ exporting ? 'Exporting…' : 'Export report' }}</button>
      </div>
      <div class="panel table-panel">
        <div class="table-scroll" tabindex="0" aria-label="Employee attendance summary">
          <table><thead><tr><th>Employee</th><th>Department / Location</th><th>Scheduled</th><th>Present</th><th>Absent</th><th>Leave</th><th>Late days / min</th><th>Undertime min</th><th>Worked h</th><th>Approved OT h</th><th>Missing punches</th><th>Details</th></tr></thead>
            <tbody><tr v-for="row in rows" :key="row.id">
              <td><strong>{{ row.employeeName }}</strong><small>{{ row.employeeNumber }} · {{ row.active ? 'Active' : 'Inactive' }}</small><small v-if="!row.hasLogs" class="warning">No attendance records</small></td>
              <td>{{ row.department }}<small>{{ row.location }}</small></td><td>{{ row.scheduledDays }}</td><td>{{ row.presentDays }}</td><td>{{ row.absentDays }}</td><td>{{ row.leaveDays }}</td><td>{{ row.lateCount }} / {{ row.lateMinutes }}</td><td>{{ row.undertimeMinutes }}</td><td>{{ hours(row.workedMinutes) }}</td><td>{{ hours(row.overtimeMinutes) }}</td><td>{{ row.missingPunchDays }}</td><td><button @click="openDetails(row)">View daily</button></td>
            </tr><tr v-if="!rows.length"><td colspan="12">No employees match these filters.</td></tr></tbody>
          </table>
        </div>
        <footer><span>{{ report.data.length ? (page - 1) * perPage + 1 : 0 }}–{{ Math.min(page * perPage, report.data.length) }} of {{ report.data.length }} employees</span><label>Per page<select v-model.number="perPage"><option :value="15">15</option><option :value="30">30</option><option :value="50">50</option></select></label><button :disabled="page === 1" @click="page--">Previous</button><span>{{ page }} / {{ pages }}</span><button :disabled="page >= pages" @click="page++">Next</button></footer>
      </div>
    </template>
    <dialog ref="dialog" class="detail-dialog" @click="($event.target === dialog) && closeDetails()" @cancel="closeDetails">
      <template v-if="detail">
        <header><div><h2>{{ detail.employeeName }}</h2><p>{{ detail.employeeNumber }} · {{ applied.start }} — {{ applied.end }}</p></div><button aria-label="Close daily attendance" @click="closeDetails"><X :size="20" /></button></header>
        <p v-if="detailLoading" role="status">Loading daily attendance…</p><p v-if="detailError" class="error" role="alert">{{ detailError }}</p>
        <template v-if="!detailLoading && !detailError">
          <div class="table-scroll" tabindex="0" aria-label="Daily attendance details"><table><thead><tr><th>Date</th><th>Status</th><th>Scheduled shift</th><th>Time in / out</th><th>Late min</th><th>Undertime min</th><th>Worked h</th><th>Approved OT h</th><th>Source / correction</th><th>Notes</th></tr></thead><tbody>
            <tr v-for="day in detail.days" :key="day.date"><td>{{ day.date }}</td><td>{{ day.status }}</td><td>{{ day.scheduledIn || '—' }}<small>{{ day.scheduledOut || '—' }}</small></td><td>{{ day.timeIn || '—' }}<small>{{ day.timeOut || '—' }}</small></td><td>{{ day.lateMinutes }}</td><td>{{ day.undertimeMinutes }}</td><td>{{ hours(day.workedMinutes) }}</td><td>{{ hours(day.overtimeMinutes) }}</td><td>{{ day.source || '—' }}<small>{{ day.correction }}</small></td><td>{{ day.holiday }}<small v-if="day.leaveDays">Approved leave: {{ day.leaveDays }} day(s)</small><small>{{ day.remarks }}</small></td></tr>
          </tbody></table></div>
          <footer><button :disabled="exporting" @click="download(detail.id)"><Download :size="16" />Export employee daily details</button><button @click="closeDetails">Close</button></footer>
        </template>
      </template>
    </dialog>
  </section>
</template>

<style scoped>
.attendance-report{max-width:1660px;margin:auto;display:grid;gap:16px;color:var(--text-primary)}
.panel{border:1px solid var(--border);border-radius:12px;background:var(--bg-card);padding:16px;min-width:0}
.filters{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;align-items:end}
label{display:grid;gap:6px;font-size:12px;color:var(--text-secondary);min-width:0}
input,select,button{font:inherit;color:var(--text-primary);background:var(--bg-card-soft);border:1px solid var(--border);border-radius:8px;padding:9px 11px;min-height:40px;box-sizing:border-box}
input,select{width:100%;min-width:0}button{cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:7px;font-size:12px}
button:disabled{opacity:.5;cursor:default}.primary{background:var(--primary);color:white}
.actions,.export-bar,footer,.period{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.period{justify-content:space-between;font-size:13px}
.stats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}.stats article{display:grid;gap:8px}.stats strong{font-size:21px}.stats span,.note,.period span{font-size:12px;color:var(--text-muted)}
.note{line-height:1.6;margin:0}.export-bar{align-items:end}.error{color:var(--red,#ef4444)}.warning{color:var(--orange,#d97706)}
.table-panel{padding:0;overflow:hidden}.table-scroll{overflow:auto;max-width:100%}table{border-collapse:collapse;width:100%;font-size:12px}
th,td{text-align:left;padding:12px;border-bottom:1px solid var(--border);vertical-align:top}th{background:var(--bg-card-soft);white-space:nowrap}td{min-width:65px}td:first-child{min-width:170px}small{display:block;margin-top:5px;color:var(--text-muted)}
footer{padding:14px;font-size:12px}footer label{display:flex;align-items:center}footer select{width:70px}
.detail-dialog{width:min(1250px,94vw);max-height:88dvh;box-sizing:border-box;border:1px solid var(--border);border-radius:14px;padding:18px;background:var(--bg-card);color:var(--text-primary)}
.detail-dialog::backdrop{background:#0009}.detail-dialog header{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:16px}.detail-dialog h2{font-size:18px;margin:0}.detail-dialog p{font-size:12px}.detail-dialog .table-scroll{max-height:60dvh}
@media(max-width:1000px){.filters{grid-template-columns:repeat(2,minmax(0,1fr))}.stats{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:600px){.stats{grid-template-columns:repeat(2,minmax(0,1fr))}.stats strong{font-size:18px}.filters{grid-template-columns:1fr}.export-bar label{flex:1 1 140px}.detail-dialog{padding:12px}.panel{padding:12px}.table-panel{padding:0}}
</style>
