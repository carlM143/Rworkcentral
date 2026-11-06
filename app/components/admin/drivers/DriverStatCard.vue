<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  label: string
  value: string | number
  description: string
  accent: 'blue' | 'green' | 'orange' | 'purple'
  icon: Component
}>()
</script>

<template>
  <article class="stat-card">
    <div class="icon" :class="accent">
      <component :is="icon" :size="17" />
    </div>

    <div class="stat-content">
      <small>{{ label }}</small>
      <strong>{{ value }}</strong>
      <span>{{ description }}</span>
    </div>
  </article>
</template>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 110px;
  padding: 18px 16px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
}

.icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 10px;
}

.icon.blue { background: rgba(59, 130, 246, 0.12); color: #60a5fa; }
.icon.green { background: rgba(34, 197, 94, 0.12); color: #4ade80; }
.icon.orange { background: rgba(245, 158, 11, 0.12); color: #fbbf24; }
.icon.purple { background: rgba(168, 85, 247, 0.12); color: #c084fc; }

.stat-content small,
.stat-content span {
  display: block;
}

.stat-content small {
  color: var(--text-secondary);
  font-size: 10px;
}

.stat-content strong {
  display: block;
  margin: 7px 0 4px;
  color: var(--text-primary);
  font-size: 24px;
  letter-spacing: -0.6px;
}

.stat-content span {
  color: var(--text-muted);
  font-size: 10px;
}
</style>
