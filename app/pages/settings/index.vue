
<script setup lang="ts">
import {
  Settings2,
} from 'lucide-vue-next'

import type {
  SettingsModule,
} from '~/types/settings'

import SettingsConfigurationModal from '~/components/settings/SettingsConfigurationModal.vue'

const router = useRouter()

const {
  modules,
  roles,
  stats,
  configurationStatus,
  recentActivity,
} = useSettingsOverview()

const {
  success,
} = useToast()

/* =========================================
   CONFIGURATION STATE
========================================= */

const selectedModule = ref<SettingsModule | null>(null)
const configurationOpen = ref(false)

/* =========================================
   OPEN SETTINGS
========================================= */

const handleOpenModule = (
  module: SettingsModule,
) => {
  // Users & Access has its own existing page.
  if (module.category === 'Users') {
    router.push('/settings/users')
    return
  }

  selectedModule.value = module
  configurationOpen.value = true
}

const closeConfiguration = () => {
  configurationOpen.value = false
  selectedModule.value = null
}

/* =========================================
   HEADER ACTION
========================================= */

const handleConfigureSystem = () => {
  const systemModule = modules.value.find(
    module => module.category === 'System',
  )

  if (systemModule) {
    handleOpenModule(systemModule)
  }
}

/* =========================================
   QUICK ACTIONS
========================================= */

const handleAddUser = () => {
  router.push('/settings/users')
}

const handleManageRoles = () => {
  router.push('/settings/roles')
}

const handleCompany = () => {
  const module = modules.value.find(
    item => item.category === 'Company',
  )

  if (module) {
    handleOpenModule(module)
  }
}

const handleApprovals = () => {
  const module = modules.value.find(
    item => item.category === 'Approval',
  )

  if (module) {
    handleOpenModule(module)
  }
}

/* =========================================
   SAVE CONFIGURATION
========================================= */

const handleConfigurationSaved = (
  title: string,
) => {
  success(
    'Settings Saved Locally',
    `${title} configuration has been saved in this browser.`,
  )

  closeConfiguration()
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
        @click="handleConfigureSystem"
      >
        Configure System
      </AppButton>
    </PageHeader>

    <!-- STATS -->

    <SettingsStats
      :stats="stats"
    />

    <!-- MAIN CONTENT -->

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

      <!-- SIDE PANEL -->

      <SettingsSidePanel
        :roles="roles"
        :configuration-status="configurationStatus"
        @add-user="handleAddUser"
        @manage-roles="handleManageRoles"
        @company="handleCompany"
        @approvals="handleApprovals"
      />
    </div>

    <!-- CONFIGURATION MODAL -->

    <SettingsConfigurationModal
      :open="configurationOpen"
      :module="selectedModule"
      @close="closeConfiguration"
      @saved="handleConfigurationSaved"
    />
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
  grid-template-columns: minmax(0, 1fr) 320px;
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
