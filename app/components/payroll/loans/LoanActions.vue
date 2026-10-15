<script setup lang="ts">
import {
  MoreHorizontal,
  Eye,
  PencilLine,
  CircleCheck,
  CircleX,
  Play,
  History,
  UserRound,
  CheckCheck,
} from 'lucide-vue-next'

import type {
  LoanRecord,
} from '~/types/loan'

const props =
  defineProps<{
    loan: LoanRecord
  }>()

const emit =
  defineEmits<{
    view: [loan: LoanRecord]
    edit: [loan: LoanRecord]
    approve: [loan: LoanRecord]
    reject: [loan: LoanRecord]
    activate: [loan: LoanRecord]
    employee: [loan: LoanRecord]
    history: [loan: LoanRecord]
    complete: [loan: LoanRecord]
    cancel: [loan: LoanRecord]
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
  open.value =
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
      225

    const height =
      menuRef.value
        ?.offsetHeight ??
      320

    let left =
      rect.right -
      width

    if (left < 10) {
      left = 10
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

const toggle =
  async () => {
    open.value =
      !open.value

    if (open.value) {
      await nextTick()

      updatePosition()
    }
  }

const run = (
  action:
    | 'view'
    | 'edit'
    | 'approve'
    | 'reject'
    | 'activate'
    | 'employee'
    | 'history'
    | 'complete'
    | 'cancel',
) => {
  close()

  emit(
    action,
    props.loan,
  )
}

const outside = (
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

  close()
}

onMounted(() => {
  document.addEventListener(
    'mousedown',
    outside,
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
    outside,
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
          class="action-item"
          @click="
            run('view')
          "
        >
          <Eye :size="15" />
          View Loan Details
        </button>

        <button
          v-if="
            loan.status ===
              'Pending' ||
            loan.status ===
              'Approved'
          "
          class="action-item blue"
          @click="
            run('edit')
          "
        >
          <PencilLine :size="15" />
          Edit Loan
        </button>

        <template
          v-if="
            loan.status ===
            'Pending'
          "
        >

          <div class="divider" />

          <button
            class="action-item success"
            @click="
              run('approve')
            "
          >
            <CircleCheck :size="15" />
            Approve Loan
          </button>

          <button
            class="action-item danger"
            @click="
              run('reject')
            "
          >
            <CircleX :size="15" />
            Reject Loan
          </button>

        </template>

        <button
          v-if="
            loan.status ===
            'Approved'
          "
          class="action-item success"
          @click="
            run('activate')
          "
        >
          <Play :size="15" />
          Activate Loan
        </button>

        <template
          v-if="
            loan.status ===
              'Active' ||
            loan.status ===
              'Completed'
          "
        >

          <div class="divider" />

          <button
            class="action-item"
            @click="
              run('history')
            "
          >
            <History :size="15" />
            Payment History
          </button>

        </template>

        <div class="divider" />

        <button
          class="action-item"
          @click="
            run('employee')
          "
        >
          <UserRound :size="15" />
          View Employee
        </button>

        <template
          v-if="
            loan.status ===
            'Active'
          "
        >

          <div class="divider" />

          <button
            class="action-item success"
            @click="
              run('complete')
            "
          >
            <CheckCheck :size="15" />
            Mark as Completed
          </button>

          <button
            class="action-item danger"
            @click="
              run('cancel')
            "
          >
            <CircleX :size="15" />
            Cancel Loan
          </button>

        </template>

        <button
          v-if="
            loan.status ===
            'Approved'
          "
          class="action-item danger"
          @click="
            run('cancel')
          "
        >
          <CircleX :size="15" />
          Cancel Loan
        </button>

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

  width: 225px;

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