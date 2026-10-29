
<script setup lang="ts">
import { ArrowLeft, CalendarDays, Info, Save, X } from 'lucide-vue-next'
import type { EmployeeRequest } from '~/composables/employee/useEmployeePortal'
import { employeeLeavePolicy } from '~/utils/employeeLeavePolicy'
import { employeeRequestCategory } from '~/utils/employeeRequestCategory'

useHead({ title: 'Edit Leave Request | Employee Portal — RWorkCentral' })

const route = useRoute()
const router = useRouter()

const {
  profile,
  requests,
  leaveTypesList,
  updateRequest,
  isSubmittingRequest,
  submitError,
  storageError,
} = useEmployeePortal()

const requestId = computed(() => String(route.query.id || ''))

const currentRequest = computed(() =>
  requests.value.find(request => String(request.id) === requestId.value)
)

const initializedId = ref('')
const isReady = computed(() =>
  !!currentRequest.value && initializedId.value === requestId.value
)

const canEdit = computed(() =>
  currentRequest.value?.status === 'Pending' &&
  employeeRequestCategory(currentRequest.value.type) === 'Leave'
)

const form = reactive({
  type: '',
  requestDate: '',
  start: '',
  end: '',
  reason: '',
})

const formError = ref('')
const requestImage = ref<EmployeeRequest['image']>()
const imageLoading = ref(false)

interface FormLeaveDate {
  date: string
  dayName: string
  dayType: 'whole_day' | 'half_day'
}

const leaveDates = ref<FormLeaveDate[]>([])
const selectedDates = ref<string[]>([])

const getDayName = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString('en-PH', {
    weekday: 'long',
  })

const formatDate = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const leaveOptions = computed(() => {
  const options = leaveTypesList.value?.length
    ? leaveTypesList.value.map(item => item.leave_name)
    : employeeLeavePolicy(profile.value.employmentType)
        .filter(item => item.canRequest)
        .map(item => item.name)

  if (
    currentRequest.value &&
    !options.includes(currentRequest.value.type)
  ) {
    return [currentRequest.value.type, ...options]
  }

  return options
})

