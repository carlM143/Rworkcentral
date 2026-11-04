
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { MoreHorizontal, Eye } from 'lucide-vue-next'
import type { EmployeeSalaryRate } from '~/types/employeeSalaryRates/employeeSalaryRate'

const props = defineProps<{
  rate: EmployeeSalaryRate
}>()

const emit = defineEmits<{
  view: [rate: EmployeeSalaryRate]
}>()

const open = ref(false)
const buttonRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)

const position = ref({
  top: 0,
  left: 0,
})

const closeMenu = () => {
  open.value = false
}

const toggleMenu = (event: MouseEvent) => {
  if (open.value) {
    closeMenu()
    return
  }

  const button = event.currentTarget as HTMLElement
  buttonRef.value = button

  const rect = button.getBoundingClientRect()
  const menuWidth = 180
  const menuHeight = 48

  position.value = {
    left: Math.max(
      8,
      Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8),
    ),
    top: rect.bottom + menuHeight + 8 > window.innerHeight
      ? rect.top - menuHeight - 6
      : rect.bottom + 6,
  }

  open.value = true
}

const handleView = () => {
  closeMenu()
  emit('view', props.rate)
}

const handleOutside = (event: MouseEvent) => {
  const target = event.target as Node

  if (
    buttonRef.value?.contains(target) ||
    menuRef.value?.contains(target)
  ) return

  closeMenu()
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') closeMenu()
}

onMounted(() => {
  document.addEventListener('click', handleOutside)
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('scroll', closeMenu, true)
  window.addEventListener('resize', closeMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutside)
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('scroll', closeMenu, true)
  window.removeEventListener('resize', closeMenu)
})
</script>

<template>
  <button
    ref="buttonRef"
    type="button"
    class="table-action-button"
    :aria-label="`Actions for ${rate.employee_name}`"
    aria-haspopup="menu"
    :aria-expanded="open"
    @click.stop="toggleMenu"
  >
    <MoreHorizontal :size="17" />
  </button>

  <Teleport to="body">
    <div
      v-if="open"
      ref="menuRef"
      class="fixed z-[9999] w-[180px] rounded-lg border p-1 shadow-xl"
      role="menu"
      :style="{
        top: `${position.top}px`,
        left: `${position.left}px`,
        background: 'var(--bg-card)',
        borderColor: 'var(--border)',
      }"
    >
      <button
        type="button"
        role="menuitem"
        class="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-xs hover:opacity-70"
        :style="{ color: 'var(--text-primary)' }"
        @click="handleView"
      >
        <Eye :size="15" />
        View Salary Setup
      </button>
    </div>
  </Teleport>
</template>
