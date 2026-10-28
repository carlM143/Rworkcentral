<script setup lang="ts">
defineProps<{ label: string; items: { key: string; label: string; disabled?: boolean; reason?: string }[] }>()
const emit = defineEmits<{ select: [key: string] }>()
</script>

<template>
  <WageActionMenu :label="label" :items="items" @select="key => emit('select', key)" />
</template>
