<script setup lang="ts">
import TripTicketForm from '~/components/admin/drivers/trip-tickets/TripTicketForm.vue'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const ticketId = Number(route.params.id)
</script>

<template>
  <TripTicketForm :ticket-id="ticketId" />
</template>