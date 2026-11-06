
<!-- pages index -->
<script setup lang="ts">
import {
  Plus,
  Users,
  UsersRound,
  CalendarDays,
} from 'lucide-vue-next'

import type {
  PayrollGroup,
  PayrollGroupPayload,
} from '~/types/payroll/payroll-groups/payrollGroup'

const api = usePayrollGroup()

const {
  groups,
  stats,
  loading,
  saving,
  error,
} = api

const search = ref('')
const status = ref('')
const currentPage = ref(1)

const perPage = 8

const showForm = ref(false)
const showDetails = ref(false)
const showAssignments = ref(false)

const selectedGroup = ref<PayrollGroup | null>(null)

const successMessage = ref('')

const filteredGroups = computed(() => groups.value)

const totalPages = computed(() =>
  Math.max(
    1,
    Math.ceil(filteredGroups.value.length / perPage),
  ),
)

const paginatedGroups = computed(() =>
  filteredGroups.value.slice(
    (currentPage.value - 1) * perPage,
    currentPage.value * perPage,
  ),
)

const showingFrom = computed(() =>
  filteredGroups.value.length
    ? (currentPage.value - 1) * perPage + 1
    : 0,
)

const showingTo = computed(() =>
  Math.min(
    currentPage.value * perPage,
    filteredGroups.value.length,
  ),
)

const fetchGroups = async () => {
  try {
    await api.fetchGroups({
      search: search.value,
      is_active:
        status.value === ''
          ? null
          : status.value === 'Active',
    })

    currentPage.value = Math.min(
      currentPage.value,
      totalPages.value,
    )
  } catch {
    // Error is available through api.error.
  }
}

let filterTimer: ReturnType<typeof setTimeout> | undefined

watch([search, status], () => {
  currentPage.value = 1

  clearTimeout(filterTimer)

  filterTimer = setTimeout(() => {
    fetchGroups()
  }, 350)
})

watch(totalPages, count => {
  currentPage.value = Math.min(
    currentPage.value,
    count,
  )
})

onMounted(() => {
  fetchGroups()
})

onBeforeUnmount(() => {
  clearTimeout(filterTimer)
})

const resetFilters = () => {
  search.value = ''
  status.value = ''
  currentPage.value = 1
}

const openCreate = () => {
  selectedGroup.value = null
  showForm.value = true
}

const handleAction = async (
  action: 'view' | 'edit' | 'employees' | 'delete',
  group: PayrollGroup,
) => {
  successMessage.value = ''
  error.value = null

  if (action === 'delete') {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${group.group_name}"? This action cannot be undone.`,
    )

    if (!confirmed) return

    try {
      const result = await api.deleteGroup(group.id)

      successMessage.value =
        result.message || 'Payroll group deleted successfully.'

      await fetchGroups()
    } catch (err) {
      error.value = api.getErrorMessage(err)
    }

    return
  }

  if (action === 'edit') {
    try {
      selectedGroup.value = await api.fetchGroup(group.id)
      showForm.value = true
    } catch (err) {
      error.value = api.getErrorMessage(err)
    }

    return
  }

  if (action === 'view') {
    try {
      selectedGroup.value = await api.fetchGroup(group.id)
      showDetails.value = true
    } catch (err) {
      error.value = api.getErrorMessage(err)
    }

    return
  }

  if (action === 'employees') {
    await navigateTo(`/admin/payroll/payroll-group/assign-employee/create?group=${group.id}`)
    return
  }
}

const handleSave = async (
  payload: PayrollGroupPayload,
) => {
  try {
    if (selectedGroup.value) {
      const result = await api.updateGroup(
        selectedGroup.value.id,
        payload,
      )

      successMessage.value =
        result.message || 'Payroll group updated successfully.'
    } else {
      const result = await api.createGroup(payload)

      successMessage.value =
        result.message || 'Payroll group created successfully.'
    }

    showForm.value = false
    selectedGroup.value = null
  } catch (err) {
    error.value = api.getErrorMessage(err)
  }
}

const handleAssignmentUpdate = async () => {
  await fetchGroups()
}
</script>

<template>
  <section class="payroll-group-page">

    <PageHeader
      title="Payroll Groups"
      description="Organize employees by payroll frequency and manage group assignments."
    >
      <AppButton
        :icon="Plus"
        @click="openCreate"
      >
        Add Payroll Group
      </AppButton>
    </PageHeader>

    <!-- ALERTS -->

    <div
      v-if="error"
      class="page-alert error-alert"
    >
      <span>{{ error }}</span>

      <button @click="error = null">
        ×
      </button>
    </div>

    <div
      v-if="successMessage"
      class="page-alert success-alert"
    >
      <span>{{ successMessage }}</span>

      <button @click="successMessage = ''">
        ×
      </button>
    </div>

    <!-- STATISTICS -->

    <div class="stats-grid">
      <StatCard
        label="Total Payroll Groups"
        :value="stats.total"
        description="All configured payroll groups"
        :icon="Users"
        tone="blue"
      />

      <StatCard
        label="Active Groups"
        :value="stats.active"
        description="Available for new assignments"
        :icon="CalendarDays"
        tone="green"
      />

      <StatCard
        label="Inactive Groups"
        :value="stats.inactive"
        description="Groups currently deactivated"
        :icon="UsersRound"
        tone="orange"
      />
    </div>

    <!-- FILTERS -->

    <PayrollGroupFilter
      v-model:search="search"
      v-model:status="status"
      @reset="resetFilters"
    />

    <!-- TABLE -->

    <PayrollGroupTable
      v-model:page="currentPage"
      :groups="paginatedGroups"
      :loading="loading"
      :showing-from="showingFrom"
      :showing-to="showingTo"
      :total-items="filteredGroups.length"
      :total-pages="totalPages"
      @action="handleAction"
    />

    <!-- CREATE / EDIT -->

    <PayrollGroupFormModal
      :open="showForm"
      :group="selectedGroup"
      :saving="saving"
      @close="showForm = false"
      @save="handleSave"
    />

    <!-- DETAILS -->

    <PayrollGroupDetailsModal
      :open="showDetails"
      :group="selectedGroup"
      @close="showDetails = false"
      @employees="group => {
        showDetails = false
        selectedGroup = group
        showAssignments = true
      }"
    />

  </section>
</template>

<style scoped>
.payroll-group-page {
  width: 100%;
  min-width: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin: 14px 0;
}

.page-alert {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 12px 0;
  padding: 11px 14px;
  border-radius: 8px;
  font-size: 12px;
}

.page-alert button {
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 18px;
  cursor: pointer;
}

.error-alert {
  background: rgb(248 113 113 / 10%);
  color: var(--red);
}

.success-alert {
  background: rgb(34 197 94 / 10%);
  color: var(--green);
}

@media(max-width: 850px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media(max-width: 550px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>