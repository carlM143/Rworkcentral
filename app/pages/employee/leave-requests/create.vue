<script setup lang="ts">
import { ArrowLeft, CalendarDays, Info, Send, X, Wallet, WalletCards, WandSparkles } from 'lucide-vue-next'
import type { EmployeeRequest } from '~/composables/employee/useEmployeePortal'
import { useEmployeeLeaveTypes } from '~/composables/employee/leave-types/useEmployeeLeaveTypes'

definePageMeta({ layout: false })
useHead({ title: 'New Leave Request | Employee Portal — RWorkCentral' })

type PayType = 'paid' | 'unpaid'
type PayMode = PayType | 'mixed'
interface FormLeaveDate { date: string; dayName: string; dayType: 'whole_day' | 'half_day'; payType: PayType }
interface CreditItem {
  leave_type_id: number
  leave_type: string
  leave_policy_id: number | null
  annual_credits: string | number
  available_credits: string | number
  pay: string
  status: string
}
interface CreditResponse {
  success: boolean
  message?: string
  data: { leave_year: number; leave_types: CreditItem[] }
}

const router = useRouter()
const { $api } = useNuxtApp()
const { fetchRequests } = useEmployeePortal()
const { leaveTypes, loading: loadingLeaveTypes, errorMessage: leaveTypeError, loadLeaveTypes } = useEmployeeLeaveTypes()
const localDateKey = () => {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
const today = localDateKey()
const form = reactive({ leaveTypeId: '' as number | '', requestDate: today, start: today, end: today, payMode: '' as PayMode | '', reason: '' })
const selectedDates = ref<string[]>([today])
const leaveDates = ref<FormLeaveDate[]>([])
const requestImage = ref<EmployeeRequest['image']>()
const imageLoading = ref(false)
const isSubmitting = ref(false)
const formError = ref('')
const confirmedMixed = ref(false)
const creditRows = ref<CreditItem[]>([])
const creditYear = ref(new Date().getFullYear())
const loadingCredits = ref(false)
const creditError = ref('')

const selectedType = computed(() => leaveTypes.value.find(item => item.id === Number(form.leaveTypeId)))
const credit = computed(() => creditRows.value.find(item => item.leave_type_id === Number(form.leaveTypeId) && item.pay.toLowerCase() === 'paid'))
const paidPolicyAvailable = computed(() => credit.value?.status === 'eligible' && Number(credit.value?.leave_policy_id) > 0)
const availableCredits = computed(() => paidPolicyAvailable.value ? Math.max(0, Number(credit.value?.available_credits || 0)) : 0)
const annualCredits = computed(() => paidPolicyAvailable.value ? Number(credit.value?.annual_credits || 0) : 0)
const datesWithinCreditYear = computed(() => leaveDates.value.every(item => Number(item.date.slice(0, 4)) === creditYear.value))
const getDayName = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString('en-PH', { weekday: 'long' })
const formatDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
const duration = (date: FormLeaveDate) => date.dayType === 'half_day' ? 0.5 : 1
const totalLeaveDays = computed(() => leaveDates.value.reduce((sum, date) => sum + duration(date), 0))
const totalPaidDays = computed(() => leaveDates.value.reduce((sum, date) => sum + (date.payType === 'paid' ? duration(date) : 0), 0))
const totalUnpaidDays = computed(() => totalLeaveDays.value - totalPaidDays.value)
const balanceAfterRequest = computed(() => Math.max(0, availableCredits.value - totalPaidDays.value))
const requestedPayType = computed<PayMode>(() => totalPaidDays.value && totalUnpaidDays.value ? 'mixed' : totalPaidDays.value ? 'paid' : 'unpaid')
const overCredits = computed(() => totalPaidDays.value > availableCredits.value + 0.001)
const breakdownText = computed(() => `${leaveDates.value.filter(d => d.dayType === 'whole_day').length} whole / ${leaveDates.value.filter(d => d.dayType === 'half_day').length} half days`)
const creditNotice = computed(() => {
  if (!form.leaveTypeId) return 'Select a leave type to check its paid credits.'
  if (loadingCredits.value) return 'Loading leave credits...'
  if (creditError.value) return `Unable to verify paid credits: ${creditError.value}. Unpaid requests remain available.`
  if (!paidPolicyAvailable.value) return 'No eligible paid policy was found for this leave type. You can still request unpaid leave for HR review.'
  return `Available for ${creditYear.value}: ${availableCredits.value} of ${annualCredits.value} policy days. The final balance is rechecked by HR approval.`
})

const loadCredits = async () => {
  loadingCredits.value = true
  creditError.value = ''
  try {
    const response = await $api<CreditResponse>('/employee/leave-credits', { method: 'GET' })
    if (!response.success || !Array.isArray(response.data?.leave_types)) throw new Error(response.message || 'Unexpected credit response.')
    creditRows.value = response.data.leave_types
    creditYear.value = Number(response.data.leave_year || new Date().getFullYear())
  } catch (error: unknown) {
    const err = error as { data?: { message?: string }; message?: string }
    creditRows.value = []
    creditError.value = err?.data?.message || err?.message || 'Could not retrieve credits.'
  } finally { loadingCredits.value = false }
}

onMounted(async () => { await Promise.all([loadLeaveTypes(), loadCredits()]) })
watch(() => form.leaveTypeId, () => { form.payMode = ''; confirmedMixed.value = false })
watch(() => form.payMode, mode => {
  if (mode === 'paid' || mode === 'unpaid') leaveDates.value.forEach(item => { item.payType = mode })
  confirmedMixed.value = false
})
watch(selectedDates, dates => {
  const previous = new Map(leaveDates.value.map(item => [item.date, item]))
  leaveDates.value = [...new Set(dates)].sort().map(date => ({
    date, dayName: getDayName(date),
    dayType: previous.get(date)?.dayType || 'whole_day',
    payType: previous.get(date)?.payType || (form.payMode === 'paid' ? 'paid' : 'unpaid'),
  }))
  form.start = leaveDates.value[0]?.date || ''
  form.end = leaveDates.value[leaveDates.value.length - 1]?.date || ''
  confirmedMixed.value = false
}, { immediate: true, deep: true })

const onDateChange = () => { confirmedMixed.value = false }
const removeLeaveDate = (date: string) => { selectedDates.value = selectedDates.value.filter(item => item !== date) }
const goBack = () => router.push({ path: '/employee/requests', query: { category: 'leave' } })

const suggestSplit = () => {
  formError.value = ''
  if (!selectedType.value || loadingCredits.value || creditError.value || !paidPolicyAvailable.value) {
    formError.value = 'An eligible paid policy and loaded credits are required to suggest a paid/unpaid split.'
    return
  }
  if (!datesWithinCreditYear.value) {
    formError.value = `The available credits are for ${creditYear.value}; select leave dates within that year or request unpaid leave.`
    return
  }
  let remainingUnits = Math.floor(availableCredits.value * 2 + 0.001)
  for (const item of leaveDates.value) {
    const units = Math.round(duration(item) * 2)
    item.payType = remainingUnits >= units ? 'paid' : 'unpaid'
    if (item.payType === 'paid') remainingUnits -= units
  }
  form.payMode = requestedPayType.value
  confirmedMixed.value = false
}

const validateForm = (): boolean => {
  formError.value = ''
  if (loadingLeaveTypes.value || leaveTypeError.value || !selectedType.value) { formError.value = 'Please select a valid leave type from the database.'; return false }
  if (!form.requestDate) { formError.value = 'Please select the filing date.'; return false }
  if (!form.payMode) { formError.value = 'Please choose Paid, Unpaid, or Mixed leave.'; return false }
  if (!leaveDates.value.length) { formError.value = 'Please select at least one leave date.'; return false }
  if (!form.reason.trim()) { formError.value = 'Please provide a reason.'; return false }
  if (form.payMode !== requestedPayType.value) { formError.value = 'Your payment choice does not match the dates. For Mixed, select at least one Paid and one Unpaid date.'; return false }
  if (form.payMode === 'mixed' && !confirmedMixed.value) { formError.value = 'Please confirm the paid/unpaid breakdown before submitting.'; return false }
  if (totalPaidDays.value > 0) {
    if (loadingCredits.value || creditError.value) { formError.value = 'Paid leave credits could not be verified. Refresh the credits or choose Unpaid.'; return false }
    if (!paidPolicyAvailable.value) { formError.value = 'No eligible paid leave policy is available. You can still request Unpaid leave.'; return false }
    if (!datesWithinCreditYear.value) { formError.value = `The displayed credit balance covers ${creditYear.value} only. Please select dates in that year.`; return false }
    if (overCredits.value) { formError.value = `Insufficient paid credits: ${availableCredits.value} available, ${totalPaidDays.value} requested. Use "Apply Suggested Split" or change dates to Unpaid.`; return false }
  }
  return true
}

const saveRequest = async () => {
  if (isSubmitting.value || imageLoading.value || !validateForm() || !selectedType.value) return
  isSubmitting.value = true
  try {
    const dates = leaveDates.value.map(item => ({
      leave_date: item.date, day_type: item.dayType, day_value: duration(item), requested_pay_type: item.payType,
    }))
    const response = await $api<{ success: boolean; message?: string }>('/employee/leave-requests', {
      method: 'POST',
      body: {
        leave_type_id: selectedType.value.id,
        type: selectedType.value.leave_name,
        request_date: form.requestDate,
        requested_pay_type: requestedPayType.value,
        start_date: dates[0]?.leave_date,
        end_date: dates[dates.length - 1]?.leave_date,
        reason: form.reason.trim(),
        dates,
        image: requestImage.value?.dataUrl || undefined,
      },
    })
    if (!response.success) throw new Error(response.message || 'Request was not saved.')
    await fetchRequests()
    await router.push({ path: '/employee/requests', query: { category: 'leave', submitted: '1' } })
  } catch (error: unknown) {
    const err = error as { data?: { message?: string; errors?: Record<string, string[]> }; message?: string }
    const first = Object.values(err?.data?.errors || {}).flat()[0]
    formError.value = String(first || err?.data?.message || err?.message || 'Failed to submit the leave request.')
  } finally { isSubmitting.value = false }
}
</script>

<template>
  <section class="leave-request-page">
    <header class="page-header">
      <button type="button" class="back-button" aria-label="Back to leave requests" @click="goBack"><ArrowLeft :size="20" /></button>
      <div><p class="eyebrow">Leave Requests</p><h1>New Leave Request</h1><p class="page-description">Choose the leave type, dates, and paid/unpaid breakdown.</p></div>
    </header>
    <form class="request-form" novalidate @submit.prevent="saveRequest">
      <div class="form-card">
        <div class="section-heading">
          <span class="section-icon"><CalendarDays :size="20" /></span>
          <div><h2>Leave Details</h2><p>Leave types are loaded from the company database.</p></div>
        </div>
        <div class="form-grid">
          <label>
            <span>Leave Type <em>*</em></span>
            <select v-model.number="form.leaveTypeId" :disabled="loadingLeaveTypes || !!leaveTypeError" required>
              <option value="" disabled>{{ loadingLeaveTypes ? 'Loading leave types...' : 'Select Leave Type' }}</option>
              <option v-for="type in leaveTypes" :key="type.id" :value="type.id">{{ type.leave_name }}</option>
            </select>
            <small v-if="leaveTypeError" class="form-error" role="alert">{{ leaveTypeError }}</small>
          </label>
          <label><span>Filing Date <em>*</em></span><input v-model="form.requestDate" type="date" required /></label>
        </div>

        <div class="payment-section">
          <div class="section-heading">
            <span class="section-icon"><WalletCards :size="20" /></span>
            <div><h2>Leave Payment Type</h2><p>Mixed leave supports Paid and Unpaid days in one request.</p></div>
          </div>
          <div class="payment-options" role="radiogroup" aria-label="Leave Payment Type">
            <label class="payment-option" :class="{ selected: form.payMode === 'paid' }">
              <input v-model="form.payMode" type="radio" name="leave-pay-mode" value="paid" />
              <span class="payment-option-icon"><Wallet :size="19" /></span>
              <span class="payment-option-content"><strong>Paid Leave</strong><small>All selected dates are paid, subject to credits and HR approval.</small></span>
            </label>
            <label class="payment-option" :class="{ selected: form.payMode === 'unpaid' }">
              <input v-model="form.payMode" type="radio" name="leave-pay-mode" value="unpaid" />
              <span class="payment-option-icon"><CalendarDays :size="19" /></span>
              <span class="payment-option-content"><strong>Unpaid Leave</strong><small>All dates are unpaid. No paid credits will be deducted.</small></span>
            </label>
            <label class="payment-option" :class="{ selected: form.payMode === 'mixed' }">
              <input v-model="form.payMode" type="radio" name="leave-pay-mode" value="mixed" />
              <span class="payment-option-icon"><WandSparkles :size="19" /></span>
              <span class="payment-option-content"><strong>Mixed Leave</strong><small>Choose Paid or Unpaid for every selected date.</small></span>
            </label>
          </div>
          <div class="policy-note"><Info :size="17" /><span>{{ creditNotice }}</span></div>
        </div>

        <div class="calendar-field">
          <span class="field-label">Leave Period <em>*</em></span>
          <EmployeeLeaveDateCalendar v-model:start="form.start" v-model:end="form.end" v-model:selected-dates="selectedDates" selection-mode="multiple" />
        </div>

        <div v-if="leaveDates.length" class="selected-days">
          <div class="selected-days-header">
            <div><h3>Selected Days</h3><p>{{ breakdownText }}</p></div>
            <strong>{{ totalLeaveDays }} day{{ totalLeaveDays === 1 ? '' : 's' }}</strong>
          </div>
          <div class="day-list">
            <div v-for="item in leaveDates" :key="item.date" class="day-row">
              <div class="day-date"><strong>{{ formatDate(item.date) }}</strong><span>{{ item.dayName }}</span></div>
              <div class="day-controls">
                <select v-model="item.dayType" :aria-label="`Duration for ${item.date}`" @change="onDateChange">
                  <option value="whole_day">Whole Day (1.0)</option><option value="half_day">Half Day (0.5)</option>
                </select>
                <select v-model="item.payType" :aria-label="`Payment for ${item.date}`" :disabled="form.payMode !== 'mixed'" @change="onDateChange">
                  <option value="paid">Paid</option><option value="unpaid">Unpaid</option>
                </select>
                <button v-if="leaveDates.length > 1" type="button" :aria-label="`Remove ${item.date}`" @click="removeLeaveDate(item.date)"><X :size="17" /></button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="form.payMode === 'mixed'" class="mix-help">
          <div><strong>Suggested split</strong><p>Assign Paid to the earliest dates that fit the available credits; assign the rest Unpaid. Nothing changes until you click the button.</p></div>
          <button type="button" class="suggest-button" :disabled="!selectedType || loadingCredits || !!creditError" @click="suggestSplit"><WandSparkles :size="15" /> Apply Suggested Split</button>
        </div>

        <div v-if="leaveDates.length && form.payMode" class="breakdown-panel">
          <div class="breakdown-metrics">
            <div><span>Available Credits</span><strong>{{ availableCredits }}</strong></div>
            <div><span>Paid Days</span><strong>{{ totalPaidDays }}</strong></div>
            <div><span>Unpaid Days</span><strong>{{ totalUnpaidDays }}</strong></div>
            <div><span>Balance if Approved</span><strong>{{ balanceAfterRequest }}</strong></div>
          </div>
          <p v-if="overCredits && totalPaidDays > 0" class="credit-warning">Paid days exceed the available credits. Change some dates to Unpaid.</p>
          <p class="breakdown-disclaimer">Preview only. HR will revalidate the entitlement and exact days before approval.</p>
          <label v-if="form.payMode === 'mixed'" class="mixed-confirm">
            <input v-model="confirmedMixed" type="checkbox" />
            <span>I confirm the selected Paid and Unpaid dates and understand that approved Unpaid days may affect payroll.</span>
          </label>
        </div>

        <label class="reason-field"><span>Reason / Details <em>*</em></span><textarea v-model="form.reason" maxlength="1000" rows="5" required placeholder="Explain the reason for your leave request." /><small>{{ form.reason.length }}/1000</small></label>
        <EmployeeRequestImageUpload v-model="requestImage" :required="false" @busy="imageLoading = $event" />
        <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>
      </div>
      <div class="action-bar">
        <button type="button" class="cancel-button" :disabled="isSubmitting" @click="goBack">Cancel</button>
        <button type="submit" class="submit-button" :disabled="isSubmitting || imageLoading || loadingLeaveTypes || !!leaveTypeError">
          <Send :size="18" /> {{ isSubmitting ? 'Submitting...' : imageLoading ? 'Preparing image...' : 'Submit Request' }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.leave-request-page {
  width: min(100%, 980px);
  margin: 0 auto;
  padding-bottom: 24px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 18px;
}

.back-button {
  display: grid;
  place-items: center;
  flex: 0 0 42px;
  width: 42px;
  height: 42px;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
  color: var(--text-primary);
  cursor: pointer;
}

.back-button:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.eyebrow {
  margin: 0 0 3px;
  color: var(--primary);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: clamp(22px, 3vw, 30px);
  line-height: 1.2;
}

.page-description {
  margin: 5px 0 0;
  color: var(--text-secondary);
  font-size: 13px;
}

.request-form {
  display: grid;
  gap: 14px;
}

.form-card {
  display: grid;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  gap: 20px;
  padding: clamp(16px, 3vw, 26px);
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--bg-card);
  box-shadow: 0 14px 38px rgb(0 0 0 / 8%);
}

/* SECTION HEADINGS */
.section-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 17px;
  border-bottom: 1px solid var(--border-soft);
}

