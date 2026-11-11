<script setup lang="ts">
defineProps<{
  open?: boolean
}>()

defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <div v-if="open" />
</template>
