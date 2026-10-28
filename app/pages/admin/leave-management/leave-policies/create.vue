
<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import LeavePolicyForm from '~/components/admin/leave/policies/LeavePolicyForm.vue'
import { useLeavePolicies } from '~/composables/admin/leave/useLeavePolicies'
import { useLeavePolicyApi } from '~/composables/admin/leave/useLeavePolicyApi'
import type { LeavePolicyPayload } from '~/types/leavePolicy'

const router = useRouter()
const { success, error: showError } = useToast()
const { createLeavePolicy } = useLeavePolicyApi()

const {
  leaveTypeOptions,
  employmentTypeOptions,
  optionsLoading,
  optionsError,
  loadOptions,
} = useLeavePolicies()

const saving = ref(false)
const pageUrl = '/admin/leave-management/leave-policies'

const getErrorMessage = (problem: any): string => {
  const data = problem?.data ?? problem?.response?._data ?? {}
  const firstError = Object.values(data.errors ?? {}).flat()[0]
  return String(firstError || data.message || problem?.message || 'Request failed.')
}

onMounted(() => {
  void loadOptions()
})

const handleBack = () => router.push(pageUrl)

const handleSave = async (payload: LeavePolicyPayload) => {
  if (saving.value) return
  saving.value = true

  try {
    const response = await createLeavePolicy(payload)

    if (response.success === false) {
      throw new Error(response.message)
    }

    success(
      'Leave Policy Created',
      response.message || 'Leave policy created successfully.',
    )

    await router.push(pageUrl)
  } catch (problem) {
    showError('Unable to Create Leave Policy', getErrorMessage(problem))
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
      title="Create Leave Policy"
      description="Configure leave eligibility, employee entitlements, carry-over rules and effective dates."
    />

    <div v-if="optionsLoading" class="page-message">
      Loading leave types and employment types...
    </div>

    <div v-else-if="optionsError" class="page-message error-message" role="alert">
      <div>
        <strong>Unable to Load Form Options</strong>
        <p>{{ optionsError }}</p>
      </div>
      <AppButton variant="secondary" @click="loadOptions">Retry</AppButton>
    </div>

    <div
      v-else-if="!leaveTypeOptions.length || !employmentTypeOptions.length"
      class="page-message"
    >
      Please create a Leave Type and ensure Employment Types are available before creating a policy.
    </div>

    <LeavePolicyForm
      v-else
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
