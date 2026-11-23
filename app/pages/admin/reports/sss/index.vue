<script setup lang="ts">
import ContributionReport from '~/components/admin/reports/contributions/ContributionReport.vue'

// Reports › SSS Report (monthly remittance from generated payroll).
definePageMeta({ layout: 'admin' })
useHead({ title: 'SSS Report | RWorkCentral' })
</script>

<template>
  <ContributionReport agency="sss" />
</template>
