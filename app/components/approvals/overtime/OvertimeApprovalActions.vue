<script setup lang="ts">
import {
  MoreHorizontal,
  Eye,
  CheckCircle2,
  XCircle,
  ClipboardList,
} from 'lucide-vue-next'
import type { OvertimeApproval } from '~/types/overtimeApproval'

const props = defineProps<{
  request: OvertimeApproval
}>()

const emit = defineEmits<{
  view: [request: OvertimeApproval]
  approve: [request: OvertimeApproval]
  reject: [request: OvertimeApproval]
  review: [request: OvertimeApproval]
}>()

const open = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const menuStyle = ref({ top: '0px', left: '0px' })

const isPending = computed(() =>
  props.request.status === 'Pending' || props.request.status === 'For Review',
)

const positionMenu = async () => {
  if (!triggerRef.value) return
  await nextTick()

  const trigger = triggerRef.value.getBoundingClientRect()
  const width = menuRef.value?.offsetWidth ?? 190
  const height = menuRef.value?.offsetHeight ?? 150
  const margin = 10
  const left = Math.max(margin, Math.min(trigger.right - width, window.innerWidth - width - margin))
  const below = trigger.bottom + 6
  const top = below + height <= window.innerHeight - margin
    ? below
    : Math.max(margin, trigger.top - height - 6)

  menuStyle.value = { top: `${top}px`, left: `${left}px` }
}

const toggle = async () => {
  open.value = !open.value
  if (open.value) await positionMenu()
}

const select = (action: 'view' | 'approve' | 'reject' | 'review') => {
  open.value = false
  emit(action, props.request)
}

const handleOutside = (event: MouseEvent) => {
  const target = event.target as Node
  if (!triggerRef.value?.contains(target) && !menuRef.value?.contains(target)) {
    open.value = false
  }
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') open.value = false
}

const closeMenu = () => { open.value = false }

onMounted(() => {
  document.addEventListener('mousedown', handleOutside)
  document.addEventListener('keydown', handleEscape)
  window.addEventListener('resize', closeMenu)
  window.addEventListener('scroll', closeMenu, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleOutside)
  document.removeEventListener('keydown', handleEscape)
  window.removeEventListener('resize', closeMenu)
  window.removeEventListener('scroll', closeMenu, true)
})
</script>

<template>
  <div class="action-wrapper">
    <button
      ref="triggerRef"
      type="button"
      class="action-trigger"
      :aria-expanded="open"
      aria-label="Overtime approval actions"
      @click.stop="toggle"
    >
      <MoreHorizontal :size="18" />
    </button>

    <Teleport to="body">
      <div v-if="open" ref="menuRef" class="action-menu" :style="menuStyle">
        <button type="button" class="action-item" @click="select('view')">
          <Eye :size="15" /> View OT Details
        </button>

        <template v-if="isPending">
          <button type="button" class="action-item" @click="select('approve')">
            <CheckCircle2 :size="15" /> Approve Overtime
          </button>
          <button type="button" class="action-item danger" @click="select('reject')">
            <XCircle :size="15" /> Reject Overtime
          </button>
        </template>

        <button v-else type="button" class="action-item" @click="select('review')">
          <ClipboardList :size="15" /> View Review Details
        </button>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.action-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.action-trigger:hover {
  background: var(--bg-card-soft);
  color: var(--primary);
}

.action-menu {
  position: fixed;
  z-index: 10020;
  width: 190px;
  padding: 6px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card);
  box-shadow: 0 15px 40px rgba(0, 0, 0, .28);
}

.action-item {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  min-height: 36px;
  padding: 0 9px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  text-align: left;
  font-size: 10px;
  cursor: pointer;
}

.action-item:hover {
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

.action-item.danger { color: var(--red); }
.action-item svg { flex-shrink: 0; }
</style>
