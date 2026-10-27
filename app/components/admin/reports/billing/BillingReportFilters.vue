<script setup lang="ts">
import {
  RefreshCcw,
  ReceiptText,
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

const period =
  defineModel<string>(
    'period',
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
  clients: string[]
  periods: string[]
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
        placeholder="Search billing no., client or invoice..."
      />

      <AppSelect
        v-model="period"
        aria-label="period"
        :options="periods"
        placeholder="Billing Period"
      />

      <AppSelect
        v-model="client"
        aria-label="client"
        :options="clients"
        placeholder="All Clients"
      />

      <AppSelect
        v-model="status"
        aria-label="status"
        :options="statuses"
        placeholder="Billing Status"
      />

    </div>

    <div class="filter-footer">

      <div>

        <strong>
          Billing Report Filters
        </strong>

        <span>
          Select the billing period and client before generating the report.
        </span>

      </div>

      <div class="filter-actions">

        <AppButton
          variant="secondary"
          :icon="RefreshCcw"
          @click="emit('reset')"
        >
          Reset
        </AppButton>

        <AppButton
          :icon="ReceiptText"
          @click="emit('generate')"
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
    250px
    190px;

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

.filter-footer strong,
.filter-footer span {
  display: block;
}

.filter-footer strong {
  color:
    var(--text-primary);

  font-size: 10.5px;
}

.filter-footer span {
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

@media (max-width: 1100px) {
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