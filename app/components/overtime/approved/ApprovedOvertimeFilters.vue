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

const department =
  defineModel<string>(
    'department',
    {
      default: '',
    },
  )

const overtimeType =
  defineModel<string>(
    'overtimeType',
    {
      default: '',
    },
  )

const payrollStatus =
  defineModel<string>(
    'payrollStatus',
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
  overtimeTypes: string[]
  payrollStatuses: string[]
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
        placeholder="Search OT no., employee or reason..."
      />

      <AppSelect
        v-model="department"
        :options="departments"
        placeholder="All Departments"
      />

      <AppSelect
        v-model="overtimeType"
        :options="overtimeTypes"
        placeholder="All OT Types"
      />

      <AppSelect
        v-model="payrollStatus"
        :options="payrollStatuses"
        placeholder="All Payroll Status"
      />

    </div>

    <div class="date-row">

      <div class="date-control">

        <CalendarDays
          :size="15"
        />

        <div>
          <span>
            OT Date From
          </span>

          <input
            v-model="dateFrom"
            type="date"
          >
        </div>

      </div>

      <div class="date-control">

        <CalendarDays
          :size="15"
        />

        <div>
          <span>
            OT Date To
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

  padding: 11px;

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
    minmax(310px, 1fr)
    230px
    190px
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

  width: 210px;
  height: 41px;

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

  margin-bottom: 1px;

  font-size: 9px;
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

:deep(input),
:deep(select),
:deep(button) {
  font-size: 11px;
}

@media (max-width: 1100px) {
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