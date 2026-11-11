<script setup lang="ts">
const router = useRouter()

onMounted(() => {
  void router.replace('/admin/work-schedules')
})
</script>

<template>
  <section>
    <p>Redirecting to Work Schedules…</p>
  </section>
</template>
