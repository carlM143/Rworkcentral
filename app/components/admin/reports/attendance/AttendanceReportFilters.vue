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

    <!-- MAIN FILTERS -->

    <div class="filters-grid">

      <AppInput
        v-model="search"
        searchable
        placeholder="Search employee, ID or position..."
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
        placeholder="Attendance Status"
      />

    </div>

    <!-- PERIOD -->

    <div class="period-row">

      <div class="period-title">

        <div class="period-icon">

          <CalendarDays
            :size="16"
          />

        </div>

        <div>

          <strong>
            Report Period
          </strong>

          <span>
            Select attendance coverage
          </span>

        </div>

      </div>

      <div class="date-fields">

        <div class="date-field">

          <label>
            Date From
          </label>

          <input
            v-model="dateFrom"
            type="date"
          >

        </div>

        <span class="date-separator">
          to
        </span>

        <div class="date-field">

          <label>
            Date To
          </label>

          <input
            v-model="dateTo"
            type="date"
          >

        </div>

      </div>

      <div class="period-actions">

        <AppButton
          variant="secondary"
          :icon="RotateCcw"
          @click="
            emit('reset')
          "
        >
          Reset
        </AppButton>

        <AppButton
          :icon="CalendarDays"
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
    minmax(300px, 1fr)
    220px
    210px
    200px;

  gap: 9px;
}

.period-row {
  display: flex;

  align-items: flex-end;

  gap: 16px;

  margin-top: 12px;

  padding-top: 12px;

  border-top:
    1px solid var(--border-soft);
}

.period-title {
  display: flex;

  min-width: 190px;

  align-items: center;

  gap: 9px;
}

.period-icon {
  display: flex;

  width: 34px;
  height: 34px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.period-title strong,
.period-title span {
  display: block;
}

.period-title strong {
  color:
    var(--text-primary);

  font-size: 10.5px;
}

.period-title span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 9px;
}

.date-fields {
  display: flex;

  align-items: flex-end;

  gap: 8px;
}

.date-field {
  width: 180px;
}

.date-field label {
  display: block;

  margin-bottom: 5px;

  color:
    var(--text-secondary);

  font-size: 9px;
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
  font-size: 10.5px;
}

.date-field input:focus {
  border-color:
    var(--primary);
}

.date-separator {
  padding-bottom: 10px;

  color:
    var(--text-muted);

  font-size: 9px;
}

.period-actions {
  display: flex;

  gap: 8px;

  margin-left: auto;
}

:deep(input),
:deep(select),
:deep(button) {
  font-size: 11px;
}

@media (max-width: 1200px) {
  .filters-grid {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }

  .period-row {
    align-items:
      flex-start;

    flex-wrap: wrap;
  }

  .period-actions {
    margin-left: 0;
  }
}

@media (max-width: 650px) {
  .filters-grid {
    grid-template-columns:
      1fr;
  }

  .period-row,
  .date-fields,
  .period-actions {
    width: 100%;

    flex-direction: column;

    align-items: stretch;
  }

  .date-field {
    width: 100%;
  }

  .date-separator {
    display: none;
  }
}
</style>
