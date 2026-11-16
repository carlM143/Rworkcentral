<script setup lang="ts">
/**
 * Accessible on/off switch (a styled checkbox with role="switch").
 */
defineProps<{
  id: string
  label: string
  description?: string
  disabled?: boolean
}>()

const model = defineModel<boolean>({ required: true })
</script>

<template>
  <div class="switch-row" :class="{ disabled }">
    <div class="switch-text">
      <label :for="id">{{ label }}</label>
      <small v-if="description">{{ description }}</small>
    </div>
    <input
      :id="id"
      v-model="model"
      type="checkbox"
      role="switch"
      :aria-checked="model"
      :disabled="disabled"
      class="switch"
    >
  </div>
</template>

<style scoped>
.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-soft);
}

.switch-row:last-child { border-bottom: 0; }
.switch-row.disabled { opacity: 0.55; }

.switch-text label {
  display: block;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.switch-text small {
  display: block;
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 11px;
  line-height: 1.5;
}

.switch {
  position: relative;
  width: 40px;
  height: 22px;
  flex-shrink: 0;
  margin: 0;
  border-radius: 999px;
  background: var(--border);
  cursor: pointer;
  appearance: none;
  transition: background 0.18s ease;
}

.switch::after {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  content: '';
  transition: transform 0.18s ease;
}

.switch:checked { background: var(--primary); }
.switch:checked::after { transform: translateX(18px); }
.switch:disabled { cursor: not-allowed; }

.switch:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
</style>