<script setup lang="ts">
import WfhRequestsPanel from '~/components/admin/wfh/WfhRequestsPanel.vue'
import WfhDocumentsPanel from '~/components/admin/wfh/WfhDocumentsPanel.vue'

// Entry point used by pages/admin/wfh/requests.vue and documents.vue.
defineProps<{ page: 'requests' | 'list' | 'documents' }>()
</script>

<template>
  <WfhDocumentsPanel v-if="page === 'documents'" />
  <WfhRequestsPanel v-else />
</template>