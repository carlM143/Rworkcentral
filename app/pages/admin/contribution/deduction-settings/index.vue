<script setup lang="ts">
import ContributionWorkspace from '~/components/admin/contribution/ContributionWorkspace.vue'
definePageMeta({ layout: 'admin' })
const columns = [
  { key: 'company', label: 'Company' }, { key: 'type', label: 'Contribution Type' },
  { key: 'first_cutoff_percent', label: 'First Cutoff', format: 'percent' as const },
  { key: 'second_cutoff_percent', label: 'Second Cutoff', format: 'percent' as const },
  { key: 'effective_from', label: 'Effective From' }, { key: 'effective_to', label: 'Effective To' },
  { key: 'status', label: 'Status', format: 'status' as const },
]
const fields = [
  { key: 'company', label: 'Company', required: true },
  { key: 'type', label: 'Contribution Type', type: 'select' as const, options: ['SSS','PhilHealth','Pag-IBIG'], required: true },
  { key: 'first_cutoff_percent', label: 'First Cutoff (%)', type: 'number' as const, required: true },
  { key: 'second_cutoff_percent', label: 'Second Cutoff (%)', type: 'number' as const, required: true },
  { key: 'effective_from', label: 'Effective From', type: 'date' as const, required: true },
  { key: 'effective_to', label: 'Effective To', type: 'date' as const },
  { key: 'status', label: 'Status', type: 'select' as const, options: ['Active','Inactive'], required: true },
]
const rows = [
  { id: 1, company: 'RWorkCentral Inc.', type: 'SSS', first_cutoff_percent: 50, second_cutoff_percent: 50, effective_from: '2026-01-01', effective_to: null, status: 'Active' },
  { id: 2, company: 'RWorkCentral Inc.', type: 'PhilHealth', first_cutoff_percent: 50, second_cutoff_percent: 50, effective_from: '2026-01-01', effective_to: null, status: 'Active' },
  { id: 3, company: 'RWorkCentral Inc.', type: 'Pag-IBIG', first_cutoff_percent: 50, second_cutoff_percent: 50, effective_from: '2026-01-01', effective_to: null, status: 'Active' },
]
</script>

<template>
<ContributionWorkspace title="Contribution Settings" subtitle="Configure company contribution deductions across the first and second payroll cutoffs." add-label="Add Deduction Setting" :columns="columns" :fields="fields" :initial-rows="rows" />
</template>
