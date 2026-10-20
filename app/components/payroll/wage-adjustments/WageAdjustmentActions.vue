<script setup lang="ts">
import {
  MoreHorizontal,
  Eye,
  ClipboardCheck,
  UserRound,
  History,
} from 'lucide-vue-next'

import type {
  WageAdjustmentRecord,
} from '~/types/wageManagement'

const props =
  defineProps<{
    record: WageAdjustmentRecord
  }>()

const emit =
  defineEmits<{
    view: [
      record: WageAdjustmentRecord,
    ]

    review: [
      record: WageAdjustmentRecord,
    ]

    employee: [
      record: WageAdjustmentRecord,
    ]

    history: [
      record: WageAdjustmentRecord,
    ]
  }>()

const open =
  ref(false)

const wrapper =
  ref<HTMLElement | null>(
    null,
  )

const handleOutside = (
  event: MouseEvent,
) => {
  if (
    wrapper.value &&
    !wrapper.value.contains(
      event.target as Node,
    )
  ) {
    open.value = false
  }
}

const trigger = (
  action:
    | 'view'
    | 'review'
    | 'employee'
    | 'history',
) => {
  open.value = false

  emit(
    action as any,
    props.record,
  )
}

onMounted(() => {
  document.addEventListener(
    'click',
    handleOutside,
  )
})

onBeforeUnmount(() => {
  document.removeEventListener(
    'click',
    handleOutside,
  )
})
</script>

<template>
  <div
    ref="wrapper"
    class="actions"
  >

    <button
      type="button"
      class="trigger"
      title="More actions"
      @click.stop="
        open = !open
      "
    >
      <MoreHorizontal
        :size="17"
      />
    </button>

    <div
      v-if="open"
      class="menu"
    >

      <button
        type="button"
        @click="
          trigger('view')
        "
      >
        <Eye :size="14" />

        View Details
      </button>

      <button
        v-if="
          record.status !==
          'Effective'
        "
        type="button"
        @click="
          trigger('review')
        "
      >
        <ClipboardCheck
          :size="14"
        />

        Review Adjustment
      </button>

      <div class="divider" />

      <button
        type="button"
        @click="
          trigger('employee')
        "
      >
        <UserRound
          :size="14"
        />

        View Employee
      </button>

      <button
        type="button"
        @click="
          trigger('history')
        "
      >
        <History :size="14" />

        Compensation History
      </button>

    </div>

  </div>
</template>

<style scoped>
.actions {
  position: relative;

  display: inline-flex;
}

.trigger {
  display: flex;

  width: 30px;
  height: 30px;

  align-items: center;
  justify-content: center;

  border: 0;
  border-radius: 7px;

  background: transparent;

  color: var(--text-secondary);

  cursor: pointer;
}

.trigger:hover {
  background: var(--primary-soft);
  color: var(--primary);
}

.menu {
  position: absolute;

  z-index: 100;

  top: calc(100% + 5px);
  right: 0;

  width: 190px;

  padding: 5px;

  border: 1px solid var(--border);
  border-radius: 9px;

  background: var(--bg-card);

  box-shadow:
    0 14px 35px
    rgba(0, 0, 0, 0.22);
}

.menu button {
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
  font-size: 8.5px;

  text-align: left;

  cursor: pointer;
}

.menu button:hover {
  background: var(--primary-soft);
  color: var(--primary);
}

.divider {
  height: 1px;

  margin: 4px 0;

  background: var(--border-soft);
}
</style>