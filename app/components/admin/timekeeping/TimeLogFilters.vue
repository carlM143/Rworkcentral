<script setup lang="ts">
import {
  RotateCcw,
} from 'lucide-vue-next'

defineProps<{
  departments: string[]
  statusOptions: string[]
}>()

const search =
  defineModel<string>(
    'search',
    {
      default: '',
    },
  )

const department =
  defineModel<string>(
    'department',
    {
      default: '',
    },
  )

const status =
  defineModel<string>(
    'status',
    {
      default: '',
    },
  )

const dateFrom =
  defineModel<string>(
    'dateFrom',
    {
      default: '',
    },
  )

const dateTo =
  defineModel<string>(
    'dateTo',
    {
      default: '',
    },
  )

defineEmits<{
  reset: []
}>()
</script>

<template>
  <div class="time-log-filters">

    <AppInput
      v-model="search"
      searchable
      clearable
      placeholder="Search employee or employee ID..."
    />

    <AppSelect
      v-model="department"
      :options="departments"
      placeholder="All Departments"
    />

    <AppSelect
      v-model="status"
      :options="statusOptions"
      placeholder="All Status"
    />

    <div class="date-field">
      <span>
        From
      </span>

      <input
        v-model="dateFrom"
        type="date"
      >
    </div>

    <div class="date-field">
      <span>
        To
      </span>

      <input
        v-model="dateTo"
        type="date"
      >
    </div>

    <AppButton
      variant="secondary"
      :icon="RotateCcw"
      @click="$emit('reset')"
    >
      Reset
    </AppButton>

  </div>
</template>

<style scoped>
.time-log-filters {
  display: grid;

  grid-template-columns:
    minmax(250px, 1fr)
    190px
    170px
    165px
    165px
    auto;

  gap: 8px;

  margin-bottom: 14px;
  padding: 10px;

  border: 1px solid var(--border);
  border-radius: 10px;

  background: var(--bg-card);

  box-shadow: var(--shadow);
}

.date-field {
  position: relative;
}

.date-field span {
  position: absolute;

  top: -6px;
  left: 8px;

  z-index: 1;

  padding: 0 4px;

  background: var(--bg-card);
  color: var(--text-muted);

  font-size: 7px;
}

.date-field input {
  width: 100%;
  height: 40px;

  padding: 0 10px;

  border: 1px solid var(--border);
  border-radius: 8px;

  outline: 0;

  background: var(--bg-card);
  color: var(--text-primary);

  font-size: 11px;
}

.date-field input:focus {
  border-color: var(--primary);

  box-shadow:
    0 0 0 3px
    rgba(36, 107, 253, 0.08);
}

@media (max-width: 1250px) {
  .time-log-filters {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .time-log-filters {
    grid-template-columns: 1fr;
  }
}
</style>