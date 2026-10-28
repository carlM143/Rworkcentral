<script setup lang="ts">
import {
  CalendarDays,
  RotateCcw,
} from 'lucide-vue-next'

const search =
  defineModel<string>(
    'search',
    {
      default: '',
    },
  )

const period =
  defineModel<string>(
    'period',
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

const paymentStatus =
  defineModel<string>(
    'paymentStatus',
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
  periods: string[]
  departments: string[]
  paymentStatuses: string[]
}>()

const emit =
  defineEmits<{
    reset: []
  }>()
</script>

<template>
  <div class="filters-card">

    <div class="filter-row">

      <AppInput
        v-model="search"
        searchable
        clearable
        placeholder="Search employee or payroll no..."
      />

      <AppSelect
        v-model="period"
        :options="periods"
        placeholder="All Pay Periods"
      />

      <AppSelect
        v-model="department"
        :options="departments"
        placeholder="All Departments"
      />

      <AppSelect
        v-model="paymentStatus"
        :options="paymentStatuses"
        placeholder="All Payment Status"
      />

    </div>

    <div class="date-row">

      <div class="date-control">

        <CalendarDays :size="15" />

        <div>

          <span>
            Completed From
          </span>

          <input
            v-model="dateFrom"
            type="date"
          >

        </div>

      </div>

      <div class="date-control">

        <CalendarDays :size="15" />

        <div>

          <span>
            Completed To
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

.filter-row {
  display: grid;

  grid-template-columns:
    minmax(300px, 1fr)
    225px
    200px
    210px;

  gap: 8px;
}

.date-row {
  display: flex;

  align-items: center;

  gap: 8px;

  margin-top: 8px;
}

.date-control {
  display: flex;

  width: 205px;
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

.date-control > div {
  min-width: 0;

  flex: 1;
}

.date-control span {
  display: block;

  font-size: 8px;
}

.date-control input {
  width: 100%;

  border: 0;
  outline: 0;

  background:
    transparent;

  color:
    var(--text-primary);

  font-family:
    inherit;

  font-size: 10px;
}

@media (max-width: 1150px) {
  .filter-row {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }
}

@media (max-width: 650px) {
  .filter-row {
    grid-template-columns:
      1fr;
  }

  .date-row {
    align-items:
      stretch;

    flex-direction:
      column;
  }

  .date-control {
    width: 100%;
  }
}
</style>