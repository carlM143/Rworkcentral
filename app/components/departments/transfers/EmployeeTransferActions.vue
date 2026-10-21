<script setup lang="ts">
import { MoreHorizontal, Eye, Pencil, ClipboardCheck, Ban, CheckCircle2 } from 'lucide-vue-next'
import type { EmployeeTransfer } from '~/types/employeeTransfer'

const props = defineProps<{ transfer: EmployeeTransfer }>()
const emit = defineEmits<{
  view: [transfer: EmployeeTransfer]
  edit: [transfer: EmployeeTransfer]
  review: [transfer: EmployeeTransfer]
  cancel: [transfer: EmployeeTransfer]
  complete: [transfer: EmployeeTransfer]
}>()

const open = ref(false)
const buttonRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const style = ref({ top: '0px', left: '0px' })
const pending = computed(() => ['Pending', 'For Review'].includes(props.transfer.status))

const toggle = async () => {
  open.value = !open.value
  if (!open.value || !buttonRef.value) return
  await nextTick()
  const rect = buttonRef.value.getBoundingClientRect()
  const width = menuRef.value?.offsetWidth || 210
  const height = menuRef.value?.offsetHeight || 180
  const top = rect.bottom + height + 8 <= window.innerHeight ? rect.bottom + 6 : rect.top - height - 6
  style.value = {
    top: `${Math.max(8, Math.min(top, window.innerHeight - height - 8))}px`,
    left: `${Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8))}px`,
  }
}
const choose = (event: 'view' | 'edit' | 'review' | 'cancel' | 'complete') => {
  open.value = false
  emit(event, props.transfer)
}
const outside = (event: MouseEvent) => {
  const target = event.target as Node
  if (!buttonRef.value?.contains(target) && !menuRef.value?.contains(target)) open.value = false
}
const close = () => { open.value = false }
onMounted(() => {
  document.addEventListener('mousedown', outside)
  window.addEventListener('resize', close)
  window.addEventListener('scroll', close, true)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', outside)
  window.removeEventListener('resize', close)
  window.removeEventListener('scroll', close, true)
})
</script>

<template>
  <span class="holder">
    <button ref="buttonRef" type="button" class="trigger" aria-label="Transfer actions" :aria-expanded="open" @click.stop="toggle">
      <MoreHorizontal :size="18" />
    </button>
    <Teleport to="body">
      <div v-if="open" ref="menuRef" class="transfer-menu" :style="style">
        <button type="button" @click="choose('view')"><Eye :size="15" /> View Transfer</button>
        <button v-if="pending" type="button" @click="choose('edit')"><Pencil :size="15" /> Edit Transfer</button>
        <button v-if="pending" type="button" @click="choose('review')"><ClipboardCheck :size="15" /> Review Transfer</button>
        <button v-if="transfer.status === 'Approved'" type="button" @click="choose('complete')"><CheckCircle2 :size="15" /> Mark Completed</button>
        <button v-if="pending" type="button" class="danger" @click="choose('cancel')"><Ban :size="15" /> Cancel Transfer</button>
      </div>
    </Teleport>
  </span>
</template>

<style scoped>
.holder { display: inline-flex; }
.trigger { display: grid; width: 32px; height: 32px; place-items: center; border: 1px solid transparent; border-radius: 7px; background: transparent; color: var(--text-secondary); }
.trigger:hover, .trigger[aria-expanded="true"] { border-color: var(--border); background: var(--bg-card-soft); color: var(--primary); }
.transfer-menu { position: fixed; z-index: 9999; width: 210px; padding: 6px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-card); box-shadow: 0 16px 40px rgba(0, 0, 0, .22); }
.transfer-menu button { display: flex; align-items: center; width: 100%; min-height: 36px; gap: 9px; padding: 0 10px; border: 0; border-radius: 6px; background: transparent; color: var(--text-secondary); font-size: 11px; text-align: left; }
.transfer-menu button:hover { background: var(--bg-card-soft); color: var(--text-primary); }
.transfer-menu button.danger { color: var(--red); }
.transfer-menu button.danger:hover { background: var(--red-soft); }
</style>
