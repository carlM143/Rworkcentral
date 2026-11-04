<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { Eye, MoreHorizontal } from 'lucide-vue-next'

import type { EmployeeLoan } from '~/types/loans/employee-loans/employeeLoan'

const props = defineProps<{ loan: EmployeeLoan }>()
const triggerRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const menuOpen = ref(false)
const menuPosition = ref({ top: 0, left: 0 })

const closeMenu = () => { menuOpen.value = false }

const toggleMenu = async () => {
  if (menuOpen.value) {
    closeMenu()
    return
  }

  menuOpen.value = true
  await nextTick()
  if (!triggerRef.value) return

  const rect = triggerRef.value.getBoundingClientRect()
  const width = 180
  const height = 52

  menuPosition.value = {
    left: Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8)),
    top: rect.bottom + height + 6 > window.innerHeight
      ? Math.max(8, rect.top - height - 6)
      : rect.bottom + 6,
  }
}

const viewDetails = async () => {
  closeMenu()
  await navigateTo({
    path: '/admin/loans/employee-loans/show',
    query: { id: String(props.loan.id) },
  })
}

const onOutsideClick = (event: MouseEvent) => {
  const target = event.target
  if (!(target instanceof Node)) return
  if (triggerRef.value?.contains(target) || menuRef.value?.contains(target)) return
  closeMenu()
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') closeMenu()
}

onMounted(() => {
  document.addEventListener('click', onOutsideClick)
  document.addEventListener('keydown', onKeydown)
  window.addEventListener('scroll', closeMenu, true)
  window.addEventListener('resize', closeMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', onOutsideClick)
  document.removeEventListener('keydown', onKeydown)
  window.removeEventListener('scroll', closeMenu, true)
  window.removeEventListener('resize', closeMenu)
})
</script>

<template>
  <div class="loan-actions">
    <button
      ref="triggerRef"
      type="button"
      class="action-trigger"
      :aria-label="`Actions for loan ${loan.loan_reference_no}`"
      :aria-expanded="menuOpen"
      aria-haspopup="menu"
      @click.stop="toggleMenu"
    >
      <MoreHorizontal :size="18" />
    </button>

    <Teleport to="body">
      <div
        v-if="menuOpen"
        ref="menuRef"
        role="menu"
        class="action-menu"
        :style="{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }"
      >
        <button type="button" role="menuitem" @click="viewDetails">
          <Eye :size="15" />
          View Details
        </button>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.loan-actions { display: flex; justify-content: flex-end; }
.action-trigger {
  display: inline-flex; width: 34px; height: 34px; align-items: center; justify-content: center;
  border: 1px solid var(--border); border-radius: 8px; background: transparent;
  color: var(--text-secondary); cursor: pointer;
}
.action-trigger:hover, .action-trigger[aria-expanded='true'] {
  border-color: var(--primary); background: var(--primary-soft); color: var(--primary);
}
.action-menu {
  position: fixed; z-index: 9999; width: 180px; padding: 6px; border: 1px solid var(--border);
  border-radius: 10px; background: var(--bg-card); box-shadow: 0 15px 35px rgb(0 0 0 / 28%);
}
.action-menu button {
  display: flex; width: 100%; align-items: center; gap: 9px; padding: 11px; border: 0;
  border-radius: 7px; background: transparent; color: var(--text-primary); font-size: 12px; cursor: pointer;
}
.action-menu button:hover { background: var(--bg-card-soft); }
</style>
