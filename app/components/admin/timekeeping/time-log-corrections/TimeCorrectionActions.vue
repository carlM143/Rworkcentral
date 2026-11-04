
<script setup lang="ts">
import {
  Eye,
  Check,
  X,
  Play,
} from 'lucide-vue-next'

import type {
  TimeLogCorrectionRequest,
} from '~/types/timeLogCorrection'

const props = defineProps<{
  request: TimeLogCorrectionRequest
}>()

const emit = defineEmits<{
  view: []
  approve: []
  reject: []
  apply: []
}>()

const status = computed(() =>
  String(props.request.status).toLowerCase()
)
</script>

<template>
  <div class="correction-actions">

    <button
      type="button"
      class="action-btn view"
      title="View Details"
      @click="emit('view')"
    >
      <Eye :size="15" />
      View
    </button>

    <template v-if="status === 'pending'">
      <button
        type="button"
        class="action-btn approve"
        title="Approve Request"
        @click="emit('approve')"
      >
        <Check :size="15" />
        Approve
      </button>

      <button
        type="button"
        class="action-btn reject"
        title="Reject Request"
        @click="emit('reject')"
      >
        <X :size="15" />
        Reject
      </button>
    </template>

    <button
      v-if="status === 'approved'"
      type="button"
      class="action-btn apply"
      title="Apply approved correction to employee time log"
      @click="emit('apply')"
    >
      <Play :size="15" />
      Apply to Time Log
    </button>

  </div>
</template>

<style scoped>
.correction-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  min-height: 32px;
  padding: 7px 10px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--bg-card);
  color: var(--text-secondary);
  font-family: inherit;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s ease, border-color .15s ease;
}

.action-btn:hover {
  background: var(--bg-card-soft);
}

.action-btn:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.action-btn.view {
  color: var(--primary);
}

.action-btn.approve {
  color: #16a34a;
  border-color: #16a34a40;
}

.action-btn.reject {
  color: #dc2626;
  border-color: #dc262640;
}

.action-btn.apply {
  color: white;
  background: #2563eb;
  border-color: #2563eb;
}

.action-btn.apply:hover {
  background: #1d4ed8;
}
</style>
