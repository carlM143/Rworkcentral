<script setup lang="ts">
import ContributionReport from '~/components/admin/reports/contributions/ContributionReport.vue'

// Reports › Pag-IBIG Report (monthly remittance from generated payroll).
definePageMeta({ layout: 'admin' })
useHead({ title: 'Pag-IBIG Report | RWorkCentral' })
</script>

<template>
  <ContributionReport agency="pagibig" />
</template>
