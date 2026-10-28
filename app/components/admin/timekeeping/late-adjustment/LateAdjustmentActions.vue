<script setup lang="ts">
import {
  MoreHorizontal,
  Eye,
  PencilLine,
  CircleCheck,
  CircleX,
  UserRound,
} from 'lucide-vue-next'

import type {
  LateAdjustmentRecord,
} from '~/types/lateAdjustment'

const props = defineProps<{
  adjustment:
    LateAdjustmentRecord
}>()

const emit = defineEmits<{
  view: [
    adjustment:
      LateAdjustmentRecord,
  ]

  adjust: [
    adjustment:
      LateAdjustmentRecord,
  ]

  approve: [
    adjustment:
      LateAdjustmentRecord,
  ]

  reject: [
    adjustment:
      LateAdjustmentRecord,
  ]

  employee: [
    adjustment:
      LateAdjustmentRecord,
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

/* =========================================================
   MENU POSITION
========================================================= */

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
        ?.offsetWidth ?? 215

    const height =
      menuRef.value
        ?.offsetHeight ?? 210

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

/* =========================================================
   OPEN
========================================================= */

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

const close = () => {
  open.value = false
}

/* =========================================================
   ACTION
========================================================= */

const execute = (
  action:
    'view' |
    'adjust' |
    'approve' |
    'reject' |
    'employee',
) => {
  close()

  emit(
    action,
    props.adjustment,
  )
}

/* =========================================================
   OUTSIDE CLICK
========================================================= */

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
  <div class="actions-wrapper">

    <button
      ref="triggerRef"
      type="button"
      class="trigger"
      @click.stop="
        toggle
      "
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
          type="button"
          class="action-item adjust"
          @click="
            execute('adjust')
          "
        >
          <PencilLine :size="15" />

          {{
            adjustment.status ===
            'Rejected'
              ? 'Refile Adjustment'
              : 'Adjust Late Minutes'
          }}
        </button>

        <template
          v-if="
            adjustment.status ===
            'Pending'
          "
        >

          <div class="divider" />

          <button
            type="button"
            class="action-item approve"
            @click="
              execute('approve')
            "
          >
            <CircleCheck :size="15" />

            Approve Adjustment
          </button>

          <button
            type="button"
            class="action-item reject"
            @click="
              execute('reject')
            "
          >
            <CircleX :size="15" />

            Reject Adjustment
          </button>

        </template>

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

      </div>

    </Teleport>

  </div>
</template>

<style scoped>
.actions-wrapper {
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

  width: 215px;

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

.action-item.adjust {
  color:
    var(--primary);
}

.action-item.adjust:hover {
  background:
    var(--primary-soft);
}

.action-item.approve {
  color:
    var(--green);
}

.action-item.approve:hover {
  background:
    var(--green-soft);
}

.action-item.reject {
  color:
    var(--red);
}

.action-item.reject:hover {
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