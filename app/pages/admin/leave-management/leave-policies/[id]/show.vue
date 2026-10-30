
<script setup lang="ts">
import {
  ArrowLeft,
  Pencil,
  BookOpen,
  Wallet,
  ShieldCheck,
  CalendarDays,
  RefreshCw,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
})

interface NamedRelation {
  id?: number
  name?: string | null
  code?: string | null
  leave_name?: string | null
  leave_type_name?: string | null
  leave_code?: string | null
  type_name?: string | null
  employment_type?: string | null
}

interface LeavePolicyRecord {
  id: number
  leave_type_id: number
  employment_type_id: number
  leave_type?: NamedRelation | null
  leaveType?: NamedRelation | null
  employment_type?: NamedRelation | null
  employmentType?: NamedRelation | null
  is_eligible: boolean | number
  is_paid: boolean | number
  annual_credits: number | string
  min_service_months: number
  allow_carry_over: boolean | number
  max_carry_over_days: number | string
  requires_approval: boolean | number
  usage_window: string | null
  validity_period: string | null
  effective_from: string | null
  effective_to: string | null
  status: string
  created_at?: string | null
  updated_at?: string | null
}

interface ApiResponse {
  success: boolean
  message: string
  data: LeavePolicyRecord
}

const route = useRoute()
const { $api } = useNuxtApp()

const policy = ref<LeavePolicyRecord | null>(null)
const loading = ref(false)
const errorMessage = ref('')

const policyId = computed(() => {
  const value = route.params.id
  return Number(Array.isArray(value) ? value[0] : value)
})

const leaveTypeName = computed(() => {
  const relation =
    policy.value?.leave_type ?? policy.value?.leaveType

  return relation?.leave_name
    || relation?.leave_type_name
    || relation?.name
    || 'Not available'
})

const leaveTypeCode = computed(() => {
  const relation =
    policy.value?.leave_type ?? policy.value?.leaveType

  return relation?.leave_code || relation?.code || '—'
})

const employmentTypeName = computed(() => {
  const relation =
    policy.value?.employment_type ?? policy.value?.employmentType

  return relation?.type_name
    || relation?.employment_type
    || relation?.name
    || 'Not available'
})

const isEnabled = (value: boolean | number): boolean =>
  value === true || value === 1

