<script setup lang="ts">
import {
  MoreHorizontal,
  Eye,
  UserRound,
  Clock3,
  ReceiptText,
  ExternalLink,
} from 'lucide-vue-next'

import type {
  EmployeePayroll,
} from '~/types/employeePayroll'

const props =
  defineProps<{
    payroll: EmployeePayroll
  }>()

const emit =
  defineEmits<{
    view: [payroll: EmployeePayroll]
    employee: [payroll: EmployeePayroll]
    timeLogs: [payroll: EmployeePayroll]
    payslip: [payroll: EmployeePayroll]
    source: [payroll: EmployeePayroll]
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
      menuRef.value
        ?.offsetWidth ??
      220

    const height =
      menuRef.value
        ?.offsetHeight ??
      300

    let left =
      rect.right -
      width

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

    if (menuOpen.value) {
      await nextTick()

      updatePosition()
    }
  }

const run = (
  action:
    | 'view'
    | 'employee'
    | 'timeLogs'
    | 'payslip'
    | 'source',
) => {
  closeMenu()

  emit(
    action,
    props.payroll,
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
  <div class="action-wrapper">

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
        v-if="menuOpen"
        ref="menuRef"
        class="menu"
        :style="menuStyle"
        @click.stop
      >

        <button
          type="button"
          @click="
            run('view')
          "
        >
          <Eye :size="14" />

          View Payroll Details
        </button>

        <button
          type="button"
          @click="
            run('payslip')
          "
        >
          <ReceiptText :size="14" />

          View Payslip
        </button>

        <div class="divider" />

        <button
          type="button"
          @click="
            run('employee')
          "
        >
          <UserRound :size="14" />

          View Employee Profile
        </button>

        <button
          type="button"
          @click="
            run('timeLogs')
          "
        >
          <Clock3 :size="14" />

          View Time Logs
        </button>

        <div class="divider" />

        <button
          type="button"
          @click="
            run('source')
          "
        >
          <ExternalLink :size="14" />

          {{
            payroll.payrollStatus ===
            'Completed'
              ? 'Open Completed Payroll'
              : 'Open Pending Payroll'
          }}
        </button>

      </div>

    </Teleport>

  </div>
</template>

<style scoped>
.action-wrapper {
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

.menu {
  position: fixed;

  z-index: 99999;

  width: 220px;

  padding: 5px;

  border:
    1px solid var(--border);

  border-radius: 9px;

  background:
    var(--bg-card);

  box-shadow:
    0 16px 45px
    rgba(0, 0, 0, 0.28);
}

.menu button {
  display: flex;

  width: 100%;

  align-items: center;

  gap: 8px;

  padding:
    8px 9px;

  border: 0;
  border-radius: 6px;

  background:
    transparent;

  color:
    var(--text-secondary);

  font-family:
    inherit;

  font-size: 8px;

  text-align: left;

  cursor: pointer;
}

.menu button:hover {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.divider {
  height: 1px;

  margin: 4px;

  background:
    var(--border-soft);
}
</style>