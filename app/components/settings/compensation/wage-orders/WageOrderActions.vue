
<script setup lang="ts">
import {
  MoreHorizontal,
  Eye,
  Pencil,
  ClipboardCheck,
  Trash2,
} from 'lucide-vue-next'

import type {
  WageOrder,
} from '~/types/wageManagement'

const props = defineProps<{
  order: WageOrder
}>()

const emit = defineEmits<{
  view: [order: WageOrder]
  edit: [order: WageOrder]
  evaluate: [order: WageOrder]
  delete: [order: WageOrder]
}>()

const open = ref(false)

const triggerRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)

const menuStyle = ref({
  top: '0px',
  left: '0px',
})

const updatePosition = async () => {
  await nextTick()

  if (!triggerRef.value) return

  const rect = triggerRef.value.getBoundingClientRect()
  const width = menuRef.value?.offsetWidth ?? 205
  const height = menuRef.value?.offsetHeight ?? 170

  const space = 8

  let top = rect.bottom + 6

  if (top + height > window.innerHeight - space) {
    top = rect.top - height - 6
  }

  menuStyle.value = {
    top: `${Math.max(space, top)}px`,
    left: `${Math.max(
      space,
      Math.min(
        rect.right - width,
        window.innerWidth - width - space,
      ),
    )}px`,
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

const action = (
  name: 'view' | 'edit' | 'evaluate' | 'delete',
) => {
  closeMenu()
  emit(name, props.order)
}

const handleOutside = (event: MouseEvent) => {
  const target = event.target as Node

  if (
    !triggerRef.value?.contains(target) &&
    !menuRef.value?.contains(target)
  ) {
    closeMenu()
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') closeMenu()
}

onMounted(() => {
  document.addEventListener('mousedown', handleOutside)
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', closeMenu)
  window.addEventListener('scroll', closeMenu, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleOutside)
  document.removeEventListener('keydown', handleKeydown)
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
      aria-label="Wage order actions"
      :aria-expanded="open"
      @click.stop="toggleMenu"
    >
      <MoreHorizontal :size="18" />
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        ref="menuRef"
        class="wage-order-action-menu"
        :style="menuStyle"
      >
        <button @click="action('view')">
          <Eye :size="15" />
          View Wage Order
        </button>

        <button @click="action('edit')">
          <Pencil :size="15" />
          Edit Wage Order
        </button>

        <button @click="action('evaluate')">
          <ClipboardCheck :size="15" />
          Evaluate Employees
        </button>

        <div class="menu-divider" />

        <button
          class="danger"
          @click="action('delete')"
        >
          <Trash2 :size="15" />
          Delete Wage Order
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
  width: 31px;
  height: 31px;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all .15s ease;
}

.action-trigger:hover,
.action-trigger[aria-expanded="true"] {
  border-color: var(--border);
  background: var(--bg-card-soft);
  color: var(--primary);
}
</style>

<style>
.wage-order-action-menu {
  position: fixed;
  z-index: 10020;
  width: 205px;
  padding: 6px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card);
  box-shadow: 0 18px 45px rgba(0,0,0,.28);
}

.wage-order-action-menu button {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  min-height: 36px;
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

.wage-order-action-menu button:hover {
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

.wage-order-action-menu .danger {
  color: var(--red);
}

.wage-order-action-menu .danger:hover {
  background: var(--red-soft);
}

.wage-order-action-menu .menu-divider {
  margin: 5px 4px;
  border-top: 1px solid var(--border-soft);
}
</style>
