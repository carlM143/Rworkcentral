
<script setup lang="ts">
import { ref } from 'vue'
import EmployeeLoanForm from '~/components/admin/loans/employee-loans/EmployeeLoanForm.vue'

import type {
  EmployeeLoanPayload,
} from '~/types/loans/employee-loans/employeeLoan'

definePageMeta({
  layout: 'admin',
})

const { createEmployeeLoan } = useEmployeeLoans()

const saving = ref(false)
const saveError = ref('')

const goBack = () => {
  navigateTo('/admin/loans/employee-loans')
}

const getErrorMessage = (error: unknown): string => {
  const problem = error as {
    data?: {
      message?: string
      errors?: Record<string, string[]>
    }
    message?: string
  }

  const firstError = Object.values(
    problem.data?.errors ?? {},
  ).flat()[0]

  return String(
    firstError ||
    problem.data?.message ||
    problem.message ||
    'Unable to save employee loan.',
  )
}

const saveLoan = async (payload: EmployeeLoanPayload) => {
  if (saving.value) return

  saving.value = true
  saveError.value = ''

  try {
    await createEmployeeLoan(payload)
    await navigateTo('/admin/loans/employee-loans')
  } catch (error: unknown) {
    saveError.value = getErrorMessage(error)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="employee-loan-page">
    <button class="back-link" type="button" @click="goBack">
      ← Back to Employee Loans
    </button>

    <PageHeader
      title="Add Employee Loan"
      description="Create a new employee loan and configure its scheduled deductions."
    />

    <EmployeeLoanForm
      mode="create"
      :busy="saving"
      :error="saveError"
      @submit="saveLoan"
      @cancel="goBack"
    />
  </section>
</template>

<style scoped>
.employee-loan-page {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
}

.back-link {
  display: inline-flex;
  margin-bottom: 14px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--primary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
</style>
