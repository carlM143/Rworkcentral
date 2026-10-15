<script setup lang="ts">
import {
  ArrowLeft,
  UserPlus,
  RotateCcw,
} from 'lucide-vue-next'

import type {
  SystemUser,
} from '~/types/userAccess'

const {
  search,
  role,
  status,

  currentPage,

  filteredUsers,
  paginatedUsers,

  totalPages,
  showingFrom,
  showingTo,

  stats,

  roleSummary,
  securityIssues,

  recentActivity,

  roleOptions,
  statusOptions,

  resetFilters,
} = useUsersAccess()

const router =
  useRouter()

const {
  info,
} = useToast()

const handleBack = () => {
  router.push(
    '/settings',
  )
}

const handleAddUser = () => {
  info(
    'Add System User',
    'System user creation form will be implemented next.',
  )
}

const handleView = (
  user: SystemUser,
) => {
  info(
    'User Access',
    `${user.name} — ${user.role}`,
  )
}

const handleEdit = (
  user: SystemUser,
) => {
  info(
    'Edit User',
    `${user.name} access settings will be editable in the user management form.`,
  )
}

const handleRoles = () => {
  router.push(
    '/settings/roles',
  )
}

const handlePermissionMatrix = () => {
  router.push(
    '/settings/roles',
  )
}
</script>

<template>
  <section class="access-page">

    <!-- BACK -->
    <button
      type="button"
      class="back-button"
      @click="handleBack"
    >
      <ArrowLeft :size="15" />

      Back to Settings
    </button>

    <!-- HEADER -->
    <PageHeader
      title="Users & Access"
      description="Manage system users, account roles, access status and security permissions."
    >

      <AppButton
        :icon="UserPlus"
        @click="handleAddUser"
      >
        Add System User
      </AppButton>

    </PageHeader>

    <!-- STATS -->
    <UsersAccessStats
      :stats="stats"
    />

    <!-- FILTERS -->
    <div class="access-filters">

      <AppInput
        v-model="search"
        searchable
        clearable
        placeholder="Search user, email or employee ID..."
      />

      <AppSelect
        v-model="role"
        :options="roleOptions"
        placeholder="All Roles"
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

    <!-- MAIN -->
    <div class="access-layout">

      <div class="access-main">

        <SystemUsersTable
          :users="paginatedUsers"
          @view="handleView"
          @edit="handleEdit"
        />

        <div class="table-footer">

          <p>
            Showing

            <strong>
              {{ showingFrom }}–{{ showingTo }}
            </strong>

            of

            <strong>
              {{ filteredUsers.length }}
            </strong>

            system users
          </p>

          <AppPagination
            v-model="currentPage"
            :total-pages="totalPages"
          />

        </div>

        <RecentAccessActivity
          :activities="recentActivity"
        />

      </div>

      <UsersAccessSidePanel
        :role-summary="roleSummary"
        :security-issues="securityIssues"
        @add-user="handleAddUser"
        @manage-roles="handleRoles"
        @permission-matrix="
          handlePermissionMatrix
        "
      />

    </div>

  </section>
</template>

<style scoped>
.access-page {
  width: 100%;

  max-width: 1660px;

  margin: 0 auto;
}

/* BACK */

.back-button {
  display: inline-flex;

  align-items: center;

  gap: 6px;

  margin-bottom: 10px;

  padding: 0;

  border: 0;

  background: transparent;
  color: var(--primary);

  font-size: 10px;
  font-weight: 600;

  cursor: pointer;
}

/* FILTERS */

.access-filters {
  display: grid;

  grid-template-columns:
    minmax(320px, 1fr)
    220px
    190px
    auto;

  gap: 8px;

  margin-bottom: 14px;

  padding: 10px;

  border: 1px solid var(--border);
  border-radius: 10px;

  background: var(--bg-card);

  box-shadow: var(--shadow);
}

.access-filters :deep(input) {
  font-size: 11px;
}

.access-filters :deep(select) {
  font-size: 11px;
}

.access-filters :deep(button) {
  font-size: 10px;
}

/* MAIN */

.access-layout {
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    320px;

  gap: 14px;
}

.access-main {
  display: flex;

  min-width: 0;

  flex-direction: column;

  gap: 14px;
}

/* FOOTER */

.table-footer {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 20px;

  padding: 2px 3px 0;
}

.table-footer p {
  margin: 0;

  color: var(--text-muted);

  font-size: 11px;
}

.table-footer strong {
  color: var(--text-primary);

  font-size: 11px;
  font-weight: 650;
}

/* RESPONSIVE */

@media (max-width: 1100px) {
  .access-layout {
    grid-template-columns: 1fr;
  }

  .access-filters {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 650px) {
  .access-filters {
    grid-template-columns: 1fr;
  }

  .table-footer {
    flex-direction: column;

    align-items: flex-start;
  }
}
</style>