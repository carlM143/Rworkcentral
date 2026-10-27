<script setup lang="ts">
import { ArrowUpRight, CalendarDays, Clock3, Umbrella, TimerReset, WalletCards, ClipboardCheck, Plus, Download, Megaphone, X } from 'lucide-vue-next'
import type { EmployeeRequest } from '~/composables/employee/useEmployeePortal'
import { employeeLeavePolicy } from '~/utils/employeeLeavePolicy'
import { employeeRequestCategory } from '~/utils/employeeRequestCategory'
import { overtimeDuration, undertimeDuration, requestClock } from '~/utils/employeeRequestTime'

const props = defineProps<{ section: string }>()
const route = useRoute()
const router = useRouter()
const { profile, requests, punches, addRequest, updateRequest, storageError } = useEmployeePortal()
const titles: Record<string, string> = { dashboard: 'Dashboard', attendance: 'Attendance', 'leave-types': 'Leave Credits', requests: 'Requests', payslips: 'Payslips', loans: 'Loans', profile: 'Profile' }
const requestableLeaves = computed(() => employeeLeavePolicy(profile.value.employmentType).filter(leave => leave.canRequest))
const leaveCredit = (name: string) => {
  const available = employeeLeavePolicy(profile.value.employmentType).find(leave => leave.name === name)?.available
  return available === null || available === undefined ? 'HR review' : `${available} days`
}
useHead({ title: computed(() => `${titles[props.section]} | Employee Portal — RWorkCentral`) })
const now = ref(new Date())
let clock: ReturnType<typeof setInterval> | undefined
onMounted(() => { clock = setInterval(() => { now.value = new Date() }, 1000) })
onBeforeUnmount(() => clearInterval(clock))
const dateKey = computed(() => {
  const date = now.value
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
})
const currentPunch = computed(() => punches.value[dateKey.value])
const visibleRequests = computed(() => requests.value.filter(request => ['Leave', 'Undertime', 'Overtime'].includes(employeeRequestCategory(request.type) || '')))
const pending = computed(() => visibleRequests.value.filter(r => r.status === 'Pending').length)
const notice = ref('')
const filter = ref('All')
const requestCategories = ['Leave', 'Undertime', 'Overtime'] as const
const activeCategory = ref<typeof requestCategories[number]>('Leave')
watch(() => route.query.category, category => {
  activeCategory.value = category === 'undertime' ? 'Undertime' : category === 'overtime' ? 'Overtime' : 'Leave'
  filter.value = 'All'
}, { immediate: true })
const selectRequestCategory = (category: typeof requestCategories[number]) => {
  activeCategory.value = category
  filter.value = 'All'
  if (props.section === 'requests') void router.replace({ path: '/employee/requests', query: { ...route.query, category: category.toLowerCase() } })
}
const filteredRequests = computed(() => requests.value.filter(r => employeeRequestCategory(r.type) === (props.section === 'attendance' ? 'Attendance Report' : activeCategory.value) && (filter.value === 'All' || r.status === filter.value)))
const categoryCount = (category: string) => requests.value.filter(request => employeeRequestCategory(request.type) === category).length
const requestDialog = ref<HTMLDialogElement | null>(null)
const viewDialog = ref<HTMLDialogElement | null>(null)
const attendanceDetailsOpen = ref(false)
const selectedAttendanceDate = ref('')
const selectedAttendance = computed(() => punches.value[selectedAttendanceDate.value])
const selectedAttendanceShift = computed(() => {
  const day = new Date(`${selectedAttendanceDate.value}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long' })
  return profile.value.workDays.find(shift => shift.day === day)
})
const viewAttendance = (date: string) => { selectedAttendanceDate.value = date; attendanceDetailsOpen.value = true }
const viewingRequestId = ref('')
const viewedRequest = computed(() => requests.value.find(request => request.id === viewingRequestId.value))
const viewRequest = (request: EmployeeRequest) => {
  viewingRequestId.value = request.id
  viewDialog.value?.showModal()
}
const form = reactive({ type: 'Vacation Leave', start: '', end: '', reason: '' })
const formCategory = computed(() => employeeRequestCategory(form.type))
const reportedAttendanceDate = ref('')
const editingRequestId = ref('')
const originalRequest = computed(() => requests.value.find(request => request.id === editingRequestId.value))
const leaveFormOptions = computed(() => {
  const names = requestableLeaves.value.map(leave => leave.name)
  if (originalRequest.value && employeeRequestCategory(originalRequest.value.type) === 'Leave' && !names.includes(originalRequest.value.type)) names.unshift(originalRequest.value.type)
  return names
})
const canEditRequest = (request: EmployeeRequest) => request.status === 'Pending' && ['Leave', 'Undertime', 'Overtime'].includes(employeeRequestCategory(request.type) || '')
const timing = reactive({ startTime: '', endTime: '', endsNextDay: false, requestedTimeOut: '' })
const timedRequest = computed(() => form.type === 'Overtime' || form.type === 'Undertime')
const selectedShift = computed(() => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.start)) return null
  const date = new Date(`${form.start}T12:00:00`)
  if (Number.isNaN(date.getTime())) return null
  const day = date.toLocaleDateString('en-US', { weekday: 'long' })
  return profile.value.workDays.find(shift => shift.day === day) || null
})
const requestedMinutes = computed(() => form.type === 'Overtime'
  ? overtimeDuration(timing.startTime, timing.endTime, timing.endsNextDay)
  : form.type === 'Undertime' ? undertimeDuration(selectedShift.value?.start || '', selectedShift.value?.end || '', timing.requestedTimeOut, timing.endTime) : null)
watch(() => form.start, () => {
  if (form.type === 'Undertime') timing.endTime = selectedShift.value?.end || ''
}, { flush: 'sync' })
const formError = ref('')
const requestImage = ref<EmployeeRequest['image']>()
const imageLoading = ref(false)
const requestFormKey = ref(0)
const formatDate = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
const shortDate = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
const formatTime = (value?: string) => value ? new Date(value).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }) : '—'
const workedHours = (hours: number | undefined) => hours === undefined ? 'Not provided' : `${hours.toFixed(1)} hrs`
const attendance = computed(() => Object.entries(punches.value).sort(([a], [b]) => b.localeCompare(a)))
const attendanceStatus = (date: string, status?: string) => {
  if (status !== 'Undertime') return status || '--'
  const approved = requests.value.some(request => request.type === 'Undertime'
    && request.status === 'Approved' && request.start <= date && request.end >= date)
  return approved ? 'Undertime (Approved)' : '--'
}
const stats = computed(() => [
  { label: 'Days Logged', value: attendance.value.filter(([, entry]) => entry.timeIn).length, description: 'Attendance records', color: 'blue', icon: Clock3 },
  { label: 'Vacation Leave', value: leaveCredit('Vacation Leave'), description: `Annual reference credits · ${now.value.getFullYear()}`, color: 'green', icon: Umbrella },
  { label: 'Sick Leave', value: leaveCredit('Sick Leave'), description: `Annual reference credits · ${now.value.getFullYear()}`, color: 'purple', icon: CalendarDays },
  { label: 'Pending Requests', value: pending.value, description: 'Awaiting review', color: 'orange', icon: ClipboardCheck },
])
const quickActions = [
  { label: 'File Leave', type: 'Vacation Leave', icon: Umbrella, color: 'green' },
  { label: 'Request Overtime', type: 'Overtime', icon: TimerReset, color: 'orange' },
  { label: 'Request Undertime', type: 'Undertime', icon: Clock3, color: 'purple' },
]
const openRequest = (type = 'Vacation Leave') => {
  if (employeeLeavePolicy(profile.value.employmentType).some(leave => leave.name === type && !leave.canRequest)) type = requestableLeaves.value[0]?.name || 'Leave Without Pay'
  Object.assign(form, { type, start: dateKey.value, end: dateKey.value, reason: '' })
  reportedAttendanceDate.value = ''
  editingRequestId.value = ''
  Object.assign(timing, { startTime: '', endTime: '', endsNextDay: false, requestedTimeOut: '' })
  if (type === 'Undertime') timing.endTime = selectedShift.value?.end || ''
  formError.value = ''
  requestImage.value = undefined
  imageLoading.value = false
  requestFormKey.value++
  requestDialog.value?.showModal()
}
const editRequest = (request: EmployeeRequest) => {
  if (!canEditRequest(request)) return
  viewDialog.value?.close()
  openRequest(request.type)
  editingRequestId.value = request.id
  Object.assign(form, { type: request.type, start: request.start, end: request.end, reason: request.reason })
  Object.assign(timing, { startTime: request.timing?.startTime || '', endTime: request.timing?.endTime || (request.type === 'Undertime' ? request.timing?.scheduledTimeOut || selectedShift.value?.end || '' : ''), endsNextDay: request.timing?.endsNextDay || false, requestedTimeOut: request.timing?.requestedTimeOut || request.timing?.startTime || '' })
  requestImage.value = request.image ? { ...request.image } : undefined
}
const reportAttendance = (date: string) => {
  attendanceDetailsOpen.value = false
  openRequest('Attendance Report')
  reportedAttendanceDate.value = date
  form.start = date
  form.end = date
}
const submitRequest = () => {
  if (imageLoading.value) return
  if (formCategory.value !== 'Attendance Report' && !requestImage.value) { formError.value = 'Please attach a supporting image before saving your request.'; return }
  if (formCategory.value === 'Attendance Report') {
    if (!reportedAttendanceDate.value || !punches.value[reportedAttendanceDate.value]) { formError.value = 'Choose an attendance record to report.'; return }
    form.start = reportedAttendanceDate.value
    form.end = reportedAttendanceDate.value
  }
  if (!formCategory.value) { formError.value = 'Please choose Leave, Undertime, or Overtime.'; return }
  if (originalRequest.value?.type !== form.type && employeeLeavePolicy(profile.value.employmentType).some(leave => leave.name === form.type && !leave.canRequest)) { formError.value = 'This leave type is not available under the current frontend company policy. Contact HR to confirm your eligibility.'; return }
  if (!form.start || (!timedRequest.value && (!form.end || form.end < form.start))) { formError.value = 'Choose valid request dates. End date must be on or after the start date.'; return }
  if (timedRequest.value && requestedMinutes.value === null) {
    formError.value = form.type === 'Overtime' ? 'Enter valid start/end times. For overnight overtime, select Ends next day. Maximum duration is 24 hours.' : 'Choose a working day and valid undertime start/end times within the scheduled shift. End time must be later than start time.'
    return
  }
  if (!form.reason.trim()) { formError.value = 'Please provide a reason for your request.'; return }
  const requestTiming: EmployeeRequest['timing'] = !timedRequest.value ? undefined : form.type === 'Overtime'
    ? { startTime: timing.startTime, endTime: timing.endTime, endsNextDay: timing.endsNextDay, requestedMinutes: requestedMinutes.value! }
    : { startTime: timing.requestedTimeOut, endTime: timing.endTime, scheduledTimeOut: selectedShift.value!.end, requestedTimeOut: timing.requestedTimeOut, requestedMinutes: requestedMinutes.value! }
  const changes = { start: form.start, end: timedRequest.value ? form.start : form.end, reason: form.reason.trim(), image: requestImage.value, timing: requestTiming }
  if (editingRequestId.value) {
    if (!updateRequest(editingRequestId.value, { ...changes, type: form.type })) { formError.value = 'This request is no longer pending or the selected type is not allowed.'; return }
  } else addRequest({ ...changes, type: form.type, id: `REQ-${crypto.randomUUID().slice(0, 8).toUpperCase()}` })
  if (formCategory.value !== 'Attendance Report') selectRequestCategory(formCategory.value!)
  requestDialog.value?.close()
  notice.value = `${editingRequestId.value ? 'Request updated' : 'Request saved'} in this browser. It has not been sent to HR.`
}
</script>

<template>
  <section class="employee-page" :class="{ 'home-page': section === 'dashboard', 'attendance-page': section === 'attendance' }">
    <div class="employee-header">
      <div>
        <h1>{{ titles[section] }}</h1>
        <p v-if="section === 'dashboard'" class="greeting">Welcome back, <strong>{{ profile.name.split(' ')[0] }}!</strong> 👋</p>
        <p class="page-description">{{ section === 'dashboard' ? 'Overview of your personal HR information.' : 'Your employee information, all in one place.' }}</p>
      </div>
      <div class="header-tools">
        <span class="date-label"><CalendarDays :size="16" />{{ now.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) }}</span>
        <button v-if="section === 'dashboard' || section === 'requests'" class="portal-button primary" @click="openRequest(section === 'requests' && activeCategory !== 'Leave' ? activeCategory : undefined)"><Plus :size="16" />{{ section === 'requests' ? `New ${activeCategory} Request` : 'New Request' }}</button>
      </div>
    </div>

    <div class="portal-banner"><ClipboardCheck :size="17" /><span><strong>Employee Portal.</strong> Account verification and HR submission are not connected. Changes are saved in this browser only.</span></div>
    <details v-if="section === 'dashboard' || section === 'attendance'" class="home-storage-note"><summary>Changes are saved on this device only</summary><p>Account verification and HR submission are not connected. These are frontend records, not verified HR data.</p></details>
    <p v-if="storageError" class="feedback error" role="alert">{{ storageError }}</p>
    <p v-if="notice" class="feedback" role="status">{{ notice }}<button aria-label="Dismiss message" @click="notice = ''"><X :size="16" /></button></p>


    <div v-if="section === 'dashboard'" class="employee-stats">
      <article v-for="stat in stats" :key="stat.label" class="portal-card stat">
        <span class="colored-icon" :class="stat.color"><component :is="stat.icon" :size="21" /></span>
        <div><p>{{ stat.label }}</p><strong>{{ stat.value }}</strong><small>{{ stat.description }}</small></div>
      </article>
    </div>

    <div v-if="section === 'dashboard' || section === 'attendance'" class="employee-grid">
      <article class="portal-card attendance-overview">
        <div class="panel-heading"><div><h2>Today's Attendance</h2><p>Your daily time record</p></div><span class="badge" :class="currentPunch?.timeOut ? 'blue' : currentPunch?.timeIn ? 'green' : 'orange'">{{ currentPunch?.status || 'No record' }}</span></div>
        <div class="time-display">{{ now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }}<small>{{ now.toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' }) }}</small></div>
        <div class="punch-summary"><div><span>Time In</span><strong>{{ formatTime(currentPunch?.timeIn) }}</strong></div><div><span>Time Out</span><strong>{{ formatTime(currentPunch?.timeOut) }}</strong></div><div><span>Hours Worked</span><strong>{{ workedHours(currentPunch?.hoursWorked) }}</strong></div></div>
         <p class="footnote">Attendance will come from the biometric system; the service is not connected yet. Current records are frontend-only.<br>Manual time in/out is not available here. Times shown in your local timezone.</p>
         <p v-if="section === 'dashboard' || section === 'attendance'" class="home-attendance-note">Read-only · Biometric service not connected</p>
      </article>
      <article v-if="section === 'dashboard'" class="portal-card quick-actions-card">
        <div class="panel-heading"><div><h2>Quick Actions</h2><p>Make a request in just a few clicks</p></div></div>
        <div class="quick-actions"><button v-for="action in quickActions" :key="action.type" :aria-label="action.label" @click="openRequest(action.type)"><span class="colored-icon" :class="action.color"><component :is="action.icon" :size="19" /></span><strong><span class="full-action-label">{{ action.label }}</span><span class="mobile-action-label">{{ action.type === 'Vacation Leave' ? 'File Leave' : action.type }}</span></strong><ArrowUpRight :size="16" /></button></div>
      </article>
      <article v-else class="portal-card schedule-card"><div class="panel-heading"><div><h2>Work Schedule</h2><p>Your regular work week</p></div><CalendarDays :size="20" /></div><h3>Tuesday – Friday</h3><strong>8:00 AM – 5:00 PM</strong><p>Monday: 9:00 AM – 5:00 PM</p><p>Saturday: 8:00 AM – 12:00 PM</p><p>Sunday: Rest day</p></article>
    </div>

    <article v-if="section === 'attendance'" class="portal-card lower-panel">
      <div class="panel-heading"><div><h2>Attendance History</h2><p>Read-only attendance records · Biometric service not connected</p></div></div>
      <p class="mobile-table-hint">Tap an attendance row for worked hours, schedule and reporting.</p>
      <div class="table-scroll" role="region" aria-label="Attendance history" tabindex="0"><table class="mobile-compact-table attendance-table"><thead><tr><th scope="col">Date</th><th scope="col">Time In</th><th scope="col">Time Out</th><th scope="col" class="mobile-hide">Hours Worked</th><th scope="col">Status</th><th scope="col" class="mobile-hide">Actions</th></tr></thead><tbody><tr v-for="[date, entry] in attendance" :key="date" class="record-row" @click="viewAttendance(date)"><td><button type="button" class="row-open-button" :aria-label="`Open attendance details for ${formatDate(date)}`" @click.stop="viewAttendance(date)"><span class="mobile-hide">{{ formatDate(date) }}</span><span class="mobile-only">{{ shortDate(date) }}</span></button></td><td>{{ formatTime(entry.timeIn) }}</td><td>{{ formatTime(entry.timeOut) }}</td><td class="mobile-hide">{{ workedHours(entry.hoursWorked) }}</td><td>{{ attendanceStatus(date, entry.status) }}</td><td class="mobile-hide"><button type="button" class="report-button" :aria-label="`Report an attendance issue for ${formatDate(date)}`" @click.stop="reportAttendance(date)">Report</button></td></tr><tr v-if="!attendance.length"><td colspan="6" class="empty-state">No biometric attendance records are available.</td></tr></tbody></table></div>
    </article>

    <nav v-if="section === 'requests'" class="request-categories" aria-label="Request categories"><button v-for="category in requestCategories" :key="category" type="button" :class="{ selected: activeCategory === category }" :aria-pressed="activeCategory === category" @click="selectRequestCategory(category)">{{ category }} <span>{{ categoryCount(category) }}</span></button></nav>
    <div v-if="section === 'dashboard' || section === 'requests' || section === 'attendance'" :class="section === 'dashboard' ? 'employee-grid lower-panel' : section === 'attendance' ? 'lower-panel' : ''">
      <article class="portal-card requests-panel">
        <div class="panel-heading"><div><h2>{{ section === 'dashboard' ? 'Recent Requests' : section === 'attendance' ? 'Attendance Reports' : `${activeCategory} Requests` }}</h2><p>Track your {{ section === 'attendance' ? 'attendance reports' : 'requests' }} and their status</p></div><NuxtLink v-if="section === 'dashboard'" to="/employee/requests" class="text-link">View all <ArrowUpRight :size="14" /></NuxtLink><select v-else v-model="filter" aria-label="Filter requests by status"><option>All</option><option>Pending</option><option>Approved</option><option>Rejected</option><option>Cancelled</option></select></div>
        <p class="mobile-table-hint">Tap a request row for full dates, times, attachments and request actions.</p>
        <div v-if="section === 'dashboard'" class="home-request-list">
          <button v-for="request in visibleRequests.slice(0, 3)" :key="request.id" type="button" :aria-label="`View request ${request.id}`" @click="viewRequest(request)"><span class="home-request-copy"><strong>{{ request.type }}</strong><small>{{ formatDate(request.start) }}</small></span><span class="badge" :class="request.status === 'Approved' ? 'green' : request.status === 'Pending' ? 'orange' : 'neutral'">{{ request.status }}</span><ArrowUpRight :size="15" aria-hidden="true" /></button>
          <p v-if="!visibleRequests.length" class="empty-state">No requests yet.</p>
        </div>
        <div class="table-scroll" role="region" aria-label="Request history" tabindex="0">
          <table class="mobile-compact-table request-table">
            <thead><tr><th scope="col">Request</th><th scope="col">Dates / Times</th><th scope="col">Status</th><th v-if="section !== 'dashboard'" scope="col" class="mobile-hide">Action</th><th v-if="section !== 'dashboard'" scope="col" class="mobile-only">Reference</th></tr></thead>
            <tbody>
              <tr v-for="request in (section === 'dashboard' ? visibleRequests.slice(0, 4) : filteredRequests)" :key="request.id" class="record-row" @click="viewRequest(request)">
                <td>
                  <button type="button" class="row-open-button" :aria-label="`Open request ${request.id} details`" @click.stop="viewRequest(request)">{{ employeeRequestCategory(request.type) === 'Attendance Report' ? 'Attendance Report' : request.type }}</button>
                  <small class="mobile-hide">{{ section !== 'dashboard' ? request.reason : request.id }}</small>
                  <a v-if="request.image && section !== 'dashboard'" class="request-attachment mobile-hide" :href="request.image.dataUrl" :download="request.image.name" :title="`Download ${request.image.name}`" @click.stop>
                    <img :src="request.image.dataUrl" :alt="`Attachment: ${request.image.name}`" loading="lazy">
                    <small><Download :size="12" />{{ request.image.name }}</small>
                  </a>
                  <small v-else-if="request.image">Image attached</small>
                </td>
                <td><span class="mobile-only">{{ shortDate(request.start) }}</span><span class="mobile-hide">{{ formatDate(request.start) }}<small v-if="request.end !== request.start">to {{ formatDate(request.end) }}</small><template v-if="request.timing"><small v-if="request.type === 'Overtime'">{{ requestClock(request.timing.startTime) }} – {{ requestClock(request.timing.endTime) }}{{ request.timing.endsNextDay ? ' (next day)' : '' }}</small><small v-if="request.type === 'Undertime'">Start: {{ requestClock(request.timing.startTime || request.timing.requestedTimeOut) }}<br>End: {{ requestClock(request.timing.endTime || request.timing.scheduledTimeOut) }}</small><small>{{ request.timing.requestedMinutes }} minutes requested</small></template></span></td>
                <td><span class="badge" :class="request.status === 'Approved' ? 'green' : request.status === 'Pending' ? 'orange' : 'neutral'">{{ request.status }}</span></td>
                <td v-if="section !== 'dashboard'" class="mobile-hide"><button v-if="canEditRequest(request)" type="button" class="text-link" @click.stop="editRequest(request)">Edit</button><span v-else>—</span></td><td v-if="section !== 'dashboard'" class="mobile-only">{{ request.id }}</td>
              </tr>
              <tr v-if="section !== 'dashboard' && !filteredRequests.length"><td colspan="4" class="empty-state">No {{ section === 'attendance' ? 'attendance reports' : activeCategory.toLowerCase() + ' requests' }} match this status.</td></tr>
            </tbody>
          </table>
        </div>
      </article>
      <article v-if="section === 'dashboard'" class="portal-card home-bulletin">
        <div class="panel-heading"><div><h2>Employee Bulletin</h2><p>Company updates</p></div><Megaphone :size="20" /></div>
        <div class="bulletin"><span class="colored-icon blue"><WalletCards :size="19" /></span><div><h3>Your payslips, in one place</h3><p>Review your earnings and deductions.</p><NuxtLink class="text-link" to="/employee/payslips">View Payslips <ArrowUpRight :size="14" /></NuxtLink></div></div>
        <div class="bulletin"><span class="colored-icon green"><Umbrella :size="19" /></span><div><h3>Planning some time off?</h3><p>Submit your leave request ahead of time for your manager's review.</p><button class="text-link" @click="openRequest()">Apply for leave <ArrowUpRight :size="14" /></button></div></div>
      </article>
    </div>

    <EmployeeLeaveTypes v-if="section === 'leave-types'" />
    <EmployeePayslips v-if="section === 'payslips'" />
    <EmployeeLoans v-if="section === 'loans'" />

    <EmployeeProfile v-if="section === 'profile'" />

    <EmployeeRecordDialog v-model="attendanceDetailsOpen" title="Attendance Details" :subtitle="selectedAttendanceDate ? formatDate(selectedAttendanceDate) : ''">
      <dl v-if="selectedAttendance" class="record-fields"><div><dt>Date</dt><dd>{{ formatDate(selectedAttendanceDate) }}</dd></div><div><dt>Status</dt><dd>{{ attendanceStatus(selectedAttendanceDate, selectedAttendance.status) }}</dd></div><div><dt>Time In</dt><dd>{{ formatTime(selectedAttendance.timeIn) }}</dd></div><div><dt>Time Out</dt><dd>{{ formatTime(selectedAttendance.timeOut) }}</dd></div><div><dt>Hours Worked</dt><dd>{{ workedHours(selectedAttendance.hoursWorked) }}</dd></div><div><dt>Scheduled Shift</dt><dd>{{ selectedAttendanceShift?.start ? `${requestClock(selectedAttendanceShift.start)} – ${requestClock(selectedAttendanceShift.end)}` : 'Rest day / Not provided' }}</dd></div><div class="wide"><dt>Record Source</dt><dd>Frontend record; biometric service is not connected.</dd></div></dl>
      <template #actions><button type="button" class="report-button" @click="reportAttendance(selectedAttendanceDate)">Report an issue</button></template>
    </EmployeeRecordDialog>

    <dialog ref="viewDialog" class="portal-dialog" aria-label="Request details" @close="viewingRequestId = ''">
      <template v-if="viewedRequest">
        <div class="panel-heading"><div><h2>Request Details</h2><p>{{ viewedRequest.id }} · Read-only</p></div><button type="button" class="dialog-close" aria-label="Close request details" @click="viewDialog?.close()"><X :size="20" /></button></div>
        <div class="request-details">
          <dl class="request-detail-grid">
            <div><dt>Request Type</dt><dd>{{ employeeRequestCategory(viewedRequest.type) === 'Attendance Report' ? 'Attendance Report' : viewedRequest.type }}</dd></div>
            <div><dt>Status</dt><dd><span class="badge" :class="viewedRequest.status === 'Approved' ? 'green' : viewedRequest.status === 'Pending' ? 'orange' : 'neutral'">{{ viewedRequest.status }}</span></dd></div>
            <div><dt>Start / Request Date</dt><dd>{{ formatDate(viewedRequest.start) }}</dd></div>
            <div><dt>End Date</dt><dd>{{ formatDate(viewedRequest.end) }}</dd></div>
            <template v-if="viewedRequest.type === 'Undertime' || viewedRequest.type === 'Overtime'">
              <div><dt>{{ viewedRequest.type }} Start Time</dt><dd>{{ requestClock(viewedRequest.timing?.startTime || viewedRequest.timing?.requestedTimeOut) }}</dd></div>
              <div><dt>{{ viewedRequest.type }} End Time</dt><dd>{{ requestClock(viewedRequest.timing?.endTime || viewedRequest.timing?.scheduledTimeOut) }}{{ viewedRequest.timing?.endsNextDay ? ' (next day)' : '' }}</dd></div>
              <div v-if="viewedRequest.type === 'Undertime'"><dt>Scheduled Time Out</dt><dd>{{ requestClock(viewedRequest.timing?.scheduledTimeOut) }}</dd></div>
              <div><dt>Requested Duration</dt><dd>{{ viewedRequest.timing ? `${viewedRequest.timing.requestedMinutes} minutes` : 'Not provided' }}</dd></div>
            </template>
            <div class="full-width"><dt>Reason / Details</dt><dd class="request-reason">{{ viewedRequest.reason }}</dd></div>
          </dl>
          <div class="view-attachment"><h3>Supporting Image</h3><template v-if="viewedRequest.image"><a :href="viewedRequest.image.dataUrl" :download="viewedRequest.image.name" class="view-image-link"><img :src="viewedRequest.image.dataUrl" :alt="`Supporting image for request ${viewedRequest.id}`"><span><Download :size="14" />{{ viewedRequest.image.name }}</span></a></template><p v-else>No supporting image on this older record.</p></div>
          <p class="footnote">Frontend record only; not submitted to HR.</p>
          <div class="dialog-actions"><button v-if="canEditRequest(viewedRequest)" type="button" class="portal-button primary" @click="editRequest(viewedRequest)">Edit Request</button><button type="button" class="portal-button" @click="viewDialog?.close()">Close</button></div>
        </div>
      </template>
    </dialog>

    <dialog ref="requestDialog" class="portal-dialog" aria-label="New employee request" @close="formError = ''">
      <form @submit.prevent="submitRequest">
        <div class="panel-heading">
          <div><h2>{{ formCategory === 'Attendance Report' ? 'Report Attendance Issue' : `${editingRequestId ? 'Edit' : 'New'} ${formCategory} Request` }}</h2><p>Saved in this browser only; not sent to HR</p></div>
          <button type="button" class="dialog-close" aria-label="Close request form" @click="requestDialog?.close()"><X :size="20" /></button>
        </div>
        <div class="form-fields">
          <label v-if="formCategory === 'Leave'" class="full-width">Leave Type<select v-model="form.type"><option v-for="leave in leaveFormOptions" :key="leave">{{ leave }}</option></select></label>
          <p v-if="formCategory === 'Leave' && originalRequest && !requestableLeaves.some(leave => leave.name === originalRequest?.type)" class="full-width">The existing leave type is preserved for this pending request. Its eligibility still requires HR confirmation under the current policy.</p>
          <p v-else class="full-width"><strong>Request Type: {{ formCategory }}</strong></p>
          <p v-if="formCategory === 'Leave'" class="full-width">Leave choices follow the current frontend employment-type policy. Statutory leave requires HR eligibility review; saving a request does not establish eligibility or deduct credits. <NuxtLink to="/employee/leave-types" @click="requestDialog?.close()">View Leave Credits</NuxtLink></p>
          <p v-if="formCategory === 'Attendance Report'" class="full-width locked-report-date">Attendance Date: <strong>{{ formatDate(reportedAttendanceDate) }}</strong><br>This report is linked to the attendance record you selected.</p>
          <template v-else>
            <label>{{ timedRequest ? 'Request Date' : 'Start Date' }}<input v-model="form.start" type="date" required></label>
            <label v-if="!timedRequest">End Date<input v-model="form.end" type="date" :min="form.start" required></label>
          </template>
          <template v-if="form.type === 'Overtime'">
            <label>OT Start Time<input v-model="timing.startTime" type="time" required></label>
            <label>OT End Time<input v-model="timing.endTime" type="time" required></label>
            <label class="full-width next-day"><input v-model="timing.endsNextDay" type="checkbox">Ends next day</label>
          </template>
          <template v-if="form.type === 'Undertime'">
            <p class="full-width">Scheduled shift: <strong>{{ requestClock(selectedShift?.start) }} – {{ requestClock(selectedShift?.end) }}</strong></p>
            <label>Undertime Start Time<input v-model="timing.requestedTimeOut" type="time" :min="selectedShift?.start || undefined" :max="selectedShift?.end || undefined" required></label>
            <label>Undertime End Time<input v-model="timing.endTime" type="time" :min="timing.requestedTimeOut || selectedShift?.start || undefined" :max="selectedShift?.end || undefined" required></label>
            <p v-if="!selectedShift?.start" class="full-width error">No working shift is assigned on this day. Select a working day or contact HR.</p>
          </template>
          <p v-if="timedRequest" class="full-width">Requested duration: <strong>{{ requestedMinutes === null ? 'Enter valid times' : `${requestedMinutes} minutes` }}</strong>. HR must verify the schedule and duration. This request does not change official attendance, pay, or approval status.</p>
          <label class="full-width">Reason / Details<textarea v-model="form.reason" required maxlength="1000" rows="4" :placeholder="formCategory === 'Attendance Report' ? 'Describe what is wrong with the attendance record and the correct time or details. You can attach a supporting image below.' : 'Include the reason and any relevant times or details.'" /></label>
          <EmployeeRequestImageUpload :key="requestFormKey" v-model="requestImage" :required="formCategory !== 'Attendance Report'" class="full-width" @busy="imageLoading = $event" />
          <p v-if="formError" class="error full-width" role="alert">{{ formError }}</p>
          <div class="dialog-actions full-width">
            <button type="button" class="portal-button" @click="requestDialog?.close()">Cancel</button>
            <button type="submit" class="portal-button primary" :disabled="imageLoading">{{ imageLoading ? 'Preparing Image…' : editingRequestId ? 'Save Changes Locally' : 'Save Request Locally' }}</button>
          </div>
        </div>
      </form>
    </dialog>
  </section>
</template>

<style scoped>
.employee-page { max-width: 1660px; margin: 0 auto; }
.home-storage-note, .home-attendance-note, .mobile-action-label, .home-request-list { display: none; }
.locked-report-date { padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); font-size: 12px; line-height: 1.7; }
.request-row-actions { display: flex; flex-wrap: wrap; gap: 14px; }.next-day { flex-direction: row; align-items: center; }.next-day input { width: auto; }
.request-details { padding: 0 20px 20px; }.request-detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; margin: 8px 0 24px; }.request-detail-grid dt { color: var(--text-secondary); font-size: 10px; margin-bottom: 7px; }.request-detail-grid dd { margin: 0; font-size: 12px; overflow-wrap: anywhere; }.request-reason { white-space: pre-wrap; line-height: 1.7; }.view-image-link { display: block; margin-top: 12px; }.view-image-link img { display: block; max-width: 100%; max-height: 300px; margin: 0 auto; object-fit: contain; border: 1px solid var(--border); border-radius: 8px; }.view-image-link span { display: flex; align-items: center; gap: 7px; color: var(--primary); font-size: 11px; margin-top: 10px; overflow-wrap: anywhere; }@media(max-width: 400px) { .request-detail-grid { grid-template-columns: 1fr; } }
.request-categories { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }.request-categories button { display: inline-flex; align-items: center; gap: 9px; padding: 11px 16px; border: 1px solid var(--border); border-radius: 8px; color: var(--text-secondary); background: var(--bg-card); font: inherit; font-size: 12px; }.request-categories button.selected { color: var(--primary); background: var(--primary-soft); border-color: var(--primary); }.request-categories button:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }.request-categories span { font-size: 10px; border-radius: 12px; padding: 3px 7px; background: var(--bg-card-soft); }
.employee-header, .header-tools, .panel-heading, .row-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.employee-header { align-items: flex-start; margin-bottom: 22px; }
h1 { font-size: 27px; letter-spacing: -.7px; margin: 0 0 7px; }
h2 { margin: 0; font-size: 14px; }
h3 { font-size: 13px; margin: 0 0 7px; }
p { font-size: 12px; color: var(--text-secondary); line-height: 1.7; margin: 4px 0 0; }
.greeting { color: var(--text-primary); font-size: 14px; }
.date-label { display: flex; align-items: center; gap: 8px; border: 1px solid var(--border); background: var(--bg-card); padding: 12px; border-radius: 9px; font-size: 12px; color: var(--text-secondary); }
.portal-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 41px; padding: 10px 15px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-card); color: var(--text-primary); font-size: 12px; font-weight: 600; }
.portal-button.primary { background: linear-gradient(135deg, #1f68f2, #2878ff); border-color: transparent; color: white; box-shadow: 0 5px 12px #246bfd25; }
.portal-button:hover { filter: brightness(.96); }
.portal-button:disabled { opacity: .6; cursor: default; }
.portal-banner { display: flex; gap: 10px; align-items: center; background: var(--primary-soft); color: var(--text-secondary); padding: 12px 15px; border-radius: 9px; font-size: 11px; margin-bottom: 18px; }
.portal-banner svg { color: var(--primary); flex-shrink: 0; }
.feedback { display: flex; align-items: center; justify-content: space-between; background: var(--green-soft); color: var(--green); padding: 12px 15px; border-radius: 9px; margin-bottom: 16px; }
.feedback button, .dialog-close { border: 0; background: transparent; color: var(--text-secondary); display: inline-flex; padding: 6px; }
.error { color: var(--red); }
.employee-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 13px; margin-bottom: 13px; }
.portal-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; box-shadow: var(--shadow); min-width: 0; overflow: hidden; }
.stat { display: flex; gap: 12px; padding: 19px 17px; }
.stat p { font-size: 11px; margin: 0 0 7px; }
.stat strong { display: block; font-size: 24px; letter-spacing: -.5px; }
.stat small { display: block; color: var(--text-muted); font-size: 10px; margin-top: 7px; }
.colored-icon { display: inline-flex; align-items: center; justify-content: center; width: 39px; height: 39px; flex-shrink: 0; border-radius: 50%; }
.blue { color: var(--primary); background: var(--primary-soft); }
.green { color: var(--green); background: var(--green-soft); }
.orange { color: var(--orange); background: var(--orange-soft); }
.purple { color: var(--purple); background: var(--purple-soft); }
.neutral { color: var(--text-secondary); background: var(--bg-card-soft); }
.employee-grid { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: 13px; }
.lower-panel { margin-top: 13px; }
.panel-heading { padding: 18px; align-items: flex-start; }
.panel-heading p { font-size: 10px; color: var(--text-muted); }
.badge { display: inline-block; white-space: nowrap; font-size: 10px; font-weight: 600; padding: 5px 8px; border-radius: 5px; }
.time-display { text-align: center; font-size: 32px; font-weight: 700; letter-spacing: -1px; margin: 8px 0 21px; font-variant-numeric: tabular-nums; }
.time-display small { display: block; margin-top: 6px; font-size: 11px; color: var(--text-muted); font-weight: 400; letter-spacing: 0; }
.punch-summary { display: grid; grid-template-columns: repeat(3, 1fr); text-align: center; margin: 0 18px 20px; }
.punch-summary div + div { border-left: 1px solid var(--border); }
.punch-summary span { display: block; color: var(--text-muted); font-size: 10px; margin-bottom: 6px; }
.punch-summary strong { font-size: 13px; }
.footnote { font-size: 10px; text-align: center; color: var(--text-muted); padding: 10px 12px 16px; }
.quick-actions { display: grid; grid-template-columns: 1fr 1fr; padding: 0 18px 18px; gap: 12px; }
.quick-actions button { display: flex; flex-direction: column; align-items: flex-start; gap: 11px; position: relative; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-card-soft); color: var(--text-primary); padding: 15px; text-align: left; }
.quick-actions button:hover { border-color: var(--primary); }
.quick-actions strong { font-size: 11px; }
.quick-actions button > svg { position: absolute; top: 16px; right: 13px; color: var(--text-muted); }
.text-link { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; color: var(--primary); padding: 0; border: 0; background: transparent; }
.table-scroll { overflow-x: auto; }
.report-button { display: inline-flex; align-items: center; justify-content: center; padding: 9px 14px; border: 1px solid var(--red); border-radius: 7px; color: #fff; background: var(--red); white-space: nowrap; font: inherit; font-size: 11px; font-weight: 600; }.report-button:hover { filter: brightness(.92); }.report-button:focus-visible { outline: 2px solid var(--red); outline-offset: 3px; }
table { width: 100%; border-collapse: collapse; text-align: left; font-size: 11px; }
th { background: var(--bg-card-soft); font-size: 10px; font-weight: 500; color: var(--text-secondary); padding: 12px 18px; white-space: nowrap; }
td { padding: 15px 18px; border-top: 1px solid var(--border-soft); color: var(--text-secondary); }
td strong { color: var(--text-primary); font-weight: 600; }
td small { display: block; font-size: 10px; color: var(--text-muted); margin-top: 5px; max-width: 320px; overflow-wrap: anywhere; }
.empty-state { padding: 35px 18px; text-align: center; }
.request-attachment { display: block; max-width: 160px; margin-top: 10px; }
.request-attachment img { display: block; max-width: 100%; max-height: 100px; object-fit: contain; border: 1px solid var(--border); border-radius: 6px; }
.request-attachment small { display: flex; align-items: center; gap: 4px; color: var(--primary); }
.bulletin { display: flex; gap: 12px; margin: 0 18px; padding: 16px 0; border-top: 1px solid var(--border-soft); }
.bulletin p { font-size: 11px; margin-bottom: 10px; }
.schedule-card { padding-bottom: 20px; }
.schedule-card > h3, .schedule-card > p, .schedule-card > strong, .schedule-card > button { margin-left: 18px; margin-right: 18px; }
.schedule-card > strong { display: block; margin-top: 12px; margin-bottom: 12px; font-size: 20px; }
.schedule-card > button { margin-top: 16px; }
.form-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; padding: 5px 20px 24px; }
.full-width { grid-column: 1 / -1; }
label { display: flex; flex-direction: column; gap: 8px; font-size: 11px; font-weight: 500; }
input, textarea, select { border: 1px solid var(--border); border-radius: 7px; background: var(--bg-card); color: var(--text-primary); padding: 10px; font: inherit; font-size: 12px; min-width: 0; max-width: 100%; }
textarea { resize: vertical; }
input:focus, textarea:focus, select:focus { outline: 2px solid var(--primary); outline-offset: 2px; }
.portal-dialog { width: min(540px, calc(100% - 30px)); max-height: calc(100dvh - 40px); padding: 0; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); color: var(--text-primary); box-shadow: var(--shadow); }
.portal-dialog::backdrop { background: #05152c99; backdrop-filter: blur(3px); }
.dialog-actions { display: flex; justify-content: flex-end; gap: 10px; }
.table-scroll:focus-visible { outline: 2px solid var(--primary); outline-offset: -2px; }
@media (max-width: 1200px) { .employee-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } .employee-header { flex-wrap: wrap; } }
@media (max-width: 1000px) { .employee-grid { grid-template-columns: 1fr; } }
@media (max-width: 550px) { .employee-stats { grid-template-columns: 1fr; } .header-tools { flex-wrap: wrap; } .form-fields { grid-template-columns: 1fr; } .panel-heading { gap: 8px; } .row-actions { flex-wrap: wrap; } .date-label { font-size: 11px; } }
@media (max-width: 850px) {
  .employee-page, .employee-header > div, .panel-heading > div, .stat > div, .bulletin > div, .form-fields > *, .request-detail-grid > div { min-width: 0; }
  p, label, .footnote, .stat p, .stat small, .time-display small, .punch-summary span, .panel-heading p, .request-detail-grid dt, .request-detail-grid dd { font-size: 13px; }
  .employee-header { gap: 16px; }h1 { font-size: 24px; }.header-tools { flex-wrap: wrap; }.panel-heading { flex-wrap: wrap; }.panel-heading select { flex: 1 1 140px; }.portal-dialog .panel-heading { flex-wrap: nowrap; }
  .portal-button, .text-link { font-size: 13px; }.portal-button { min-height: 44px; }.feedback button, .dialog-close { min-width: 44px; flex-shrink: 0; }
  input, textarea, select { font-size: 16px; }
  .table-scroll table:not(.mobile-compact-table) { min-width: 620px; }.table-scroll td:first-child { min-width: 150px; max-width: 240px; overflow-wrap: anywhere; }.table-scroll .mobile-compact-table td:first-child { min-width: 0; max-width: none; }
  .request-categories { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }.request-categories button { justify-content: center; flex-wrap: wrap; gap: 5px; padding: 10px 5px; font-size: 13px; }
  .portal-dialog { width: min(540px, calc(100% - 24px)); max-height: calc(100dvh - 24px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)); overflow-y: auto; overscroll-behavior: contain; }
  .portal-dialog .panel-heading { position: sticky; top: 0; z-index: 1; background: var(--bg-card); border-bottom: 1px solid var(--border-soft); }
  .dialog-actions { display: flex; flex-wrap: wrap; }.dialog-actions .portal-button { flex: 1 1 130px; }.request-detail-grid { gap: 18px; }.view-attachment a { font-size: 13px; }
}
@media (max-width: 550px) {
  .header-tools { width: 100%; }.header-tools > .portal-button { width: 100%; }.date-label { min-height: 44px; font-size: 12px; }
  .portal-banner { align-items: flex-start; line-height: 1.6; font-size: 12px; }.portal-banner svg { margin-top: 2px; }.punch-summary { gap: 4px; margin-left: 12px; margin-right: 12px; }.punch-summary strong { font-size: 12px; }
  .form-fields { gap: 16px; padding: 16px; }.request-details { padding: 0 16px 16px; }.request-detail-grid { grid-template-columns: 1fr; }.quick-actions { padding: 0 14px 14px; gap: 10px; }.quick-actions button { padding: 13px; }.quick-actions strong { font-size: 12px; }.dialog-actions { flex-direction: column-reverse; }.dialog-actions .portal-button { flex: auto; width: 100%; }
}
@media (max-width: 850px) {
  .home-page .employee-header { align-items: center; flex-wrap: nowrap; gap: 10px; margin-bottom: 12px; }.home-page .employee-header h1, .home-page .page-description, .home-page .header-tools > .portal-button { display: none; }.home-page .greeting { margin: 0; font-size: 16px; line-height: 1.4; }.home-page .header-tools { width: auto; flex-shrink: 0; }.home-page .date-label { min-height: 0; padding: 0; border: 0; background: transparent; font-size: 10px; gap: 4px; }.home-page .date-label svg { width: 13px; }
  .home-page > .portal-banner { display: none; }.home-storage-note { display: block; margin-bottom: 12px; padding: 0 10px; border-radius: 7px; background: var(--primary-soft); color: var(--text-secondary); }.home-storage-note summary { cursor: pointer; min-height: 44px; align-content: center; font-size: 11px; }.home-storage-note p { margin: 0 0 10px; font-size: 11px; line-height: 1.6; }
  .home-page .employee-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-bottom: 10px; }.home-page .stat { position: relative; display: block; padding: 11px 12px; border-radius: 10px; }.home-page .stat > .colored-icon { position: absolute; top: 10px; right: 10px; width: 25px; height: 25px; }.home-page .stat > .colored-icon svg { width: 14px; height: 14px; }.home-page .stat p { min-height: 28px; margin: 0; padding-right: 22px; font-size: 11px; line-height: 14px; }.home-page .stat strong { font-size: 21px; line-height: 1.2; margin-top: 4px; }.home-page .stat small { margin-top: 4px; font-size: 10px; line-height: 1.4; }
  .home-page .employee-grid { gap: 10px; }.home-page .lower-panel { margin-top: 10px; }.home-page .portal-card .panel-heading { padding: 10px 12px; align-items: center; }.home-page .portal-card .panel-heading h2 { font-size: 13px; }.home-page .portal-card .panel-heading p { display: none; }.home-page .portal-card .panel-heading .text-link { min-height: 44px; font-size: 11px; }
  .home-page .attendance-overview .time-display { margin: 0 12px 10px; text-align: left; font-size: 25px; line-height: 1.3; }.home-page .attendance-overview .time-display small, .home-page .attendance-overview > .footnote { display: none; }.home-page .punch-summary { margin: 0 12px 10px; }.home-page .punch-summary span { font-size: 10px; margin-bottom: 4px; }.home-page .punch-summary strong { font-size: 12px; }.home-attendance-note { display: block; margin: 0; padding: 7px 12px; border-top: 1px solid var(--border-soft); color: var(--text-muted); font-size: 9px; }
  .home-page .quick-actions { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 7px; padding: 0 10px 10px; }.home-page .quick-actions button { align-items: center; justify-content: center; gap: 7px; padding: 10px 4px; border-radius: 8px; text-align: center; }.home-page .quick-actions .colored-icon { width: 29px; height: 29px; }.home-page .quick-actions .colored-icon svg { width: 16px; height: 16px; }.home-page .quick-actions strong { font-size: 10px; line-height: 1.4; }.home-page .quick-actions button > svg, .home-page .full-action-label { display: none; }.home-page .mobile-action-label { display: inline; }
  .home-page .requests-panel > .table-scroll, .home-page .requests-panel > .mobile-table-hint { display: none; }.home-request-list { display: block; }.home-request-list > button { display: flex; align-items: center; gap: 9px; width: 100%; padding: 10px 12px; border: 0; border-top: 1px solid var(--border-soft); background: transparent; color: var(--text-primary); text-align: left; font-family: inherit; }.home-request-copy { flex: 1; min-width: 0; }.home-request-copy strong { display: block; font-size: 12px; font-weight: 500; }.home-request-copy small { display: block; margin-top: 3px; color: var(--text-secondary); font-size: 10px; }.home-request-list .badge { font-size: 9px; }.home-request-list > button > svg { flex-shrink: 0; color: var(--text-muted); }.home-request-list > button:focus-visible { outline: 2px solid var(--primary); outline-offset: -2px; }
  .home-page .home-bulletin { display: none; }
}
@media (max-width: 850px) {
  .attendance-page .employee-header { align-items: center; flex-wrap: nowrap; gap: 10px; margin-bottom: 12px; }.attendance-page .employee-header h1 { margin: 0; font-size: 20px; }.attendance-page .page-description { display: none; }.attendance-page .header-tools { width: auto; flex-shrink: 0; }.attendance-page .date-label { min-height: 0; padding: 0; border: 0; background: transparent; font-size: 10px; gap: 4px; }.attendance-page .date-label svg { width: 13px; }.attendance-page > .portal-banner { display: none; }
  .attendance-page .employee-grid { gap: 10px; }.attendance-page .lower-panel { margin-top: 10px; }.attendance-page .portal-card .panel-heading { padding: 10px 12px; align-items: center; }.attendance-page .portal-card .panel-heading h2 { font-size: 13px; }.attendance-page .portal-card .panel-heading p { display: none; }
  .attendance-page .attendance-overview .time-display { margin: 0 12px 10px; text-align: left; font-size: 25px; line-height: 1.3; }.attendance-page .attendance-overview .time-display small, .attendance-page .attendance-overview > .footnote { display: none; }.attendance-page .punch-summary { margin: 0 12px 10px; }.attendance-page .punch-summary span { margin-bottom: 4px; font-size: 10px; }.attendance-page .punch-summary strong { font-size: 12px; }
  .attendance-page .schedule-card { padding-bottom: 10px; }.attendance-page .schedule-card .panel-heading { padding-bottom: 6px; }.attendance-page .schedule-card > h3, .attendance-page .schedule-card > strong, .attendance-page .schedule-card > p { margin-left: 12px; margin-right: 12px; }.attendance-page .schedule-card > h3 { display: inline; font-size: 11px; font-weight: 500; }.attendance-page .schedule-card > strong { display: inline; margin-left: 0; font-size: 12px; }.attendance-page .schedule-card > p { margin-top: 4px; font-size: 11px; line-height: 1.5; }
  .attendance-page .portal-card .mobile-table-hint { padding: 7px 12px; font-size: 11px; }.attendance-page .table-scroll td { padding: 10px 12px; }.attendance-page .table-scroll th { padding: 10px 12px; }.attendance-page .table-scroll td small { font-size: 11px; }.attendance-page .table-scroll table { font-size: 12px; }.attendance-page .requests-panel .panel-heading select { width: auto; flex: 0 1 140px; padding: 7px 10px; font-size: 16px; }
}
</style>
