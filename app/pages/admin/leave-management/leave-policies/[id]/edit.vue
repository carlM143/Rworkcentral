
<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import LeavePolicyForm from '~/components/admin/leave/policies/LeavePolicyForm.vue'
import { useLeavePolicies } from '~/composables/admin/leave/useLeavePolicies'
import { useLeavePolicyApi } from '~/composables/admin/leave/useLeavePolicyApi'
import type { LeavePolicyPayload } from '~/types/leavePolicy'

const route = useRoute()
const router = useRouter()
const { success, error: showError } = useToast()

const { getLeavePolicy, updateLeavePolicy } = useLeavePolicyApi()

const {
  leaveTypeOptions,
  employmentTypeOptions,
  optionsLoading,
  optionsError,
  loadOptions,
} = useLeavePolicies()

const policyId = computed(() => Number(route.params.id))
const initialValues = ref<LeavePolicyPayload | null>(null)
const loading = ref(true)
const loadError = ref('')
const saving = ref(false)
const pageUrl = '/admin/leave-management/leave-policies'

const asBoolean = (value: boolean | number) =>
  value === true || value === 1

const dateOnly = (value?: string | null) =>
  value ? String(value).slice(0, 10) : ''

const getErrorMessage = (problem: any): string => {
  const data = problem?.data ?? problem?.response?._data ?? {}
  const firstError = Object.values(data.errors ?? {}).flat()[0]
  return String(firstError || data.message || problem?.message || 'Request failed.')
}

const loadPolicy = async () => {
  loading.value = true
  loadError.value = ''

  try {
    if (!Number.isInteger(policyId.value) || policyId.value <= 0) {
      throw new Error('Invalid Leave Policy ID.')
    }

    const response = await getLeavePolicy(policyId.value)

    if (response.success === false) throw new Error(response.message)

    const item = response.data

    initialValues.value = {
      leave_type_id: Number(item.leave_type_id),
      employment_type_id: Number(item.employment_type_id),
      is_eligible: asBoolean(item.is_eligible),
      is_paid: asBoolean(item.is_paid),
      annual_credits: Number(item.annual_credits ?? 0),
      min_service_months: Number(item.min_service_months ?? 0),
      allow_carry_over: asBoolean(item.allow_carry_over),
      max_carry_over_days: Number(item.max_carry_over_days ?? 0),
      requires_approval: asBoolean(item.requires_approval),
      usage_window: item.usage_window ?? '',
      validity_period: item.validity_period ?? '',
      effective_from: dateOnly(item.effective_from),
      effective_to: dateOnly(item.effective_to) || null,
      status: item.status === 'approved' ? 'approved' : 'pending',
    }
  } catch (problem) {
    loadError.value = getErrorMessage(problem)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadPolicy()
  void loadOptions()
})

const handleBack = () => router.push(pageUrl)

const handleSave = async (payload: LeavePolicyPayload) => {
  if (saving.value) return
  saving.value = true

  try {
    const response = await updateLeavePolicy(policyId.value, payload)

    if (response.success === false) throw new Error(response.message)

    success(
      'Leave Policy Updated',
      response.message || 'Leave policy updated successfully.',
    )

    await router.push(pageUrl)
  } catch (problem) {
    showError('Unable to Update Leave Policy', getErrorMessage(problem))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="leave-policy-page">
    <button type="button" class="back-button" @click="handleBack">
      <ArrowLeft :size="15" />
      Back to Leave Policies
    </button>

    <PageHeader
      title="Edit Leave Policy"
      description="Update the selected leave policy's eligibility, entitlements, rules and validity."
    />

    <div v-if="loading || optionsLoading" class="page-message">
      Loading leave policy information...
    </div>

    <div
      v-else-if="loadError || optionsError"
      class="page-message error-message"
      role="alert"
    >
      <div>
        <strong>Unable to Load Leave Policy</strong>
        <p>{{ loadError || optionsError }}</p>
      </div>

      <AppButton
        variant="secondary"
        @click="() => { void loadPolicy(); void loadOptions() }"
      >
        Retry
      </AppButton>
    </div>

    <LeavePolicyForm
      v-else-if="initialValues"
      :initial-values="initialValues"
      :leave-types="leaveTypeOptions"
      :employment-types="employmentTypeOptions"
      :saving="saving"
      @save="handleSave"
      @cancel="handleBack"
    />
  </section>
</template>

<style scoped>
.leave-policy-page{width:100%;max-width:1400px;margin:0 auto;padding-bottom:25px}
.back-button{display:inline-flex;align-items:center;gap:7px;margin-bottom:12px;padding:0;border:0;background:transparent;color:var(--primary);font-size:11px;font-weight:600;cursor:pointer}
.back-button:hover{color:var(--primary-dark)}
.page-message{display:flex;align-items:center;justify-content:space-between;gap:15px;min-height:85px;margin-top:16px;padding:18px;border:1px solid var(--border);border-radius:11px;background:var(--bg-card);color:var(--text-secondary);font-size:11px}
.page-message strong{color:var(--red)}
.page-message p{margin:5px 0 0;color:var(--text-muted);font-size:10px}
.error-message{border-color:var(--red)}
@media(max-width:650px){.page-message{align-items:flex-start;flex-direction:column}}
</style>
