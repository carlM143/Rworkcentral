<script setup lang="ts">
import {
  MoreHorizontal,
  Eye,
  PencilLine,
  Send,
  Navigation,
  CircleCheck,
  MapPinned,
  UserRound,
  CircleX,
} from 'lucide-vue-next'

import type {
  TripTicket,
} from '~/types/tripTicket'

const props = defineProps<{
  ticket: TripTicket
}>()

const emit = defineEmits<{
  view: [ticket: TripTicket]
  edit: [ticket: TripTicket]
  issue: [ticket: TripTicket]
  inUse: [ticket: TripTicket]
  complete: [ticket: TripTicket]
  trip: [ticket: TripTicket]
  employee: [ticket: TripTicket]
  cancel: [ticket: TripTicket]
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

/* =========================================================
   POSITION
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
        ?.offsetWidth ??
      220

    const height =
      menuRef.value
        ?.offsetHeight ??
      280

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

/* =========================================================
   ACTIONS
========================================================= */

const execute = (
  action:
    | 'view'
    | 'edit'
    | 'issue'
    | 'inUse'
    | 'complete'
    | 'trip'
    | 'employee'
    | 'cancel',
) => {
  close()

  if (
    action === 'view'
  ) {
    emit(
      'view',
      props.ticket,
    )

    return
  }

  if (
    action === 'edit'
  ) {
    emit(
      'edit',
      props.ticket,
    )

    return
  }

  if (
    action === 'issue'
  ) {
    emit(
      'issue',
      props.ticket,
    )

    return
  }

  if (
    action === 'inUse'
  ) {
    emit(
      'inUse',
      props.ticket,
    )

    return
  }

  if (
    action === 'complete'
  ) {
    emit(
      'complete',
      props.ticket,
    )

    return
  }

  if (
    action === 'trip'
  ) {
    emit(
      'trip',
      props.ticket,
    )

    return
  }

  if (
    action === 'employee'
  ) {
    emit(
      'employee',
      props.ticket,
    )

    return
  }

  emit(
    'cancel',
    props.ticket,
  )
}

/* =========================================================
   OUTSIDE
========================================================= */

const outsideClick = (
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

const keydown = (
  event: KeyboardEvent,
) => {
  if (
    event.key ===
    'Escape'
  ) {
    close()
  }
}

onMounted(() => {
  document.addEventListener(
    'mousedown',
    outsideClick,
  )

  window.addEventListener(
    'keydown',
    keydown,
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
    outsideClick,
  )

  window.removeEventListener(
    'keydown',
    keydown,
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
          View Ticket
        </button>

        <button
          v-if="
            ticket.status ===
              'Pending' ||
            ticket.status ===
              'Issued'
          "
          type="button"
          class="
            action-item
            edit
          "
          @click="
            execute('edit')
          "
        >
          <PencilLine :size="15" />
          Edit Ticket
        </button>

        <template
          v-if="
            ticket.status ===
            'Pending'
          "
        >

          <div class="divider" />

          <button
            type="button"
            class="
              action-item
              primary
            "
            @click="
              execute('issue')
            "
          >
            <Send :size="15" />
            Issue Ticket
          </button>

        </template>

        <template
          v-if="
            ticket.status ===
            'Issued'
          "
        >

          <div class="divider" />

          <button
            type="button"
            class="
              action-item
              primary
            "
            @click="
              execute('inUse')
            "
          >
            <Navigation :size="15" />
            Mark as In Use
          </button>

        </template>

        <template
          v-if="
            ticket.status ===
            'In Use'
          "
        >

          <div class="divider" />

          <button
            type="button"
            class="
              action-item
              success
            "
            @click="
              execute('complete')
            "
          >
            <CircleCheck :size="15" />
            Complete Ticket
          </button>

        </template>

        <div class="divider" />

        <button
          type="button"
          class="action-item"
          @click="
            execute('trip')
          "
        >
          <MapPinned :size="15" />
          View Trip
        </button>

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

        <template
          v-if="
            ticket.status ===
              'Pending' ||
            ticket.status ===
              'Issued'
          "
        >

          <div class="divider" />

          <button
            type="button"
            class="
              action-item
              danger
            "
            @click="
              execute('cancel')
            "
          >
            <CircleX :size="15" />
            Cancel Ticket
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

.action-item.edit,
.action-item.primary {
  color:
    var(--primary);
}

.action-item.primary:hover {
  background:
    var(--primary-soft);
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