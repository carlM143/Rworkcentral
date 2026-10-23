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
  EmployeePayPeriod,
} from '~/types/employeePayPeriod'

const props =
  defineProps<{
    period: EmployeePayPeriod
  }>()

const emit =
  defineEmits<{
    view: [period: EmployeePayPeriod]
    edit: [period: EmployeePayPeriod]
    open: [period: EmployeePayPeriod]
    process: [period: EmployeePayPeriod]
    employees: [period: EmployeePayPeriod]
    pending: [period: EmployeePayPeriod]
    completed: [period: EmployeePayPeriod]
    close: [period: EmployeePayPeriod]
    cancel: [period: EmployeePayPeriod]
  }>()

const menuOpen =
  ref(false)

const triggerRef =
  ref<HTMLElement | null>(null)

const menuRef =
  ref<HTMLElement | null>(null)

const menuStyle =
  ref({
    top: '0px',
    left: '0px',
  })

const closeMenu = () => {
  menuOpen.value = false
}

const updatePosition =
  async () => {
    if (!triggerRef.value) {
      return
    }

    const rect =
      triggerRef.value
        .getBoundingClientRect()

    await nextTick()

    const width =
      menuRef.value?.offsetWidth ??
      220

    const height =
      menuRef.value?.offsetHeight ??
      350

    let left =
      rect.right - width

    if (left < 10) {
      left = 10
    }

    if (
      left + width >
      window.innerWidth - 10
    ) {
      left =
        window.innerWidth -
        width -
        10
    }

    let top =
      rect.bottom + 6

    if (
      top + height >
      window.innerHeight - 10
    ) {
      top =
        rect.top -
        height -
        6
    }

    menuStyle.value = {
      top:
        `${Math.max(10, top)}px`,

      left:
        `${left}px`,
    }
  }

const toggleMenu =
  async () => {
    menuOpen.value =
      !menuOpen.value

    if (menuOpen.value) {
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
    | 'employees'
    | 'pending'
    | 'completed'
    | 'close'
    | 'cancel',
) => {
  closeMenu()

  if (action === 'view') {
    emit('view', props.period)
    return
  }

  if (action === 'edit') {
    emit('edit', props.period)
    return
  }

  if (action === 'open') {
    emit('open', props.period)
    return
  }

  if (action === 'process') {
    emit('process', props.period)
    return
  }

  if (action === 'employees') {
    emit('employees', props.period)
    return
  }

  if (action === 'pending') {
    emit('pending', props.period)
    return
  }

  if (action === 'completed') {
    emit('completed', props.period)
    return
  }

  if (action === 'close') {
    emit('close', props.period)
    return
  }

  emit('cancel', props.period)
}

const handleOutside = (
  event: MouseEvent,
) => {
  const target =
    event.target as Node

  if (
    triggerRef.value?.contains(target) ||
    menuRef.value?.contains(target)
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
      @click.stop="toggleMenu"
    >
      <MoreHorizontal :size="17" />
    </button>

    <Teleport to="body">

      <div
        v-if="menuOpen"
        ref="menuRef"
        class="actions-menu"
        :style="menuStyle"
        @click.stop
      >

        <button
          type="button"
          @click="run('view')"
        >
          <Eye :size="14" />
          View Details
        </button>

        <button
          v-if="
            period.status === 'Draft' ||
            period.status === 'Open'
          "
          type="button"
          @click="run('edit')"
        >
          <PencilLine :size="14" />
          Edit Pay Period
        </button>

        <template
          v-if="
            period.status === 'Draft'
          "
        >
          <div class="divider" />

          <button
            type="button"
            class="success"
            @click="run('open')"
          >
            <FolderOpen :size="14" />
            Open Period
          </button>
        </template>

        <template
          v-if="
            period.status === 'Open'
          "
        >
          <div class="divider" />

          <button
            type="button"
            class="success"
            @click="run('process')"
          >
            <Play :size="14" />
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
          @click="run('employees')"
        >
          <Users :size="14" />
          View Employees
        </button>

        <button
          v-if="
            period.status === 'Open' ||
            period.status === 'Processing'
          "
          type="button"
          @click="run('pending')"
        >
          <Clock3 :size="14" />
          Pending Payroll
        </button>

        <button
          v-if="
            period.status === 'Processing' ||
            period.status === 'Closed'
          "
          type="button"
          @click="run('completed')"
        >
          <ReceiptText :size="14" />
          Completed Payroll
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
            class="success"
            @click="run('close')"
          >
            <CircleCheck :size="14" />
            Close Period
          </button>
        </template>

        <template
          v-if="
            period.status === 'Draft' ||
            period.status === 'Open'
          "
        >
          <div class="divider" />

          <button
            type="button"
            class="danger"
            @click="run('cancel')"
          >
            <CircleX :size="14" />
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
  width: 215px;
  padding: 5px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card);
  box-shadow: 0 16px 45px rgba(0, 0, 0, 0.28);
}

.actions-menu button {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 8px;
  padding: 8px 9px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  font-family: inherit;
  font-size: 8px;
  text-align: left;
  cursor: pointer;
}

.actions-menu button:hover {
  background: var(--primary-soft);
  color: var(--primary);
}

.actions-menu .success {
  color: var(--green);
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