<script setup lang="ts">
const props = defineProps<{ title: string; subtitle?: string; wide?: boolean }>()
const open = defineModel<boolean>({ default: false })
const dialog = ref<HTMLDialogElement | null>(null)
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
    <header><div><h2>{{ props.title }}</h2><p v-if="props.subtitle">{{ props.subtitle }}</p></div><button type="button" class="close-record" aria-label="Close details" @click="open = false">×</button></header>
    <div class="record-content"><slot /></div>
    <footer><slot name="actions" /><button type="button" class="record-close-button" @click="open = false">Close</button></footer>
  </dialog>
</template>

<style scoped>
.record-dialog.wide-dialog { width: min(1120px, calc(100% - 24px)); }
.record-dialog { width: min(560px, calc(100% - 24px)); max-height: calc(100dvh - 32px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)); padding: 0; overflow-y: auto; overscroll-behavior: contain; border: 1px solid var(--border); border-radius: 14px; color: var(--text-primary); background: var(--bg-card); box-shadow: 0 15px 60px #0003; }.record-dialog::backdrop { background: #04152d80; }header { position: sticky; top: 0; z-index: 1; display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 16px; border-bottom: 1px solid var(--border-soft); background: var(--bg-card); }header > div { min-width: 0; }h2 { margin: 0; font-size: 16px; }p { margin: 5px 0 0; color: var(--text-secondary); font-size: 12px; overflow-wrap: anywhere; }.close-record { flex-shrink: 0; width: 44px; height: 44px; border: 0; border-radius: 8px; background: var(--bg-card-soft); color: var(--text-secondary); font-size: 25px; }.record-content { padding: 18px 16px; }footer { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 10px; padding: 0 16px 16px; }.record-close-button { min-height: 44px; padding: 10px 16px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card); color: var(--text-primary); font: inherit; font-size: 13px; }button:focus-visible { outline: 2px solid var(--primary); outline-offset: -3px; }
</style>
