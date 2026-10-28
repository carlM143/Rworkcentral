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

const client =
  defineModel<string>(
    'client',
    {
      default: '',
    },
  )

const rateType =
  defineModel<string>(
    'rateType',
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

const effectiveDate =
  defineModel<string>(
    'effectiveDate',
    {
      default: '',
    },
  )

defineProps<{
  clients: string[]
  rateTypes: string[]
  statuses: string[]
}>()

const emit =
  defineEmits<{
    reset: []
  }>()
</script>

<template>
  <div class="filters-card">

    <div class="filters-grid">

      <AppInput
        v-model="search"
        searchable
        clearable
        placeholder="Search rate code, client or position..."
      />

      <AppSelect
        v-model="client"
        :options="clients"
        placeholder="All Clients"
      />

      <AppSelect
        v-model="rateType"
        :options="rateTypes"
        placeholder="All Rate Types"
      />

      <AppSelect
        v-model="status"
        :options="statuses"
        placeholder="All Status"
      />

      <div class="date-control">

        <CalendarDays
          :size="15"
        />

        <div>

          <span>
            Effective Date
          </span>

          <input
            v-model="effectiveDate"
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

.filters-grid {
  display: grid;

  grid-template-columns:
    minmax(290px, 1fr)
    230px
    180px
    165px
    195px
    auto;

  gap: 8px;

  align-items: center;
}

.date-control {
  display: flex;

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

  font-size: 7px;
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
  .filters-grid {
    grid-template-columns:
      repeat(
        3,
        minmax(0, 1fr)
      );
  }
}

@media (max-width: 900px) {
  .filters-grid {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }
}

@media (max-width: 650px) {
  .filters-grid {
    grid-template-columns:
      1fr;
  }
}
</style>