<script setup lang="ts">
import { ArrowUpRight, CalendarDays, Clock3, Umbrella, TimerReset, WalletCards, ClipboardCheck, Plus, Download, Megaphone, X, Info } from 'lucide-vue-next'
import EmployeeLeaveDateCalendar from '~/components/employee/EmployeeLeaveDateCalendar.vue'
import type { EmployeeRequest } from '~/composables/employee/useEmployeePortal'
import { employeeLeavePolicy } from '~/utils/employeeLeavePolicy'
import { employeeRequestCategory } from '~/utils/employeeRequestCategory'
import { overtimeDuration, undertimeDuration, requestClock } from '~/utils/employeeRequestTime'

const props = defineProps<{ section: string }>()
const route = useRoute()
const router = useRouter()
const {
  profile,
  requests,
  punches,
  addRequest,
  submitRequest: submitRequestApi,
  updateRequest,
  cancelRequest,
  leaveTypesList,
  isSubmittingRequest,
  submitError,
  storageError,
} = useEmployeePortal()
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
const form = reactive({ type: 'Vacation Leave', start: '', end: '', requestDate: '', reason: '' })
const formCategory = computed(() => employeeRequestCategory(form.type))
const reportedAttendanceDate = ref('')
const editingRequestId = ref('')
const originalRequest = computed(() => requests.value.find(request => request.id === editingRequestId.value))
const leaveFormOptions = computed(() => {
  if (leaveTypesList.value && leaveTypesList.value.length > 0) {
    return leaveTypesList.value.map(lt => lt.leave_name)
  }
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
const formatDurationText = (mins: number | null) => {
  if (mins === null || Number.isNaN(mins) || mins <= 0) return 'Enter valid times'
  const hours = Math.floor(mins / 60)
  const remainder = mins % 60
  if (hours === 0) return `${mins} min${mins === 1 ? '' : 's'}`
  if (remainder === 0) return `${hours} hr${hours === 1 ? '' : 's'} (${mins} mins)`
  return `${hours} hr${hours === 1 ? '' : 's'} ${remainder} min${remainder === 1 ? '' : 's'} (${mins} mins)`
}
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

interface FormLeaveDate {
  date: string
  dayName: string
  dayType: 'whole_day' | 'half_day'
}

const leaveDates = ref<FormLeaveDate[]>([])
const suppressLeaveDateWatcher = ref(false)

const getDayName = (dateStr: string) => {
  if (!dateStr) return ''
  const d = new Date(`${dateStr}T12:00:00`)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { weekday: 'long' })
}

const generateLeaveDates = () => {
  if (formCategory.value !== 'Leave') return
  if (!form.start) {
    leaveDates.value = []
    return
  }
  const startStr = form.start
  const endStr = form.end || form.start
  const start = new Date(`${startStr}T12:00:00`)
  let end = new Date(`${endStr}T12:00:00`)
  if (Number.isNaN(start.getTime())) return
  if (Number.isNaN(end.getTime()) || end < start) {
    end = new Date(start.getTime())
  }

  const existingMap = new Map<string, 'whole_day' | 'half_day'>()
  leaveDates.value.forEach(item => {
    existingMap.set(item.date, item.dayType)
  })

  const newDates: FormLeaveDate[] = []
  const current = new Date(start.getTime())
  let count = 0
  while (current <= end && count < 60) {
    const y = current.getFullYear()
    const m = String(current.getMonth() + 1).padStart(2, '0')
    const day = String(current.getDate()).padStart(2, '0')
    const dateFormatted = `${y}-${m}-${day}`
    const dayName = current.toLocaleDateString('en-US', { weekday: 'long' })
    const dayType = existingMap.get(dateFormatted) || 'whole_day'

    newDates.push({
      date: dateFormatted,
      dayName,
      dayType,
    })
    current.setDate(current.getDate() + 1)
    count++
  }

  leaveDates.value = newDates
}

watch([() => form.start, () => form.end, () => formCategory.value], ([newStart, newEnd, cat]) => {
  if (suppressLeaveDateWatcher.value) return
  if (cat === 'Leave' && newStart) {
    generateLeaveDates()
  }
})

const removeLeaveDate = (index: number) => {
  if (leaveDates.value.length <= 1) return
  leaveDates.value.splice(index, 1)
  if (leaveDates.value.length > 0) {
    suppressLeaveDateWatcher.value = true
    form.start = leaveDates.value[0].date
    form.end = leaveDates.value[leaveDates.value.length - 1].date
    nextTick(() => {
      suppressLeaveDateWatcher.value = false
    })
  }
}

const totalLeaveDays = computed(() => {
  return leaveDates.value.reduce((acc, curr) => acc + (curr.dayType === 'half_day' ? 0.5 : 1.0), 0)
})

const leaveBreakdownText = computed(() => {
  const wholeCount = leaveDates.value.filter(d => d.dayType === 'whole_day').length
  const halfCount = leaveDates.value.filter(d => d.dayType === 'half_day').length
  const parts: string[] = []
  if (wholeCount > 0) parts.push(`${wholeCount} whole day${wholeCount > 1 ? 's' : ''}`)
  if (halfCount > 0) parts.push(`${halfCount} half day${halfCount > 1 ? 's' : ''}`)
  return parts.join(', ') || '0 days'
})
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
  Object.assign(form, { type, start: dateKey.value, end: dateKey.value, requestDate: dateKey.value, reason: '' })
  reportedAttendanceDate.value = ''
  editingRequestId.value = ''
  Object.assign(timing, { startTime: '', endTime: '', endsNextDay: false, requestedTimeOut: '' })
  if (type === 'Undertime') timing.endTime = selectedShift.value?.end || ''
  formError.value = ''
  requestImage.value = undefined
  imageLoading.value = false
  requestFormKey.value++
  if (employeeRequestCategory(type) === 'Leave') {
    generateLeaveDates()
  } else {
    leaveDates.value = []
  }
  requestDialog.value?.showModal()
}
const editRequest = (request: EmployeeRequest) => {
  if (!canEditRequest(request)) return
  viewDialog.value?.close()
  openRequest(request.type)
  editingRequestId.value = request.id
  Object.assign(form, {
    type: request.type,
    start: request.start,
    end: request.end,
    requestDate: request.requestDate || request.start || dateKey.value,
    reason: request.reason,
  })
  Object.assign(timing, {
    startTime: request.timing?.startTime || '',
    endTime: request.timing?.endTime || (request.type === 'Undertime' ? request.timing?.scheduledTimeOut || selectedShift.value?.end || '' : ''),
    endsNextDay: request.timing?.endsNextDay || false,
    requestedTimeOut: request.timing?.requestedTimeOut || request.timing?.startTime || '',
  })
  requestImage.value = request.image ? { ...request.image } : undefined

  if (request.category === 'Leave' || employeeRequestCategory(request.type) === 'Leave') {
    suppressLeaveDateWatcher.value = true
    if (request.dates && request.dates.length > 0) {
      leaveDates.value = request.dates.map(d => ({
        date: d.leave_date,
        dayName: getDayName(d.leave_date),
        dayType: d.day_type || 'whole_day',
      }))
    } else {
      generateLeaveDates()
    }
    nextTick(() => {
      suppressLeaveDateWatcher.value = false
    })
  }
}
const reportAttendance = (date: string) => {
  attendanceDetailsOpen.value = false
  openRequest('Attendance Report')
  reportedAttendanceDate.value = date
  form.start = date
  form.end = date
  form.requestDate = date
}
const isCancelling = ref(false)
const cancelViewingRequest = async () => {
  if (!viewedRequest.value || viewedRequest.value.status !== 'Pending') return
  if (!confirm('Are you sure you want to cancel this request?')) return
  isCancelling.value = true
  const res = await cancelRequest(viewedRequest.value.id)
  isCancelling.value = false
  if (res.success) {
    notice.value = res.message || 'Request cancelled successfully.'
    viewDialog.value?.close()
  } else {
    alert(res.message || 'Failed to cancel request.')
  }
}

