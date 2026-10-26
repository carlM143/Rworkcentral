<script setup lang="ts">
import { X } from 'lucide-vue-next'
const props = defineProps<{ open: boolean; title: string }>()
const emit = defineEmits<{ close: [] }>()
const dialog = ref<HTMLDialogElement | null>(null)
const headingId = useId()
let previousFocus: HTMLElement | null = null
watch(() => props.open, async open => {
  await nextTick()
  if (open && !dialog.value?.open) {
    previousFocus = document.activeElement as HTMLElement | null
    dialog.value?.showModal()
  } else if (!open) { dialog.value?.close(); previousFocus?.focus() }
}, { immediate: true })
onBeforeUnmount(() => { dialog.value?.close(); previousFocus?.focus() })
</script>

<template>
  <dialog ref="dialog" class="wage-dialog" :aria-labelledby="headingId" @cancel.prevent="emit('close')" @click="event => { if (event.target === dialog) emit('close') }">
    <header><div><h2 :id="headingId">{{ title }}</h2><p>Demo workspace · Changes apply to sample data for this session.</p></div>
      <button type="button" class="close" aria-label="Close dialog" @click="emit('close')"><X :size="20" /></button>
    </header>
    <div class="wage-dialog-content"><slot /></div>
  </dialog>
</template>

<style scoped>
.wage-dialog { width: min(880px, 94vw); max-height: 90vh; padding: 0; color: var(--text-primary); background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; }
.wage-dialog::backdrop { background: #00132a99; }
header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding: 20px 24px; border-bottom: 1px solid var(--border); }
h2 { font-size: 18px; margin: 0; } p { font-size: 12px; color: var(--text-muted); margin: 7px 0 0; }
.close { display: grid; place-items: center; min-width: 36px; min-height: 36px; border: 0; border-radius: 6px; color: inherit; background: transparent; cursor: pointer; }
.close:hover { background: var(--bg-card-soft); }
.wage-dialog-content { padding: 20px 24px; max-height: 69vh; overflow: auto; }
</style>
