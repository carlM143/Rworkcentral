<script setup lang="ts">
import { ArrowUpRight, CalendarDays, Clock3, Umbrella, TimerReset, WalletCards, ClipboardCheck, Plus, Download, Megaphone, X, House, Camera, CheckCircle2, LogIn } from 'lucide-vue-next'
import EmployeeWfhProofModal from '~/components/employee/EmployeeWfhProofModal.vue'
import type { EmployeeRequest } from '~/composables/employee/useEmployeePortal'
import { employeeLeavePolicy } from '~/utils/employeeLeavePolicy'
import { employeeRequestCategory } from '~/utils/employeeRequestCategory'
import { requestClock } from '~/utils/employeeRequestTime'

const props = defineProps<{ section: string }>()
const route = useRoute()
const router = useRouter()
const {
  profile,
  requests,
  punches,
  cancelRequest,
  storageError,
  wfhToday,
  isWfhActionLoading,
  timeInWfh,
  timeOutWfh,
  ensureRequests,
  fetchTimeLogs,
  fetchWfhToday,
} = useEmployeePortal()

// Dashboard data: requests load once per session; today's attendance is refreshed on every visit
onMounted(() => {
  void ensureRequests()
  void fetchTimeLogs()
  void fetchWfhToday()
})

const wfhProofModalOpen = ref(false)
const wfhActionError = ref('')
const wfhPreviewImg = ref<any>(null)

const handleWfhTimeIn = async () => {
  wfhActionError.value = ''
  const res = await timeInWfh()
  if (res.success) {
    notice.value = res.message
  } else {
    wfhActionError.value = res.message
  }
}

const openWfhTimeOutModal = () => {
  wfhActionError.value = ''
  wfhProofModalOpen.value = true
}

const handleWfhTimeOutSubmit = async (payload: { images: File[]; document: File | null }) => {
  wfhActionError.value = ''
  const res = await timeOutWfh(payload)
  if (res.success) {
    wfhProofModalOpen.value = false
    notice.value = res.message
  } else {
    wfhActionError.value = res.message
  }
}
// Payslips, Loans and Profile have their own pages (pages/employee/payslips|loans|profile)
const titles: Record<string, string> = { dashboard: 'Dashboard' }
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
const recentRequests = computed(() => [...visibleRequests.value].sort((a, b) => (b.requestDate || b.start).localeCompare(a.requestDate || a.start)))
const pending = computed(() => visibleRequests.value.filter(r => r.status === 'Pending').length)
const notice = ref(route.query.submitted === '1' ? 'Leave request submitted successfully to HR.' : '')
const viewDialog = ref<HTMLDialogElement | null>(null)
// Attendance (history, details, report) moved to pages/employee/attendance/index.vue
const viewingRequestId = ref('')
const viewedRequest = computed(() => requests.value.find(request => request.id === viewingRequestId.value))
const viewRequest = (request: EmployeeRequest) => {
  viewingRequestId.value = request.id
  viewDialog.value?.showModal()
}
const canEditRequest = (request: EmployeeRequest) => request.status === 'Pending' && ['Leave', 'Undertime', 'Overtime'].includes(employeeRequestCategory(request.type) || '')
const formatDate = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
const shortDate = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
const formatTime = (value?: string) => value ? new Date(value).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }) : '—'
const workedHours = (hours: number | undefined) => hours === undefined ? 'Not provided' : `${hours.toFixed(1)} hrs`

// Used by the dashboard "Days Logged" stat
const attendance = computed(() => Object.entries(punches.value).sort(([a], [b]) => b.localeCompare(a)))
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
// Requests are filed and edited on their own pages:
//   Leave → /employee/leave/create|edit, Overtime/Undertime → popup on their index page
const REQUEST_PAGES: Record<string, string> = { Overtime: '/employee/overtime', Undertime: '/employee/undertime' }

const openRequest = (type = 'Vacation Leave') => {
  const page = REQUEST_PAGES[type]
  void router.push(page ? { path: page, query: { new: '1' } } : '/employee/leave/create')
}

