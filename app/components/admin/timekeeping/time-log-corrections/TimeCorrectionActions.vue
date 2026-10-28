<script setup lang="ts">
import {
  MoreHorizontal,
  Eye,
  CircleCheck,
  CircleX,
  UserRound,
} from 'lucide-vue-next'

import type {
  TimeLogCorrectionRequest,
} from '~/types/timeLogCorrection'

const props = defineProps<{
  request:
    TimeLogCorrectionRequest
}>()

const emit = defineEmits<{
  view: [
    request:
      TimeLogCorrectionRequest,
  ]

  approve: [
    request:
      TimeLogCorrectionRequest,
  ]

  reject: [
    request:
      TimeLogCorrectionRequest,
  ]

  employee: [
    request:
      TimeLogCorrectionRequest,
  ]
}>()

const open =
  ref(false)

const triggerRef =
  ref<HTMLElement | null>(
    null,
  )

const menuStyle =
  ref<Record<
    string,
    string
  >>({})

const close = () => {
  open.value = false
}

const updatePosition = () => {
  if (!triggerRef.value) {
    return
  }

  const rect =
    triggerRef.value
      .getBoundingClientRect()

  const menuWidth =
    200

  const menuHeight =
    props.request.status ===
    'Pending'
      ? 195
      : 110

  let top =
    rect.bottom + 5

  if (
    window.innerHeight -
      rect.bottom <
    menuHeight
  ) {
    top =
      rect.top -
      menuHeight -
      5
  }

  let left =
    rect.right -
    menuWidth

  if (left < 8) {
    left = 8
  }

  menuStyle.value = {
    top:
      `${Math.max(
        8,
        top,
      )}px`,

    left:
      `${left}px`,

    width:
      `${menuWidth}px`,
  }
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

const handleAction = (
  action:
    'view' |
    'approve' |
    'reject' |
    'employee',
) => {
  close()

  emit(
    action,
    props.request,
  )
}

const documentClick =
  () => {
    close()
  }

onMounted(() => {
  document.addEventListener(
    'click',
    documentClick,
  )
})

onBeforeUnmount(() => {
  document.removeEventListener(
    'click',
    documentClick,
  )
})
</script>

<template>
  <div class="actions-wrapper">

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
        class="actions-menu"
        :style="menuStyle"
        @click.stop
      >

        <button
          type="button"
          class="action-item"
          @click="
            handleAction('view')
          "
        >
          <Eye :size="15" />

          View Request
        </button>

        <template
          v-if="
            request.status ===
            'Pending'
          "
        >

          <button
            type="button"
            class="action-item approve"
            @click="
              handleAction(
                'approve',
              )
            "
          >
            <CircleCheck :size="15" />

            Approve Request
          </button>

          <button
            type="button"
            class="action-item reject"
            @click="
              handleAction(
                'reject',
              )
            "
          >
            <CircleX :size="15" />

            Reject Request
          </button>

        </template>

        <div class="divider" />

        <button
          type="button"
          class="action-item"
          @click="
            handleAction(
              'employee',
            )
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
    1px solid var(--border);

  border-radius: 7px;

  background:
    transparent;

  color:
    var(--text-secondary);

  cursor: pointer;
}

.trigger:hover {
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