
<script setup lang="ts">
import ManualTimeEntryForm from '~/components/admin/timekeeping/manual-time-in-out/ManualTimeEntryForm.vue'

definePageMeta({
  layout: 'admin',
})
</script>

<template>
  <ManualTimeEntryForm mode="create" />
</template>
