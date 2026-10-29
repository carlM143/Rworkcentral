<script setup lang="ts">
import ContributionWorkspace from '~/components/admin/contribution/ContributionWorkspace.vue'
definePageMeta({ layout: 'admin' })
const columns = [
  { key: 'type', label: 'Contribution Type' }, { key: 'method', label: 'Calculation' },
  { key: 'salary_basis', label: 'Salary Basis' }, { key: 'employee_rate', label: 'Employee Rate', format: 'percent' as const },
  { key: 'employer_rate', label: 'Employer Rate', format: 'percent' as const },
  { key: 'effective_from', label: 'Effective From' }, { key: 'effective_to', label: 'Effective To' },
  { key: 'status', label: 'Status', format: 'status' as const },
]
const fields = [
  { key: 'type', label: 'Contribution Type', type: 'select' as const, options: ['SSS','PhilHealth','Pag-IBIG'], required: true },
  { key: 'method', label: 'Calculation Method', type: 'select' as const, options: ['percentage','bracket','fixed'], required: true },
  { key: 'salary_basis', label: 'Salary Basis', type: 'select' as const, options: ['Basic Salary','Monthly Salary Credit','Gross Pay'], required: true },
  { key: 'employee_rate', label: 'Employee Rate (%)', type: 'number' as const },
  { key: 'employer_rate', label: 'Employer Rate (%)', type: 'number' as const },
  { key: 'minimum_salary_base', label: 'Minimum Salary Base', type: 'number' as const },
  { key: 'maximum_salary_base', label: 'Maximum Salary Base', type: 'number' as const },
  { key: 'effective_from', label: 'Effective From', type: 'date' as const, required: true },
  { key: 'effective_to', label: 'Effective To', type: 'date' as const },
  { key: 'status', label: 'Status', type: 'select' as const, options: ['Active','Inactive'], required: true },
]
const rows = [
  { id: 1, type: 'SSS', method: 'bracket', salary_basis: 'Monthly Salary Credit', employee_rate: null, employer_rate: null, minimum_salary_base: 0, maximum_salary_base: null, effective_from: '2026-01-01', effective_to: null, status: 'Active' },
  { id: 2, type: 'PhilHealth', method: 'percentage', salary_basis: 'Basic Salary', employee_rate: null, employer_rate: null, minimum_salary_base: null, maximum_salary_base: null, effective_from: '2026-01-01', effective_to: null, status: 'Active' },
  { id: 3, type: 'Pag-IBIG', method: 'percentage', salary_basis: 'Basic Salary', employee_rate: null, employer_rate: null, minimum_salary_base: null, maximum_salary_base: null, effective_from: '2026-01-01', effective_to: null, status: 'Active' },
]
</script>
<template><ContributionWorkspace title="Contribution Rate" subtitle="Manage effective contribution rate schedules, calculation methods, and salary bases." add-label="Add Rate Schedule" :columns="columns" :fields="fields" :initial-rows="rows" /></template>
