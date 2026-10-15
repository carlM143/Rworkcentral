<script setup lang="ts">
import {
  MoreHorizontal,
  Eye,
  PencilLine,
  History,
  UserRound,
} from 'lucide-vue-next'

import RequestTimeCorrectionModal from '~/components/timekeeping/time-log-corrections/RequestTimeCorrectionModal.vue'
import TimeCorrectionHistoryModal from '~/components/timekeeping/time-log-corrections/TimeCorrectionHistoryModal.vue'

import type {
  TimeLogRecord,
} from '~/types/timekeeping'

import type {
  TimeLogCorrectionRequest,
} from '~/types/timeLogCorrection'

const props = defineProps<{
  log: TimeLogRecord
}>()

const router =
  useRouter()

const {
  info,
} = useToast()

const {
  getRequestsByTimeLogId,
  hasPendingRequestForTimeLog,
} = useTimeLogCorrections()

/* =========================================================
   MENU
========================================================= */

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
   MODALS
========================================================= */

const correctionModalOpen =
  ref(false)

const historyModalOpen =
  ref(false)

/* =========================================================
   REQUEST STATE
========================================================= */

const hasPendingRequest =
  computed(() => {
    return hasPendingRequestForTimeLog(
      props.log.id,
    )
  })

const historyCount =
  computed(() => {
    return getRequestsByTimeLogId(
      props.log.id,
    ).length
  })

/* =========================================================
   POSITION MENU
========================================================= */

const updateMenuPosition =
  async () => {
    if (
      !import.meta.client ||
      !triggerRef.value
    ) {
      return
    }

    const triggerRect =
      triggerRef.value
        .getBoundingClientRect()

    await nextTick()

    const menuWidth =
      menuRef.value
        ?.offsetWidth ?? 220

    const menuHeight =
      menuRef.value
        ?.offsetHeight ?? 180

    const gap = 6
    const padding = 10

    let left =
      triggerRect.right -
      menuWidth

    if (left < padding) {
      left = padding
    }

    if (
      left + menuWidth >
      window.innerWidth -
        padding
    ) {
      left =
        window.innerWidth -
        menuWidth -
        padding
    }

    let top =
      triggerRect.bottom +
      gap

    const spaceBelow =
      window.innerHeight -
      triggerRect.bottom

    const spaceAbove =
      triggerRect.top

    if (
      spaceBelow <
        menuHeight + gap &&
      spaceAbove >
        menuHeight + gap
    ) {
      top =
        triggerRect.top -
        menuHeight -
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
   OPEN / CLOSE MENU
========================================================= */

const toggleMenu =
  async () => {
    if (open.value) {
      open.value = false

      return
    }

    open.value = true

    await nextTick()

    updateMenuPosition()
  }

const closeMenu = () => {
  open.value = false
}

/* =========================================================
   VIEW TIME LOG
========================================================= */

const handleView = () => {
  closeMenu()

  const timeIn =
    props.log.timeIn ||
    'No log'

  const timeOut =
    props.log.timeOut ||
    'No log'

  info(
    'Time Log Details',
    `${props.log.employeeName} · ${props.log.date} · ${timeIn} - ${timeOut}`,
  )
}

/* =========================================================
   REQUEST CORRECTION
========================================================= */

const handleCorrection = () => {
  closeMenu()

  if (
    hasPendingRequest.value
  ) {
    info(
      'Pending Correction',
      'This attendance record already has a pending correction request.',
    )

    return
  }

  correctionModalOpen.value =
    true
}

/* =========================================================
   CORRECTION HISTORY
========================================================= */

const handleHistory = () => {
  closeMenu()

  historyModalOpen.value =
    true
}

/* =========================================================
   VIEW EMPLOYEE
========================================================= */

const handleEmployee = () => {
  closeMenu()

  router.push(
    `/employees/${props.log.employeeId}`,
  )
}

/* =========================================================
   SUBMITTED
========================================================= */

const handleSubmitted = (
  _request:
    TimeLogCorrectionRequest,
) => {
  correctionModalOpen.value =
    false
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

  closeMenu()
}

/* =========================================================
   ESCAPE
========================================================= */

const handleKeydown = (
  event: KeyboardEvent,
) => {
  if (
    event.key === 'Escape'
  ) {
    closeMenu()
  }
}

/* =========================================================
   LIFECYCLE
========================================================= */

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
    handleOutsideClick,
  )

  window.removeEventListener(
    'keydown',
    handleKeydown,
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

    <!-- THREE DOTS -->

    <button
      ref="triggerRef"
      type="button"
      class="actions-trigger"
      @click.stop="
        toggleMenu
      "
    >
      <MoreHorizontal :size="17" />
    </button>

    <!-- MENU -->

    <Teleport to="body">

      <div
        v-if="open"
        ref="menuRef"
        class="time-log-actions-menu"
        :style="menuStyle"
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

        <!-- REQUEST CORRECTION -->

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

        <div class="divider" />

        <!-- EMPLOYEE -->

        <button
          type="button"
          class="action-item"
          @click="
            handleEmployee
          "
        >
          <UserRound :size="15" />

          <span>
            View Employee
          </span>
        </button>

      </div>

    </Teleport>

    <!-- =========================================
         REQUEST CORRECTION MODAL
    ========================================== -->

    <RequestTimeCorrectionModal
      :open="
        correctionModalOpen
      "
      :log="log"
      @close="
        correctionModalOpen =
          false
      "
      @submitted="
        handleSubmitted
      "
    />

    <!-- =========================================
         CORRECTION HISTORY MODAL
    ========================================== -->

    <TimeCorrectionHistoryModal
      :open="
        historyModalOpen
      "
      :log="log"
      @close="
        historyModalOpen =
          false
      "
    />

  </div>
</template>

<style scoped>
.actions-wrapper {
  display: inline-flex;
}

.actions-trigger {
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

.actions-trigger:hover {
  border-color:
    var(--border);

  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);
}

/* =========================================================
   MENU
========================================================= */

.time-log-actions-menu {
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
    0 16px 40px
    rgba(0, 0, 0, 0.25);
}

/* =========================================================
   ITEM
========================================================= */

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

/* =========================================================
   CORRECTION
========================================================= */

.action-item.correction {
  color:
    var(--primary);
}

.action-item.correction:hover {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.action-item.disabled {
  opacity: 0.5;

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

/* =========================================================
   ACTION COPY
========================================================= */

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

/* =========================================================
   HISTORY COUNT
========================================================= */

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
    var(--purple-soft);

  color:
    var(--purple);

  font-size: 8px;
  font-weight: 700;
}

/* =========================================================
   DIVIDER
========================================================= */

.divider {
  height: 1px;

  margin:
    5px 0;

  background:
    var(--border-soft);
}
</style>