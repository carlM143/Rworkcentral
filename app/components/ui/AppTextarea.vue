<script setup lang="ts">
const model = defineModel<string>({
  default: '',
})

withDefaults(
  defineProps<{
    label?: string
    placeholder?: string
    rows?: number
    required?: boolean
    disabled?: boolean
    error?: string
    maxlength?: number
  }>(),
  {
    label: '',
    placeholder: '',
    rows: 4,
    required: false,
    disabled: false,
    error: '',
    maxlength: undefined,
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

    <textarea
      v-model="model"
      class="textarea-input"
      :class="{ invalid: error }"
      :rows="rows"
      :placeholder="placeholder"
      :disabled="disabled"
      :maxlength="maxlength"
    />

    <div class="textarea-footer">
      <span
        v-if="error"
        class="field-error"
      >
        {{ error }}
      </span>

      <span
        v-if="maxlength"
        class="character-count"
      >
        {{ model.length }}/{{ maxlength }}
      </span>
    </div>
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

.textarea-input {
  width: 100%;

  padding: 11px 12px;

  resize: vertical;

  border: 1px solid var(--border);
  border-radius: 8px;

  outline: none;

  background: var(--bg-card);
  color: var(--text-primary);

  font-size: 12px;
  line-height: 1.5;

  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.textarea-input::placeholder {
  color: var(--text-muted);
}

.textarea-input:focus {
  border-color: var(--primary);

  box-shadow:
    0 0 0 3px rgba(36, 107, 253, 0.08);
}

.textarea-input.invalid {
  border-color: var(--red);
}

.textarea-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-top: 5px;
}

.field-error {
  color: var(--red);

  font-size: 9px;
}

.character-count {
  margin-left: auto;

  color: var(--text-muted);

  font-size: 9px;
}
</style>