const submitRequest = async () => {
  if (imageLoading.value || isSubmittingRequest.value) return
  // Supporting image is optional at the moment
  if (formCategory.value === 'Attendance Report') {
    if (!reportedAttendanceDate.value || !punches.value[reportedAttendanceDate.value]) { formError.value = 'Choose an attendance record to report.'; return }
    form.start = reportedAttendanceDate.value
    form.end = reportedAttendanceDate.value
    form.requestDate = reportedAttendanceDate.value
  }
  if (!formCategory.value) { formError.value = 'Please choose Leave, Undertime, or Overtime.'; return }
  if (originalRequest.value?.type !== form.type && leaveTypesList.value?.length === 0 && employeeLeavePolicy(profile.value.employmentType).some(leave => leave.name === form.type && !leave.canRequest)) { formError.value = 'This leave type is not available under the current policy.'; return }
  if (!form.start || (!timedRequest.value && (!form.end || form.end < form.start))) { formError.value = 'Choose valid request dates. End date must be on or after the start date.'; return }
  if (formCategory.value === 'Leave' && leaveDates.value.length === 0) {
    formError.value = 'Please select at least one leave date.'
    return
  }
  if (timedRequest.value && requestedMinutes.value === null) {
    formError.value = form.type === 'Overtime' ? 'Enter valid start/end times. For overnight overtime, select Ends next day. Maximum duration is 24 hours.' : 'Choose a working day and valid undertime start/end times within the scheduled shift. End time must be later than start time.'
    return
  }
  if (!form.reason.trim()) { formError.value = 'Please provide a reason for your request.'; return }
  const requestTiming: EmployeeRequest['timing'] = !timedRequest.value ? undefined : form.type === 'Overtime'
    ? { startTime: timing.startTime, endTime: timing.endTime, endsNextDay: timing.endsNextDay, requestedMinutes: requestedMinutes.value! }
    : { startTime: timing.requestedTimeOut, endTime: timing.endTime, scheduledTimeOut: selectedShift.value?.end, requestedTimeOut: timing.requestedTimeOut, requestedMinutes: requestedMinutes.value! }

  const requestDates = formCategory.value === 'Leave'
    ? leaveDates.value.map(d => ({
        leave_date: d.date,
        day_type: d.dayType,
        day_value: d.dayType === 'half_day' ? 0.5 : 1.0,
      }))
    : undefined

  const removeImage = Boolean(editingRequestId.value && originalRequest.value?.image && !requestImage.value)

  const changes = {
    start: formCategory.value === 'Leave' && leaveDates.value[0] ? leaveDates.value[0].date : form.start,
    end: timedRequest.value ? form.start : (formCategory.value === 'Leave' && leaveDates.value[leaveDates.value.length - 1] ? leaveDates.value[leaveDates.value.length - 1].date : form.end),
    requestDate: form.requestDate || form.start,
    reason: form.reason.trim(),
    image: requestImage.value || (removeImage ? null : undefined),
    remove_image: removeImage,
    timing: requestTiming,
    dates: requestDates,
  }

  if (editingRequestId.value) {
    const success = await updateRequest(editingRequestId.value, { ...changes, type: form.type })
    if (!success) {
      formError.value = submitError.value || 'This request is no longer pending or the update failed.'
      return
    }
    notice.value = 'Request updated successfully.'
  } else {
    const res = await submitRequestApi({ ...changes, type: form.type })
    if (!res.success) {
      formError.value = res.message || submitError.value || 'Failed to submit request.'
      return
    }
    notice.value = res.message || 'Request submitted successfully to HR.'
  }

  if (formCategory.value !== 'Attendance Report') selectRequestCategory(formCategory.value!)
  requestDialog.value?.close()
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

    <div class="portal-banner"><ClipboardCheck :size="17" /><span><strong>Employee Portal.</strong> Your Leave, Overtime, and Undertime requests are directly synchronized with the HR database.</span></div>
    <details v-if="section === 'dashboard' || section === 'attendance'" class="home-storage-note"><summary>Requests status</summary><p>All requests are submitted and recorded in the database for HR approval.</p></details>
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
                </td>
                <td>
                  <span class="mobile-only">{{ shortDate(request.start) }}</span>
                  <span class="mobile-hide">
                    {{ formatDate(request.start) }}
                    <small v-if="request.end !== request.start">to {{ formatDate(request.end) }}</small>
                    <small v-if="request.dates && request.dates.length > 0 && (request.category === 'Leave' || employeeRequestCategory(request.type) === 'Leave')">
                      {{ request.total_days ?? request.dates.reduce((s, d) => s + (Number(d.day_value) || 1), 0) }} day(s) · {{ request.dates.length }} scheduled date(s)
                    </small>
                    <template v-if="request.timing">
                      <small v-if="request.type === 'Overtime'">{{ requestClock(request.timing.startTime) }} – {{ requestClock(request.timing.endTime) }}{{ request.timing.endsNextDay ? ' (next day)' : '' }}</small>
                      <small v-if="request.type === 'Undertime'">Start: {{ requestClock(request.timing.startTime || request.timing.requestedTimeOut) }}<br>End: {{ requestClock(request.timing.endTime || request.timing.scheduledTimeOut) }}</small>
                      <small>{{ request.timing.requestedMinutes }} minutes requested</small>
                    </template>
                  </span>
                </td>
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
      <dl v-if="selectedAttendance" class="record-fields">
        <div><dt>Date</dt><dd>{{ formatDate(selectedAttendanceDate) }}</dd></div>
        <div>
          <dt>Status</dt>
          <dd>
            <span class="badge" :class="attendanceStatus(selectedAttendanceDate, selectedAttendance.status) === 'On Time' ? 'green' : attendanceStatus(selectedAttendanceDate, selectedAttendance.status).includes('Late') ? 'orange' : attendanceStatus(selectedAttendanceDate, selectedAttendance.status).includes('Undertime') ? 'purple' : 'neutral'">
              {{ attendanceStatus(selectedAttendanceDate, selectedAttendance.status) }}
            </span>
          </dd>
        </div>
        <div><dt>Time In</dt><dd>{{ formatTime(selectedAttendance.timeIn) }}</dd></div>
        <div><dt>Time Out</dt><dd>{{ formatTime(selectedAttendance.timeOut) }}</dd></div>
        <div><dt>Hours Worked</dt><dd>{{ workedHours(selectedAttendance.hoursWorked) }}</dd></div>
        <div><dt>Scheduled Shift</dt><dd>{{ selectedAttendanceShift?.start ? `${requestClock(selectedAttendanceShift.start)} – ${requestClock(selectedAttendanceShift.end)}` : 'Rest day / Not provided' }}</dd></div>
        <div class="wide"><dt>Record Source</dt><dd>Frontend record; biometric service is not connected.</dd></div>
      </dl>
      <template #actions><button type="button" class="report-button" @click="reportAttendance(selectedAttendanceDate)">Report an issue</button></template>
    </EmployeeRecordDialog>

    <dialog ref="viewDialog" class="portal-dialog" aria-label="Request details" @close="viewingRequestId = ''">
      <template v-if="viewedRequest">
        <div class="panel-heading"><div><h2>Request Details</h2><p>{{ viewedRequest.id }} · Status: {{ viewedRequest.status }}</p></div><button type="button" class="dialog-close" aria-label="Close request details" @click="viewDialog?.close()"><X :size="18" /></button></div>
        <div class="request-details">
          <dl class="request-detail-grid">
            <div><dt>Request Type</dt><dd>{{ employeeRequestCategory(viewedRequest.type) === 'Attendance Report' ? 'Attendance Report' : viewedRequest.type }}</dd></div>
            <div><dt>Status</dt><dd><span class="badge" :class="viewedRequest.status === 'Approved' ? 'green' : viewedRequest.status === 'Pending' ? 'orange' : 'neutral'">{{ viewedRequest.status }}</span></dd></div>
            <div v-if="viewedRequest.requestDate"><dt>Date of Request</dt><dd>{{ formatDate(viewedRequest.requestDate) }}</dd></div>
            <div><dt>{{ employeeRequestCategory(viewedRequest.type) === 'Leave' ? 'Start Date' : (viewedRequest.end && viewedRequest.end !== viewedRequest.start ? 'Start Date' : 'Target Date') }}</dt><dd>{{ formatDate(viewedRequest.start) }}</dd></div>
            <div v-if="employeeRequestCategory(viewedRequest.type) === 'Leave' || (viewedRequest.end && viewedRequest.end !== viewedRequest.start)"><dt>End Date</dt><dd>{{ formatDate(viewedRequest.end) }}</dd></div>
            <template v-if="viewedRequest.type === 'Undertime' || viewedRequest.type === 'Overtime'">
              <div><dt>{{ viewedRequest.type }} Start Time</dt><dd>{{ requestClock(viewedRequest.timing?.startTime || viewedRequest.timing?.requestedTimeOut) }}</dd></div>
              <div><dt>{{ viewedRequest.type }} End Time</dt><dd>{{ requestClock(viewedRequest.timing?.endTime || viewedRequest.timing?.scheduledTimeOut) }}{{ viewedRequest.timing?.endsNextDay ? ' (next day)' : '' }}</dd></div>
              <div v-if="viewedRequest.type === 'Undertime'"><dt>Scheduled Time Out</dt><dd>{{ requestClock(viewedRequest.timing?.scheduledTimeOut) }}</dd></div>
              <div><dt>Requested Duration</dt><dd>{{ viewedRequest.timing ? `${viewedRequest.timing.requestedMinutes} minutes` : 'Not provided' }}</dd></div>
            </template>
            <div class="full-width"><dt>Reason / Details</dt><dd class="request-reason">{{ viewedRequest.reason }}</dd></div>
          </dl>

          <!-- Leave Dates Breakdown in View Dialog -->
          <div v-if="(viewedRequest.category === 'Leave' || employeeRequestCategory(viewedRequest.type) === 'Leave') && viewedRequest.dates && viewedRequest.dates.length > 0" class="view-leave-dates full-width">
            <h3>Scheduled Leave Days ({{ viewedRequest.total_days ?? viewedRequest.dates.reduce((acc, curr) => acc + (Number(curr.day_value) || 1), 0) }} Total Day{{ (viewedRequest.total_days ?? 1) === 1 ? '' : 's' }})</h3>
            <div class="view-dates-grid">
              <div v-for="(d, dIdx) in viewedRequest.dates" :key="d.id || d.leave_date" class="view-date-item">
                <div class="view-date-header">
                  <span class="view-date-day">Day {{ dIdx + 1 }} · {{ getDayName(d.leave_date) }}</span>
                  <span class="day-type-badge" :class="d.day_type === 'half_day' ? 'badge-half' : 'badge-whole'">
                    {{ d.day_type === 'half_day' ? 'Half Day (0.5)' : 'Whole Day (1.0)' }}
                  </span>
                </div>
                <strong class="view-date-val">{{ formatDate(d.leave_date) }}</strong>
              </div>
            </div>
          </div>

          <div class="view-attachment"><h3>Supporting Image</h3><template v-if="viewedRequest.image"><a :href="viewedRequest.image.dataUrl" :download="viewedRequest.image.name" class="view-image-link"><img :src="viewedRequest.image.dataUrl" :alt="`Supporting image for request ${viewedRequest.id}`"><span><Download :size="14" />{{ viewedRequest.image.name }}</span></a></template><p v-else>No supporting image attached.</p></div>
          <p class="footnote">Official employee request record connected to HR database.</p>
          <div class="dialog-actions view-actions">
            <button v-if="canEditRequest(viewedRequest)" type="button" class="portal-button primary" @click="editRequest(viewedRequest)">Edit Request</button>
            <button v-if="viewedRequest.status === 'Pending'" type="button" class="portal-button danger" :disabled="isCancelling" @click="cancelViewingRequest">
              {{ isCancelling ? 'Cancelling…' : 'Cancel Request' }}
            </button>
            <button type="button" class="portal-button" @click="viewDialog?.close()">Close</button>
          </div>
        </div>
      </template>
    </dialog>

    <dialog ref="requestDialog" class="portal-dialog" aria-label="New employee request" @close="formError = ''">
      <form @submit.prevent="submitRequest">
        <div class="panel-heading">
          <div><h2>{{ formCategory === 'Attendance Report' ? 'Report Attendance Issue' : `${editingRequestId ? 'Edit' : 'New'} ${formCategory} Request` }}</h2><p>Official HR Submission</p></div>
          <button type="button" class="dialog-close" aria-label="Close request form" @click="requestDialog?.close()"><X :size="18" /></button>
        </div>
        <div class="form-fields">
          <label v-if="formCategory === 'Leave'" class="full-width"><span>Leave Type</span><select v-model="form.type"><option v-for="leave in leaveFormOptions" :key="leave">{{ leave }}</option></select></label>
          <p v-if="formCategory === 'Leave' && originalRequest && !requestableLeaves.some(leave => leave.name === originalRequest?.type)" class="full-width leave-policy-warning">The existing leave type is preserved for this pending request. Its eligibility still requires HR confirmation under the current policy.</p>
          <div v-if="formCategory === 'Leave'" class="leave-policy-note full-width">
            <Info :size="14" class="note-icon" />
            <span>Leave choices follow company policy. <NuxtLink to="/employee/leave-types" @click="requestDialog?.close()">View Leave Credits</NuxtLink></span>
          </div>
          <p v-if="formCategory === 'Attendance Report'" class="full-width locked-report-date">Attendance Date: <strong>{{ formatDate(reportedAttendanceDate) }}</strong><br>This report is linked to the attendance record you selected.</p>
          <template v-else>
            <template v-if="timedRequest">
              <label class="full-width"><span>Request Date</span><input v-model="form.start" type="date" required></label>
            </template>
            <template v-else-if="formCategory === 'Leave'">
              <label class="full-width"><span>Date of Request <small class="field-hint">(Filing Date)</small></span><input v-model="form.requestDate" type="date" required></label>
              <div class="calendar-input-group full-width">
                <label class="calendar-group-label">
                  <span>Leave Schedule (Start & End Date)</span>
                </label>
                <EmployeeLeaveDateCalendar
                  v-model:start="form.start"
                  v-model:end="form.end"
                />
              </div>
            </template>
            <template v-else>
              <label class="full-width"><span>Date of Request <small class="field-hint">(Filing Date)</small></span><input v-model="form.requestDate" type="date" required></label>
              <div class="date-range-row full-width">
                <label><span>Start Date</span><input v-model="form.start" type="date" required></label>
                <label><span>End Date</span><input v-model="form.end" type="date" :min="form.start" required></label>
              </div>
            </template>
          </template>

          <!-- Per-Day Whole Day / Half Day Dropdown Selector (when Leave) -->
          <div v-if="formCategory === 'Leave' && leaveDates.length > 0" class="leave-dates-panel full-width">
            <div class="leave-dates-header">
              <div class="leave-dates-title-group">
                <div class="leave-dates-title">
                  <CalendarDays :size="15" class="cal-icon" />
                  <h4>Leave Schedule by Day</h4>
                </div>
                <p>Choose <strong>Whole Day</strong> or <strong>Half Day</strong> for each date.</p>
              </div>
              <div class="total-leave-summary">
                <span class="total-badge">Total: <strong>{{ totalLeaveDays }} day{{ totalLeaveDays === 1 ? '' : 's' }}</strong></span>
                <span class="breakdown-badge">{{ leaveBreakdownText }}</span>
              </div>
            </div>

            <div class="leave-dates-list">
              <div v-for="(item, idx) in leaveDates" :key="item.date" class="leave-date-card">
                <div class="date-meta">
                  <div class="date-meta-left">
                    <span class="day-number">#{{ idx + 1 }}</span>
                    <div class="date-labels">
                      <strong class="date-text">{{ formatDate(item.date) }}</strong>
                      <span class="weekday-pill">{{ item.dayName }}</span>
                    </div>
                  </div>
                  <button
                    v-if="leaveDates.length > 1"
                    type="button"
                    class="remove-day-btn mobile-remove-btn"
                    :title="`Remove ${item.date} from leave`"
                    :aria-label="`Remove ${item.date}`"
                    @click="removeLeaveDate(idx)"
                  >
                    <X :size="15" />
                  </button>
                </div>
                <div class="day-choice">
                  <select v-model="item.dayType" class="day-type-dropdown" :aria-label="`Select duration for ${item.date}`">
                    <option value="whole_day">Whole Day (1.0)</option>
                    <option value="half_day">Half Day (0.5)</option>
                  </select>
                  <button
                    v-if="leaveDates.length > 1"
                    type="button"
                    class="remove-day-btn desktop-remove-btn"
                    :title="`Remove ${item.date} from leave`"
                    :aria-label="`Remove ${item.date}`"
                    @click="removeLeaveDate(idx)"
                  >
                    <X :size="15" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <template v-if="form.type === 'Overtime'">
            <div class="form-row-2 full-width">
              <label><span>OT Start Time</span><input v-model="timing.startTime" type="time" required></label>
              <label><span>OT End Time</span><input v-model="timing.endTime" type="time" required></label>
            </div>
            <div class="full-width timing-extra-row">
              <label class="next-day-checkbox">
                <input v-model="timing.endsNextDay" type="checkbox">
                <span>Ends next day</span>
              </label>
            </div>
          </template>
          <template v-if="form.type === 'Undertime'">
            <div class="full-width shift-info-badge">
              <Clock3 :size="13" class="shift-icon" />
              <span>Scheduled shift: <strong>{{ requestClock(selectedShift?.start) }} – {{ requestClock(selectedShift?.end) }}</strong></span>
            </div>
            <div class="form-row-2 full-width">
              <label><span>Undertime Start Time</span><input v-model="timing.requestedTimeOut" type="time" :min="selectedShift?.start || undefined" :max="selectedShift?.end || undefined" required></label>
              <label><span>Undertime End Time</span><input v-model="timing.endTime" type="time" :min="timing.requestedTimeOut || selectedShift?.start || undefined" :max="selectedShift?.end || undefined" required></label>
            </div>
            <p v-if="!selectedShift?.start" class="full-width error">No working shift is assigned on this day. Select a working day or contact HR.</p>
          </template>
          <div v-if="timedRequest" class="full-width duration-pill">
            <Clock3 :size="13" class="duration-icon" />
            <span>Requested duration: <strong>{{ formatDurationText(requestedMinutes) }}</strong></span>
          </div>
          <label class="full-width"><span>Reason / Details</span><textarea v-model="form.reason" required maxlength="1000" rows="3" :placeholder="formCategory === 'Attendance Report' ? 'Describe what is wrong with the attendance record and the correct time or details. You can attach a supporting image below.' : 'Include the reason and any relevant times or details.'" /></label>
          <EmployeeRequestImageUpload :key="requestFormKey" v-model="requestImage" :required="false" class="full-width" @busy="imageLoading = $event" />
          <p v-if="formError" class="error full-width" role="alert">{{ formError }}</p>
          <div class="dialog-actions full-width">
            <button type="button" class="portal-button" @click="requestDialog?.close()">Cancel</button>
            <button type="submit" class="portal-button primary" :disabled="imageLoading || isSubmittingRequest">{{ isSubmittingRequest ? 'Submitting…' : imageLoading ? 'Preparing Image…' : editingRequestId ? 'Update Request' : 'Submit Request' }}</button>
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
.request-details { padding: 0 20px 20px; }.request-detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; margin: 8px 0 24px; }.request-detail-grid dt { color: var(--text-secondary); font-size: 10px; margin-bottom: 7px; }.request-detail-grid dd { margin: 0; font-size: 12px; overflow-wrap: anywhere; }.request-reason { white-space: pre-wrap; line-height: 1.7; }.view-image-link { display: block; margin-top: 12px; }.view-image-link img { display: block; max-width: 100%; max-height: 300px; margin: 0 auto; object-fit: contain; border: 1px solid var(--border); border-radius: 8px; }.view-image-link span { display: flex; align-items: center; gap: 7px; color: var(--primary); font-size: 11px; margin-top: 10px; overflow-wrap: anywhere; }
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
.portal-button.danger { color: #dc2626; border-color: #fca5a5; background: var(--bg-card); }
.portal-button.danger:hover { background: #fee2e2; border-color: #dc2626; }
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
.report-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 38px;
  min-height: 38px;
  padding: 8px 16px;
  border: 1px solid #ef444430;
  border-radius: 8px;
  color: #fff;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  white-space: nowrap;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
  cursor: pointer;
  transition: filter .15s ease;
}
.report-button:hover {
  filter: brightness(0.94);
}
.report-button:focus-visible {
  outline: 2px solid var(--red);
  outline-offset: 2px;
}
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
.form-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; padding: 6px 20px 24px; }
.full-width { grid-column: 1 / -1; }
.date-range-row, .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.date-range-row > label, .form-row-2 > label { min-width: 0; }
.timing-extra-row { display: flex; align-items: center; margin-top: -4px; }
.next-day-checkbox { display: inline-flex; flex-direction: row !important; align-items: center; gap: 8px; cursor: pointer; user-select: none; }
.next-day-checkbox input[type="checkbox"] { width: 16px !important; height: 16px !important; min-height: 16px !important; max-width: 16px !important; margin: 0 !important; padding: 0 !important; border-radius: 4px; accent-color: var(--primary); cursor: pointer; flex-shrink: 0; }
.next-day-checkbox span { font-size: 11px; color: var(--text-secondary); font-weight: 500; }
.duration-pill { display: flex; align-items: center; gap: 8px; padding: 7px 12px; border: 1px solid var(--border-soft); border-radius: 8px; background: var(--bg-card-soft); font-size: 11px; color: var(--text-secondary); line-height: 1.4; }
.duration-pill .duration-icon { color: var(--primary); flex-shrink: 0; }
.duration-pill strong { color: var(--text-primary); font-weight: 600; }
.shift-info-badge { display: flex; align-items: center; gap: 8px; padding: 7px 12px; border: 1px solid var(--border-soft); border-radius: 8px; background: var(--bg-card-soft); font-size: 11px; color: var(--text-secondary); }
.shift-info-badge .shift-icon { color: var(--purple); flex-shrink: 0; }
.shift-info-badge strong { color: var(--text-primary); font-weight: 600; }
.field-hint { font-size: 10px; color: var(--text-muted); font-weight: 400; margin-left: 4px; }
.leave-policy-note { display: flex; align-items: center; gap: 8px; padding: 9px 12px; background: var(--primary-soft); border: 1px solid #1f68f225; border-radius: 8px; font-size: 11px; color: var(--text-secondary); line-height: 1.5; }
.leave-policy-note .note-icon { color: var(--primary); flex-shrink: 0; }
.leave-policy-note a { color: var(--primary); font-weight: 600; text-decoration: underline; text-underline-offset: 2px; }
.leave-policy-warning { padding: 9px 12px; background: var(--orange-soft); color: var(--orange); border-radius: 8px; font-size: 11px; line-height: 1.5; }
label { display: flex; flex-direction: column; gap: 6px; font-size: 11px; font-weight: 500; color: var(--text-secondary); }
label > span { font-size: 11px; font-weight: 500; color: var(--text-secondary); }
input:not([type="checkbox"]):not([type="radio"]), textarea, select { border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); color: var(--text-primary); padding: 8px 11px; font: inherit; font-size: 12px; min-height: 38px; min-width: 0; max-width: 100%; box-sizing: border-box; }
textarea { resize: vertical; min-height: 72px; line-height: 1.5; }
input:focus, textarea:focus, select:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 2px var(--primary-soft); }
.portal-dialog { width: min(520px, calc(100% - 24px)); max-height: calc(100dvh - 32px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)); padding: 0; border: 1px solid var(--border); border-radius: 14px; background: var(--bg-card); color: var(--text-primary); box-shadow: 0 15px 60px #0003; overflow: hidden; }
.portal-dialog::backdrop { background: #04152d80; backdrop-filter: blur(2px); }
.portal-dialog[open] { display: flex; flex-direction: column; }
.portal-dialog form { display: flex; flex-direction: column; height: 100%; max-height: inherit; overflow: hidden; min-height: 0; }
.portal-dialog .panel-heading { flex-shrink: 0; display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 14px 18px; border-bottom: 1px solid var(--border-soft); background: var(--bg-card); }
.portal-dialog .panel-heading > div { min-width: 0; }
.portal-dialog .panel-heading h2 { margin: 0; font-size: 15px; font-weight: 600; }
.portal-dialog .panel-heading p { margin: 3px 0 0; font-size: 11px; color: var(--text-muted); overflow-wrap: anywhere; }
.portal-dialog .dialog-close { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; min-width: 34px; min-height: 34px; border: 0; border-radius: 8px; background: var(--bg-card-soft); color: var(--text-secondary); cursor: pointer; flex-shrink: 0; transition: background .15s ease, color .15s ease; }
.portal-dialog .dialog-close:hover { background: var(--border); color: var(--text-primary); }
.portal-dialog .form-fields { flex: 1 1 auto; overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; }
.portal-dialog .request-details { flex: 1 1 auto; overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; padding: 14px 18px 20px; }
.dialog-actions { display: flex; justify-content: flex-end; align-items: center; gap: 10px; padding-top: 6px; }
.dialog-actions .portal-button { min-height: 38px; height: 38px; padding: 8px 16px; font-size: 12px; font-weight: 600; border-radius: 8px; }
.table-scroll:focus-visible { outline: 2px solid var(--primary); outline-offset: -2px; }

/* Calendar Input Group */
.calendar-input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.calendar-group-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.calendar-group-label span {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
}

/* Leave Dates Schedule */
.leave-dates-panel {
  background: var(--bg-card-soft);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.leave-dates-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
}
.leave-dates-title-group {
  min-width: 0;
}
.leave-dates-title {
  display: flex;
  align-items: center;
  gap: 7px;
}
.leave-dates-title .cal-icon {
  color: var(--primary);
  flex-shrink: 0;
}
.leave-dates-title h4 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}
.leave-dates-title-group p {
  margin: 2px 0 0;
  font-size: 11px;
  color: var(--text-secondary);
}
.total-leave-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}
.total-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 11px;
  font-weight: 700;
  padding: 4px 9px;
  border-radius: 6px;
  border: 1px solid #1f68f230;
  white-space: nowrap;
}
.breakdown-badge {
  font-size: 10px;
  color: var(--text-muted);
  white-space: nowrap;
}
.leave-dates-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 240px;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  padding-right: 4px;
}
.leave-dates-list::-webkit-scrollbar {
  width: 5px;
}
.leave-dates-list::-webkit-scrollbar-track {
  background: transparent;
}
.leave-dates-list::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 4px;
}
.leave-date-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  transition: border-color .15s ease;
}
.leave-date-card:hover {
  border-color: var(--border);
}
.date-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.date-meta-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.date-labels {
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.day-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--bg-card-soft);
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 600;
}
.date-text {
  display: block;
  font-size: 12px;
  color: var(--text-primary);
  font-weight: 600;
  white-space: nowrap;
}
.weekday-pill {
  display: inline-block;
  font-size: 10px;
  color: var(--text-secondary);
  font-weight: 500;
}
.day-choice {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.day-type-dropdown {
  padding: 6px 10px;
  font-size: 11px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-primary);
  font-weight: 500;
  cursor: pointer;
}
.day-type-dropdown:focus {
  outline: 2px solid var(--primary);
  border-color: var(--primary);
}
.remove-day-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border: 0;
  background: transparent;
  color: var(--text-muted);
  border-radius: 4px;
  cursor: pointer;
  flex-shrink: 0;
}
.remove-day-btn:hover {
  color: var(--red);
  background: var(--bg-card-soft);
}
.mobile-remove-btn {
  display: none;
}
.desktop-remove-btn {
  display: inline-flex;
}

