<script setup lang="ts">
import UpcomingEventsBrowser from '~/components/admin/dashboard/UpcomingEventsBrowser.vue'

definePageMeta({
  layout: 'admin',
})
</script>

<template>
  <!-- Employees › Birthdays & Anniversaries: celebrants of the month. -->
  <UpcomingEventsBrowser
    title="Birthdays & Anniversaries"
    description="Employee birthdays and work anniversaries per month, by department."
    :allowed-types="['birthday', 'anniversary']"
    default-range="month"
    export-name="celebrants"
  />
</template>