const formatDate = (value?: string | null): string => {
  if (!value) return '—'

  const date = new Date(`${value.slice(0, 10)}T00:00:00`)

  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

const formatNumber = (value: number | string): string => {
  const number = Number(value)

  if (!Number.isFinite(number)) return '—'

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(number)
}

const formatStatus = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()

const loadPolicy = async () => {
  loading.value = true
  errorMessage.value = ''
  policy.value = null

  if (!Number.isInteger(policyId.value) || policyId.value <= 0) {
    errorMessage.value = 'Invalid leave policy ID.'
    loading.value = false
    return
  }

  try {
    const response = await $api<ApiResponse>(
      `/admin/leave-policies/${policyId.value}`,
      {
        method: 'GET',
      },
    )

    if (response.success === false || !response.data) {
      throw new Error(
        response.message || 'Unable to retrieve leave policy.',
      )
    }

    policy.value = response.data
  } catch (error: any) {
    errorMessage.value =
      error?.data?.message
      || error?.response?._data?.message
      || error?.message
      || 'Unable to load leave policy information.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadPolicy()
})

watch(
  () => route.params.id,
  () => {
    void loadPolicy()
  },
)
</script>

<template>
  <section class="policy-details-page">

    <!-- BACK -->
    <NuxtLink
      to="/admin/leave-management/leave-policies"
      class="back-link"
    >
      <ArrowLeft :size="16" />
      Back to Leave Policies
    </NuxtLink>

    <!-- LOADING -->
    <div v-if="loading" class="state-card">
      <RefreshCw :size="20" class="spin" />
      <span>Loading leave policy information...</span>
    </div>

    <!-- API ERROR -->
    <div v-else-if="errorMessage" class="state-card error-state">
      <p>{{ errorMessage }}</p>

      <button type="button" @click="loadPolicy">
        <RefreshCw :size="15" />
        Retry
      </button>
    </div>

    <template v-else-if="policy">

      <!-- PAGE HEADER -->
      <header class="page-header">
        <div>
          <div class="breadcrumb">
            <BookOpen :size="14" />
            LEAVE MANAGEMENT / POLICY DETAILS
          </div>

          <h1>Leave Policy Details</h1>

          <p>
            Review employee leave eligibility, annual credits,
            entitlement rules and validity periods.
          </p>
        </div>

        <div class="header-actions">
          <span
            class="policy-status"
            :class="policy.status === 'approved' ? 'approved' : 'pending'"
          >
            <span class="status-dot" />
            {{ formatStatus(policy.status) }}
          </span>

          <NuxtLink
            :to="`/admin/leave-management/leave-policies/${policy.id}/edit`"
            class="edit-button"
          >
            <Pencil :size="15" />
            Edit Policy
          </NuxtLink>
        </div>
      </header>

      <!-- POLICY INFORMATION -->
      <article class="detail-card">
        <div class="card-heading">
          <span class="heading-icon blue">
            <BookOpen :size="19" />
          </span>

          <div>
            <h2>Policy Information</h2>
            <p>Leave category and employment classification</p>
          </div>
        </div>

        <div class="detail-grid">
          <div class="detail-field">
            <span>Leave Type</span>
            <strong>{{ leaveTypeName }}</strong>
          </div>

          <div class="detail-field">
            <span>Employment Type</span>
            <strong>{{ employmentTypeName }}</strong>
          </div>

          <div class="detail-field">
            <span>Leave Code</span>
            <strong>{{ leaveTypeCode }}</strong>
          </div>

          <div class="detail-field">
            <span>Policy ID</span>
            <strong>{{ policy.id }}</strong>
          </div>
        </div>
      </article>

      <!-- CREDITS AND ELIGIBILITY -->
      <article class="detail-card">
        <div class="card-heading">
          <span class="heading-icon green">
            <Wallet :size="19" />
          </span>

          <div>
            <h2>Leave Credits & Eligibility</h2>
            <p>Annual entitlement and employee qualification</p>
          </div>
        </div>

        <div class="detail-grid">
          <div class="detail-field">
            <span>Annual Leave Credits</span>
            <strong>
              {{ formatNumber(policy.annual_credits) }} days
            </strong>
          </div>

          <div class="detail-field">
            <span>Eligibility</span>
            <strong>
              {{ isEnabled(policy.is_eligible) ? 'Eligible' : 'Not Eligible' }}
            </strong>
          </div>

          <div class="detail-field">
            <span>Payment Classification</span>
            <strong>
              {{ isEnabled(policy.is_paid) ? 'Paid Leave' : 'Unpaid Leave' }}
            </strong>
          </div>

          <div class="detail-field">
            <span>Minimum Service Required</span>
            <strong>
              {{ policy.min_service_months }} months
            </strong>
          </div>
        </div>
      </article>

      <!-- POLICY RULES -->
      <article class="detail-card">
        <div class="card-heading">
          <span class="heading-icon purple">
            <ShieldCheck :size="19" />
          </span>

          <div>
            <h2>Policy Rules</h2>
            <p>Carry-over, approval and usage requirements</p>
          </div>
        </div>

        <div class="detail-grid">
          <div class="detail-field">
            <span>Carry Over</span>
            <strong>
              {{ isEnabled(policy.allow_carry_over) ? 'Allowed' : 'Not Allowed' }}
            </strong>
          </div>

          <div class="detail-field">
            <span>Maximum Carry-Over Credits</span>
            <strong>
              {{ formatNumber(policy.max_carry_over_days) }} days
            </strong>
          </div>

          <div class="detail-field">
            <span>Requires Approval</span>
            <strong>
              {{ isEnabled(policy.requires_approval) ? 'Required' : 'Not Required' }}
            </strong>
          </div>

          <div class="detail-field">
            <span>Usage Window</span>
            <strong>{{ policy.usage_window || '—' }}</strong>
          </div>

          <div class="detail-field">
            <span>Validity Period</span>
            <strong>{{ policy.validity_period || '—' }}</strong>
          </div>

          <div class="detail-field">
            <span>Policy Status</span>
            <strong>{{ formatStatus(policy.status) }}</strong>
          </div>
        </div>
      </article>

      <!-- EFFECTIVE DATES -->
      <article class="detail-card">
        <div class="card-heading">
          <span class="heading-icon orange">
            <CalendarDays :size="19" />
          </span>

          <div>
            <h2>Effective Dates</h2>
            <p>Policy coverage and effective period</p>
          </div>
        </div>

        <div class="detail-grid">
          <div class="detail-field">
            <span>Effective From</span>
            <strong>{{ formatDate(policy.effective_from) }}</strong>
          </div>

          <div class="detail-field">
            <span>Effective To</span>
            <strong>
              {{ policy.effective_to ? formatDate(policy.effective_to) : 'No end date' }}
            </strong>
          </div>
        </div>
      </article>

      <!-- FOOTER -->
      <div class="page-footer">
        <p>
          Policy information is retrieved from the Laravel API.
        </p>

        <NuxtLink
          to="/admin/leave-management/leave-policies"
          class="back-button"
        >
          <ArrowLeft :size="15" />
          Back to Policies
        </NuxtLink>
      </div>

    </template>
  </section>
</template>

<style scoped>
.policy-details-page {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding-bottom: 35px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 20px;
  color: var(--primary);
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 22px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 8px;
  color: var(--primary);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: .04em;
}

.page-header h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: 25px;
  font-weight: 700;
}

