<script setup lang="ts">
// /employee/requests has no page of its own anymore: Leave, Overtime and Undertime
// have their own pages. Keep old /employee/requests?category=… links working.
definePageMeta({
  layout: false,
  middleware: [
    (to) => {
      const category = String(to.query.category ?? '')
      const path = category === 'overtime' ? '/employee/overtime'
        : category === 'undertime' ? '/employee/undertime'
          : '/employee/leave'
      return navigateTo({ path, query: to.query.submitted ? { submitted: String(to.query.submitted) } : {} }, { replace: true })
    },
  ],
})
</script>

<template>
  <div />
</template>
