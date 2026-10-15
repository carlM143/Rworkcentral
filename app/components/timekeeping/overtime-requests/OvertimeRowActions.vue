<script setup lang="ts">
import {
  Ban,
  ClipboardCheck,
  Eye,
  History,
  MoreHorizontal,
} from 'lucide-vue-next'

import type {
  OvertimeActionRequest,
} from '~/types/overtimeActions'

const props =
  defineProps<{
    request: OvertimeActionRequest
  }>()

const emit =
  defineEmits<{
    view: [request: OvertimeActionRequest]

    review: [request: OvertimeActionRequest]

    history: [request: OvertimeActionRequest]

    cancel: [request: OvertimeActionRequest]
  }>()

const open = ref(false)

const buttonRef =
  ref<HTMLElement | null>(
    null,
  )

const menuStyle =
  ref({
    top: '0px',
    left: '0px',
  })

const canReview =
  computed(() => {
    return [
      'Pending',
      'For Review',
    ].includes(
      props.request.status,
    )
  })

const canCancel =
  computed(() => {
    return [
      'Pending',
      'For Review',
    ].includes(
      props.request.status,
    )
  })

const positionMenu = () => {
  if (!buttonRef.value) {
    return
  }

  const rect =
    buttonRef.value.getBoundingClientRect()

  const menuWidth = 195

  let left =
    rect.right -
    menuWidth

  if (left < 8) {
    left = 8
  }

  menuStyle.value = {
    top:
      `${rect.bottom + 6}px`,

    left:
      `${left}px`,
  }
}

const toggleMenu = () => {
  open.value =
    !open.value

  if (open.value) {
    nextTick(
      positionMenu,
    )
  }
}

const close = () => {
  open.value = false
}

const handleView = () => {
  emit(
    'view',
    props.request,
  )

  close()
}

const handleReview = () => {
  emit(
    'review',
    props.request,
  )

  close()
}

const handleHistory = () => {
  emit(
    'history',
    props.request,
  )

  close()
}

const handleCancel = () => {
  emit(
    'cancel',
    props.request,
  )

  close()
}

const handleWindowChange = () => {
  if (open.value) {
    positionMenu()
  }
}

onMounted(() => {
  window.addEventListener(
    'resize',
    handleWindowChange,
  )

  window.addEventListener(
    'scroll',
    handleWindowChange,
    true,
  )
})

onBeforeUnmount(() => {
  window.removeEventListener(
    'resize',
    handleWindowChange,
  )

  window.removeEventListener(
    'scroll',
    handleWindowChange,
    true,
  )
})
</script>

<template>
  <div class="row-action">

    <button
      ref="buttonRef"
      type="button"
      class="more-button"
      title="More actions"
      @click.stop="toggleMenu"
    >
      <MoreHorizontal
        :size="16"
      />
    </button>

    <Teleport to="body">

      <template v-if="open">

        <button
          type="button"
          class="menu-backdrop"
          @click="close"
        />

        <div
          class="action-menu"
          :style="menuStyle"
        >

          <button
            type="button"
            @click="handleView"
          >
            <Eye :size="14" />

            <span>
              View Details
            </span>
          </button>

          <button
            v-if="canReview"
            type="button"
            @click="handleReview"
          >
            <ClipboardCheck
              :size="14"
            />

            <span>
              Review Request
            </span>
          </button>

          <button
            type="button"
            @click="handleHistory"
          >
            <History
              :size="14"
            />

            <span>
              Approval History
            </span>
          </button>

          <div
            v-if="canCancel"
            class="menu-divider"
          />

          <button
            v-if="canCancel"
            type="button"
            class="danger"
            @click="handleCancel"
          >
            <Ban :size="14" />

            <span>
              Cancel Request
            </span>
          </button>

        </div>

      </template>

    </Teleport>

  </div>
</template>

<style scoped>
.row-action {
  display: inline-flex;
}

.more-button {
  display: flex;

  width: 29px;
  height: 29px;

  align-items: center;
  justify-content: center;

  border: 1px solid transparent;

  border-radius: 6px;

  background: transparent;

  color:
    var(--text-secondary);

  cursor: pointer;
}

.more-button:hover {
  border-color:
    var(--border);

  background:
    var(--bg-card-soft);

  color:
    var(--primary);
}

.menu-backdrop {
  position: fixed;

  z-index: 99980;

  inset: 0;

  border: 0;

  background: transparent;
}

.action-menu {
  position: fixed;

  z-index: 99981;

  width: 195px;

  padding: 5px;

  border:
    1px solid var(--border);

  border-radius: 9px;

  background:
    var(--bg-card);

  box-shadow:
    0 14px 35px
    rgba(0, 0, 0, 0.22);
}

.action-menu button {
  display: flex;

  width: 100%;
  min-height: 34px;

  align-items: center;

  gap: 8px;

  padding:
    0 9px;

  border: 0;

  border-radius: 6px;

  background:
    transparent;

  color:
    var(--text-secondary);

  font-family: inherit;

  font-size: 8.5px;

  text-align: left;

  cursor: pointer;
}

.action-menu button:hover {
  background:
    var(--bg-card-soft);

  color:
    var(--primary);
}

.action-menu button.danger {
  color:
    var(--red);
}

.action-menu button.danger:hover {
  background:
    var(--red-soft);
}

.menu-divider {
  height: 1px;

  margin: 4px 0;

  background:
    var(--border-soft);
}
</style>