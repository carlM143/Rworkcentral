<script setup lang="ts">
import {
  Plus,
  RotateCcw,
} from 'lucide-vue-next'

import type {
  WorkSchedule,
} from '~/types/workSchedule'

import { useWorkSchedules } from '~/composables/admin/employeeSchedule/useWorkSchedules'

const {
  schedules,
  scheduleTypeNames,
  loading,
  saving,
  errorMessage,
  search,
  type,
  status,
  filteredSchedules,
  stats,
  resetFilters,
  loadSchedules,
  toggleScheduleStatus,
} = useWorkSchedules()

const router = useRouter()

const {
  success,
  error: showError,
} = useToast()

const statusOptions = ['Active', 'Inactive']

// LOAD SCHEDULES
onMounted(async () => {
  try {
    await loadSchedules()
  } catch (error) {
    reportError(error, 'Unable to load schedule information.')
  }
})

// API ERROR HANDLING
const reportError = (problem: unknown, fallback: string) => {
  const err = problem as {
    data?: {
      message?: string
      errors?: Record<string, string[]>
    }
    message?: string
  }

  const validationError = Object.values(
    err?.data?.errors ?? {},
  ).flat()[0]

  showError(
    'Work Schedule Error',
    validationError || err?.data?.message || err?.message || fallback,
  )
}

const handleAddSchedule = () => {
  if (!scheduleTypeNames.value.length) {
    showError(
      'Schedule Types Unavailable',
      'Schedule types could not be loaded from Laravel.',
    )
    return
  }

  router.push('/admin/work-schedules/create')
}

// OPEN EDIT MODAL
const handleEditSchedule = (schedule: WorkSchedule) => {
  router.push(`/admin/work-schedules/${schedule.id}/edit`)
}

// ACTIVATE / DEACTIVATE SCHEDULE
const handleToggleScheduleStatus = async (
  schedule: WorkSchedule,
) => {
  try {
    const response = await toggleScheduleStatus(schedule)

    if (response) {
      success(
        'Schedule Status Updated',
        response.message,
      )
    }
  } catch (error) {
    reportError(error, 'Could not change schedule status.')
  }
}

</script>

<template>
  <section class="work-schedules-page">
    <p v-if="loading" role="status">
      Loading work schedules...
    </p>

    <p v-if="errorMessage" role="alert">
      {{ errorMessage }}
    </p>

    <PageHeader
      title="Work Schedules"
      description="Manage reusable employee shifts, working hours, break periods and schedule assignments."
    >
      <AppButton
        :icon="Plus"
        :disabled="loading || saving"
        @click="handleAddSchedule"
      >
        Add Schedule
      </AppButton>
    </PageHeader>

    <!-- STATS -->
    <WorkScheduleStats :stats="stats" />

    <!-- FILTERS -->
    <div class="schedule-filters">
      <AppInput
        v-model="search"
        searchable
        clearable
        placeholder="Search schedule name or code..."
      />

      <AppSelect
        v-model="type"
        :options="scheduleTypeNames"
        placeholder="All Schedule Types"
      />

      <AppSelect
        v-model="status"
        :options="statusOptions"
        placeholder="All Status"
      />

      <AppButton
        variant="secondary"
        :icon="RotateCcw"
        @click="resetFilters"
      >
        Reset
      </AppButton>
    </div>

    <!-- SCHEDULE DIRECTORY -->
    <WorkScheduleDirectory
      :schedules="filteredSchedules"
      @edit="handleEditSchedule"
      @toggle-status="handleToggleScheduleStatus"
    />

  </section>
</template>

<style scoped>
.work-schedules-page {
  width: 100%;
  max-width: 1660px;
  margin: 0 auto;
}

.schedule-filters {
  display: grid;
  grid-template-columns: minmax(300px, 1fr) 220px 170px auto;
  gap: 8px;
  margin-bottom: 14px;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

@media (max-width: 1100px) {
  .schedule-filters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 650px) {
  .schedule-filters {
    grid-template-columns: 1fr;
  }
}
</style>
