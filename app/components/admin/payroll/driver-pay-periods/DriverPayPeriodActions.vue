<script setup lang="ts">
import {
  MoreHorizontal,
  Eye,
  PencilLine,
  FolderOpen,
  Play,
  Users,
  Clock3,
  CircleCheck,
  CircleX,
  ReceiptText,
} from 'lucide-vue-next'

import type {
  DriverPayPeriod,
} from '~/types/driverPayPeriod'

const props =
  defineProps<{
    period:
      DriverPayPeriod
  }>()

const emit =
  defineEmits<{
    view: [
      period:
        DriverPayPeriod,
    ]

    edit: [
      period:
        DriverPayPeriod,
    ]

    open: [
      period:
        DriverPayPeriod,
    ]

    process: [
      period:
        DriverPayPeriod,
    ]

    drivers: [
      period:
        DriverPayPeriod,
    ]

    pending: [
      period:
        DriverPayPeriod,
    ]

    completed: [
      period:
        DriverPayPeriod,
    ]

    close: [
      period:
        DriverPayPeriod,
    ]

    cancel: [
      period:
        DriverPayPeriod,
    ]
  }>()

const menuOpen =
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

const closeMenu = () => {
  menuOpen.value =
    false
}

const updatePosition =
  async () => {
    if (
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
        ?.offsetWidth ??
      230

    const height =
      menuRef.value
        ?.offsetHeight ??
      340

    let left =
      rect.right -
      width

    if (left < 10) {
      left = 10
    }

    if (
      left + width >
      window.innerWidth -
        10
    ) {
      left =
        window.innerWidth -
        width -
        10
    }

    let top =
      rect.bottom +
      6

    if (
      top + height >
      window.innerHeight -
        10
    ) {
      top =
        rect.top -
        height -
        6
    }

    menuStyle.value = {
      top:
        `${Math.max(
          10,
          top,
        )}px`,

      left:
        `${left}px`,
    }
  }

const toggleMenu =
  async () => {
    menuOpen.value =
      !menuOpen.value

    if (
      menuOpen.value
    ) {
      await nextTick()

      updatePosition()
    }
  }

const run = (
  action:
    | 'view'
    | 'edit'
    | 'open'
    | 'process'
    | 'drivers'
    | 'pending'
    | 'completed'
    | 'close'
    | 'cancel',
) => {
  closeMenu()

  emit(
    action,
    props.period,
  )
}

const handleOutside = (
  event: MouseEvent,
) => {
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

  closeMenu()
}

onMounted(() => {
  document.addEventListener(
    'mousedown',
    handleOutside,
  )

  window.addEventListener(
    'resize',
    closeMenu,
  )

  window.addEventListener(
    'scroll',
    closeMenu,
    true,
  )
})

onBeforeUnmount(() => {
  document.removeEventListener(
    'mousedown',
    handleOutside,
  )

  window.removeEventListener(
    'resize',
    closeMenu,
  )

  window.removeEventListener(
    'scroll',
    closeMenu,
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
        toggleMenu
      "
    >
      <MoreHorizontal :size="17" />
    </button>

    <Teleport to="body">

      <div
        v-if="
          menuOpen
        "
        ref="menuRef"
        class="actions-menu"
        :style="
          menuStyle
        "
        @click.stop
      >

        <button
          type="button"
          class="action-item"
          @click="
            run('view')
          "
        >
          <Eye :size="15" />
          View Details
        </button>

        <button
          v-if="
            period.status ===
              'Draft' ||
            period.status ===
              'Open'
          "
          type="button"
          class="action-item blue"
          @click="
            run('edit')
          "
        >
          <PencilLine :size="15" />
          Edit Pay Period
        </button>

        <template
          v-if="
            period.status ===
            'Draft'
          "
        >

          <div class="divider" />

          <button
            type="button"
            class="action-item success"
            @click="
              run('open')
            "
          >
            <FolderOpen :size="15" />
            Open Period
          </button>

        </template>

        <template
          v-if="
            period.status ===
            'Open'
          "
        >

          <div class="divider" />

          <button
            type="button"
            class="action-item success"
            @click="
              run('process')
            "
          >
            <Play :size="15" />
            Start Processing
          </button>

        </template>

        <div
          v-if="
            period.status !==
            'Cancelled'
          "
          class="divider"
        />

        <button
          v-if="
            period.status !==
            'Cancelled'
          "
          type="button"
          class="action-item"
          @click="
            run('drivers')
          "
        >
          <Users :size="15" />
          View Drivers
        </button>

        <button
          v-if="
            period.status ===
              'Open' ||
            period.status ===
              'Processing'
          "
          type="button"
          class="action-item"
          @click="
            run('pending')
          "
        >
          <Clock3 :size="15" />
          View Pending Payroll
        </button>

        <button
          v-if="
            period.status ===
              'Processing' ||
            period.status ===
              'Closed'
          "
          type="button"
          class="action-item"
          @click="
            run('completed')
          "
        >
          <ReceiptText :size="15" />
          View Completed Payroll
        </button>

        <template
          v-if="
            period.status ===
            'Processing'
          "
        >

          <div class="divider" />

          <button
            type="button"
            class="action-item success"
            @click="
              run('close')
            "
          >
            <CircleCheck :size="15" />
            Close Period
          </button>

        </template>

        <template
          v-if="
            period.status ===
              'Draft' ||
            period.status ===
              'Open'
          "
        >

          <div class="divider" />

          <button
            type="button"
            class="action-item danger"
            @click="
              run('cancel')
            "
          >
            <CircleX :size="15" />
            Cancel Period
          </button>

        </template>

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

  width: 230px;

  padding: 6px;

  border:
    1px solid
    var(--border);

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

  font-family:
    inherit;

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

.action-item.blue {
  color:
    var(--primary);
}

.action-item.success {
  color:
    var(--green);
}

.action-item.success:hover {
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