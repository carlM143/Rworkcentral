<script setup lang="ts">
export interface RadioOption {
  label: string
  value: string
  description?: string
}

const model = defineModel<string>({
  default: '',
})

withDefaults(
  defineProps<{
    label?: string
    options: RadioOption[]
    required?: boolean
    error?: string
  }>(),
  {
    label: '',
    required: false,
    error: '',
  },
)
</script>

<template>
  <div class="radio-wrapper">
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

    <div class="radio-list">
      <label
        v-for="option in options"
        :key="option.value"
        class="radio-option"
        :class="{
          selected: model === option.value,
        }"
      >
        <input
          v-model="model"
          type="radio"
          :value="option.value"
        >

        <span class="custom-radio">
          <span />
        </span>

        <span class="option-content">
          <strong>
            {{ option.label }}
          </strong>

          <small v-if="option.description">
            {{ option.description }}
          </small>
        </span>
      </label>
    </div>

    <span
      v-if="error"
      class="field-error"
    >
      {{ error }}
    </span>
  </div>
</template>

<style scoped>
.radio-wrapper {
  width: 100%;
}

.field-label {
  display: block;

  margin-bottom: 8px;

  color: var(--text-secondary);

  font-size: 10px;
  font-weight: 600;
}

.required-mark {
  color: var(--red);
}

.radio-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.radio-option {
  display: flex;
  min-height: 42px;
  align-items: center;
  gap: 9px;

  padding: 8px 12px;

  border: 1px solid var(--border);
  border-radius: 8px;

  background: var(--bg-card);

  cursor: pointer;

  transition:
    border-color 0.18s ease,
    background 0.18s ease;
}

.radio-option:hover {
  border-color: var(--primary);
}

.radio-option.selected {
  border-color: var(--primary);
  background: var(--primary-soft);
}

.radio-option input {
  display: none;
}

.custom-radio {
  display: flex;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;

  border: 1.5px solid var(--border);
  border-radius: 50%;
}

.selected .custom-radio {
  border-color: var(--primary);
}

.custom-radio span {
  width: 8px;
  height: 8px;

  border-radius: 50%;

  background: transparent;
}

.selected .custom-radio span {
  background: var(--primary);
}

.option-content strong {
  display: block;

  color: var(--text-primary);

  font-size: 10px;
  font-weight: 600;
}

.option-content small {
  display: block;

  margin-top: 2px;

  color: var(--text-muted);

  font-size: 8px;
}

.field-error {
  display: block;

  margin-top: 5px;

  color: var(--red);

  font-size: 9px;
}
</style>