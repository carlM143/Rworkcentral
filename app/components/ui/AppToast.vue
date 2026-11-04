<script setup lang="ts">
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-vue-next'

const { toasts, remove } = useToast()

const toastIcons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const toastTitles: Record<'success' | 'error' | 'warning' | 'info', string> = {
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Information',
}

const closeToast = (id: string) => {
  remove(id)
}
</script>

<template>
  <Teleport to="body">
    <div
      class="global-toast-container"
      aria-label="System notifications"
    >
      <TransitionGroup name="global-toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="global-toast-item"
          :class="`global-toast-${toast.type}`"
          :role="toast.type === 'error' ? 'alert' : 'status'"
        >
          <div class="global-toast-content">
            <div class="global-toast-icon">
              <component
                :is="toastIcons[toast.type]"
                :size="20"
                :stroke-width="2"
              />
            </div>

            <div class="global-toast-text">
              <strong>
                {{ toast.title || toastTitles[toast.type] }}
              </strong>

              <p v-if="toast.message">
                {{ toast.message }}
              </p>
            </div>

            <button
              type="button"
              class="global-toast-close"
              aria-label="Dismiss notification"
              @click="closeToast(toast.id)"
            >
              <X :size="16" />
            </button>
          </div>

          <div
            v-if="toast.duration > 0"
            class="global-toast-progress"
            :style="{
              animationDuration: `${toast.duration}ms`,
            }"
          />
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.global-toast-container {
  position: fixed;
  top: 84px;
  right: 22px;
  z-index: 2147483000;
  display: flex;
  width: min(385px, calc(100vw - 28px));
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.global-toast-item {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border, #273448);
  border-radius: 12px;
  background: var(--bg-card, #141d2c);
  box-shadow:
    0 12px 38px rgba(0, 0, 0, 0.22);
  color: var(--text-primary, #f1f5f9);
  pointer-events: auto;
}

.global-toast-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 13px 17px;
}

.global-toast-icon {
  display: flex;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
}

.global-toast-text {
  flex: 1;
  min-width: 0;
  padding-top: 2px;
}

.global-toast-text strong {
  display: block;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.4;
}

.global-toast-text p {
  margin: 5px 0 0;
  color: var(--text-secondary, #a9b4c4);
  font-size: 11px;
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.global-toast-close {
  display: flex;
  width: 25px;
  height: 25px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-muted, #98a2b3);
  cursor: pointer;
}

.global-toast-close:hover {
  background: var(--bg-card-soft, #192334);
  color: var(--text-primary, #f1f5f9);
}

.global-toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  transform-origin: left;
  animation-name: toast-countdown;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

/* SUCCESS */

.global-toast-success .global-toast-icon {
  background: var(--green-soft, #123326);
  color: var(--green, #16a663);
}

.global-toast-success .global-toast-progress {
  background: var(--green, #16a663);
}

/* ERROR */

.global-toast-error .global-toast-icon {
  background: var(--red-soft, #3a1d23);
  color: var(--red, #ef4444);
}

.global-toast-error .global-toast-progress {
  background: var(--red, #ef4444);
}

/* WARNING */

.global-toast-warning .global-toast-icon {
  background: var(--orange-soft, #3c2d12);
  color: var(--orange, #f59e0b);
}

.global-toast-warning .global-toast-progress {
  background: var(--orange, #f59e0b);
}

/* INFO */

.global-toast-info .global-toast-icon {
  background: var(--primary-soft, #142950);
  color: var(--primary, #246bfd);
}

.global-toast-info .global-toast-progress {
  background: var(--primary, #246bfd);
}

/* ANIMATIONS */

@keyframes toast-countdown {
  from {
    transform: scaleX(1);
  }

  to {
    transform: scaleX(0);
  }
}

.global-toast-enter-active,
.global-toast-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.global-toast-enter-from,
.global-toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.global-toast-move {
  transition: transform 0.22s ease;
}

@media (max-width: 600px) {
  .global-toast-container {
    top: 70px;
    right: 14px;
    left: 14px;
    width: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .global-toast-enter-active,
  .global-toast-leave-active,
  .global-toast-move {
    transition: none;
  }

  .global-toast-progress {
    animation: none;
  }
}
</style>