.page-header p {
  margin: 7px 0 0;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.policy-status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 13px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.policy-status.approved {
  background: var(--green-soft);
  color: var(--green);
}

.policy-status.pending {
  background: var(--orange-soft);
  color: var(--orange);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.edit-button,
.back-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 38px;
  padding: 9px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
}

.edit-button:hover,
.back-button:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.detail-card {
  overflow: hidden;
  margin-bottom: 15px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.card-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 17px 18px;
  border-bottom: 1px solid var(--border-soft);
}

.heading-icon {
  display: flex;
  width: 35px;
  height: 35px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
}

.heading-icon.blue {
  background: var(--primary-soft);
  color: var(--primary);
}

.heading-icon.green {
  background: var(--green-soft);
  color: var(--green);
}

.heading-icon.purple {
  background: var(--purple-soft, rgba(139,92,246,.12));
  color: var(--purple, #8b5cf6);
}

.heading-icon.orange {
  background: var(--orange-soft);
  color: var(--orange);
}

.card-heading h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 700;
}

.card-heading p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 12px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 22px;
  padding: 8px 18px 16px;
}

.detail-field {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 7px;
  min-height: 68px;
  padding: 13px 0;
  border-bottom: 1px solid var(--border-soft);
}

.detail-field > span {
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 400;
}

.detail-field strong {
  overflow-wrap: anywhere;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 550;
  line-height: 1.5;
}

.page-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 15px;
  padding: 15px 2px;
}

.page-footer p {
  margin: 0;
  color: var(--text-muted);
  font-size: 12px;
}

.state-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 160px;
  padding: 25px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 13px;
}

.error-state {
  justify-content: space-between;
  color: var(--red);
}

.error-state button {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 13px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  cursor: pointer;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 650px) {
  .page-header h1 { font-size: 22px; }
  .detail-grid { grid-template-columns: 1fr; }
  .page-footer { align-items: flex-start; }
}

@media (prefers-reduced-motion: reduce) {
  .spin { animation: none; }
}
</style>
