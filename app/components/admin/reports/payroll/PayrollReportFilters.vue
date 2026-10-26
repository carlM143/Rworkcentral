<script setup lang="ts">
import {
  RefreshCcw,
  Calculator,
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

const employmentType =
  defineModel<string>(
    'employmentType',
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

defineProps<{
  periods: string[]
  departments: string[]
  employmentTypes: string[]
  statuses: string[]
}>()

const emit =
  defineEmits<{
    reset: []
    generate: []
  }>()
</script>

<template>
  <div class="filters-card">

    <div class="filters-grid">

      <AppInput
        v-model="search"
        searchable
        placeholder="Search employee, payroll no. or position..."
      />

      <AppSelect
        v-model="period"
        aria-label="period"
        :options="periods"
        placeholder="Select Pay Period"
      />

      <AppSelect
        v-model="department"
        aria-label="department"
        :options="departments"
        placeholder="All Departments"
      />

      <AppSelect
        v-model="employmentType"
        aria-label="Employment type"
        :options="employmentTypes"
        placeholder="Employment Type"
      />

      <AppSelect
        v-model="status"
        aria-label="status"
        :options="statuses"
        placeholder="Payroll Status"
      />

    </div>

    <div class="filter-footer">

      <div class="filter-note">

        <strong>
          Payroll Report Filters
        </strong>

        <span>
          Select the pay period and employee filters before generating the report.
        </span>

      </div>

      <div class="filter-actions">

        <AppButton
          variant="secondary"
          :icon="RefreshCcw"
          @click="
            emit('reset')
          "
        >
          Reset
        </AppButton>

        <AppButton
          :icon="Calculator"
          @click="
            emit('generate')
          "
        >
          Generate Report
        </AppButton>

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

.filters-grid {
  display: grid;

  grid-template-columns:
    minmax(280px, 1fr)
    210px
    200px
    190px
    170px;

  gap: 9px;
}

.filter-footer {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 20px;

  margin-top: 12px;

  padding-top: 12px;

  border-top:
    1px solid var(--border-soft);
}

.filter-note strong,
.filter-note span {
  display: block;
}

.filter-note strong {
  color:
    var(--text-primary);

  font-size: 10.5px;
}

.filter-note span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 9.5px;
}

.filter-actions {
  display: flex;

  gap: 8px;
}

:deep(input),
:deep(select),
:deep(button) {
  font-size: 11px;
}

@media (max-width: 1250px) {
  .filters-grid {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }
}

@media (max-width: 700px) {
  .filters-grid {
    grid-template-columns:
      1fr;
  }

  .filter-footer {
    align-items:
      flex-start;

    flex-direction:
      column;
  }

  .filter-actions {
    width: 100%;

    flex-direction:
      column;
  }
}
</style>
