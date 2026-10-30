<script setup lang="ts">
import { AlertTriangle, X } from 'lucide-vue-next'

const open = defineModel<boolean>({ default: false })

const close = () => {
  open.value = false
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') close()
}

watch(open, (isOpen) => {
  if (!import.meta.client) return
  document.body.style.overflow = isOpen ? 'hidden' : ''
}, { immediate: true })

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="validation-modal">
      <div
        v-if="open"
        class="validation-modal-overlay"
        role="presentation"
        @click.self="close"
      >
        <section
          class="validation-modal-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="request-validation-title"
          aria-describedby="request-validation-message"
        >
          <button type="button" class="modal-close" aria-label="Close validation message" @click="close">
            <X :size="18" />
          </button>

          <span class="modal-icon" aria-hidden="true">
            <AlertTriangle :size="26" />
          </span>
          <h2 id="request-validation-title">Paid Leave Unavailable</h2>
          <p id="request-validation-message">
            No eligible paid leave policy is available. You can still request Unpaid leave.
          </p>

          <button type="button" class="modal-action" autofocus @click="close">Okay</button>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.validation-modal-overlay {
  --modal-bg: var(--bg-card, #ffffff);
  --modal-bg-soft: var(--bg-card-soft, #f7f9fc);
  --modal-border: var(--border, #d9e0ea);
  --modal-text: var(--text-primary, #111827);
  --modal-text-secondary: var(--text-secondary, #596579);
  --modal-primary: var(--primary, #246bfd);
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgb(3 12 28 / 68%);
  backdrop-filter: blur(5px);
}

.validation-modal-card {
  position: relative;
  width: min(100%, 420px);
  box-sizing: border-box;
  padding: 28px;
  border: 1px solid var(--modal-border);
  border-radius: 16px;
  background: var(--modal-bg);
  color: var(--modal-text);
  box-shadow: 0 24px 70px rgb(0 0 0 / 30%);
  text-align: center;
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid var(--modal-border);
  border-radius: 9px;
  background: var(--modal-bg-soft);
  color: var(--modal-text-secondary);
  cursor: pointer;
}

.modal-icon {
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: var(--orange-soft, #fff3e0);
  color: var(--orange, #f59e0b);
}

h2 {
  margin: 0;
  font-size: 18px;
}

p {
  margin: 10px 0 22px;
  color: var(--modal-text-secondary);
  font-size: 13px;
  line-height: 1.65;
}

.modal-action {
  width: 100%;
  min-height: 46px;
  padding: 0 18px;
  border: 1px solid var(--modal-primary);
  border-radius: 10px;
  background: var(--modal-primary);
  color: #fff;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.modal-close:focus-visible,
.modal-action:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--modal-primary) 30%, transparent);
  outline-offset: 2px;
}

.validation-modal-enter-active,
.validation-modal-leave-active {
  transition: opacity .18s ease;
}

.validation-modal-enter-active .validation-modal-card,
.validation-modal-leave-active .validation-modal-card {
  transition: transform .18s ease, opacity .18s ease;
}

.validation-modal-enter-from,
.validation-modal-leave-to {
  opacity: 0;
}

.validation-modal-enter-from .validation-modal-card,
.validation-modal-leave-to .validation-modal-card {
  opacity: 0;
  transform: translateY(10px) scale(.98);
}

@media (max-width: 520px) {
  .validation-modal-overlay {
    align-items: end;
    padding: 12px 12px calc(12px + env(safe-area-inset-bottom));
  }

  .validation-modal-card {
    padding: 26px 20px 20px;
    border-radius: 18px;
  }

  .modal-action {
    min-height: 48px;
  }
}
</style>
