<script setup lang="ts">
import AppModalShell from '~/components/shared/AppModalShell.vue'

/**
 * Small confirmation dialog. The parent runs the action on "confirm"
 * and passes back busy/error so the dialog can show progress.
 */
withDefaults(defineProps<{
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  busy?: boolean
  error?: string
}>(), {
  confirmLabel: 'Confirm',
  danger: false,
  busy: false,
  error: '',
})

const emit = defineEmits<{ close: [], confirm: [] }>()
</script>

<template>
  <AppModalShell :title="title" :busy="busy" @close="emit('close')">
    <p class="detail-text">{{ message }}</p>
    <p v-if="error" class="error">{{ error }}</p>
    <div class="modal-actions">
      <button type="button" class="btn ghost" :disabled="busy" @click="emit('close')">Cancel</button>
      <button
        type="button"
        class="btn"
        :class="danger ? 'reject' : 'primary'"
        :disabled="busy"
        @click="emit('confirm')"
      >
        {{ busy ? 'Saving...' : confirmLabel }}
      </button>
    </div>
  </AppModalShell>
</template>