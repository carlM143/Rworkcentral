<script setup lang="ts">
import {
  MoreHorizontal,
  Pencil,
  Power,
} from 'lucide-vue-next'

import type {
  WorkSchedule,
} from '~/types/workSchedule'

const props = defineProps<{
  schedule: WorkSchedule
}>()

const emit = defineEmits<{
  edit: [schedule: WorkSchedule]
  toggleStatus: [schedule: WorkSchedule]
}>()

const open = ref(false)

const triggerRef =
  ref<HTMLElement | null>(null)

const menuStyle =
  ref<Record<string, string>>({})

const menuWidth = 220
const menuHeight = 110

/* =========================================================
   POSITION
========================================================= */

const updatePosition = () => {
  if (!triggerRef.value) {
    return
  }

  const rect =
    triggerRef.value
      .getBoundingClientRect()

  const spaceBelow =
    window.innerHeight -
    rect.bottom

  let top =
    rect.bottom + 6

  if (
    spaceBelow <
    menuHeight
  ) {
    top =
      rect.top -
      menuHeight -
      6
  }

  if (top < 8) {
    top = 8
  }

  let left =
    rect.right -
    menuWidth

  if (left < 8) {
    left = 8
  }

  if (
    left + menuWidth >
    window.innerWidth - 8
  ) {
    left =
      window.innerWidth -
      menuWidth -
      8
  }

  menuStyle.value = {
    top:
      `${top}px`,

    left:
      `${left}px`,

    width:
      `${menuWidth}px`,
  }
}

/* =========================================================
   OPEN / CLOSE
========================================================= */

const close = () => {
  open.value = false
}

const toggle = async () => {
  open.value =
    !open.value

  if (!open.value) {
    return
  }

  await nextTick()

  updatePosition()
}

/* =========================================================
   ACTIONS
========================================================= */

const handleEdit = () => {
  close()

  emit(
    'edit',
    props.schedule,
  )
}

const handleToggleStatus = () => {
  close()

  emit(
    'toggleStatus',
    props.schedule,
  )
}

/* =========================================================
   OUTSIDE CLICK
========================================================= */

const handleDocumentClick = () => {
  close()
}

const handleEscape = (
  event: KeyboardEvent,
) => {
  if (
    event.key === 'Escape'
  ) {
    close()
  }
}

const handleViewportChange =
  () => {
    if (open.value) {
      updatePosition()
    }
  }

onMounted(() => {
  document.addEventListener(
    'click',
    handleDocumentClick,
  )

  window.addEventListener(
    'keydown',
    handleEscape,
  )

  window.addEventListener(
    'resize',
    handleViewportChange,
  )

  window.addEventListener(
    'scroll',
    handleViewportChange,
    true,
  )
})

onBeforeUnmount(() => {
  document.removeEventListener(
    'click',
    handleDocumentClick,
  )

  window.removeEventListener(
    'keydown',
    handleEscape,
  )

  window.removeEventListener(
    'resize',
    handleViewportChange,
  )

  window.removeEventListener(
    'scroll',
    handleViewportChange,
    true,
  )
})
</script>

<template>
  <div class="actions-wrapper">

    <button
      ref="triggerRef"
      type="button"
      class="actions-trigger"
      @click.stop="toggle"
    >
      <MoreHorizontal :size="17" />
    </button>

    <Teleport to="body">

      <div
        v-if="open"
        class="actions-menu"
        :style="menuStyle"
        @click.stop
      >

        <button
          type="button"
          class="action-item"
          @click="handleEdit"
        >
          <Pencil :size="15" />

          Edit Schedule
        </button>

        <div class="action-divider" />

        <button
          type="button"
          class="action-item"
          :class="{
            danger:
              schedule.status ===
              'Active',

            activate:
              schedule.status ===
              'Inactive',
          }"
          @click="handleToggleStatus"
        >
          <Power :size="15" />

          {{
            schedule.status ===
            'Active'
              ? 'Deactivate Schedule'
              : 'Activate Schedule'
          }}
        </button>

      </div>

    </Teleport>

  </div>
</template>

<style scoped>
.actions-wrapper {
  position: relative;

  display: inline-flex;
}

.actions-trigger {
  display: flex;

  width: 31px;
  height: 31px;

  align-items: center;
  justify-content: center;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    transparent;

  color:
    var(--text-secondary);

  cursor: pointer;
}

.actions-trigger:hover {
  background:
    var(--bg-card-soft);

  color:
    var(--primary);
}

.actions-menu {
  position: fixed;

  z-index: 10000;

  padding: 6px;

  border:
    1px solid var(--border);

  border-radius: 9px;

  background:
    var(--bg-card);

  box-shadow:
    0 16px 45px
    rgba(0, 0, 0, 0.35);
}

.action-item {
  display: flex;

  width: 100%;
  min-height: 38px;

  align-items: center;

  gap: 9px;

  padding:
    0 10px;

  border: 0;

  border-radius: 6px;

  background:
    transparent;

  color:
    var(--text-secondary);

  font-family: inherit;

  font-size: 10px;

  text-align: left;

  cursor: pointer;
}

.action-item:hover {
  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);
}

.action-item.danger {
  color:
    var(--red);
}

.action-item.danger:hover {
  background:
    var(--red-soft);

  color:
    var(--red);
}

.action-item.activate {
  color:
    var(--green);
}

.action-item.activate:hover {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.action-divider {
  height: 1px;

  margin:
    5px 0;

  background:
    var(--border-soft);
}
</style>
