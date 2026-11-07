<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { X } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  title: string
  eyebrow?: string
  subtitle?: string
  busy?: boolean
}>(), {
  eyebrow: '',
  subtitle: '',
  busy: false,
})

const emit = defineEmits<{ close: [] }>()

const requestClose = () => {
  if (!props.busy) emit('close')
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') requestClose()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <div class="wfh-overlay" @click.self="requestClose">
      <article class="wfh-modal" role="dialog" aria-modal="true" :aria-label="title">
        <header class="wfh-modal-head">
          <div>
            <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
            <h2>{{ title }}</h2>
            <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
          </div>
          <button type="button" class="close" aria-label="Close" :disabled="busy" @click="requestClose">
            <X :size="19" />
          </button>
        </header>

        <div class="wfh-modal-body">
          <slot />
        </div>
      </article>
    </div>
  </Teleport>
</template>

<style scoped>
.wfh-overlay {
  position: fixed;
  inset: 0;
  z-index: 15000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  background: rgb(3 10 24 / 85%);
}

.wfh-modal {
  display: flex;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border, #29364d);
  border-radius: 13px;
  background: var(--bg-card, #131e30);
  color: var(--text-primary, #f8fafc);
}

.wfh-modal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 20px;
  border-bottom: 1px solid var(--border, #29364d);
}

.eyebrow {
  margin: 0;
  color: var(--primary, #327bff);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
}

.wfh-modal-head h2 {
  margin: 5px 0;
  font-size: 18px;
}

.subtitle {
  margin: 0;
  color: var(--text-muted, #7c8da8);
  font-size: 12px;
}

.close {
  border: 0;
  background: transparent;
  color: var(--text-secondary, #a2b0c6);
  cursor: pointer;
}

.wfh-modal-body {
  overflow: auto;
  padding: 20px;
}

/* ===== Shared content styles for every WFH modal (slot content) ===== */

.wfh-modal-body :deep(.btn) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid var(--border, #29364d);
  border-radius: 8px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 650;
  white-space: nowrap;
  text-decoration: none;
  cursor: pointer;
}

.wfh-modal-body :deep(.btn.ghost) { background: var(--bg-card, #131e30); color: var(--text-primary, #f8fafc); }
.wfh-modal-body :deep(.btn.primary) { background: var(--primary, #327bff); border-color: var(--primary, #327bff); color: #fff; }
.wfh-modal-body :deep(.btn.approve) { background: #124d34; border-color: #1c6b49; color: #76ffb9; }
.wfh-modal-body :deep(.btn.reject) { background: #52212b; border-color: #7a2f3c; color: #ffabb1; }
.wfh-modal-body :deep(.btn:disabled) { opacity: 0.45; cursor: not-allowed; }
.wfh-modal-body :deep(.btn:focus-visible) { outline: 2px solid var(--primary, #327bff); outline-offset: 2px; }

.wfh-modal-body :deep(.info-grid) {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.wfh-modal-body :deep(.info-grid > div) {
  padding: 12px;
  border: 1px solid var(--border, #29364d);
  border-radius: 8px;
  background: var(--bg-card-soft, #182438);
}

.wfh-modal-body :deep(.info-grid small) { display: block; color: var(--text-muted, #7c8da8); font-size: 11px; }
.wfh-modal-body :deep(.info-grid strong) { display: block; margin-top: 5px; font-size: 13px; }

.wfh-modal-body :deep(h3) { margin: 20px 0 7px; font-size: 13px; }
.wfh-modal-body :deep(.detail-text) { margin: 0; color: var(--text-secondary, #a2b0c6); font-size: 13px; line-height: 1.6; }

.wfh-modal-body :deep(label) { display: block; margin: 15px 0 8px; font-size: 12px; font-weight: 700; }

.wfh-modal-body :deep(select),
.wfh-modal-body :deep(textarea),
.wfh-modal-body :deep(input[type='date']),
.wfh-modal-body :deep(input[type='text']),
.wfh-modal-body :deep(input[type='file']) {
  width: 100%;
  padding: 9px 10px;
  border: 1px solid var(--border, #29364d);
  border-radius: 8px;
  background: var(--bg-card-soft, #182438);
  color: var(--text-primary, #f8fafc);
  font-family: inherit;
  font-size: 13px;
}

.wfh-modal-body :deep(textarea) { resize: vertical; line-height: 1.5; }

.wfh-modal-body :deep(select:focus-visible),
.wfh-modal-body :deep(textarea:focus-visible),
.wfh-modal-body :deep(input:focus-visible) {
  border-color: var(--primary, #327bff);
  outline: none;
}

.wfh-modal-body :deep(.review-note) {
  margin-bottom: 14px;
  padding: 12px;
  border-radius: 8px;
  background: var(--primary-soft, rgb(50 123 255 / 12%));
  color: var(--text-secondary, #a2b0c6);
  font-size: 12px;
  line-height: 1.6;
}

.wfh-modal-body :deep(.modal-actions) {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}

.wfh-modal-body :deep(.hint) { margin: 10px 0 0; color: var(--text-muted, #7c8da8); font-size: 11px; }
.wfh-modal-body :deep(.muted) { color: var(--text-secondary, #a2b0c6); font-size: 12px; }
.wfh-modal-body :deep(.error) { margin: 10px 0 0; color: var(--red, #ef4444); font-size: 12px; }

.wfh-modal-body :deep(.timeline) {
  margin-left: 5px;
  padding: 3px 15px 15px;
  border-left: 2px solid var(--primary, #327bff);
}

.wfh-modal-body :deep(.timeline strong) { font-size: 13px; }
.wfh-modal-body :deep(.timeline p),
.wfh-modal-body :deep(.timeline small) {
  display: block;
  margin: 5px 0 0;
  color: var(--text-secondary, #a2b0c6);
  font-size: 11px;
}

@media (max-width: 550px) {
  .wfh-modal-head,
  .wfh-modal-body { padding: 14px; }

  .wfh-modal-body :deep(.info-grid) { grid-template-columns: 1fr; }
}
</style>