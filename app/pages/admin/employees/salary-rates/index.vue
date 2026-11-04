
<script setup lang="ts">
import { ref } from 'vue'
import {
  RefreshCw,
  Users,
  BadgeCheck,
  Ban,
  Wallet,
  X,
} from 'lucide-vue-next'

import EmployeeRatesTable from '~/components/admin/employees/salary-rates/employeeRatesTable.vue'
import EmployeeRatesFilter from '~/components/admin/employees/salary-rates/employeeRatesFilter.vue'

import type { EmployeeSalaryRate } from '~/types/employeeSalaryRates/employeeSalaryRate'
import { useEmployeeSalaryRates } from '~/composables/admin/employeeSalaryRates/useEmployeeSalaryRates'

definePageMeta({
  layout: 'admin',
})

const {
  loading,
  loadError,
  optionsError,

  search,
  department,
  salaryType,
  status,

  departments,
  salaryTypes,

  paginatedRates,
  filteredRates,
  stats,

  currentPage,
  totalPages,
  showingFrom,
  showingTo,

  getRates,
  resetFilters,
} = useEmployeeSalaryRates()

const selectedRate = ref<EmployeeSalaryRate | null>(null)

const money = (value: number | string): string =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(Number(value ?? 0))

const closeDetails = () => {
  selectedRate.value = null
}
</script>

<template>
  <section class="w-full max-w-[1660px] mx-auto">

    <PageHeader
      title="Employee Salary Rates"
      description="Monitor employee salary setups, basic rates and allowances."
    >
      <AppButton
        variant="secondary"
        :icon="RefreshCw"
        :disabled="loading"
        @click="getRates"
      >
        Refresh
      </AppButton>
    </PageHeader>


    <!-- FILTERS -->
    <EmployeeRatesFilter
      v-model:search="search"
      v-model:department="department"
      v-model:salary-type="salaryType"
      v-model:status="status"
      :departments="departments"
      :salary-types="salaryTypes"
      @reset="resetFilters"
    />

    <p
      v-if="optionsError"
      role="alert"
      class="mb-3 text-xs"
      style="color: var(--red, #ef4444)"
    >
      {{ optionsError }}
    </p>

    <!-- API ERROR -->
    <div
      v-if="loadError"
      role="alert"
      class="mb-4 rounded-xl border p-4 text-sm"
      :style="{
        background: 'var(--bg-card)',
        borderColor: 'var(--border)',
        color: 'var(--red, #ef4444)',
      }"
    >
      {{ loadError }}
    </div>

    <!-- TABLE -->
    <EmployeeRatesTable
      v-else
      :rates="paginatedRates"
      :loading="loading"
      @view="selectedRate = $event"
    />

    <!-- PAGINATION -->
    <div
      v-if="!loading && !loadError"
      class="table-footer"
    >
      <p>
        Showing
        <strong>
          {{ showingFrom }}–{{ showingTo }}
        </strong>
        of
        <strong>
          {{ filteredRates.length }}
        </strong>
        salary setups
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>


    <!-- VIEW DETAILS MODAL -->
    <Teleport to="body">
      <div
        v-if="selectedRate"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        @click.self="closeDetails"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Employee salary setup details"
          class="w-full max-w-xl rounded-xl border p-6 shadow-2xl"
          :style="{
            background: 'var(--bg-card)',
            borderColor: 'var(--border)',
          }"
        >
          <div class="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2
                class="text-lg font-bold"
                style="color: var(--text-primary)"
              >
                Salary Setup Details
              </h2>
              <p
                class="mt-1 text-xs"
                style="color: var(--text-muted)"
              >
                {{ selectedRate.employee_name }}
              </p>
            </div>

            <button
              type="button"
              aria-label="Close details"
              class="rounded-lg border p-2"
              :style="{ borderColor: 'var(--border)' }"
              @click="closeDetails"
            >
              <X :size="17" />
            </button>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div
              v-for="detail in [
                { label: 'Employee ID', value: selectedRate.emp_id },
                { label: 'Department', value: selectedRate.department_name },
                { label: 'Position', value: selectedRate.position_name },
                { label: 'Salary Type', value: selectedRate.salary_type_name },
                { label: 'Basic Salary', value: money(selectedRate.basic_salary) },
                { label: 'Allowance', value: money(selectedRate.allowance) },
                { label: 'Employee Status', value: selectedRate.status ? 'Active' : 'Inactive' },
              ]"
              :key="detail.label"
              class="rounded-lg border p-3"
              :style="{ borderColor: 'var(--border)' }"
            >
              <p
                class="mb-1 text-xs"
                style="color: var(--text-muted)"
              >
                {{ detail.label }}
              </p>
              <strong
                class="text-sm"
                style="color: var(--text-primary)"
              >
                {{ detail.value ?? '—' }}
              </strong>
            </div>
          </div>

          <div class="mt-6 flex justify-end">
            <AppButton
              variant="secondary"
              @click="closeDetails"
            >
              Close
            </AppButton>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>


<style scoped>
.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  padding: 13px 3px 0;
}

.table-footer p {
  margin: 0;
  color: var(--text-muted);
  font-size: 10px;
}

.table-footer strong {
  color: var(--text-primary);
  font-weight: 600;
}

@media (max-width: 650px) {
  .table-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

