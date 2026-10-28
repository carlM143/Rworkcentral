<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const auth = useAuth()
auth.hydrate()

if (auth.homePath.value) {
  await navigateTo(auth.homePath.value, { replace: true })
} else {
  auth.clearSession()
  await navigateTo('/auth/login', { replace: true })
}
</script>

<template>
  <div />
</template>