/* View Dialog Dates Breakdown */
.view-leave-dates {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--border-soft);
}
.view-leave-dates h3 {
  font-size: 12px;
  margin: 0 0 10px;
  color: var(--text-primary);
}
.view-dates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}
.view-date-item {
  padding: 8px 10px;
  background: var(--bg-card-soft);
  border: 1px solid var(--border);
  border-radius: 7px;
}
.view-date-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  margin-bottom: 4px;
}
.view-date-day {
  color: var(--text-muted);
  font-weight: 500;
}
.view-date-val {
  font-size: 12px;
  color: var(--text-primary);
}
.day-type-badge {
  display: inline-block;
  font-size: 9px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}
.badge-whole {
  background: var(--green-soft);
  color: var(--green);
}
.badge-half {
  background: var(--orange-soft);
  color: var(--orange);
}

@media (max-width: 1200px) { .employee-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } .employee-header { flex-wrap: wrap; } }
@media (max-width: 1000px) { .employee-grid { grid-template-columns: 1fr; } }
@media (max-width: 850px) {
  .employee-page, .employee-header > div, .panel-heading > div, .stat > div, .bulletin > div, .form-fields > *, .request-detail-grid > div { min-width: 0; }
  p, label, .footnote, .stat p, .stat small, .time-display small, .punch-summary span, .panel-heading p, .request-detail-grid dt, .request-detail-grid dd { font-size: 13px; }
  .employee-header { gap: 16px; }h1 { font-size: 24px; }.header-tools { flex-wrap: wrap; }.panel-heading { flex-wrap: wrap; }.panel-heading select { flex: 1 1 140px; }.portal-dialog .panel-heading { flex-wrap: nowrap; }
  .portal-button, .text-link { font-size: 13px; }.portal-button { min-height: 44px; }.feedback button, .dialog-close { min-width: 44px; min-height: 44px; flex-shrink: 0; }
  input, textarea, select { font-size: 16px; }
  .table-scroll table:not(.mobile-compact-table) { min-width: 620px; }.table-scroll td:first-child { min-width: 150px; max-width: 240px; overflow-wrap: anywhere; }.table-scroll .mobile-compact-table td:first-child { min-width: 0; max-width: none; }
  .request-categories { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }.request-categories button { justify-content: center; flex-wrap: wrap; gap: 5px; padding: 10px 5px; font-size: 13px; }
  .portal-dialog {
    width: min(540px, calc(100% - 24px));
    max-height: calc(100dvh - 24px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px));
    overflow-y: auto;
    overscroll-behavior: contain;
    border-radius: 14px;
  }
  .portal-dialog .panel-heading {
    position: sticky;
    top: 0;
    z-index: 2;
    background: var(--bg-card);
    border-bottom: 1px solid var(--border-soft);
  }
  .portal-dialog input:not([type="checkbox"]):not([type="radio"]),
  .portal-dialog textarea,
  .portal-dialog select {
    font-size: 13px !important;
    min-height: 38px !important;
    height: 38px;
    padding: 8px 11px !important;
  }
  .portal-dialog textarea {
    height: auto !important;
    min-height: 72px !important;
  }
  .portal-dialog label,
  .portal-dialog label > span {
    font-size: 11px !important;
  }
  .portal-dialog .dialog-close {
    min-width: 34px !important;
    min-height: 34px !important;
    width: 34px !important;
    height: 34px !important;
    padding: 0 !important;
  }
  .dialog-actions { display: flex; flex-wrap: wrap; }.dialog-actions .portal-button { flex: 1 1 130px; }.request-detail-grid { gap: 18px; }.view-attachment a { font-size: 13px; }
}
@media (max-width: 640px) {
  .portal-dialog {
    width: min(480px, calc(100% - 20px));
    max-height: min(90dvh, calc(100dvh - 20px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)));
    border-radius: 14px;
    margin: auto;
    overflow: hidden;
  }
  .portal-dialog[open] {
    display: flex;
    flex-direction: column;
  }
  .portal-dialog form {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: inherit;
    overflow: hidden;
  }
  .portal-dialog .panel-heading {
    flex-shrink: 0;
    padding: 12px 16px;
    background: var(--bg-card);
    border-bottom: 1px solid var(--border-soft);
  }
  .portal-dialog .panel-heading h2 {
    font-size: 14px;
  }
  .portal-dialog .panel-heading p {
    font-size: 11px;
    margin: 2px 0 0;
  }
  .portal-dialog .dialog-close {
    min-width: 34px !important;
    min-height: 34px !important;
    width: 34px !important;
    height: 34px !important;
    padding: 0;
  }
  .portal-dialog .form-fields {
    flex: 1 1 auto;
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    grid-template-columns: 1fr;
    gap: 11px;
    padding: 12px 14px 16px;
  }
  .portal-dialog .request-details {
    flex: 1 1 auto;
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    padding: 12px 14px 16px;
  }
  .portal-dialog .date-range-row,
  .portal-dialog .form-row-2 {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .portal-dialog .date-range-row > label,
  .portal-dialog .form-row-2 > label {
    min-width: 0;
  }
  .portal-dialog label,
  .portal-dialog label > span {
    font-size: 11px !important;
    gap: 4px;
  }
  .portal-dialog p,
  .portal-dialog .leave-dates-title-group p {
    font-size: 11px;
    line-height: 1.45;
  }
  .portal-dialog input:not([type="checkbox"]):not([type="radio"]),
  .portal-dialog textarea,
  .portal-dialog select {
    font-size: 13px !important;
    padding: 7px 10px !important;
    min-height: 36px !important;
    height: 36px;
    width: 100%;
    box-sizing: border-box;
  }
  .portal-dialog textarea {
    min-height: 68px !important;
    height: auto;
  }
  .portal-dialog input[type="date"],
  .portal-dialog input[type="time"] {
    min-width: 0;
  }
  .portal-dialog .leave-policy-note {
    font-size: 11px;
    padding: 7px 10px;
  }
  .portal-dialog .leave-dates-panel {
    padding: 10px;
    gap: 8px;
  }
  .portal-dialog .leave-dates-title h4 {
    font-size: 12px;
  }
  .portal-dialog .leave-date-card {
    padding: 8px;
    gap: 6px;
  }
  .portal-dialog .date-text {
    font-size: 12px;
  }
  .portal-dialog .day-type-dropdown {
    font-size: 12px;
    min-height: 34px;
    padding: 5px 8px;
  }
  .portal-dialog .dialog-actions {
    display: grid;
    grid-template-columns: 1fr 1.25fr;
    gap: 10px;
    padding-top: 4px;
    padding-bottom: max(4px, env(safe-area-inset-bottom, 0px));
  }
  .portal-dialog .dialog-actions.view-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .portal-dialog .dialog-actions .portal-button {
    width: 100%;
    height: 38px;
    min-height: 38px;
    padding: 8px 12px;
    font-size: 12px;
  }
  .portal-dialog .dialog-actions.view-actions .portal-button {
    width: auto;
    flex: 1 1 calc(50% - 4px);
  }
  .portal-dialog .request-detail-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px 10px;
    margin-bottom: 14px;
  }
  .portal-dialog .request-detail-grid dt {
    font-size: 10px;
    margin-bottom: 3px;
  }
  .portal-dialog .request-detail-grid dd {
    font-size: 12px;
    line-height: 1.35;
  }
  .portal-dialog .request-reason {
    line-height: 1.45;
  }
  .view-dates-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 8px;
  }
}
@media (max-width: 520px) {
  .leave-dates-panel {
    padding: 12px 10px;
    gap: 10px;
    border-radius: 10px;
  }
  .leave-dates-header {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  .total-leave-summary {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding-top: 6px;
    border-top: 1px dashed var(--border-soft);
  }
  .leave-date-card {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    padding: 10px 10px;
  }
  .date-meta {
    justify-content: space-between;
    width: 100%;
  }
  .mobile-remove-btn {
    display: inline-flex;
    width: 34px;
    height: 34px;
  }
  .desktop-remove-btn {
    display: none;
  }
  .day-choice {
    width: 100%;
  }
  .day-type-dropdown {
    width: 100%;
    min-height: 40px;
    font-size: 14px;
    padding: 8px 12px;
    border-radius: 7px;
  }
}
@media (max-width: 440px) {
  .date-range-row {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .request-detail-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px 10px;
    margin: 0 0 12px;
  }
  .request-detail-grid dt { margin-bottom: 3px; }
  .request-detail-grid dd { line-height: 1.35; }
}
@media (max-width: 550px) {
  .header-tools { width: 100%; }.header-tools > .portal-button { width: 100%; }.date-label { min-height: 44px; font-size: 12px; }
  .portal-banner { align-items: flex-start; line-height: 1.6; font-size: 12px; }.portal-banner svg { margin-top: 2px; }.punch-summary { gap: 4px; margin-left: 12px; margin-right: 12px; }.punch-summary strong { font-size: 12px; }
  .quick-actions { padding: 0 14px 14px; gap: 10px; }.quick-actions button { padding: 13px; }.quick-actions strong { font-size: 12px; }
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