const editRequest = (request: EmployeeRequest) => {
  if (!canEditRequest(request)) return
  viewDialog.value?.close()
  const page = REQUEST_PAGES[employeeRequestCategory(request.type) ?? '']
  void router.push(page
    ? { path: page, query: { edit: String(request.rawId ?? '') } }
    : { path: '/employee/leave/edit', query: { id: String(request.rawId ?? request.id) } })
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

</script>

<template>
  <section class="employee-page" :class="{ 'home-page': section === 'dashboard' }">
    <div class="employee-header">
      <div>
        <h1>{{ titles[section] }}</h1>
        <p v-if="section === 'dashboard'" class="greeting">Welcome back, <strong>{{ profile.name.split(' ')[0] }}!</strong> 👋</p>
        <p class="page-description">{{ section === 'dashboard' ? 'Overview of your personal HR information.' : 'Your employee information, all in one place.' }}</p>
      </div>
      <div class="header-tools">
        <span class="date-label"><CalendarDays :size="16" />{{ now.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) }}</span>
        <button v-if="section === 'dashboard'" class="portal-button primary" @click="openRequest()"><Plus :size="16" />New Request</button>
      </div>
    </div>

    <div class="portal-banner"><ClipboardCheck :size="17" /><span><strong>Employee Portal.</strong> Your Leave, Overtime, and Undertime requests are directly synchronized with the HR database.</span></div>
    <details v-if="section === 'dashboard'" class="home-storage-note"><summary>Requests status</summary><p>All requests are submitted and recorded in the database for HR approval.</p></details>
    <p v-if="storageError" class="feedback error" role="alert">{{ storageError }}</p>
    <p v-if="notice" class="feedback" role="status">{{ notice }}<button aria-label="Dismiss message" @click="notice = ''"><X :size="16" /></button></p>


    <div v-if="section === 'dashboard'" class="employee-stats">
      <article v-for="stat in stats" :key="stat.label" class="portal-card stat">
        <span class="colored-icon" :class="stat.color"><component :is="stat.icon" :size="21" /></span>
        <div><p>{{ stat.label }}</p><strong>{{ stat.value }}</strong><small>{{ stat.description }}</small></div>
      </article>
    </div>

    <div v-if="section === 'dashboard'" class="employee-grid">
      <article class="portal-card attendance-overview">
        <div class="panel-heading">
          <div>
            <h2>Today's Attendance</h2>
            <p>{{ wfhToday?.has_approved_wfh ? 'Approved Work From Home Schedule' : 'Your daily time record' }}</p>
          </div>
          <span
            class="badge"
            :class="
              wfhToday?.tracker?.status === 'accepted' || currentPunch?.timeOut
                ? 'blue'
                : (wfhToday?.time_log?.time_in || currentPunch?.timeIn)
                  ? 'green'
                  : wfhToday?.has_approved_wfh
                    ? 'purple'
                    : 'orange'
            "
          >
            {{
              wfhToday?.has_approved_wfh
                ? (wfhToday?.tracker?.status === 'accepted'
                  ? 'WFH Verified'
                  : wfhToday?.time_log?.time_out
                    ? 'WFH Timed Out · Pending Verification'
                    : wfhToday?.time_log?.time_in
                      ? 'WFH Timed In'
                      : 'Approved WFH Today')
                : (currentPunch?.status || 'No record')
            }}
          </span>
        </div>

        <div class="time-display">
          {{ now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }}
          <small>{{ now.toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' }) }}</small>
        </div>

        <!-- Approved WFH Banner & Time In / Time Out Controls -->
        <div v-if="wfhToday?.has_approved_wfh" class="wfh-attendance-box">
          <div class="wfh-banner-row">
            <div class="wfh-banner-info">
              <House :size="15" />
              <div>
                <strong>{{ wfhToday.wfh?.request_no }} · Approved Work From Home</strong>
                <small>Scheduled Shift: {{ wfhToday.wfh?.schedule_time || 'Regular Shift' }}</small>
              </div>
            </div>
            <NuxtLink to="/employee/requests/work-from-home" class="wfh-banner-link">View Request →</NuxtLink>
          </div>

          <p v-if="wfhActionError" class="wfh-action-error" role="alert">{{ wfhActionError }}</p>

          <!-- Step 1: Time In Button -->
          <div v-if="!wfhToday.time_log?.time_in" class="wfh-punch-actions">
            <button
              type="button"
              class="wfh-btn wfh-btn-timein"
              :disabled="isWfhActionLoading"
              @click="handleWfhTimeIn"
            >
              <LogIn :size="17" />
              <span>{{ isWfhActionLoading ? 'Recording Time In…' : 'Time In (Work From Home)' }}</span>
            </button>
            <small class="wfh-punch-hint">Click Time In to start your approved Work From Home shift today.</small>
          </div>

          <!-- Step 2: Time Out + Attach Live Proof of Work -->
          <div v-else-if="!wfhToday.time_log?.time_out" class="wfh-punch-actions">
            <button
              type="button"
              class="wfh-btn wfh-btn-timeout"
              :disabled="isWfhActionLoading"
              @click="openWfhTimeOutModal"
            >
              <Camera :size="17" />
              <span>Time Out &amp; Picture Proof of Work</span>
            </button>
            <small class="wfh-punch-hint">
              Timing out requires taking a live photo or attaching your Proof of Work images for Admin verification.
            </small>
          </div>

          <!-- Step 3: Completed Time Out & Proof of Work Status -->
          <div v-else class="wfh-completed-box">
            <div class="wfh-completed-status" :class="wfhToday.tracker?.status || 'submitted'">
              <CheckCircle2 :size="15" />
              <span v-if="wfhToday.tracker?.status === 'accepted'">
                Verified by Admin · Counted as Complete Attendance
              </span>
              <span v-else-if="wfhToday.tracker?.status === 'returned'">
                Proof of Work Returned by Admin: {{ wfhToday.tracker?.remarks || 'Please resubmit.' }}
              </span>
              <span v-else>
                Timed Out · Proof of Work submitted and awaiting Admin verification
              </span>
            </div>

            <div v-if="wfhToday.tracker?.images?.length" class="wfh-submitted-thumbs">
              <button
                v-for="img in wfhToday.tracker.images"
                :key="img.id || img.path"
                type="button"
                class="wfh-mini-thumb"
                title="Click to enlarge proof of work"
                @click="wfhPreviewImg = img"
              >
                <img :src="img.url" :alt="img.name" />
              </button>
            </div>

            <button
              v-if="wfhToday.tracker?.status !== 'accepted'"
              type="button"
              class="wfh-btn-resubmit"
              @click="openWfhTimeOutModal"
            >
              <Camera :size="14" />
              <span>{{ wfhToday.tracker?.status === 'returned' ? 'Resubmit Live Proof of Work' : 'Add / Update Proof of Work Photos' }}</span>
            </button>
          </div>
        </div>

        <div class="punch-summary">
          <div><span>Time In</span><strong>{{ formatTime(wfhToday?.time_log?.time_in || currentPunch?.timeIn) }}</strong></div>
          <div><span>Time Out</span><strong>{{ formatTime(wfhToday?.time_log?.time_out || currentPunch?.timeOut) }}</strong></div>
          <div><span>Hours Worked</span><strong>{{ workedHours(wfhToday?.time_log?.hours_worked ?? currentPunch?.hoursWorked) }}</strong></div>
        </div>

        <p v-if="!wfhToday?.has_approved_wfh" class="footnote">
          Regular on-site attendance is recorded via the biometric system.
        </p>
      </article>
      <article v-if="section === 'dashboard'" class="portal-card quick-actions-card">
        <div class="panel-heading"><div><h2>Quick Actions</h2><p>Make a request in just a few clicks</p></div></div>
        <div class="quick-actions"><button v-for="action in quickActions" :key="action.type" :aria-label="action.label" @click="openRequest(action.type)"><span class="colored-icon" :class="action.color"><component :is="action.icon" :size="19" /></span><strong><span class="full-action-label">{{ action.label }}</span><span class="mobile-action-label">{{ action.type === 'Vacation Leave' ? 'File Leave' : action.type }}</span></strong><ArrowUpRight :size="16" /></button><NuxtLink to="/employee/requests/work-from-home" class="home-quick-link"><span class="colored-icon blue"><House :size="19" /></span><strong>Work From Home</strong><ArrowUpRight :size="16" /></NuxtLink><NuxtLink to="/employee/calendar" class="home-quick-link"><span class="colored-icon purple"><CalendarDays :size="19" /></span><strong>Calendar</strong><ArrowUpRight :size="16" /></NuxtLink></div>
      </article>
    </div>

    <div v-if="section === 'dashboard'" class="employee-grid lower-panel">
      <article class="portal-card requests-panel">
        <div class="panel-heading"><div><h2>Recent Requests</h2><p>Track your requests and their status</p></div><NuxtLink to="/employee/leave" class="text-link">View all <ArrowUpRight :size="14" /></NuxtLink></div>
        <p class="mobile-table-hint">Tap a request row for full dates, times, attachments and request actions.</p>
        <div v-if="section === 'dashboard'" class="home-request-list">
          <button v-for="request in recentRequests.slice(0, 3)" :key="request.id" type="button" :aria-label="`View request ${request.id}`" @click="viewRequest(request)"><span class="home-request-copy"><strong>{{ request.type }}</strong><small>{{ formatDate(request.start) }}</small></span><span class="badge" :class="request.status === 'Approved' ? 'green' : request.status === 'Pending' ? 'orange' : 'neutral'">{{ request.status }}</span><ArrowUpRight :size="15" aria-hidden="true" /></button>
          <p v-if="!visibleRequests.length" class="empty-state">No requests yet.</p>
        </div>
        <div class="table-scroll" role="region" aria-label="Request history" tabindex="0">
          <table class="mobile-compact-table request-table">
            <thead><tr><th scope="col">Request</th><th scope="col">Dates / Times</th><th scope="col">Status</th></tr></thead>
            <tbody>
              <tr v-for="request in recentRequests.slice(0, 4)" :key="request.id" class="record-row" @click="viewRequest(request)">
                <td>
                  <button type="button" class="row-open-button" :aria-label="`Open request ${request.id} details`" @click.stop="viewRequest(request)">{{ employeeRequestCategory(request.type) === 'Attendance Report' ? 'Attendance Report' : request.type }}</button>
                  <small class="mobile-hide">{{ request.id }}</small>
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
              </tr>
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



    <dialog ref="viewDialog" class="portal-dialog" aria-label="Request details" @close="viewingRequestId = ''">
      <template v-if="viewedRequest">
        <div class="panel-heading"><div><h2>Request Details</h2><p>{{ viewedRequest.id }} · Status: {{ viewedRequest.status }}</p></div><button type="button" class="dialog-close" aria-label="Close request details" @click="viewDialog?.close()"><X :size="18" /></button></div>
        <div class="request-details">
          <dl class="request-detail-grid">
            <div><dt>Request Type</dt><dd>{{ employeeRequestCategory(viewedRequest.type) === 'Attendance Report' ? 'Attendance Report' : viewedRequest.type }}</dd></div>
            <div><dt>Status</dt><dd><span class="badge" :class="viewedRequest.status === 'Approved' ? 'green' : viewedRequest.status === 'Pending' ? 'orange' : 'neutral'">{{ viewedRequest.status }}</span></dd></div>
            <div v-if="viewedRequest.requestDate"><dt>Date of Request</dt><dd>{{ formatDate(viewedRequest.requestDate) }}</dd></div>
            
              <!-- LEAVE REQUEST: SHOW ACTUAL SELECTED DATES -->
              <template v-if="employeeRequestCategory(viewedRequest.type) === 'Leave'">
                <div class="full-width">
                  <dt>
                    Leave Dates
                    ({{ viewedRequest.dates?.length || 0 }} Selected)
                  </dt>

                  <dd
                    v-if="viewedRequest.dates?.length"
                    class="request-leave-dates"
                  >
                    <div
                      v-for="day in [...viewedRequest.dates].sort(
                        (a, b) => a.leave_date.localeCompare(b.leave_date)
                      )"
                      :key="day.id || day.leave_date"
                      class="request-leave-date-item"
                    >
                      <div class="request-leave-date-info">
                        <strong>{{ formatDate(day.leave_date) }}</strong>
                        <small>{{ getDayName(day.leave_date) }}</small>
                      </div>

                      <span
                        class="day-type-badge"
                        :class="day.day_type === 'half_day'
                          ? 'badge-half'
                          : 'badge-whole'"
                      >
                        {{ day.day_type === 'half_day'
                          ? 'Half Day (0.5)'
                          : 'Whole Day (1.0)' }}
                      </span>
                    </div>
                  </dd>

                  <dd v-else>
                    No individual leave dates recorded.
                  </dd>
                </div>
              </template>

              <!-- OTHER REQUESTS: KEEP ORIGINAL DATE DISPLAY -->
              <template v-else>
                <div>
                  <dt>
                    {{ viewedRequest.end && viewedRequest.end !== viewedRequest.start
                      ? 'Start Date'
                      : 'Target Date' }}
                  </dt>
                  <dd>{{ formatDate(viewedRequest.start) }}</dd>
                </div>

                <div v-if="viewedRequest.end && viewedRequest.end !== viewedRequest.start">
                  <dt>End Date</dt>
                  <dd>{{ formatDate(viewedRequest.end) }}</dd>
                </div>
              </template>

            <template v-if="viewedRequest.type === 'Undertime' || viewedRequest.type === 'Overtime'">
              <div><dt>{{ viewedRequest.type }} Start Time</dt><dd>{{ requestClock(viewedRequest.timing?.startTime || viewedRequest.timing?.requestedTimeOut) }}</dd></div>
              <div><dt>{{ viewedRequest.type }} End Time</dt><dd>{{ requestClock(viewedRequest.timing?.endTime || viewedRequest.timing?.scheduledTimeOut) }}{{ viewedRequest.timing?.endsNextDay ? ' (next day)' : '' }}</dd></div>
              <div v-if="viewedRequest.type === 'Undertime'"><dt>Scheduled Time Out</dt><dd>{{ requestClock(viewedRequest.timing?.scheduledTimeOut) }}</dd></div>
              <div><dt>Requested Duration</dt><dd>{{ viewedRequest.timing ? `${viewedRequest.timing.requestedMinutes} minutes` : 'Not provided' }}</dd></div>
            </template>
            <div class="full-width"><dt>Reason / Details</dt><dd class="request-reason">{{ viewedRequest.reason }}</dd></div>
          </dl>


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

    <!-- WFH Time Out & Live Proof of Work Camera Modal -->
    <EmployeeWfhProofModal
      v-model="wfhProofModalOpen"
      :title="wfhToday?.time_log?.time_out ? 'Update WFH Proof of Work' : 'WFH Time Out & Picture Proof of Work'"
      :subtitle="`${wfhToday?.wfh?.request_no || 'Approved WFH'} · Take a live photo or attach your Proof of Work images to complete Time Out.`"
      :submit-label="wfhToday?.time_log?.time_out ? 'Submit Updated Proof of Work' : 'Submit Proof of Work & Time Out'"
      :saving="isWfhActionLoading"
      :error-message="wfhActionError"
      @submit="handleWfhTimeOutSubmit"
    />

    <!-- Employee WFH Full-Screen Image Lightbox -->
    <Teleport to="body">
      <div
        v-if="wfhPreviewImg"
        class="emp-wfh-lightbox"
        role="dialog"
        aria-modal="true"
        @click.self="wfhPreviewImg = null"
      >
        <div class="emp-wfh-lightbox-card">
          <div class="emp-wfh-lightbox-head">
            <strong>{{ wfhPreviewImg.name }}</strong>
            <button type="button" @click="wfhPreviewImg = null">
              <X :size="18" />
            </button>
          </div>
          <img :src="wfhPreviewImg.url" :alt="wfhPreviewImg.name" />
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.employee-page { max-width: 1660px; margin: 0 auto; }
.home-storage-note, .mobile-action-label, .home-request-list { display: none; }
.request-details { padding: 0 20px 20px; }.request-detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; margin: 8px 0 24px; }.request-detail-grid dt { color: var(--text-secondary); font-size: 10px; margin-bottom: 7px; }.request-detail-grid dd { margin: 0; font-size: 12px; overflow-wrap: anywhere; }.request-reason { white-space: pre-wrap; line-height: 1.7; }.view-image-link { display: block; margin-top: 12px; }.view-image-link img { display: block; max-width: 100%; max-height: 300px; margin: 0 auto; object-fit: contain; border: 1px solid var(--border); border-radius: 8px; }.view-image-link span { display: flex; align-items: center; gap: 7px; color: var(--primary); font-size: 11px; margin-top: 10px; overflow-wrap: anywhere; }
.employee-header, .header-tools, .panel-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
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
.quick-actions .home-quick-link:last-child:nth-child(odd) { grid-column: 1 / -1; width: calc((100% - 12px) / 2); justify-self: center; }
.quick-actions button, .quick-actions .home-quick-link { display: flex; flex-direction: column; align-items: flex-start; gap: 11px; position: relative; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-card-soft); color: var(--text-primary); padding: 15px; text-align: left; text-decoration: none; }
.quick-actions button:hover, .quick-actions .home-quick-link:hover { border-color: var(--primary); }
.quick-actions strong { font-size: 11px; }
.quick-actions button > svg, .quick-actions .home-quick-link > svg { position: absolute; top: 16px; right: 13px; color: var(--text-muted); }
.text-link { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; color: var(--primary); padding: 0; border: 0; background: transparent; }
.table-scroll { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; text-align: left; font-size: 11px; }
th { background: var(--bg-card-soft); font-size: 10px; font-weight: 500; color: var(--text-secondary); padding: 12px 18px; white-space: nowrap; }
td { padding: 15px 18px; border-top: 1px solid var(--border-soft); color: var(--text-secondary); }
td strong { color: var(--text-primary); font-weight: 600; }
td small { display: block; font-size: 10px; color: var(--text-muted); margin-top: 5px; max-width: 320px; overflow-wrap: anywhere; }
.empty-state { padding: 35px 18px; text-align: center; }
.bulletin { display: flex; gap: 12px; margin: 0 18px; padding: 16px 0; border-top: 1px solid var(--border-soft); }
.bulletin p { font-size: 11px; margin-bottom: 10px; }
.full-width { grid-column: 1 / -1; }
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
.portal-dialog .request-details { flex: 1 1 auto; overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; padding: 14px 18px 20px; }
.dialog-actions { display: flex; justify-content: flex-end; align-items: center; gap: 10px; padding-top: 6px; }
.dialog-actions .portal-button { min-height: 38px; height: 38px; padding: 8px 16px; font-size: 12px; font-weight: 600; border-radius: 8px; }
.table-scroll:focus-visible { outline: 2px solid var(--primary); outline-offset: -2px; }

