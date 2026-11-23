<script setup lang="ts">
import ContributionReport from '~/components/admin/reports/contributions/ContributionReport.vue'

// Reports › PhilHealth Report (monthly remittance from generated payroll).
definePageMeta({ layout: 'admin' })
useHead({ title: 'PhilHealth Report | RWorkCentral' })
</script>

<template>
  <ContributionReport agency="philhealth" />
</template>
