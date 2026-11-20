<script setup lang="ts">
import EmployeeProfile from '~/components/employee/profile/EmployeeProfile.vue'

// Profile data, photo, contact and password APIs live in useEmployeePortal
// (the layout and dashboard share the same profile state).
definePageMeta({ layout: false, middleware: 'employee' })
useHead({ title: 'Profile | Employee Portal — RWorkCentral' })
</script>

<template>
  <EmployeeProfile />
</template>