// INITIALIZE THE EXISTING REQUEST
watch(
  currentRequest,
  (request) => {
    if (!request || initializedId.value === String(request.id)) return

    Object.assign(form, {
      type: request.type,
      requestDate: request.requestDate || '',
      start: request.start || '',
      end: request.end || '',
      reason: request.reason || '',
    })

    requestImage.value = request.image
      ? { ...request.image }
      : undefined

    // Load the actual saved dates, not every date in a range.
    leaveDates.value = (request.dates || [])
      .map(day => ({
        date: day.leave_date,
        dayName: getDayName(day.leave_date),
        dayType: day.day_type === 'half_day'
          ? 'half_day' as const
          : 'whole_day' as const,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    selectedDates.value = leaveDates.value.map(day => day.date)

    initializedId.value = String(request.id)
    formError.value = ''
  },
  { immediate: true }
)

// KEEP CALENDAR SELECTION AND DAY TYPES IN SYNC
const syncLeaveDates = () => {
  const existingTypes = new Map(
    leaveDates.value.map(day => [day.date, day.dayType])
  )

  const dates = [...new Set(selectedDates.value)].sort()

  leaveDates.value = dates.map(date => ({
    date,
    dayName: getDayName(date),
    dayType: existingTypes.get(date) || 'whole_day',
  }))

  form.start = dates[0] || ''
  form.end = dates[dates.length - 1] || ''
}

watch(selectedDates, syncLeaveDates, {
  deep: true,
  flush: 'sync',
})

const totalLeaveDays = computed(() =>
  leaveDates.value.reduce(
    (total, day) => total + (day.dayType === 'half_day' ? 0.5 : 1),
    0
  )
)

const leaveBreakdownText = computed(() => {
  const whole = leaveDates.value.filter(
    day => day.dayType === 'whole_day'
  ).length

  const half = leaveDates.value.filter(
    day => day.dayType === 'half_day'
  ).length

  return [
    whole ? `${whole} whole day${whole === 1 ? '' : 's'}` : '',
    half ? `${half} half day${half === 1 ? '' : 's'}` : '',
  ].filter(Boolean).join(', ') || '0 days'
})

const removeLeaveDate = (index: number) => {
  const date = leaveDates.value[index]?.date

  if (date) {
    selectedDates.value = selectedDates.value.filter(
      item => item !== date
    )
  }
}

const goBack = () =>
  router.push({
    path: '/employee/requests',
    query: { category: 'leave' },
  })

// UPDATE THE EXISTING LEAVE REQUEST
const saveRequest = async () => {
  if (isSubmittingRequest.value || imageLoading.value) return

  formError.value = ''

  const request = currentRequest.value

  if (!request || !isReady.value) {
    formError.value = 'Leave request information is unavailable.'
    return
  }

  if (!canEdit.value) {
    formError.value = 'Only pending leave requests can be edited.'
    return
  }

  if (!form.type) {
    formError.value = 'Please select a leave type.'
    return
  }

  if (!leaveDates.value.length) {
    formError.value = 'Please select at least one leave date.'
    return
  }

  if (!form.requestDate) {
    formError.value = 'Please provide the filing date.'
    return
  }

  if (!form.reason.trim()) {
    formError.value = 'Please provide a reason for your leave request.'
    return
  }

  const dates = [...leaveDates.value]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(item => ({
      leave_date: item.date,
      day_type: item.dayType,
      day_value: item.dayType === 'half_day' ? 0.5 : 1,
    }))

  const removeImage = Boolean(
    request.image && !requestImage.value
  )

  const changes = {
    type: form.type,
    start: dates[0]!.leave_date,
    end: dates[dates.length - 1]!.leave_date,
    requestDate: form.requestDate,
    reason: form.reason.trim(),
    dates,
    image: requestImage.value || (removeImage ? null : undefined),
    remove_image: removeImage,
  }

  try {
    const success = await updateRequest(request.id, { ...changes })

    if (!success) {
      formError.value =
        submitError.value || 'Unable to update this leave request.'
      return
    }

    await router.push({
      path: '/employee/requests',
      query: { category: 'leave' },
    })
  } catch (error: unknown) {
    const problem = error as {
      data?: { message?: string }
      message?: string
    }

    formError.value =
      problem?.data?.message ||
      problem?.message ||
      'Unable to update the leave request.'
  }
}
</script>

<template>
  <section class="leave-request-page">
    <header class="page-header">
      <button
        type="button"
        class="back-button"
        aria-label="Back to leave requests"
        @click="goBack"
      >
        <ArrowLeft :size="20" />
      </button>

      <div>
        <p class="eyebrow">Leave requests</p>
        <h1>Edit Leave Request</h1>
        <p class="page-description">
          Update your selected leave dates and request details.
        </p>
      </div>
    </header>

    <div v-if="!requestId" class="state-card">
      <h2>No request selected</h2>
      <p>Open a pending leave request and click Edit Request.</p>
      <button type="button" class="cancel-button" @click="goBack">
        Back to Leave Requests
      </button>
    </div>

    <div v-else-if="!isReady" class="state-card">
      <h2>Loading leave request</h2>
      <p>
        Retrieving your existing leave request.
        If it does not load, return to Leave Requests and open it again.
      </p>
      <p v-if="storageError" class="form-error">{{ storageError }}</p>
      <button type="button" class="cancel-button" @click="goBack">
        Back
      </button>
    </div>

    <div v-else-if="!canEdit" class="state-card">
      <h2>Editing unavailable</h2>
      <p>Only pending leave requests can be edited.</p>
      <button type="button" class="cancel-button" @click="goBack">
        Back to Leave Requests
      </button>
    </div>

    <form
      v-else
      class="request-form"
      novalidate
      @submit.prevent="saveRequest"
    >
      <div class="form-card">
        <div class="section-heading">
          <span class="section-icon">
            <CalendarDays :size="20" />
          </span>
          <div>
            <h2>Leave details</h2>
            <p>Update the leave type, filing date, and requested dates.</p>
            <small>Reference: {{ currentRequest?.id }}</small>
          </div>
        </div>

        <div class="form-grid">
          <label>
            <span>Leave Type</span>
            <select v-model="form.type" required>
              <option disabled value="">Select leave type</option>
              <option
                v-for="type in leaveOptions"
                :key="type"
                :value="type"
              >
                {{ type }}
              </option>
            </select>
          </label>

          <label>
            <span>Filing Date</span>
            <input v-model="form.requestDate" type="date" required />
          </label>
        </div>

        <div class="policy-note">
          <Info :size="17" />
          <span>
            Changes to leave dates and credits are subject to
            HR review and approval.
          </span>
        </div>

        <div class="calendar-field">
          <span class="field-label">Leave Period</span>

          <EmployeeLeaveDateCalendar
            v-model:start="form.start"
            v-model:end="form.end"
            v-model:selected-dates="selectedDates"
            selection-mode="multiple"
          />
        </div>

        <div v-if="leaveDates.length" class="selected-days">
          <div class="selected-days-header">
            <div>
              <h3>Selected days</h3>
              <p>{{ leaveBreakdownText }}</p>
            </div>

            <strong>
              {{ totalLeaveDays }}
              day{{ totalLeaveDays === 1 ? '' : 's' }}
            </strong>
          </div>

          <div class="day-list">
            <div
              v-for="(item, index) in leaveDates"
              :key="item.date"
              class="day-row"
            >
              <div class="day-date">
                <strong>{{ formatDate(item.date) }}</strong>
                <span>{{ item.dayName }}</span>
              </div>

              <div class="day-controls">
                <select
                  v-model="item.dayType"
                  :aria-label="`Duration for ${item.date}`"
                >
                  <option value="whole_day">
                    Whole Day (1.0)
                  </option>
                  <option value="half_day">
                    Half Day (0.5)
                  </option>
                </select>

                <button
                  v-if="leaveDates.length > 1"
                  type="button"
                  :aria-label="`Remove ${item.date}`"
                  @click="removeLeaveDate(index)"
                >
                  <X :size="17" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <label class="reason-field">
          <span>Reason / Details</span>
          <textarea
            v-model="form.reason"
            maxlength="1000"
            rows="5"
            required
            placeholder="Explain the reason for your leave request."
          />
          <small>{{ form.reason.length }}/1000</small>
        </label>

        <EmployeeRequestImageUpload
          :key="requestId"
          v-model="requestImage"
          :required="false"
          @busy="imageLoading = $event"
        />

        <p v-if="formError" class="form-error" role="alert">
          {{ formError }}
        </p>
      </div>

      <div class="action-bar">
        <button
          type="button"
          class="cancel-button"
          :disabled="isSubmittingRequest"
          @click="goBack"
        >
          Cancel
        </button>

        <button
          type="submit"
          class="submit-button"
          :disabled="isSubmittingRequest || imageLoading"
        >
          <Save :size="18" />
          {{
            isSubmittingRequest
              ? 'Updating…'
              : imageLoading
                ? 'Preparing image…'
                : 'Update Request'
          }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.leave-request-page{width:min(100%,980px);margin:0 auto;padding-bottom:24px}
.page-header{display:flex;align-items:flex-start;gap:14px;margin-bottom:18px}
.back-button{display:grid;place-items:center;flex:0 0 42px;width:42px;height:42px;padding:0;border:1px solid var(--border);border-radius:11px;background:var(--bg-card);color:var(--text-primary);cursor:pointer}
.back-button:hover{border-color:var(--primary);color:var(--primary)}
.eyebrow{margin:0 0 3px;color:var(--primary);font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
h1{margin:0;color:var(--text-primary);font-size:clamp(22px,3vw,30px);line-height:1.2}
.page-description{margin:5px 0 0;color:var(--text-secondary);font-size:13px}
.request-form{display:grid;gap:14px}
.form-card{display:grid;width:100%;min-width:0;box-sizing:border-box;gap:20px;padding:clamp(16px,3vw,26px);border:1px solid var(--border);border-radius:14px;background:var(--bg-card);box-shadow:0 14px 38px rgb(0 0 0 / 8%)}
.section-heading{display:flex;align-items:center;gap:12px;padding-bottom:17px;border-bottom:1px solid var(--border-soft)}
.section-icon{display:grid;place-items:center;flex:0 0 42px;width:42px;height:42px;border-radius:11px;background:var(--primary-soft);color:var(--primary)}
.section-heading h2,.selected-days h3,.state-card h2{margin:0;color:var(--text-primary);font-size:15px}
.section-heading p,.selected-days p,.state-card p{margin:3px 0 0;color:var(--text-secondary);font-size:11px}
.section-heading small{display:block;margin-top:5px;color:var(--text-muted);font-size:10px}
.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
label,.calendar-field{display:grid;gap:7px;min-width:0}
label>span,.field-label{color:var(--text-primary);font-size:12px;font-weight:650}
input,select,textarea{width:100%;box-sizing:border-box;border:1px solid var(--border);border-radius:9px;background:var(--bg-card-soft);color:var(--text-primary);font:inherit;font-size:13px;outline:none}
input,select{min-height:44px;padding:0 12px}
textarea{min-height:116px;padding:12px;resize:vertical}
input:focus,select:focus,textarea:focus{border-color:var(--primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 14%,transparent)}
.policy-note{display:flex;align-items:flex-start;gap:9px;padding:11px 12px;border:1px solid color-mix(in srgb,var(--primary) 24%,var(--border));border-radius:9px;background:var(--primary-soft);color:var(--text-secondary);font-size:11px;line-height:1.55}
.policy-note svg{flex:0 0 auto;color:var(--primary);margin-top:1px}
.selected-days{overflow:hidden;border:1px solid var(--border);border-radius:10px}
.selected-days-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;background:var(--bg-card-soft)}
.selected-days-header>strong{flex:0 0 auto;color:var(--primary);font-size:12px}
.day-list{display:grid}
.day-row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:11px 14px;border-top:1px solid var(--border-soft)}
.day-date{display:grid;gap:2px;min-width:0}
.day-date strong{color:var(--text-primary);font-size:12px}
.day-date span{color:var(--text-secondary);font-size:10px}
.day-controls{display:flex;align-items:center;gap:8px}
.day-controls select{min-width:160px;min-height:38px;font-size:11px}
.day-controls button{display:grid;place-items:center;width:38px;height:38px;padding:0;border:1px solid #ef444433;border-radius:8px;background:#ef444414;color:var(--red,#ef4444);cursor:pointer}
.reason-field{position:relative}
.reason-field small{position:absolute;right:10px;bottom:8px;color:var(--text-muted);font-size:10px}
.reason-field textarea{padding-bottom:28px}
.form-error{margin:0;padding:11px 13px;border:1px solid #ef444440;border-radius:9px;background:#ef444414;color:var(--red,#ef4444);font-size:12px;line-height:1.45}
.action-bar{display:flex;justify-content:flex-end;gap:10px;padding:14px;border:1px solid var(--border);border-radius:12px;background:var(--bg-card)}
.action-bar button,.state-card button{min-height:44px;padding:0 18px;border-radius:9px;font:inherit;font-size:12px;font-weight:700;cursor:pointer}
.cancel-button{border:1px solid var(--border);background:var(--bg-card-soft);color:var(--text-primary)}
.submit-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1px solid var(--primary);background:var(--primary);color:#fff}
.action-bar button:disabled{cursor:not-allowed;opacity:.6}
.state-card{display:grid;justify-items:start;gap:14px;padding:24px;border:1px solid var(--border);border-radius:12px;background:var(--bg-card)}
@media(max-width:850px){
  .leave-request-page{padding-bottom:calc(92px + env(safe-area-inset-bottom))}
  .form-grid{grid-template-columns:1fr}
  input,select,textarea{font-size:16px}
  .action-bar{position:fixed;z-index:25;right:0;bottom:calc(64px + env(safe-area-inset-bottom));left:0;padding:10px 14px;border-width:1px 0 0;border-radius:0;box-shadow:0 -8px 24px rgb(0 0 0 / 14%);backdrop-filter:blur(12px)}
  .action-bar button{min-height:48px}
  .cancel-button{flex:0 0 34%}
  .submit-button{flex:1}
}
@media(max-width:520px){
  .page-header{gap:10px;margin-bottom:14px}
  .back-button{flex-basis:40px;width:40px;height:40px}
  .page-description{font-size:12px}
  .form-card{gap:16px;padding:14px 12px;border-radius:12px}
  .section-heading{align-items:flex-start;padding-bottom:14px}
  .section-icon{flex-basis:38px;width:38px;height:38px}
  .selected-days-header,.day-row{padding:10px}
  .day-row{align-items:stretch;flex-direction:column;gap:8px}
  .day-controls{width:100%}
  .day-controls select{flex:1;min-width:0}
  .action-bar{gap:8px}
  .action-bar button{padding-inline:10px}
}
</style>
