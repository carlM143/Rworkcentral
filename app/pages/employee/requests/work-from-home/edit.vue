<script setup lang="ts">
import WorkFromHomeForm from '~/components/employee/work-from-home/WorkFromHomeForm.vue'

// /employee/requests/work-from-home/edit?id=123 — pending requests only
definePageMeta({ layout: false, middleware: 'employee' })
useHead({ title: 'Edit Work-from-Home Request | RWorkCentral' })
</script>

<template>
  <WorkFromHomeForm mode="edit" />
</template>
