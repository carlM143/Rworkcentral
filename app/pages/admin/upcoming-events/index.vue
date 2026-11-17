<script setup lang="ts">
import UpcomingEventsBrowser from '~/components/admin/dashboard/UpcomingEventsBrowser.vue'

definePageMeta({
  layout: 'admin',
})
</script>

<template>
  <!-- Opened from the dashboard "Upcoming Events" card. -->
  <UpcomingEventsBrowser
    title="Upcoming Events"
    description="Birthdays, work anniversaries, regularizations, holidays and lifecycle milestones."
    default-range="30"
  />
</template>