.section-icon {
  display: grid;
  place-items: center;
  flex: 0 0 42px;
  width: 42px;
  height: 42px;
  border-radius: 11px;
  background: var(--primary-soft);
  color: var(--primary);
}

.section-heading h2,
.selected-days h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 15px;
}

.section-heading p,
.selected-days p {
  margin: 3px 0 0;
  color: var(--text-secondary);
  font-size: 11px;
}

/* FORM FIELDS */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

label,
.calendar-field {
  display: grid;
  gap: 7px;
  min-width: 0;
}

label > span,
.field-label {
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 650;
}

em {
  color: var(--red, #ef4444);
  font-style: normal;
}

input,
select,
textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font: inherit;
  font-size: 13px;
  outline: none;
}

input:not([type="radio"]),
select {
  min-height: 44px;
  padding: 0 12px;
}

textarea {
  min-height: 116px;
  padding: 12px;
  resize: vertical;
}

input:focus,
select:focus,
textarea:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px color-mix(
    in srgb,
    var(--primary) 14%,
    transparent
  );
}

/* PAYMENT SECTION */
.payment-section {
  display: grid;
  gap: 15px;
}

.payment-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.payment-option {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card-soft);
  cursor: pointer;
  transition:
    border-color .2s ease,
    background .2s ease;
}

