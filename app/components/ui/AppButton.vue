<script setup lang="ts">
import type { Component } from 'vue'

withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
    size?: 'sm' | 'md'
    type?: 'button' | 'submit' | 'reset'
    icon?: Component
    disabled?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
    disabled: false,
  },
)
</script>

<template>
  <button
    :type="type"
    class="app-button"
    :class="[
      `app-button-${variant}`,
      `app-button-${size}`,
    ]"
    :disabled="disabled"
  >
    <component
      :is="icon"
      v-if="icon"
      :size="16"
    />

    <slot />
  </button>
</template>

<style scoped>
.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  border-radius: 8px;
  border: 1px solid transparent;

  font-weight: 600;
  white-space: nowrap;

  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
}

.app-button:active {
  transform: translateY(1px);
}

.app-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.app-button-md {
  min-height: 40px;
  padding: 0 15px;
  font-size: 12px;
}

.app-button-sm {
  min-height: 34px;
  padding: 0 11px;
  font-size: 11px;
}

.app-button-primary {
  background: var(--primary);
  color: white;
  box-shadow: 0 4px 12px rgba(36, 107, 253, 0.2);
}

.app-button-primary:hover {
  background: var(--primary-dark);
}

.app-button-secondary {
  border-color: var(--border);
  background: var(--bg-card);
  color: var(--text-primary);
}

.app-button-secondary:hover {
  background: var(--bg-card-soft);
}

.app-button-danger {
  background: var(--red);
  color: white;
}

.app-button-ghost {
  background: transparent;
  color: var(--text-secondary);
}

.app-button-ghost:hover {
  background: var(--bg-card-soft);
  color: var(--text-primary);
}
</style>