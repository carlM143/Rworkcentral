<script setup lang="ts">
import {
  RotateCcw,
  CalendarDays,
} from 'lucide-vue-next'

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

defineProps<{
  departments: string[]
  statusOptions: string[]
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

    </div>

    <div class="date-filters">

      <div class="date-input">

        <CalendarDays :size="15" />

        <div>
          <span>
            Date From
          </span>

          <input
            v-model="dateFrom"
            type="date"
          >
        </div>

      </div>

      <div class="date-input">

        <CalendarDays :size="15" />

        <div>
          <span>
            Date To
          </span>

          <input
            v-model="dateTo"
            type="date"
          >
        </div>

      </div>

      <AppButton
        variant="secondary"
        :icon="RotateCcw"
        @click="
          emit('reset')
        "
      >
        Reset Filters
      </AppButton>

    </div>

  </div>
</template>

<style scoped>
.filters-card {
  margin-bottom: 14px;

  padding: 10px;

  border:
    1px solid var(--border);

  border-radius: 10px;

  background:
    var(--bg-card);

  box-shadow:
    var(--shadow);
}

.main-filters {
  display: grid;

  grid-template-columns:
    minmax(300px, 1fr)
    220px
    180px;

  gap: 8px;
}

.date-filters {
  display: flex;

  align-items: center;

  gap: 8px;

  margin-top: 8px;
}

.date-input {
  display: flex;

  width: 195px;
  height: 40px;

  align-items: center;

  gap: 8px;

  padding:
    0 10px;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    var(--bg-card-soft);

  color:
    var(--text-muted);
}

.date-input > div {
  min-width: 0;

  flex: 1;
}

.date-input span {
  display: block;

  margin-bottom: 1px;

  color:
    var(--text-muted);

  font-size: 8px;
}

.date-input input {
  width: 100%;

  border: 0;
  outline: 0;

  background:
    transparent;

  color:
    var(--text-primary);

  font-family: inherit;

  font-size: 10px;

  color-scheme: dark;
}

html:not(.dark)
.date-input input {
  color-scheme: light;
}

@media (max-width: 900px) {
  .main-filters {
    grid-template-columns:
      1fr 1fr;
  }
}

@media (max-width: 650px) {
  .main-filters {
    grid-template-columns:
      1fr;
  }

  .date-filters {
    align-items: stretch;

    flex-direction: column;
  }

  .date-input {
    width: 100%;
  }
}
</style>