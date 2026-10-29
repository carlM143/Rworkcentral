<script setup lang="ts">
import ContributionWorkspace from '~/components/admin/contribution/ContributionWorkspace.vue'
definePageMeta({ layout: 'admin' })
const columns = [
  { key: 'code', label: 'Code' }, { key: 'name', label: 'Contribution Name' },
  { key: 'provider', label: 'Provider' }, { key: 'status', label: 'Status', format: 'status' as const },
]
const fields = [
  { key: 'code', label: 'Contribution Code', required: true }, { key: 'name', label: 'Contribution Name', required: true },
  { key: 'provider', label: 'Provider', required: true }, { key: 'status', label: 'Status', type: 'select' as const, options: ['Active','Inactive'], required: true },
]
const rows = [
  { id: 1, code: 'SSS', name: 'Social Security System', provider: 'SSS', status: 'Active' },
  { id: 2, code: 'PHIC', name: 'PhilHealth Premium', provider: 'PhilHealth', status: 'Active' },
  { id: 3, code: 'HDMF', name: 'Pag-IBIG Fund', provider: 'Pag-IBIG', status: 'Active' },
  { id: 4, code: 'OTHER', name: 'Other Contribution', provider: 'Internal', status: 'Inactive' },
]
</script>
<template><ContributionWorkspace title="Contribution Types" subtitle="Configure statutory and company-specific contribution types." add-label="Add Contribution Type" :columns="columns" :fields="fields" :initial-rows="rows" /></template>
