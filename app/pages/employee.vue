<script setup lang="ts">
const route = useRoute()
const isLogin = computed(() => route.path === '/employee/login')

definePageMeta({
  layout: false,
  middleware: ['employee'],
})
</script>

<template>
  <NuxtLayout :name="isLogin ? 'auth' : 'employee'">
    <NuxtPage />
  </NuxtLayout>
</template>
