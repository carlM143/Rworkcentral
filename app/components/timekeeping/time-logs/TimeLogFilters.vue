
<script setup lang="ts">
import {
  CalendarDays,
  RotateCcw,
  Search,
} from 'lucide-vue-next'

/* =========================================
   MODELS
========================================= */

const search = defineModel<string>('search', {
  default: '',
})

const department = defineModel<string>('department', {
  default: '',
})

const attendanceSource = defineModel<string>(
  'attendanceSource',
  {
    default: '',
  },
)

const status = defineModel<string>('status', {
  default: '',
})

const dateFrom = defineModel<string>('dateFrom', {
  default: '',
})

const dateTo = defineModel<string>('dateTo', {
  default: '',
})

/* =========================================
   PROPS
========================================= */

withDefaults(
  defineProps<{
    departments?: string[]
    attendanceSources?: string[]
    statusOptions?: string[]
  }>(),
  {
    departments: () => [],
    attendanceSources: () => [],
    statusOptions: () => [],
  },
)

/* =========================================
   EMITS
========================================= */

const emit = defineEmits<{
  reset: []
}>()

/* =========================================
   RESET
========================================= */

const handleReset = () => {
  emit('reset')
}
</script>

<template>
  <div class="time-log-filters">

    <!-- =====================================
         MAIN FILTERS
    ====================================== -->

    <div class="filter-row">

      <!-- SEARCH -->

      <div class="search-wrapper">
        <Search
          :size="16"
          class="search-icon"
        />

        <input
          v-model="search"
          type="text"
          placeholder="Search employee, ID or department..."
          class="search-input"
        />

        <button
          v-if="search"
          type="button"
          class="clear-search"
          aria-label="Clear search"
          @click="search = ''"
        >
          ×
        </button>
      </div>

      <!-- DEPARTMENT -->

      <AppSelect
        v-model="department"
        :options="departments"
        placeholder="All Departments"
      />

      <!-- ATTENDANCE SOURCE -->

      <AppSelect
        v-model="attendanceSource"
        :options="attendanceSources"
        placeholder="All Attendance Sources"
      />

      <!-- STATUS -->

      <AppSelect
        v-model="status"
        :options="statusOptions"
        placeholder="All Status"
      />

    </div>

    <!-- =====================================
         DATE FILTERS
    ====================================== -->

    <div class="date-row">

      <!-- DATE FROM -->

      <div class="date-control">

        <CalendarDays
          :size="15"
          class="date-icon"
        />

        <div class="date-content">

          <label for="timelog-date-from">
            Date From
          </label>

          <input
            id="timelog-date-from"
            v-model="dateFrom"
            type="date"
          />

        </div>

      </div>

      <!-- DATE TO -->

      <div class="date-control">

        <CalendarDays
          :size="15"
          class="date-icon"
        />

        <div class="date-content">

          <label for="timelog-date-to">
            Date To
          </label>

          <input
            id="timelog-date-to"
            v-model="dateTo"
            type="date"
            :min="dateFrom || undefined"
          />

        </div>

      </div>

      <!-- RESET -->

      <AppButton
        variant="secondary"
        :icon="RotateCcw"
        @click="handleReset"
      >
        Reset Filters
      </AppButton>

    </div>

  </div>
</template>

<style scoped>
/* =========================================
   MAIN CONTAINER
========================================= */

.time-log-filters {
  width: 100%;
  margin-bottom: 14px;
  padding: 11px;

  border: 1px solid var(--border);
  border-radius: 10px;

  background: var(--bg-card);
  box-shadow: var(--shadow);
}

/* =========================================
   MAIN ROW
========================================= */

.filter-row {
  display: grid;

  grid-template-columns:
    minmax(280px, 1fr)
    210px
    220px
    175px;

  gap: 8px;
  align-items: center;
}

/* =========================================
   SEARCH
========================================= */

.search-wrapper {
  position: relative;

  display: flex;
  align-items: center;

  width: 100%;
  min-width: 0;
  height: 38px;

  border: 1px solid var(--border);
  border-radius: 7px;

  background: var(--bg-card-soft);
}

.search-wrapper:focus-within {
  border-color: var(--primary);
}

.search-icon {
  position: absolute;
  left: 12px;

  color: var(--text-muted);

  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 100%;

  padding: 0 34px 0 37px;

  border: 0;
  outline: none;

  background: transparent;
  color: var(--text-primary);

  font-family: inherit;
  font-size: 11px;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.clear-search {
  position: absolute;
  right: 9px;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 20px;
  height: 20px;

  border: 0;
  border-radius: 5px;

  background: transparent;
  color: var(--text-muted);

  font-size: 17px;
  cursor: pointer;
}

.clear-search:hover {
  background: var(--bg-card);
  color: var(--text-primary);
}

/* =========================================
   DATE ROW
========================================= */

.date-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  gap: 8px;
  margin-top: 8px;
}

/* =========================================
   DATE CONTROL
========================================= */

.date-control {
  display: flex;
  align-items: center;

  gap: 9px;

  width: 215px;
  min-height: 42px;

  padding: 5px 10px;

  border: 1px solid var(--border);
  border-radius: 7px;

  background: var(--bg-card-soft);
}

.date-control:focus-within {
  border-color: var(--primary);
}

.date-icon {
  flex-shrink: 0;
  color: var(--text-muted);
}

.date-content {
  flex: 1;
  min-width: 0;
}

.date-content label {
  display: block;

  margin-bottom: 2px;

  color: var(--text-muted);

  font-size: 9px;
  font-weight: 500;
}

.date-content input {
  display: block;

  width: 100%;
  height: 18px;

  padding: 0;

  border: 0;
  outline: none;

  background: transparent;
  color: var(--text-primary);

  font-family: inherit;
  font-size: 10px;

  color-scheme: dark;
}

.date-content input::-webkit-calendar-picker-indicator {
  cursor: pointer;
}

/* =========================================
   SHARED COMPONENT STYLES
========================================= */

:deep(select) {
  font-size: 11px;
}

:deep(button) {
  font-size: 11px;
}

/* =========================================
   RESPONSIVE
========================================= */

@media (max-width: 1200px) {
  .filter-row {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 650px) {
  .filter-row {
    grid-template-columns: 1fr;
  }

  .date-row {
    flex-direction: column;
    align-items: stretch;
  }

  .date-control {
    width: 100%;
  }

  .date-row > :deep(button) {
    width: 100%;
  }
}
</style>