/* Calendar Input Group */

/* Leave Dates Schedule */

/* View Dialog Dates Breakdown */
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
@media (max-width: 600px) {
  .employee-header .date-label,
  .employee-page > .portal-banner { display: none; }
}

@media (max-width: 850px) {
  .home-page .quick-actions { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .home-page .quick-actions .home-quick-link { align-items: center; justify-content: center; gap: 7px; padding: 10px 4px; border-radius: 8px; text-align: center; }
  .home-page .quick-actions .home-quick-link:last-child:nth-child(odd) { width: calc((100% - 7px) / 2); }
  .home-page .quick-actions .home-quick-link > svg { display: none; }
  .employee-page, .employee-header > div, .panel-heading > div, .stat > div, .bulletin > div, .request-detail-grid > div { min-width: 0; }
  p, label, .footnote, .stat p, .stat small, .time-display small, .punch-summary span, .panel-heading p, .request-detail-grid dt, .request-detail-grid dd { font-size: 13px; }
  .employee-header { gap: 16px; }h1 { font-size: 24px; }.header-tools { flex-wrap: wrap; }.panel-heading { flex-wrap: wrap; }.panel-heading select { flex: 1 1 140px; }.portal-dialog .panel-heading { flex-wrap: nowrap; }
  .portal-button, .text-link { font-size: 13px; }.portal-button { min-height: 44px; }.feedback button, .dialog-close { min-width: 44px; min-height: 44px; flex-shrink: 0; }
  input, textarea, select { font-size: 16px; }
  .table-scroll table:not(.mobile-compact-table) { min-width: 620px; }.table-scroll td:first-child { min-width: 150px; max-width: 240px; overflow-wrap: anywhere; }.table-scroll .mobile-compact-table td:first-child { min-width: 0; max-width: none; }
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
  .portal-dialog .request-details {
    flex: 1 1 auto;
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    padding: 12px 14px 16px;
  }
  .portal-dialog label,
  .portal-dialog label > span {
    font-size: 11px !important;
    gap: 4px;
  }
  .portal-dialog p {
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
}
@media (max-width: 440px) {
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
  .home-page .attendance-overview .time-display { margin: 0 12px 10px; text-align: left; font-size: 25px; line-height: 1.3; }.home-page .attendance-overview .time-display small, .home-page .attendance-overview > .footnote { display: none; }.home-page .punch-summary { margin: 0 12px 10px; }.home-page .punch-summary span { font-size: 10px; margin-bottom: 4px; }.home-page .punch-summary strong { font-size: 12px; }
  .home-page .quick-actions { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; padding: 0 10px 10px; }.home-page .quick-actions button { align-items: center; justify-content: center; gap: 7px; padding: 10px 4px; border-radius: 8px; text-align: center; }.home-page .quick-actions .colored-icon { width: 29px; height: 29px; }.home-page .quick-actions .colored-icon svg { width: 16px; height: 16px; }.home-page .quick-actions strong { font-size: 10px; line-height: 1.4; }.home-page .quick-actions button > svg, .home-page .full-action-label { display: none; }.home-page .mobile-action-label { display: inline; }
  .home-page .requests-panel > .table-scroll, .home-page .requests-panel > .mobile-table-hint { display: none; }.home-request-list { display: block; }.home-request-list > button { display: flex; align-items: center; gap: 9px; width: 100%; padding: 10px 12px; border: 0; border-top: 1px solid var(--border-soft); background: transparent; color: var(--text-primary); text-align: left; font-family: inherit; }.home-request-copy { flex: 1; min-width: 0; }.home-request-copy strong { display: block; font-size: 12px; font-weight: 500; }.home-request-copy small { display: block; margin-top: 3px; color: var(--text-secondary); font-size: 10px; }.home-request-list .badge { font-size: 9px; }.home-request-list > button > svg { flex-shrink: 0; color: var(--text-muted); }.home-request-list > button:focus-visible { outline: 2px solid var(--primary); outline-offset: -2px; }
  .home-page .home-bulletin { display: none; }
}



.request-leave-dates {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 8px;
}

.request-leave-date-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
}

.request-leave-date-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.request-leave-date-info strong {
  color: var(--text-primary);
  font-size: 12px;
}

.request-leave-date-info small {
  color: var(--text-muted);
  font-size: 10px;
}

@media (max-width: 520px) {
  .request-leave-dates {
    grid-template-columns: 1fr;
  }
}

/* WFH Today Attendance Controls */
.wfh-attendance-box {
  margin: 0 20px 14px;
  padding: 13px 15px;
  border-radius: 11px;
  border: 1px solid rgba(37, 99, 235, 0.3);
  background: rgba(37, 99, 235, 0.05);
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.wfh-banner-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.wfh-banner-info {
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--primary);
}

.wfh-banner-info strong {
  display: block;
  font-size: 12.5px;
  color: var(--text-primary);
}

.wfh-banner-info small {
  display: block;
  font-size: 11px;
  color: var(--text-secondary);
}

.wfh-banner-link {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--primary);
  text-decoration: none;
}

