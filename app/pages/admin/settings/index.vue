<script setup lang="ts">
import {
  Settings2,
} from 'lucide-vue-next'

import type {
  SettingsModule,
} from '~/types/settings'

const {
  modules,
  stats,
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
  // Cards whose settings live inside an existing module open that module.
  const moduleRoutes: Record<string, string> = {
    '/admin/settings/timekeeping': '/admin/work-schedules',
    '/admin/settings/leave-overtime': '/admin/leave-management/leave-types',
    '/admin/settings/payroll': '/admin/payroll/payroll-group',
  }

  // Cards that have their own settings page.
  const settingsPages = [
    '/admin/settings/users',
    '/admin/settings/company',
    '/admin/settings/qr-generation',
    '/admin/settings/approvals',
    '/admin/settings/system',
  ]

  if (moduleRoutes[module.route]) {
    router.push(moduleRoutes[module.route])
    return
  }

  if (settingsPages.includes(module.route)) {
    router.push(module.route)
    return
  }

  info(
    module.title,
    `${module.title} settings UI will be implemented in the detailed settings modules.`,
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

    <!-- CONFIGURATION AREAS -->
    <SettingsConfigurationGrid
      :modules="modules"
      @open="handleOpenModule"
    />

  </section>
</template>

<style scoped>
.settings-page {
  width: 100%;

  max-width: 1660px;

  margin: 0 auto;
}
</style>