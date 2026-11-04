
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import EmployeeLoanForm from '~/components/admin/loans/employee-loans/EmployeeLoanForm.vue'

import type {
  EmployeeLoan,
  EmployeeLoanPayload,
} from '~/types/loans/employee-loans/employeeLoan'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()

const {
  getEmployeeLoan,
  updateEmployeeLoan,
} = useEmployeeLoans()

const loanId = computed(() => Number(route.query.id))

const loan = ref<EmployeeLoan | null>(null)
const loading = ref(true)
const saving = ref(false)
const loadError = ref('')
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
    'Request failed.',
  )
}

const initialForm = computed<EmployeeLoanPayload | undefined>(() => {
  if (!loan.value) return undefined

  return {
    employee_id: loan.value.employee_id,
    loan_type_id: loan.value.loan_type_id,
    loan_reference_no: loan.value.loan_reference_no,

    principal_amount: Number(loan.value.principal_amount),
    total_payable_amount: Number(loan.value.total_payable_amount),
    deduction_amount: Number(loan.value.deduction_amount),

    loan_date: loan.value.loan_date ?? '',
    deduction_start_date: loan.value.deduction_start_date ?? '',

    remarks: loan.value.remarks,
    status: loan.value.status,
  }
})

const loadLoan = async () => {
  loading.value = true
  loadError.value = ''

  try {
    if (!Number.isInteger(loanId.value) || loanId.value <= 0) {
      throw new Error('Invalid employee loan ID.')
    }

    loan.value = await getEmployeeLoan(loanId.value)
  } catch (error: unknown) {
    loadError.value = getErrorMessage(error)
  } finally {
    loading.value = false
  }
}

const updateLoan = async (payload: EmployeeLoanPayload) => {
  if (saving.value || !loan.value) return

  saving.value = true
  saveError.value = ''

  try {
    await updateEmployeeLoan(loan.value.id, payload)
    await navigateTo('/admin/loans/employee-loans')
  } catch (error: unknown) {
    saveError.value = getErrorMessage(error)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  void loadLoan()
})
</script>

<template>
  <section class="employee-loan-page">
    <button class="back-link" type="button" @click="goBack">
      ← Back to Employee Loans
    </button>

    <PageHeader
      title="Edit Employee Loan"
      description="Update employee loan information and scheduled deduction details."
    />

    <div v-if="loading" class="message-card">
      Loading employee loan...
    </div>

    <div v-else-if="loadError" class="message-card error" role="alert">
      {{ loadError }}
    </div>

    <EmployeeLoanForm
      v-else-if="initialForm"
      mode="edit"
      :initial="initialForm"
      :busy="saving"
      :error="saveError"
      @submit="updateLoan"
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

.message-card {
  padding: 22px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  color: var(--text-muted);
  font-size: 13px;
}

.message-card.error {
  color: var(--red, #ef4444);
}
</style>
