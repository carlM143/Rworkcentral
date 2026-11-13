<script setup lang="ts">
import { AlertTriangle, HelpCircle } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  open: boolean
  title: string
  message?: string
  confirmText?: string
  cancelText?: string
  variant?: 'primary' | 'danger'
  loading?: boolean
}>(), {
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'primary',
  loading: false,
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

// Close with the Esc key
const onKeydown = (e: KeyboardEvent) => {
  if (props.open && e.key === 'Escape' && !props.loading) emit('cancel')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition name="cm">
      <div
        v-if="open"
        class="cm-overlay"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        @click.self="!loading && emit('cancel')"
      >
        <div class="cm-card">
          <div
            class="cm-icon"
            :class="`cm-icon--${variant}`"
          >
            <AlertTriangle
              v-if="variant === 'danger'"
              :size="22"
            />
            <HelpCircle
              v-else
              :size="22"
            />
          </div>

          <h3 class="cm-title">
            {{ title }}
          </h3>

          <p
            v-if="message"
            class="cm-message"
          >
            {{ message }}
          </p>

          <div class="cm-actions">
            <AppButton
              variant="secondary"
              :disabled="loading"
              @click="emit('cancel')"
            >
              {{ cancelText }}
            </AppButton>

            <AppButton
              :disabled="loading"
              :class="{ 'cm-btn--danger': variant === 'danger' }"
              @click="emit('confirm')"
            >
              {{ confirmText }}
            </AppButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.cm-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgb(0 0 0 / 60%);
  backdrop-filter: blur(3px);
}

.cm-card {
  width: 100%;
  max-width: 440px;
  padding: 26px 24px 22px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--bg-card);
  box-shadow: 0 20px 50px rgb(0 0 0 / 40%);
  text-align: center;
}

.cm-icon {
  display: grid;
  width: 48px;
  height: 48px;
  margin: 0 auto 14px;
  place-items: center;
  border-radius: 50%;
}

.cm-icon--primary {
  background: rgb(59 130 246 / 12%);
  color: #3b82f6;
}

.cm-icon--danger {
  background: rgb(251 146 60 / 12%);
  color: #fb923c;
}

.cm-title {
  margin: 0;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 700;
}

.cm-message {
  margin: 8px 0 0;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-line; /* keeps the line breaks (\n) in the message */
}

.cm-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 22px;
}

.cm-btn--danger {
  background: #ea580c !important;
  border-color: #ea580c !important;
}

/* Fade + scale animation */
.cm-enter-active,
.cm-leave-active {
  transition: opacity .2s ease;
}

.cm-enter-active .cm-card,
.cm-leave-active .cm-card {
  transition: transform .2s ease;
}

.cm-enter-from,
.cm-leave-to {
  opacity: 0;
}

.cm-enter-from .cm-card,
.cm-leave-to .cm-card {
  transform: scale(.95);
}
</style>