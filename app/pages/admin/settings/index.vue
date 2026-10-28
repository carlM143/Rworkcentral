<script setup lang="ts">
import {
  Settings2,
} from 'lucide-vue-next'

import type {
  SettingsModule,
} from '~/types/settings'

const {
  modules,
  roles,

  stats,

  configurationStatus,

  recentActivity,
} = useSettingsOverview()

const {
  info,
} = useToast()

const router =
  useRouter()

/* =========================================================
   ACTIONS
========================================================= */

const handleOpenModule = (
  module: SettingsModule,
) => {
  if (
    module.route ===
    '/admin/settings/users'
  ) {
    router.push(
      module.route,
    )

    return
  }

  info(
    module.title,
    `${module.title} settings UI will be implemented in the detailed settings modules.`,
  )
}

const handleAddUser = () => {
  info(
    'Add System User',
    'User creation UI will be implemented in Users & Access.',
  )
}

const handleManageRoles = () => {
  router.push(
    '/admin/settings/roles',
  )
}

const handleCompany = () => {
  info(
    'Company Settings',
    'Company information settings UI will be implemented later.',
  )
}

const handleApprovals = () => {
  info(
    'Approval Workflow',
    'Approval workflow configuration UI will be implemented later.',
  )
}
</script>

<template>
  <section class="settings-page">

    <!-- HEADER -->
    <PageHeader
      title="Settings"
      description="Manage company configuration, system users, access control and HRIS preferences."
    >
      <AppButton
        :icon="Settings2"
        @click="
          info(
            'System Configuration',
            'Select a configuration area below to manage HRIS settings.',
          )
        "
      >
        Configure System
      </AppButton>
    </PageHeader>

    <!-- STATS -->
    <SettingsStats
      :stats="stats"
    />

    <!-- MAIN -->
    <div class="settings-layout">

      <div class="settings-main">

        <SettingsConfigurationGrid
          :modules="modules"
          @open="handleOpenModule"
        />

        <RecentSettingsActivity
          :activities="recentActivity"
        />

      </div>

      <SettingsSidePanel
        :roles="roles"
        :configuration-status="
          configurationStatus
        "
        @add-user="handleAddUser"
        @manage-roles="handleManageRoles"
        @company="handleCompany"
        @approvals="handleApprovals"
      />

    </div>

  </section>
</template>

<style scoped>
.settings-page {
  width: 100%;

  max-width: 1660px;

  margin: 0 auto;
}

.settings-layout {
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    320px;

  gap: 14px;
}

.settings-main {
  display: flex;

  min-width: 0;

  flex-direction: column;

  gap: 14px;
}

@media (max-width: 1100px) {
  .settings-layout {
    grid-template-columns: 1fr;
  }
}
</style>