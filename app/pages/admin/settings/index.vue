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
  const pages = [
    '/admin/settings/users',
    '/admin/settings/company',
    '/admin/settings/qr-generation',
    '/admin/settings/timekeeping',
    '/admin/settings/leave-overtime',
    '/admin/settings/payroll',
    '/admin/settings/approvals',
    '/admin/settings/system',
  ]

  if (pages.includes(module.route)) {
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