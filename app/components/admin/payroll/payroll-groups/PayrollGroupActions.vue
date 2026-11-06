<script setup lang="ts">
import {
  MoreHorizontal,
  Eye,
  PencilLine,
  Users,
  Trash2,
} from 'lucide-vue-next'

import type {
  PayrollGroup,
} from '~/types/payroll/payroll-groups/payrollGroup'

defineProps<{
  group: PayrollGroup
}>()

const emit = defineEmits<{
  select: [
    action: 'view' | 'edit' | 'employees' | 'delete',
    group: PayrollGroup,
  ]
}>()

const open = ref(false)

const triggerRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)

const menuPosition = ref({ top: 0, left: 0 })

const MENU_WIDTH = 195
const MENU_HEIGHT = 170

const updatePosition = () => {
  const rect = triggerRef.value?.getBoundingClientRect()
  if (!rect) return

  const openUp = rect.bottom + MENU_HEIGHT + 8 > window.innerHeight

  menuPosition.value = {
    top: openUp ? rect.top - MENU_HEIGHT - 4 : rect.bottom + 4,
    left: Math.max(8, rect.right - MENU_WIDTH),
  }
}

const close = () => {
  open.value = false
}

const toggle = () => {
  if (!open.value) updatePosition()
  open.value = !open.value
}

const select = (
  action: 'view' | 'edit' | 'employees' | 'delete',
  group: PayrollGroup,
) => {
  close()
  emit('select', action, group)
}

const outsideClick = (event: MouseEvent) => {
  const target = event.target as Node

  if (
    triggerRef.value?.contains(target) ||
    menuRef.value?.contains(target)
  ) {
    return
  }

  close()
}

onMounted(() => {
  document.addEventListener('mousedown', outsideClick)
  window.addEventListener('scroll', close, true)
  window.addEventListener('resize', close)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', outsideClick)
  window.removeEventListener('scroll', close, true)
  window.removeEventListener('resize', close)
})
</script>

<template>
  <div class="actions-wrapper">
    <button
      ref="triggerRef"
      type="button"
      class="trigger"
      aria-label="Payroll group actions"
      @click.stop="toggle"
    >
      <MoreHorizontal :size="18" />
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        ref="menuRef"
        class="actions-menu"
        :style="{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }"
        @click.stop
      >
        <button @click="select('view', group)">
          <Eye :size="14" />
          View Details
        </button>

        <button @click="select('edit', group)">
          <PencilLine :size="14" />
          Edit Group
        </button>

        <button @click="select('employees', group)">
          <Users :size="14" />
          Manage Employees
        </button>

        <div class="divider" />

        <button
          class="danger"
          @click="select('delete', group)"
        >
          <Trash2 :size="14" />
          Delete Group
        </button>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.actions-wrapper {
  display: inline-flex;
}

.trigger {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.trigger:hover {
  border-color: var(--border);
  background: var(--bg-card-soft);
  color: var(--primary);
}

.actions-menu {
  position: fixed;
  z-index: 99999;
  width: 195px;
  padding: 5px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card);
  box-shadow: 0 12px 35px rgba(0, 0, 0, .25);
}

.actions-menu button {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 9px;
  padding: 9px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  font-family: inherit;
  font-size: 11px;
  text-align: left;
  cursor: pointer;
}

.actions-menu button:hover {
  background: var(--primary-soft);
  color: var(--primary);
}

.actions-menu .danger {
  color: var(--red);
}

.divider {
  height: 1px;
  margin: 4px;
  background: var(--border-soft);
}
</style>