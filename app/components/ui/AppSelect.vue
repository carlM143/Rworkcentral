<script setup lang="ts">
const model = defineModel<string>({
  default: '',
})

withDefaults(
  defineProps<{
    options?: string[]
    placeholder?: string
  }>(),
  {
    options: () => [],
    placeholder: 'Select',
  },
)
</script>

<template>
  <select
    v-model="model"
    class="app-select"
  >
    <option value="">
      {{ placeholder }}
    </option>

    <option
      v-for="option in options"
      :key="option"
      :value="option"
    >
      {{ option }}
    </option>
  </select>
</template>

<style scoped>
.app-select {
  width: 100%;
  height: 40px;

  padding: 0 34px 0 12px;

  border: 1px solid var(--border);
  border-radius: 8px;

  outline: 0;

  background: var(--bg-card);
  color: var(--text-primary);

  font-size: 12px;

  cursor: pointer;

  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.app-select:focus {
  border-color: var(--primary);

  box-shadow:
    0 0 0 3px rgba(36, 107, 253, 0.08);
}

.app-select option {
  background: var(--bg-card);
  color: var(--text-primary);
}
</style>