.payment-option:hover {
  border-color: var(--primary);
}

.payment-option.selected {
  border-color: var(--primary);
  background: var(--primary-soft);
}

.payment-option input[type="radio"] {
  width: 17px;
  height: 17px;
  flex: 0 0 17px;
  margin: 3px 0 0;
  accent-color: var(--primary);
  cursor: pointer;
}

.payment-option:focus-within {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.payment-option-icon {
  display: grid;
  place-items: center;
  flex: 0 0 38px;
  width: 38px;
  height: 38px;
  border-radius: 9px;
  background: var(--bg-card);
  color: var(--primary);
}

.payment-option-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.payment-option-content strong {
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 700;
}

.payment-option-content small {
  color: var(--text-secondary);
  font-size: 11px;
  line-height: 1.6;
}

/* POLICY NOTE */
.policy-note {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 11px 12px;
  border: 1px solid color-mix(
    in srgb,
    var(--primary) 24%,
    var(--border)
  );
  border-radius: 9px;
  background: var(--primary-soft);
  color: var(--text-secondary);
  font-size: 11px;
  line-height: 1.55;
}

.policy-note svg {
  flex: 0 0 auto;
  color: var(--primary);
  margin-top: 1px;
}

/* SELECTED DAYS */
.selected-days {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 10px;
}

.selected-days-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  background: var(--bg-card-soft);
}