.wfh-action-error {
  margin: 0;
  padding: 8px 10px;
  border-radius: 7px;
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  font-size: 11.5px;
  font-weight: 600;
}

.wfh-punch-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.wfh-btn {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 16px;
  border-radius: 9px;
  border: none;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
  cursor: pointer;
  transition: opacity 0.15s ease, transform 0.12s ease;
}

.wfh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.wfh-btn-timein {
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
}

.wfh-btn-timeout {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.25);
}

.wfh-punch-hint {
  color: var(--text-secondary);
  font-size: 11px;
  text-align: center;
}

.wfh-completed-box {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.wfh-completed-status {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 11px;
  border-radius: 8px;
  font-size: 11.5px;
  font-weight: 600;
  background: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
}

.wfh-completed-status.accepted {
  background: rgba(16, 185, 129, 0.14);
  color: #10b981;
}

.wfh-completed-status.returned {
  background: rgba(239, 68, 68, 0.14);
  color: #ef4444;
}

.wfh-submitted-thumbs {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
}

.wfh-mini-thumb {
  width: 76px;
  height: 58px;
  padding: 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--bg-card);
  display: block;
  cursor: zoom-in;
}

.wfh-mini-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.emp-wfh-lightbox {
  position: fixed;
  inset: 0;
  z-index: 25000;
  background: rgba(8, 13, 24, 0.92);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.emp-wfh-lightbox-card {
  max-width: 90vw;
  max-height: 88vh;
  background: var(--bg-card, #111827);
  border: 1px solid var(--border, #334155);
  border-radius: 14px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
}

.emp-wfh-lightbox-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--text-primary, #f8fafc);
  font-size: 13px;
}

.emp-wfh-lightbox-head button {
  border: 1px solid var(--border, #334155);
  background: transparent;
  color: var(--text-primary, #f8fafc);
  width: 30px;
  height: 30px;
  border-radius: 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.emp-wfh-lightbox-card img {
  max-width: 86vw;
  max-height: 78vh;
  object-fit: contain;
  border-radius: 8px;
  display: block;
}

.wfh-btn-resubmit {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 11px;
  border-radius: 7px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-primary);
  font: inherit;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
}

@media (max-width: 850px) {
  .wfh-attendance-box {
    margin: 0 12px 10px;
    padding: 11px 12px;
  }
}

</style>
