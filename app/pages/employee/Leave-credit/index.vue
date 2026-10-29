<script setup lang="ts">
import { RefreshCw, Info } from 'lucide-vue-next'

import LeaveCreditSummary from '~/components/employee/leave-credit/LeaveCreditSummary.vue'
import LeaveCreditTable from '~/components/employee/leave-credit/LeaveCreditTable.vue'

import { useEmployeeLeaveCredits } from '~/composables/employee/leave-credit/useEmployeeLeaveCredits'

definePageMeta({
  layout: false,
})

useHead({
  title: 'Leave Credits | Employee Portal',
})

const {
  creditData,
  leaveTypes,
  loading,
  errorMessage,
  loadCredits,
} = useEmployeeLeaveCredits()

onMounted(() => {
  void loadCredits()
})
</script>

<template>
  <section class="leave-credits-page">
    <div class="page-header">
      <div>
        <h1>Leave Credits</h1>
        <p>
          View your annual leave entitlements and eligibility
          based on company policies.
        </p>
      </div>

      <button
        type="button"
        class="refresh-button"
        :disabled="loading"
        @click="loadCredits"
      >
        <RefreshCw :size="15" />
        Refresh
      </button>
    </div>

    <LeaveCreditSummary
      v-if="creditData"
      :employee-name="creditData.employee_name"
      :employment-type="creditData.employment_type"
      :months-of-service="creditData.months_of_service"
    />

    <div class="info-note">
      <Info :size="17" />
      <span>
        Leave entitlements are determined by applicable HR policies.
        Statutory benefits may require separate eligibility verification.
      </span>
    </div>

    <div v-if="loading" class="state-message">
      Loading leave credits...
    </div>

    <div
      v-else-if="errorMessage"
      class="state-message error-message"
      role="alert"
    >
      <strong>Unable to Load Leave Credits</strong>
      <p>{{ errorMessage }}</p>

      <button
        type="button"
        class="retry-button"
        @click="loadCredits"
      >
        Try Again
      </button>
    </div>

    <LeaveCreditTable
      v-else-if="creditData"
      :rows="leaveTypes"
    />
  </section>
</template>

<style scoped>
.leave-credits-page {
  width: 100%;
  max-width: 1660px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 700;
}

.page-header p {
  margin: 6px 0 0;
  color: var(--text-secondary);
  font-size: 12px;
}

.refresh-button,
.retry-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 38px;
  padding: 8px 13px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.refresh-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.info-note {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 16px;
  padding: 13px 15px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--primary-soft);
  color: var(--text-secondary);
  font-size: 11px;
  line-height: 1.6;
}

.info-note svg {
  flex-shrink: 0;
  color: var(--primary);
}

.state-message {
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 12px;
}

.error-message {
  color: var(--red);
}

.error-message p {
  margin: 7px 0 12px;
  font-size: 11px;
}

@media (max-width: 650px) {
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
