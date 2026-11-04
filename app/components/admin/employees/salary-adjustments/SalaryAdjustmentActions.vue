<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { MoreHorizontal, Eye, Check, X, BadgeCheck } from 'lucide-vue-next'
import type { SalaryAdjustment } from '~/types/salaryAdjustments/salaryAdjustment'

const props = defineProps<{
  adjustment: SalaryAdjustment
  disabled?: boolean
}>()
const emit = defineEmits<{
  view: [adjustment: SalaryAdjustment]
  approve: [adjustment: SalaryAdjustment]
  reject: [adjustment: SalaryAdjustment]
  apply: [adjustment: SalaryAdjustment]
}>()

const open = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const menuStyle = ref({ left: '0px', top: '0px' })

const close = () => { open.value = false }

const toggle = () => {
  if (props.disabled) return
  if (open.value) return close()
  const rect = triggerRef.value?.getBoundingClientRect()
  if (!rect) return

  const menuWidth = 190
  const estimatedHeight = props.adjustment.status === 'pending' ? 142 : 104
  const left = Math.min(Math.max(8, rect.right - menuWidth), window.innerWidth - menuWidth - 8)
  const down = rect.bottom + 6
  const top = down + estimatedHeight < window.innerHeight
    ? down
    : Math.max(8, rect.top - estimatedHeight - 6)

  menuStyle.value = { left: `${left}px`, top: `${top}px` }
  open.value = true
}

const onOutside = (event: PointerEvent) => {
  const node = event.target as Node
  if (!triggerRef.value?.contains(node) && !menuRef.value?.contains(node)) close()
}
const onKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') close()
}

const choose = (action: 'view' | 'approve' | 'reject' | 'apply') => {
  close()
  if (action === 'view') emit('view', props.adjustment)
  else if (action === 'approve') emit('approve', props.adjustment)
  else if (action === 'reject') emit('reject', props.adjustment)
  else emit('apply', props.adjustment)
}

onMounted(() => {
  document.addEventListener('pointerdown', onOutside)
  document.addEventListener('keydown', onKeyDown)
  window.addEventListener('scroll', close, true)
  window.addEventListener('resize', close)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onOutside)
  document.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('scroll', close, true)
  window.removeEventListener('resize', close)
})
</script>

<template>
  <div class="actions-cell">
    <button
      ref="triggerRef"
      type="button"
      class="actions-trigger"
      aria-label="Salary adjustment actions"
      aria-haspopup="menu"
      :aria-expanded="open"
      :disabled="disabled"
      @click.stop="toggle"
    >
      <MoreHorizontal :size="17" />
    </button>

    <!-- Teleport prevents the three-dot dropdown from clipping inside table horizontal scroll. -->
    <Teleport to="body">
      <div v-if="open" ref="menuRef" class="actions-menu" :style="menuStyle" role="menu">
        <button type="button" role="menuitem" @click="choose('view')">
          <Eye :size="14" /> View Details
        </button>
        <button
          v-if="adjustment.status === 'pending'"
          type="button" role="menuitem" class="positive"
          @click="choose('approve')"
        >
          <Check :size="14" /> Approve
        </button>
        <button
          v-if="adjustment.status === 'pending'"
          type="button" role="menuitem" class="negative"
          @click="choose('reject')"
        >
          <X :size="14" /> Reject
        </button>
        <button
          v-if="adjustment.status === 'approved'"
          type="button" role="menuitem" class="positive"
          @click="choose('apply')"
        >
          <BadgeCheck :size="14" /> Apply Adjustment
        </button>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.actions-cell { display: flex; justify-content: flex-end; }
.actions-trigger {
  display: inline-flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; cursor: pointer;
  border: 1px solid transparent; border-radius: 7px;
  background: transparent; color: var(--text-secondary);
}
.actions-trigger:hover { background: var(--bg-card-soft); border-color: var(--border); }
.actions-trigger:disabled { opacity: .45; cursor: not-allowed; }
.actions-menu {
  position: fixed; z-index: 9999; width: 190px;
  padding: 5px; border: 1px solid var(--border); border-radius: 10px;
  background: var(--bg-card); box-shadow: 0 14px 36px rgba(0, 0, 0, .32);
}
.actions-menu button {
  display: flex; align-items: center; gap: 9px; width: 100%;
  min-height: 35px; padding: 8px 10px; cursor: pointer;
  border: 0; border-radius: 6px; background: transparent;
  color: var(--text-secondary); font-size: 12px; text-align: left;
}
.actions-menu button:hover { background: var(--bg-card-soft); color: var(--text-primary); }
.actions-menu .positive { color: #34d399; }
.actions-menu .negative { color: #fb7185; }
</style>