<script setup lang="ts">
import { MoreHorizontal, Eye, Check, X, ClipboardList } from 'lucide-vue-next'
import type { LeaveApproval } from '~/types/leaveApproval'

const props = defineProps<{ request: LeaveApproval }>()
const emit = defineEmits<{
  view: [request: LeaveApproval]
  approve: [request: LeaveApproval]
  reject: [request: LeaveApproval]
  review: [request: LeaveApproval]
}>()

const open = ref(false)
const trigger = ref<HTMLElement | null>(null)
const position = ref({ top: '0px', left: '0px' })
const actionable = computed(() => ['Pending', 'For Review'].includes(props.request.status))

const toggle = () => {
  if (open.value) {
    open.value = false
    return
  }

  const rect = trigger.value?.getBoundingClientRect()
  if (!rect) return

  const menuHeight = actionable.value ? 138 : 102
  const menuWidth = 190
  const top = rect.bottom + menuHeight + 8 > window.innerHeight
    ? rect.top - menuHeight - 6
    : rect.bottom + 6

  position.value = {
    top: `${Math.max(8, top)}px`,
    left: `${Math.max(8, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8))}px`,
  }
  open.value = true
}

const act = (action: 'view' | 'approve' | 'reject' | 'review') => {
  open.value = false
  emit(action, props.request)
}

const handleOutside = (event: MouseEvent) => {
  if (!(event.target as Element).closest(`[data-leave-action="${props.request.id}"]`)) {
    open.value = false
  }
}

const close = () => { open.value = false }
onMounted(() => {
  document.addEventListener('mousedown', handleOutside)
  window.addEventListener('scroll', close, true)
  window.addEventListener('resize', close)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleOutside)
  window.removeEventListener('scroll', close, true)
  window.removeEventListener('resize', close)
})
</script>

<template>
  <div :data-leave-action="request.id" class="action-wrap">
    <button
      ref="trigger"
      type="button"
      class="action-trigger"
      :aria-expanded="open"
      aria-label="Leave request actions"
      @click.stop="toggle"
    >
      <MoreHorizontal :size="18" />
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        :data-leave-action="request.id"
        class="leave-actions-menu"
        :style="position"
      >
        <button type="button" @click="act('view')"><Eye :size="15" /> View Leave Details</button>
        <template v-if="actionable">
          <button type="button" @click="act('approve')"><Check :size="15" /> Approve Leave</button>
          <button type="button" class="danger" @click="act('reject')"><X :size="15" /> Reject Leave</button>
        </template>
        <button v-else type="button" @click="act('review')">
          <ClipboardList :size="15" /> View Review Details
        </button>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.action-wrap { display: inline-flex; }
.action-trigger { display: grid; width: 32px; height: 32px; place-items: center; border: 1px solid transparent; border-radius: 7px; color: var(--text-secondary); background: transparent; cursor: pointer; }
.action-trigger:hover, .action-trigger[aria-expanded="true"] { border-color: var(--border); background: var(--bg-card-soft); color: var(--primary); }
.leave-actions-menu { position: fixed; z-index: 10020; width: 190px; padding: 6px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-card); box-shadow: 0 16px 40px rgba(0, 0, 0, .24); }
.leave-actions-menu button { display: flex; align-items: center; gap: 9px; width: 100%; min-height: 35px; padding: 0 10px; border: 0; border-radius: 6px; background: transparent; color: var(--text-secondary); text-align: left; font-size: 11px; cursor: pointer; }
.leave-actions-menu button:hover { background: var(--bg-card-soft); color: var(--text-primary); }
.leave-actions-menu button.danger { color: var(--red); }
</style>
