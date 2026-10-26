<script setup lang="ts">
import { Ellipsis } from 'lucide-vue-next'
defineProps<{ label: string; items: { key: string; label: string; disabled?: boolean; reason?: string }[] }>()
const emit = defineEmits<{ select: [key: string] }>()
const open = ref(false)
const trigger = ref<HTMLButtonElement | null>(null)
const menu = ref<HTMLDivElement | null>(null)
const style = ref<Record<string, string>>({ position: 'fixed', left: '-9999px', top: '0' })
const menuId = useId()
const close = (restore = false) => { open.value = false; if (restore) trigger.value?.focus() }
const toggle = async () => {
  if (open.value) { close(); return }
  open.value = true
  await nextTick()
  const rect = trigger.value!.getBoundingClientRect()
  const height = menu.value?.offsetHeight ?? 220
  style.value = { position: 'fixed', zIndex: '10000', width: '230px',
    left: `${Math.max(8, Math.min(rect.right - 230, window.innerWidth - 238))}px`,
    top: `${rect.bottom + height + 8 <= window.innerHeight ? rect.bottom + 6 : Math.max(8, rect.top - height - 6)}px` }
  await nextTick()
  menu.value?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus()
}
const choose = (key: string) => { close(true); emit('select', key) }
const outside = (event: PointerEvent) => {
  if (!trigger.value?.contains(event.target as Node) && !menu.value?.contains(event.target as Node)) close()
}
const keydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') { event.preventDefault(); close(true); return }
  if (event.key === 'Tab') { close(true); return }
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  const buttons = [...menu.value!.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')]
  const index = buttons.indexOf(document.activeElement as HTMLButtonElement)
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length
  buttons[next]?.focus()
}
const onScroll = (event: Event) => { if (!menu.value?.contains(event.target as Node)) close() }
const onResize = () => close()
onMounted(() => { document.addEventListener('pointerdown', outside); window.addEventListener('wheel', onScroll, true); window.addEventListener('touchmove', onScroll, true); window.addEventListener('resize', onResize) })
onBeforeUnmount(() => { document.removeEventListener('pointerdown', outside); window.removeEventListener('wheel', onScroll, true); window.removeEventListener('touchmove', onScroll, true); window.removeEventListener('resize', onResize) })
</script>

<template>
  <button ref="trigger" type="button" class="wage-action-trigger" :aria-label="label" aria-haspopup="menu" :aria-expanded="open" :aria-controls="menuId" @click.stop="toggle" @keydown.down.prevent="toggle"><Ellipsis :size="19" /></button>
  <Teleport to="body"><div v-if="open" :id="menuId" ref="menu" role="menu" :aria-label="label" class="wage-action-menu" :style="style" @keydown="keydown">
    <button v-for="item in items" :key="item.key" type="button" role="menuitem" :disabled="item.disabled" :title="item.reason" @click="choose(item.key)">{{ item.label }}<small v-if="item.disabled && item.reason">{{ item.reason }}</small></button>
  </div></Teleport>
</template>

<style scoped>
.wage-action-trigger { display: inline-grid; place-items: center; width: 36px; height: 36px; color: var(--text-secondary); border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card); cursor: pointer; }
.wage-action-trigger:hover, .wage-action-trigger[aria-expanded="true"] { color: var(--primary); border-color: var(--primary); }
.wage-action-menu { padding: 6px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-card); color: var(--text-primary); box-shadow: 0 12px 35px #0004; max-height: 80vh; overflow-y: auto; }
.wage-action-menu button { display: block; padding: 10px 12px; width: 100%; border: 0; border-radius: 6px; background: transparent; color: inherit; text-align: left; font-size: 12px; cursor: pointer; }
.wage-action-menu button:hover:not(:disabled), .wage-action-menu button:focus-visible { background: var(--primary-soft); }
.wage-action-menu button:disabled { opacity: .55; cursor: default; } small { display: block; margin-top: 4px; font-size: 10px; line-height: 1.4; }
</style>