.selected-days-header > strong {
  flex: 0 0 auto;
  color: var(--primary);
  font-size: 12px;
}

.day-list {
  display: grid;
}

.day-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 11px 14px;
  border-top: 1px solid var(--border-soft);
}

.day-date {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.day-date strong {
  color: var(--text-primary);
  font-size: 12px;
}

.day-date span {
  color: var(--text-secondary);
  font-size: 10px;
}

.day-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.day-controls select {
  min-width: 160px;
  min-height: 38px;
  font-size: 11px;
}

.day-controls button {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  padding: 0;
  border: 1px solid #ef444433;
  border-radius: 8px;
  background: #ef444414;
  color: var(--red, #ef4444);
  cursor: pointer;
}

/* REASON */
.reason-field {
  position: relative;
}

.reason-field small {
  position: absolute;
  right: 10px;
  bottom: 8px;
  color: var(--text-muted);
  font-size: 10px;
}

.reason-field textarea {
  padding-bottom: 28px;
}

/* FORM ERRORS */
.form-error {
  margin: 0;
  padding: 11px 13px;
  border: 1px solid #ef444440;
  border-radius: 9px;
  background: #ef444414;
  color: var(--red, #ef4444);
  font-size: 12px;
  line-height: 1.45;
}

/* ACTION BAR */
.action-bar {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: color-mix(
    in srgb,
    var(--bg-card) 96%,
    transparent
  );
}

.action-bar button {
  min-height: 44px;
  padding: 0 18px;
  border-radius: 9px;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.cancel-button {
  border: 1px solid var(--border);
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

.submit-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid var(--primary);
  background: var(--primary);
  color: #fff;
}

.action-bar button:disabled {
  cursor: not-allowed;
  opacity: .6;
}

/* RESPONSIVE */
@media (max-width: 850px) {
  .leave-request-page {
    padding-bottom: calc(
      92px + env(safe-area-inset-bottom)
    );
  }

  .form-grid,
  .payment-options {
    grid-template-columns: 1fr;
  }

  input,
  select,
  textarea {
    font-size: 16px;
  }

  .action-bar {
    position: fixed;
    z-index: 25;
    right: 0;
    bottom: calc(
      64px + env(safe-area-inset-bottom)
    );
    left: 0;
    padding: 10px 14px;
    border-width: 1px 0 0;
    border-radius: 0;
    box-shadow: 0 -8px 24px rgb(0 0 0 / 14%);
    backdrop-filter: blur(12px);
  }

  .action-bar button {
    min-height: 48px;
  }

  .cancel-button {
    flex: 0 0 34%;
  }

  .submit-button {
    flex: 1;
  }
}

@media (max-width: 520px) {
  .page-header {
    gap: 10px;
    margin-bottom: 14px;
  }

  .back-button {
    flex-basis: 40px;
    width: 40px;
    height: 40px;
  }

  .page-description {
    font-size: 12px;
  }

  .form-card {
    gap: 16px;
    padding: 14px 12px;
    border-radius: 12px;
  }

  .section-heading {
    align-items: flex-start;
    padding-bottom: 14px;
  }

  .section-icon {
    flex-basis: 38px;
    width: 38px;
    height: 38px;
  }

  .selected-days-header,
  .day-row {
    padding: 10px;
  }

  .day-row {
    align-items: stretch;
    flex-direction: column;
    gap: 8px;
  }

  .day-controls {
    width: 100%;
  }

  .day-controls select {
    flex: 1;
    min-width: 0;
  }

  .action-bar {
    gap: 8px;
  }

  .action-bar button {
    padding-inline: 10px;
  }
}

/* Mixed leave additions */
.payment-options { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.payment-option { padding: 12px; gap: 9px; }
.payment-option-icon { width: 30px; height: 30px; flex-basis: 30px; }
.day-controls { flex-wrap: wrap; justify-content: flex-end; }
.day-controls select { min-width: 125px; max-width: 165px; }
.mix-help { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 15px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-card-soft); }
.mix-help strong { color: var(--text-primary); font-size: 12px; }
.mix-help p { margin: 5px 0 0; color: var(--text-secondary); font-size: 11px; line-height: 1.5; }
.suggest-button { display: inline-flex; align-items: center; gap: 7px; flex-shrink: 0; border: 1px solid var(--primary); border-radius: 8px; padding: 10px 12px; background: var(--primary-soft); color: var(--primary); font-size: 11px; font-weight: 700; cursor: pointer; }
.suggest-button:disabled { opacity: .5; cursor: not-allowed; }
.breakdown-panel { border: 1px solid var(--border); border-radius: 10px; padding: 14px; background: var(--bg-card-soft); }
.breakdown-metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.breakdown-metrics > div { display: grid; gap: 5px; min-width: 0; }
.breakdown-metrics span { color: var(--text-secondary); font-size: 10px; }
.breakdown-metrics strong { color: var(--text-primary); font-size: 18px; }
.breakdown-disclaimer { color: var(--text-muted); font-size: 10px; line-height: 1.5; margin: 12px 0 0; }
.credit-warning { margin: 12px 0 0; padding: 10px; border: 1px solid #ef444440; border-radius: 8px; background: #ef444414; color: var(--red, #ef4444); font-size: 11px; }
.mixed-confirm { display: flex; align-items: center; gap: 9px; margin-top: 13px; cursor: pointer; }
.mixed-confirm input { width: 16px; height: 16px; flex: 0 0 16px; accent-color: var(--primary); }
.mixed-confirm span { color: var(--text-secondary); font-size: 11px; line-height: 1.5; }
@media (max-width: 950px) { .payment-options { grid-template-columns: 1fr; } .breakdown-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); } .mix-help { align-items: stretch; flex-direction: column; } .suggest-button { align-self: flex-start; } }
@media (max-width: 520px) { .day-controls select { flex: 1; min-width: 0; max-width: none; } }
</style>
