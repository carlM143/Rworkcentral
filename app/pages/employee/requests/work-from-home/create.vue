<script setup lang="ts">
import WorkFromHomeForm from '~/components/employee/work-from-home/WorkFromHomeForm.vue'

definePageMeta({ layout: false, middleware: 'employee' })
useHead({ title: 'New Work-from-Home Request | RWorkCentral' })
</script>

<template>
  <WorkFromHomeForm mode="create" />
</template>
