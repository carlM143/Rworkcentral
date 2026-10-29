<script setup lang="ts">
import ContributionWorkspace from '~/components/admin/contribution/ContributionWorkspace.vue'
definePageMeta({ layout: 'admin' })
const columns = [
  { key: 'schedule', label: 'Rate Schedule' }, { key: 'salary_from', label: 'Salary From', format: 'money' as const },
  { key: 'salary_to', label: 'Salary To', format: 'money' as const }, { key: 'monthly_salary_credit', label: 'Monthly Salary Credit', format: 'money' as const },
  { key: 'employee_amount', label: 'Employee', format: 'money' as const }, { key: 'employer_amount', label: 'Employer', format: 'money' as const },
  { key: 'employer_ec_amount', label: 'Employer EC', format: 'money' as const }, { key: 'status', label: 'Status', format: 'status' as const },
]
const fields = [
  { key: 'schedule', label: 'Rate Schedule', type: 'select' as const, options: ['SSS 2026', 'PhilHealth 2026', 'Pag-IBIG 2026'], required: true },
  { key: 'salary_from', label: 'Salary From', type: 'number' as const, required: true },
  { key: 'salary_to', label: 'Salary To', type: 'number' as const },
  { key: 'monthly_salary_credit', label: 'Monthly Salary Credit', type: 'number' as const },
  { key: 'employee_rate', label: 'Employee Rate (%)', type: 'number' as const },
  { key: 'employer_rate', label: 'Employer Rate (%)', type: 'number' as const },
  { key: 'employee_amount', label: 'Employee Amount', type: 'number' as const },
  { key: 'employer_amount', label: 'Employer Amount', type: 'number' as const },
  { key: 'employer_ec_amount', label: 'Employer EC Amount', type: 'number' as const },
  { key: 'status', label: 'Status', type: 'select' as const, options: ['Active','Inactive'], required: true },
]
// Placeholder values only: replace with your approved rate table before payroll calculation.
const rows = [
  { id: 1, schedule: 'SSS 2026', salary_from: 0, salary_to: 0, monthly_salary_credit: null, employee_amount: null, employer_amount: null, employer_ec_amount: null, status: 'Inactive' },
]
</script>
<template><ContributionWorkspace title="Contribution History" subtitle="Review and manage contribution rate bracket records (historical rate schedules)." add-label="Add Rate Bracket" :columns="columns" :fields="fields" :initial-rows="rows" /></template>
