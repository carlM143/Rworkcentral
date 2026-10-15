<script setup lang="ts">
import type { Component } from 'vue'

withDefaults(
  defineProps<{
    label: string
    value: string | number
    description?: string
    icon?: Component
    tone?: 'blue' | 'green' | 'orange' | 'purple'
  }>(),
  {
    description: '',
    tone: 'blue',
  },
)
</script>

<template>
  <article class="stat-card">
    <div
      v-if="icon"
      class="stat-icon"
      :class="`tone-${tone}`"
    >
      <component
        :is="icon"
        :size="20"
      />
    </div>

    <div class="stat-content">
      <span class="stat-label">
        {{ label }}
      </span>

      <strong class="stat-value">
        {{ value }}
      </strong>

      <small v-if="description">
        {{ description }}
      </small>
    </div>
  </article>
</template>

<style scoped>
.stat-card {
  display: flex;
  min-height: 105px;
  align-items: center;
  gap: 13px;

  padding: 17px;

  border: 1px solid var(--border);
  border-radius: 11px;

  background: var(--bg-card);

  box-shadow: var(--shadow);
}

.stat-icon {
  display: flex;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;

  border-radius: 10px;
}

.tone-blue {
  background: var(--primary-soft);
  color: var(--primary);
}

.tone-green {
  background: var(--green-soft);
  color: var(--green);
}

.tone-orange {
  background: var(--orange-soft);
  color: var(--orange);
}

.tone-purple {
  background: var(--purple-soft);
  color: var(--purple);
}

.stat-content {
  min-width: 0;
}

.stat-label {
  display: block;

  margin-bottom: 5px;

  color: var(--text-secondary);

  font-size: 10px;
  font-weight: 500;
}

.stat-value {
  display: block;

  color: var(--text-primary);

  font-size: 22px;
  line-height: 1;
}

.stat-content small {
  display: block;

  margin-top: 7px;

  color: var(--text-muted);

  font-size: 9px;
}
</style>