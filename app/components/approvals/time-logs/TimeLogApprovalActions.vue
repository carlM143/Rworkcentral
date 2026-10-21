<script setup lang="ts">
import { MoreHorizontal, Eye, Check, X, ClipboardCheck } from 'lucide-vue-next'
import type { TimeLogApproval } from '~/types/timeLogApproval'

const props = defineProps<{ request: TimeLogApproval }>()
const emit = defineEmits<{
  view: [request: TimeLogApproval]
  approve: [request: TimeLogApproval]
  reject: [request: TimeLogApproval]
  review: [request: TimeLogApproval]
}>()

const open = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const position = ref({ top: '0px', left: '0px' })
const pending = computed(() => ['Pending', 'For Review'].includes(props.request.status))

const close = () => { open.value = false }

const updatePosition = () => {
  if (!triggerRef.value || !import.meta.client) return
  const rect = triggerRef.value.getBoundingClientRect()
  const width = menuRef.value?.offsetWidth ?? 205
  const height = menuRef.value?.offsetHeight ?? 150
  const padding = 10
  const left = Math.max(padding, Math.min(rect.right - width, window.innerWidth - width - padding))
  const top = rect.bottom + height + 6 > window.innerHeight
    ? Math.max(padding, rect.top - height - 6)
    : rect.bottom + 6
  position.value = { top: `${top}px`, left: `${left}px` }
}

const toggle = async () => {
  open.value = !open.value
  if (open.value) {
    await nextTick()
    updatePosition()
  }
}

const select = (action: 'view' | 'approve' | 'reject' | 'review') => {
  close()
  emit(action, props.request)
}

const outside = (event: MouseEvent) => {
  const target = event.target as Node
  if (!triggerRef.value?.contains(target) && !menuRef.value?.contains(target)) close()
}
const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') close() }

onMounted(() => {
  document.addEventListener('mousedown', outside)
  document.addEventListener('keydown', escape)
  window.addEventListener('resize', close)
  window.addEventListener('scroll', close, true)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', outside)
  document.removeEventListener('keydown', escape)
  window.removeEventListener('resize', close)
  window.removeEventListener('scroll', close, true)
})
</script>

<template>
  <div class="actions-wrapper">
    <button ref="triggerRef" type="button" class="trigger" title="Correction actions"
      aria-label="Correction actions" :aria-expanded="open" @click.stop="toggle">
      <MoreHorizontal :size="18" />
    </button>

    <Teleport to="body">
      <div v-if="open" ref="menuRef" class="actions-menu" :style="position">
        <button type="button" @click="select('view')"><Eye :size="15" /> View Correction Details</button>
        <template v-if="pending">
          <button type="button" @click="select('approve')"><Check :size="15" /> Approve Correction</button>
          <button type="button" class="danger" @click="select('reject')"><X :size="15" /> Reject Correction</button>
        </template>
        <button v-else type="button" @click="select('review')">
          <ClipboardCheck :size="15" /> View Review Details
        </button>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.actions-wrapper { display: inline-flex; }
.trigger { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; padding: 0; border: 1px solid var(--border); border-radius: 7px; background: transparent; color: var(--text-secondary); cursor: pointer; }
.trigger:hover { background: var(--bg-card-soft); color: var(--primary); }
.actions-menu { position: fixed; z-index: 10050; width: 205px; padding: 6px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-card); box-shadow: 0 16px 40px rgba(0, 0, 0, .28); }
.actions-menu button { display: flex; align-items: center; gap: 9px; width: 100%; padding: 10px; border: 0; border-radius: 6px; background: transparent; color: var(--text-secondary); font: 500 11px inherit; font-size: 11px; text-align: left; cursor: pointer; }
.actions-menu button:hover { background: var(--bg-card-soft); color: var(--text-primary); }
.actions-menu button.danger { color: var(--red, #ef4444); }
</style>
