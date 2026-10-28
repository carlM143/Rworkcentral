<script setup lang="ts">
import { X } from 'lucide-vue-next'

const props = defineProps<{ title: string; subtitle?: string; wide?: boolean }>()
const open = defineModel<boolean>({ default: false })
const dialog = ref<HTMLDialogElement | null>(null)
const slots = useSlots()
const hasActions = computed(() => Boolean(slots.actions))

const handleClose = () => {
  // A queued close event from a previous record must not dismiss a reopened one.
  if (!dialog.value?.open) open.value = false
}
watch(open, value => {
  if (value && !dialog.value?.open) dialog.value?.showModal()
  else if (!value) dialog.value?.close()
}, { flush: 'post' })
onMounted(() => { if (open.value) dialog.value?.showModal() })
</script>

<template>
  <dialog ref="dialog" class="record-dialog" :class="{ 'wide-dialog': props.wide }" :aria-label="props.title" @close="handleClose" @cancel="open = false">
    <header>
      <div>
        <h2>{{ props.title }}</h2>
        <p v-if="props.subtitle">{{ props.subtitle }}</p>
      </div>
      <button type="button" class="close-record" aria-label="Close details" @click="open = false">
        <X :size="18" />
      </button>
    </header>
    <div class="record-content"><slot /></div>
    <footer :class="{ 'has-actions': hasActions }">
      <slot name="actions" />
      <button type="button" class="record-close-button" @click="open = false">Close</button>
    </footer>
  </dialog>
</template>

<style scoped>
.record-dialog.wide-dialog { width: min(1120px, calc(100% - 24px)); }
.record-dialog {
  width: min(520px, calc(100% - 24px));
  max-height: calc(100dvh - 32px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px));
  padding: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  border: 1px solid var(--border);
  border-radius: 14px;
  color: var(--text-primary);
  background: var(--bg-card);
  box-shadow: 0 15px 60px #0003;
}
.record-dialog::backdrop {
  background: #04152d80;
  backdrop-filter: blur(2px);
}
header {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border-soft);
  background: var(--bg-card);
}
header > div { min-width: 0; }
h2 { margin: 0; font-size: 15px; font-weight: 600; }
p { margin: 3px 0 0; color: var(--text-secondary); font-size: 11px; overflow-wrap: anywhere; }
.close-record {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  min-width: 34px;
  min-height: 34px;
  border: 0;
  border-radius: 8px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  cursor: pointer;
  transition: background .15s ease, color .15s ease;
}
.close-record:hover {
  background: var(--border);
  color: var(--text-primary);
}
.close-record:focus {
  outline: none;
}
.close-record:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
.record-content {
  padding: 16px 18px;
}
footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  padding: 0 18px 16px;
}
.record-close-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 38px;
  min-height: 38px;
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-primary);
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s ease;
}
.record-close-button:hover {
  background: var(--bg-card-soft);
}
.record-close-button:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

@media (max-width: 640px) {
  .record-dialog {
    width: min(480px, calc(100% - 20px));
    max-height: min(90dvh, calc(100dvh - 20px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)));
    border-radius: 14px;
    margin: auto;
  }
  header {
    padding: 12px 16px;
  }
  h2 {
    font-size: 14px;
  }
  p {
    font-size: 11px;
    margin: 2px 0 0;
  }
  .close-record {
    width: 32px;
    height: 32px;
    min-width: 32px;
    min-height: 32px;
  }
  .record-content {
    padding: 14px 16px;
  }
  footer {
    padding: 0 16px 14px;
    gap: 8px;
  }
  footer.has-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  footer.has-actions > * {
    width: 100%;
  }
  footer:not(.has-actions) .record-close-button {
    width: 100%;
  }
  .record-close-button {
    height: 38px;
    min-height: 38px;
    font-size: 12px;
    padding: 8px 12px;
  }
}
</style>
