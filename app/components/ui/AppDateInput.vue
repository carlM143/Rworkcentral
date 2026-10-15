<script setup lang="ts">
const model = defineModel<string>({
  default: '',
})

withDefaults(
  defineProps<{
    label?: string
    required?: boolean
    min?: string
    max?: string
    disabled?: boolean
    error?: string
  }>(),
  {
    label: '',
    required: false,
    min: undefined,
    max: undefined,
    disabled: false,
    error: '',
  },
)
</script>

<template>
  <div class="field-wrapper">
    <label
      v-if="label"
      class="field-label"
    >
      {{ label }}

      <span
        v-if="required"
        class="required-mark"
      >
        *
      </span>
    </label>

    <input
      v-model="model"
      type="date"
      class="date-input"
      :class="{ invalid: error }"
      :min="min"
      :max="max"
      :disabled="disabled"
    >

    <span
      v-if="error"
      class="field-error"
    >
      {{ error }}
    </span>
  </div>
</template>

<style scoped>
.field-wrapper {
  width: 100%;
}

.field-label {
  display: block;

  margin-bottom: 7px;

  color: var(--text-secondary);

  font-size: 10px;
  font-weight: 600;
}

.required-mark {
  color: var(--red);
}

.date-input {
  width: 100%;
  height: 40px;

  padding: 0 12px;

  border: 1px solid var(--border);
  border-radius: 8px;

  outline: none;

  background: var(--bg-card);
  color: var(--text-primary);

  font-size: 12px;

  color-scheme: inherit;

  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.date-input:focus {
  border-color: var(--primary);

  box-shadow:
    0 0 0 3px rgba(36, 107, 253, 0.08);
}

.date-input.invalid {
  border-color: var(--red);
}

.date-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.field-error {
  display: block;

  margin-top: 5px;

  color: var(--red);

  font-size: 9px;
}
</style>