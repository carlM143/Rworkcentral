<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: string
  label: string
}>()

const TONES: Record<string, string> = {
  pending: 'orange',
  incomplete: 'orange',
  draft: 'orange',
  approved: 'green',
  accepted: 'green',
  completed: 'green',
  rejected: 'red',
  returned: 'red',
  for_review: 'purple',
  submitted: 'purple',
}

const tone = computed(() => TONES[props.status] ?? 'muted')
</script>

<template>
  <span class="status-pill wfh-pill" :class="`wfh-pill--${tone}`">{{ label }}</span>
</template>

<style scoped>
.wfh-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
  white-space: nowrap;
}

.wfh-pill::before {
  content: '';
  width: 5px;
  height: 5px;
  flex: 0 0 5px;
  border-radius: 50%;
  background: currentColor;
}

.wfh-pill--green { color: #22c55e; background: rgb(34 197 94 / 11%); }
.wfh-pill--red { color: #f87171; background: rgb(248 113 113 / 11%); }
.wfh-pill--orange { color: #f59e0b; background: rgb(245 158 11 / 12%); }
.wfh-pill--purple { color: #a78bfa; background: rgb(167 139 250 / 13%); }
.wfh-pill--muted { color: var(--text-muted, #7c8da8); background: var(--bg-card-soft, #182438); }
</style>