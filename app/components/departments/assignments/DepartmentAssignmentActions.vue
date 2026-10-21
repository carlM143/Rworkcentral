<script setup lang="ts">
import { MoreHorizontal, Eye, Pencil, CalendarX2 } from 'lucide-vue-next'
import type { DepartmentAssignment } from '~/types/departmentAssignment'

const props = defineProps<{ assignment: DepartmentAssignment }>()
const emit = defineEmits<{
  view: [assignment: DepartmentAssignment]
  edit: [assignment: DepartmentAssignment]
  end: [assignment: DepartmentAssignment]
}>()

const open = ref(false)
const buttonRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const menuStyle = ref({ top: '0px', left: '0px' })

const positionMenu = async () => {
  if (!buttonRef.value) return
  const rect = buttonRef.value.getBoundingClientRect()
  await nextTick()
  const width = menuRef.value?.offsetWidth ?? 210
  const height = menuRef.value?.offsetHeight ?? 140
  const top = rect.bottom + height + 8 > window.innerHeight
    ? rect.top - height - 6
    : rect.bottom + 6
  menuStyle.value = {
    top: `${Math.max(10, top)}px`,
    left: `${Math.max(10, Math.min(rect.right - width, window.innerWidth - width - 10))}px`,
  }
}

const toggle = async () => {
  open.value = !open.value
  if (open.value) await positionMenu()
}
const close = () => { open.value = false }
const choose = (action: 'view' | 'edit' | 'end') => {
  close()
  emit(action, props.assignment)
}
const outside = (event: MouseEvent) => {
  const target = event.target as Node
  if (!buttonRef.value?.contains(target) && !menuRef.value?.contains(target)) close()
}
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
  <span class="actions-holder">
    <button
      ref="buttonRef"
      type="button"
      class="actions-trigger"
      title="Assignment actions"
      aria-label="Assignment actions"
      :aria-expanded="open"
      @click.stop="toggle"
    >
      <MoreHorizontal :size="18" />
    </button>
    <Teleport to="body">
      <div v-if="open" ref="menuRef" class="assignment-menu" :style="menuStyle">
        <button type="button" @click="choose('view')">
          <Eye :size="15" />
          View Assignment
        </button>
        <button
          v-if="assignment.status !== 'Ended'"
          type="button"
          @click="choose('edit')"
        >
          <Pencil :size="15" />
          Edit Assignment
        </button>
        <button
          v-if="assignment.status !== 'Ended'"
          type="button"
          class="danger"
          @click="choose('end')"
        >
          <CalendarX2 :size="15" />
          End Assignment
        </button>
      </div>
    </Teleport>
  </span>
</template>

<style scoped>
.actions-holder { display: inline-flex; }
.actions-trigger { display: grid; width: 32px; height: 32px; place-items: center; border: 1px solid transparent; border-radius: 7px; background: transparent; color: var(--text-secondary); }
.actions-trigger:hover, .actions-trigger[aria-expanded="true"] { border-color: var(--border); background: var(--bg-card-soft); color: var(--primary); }
.assignment-menu { position: fixed; z-index: 9998; width: 210px; padding: 6px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-card); box-shadow: 0 16px 40px rgba(0,0,0,.22); }
.assignment-menu button { display: flex; width: 100%; align-items: center; gap: 9px; min-height: 36px; padding: 0 10px; border: 0; border-radius: 6px; background: transparent; color: var(--text-secondary); font-size: 11px; text-align: left; }
.assignment-menu button:hover { background: var(--bg-card-soft); color: var(--text-primary); }
.assignment-menu button.danger { color: var(--red); }
.assignment-menu button.danger:hover { background: var(--red-soft); }
</style>
