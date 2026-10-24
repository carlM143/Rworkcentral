<script setup lang="ts">
import {
  MoreHorizontal,
  Eye,
  PencilLine,
  CircleCheck,
  UserRound,
  Clock3,
  CircleX,
} from 'lucide-vue-next'

import type {
  ManualTimeEntry,
} from '~/types/manualTimeEntry'

const props = defineProps<{
  entry:
    ManualTimeEntry
}>()

const emit = defineEmits<{
  view: [
    entry:
      ManualTimeEntry,
  ]

  edit: [
    entry:
      ManualTimeEntry,
  ]

  validate: [
    entry:
      ManualTimeEntry,
  ]

  employee: [
    entry:
      ManualTimeEntry,
  ]

  timeLog: [
    entry:
      ManualTimeEntry,
  ]

  cancel: [
    entry:
      ManualTimeEntry,
  ]
}>()

const open =
  ref(false)

const triggerRef =
  ref<HTMLElement | null>(
    null,
  )

const menuRef =
  ref<HTMLElement | null>(
    null,
  )

const menuStyle =
  ref({
    top: '0px',
    left: '0px',
  })

const close = () => {
  open.value = false
}

const updatePosition =
  async () => {
    if (
      !import.meta.client ||
      !triggerRef.value
    ) {
      return
    }

    const rect =
      triggerRef.value
        .getBoundingClientRect()

    await nextTick()

    const width =
      menuRef.value
        ?.offsetWidth ?? 220

    const height =
      menuRef.value
        ?.offsetHeight ?? 240

    const gap = 6
    const padding = 10

    let left =
      rect.right -
      width

    if (left < padding) {
      left = padding
    }

    if (
      left + width >
      window.innerWidth -
        padding
    ) {
      left =
        window.innerWidth -
        width -
        padding
    }

    let top =
      rect.bottom +
      gap

    if (
      top + height >
      window.innerHeight -
        padding
    ) {
      top =
        rect.top -
        height -
        gap
    }

    menuStyle.value = {
      top:
        `${Math.max(
          padding,
          top,
        )}px`,

      left:
        `${left}px`,
    }
  }

const toggle =
  async () => {
    open.value =
      !open.value

    if (!open.value) {
      return
    }

    await nextTick()

    updatePosition()
  }

const execute = (
  action:
    'view' |
    'edit' |
    'validate' |
    'employee' |
    'timeLog' |
    'cancel',
) => {
  close()

  emit(
    action,
    props.entry,
  )
}

const handleOutsideClick = (
  event: MouseEvent,
) => {
  if (!open.value) {
    return
  }

  const target =
    event.target as Node

  if (
    triggerRef.value
      ?.contains(target) ||
    menuRef.value
      ?.contains(target)
  ) {
    return
  }

  close()
}

const handleKeydown = (
  event: KeyboardEvent,
) => {
  if (
    event.key === 'Escape'
  ) {
    close()
  }
}

onMounted(() => {
  document.addEventListener(
    'mousedown',
    handleOutsideClick,
  )

  window.addEventListener(
    'keydown',
    handleKeydown,
  )

  window.addEventListener(
    'resize',
    close,
  )

  window.addEventListener(
    'scroll',
    close,
    true,
  )
})

onBeforeUnmount(() => {
  document.removeEventListener(
    'mousedown',
    handleOutsideClick,
  )

  window.removeEventListener(
    'keydown',
    handleKeydown,
  )

  window.removeEventListener(
    'resize',
    close,
  )

  window.removeEventListener(
    'scroll',
    close,
    true,
  )
})
</script>

<template>
  <div class="wrapper">

    <button
      ref="triggerRef"
      type="button"
      class="trigger"
      @click.stop="toggle"
    >
      <MoreHorizontal :size="17" />
    </button>

    <Teleport to="body">

      <div
        v-if="open"
        ref="menuRef"
        class="actions-menu"
        :style="menuStyle"
        @click.stop
      >

        <button
          type="button"
          class="action-item"
          @click="
            execute('view')
          "
        >
          <Eye :size="15" />
          View Details
        </button>

        <button
          v-if="
            entry.status !==
            'Cancelled'
          "
          type="button"
          class="action-item edit"
          @click="
            execute('edit')
          "
        >
          <PencilLine :size="15" />
          Edit Manual Entry
        </button>

        <button
          v-if="
            entry.status ===
            'Pending'
          "
          type="button"
          class="action-item validate"
          @click="
            execute('validate')
          "
        >
          <CircleCheck :size="15" />
          Validate Entry
        </button>

        <div class="divider" />

        <button
          type="button"
          class="action-item"
          @click="
            execute('employee')
          "
        >
          <UserRound :size="15" />
          View Employee
        </button>

        <button
          type="button"
          class="action-item"
          @click="
            execute('timeLog')
          "
        >
          <Clock3 :size="15" />
          View Time Log
        </button>

        <template
          v-if="
            entry.status ===
            'Pending'
          "
        >
          <div class="divider" />

          <button
            type="button"
            class="action-item danger"
            @click="
              execute('cancel')
            "
          >
            <CircleX :size="15" />
            Cancel Entry
          </button>
        </template>

      </div>

    </Teleport>

  </div>
</template>

<style scoped>
.wrapper {
  display: inline-flex;
}

.trigger {
  display: flex;

  width: 31px;
  height: 31px;

  align-items: center;
  justify-content: center;

  border:
    1px solid transparent;

  border-radius: 7px;

  background:
    transparent;

  color:
    var(--text-secondary);

  cursor: pointer;
}

.trigger:hover {
  border-color:
    var(--border);

  background:
    var(--bg-card-soft);

  color:
    var(--primary);
}

.actions-menu {
  position: fixed;

  z-index: 10000;

  width: 220px;

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

  cursor: pointer;
}

.action-item:hover {
  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);
}

.action-item.edit {
  color:
    var(--primary);
}

.action-item.validate {
  color:
    var(--green);
}

.action-item.validate:hover {
  background:
    var(--green-soft);
}

.action-item.danger {
  color:
    var(--red);
}

.action-item.danger:hover {
  background:
    var(--red-soft);
}

.divider {
  height: 1px;

  margin:
    5px 0;

  background:
    var(--border-soft);
}
</style>