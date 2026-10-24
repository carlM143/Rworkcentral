<script setup lang="ts">
import {
  ArrowLeft,
  Plus,
} from 'lucide-vue-next'

import type {
  SystemUserRole,
} from '~/types/userAccess'

const {
  roles,

  permissionMatrix,

  selectedRole,
  selectedRoleDetails,
  selectedRolePermissions,

  permissionSummary,

  stats,
} = useRolesPermissions()

const router =
  useRouter()

const {
  info,
} = useToast()

const createRoleOpen =
  ref(false)

const permissionsOpen =
  ref(false)

const handleBack = () => {
  router.push(
    '/admin/settings/users',
  )
}

const handleSelectRole = (
  role:
    SystemUserRole,
) => {
  selectedRole.value =
    role
}

const handleCreateRole = () => {
  createRoleOpen.value = true
}

const handleEditPermissions = () => {
  permissionsOpen.value = true
}

const handleCloneRole = () => {
  info(
    'Clone Role',
    `${selectedRole.value} can be used as the template for a custom role.`,
  )
}

const handleSaveRole = (
  data: {
    name: string
    description: string
    cloneFrom: string
    defaultPermission: string
  },
) => {
  console.log(
    'CREATE ROLE:',
    data,
  )

  createRoleOpen.value = false

  info(
    'Role Ready',
    `${data.name} has passed the frontend role setup.`,
  )
}

const handleSavePermissions = (
  permissions: {
    module: string
    permission: PermissionLevel
  }[],
) => {
  console.log(
    'UPDATED PERMISSIONS:',
    selectedRole.value,
    permissions,
  )

  permissionsOpen.value = false

  info(
    'Permissions Updated',
    `${selectedRole.value} permission changes are ready for backend integration.`,
  )
}
</script>

<template>
  <section class="roles-page">

    <!-- BACK -->
    <button
      type="button"
      class="back-button"
      @click="handleBack"
    >
      <ArrowLeft :size="15" />

      Back to Users & Access
    </button>

    <!-- HEADER -->
    <PageHeader
      title="Roles & Permissions"
      description="Manage HRIS roles, assigned users and module-level access permissions."
    >

      <AppButton
        :icon="Plus"
        @click="handleCreateRole"
      >
        Create Role
      </AppButton>

    </PageHeader>

    <!-- STATS -->
    <RolePermissionStats
      :stats="stats"
    />

    <!-- TOP -->
    <div class="roles-layout">

      <RoleDirectory
        :roles="roles"
        :selected-role="
          selectedRole
        "
        @select="
          handleSelectRole
        "
      />

      <RolesSidePanel
        :role="
          selectedRoleDetails
        "
        :summary="
          permissionSummary
        "
        @create-role="
          handleCreateRole
        "
        @edit-permissions="
          handleEditPermissions
        "
        @clone-role="
          handleCloneRole
        "
      />

    </div>

    <!-- MATRIX -->
    <PermissionMatrix
      :rows="
        permissionMatrix
      "
    />

    <CreateRoleModal
  :open="createRoleOpen"
  @close="
    createRoleOpen = false
  "
  @save="handleSaveRole"
/>

<EditPermissionsModal
  :open="permissionsOpen"
  :role-name="selectedRole"
  :permissions="
    selectedRolePermissions
  "
  @close="
    permissionsOpen = false
  "
  @save="
    handleSavePermissions
  "
/>

  </section>
</template>

<style scoped>
.roles-page {
  width: 100%;

  max-width: 1660px;

  margin: 0 auto;
}

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

.roles-layout {
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    320px;

  gap: 14px;

  margin-bottom: 14px;
}

@media (max-width: 1100px) {
  .roles-layout {
    grid-template-columns: 1fr;
  }
}
</style>