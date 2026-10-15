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

const batch =
  defineModel<string>(
    'batch',
    {
      default: '',
    },
  )

const client =
  defineModel<string>(
    'client',
    {
      default: '',
    },
  )

const adjustmentType =
  defineModel<string>(
    'adjustmentType',
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
  batches: string[]
  clients: string[]
  adjustmentTypes: string[]
  statuses: string[]
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
        placeholder="Search adjustment, billing no. or client..."
      />

      <AppSelect
        v-model="batch"
        :options="batches"
        placeholder="All Billing Periods"
      />

      <AppSelect
        v-model="client"
        :options="clients"
        placeholder="All Clients"
      />

      <AppSelect
        v-model="adjustmentType"
        :options="adjustmentTypes"
        placeholder="All Adjustment Types"
      />

      <AppSelect
        v-model="status"
        :options="statuses"
        placeholder="All Status"
      />

    </div>

    <div class="date-row">

      <div class="date-control">

        <CalendarDays
          :size="15"
        />

        <div>

          <span>
            Requested From
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
            Requested To
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
    minmax(280px, 1fr)
    210px
    225px
    210px
    165px;

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

  font-size: 9px;
}

@media (max-width: 1350px) {
  .filter-row {
    grid-template-columns:
      repeat(
        3,
        minmax(0, 1fr)
      );
  }
}

@media (max-width: 900px) {
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