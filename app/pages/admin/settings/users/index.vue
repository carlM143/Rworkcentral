<script setup lang="ts">
import {
  ArrowLeft,
  UserPlus,
  RotateCcw,
} from 'lucide-vue-next'

import type {
  SystemUser,
} from '~/types/userAccess'
import type { SystemUserRoleOption } from '~/composables/admin/useUsersAccess'

// USER MODALS
import UserFormModal from '~/components/admin/settings/users/UserFormModal.vue'
import UserViewModal from '~/components/admin/settings/users/UserViewModal.vue'

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

  roleOptions,
  statusOptions,

  resetFilters,

  loading,
  loadError,
  loadUsers,
  loadUserEditData,
  setupUserAccount,
  updateSystemUser,
} = useUsersAccess()

const { success, warning } = useToast()

type UserModalMode = 'add' | 'view' | 'edit' | 'setup' | null

const userModalMode = ref<UserModalMode>(null)
const selectedUser = ref<SystemUser | null>(null)
const editRoleOptions = ref<SystemUserRoleOption[]>([])
const editLoading = ref(false)
const editSaving = ref(false)
const editError = ref('')

const openAddUser = () => {
  selectedUser.value = null
  userModalMode.value = 'add'
}

const openViewUser = (user: SystemUser) => {
  selectedUser.value = user
  userModalMode.value = 'view'
}

const getApiError = (problem: any) => (
  problem?.data?.errors?.role_id?.[0]
  ?? problem?.data?.errors?.email?.[0]
  ?? problem?.data?.errors?.password?.[0]
  ?? problem?.data?.errors?.password_confirmation?.[0]
  ?? problem?.data?.errors?.employee?.[0]
  ?? problem?.data?.errors?.user?.[0]
  ?? problem?.data?.message
  ?? problem?.response?._data?.message
  ?? problem?.message
  ?? 'Unable to update the system user role.'
)

const openEditUser = async (user: SystemUser) => {
  if (!user.employeeId) {
    warning(
      'Role Editing Unavailable',
      'Only linked employee user accounts can be assigned through this endpoint.',
    )
    return
  }

  selectedUser.value = user
  userModalMode.value = user.canSetupAccount ? 'setup' : 'edit'
  editRoleOptions.value = []
  editError.value = ''
  editLoading.value = true

  try {
    const response = await loadUserEditData(user)
    editRoleOptions.value = response.data.available_roles
  } catch (problem: any) {
    editError.value = getApiError(problem)
  } finally {
    editLoading.value = false
  }
}

const closeUserModal = () => {
  userModalMode.value = null
  selectedUser.value = null
  editRoleOptions.value = []
  editError.value = ''
}

const handleUserSave = async (payload: {
  email: string
  roleId?: number
  password?: string
  passwordConfirmation?: string
}) => {
  if (userModalMode.value === 'add') {
    warning(
      'Not Available',
      'The backend does not currently provide a create-system-user endpoint.',
    )
    return
  }

  if (!selectedUser.value || !payload.roleId) return

  editSaving.value = true
  editError.value = ''

  try {
    let response

    if (userModalMode.value === 'setup') {
      if (!selectedUser.value.employeeId || !payload.password) return

      response = await setupUserAccount(selectedUser.value.employeeId, {
        email: payload.email,
        role_id: payload.roleId,
        password: payload.password,
        password_confirmation: payload.passwordConfirmation ?? '',
      })
    } else {
      const updates: {
        email?: string
        role_id?: number
        password?: string
        password_confirmation?: string
      } = {}

      if (payload.email.toLowerCase() !== selectedUser.value.email.toLowerCase()) {
        updates.email = payload.email
      }

      const selectedRole = editRoleOptions.value.find(role => role.id === payload.roleId)
      if (selectedRole?.name !== selectedUser.value.role) {
        updates.role_id = payload.roleId
      }

      if (payload.password) {
        updates.password = payload.password
        updates.password_confirmation = payload.passwordConfirmation ?? ''
      }

      if (!Object.keys(updates).length) {
        warning('No Changes', 'Change the email, role, or password before saving.')
        return
      }

      response = await updateSystemUser(selectedUser.value.id, updates)
    }

    await loadUsers()
    success(
      userModalMode.value === 'setup' ? 'Account Created' : 'Account Updated',
      response.message,
    )
    closeUserModal()
  } catch (problem: any) {
    editError.value = getApiError(problem)
  } finally {
    editSaving.value = false
  }
}

const router =
  useRouter()

const handleBack = () => {
  router.push('/admin/settings')
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
        @click="openAddUser"
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

        <div
          v-if="loading"
          class="users-message"
        >
          Loading system users...
        </div>

        <div
          v-else-if="loadError"
          class="users-message error-message"
          role="alert"
        >
          <div>
            <strong>System users could not be loaded</strong>
            <p>{{ loadError }}</p>
          </div>

          <AppButton
            variant="secondary"
            size="sm"
            @click="loadUsers"
          >
            Retry
          </AppButton>
        </div>

        <SystemUsersTable
          v-else
          :users="paginatedUsers"
          @view="openViewUser"
          @edit="openEditUser"
        />

        <div
          v-if="!loading && !loadError"
          class="table-footer"
        >

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
         </div>
        </div>
    <UserFormModal
      :open="userModalMode === 'add' || userModalMode === 'edit' || userModalMode === 'setup'"
      :mode="userModalMode === 'setup' ? 'setup' : userModalMode === 'edit' ? 'edit' : 'add'"
      :user="selectedUser"
      :available-roles="editRoleOptions"
      :loading="editLoading"
      :saving="editSaving"
      :api-error="editError"
      @close="closeUserModal"
      @save="handleUserSave"
    />

    <UserViewModal
      :open="userModalMode === 'view'"
      :user="selectedUser"
      @close="closeUserModal"
      @edit="openEditUser"
    />

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
  width: 100%;
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

.users-message {
  display: flex;
  min-height: 110px;
  align-items: center;
  justify-content: center;

  padding: 16px;

  border: 1px solid var(--border);
  border-radius: 11px;

  background: var(--bg-card);
  color: var(--text-muted);

  font-size: 11px;
}

.error-message {
  min-height: auto;
  justify-content: space-between;
  gap: 16px;

  border-color: color-mix(in srgb, var(--red) 35%, var(--border));
  background: color-mix(in srgb, var(--red) 8%, var(--bg-card));
}

.error-message strong {
  color: var(--red);
  font-size: 11px;
}

.error-message p {
  margin: 3px 0 0;
  color: var(--text-secondary);
}

/* RESPONSIVE */

@media (max-width: 1100px) {
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
