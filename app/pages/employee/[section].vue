<script setup lang="ts">
definePageMeta({
  validate: route => ['attendance', 'leave-types', 'requests', 'payslips', 'loans', 'profile'].includes(String(route.params.section)),
})
const route = useRoute()
</script>

<template>
  <EmployeePortalView :key="String(route.params.section)" :section="String(route.params.section)" />
</template>
