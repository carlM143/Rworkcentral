<script setup lang="ts">
import {
  Search,
  X,
} from 'lucide-vue-next'

const model = defineModel<string>({
  default: '',
})

withDefaults(
  defineProps<{
    placeholder?: string
    searchable?: boolean
    clearable?: boolean
  }>(),
  {
    placeholder: '',
    searchable: false,
    clearable: false,
  },
)
</script>

<template>
  <div class="input-wrapper">
    <Search
      v-if="searchable"
      :size="17"
      class="input-icon"
    />

    <input
      v-model="model"
      type="text"
      class="app-input"
      :class="{
        'with-icon': searchable,
        'with-clear': clearable,
      }"
      :placeholder="placeholder"
    >

    <button
      v-if="clearable && model"
      type="button"
      class="clear-button"
      @click="model = ''"
    >
      <X :size="15" />
    </button>
  </div>
</template>

<style scoped>
.input-wrapper {
  position: relative;
  width: 100%;
}

.app-input {
  width: 100%;
  height: 40px;

  padding: 0 12px;

  border: 1px solid var(--border);
  border-radius: 8px;

  outline: 0;

  background: var(--bg-card);
  color: var(--text-primary);

  font-size: 12px;

  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.app-input::placeholder {
  color: var(--text-muted);
}

.app-input:focus {
  border-color: var(--primary);

  box-shadow:
    0 0 0 3px rgba(36, 107, 253, 0.08);
}

.app-input.with-icon {
  padding-left: 39px;
}

.app-input.with-clear {
  padding-right: 38px;
}

.input-icon {
  position: absolute;
  top: 50%;
  left: 13px;

  transform: translateY(-50%);

  color: var(--text-muted);
}

.clear-button {
  position: absolute;
  top: 50%;
  right: 9px;

  display: flex;
  width: 25px;
  height: 25px;
  align-items: center;
  justify-content: center;

  transform: translateY(-50%);

  border: 0;
  border-radius: 6px;

  background: transparent;
  color: var(--text-muted);
}

.clear-button:hover {
  background: var(--bg-card-soft);
  color: var(--text-primary);
}
</style>
