<script setup lang="ts">
import {
  RotateCcw,
} from 'lucide-vue-next'

const search =
  defineModel<string>(
    'search',
    {
      default: '',
    },
  )

const eventType =
  defineModel<string>(
    'eventType',
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

defineProps<{
  eventTypes: string[]
  departments: string[]
  statuses: string[]
}>()

const emit =
  defineEmits<{
    reset: []
  }>()
</script>

<template>
  <div class="filters-card">

    <div class="main-filters">

      <AppInput
        v-model="search"
        searchable
        placeholder="Search employee, reference no. or event..."
      />

      <AppSelect
        v-model="eventType"
        :options="eventTypes"
        placeholder="All Event Types"
      />

      <AppSelect
        v-model="department"
        :options="departments"
        placeholder="All Departments"
      />

      <AppSelect
        v-model="status"
        :options="statuses"
        placeholder="All Status"
      />

      <AppButton
        variant="secondary"
        :icon="RotateCcw"
        @click="emit('reset')"
      >
        Reset
      </AppButton>

    </div>

    <div class="date-filters">

      <div class="date-field">

        <label>
          Effective Date From
        </label>

        <input
          v-model="dateFrom"
          type="date"
        >

      </div>

      <div class="date-field">

        <label>
          Effective Date To
        </label>

        <input
          v-model="dateTo"
          type="date"
        >

      </div>

    </div>

  </div>
</template>

<style scoped>
.filters-card {
  margin-bottom: 14px;

  padding: 12px;

  border:
    1px solid var(--border);

  border-radius: 11px;

  background:
    var(--bg-card);

  box-shadow:
    var(--shadow);
}

.main-filters {
  display: grid;

  grid-template-columns:
    minmax(300px, 1fr)
    200px
    200px
    180px
    auto;

  gap: 9px;
}

.date-filters {
  display: flex;

  gap: 10px;

  margin-top: 10px;

  padding-top: 10px;

  border-top:
    1px solid var(--border-soft);
}

.date-field {
  width: 185px;
}

.date-field label {
  display: block;

  margin-bottom: 5px;

  color:
    var(--text-secondary);

  font-size: 10px;
  font-weight: 600;
}

.date-field input {
  width: 100%;
  height: 38px;

  padding:
    0 10px;

  border:
    1px solid var(--border);

  border-radius: 8px;

  outline: none;

  background:
    var(--bg-card);

  color:
    var(--text-primary);

  font-family: inherit;

  font-size: 11px;
}

.date-field input:focus {
  border-color:
    var(--primary);

  box-shadow:
    0 0 0 3px
    color-mix(
      in srgb,
      var(--primary) 10%,
      transparent
    );
}

:deep(input),
:deep(select),
:deep(button) {
  font-size: 11px;
}

@media (max-width: 1200px) {
  .main-filters {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }
}

@media (max-width: 650px) {
  .main-filters {
    grid-template-columns:
      1fr;
  }

  .date-filters {
    flex-direction:
      column;
  }

  .date-field {
    width: 100%;
  }
}
</style>