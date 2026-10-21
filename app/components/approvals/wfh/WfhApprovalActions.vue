
<script setup lang="ts">
import {
  MoreHorizontal,
  Eye,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
} from 'lucide-vue-next'

import {
  ref,
  computed,
  nextTick,
  onMounted,
  onBeforeUnmount,
} from 'vue'

import type {
  WfhApproval,
} from '~/types/wfhApproval'

const props = defineProps<{
  request: WfhApproval
}>()

const emit = defineEmits<{
  view: [request: WfhApproval]
  review: [request: WfhApproval]
  approve: [request: WfhApproval]
  reject: [request: WfhApproval]
}>()

const open = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)

const menuStyle = ref({
  top: '0px',
  left: '0px',
})

const canReview = computed(() => {
  return ['Pending', 'For Review'].includes(
    props.request.status,
  )
})

const updatePosition = async () => {
  if (!triggerRef.value) return

  await nextTick()

  const rect = triggerRef.value.getBoundingClientRect()
  const width = menuRef.value?.offsetWidth ?? 205
  const height = menuRef.value?.offsetHeight ?? 175
  const padding = 8

  let top = rect.bottom + 6

  if (top + height > window.innerHeight - padding) {
    top = rect.top - height - 6
  }

  top = Math.max(
    padding,
    Math.min(top, window.innerHeight - height - padding),
  )

  const left = Math.max(
    padding,
    Math.min(
      rect.right - width,
      window.innerWidth - width - padding,
    ),
  )

  menuStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  }
}

const toggleMenu = async () => {
  open.value = !open.value

  if (open.value) {
    await updatePosition()
  }
}

const closeMenu = () => {
  open.value = false
}

const handleAction = (
  action: 'view' | 'review' | 'approve' | 'reject',
) => {
  closeMenu()
  emit(action, props.request)
}

const handleOutsideClick = (event: MouseEvent) => {
  const target = event.target as Node

  if (
    !triggerRef.value?.contains(target) &&
    !menuRef.value?.contains(target)
  ) {
    closeMenu()
  }
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleOutsideClick)
  document.addEventListener('keydown', handleEscape)
  window.addEventListener('resize', closeMenu)
  window.addEventListener('scroll', closeMenu, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleOutsideClick)
  document.removeEventListener('keydown', handleEscape)
  window.removeEventListener('resize', closeMenu)
  window.removeEventListener('scroll', closeMenu, true)
})
</script>

<template>
  <div class="actions-wrapper">
    <button
      ref="triggerRef"
      type="button"
      class="actions-trigger"
      aria-label="WFH request actions"
      :aria-expanded="open"
      @click.stop="toggleMenu"
    >
      <MoreHorizontal :size="18" />
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        ref="menuRef"
        class="wfh-actions-menu"
        :style="menuStyle"
      >
        <button
          type="button"
          class="menu-item"
          @click="handleAction('view')"
        >
          <Eye :size="15" />
          View Details
        </button>

        <template v-if="canReview">
          <button
            type="button"
            class="menu-item"
            @click="handleAction('review')"
          >
            <ClipboardCheck :size="15" />
            Review Request
          </button>

          <div class="menu-divider" />

          <button
            type="button"
            class="menu-item approve"
            @click="handleAction('approve')"
          >
            <CheckCircle2 :size="15" />
            Approve Request
          </button>

          <button
            type="button"
            class="menu-item reject"
            @click="handleAction('reject')"
          >
            <XCircle :size="15" />
            Reject Request
          </button>
        </template>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.actions-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.actions-trigger {
  display: inline-flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: 0.15s ease;
}

.actions-trigger:hover,
.actions-trigger[aria-expanded="true"] {
  border-color: var(--border);
  background: var(--bg-card-soft);
  color: var(--primary);
}
</style>

<style>
.wfh-actions-menu {
  position: fixed;
  z-index: 10020;
  width: 205px;
  padding: 6px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.25);
}

.wfh-actions-menu .menu-item {
  display: flex;
  width: 100%;
  min-height: 36px;
  align-items: center;
  gap: 9px;
  padding: 0 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
}

.wfh-actions-menu .menu-item:hover {
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

.wfh-actions-menu .menu-item.approve {
  color: var(--green);
}

.wfh-actions-menu .menu-item.reject {
  color: var(--red);
}

.wfh-actions-menu .menu-item.approve:hover {
  background: var(--green-soft);
}

.wfh-actions-menu .menu-item.reject:hover {
  background: var(--red-soft);
}

.wfh-actions-menu .menu-divider {
  margin: 5px 4px;
  border-top: 1px solid var(--border-soft);
}
</style>
