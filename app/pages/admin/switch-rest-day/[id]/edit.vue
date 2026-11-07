<script setup lang="ts">
import SwitchRestDayForm from '~/components/admin/timekeeping/switch-rest-day/SwitchRestDayForm.vue'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()

const recordId = computed(() => Number(route.params.id))
</script>

<template>
  <SwitchRestDayForm mode="edit" :record-id="recordId" />
</template>
