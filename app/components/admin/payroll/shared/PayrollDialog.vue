<script setup lang="ts">
import { X } from 'lucide-vue-next'
const props = defineProps<{ open: boolean; title: string; description?: string }>()
const emit = defineEmits<{ close: [] }>()
const element = ref<HTMLDialogElement | null>(null)
const titleId = useId()
let previousFocus: HTMLElement | null = null
watch(() => props.open, async open => {
  await nextTick()
  if (open && !element.value?.open) {
    previousFocus = document.activeElement as HTMLElement | null
    element.value?.showModal()
  } else if (!open) { element.value?.close(); previousFocus?.focus() }
}, { immediate: true })
onBeforeUnmount(() => { element.value?.close(); previousFocus?.focus() })
</script>

<template>
  <dialog ref="element" class="payroll-dialog" :aria-labelledby="titleId" @cancel.prevent="emit('close')" @click="event => { if (event.target === element) emit('close') }">
    <header><div><h2 :id="titleId">{{ title }}</h2><p v-if="description">{{ description }}</p></div><button type="button" aria-label="Close dialog" @click="emit('close')"><X :size="20" /></button></header>
    <div v-if="open" class="payroll-dialog-content"><slot /></div>
  </dialog>
</template>

<style scoped>
.payroll-dialog { width:min(1000px,94vw);max-height:90vh;padding:0;border:1px solid var(--border);border-radius:14px;color:var(--text-primary);background:var(--bg-card); }
.payroll-dialog::backdrop { background:#00132a99; }
header { display:flex;justify-content:space-between;align-items:flex-start;gap:14px;padding:20px 24px;border-bottom:1px solid var(--border); }
h2 { margin:0;font-size:18px; } p { margin:7px 0 0;font-size:12px;color:var(--text-muted); }
header button { display:grid;place-items:center;width:36px;height:36px;border:0;border-radius:7px;background:transparent;color:inherit;cursor:pointer; }
header button:hover { background:var(--bg-card-soft); }
.payroll-dialog-content { max-height:68vh;overflow:auto;padding:20px 24px; }
</style>
