<script setup lang="ts">
import {
  CircleCheck,
  CircleX,
  TriangleAlert,
  Info,
  X,
} from 'lucide-vue-next'

const {
  toasts,
  removeToast,
} = useToast()

const getIcon = (type: string) => {
  switch (type) {
    case 'success':
      return CircleCheck

    case 'error':
      return CircleX

    case 'warning':
      return TriangleAlert

    default:
      return Info
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast-item"
          :class="`toast-${toast.type}`"
        >
          <div
            class="toast-icon"
            :class="`icon-${toast.type}`"
          >
            <component
              :is="getIcon(toast.type)"
              :size="18"
            />
          </div>

          <div class="toast-content">
            <strong>
              {{ toast.title }}
            </strong>

            <p v-if="toast.message">
              {{ toast.message }}
            </p>
          </div>

          <button
            type="button"
            class="toast-close"
            @click="removeToast(toast.id)"
          >
            <X :size="15" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;

  top: 84px;
  right: 22px;

  z-index: 9999;

  display: flex;
  width: 360px;
  max-width: calc(100vw - 32px);

  flex-direction: column;
  gap: 10px;

  pointer-events: none;
}

.toast-item {
  position: relative;

  display: flex;
  align-items: flex-start;
  gap: 11px;

  padding: 13px 14px;

  border: 1px solid var(--border);
  border-radius: 11px;

  background: var(--bg-card);
  color: var(--text-primary);

  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.18);

  pointer-events: auto;
}

.toast-item::before {
  content: "";

  position: absolute;

  top: 10px;
  bottom: 10px;
  left: 0;

  width: 3px;

  border-radius: 0 4px 4px 0;
}

.toast-success::before {
  background: var(--green);
}

.toast-error::before {
  background: var(--red);
}

.toast-warning::before {
  background: var(--orange);
}

.toast-info::before {
  background: var(--primary);
}

.toast-icon {
  display: flex;

  width: 34px;
  height: 34px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 9px;
}

.icon-success {
  background: var(--green-soft);
  color: var(--green);
}

.icon-error {
  background: var(--red-soft);
  color: var(--red);
}

.icon-warning {
  background: var(--orange-soft);
  color: var(--orange);
}

.icon-info {
  background: var(--primary-soft);
  color: var(--primary);
}

.toast-content {
  min-width: 0;
  flex: 1;

  padding-top: 1px;
}

.toast-content strong {
  display: block;

  color: var(--text-primary);

  font-size: 11px;
  font-weight: 700;
}

.toast-content p {
  margin: 4px 0 0;

  color: var(--text-secondary);

  font-size: 9px;
  line-height: 1.5;
}

.toast-close {
  display: flex;

  width: 27px;
  height: 27px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border: 0;
  border-radius: 6px;

  background: transparent;
  color: var(--text-muted);
}

.toast-close:hover {
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

/* ANIMATION */

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.toast-enter-from {
  opacity: 0;

  transform:
    translateX(25px);
}

.toast-leave-to {
  opacity: 0;

  transform:
    translateX(25px);
}

.toast-move {
  transition:
    transform 0.22s ease;
}

@media (max-width: 600px) {
  .toast-container {
    top: 76px;
    right: 16px;
    left: 16px;

    width: auto;
    max-width: none;
  }
}
</style>