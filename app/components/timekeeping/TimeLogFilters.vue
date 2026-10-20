<script setup lang="ts">
import {
  Building2,
  RotateCcw,
  UsersRound,
} from 'lucide-vue-next'

defineProps<{
  departments: string[]
  clients: string[]
  workLocations: string[]
  attendanceSources: string[]
  statusOptions: string[]

  scopeCounts: {
    all: number
    internal: number
    clientAssigned: number
  }
}>()

const search =
  defineModel<string>(
    'search',
    {
      default: '',
    },
  )

const workScope =
  defineModel<string>(
    'workScope',
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

const workLocation =
  defineModel<string>(
    'workLocation',
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

const attendanceSource =
  defineModel<string>(
    'attendanceSource',
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

const emit =
  defineEmits<{
    reset: []
  }>()

const setScope = (
  value:
    | ''
    | 'Internal'
    | 'Client Assigned',
) => {
  workScope.value =
    value
}
</script>

<template>
  <article class="time-log-filter-card">

    <!-- EMPLOYEE SCOPE -->

    <div class="scope-tabs">

      <button
        type="button"
        :class="{
          active:
            workScope === '',
        }"
        @click="
          setScope('')
        "
      >

        <UsersRound :size="14" />

        <span>
          All Employees
        </span>

        <strong>
          {{ scopeCounts.all }}
        </strong>

      </button>

      <button
        type="button"
        :class="{
          active:
            workScope ===
            'Internal',
        }"
        @click="
          setScope(
            'Internal',
          )
        "
      >

        <Building2 :size="14" />

        <span>
          Internal
        </span>

        <strong>
          {{ scopeCounts.internal }}
        </strong>

      </button>

      <button
        type="button"
        :class="{
          active:
            workScope ===
            'Client Assigned',
        }"
        @click="
          setScope(
            'Client Assigned',
          )
        "
      >

        <UsersRound :size="14" />

        <span>
          Client Assigned
        </span>

        <strong>
          {{ scopeCounts.clientAssigned }}
        </strong>

      </button>

    </div>

    <!-- PRIMARY -->

    <div class="primary-filters">

      <AppInput
        v-model="search"
        searchable
        clearable
        placeholder="Search employee, ID, client or location..."
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

    <!-- SECONDARY -->

    <div class="secondary-filters">

      <AppSelect
        v-model="client"
        :options="clients"
        placeholder="All Clients"
      />

      <AppSelect
        v-model="workLocation"
        :options="workLocations"
        placeholder="All Work Locations"
      />

      <AppSelect
        v-model="attendanceSource"
        :options="attendanceSources"
        placeholder="All Attendance Sources"
      />

      <div class="date-field">

        <span>
          From
        </span>

        <input
          v-model="dateFrom"
          type="date"
        >

      </div>

      <div class="date-field">

        <span>
          To
        </span>

        <input
          v-model="dateTo"
          type="date"
        >

      </div>

      <AppButton
        variant="secondary"
        :icon="RotateCcw"
        @click="
          emit('reset')
        "
      >
        Reset
      </AppButton>

    </div>

  </article>
</template>

<style scoped>
.time-log-filter-card {
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

/* =========================================================
   SCOPE TABS
========================================================= */

.scope-tabs {
  display: flex;

  align-items: center;

  gap: 6px;

  margin-bottom: 9px;
}

.scope-tabs button {
  display: inline-flex;

  min-height: 34px;

  align-items: center;

  gap: 6px;

  padding:
    0 10px;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);

  font-family:
    inherit;

  font-size: 8px;
  font-weight: 500;

  cursor: pointer;

  transition:
    0.15s ease;
}

.scope-tabs button:hover {
  border-color:
    var(--primary);

  color:
    var(--primary);
}

.scope-tabs button.active {
  border-color:
    var(--primary);

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.scope-tabs button strong {
  display: inline-flex;

  min-width: 20px;
  height: 20px;

  align-items: center;
  justify-content: center;

  padding:
    0 5px;

  border-radius: 20px;

  background:
    var(--bg-card);

  color:
    var(--text-primary);

  font-size: 7px;
}

/* =========================================================
   PRIMARY
========================================================= */

.primary-filters {
  display: grid;

  grid-template-columns:
    minmax(300px, 1fr)
    210px
    180px;

  gap: 8px;
}

/* =========================================================
   SECONDARY
========================================================= */

.secondary-filters {
  display: grid;

  grid-template-columns:
    200px
    220px
    220px
    165px
    165px
    auto;

  gap: 8px;

  margin-top: 8px;
}

/* =========================================================
   DATE
========================================================= */

.date-field {
  position: relative;
}

.date-field span {
  position: absolute;

  z-index: 1;

  top: -6px;
  left: 8px;

  padding:
    0 4px;

  background:
    var(--bg-card);

  color:
    var(--text-muted);

  font-size: 7px;
}

.date-field input {
  box-sizing:
    border-box;

  width: 100%;
  height: 40px;

  padding:
    0 10px;

  border:
    1px solid var(--border);

  border-radius: 8px;

  outline: 0;

  background:
    var(--bg-card);

  color:
    var(--text-primary);

  font-family:
    inherit;

  font-size: 10px;
}

.date-field input:focus {
  border-color:
    var(--primary);

  box-shadow:
    0 0 0 3px
    rgba(36, 107, 253, 0.08);
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 1300px) {
  .secondary-filters {
    grid-template-columns:
      repeat(
        3,
        minmax(0, 1fr)
      );
  }
}

@media (max-width: 900px) {
  .primary-filters {
    grid-template-columns:
      1fr 1fr;
  }

  .primary-filters > :first-child {
    grid-column:
      1 / -1;
  }

  .scope-tabs {
    align-items: stretch;

    flex-direction: column;
  }

  .scope-tabs button {
    width: 100%;
  }
}

@media (max-width: 650px) {
  .primary-filters,
  .secondary-filters {
    grid-template-columns:
      1fr;
  }

  .primary-filters > :first-child {
    grid-column: auto;
  }
}
</style>