<script setup lang="ts">
import {
  MoreHorizontal,
  Eye,
  PencilLine,
  History,
  Clock3,
} from 'lucide-vue-next'

import type {
  TimeLogRecord,
} from '~/types/timekeeping'

const props = withDefaults(
  defineProps<{
    log:
      TimeLogRecord

    hasPendingRequest?:
      boolean

    historyCount?:
      number
  }>(),
  {
    hasPendingRequest:
      false,

    historyCount:
      0,
  },
)

const emit = defineEmits<{
  view: [
    log:
      TimeLogRecord,
  ]

  requestCorrection: [
    log:
      TimeLogRecord,
  ]

  history: [
    log:
      TimeLogRecord,
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

/* =========================================================
   POSITION
========================================================= */

const updatePosition = () => {
  if (
    !triggerRef.value
  ) {
    return
  }

  const rect =
    triggerRef.value
      .getBoundingClientRect()

  const menuWidth =
    225

  const menuHeight =
    155

  let top =
    rect.bottom + 6

  if (
    top +
      menuHeight >
    window.innerHeight -
      8
  ) {
    top =
      rect.top -
      menuHeight -
      6
  }

  let left =
    rect.right -
    menuWidth

  if (left < 8) {
    left = 8
  }

  if (
    left +
      menuWidth >
    window.innerWidth -
      8
  ) {
    left =
      window.innerWidth -
      menuWidth -
      8
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

const handleView = () => {
  close()

  emit(
    'view',
    props.log,
  )
}

const handleCorrection =
  () => {
    if (
      props.hasPendingRequest
    ) {
      return
    }

    close()

    emit(
      'requestCorrection',
      props.log,
    )
  }

const handleHistory = () => {
  close()

  emit(
    'history',
    props.log,
  )
}

/* =========================================================
   EVENTS
========================================================= */

const handleDocumentClick =
  () => {
    close()
  }

const handleEscape = (
  event:
    KeyboardEvent,
) => {
  if (
    event.key ===
    'Escape'
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
        class="actions-menu"
        :style="
          menuStyle
        "
        @click.stop
      >

        <!-- VIEW -->

        <button
          type="button"
          class="action-item"
          @click="
            handleView
          "
        >
          <Eye :size="15" />

          <span>
            View Time Log
          </span>
        </button>

        <!-- CORRECTION -->

        <button
          type="button"
          class="action-item correction"
          :class="{
            disabled:
              hasPendingRequest,
          }"
          :disabled="
            hasPendingRequest
          "
          @click="
            handleCorrection
          "
        >
          <PencilLine :size="15" />

          <div class="action-copy">

            <span>
              Request Correction
            </span>

            <small
              v-if="
                hasPendingRequest
              "
            >
              Pending request exists
            </small>

          </div>

        </button>

        <div class="divider" />

        <!-- HISTORY -->

        <button
          type="button"
          class="action-item"
          @click="
            handleHistory
          "
        >
          <History :size="15" />

          <span>
            Correction History
          </span>

          <span
            v-if="
              historyCount > 0
            "
            class="history-count"
          >
            {{ historyCount }}
          </span>

        </button>

        <div
          v-if="
            log.status ===
            'Missing Log'
          "
          class="missing-note"
        >
          <Clock3 :size="13" />

          Missing attendance record
        </div>

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
  min-height: 39px;

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

.action-item.correction {
  color:
    var(--primary);
}

.action-item.correction:hover {
  background:
    var(--primary-soft);
}

.action-item.disabled {
  opacity: 0.52;

  color:
    var(--text-muted);

  cursor: not-allowed;
}

.action-item.disabled:hover {
  background:
    transparent;

  color:
    var(--text-muted);
}

.action-copy {
  min-width: 0;

  flex: 1;
}

.action-copy span,
.action-copy small {
  display: block;
}

.action-copy small {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 7px;
}

.history-count {
  display: inline-flex;

  min-width: 19px;
  height: 19px;

  margin-left: auto;

  align-items: center;
  justify-content: center;

  padding:
    0 5px;

  border-radius: 20px;

  background:
    var(--primary-soft);

  color:
    var(--primary);

  font-size: 8px;
  font-weight: 700;
}

.divider {
  height: 1px;

  margin:
    5px 0;

  background:
    var(--border-soft);
}

.missing-note {
  display: flex;

  align-items: center;

  gap: 6px;

  margin-top: 5px;

  padding:
    7px 9px;

  border-radius: 6px;

  background:
    var(--orange-soft);

  color:
    var(--orange);

  font-size: 8px;
}
</style>