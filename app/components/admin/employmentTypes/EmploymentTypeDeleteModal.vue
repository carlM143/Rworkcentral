<script setup lang="ts">
import { AlertTriangle, Trash2, X } from 'lucide-vue-next'
import type { EmploymentTypeRecord } from '~/composables/admin/employmentTypes/useEmploymentTypeApi'

const props = defineProps<{
  open: boolean
  employmentType?: EmploymentTypeRecord | null
  deleting?: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: [item: EmploymentTypeRecord]
}>()

const handleConfirm = () => {
  if (props.employmentType && !props.deleting) {
    emit('confirm', props.employmentType)
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal-backdrop" @click.self="emit('close')">
        <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
          <div class="modal-header">
            <div class="header-left">
              <div class="header-icon danger">
                <Trash2 :size="20" />
              </div>
              <div>
                <h2 id="delete-modal-title">Delete Employment Type</h2>
                <p>This action cannot be undone.</p>
              </div>
            </div>
            <button
              type="button"
              class="close-button"
              :disabled="deleting"
              aria-label="Close modal"
              @click="emit('close')"
            >
              <X :size="18" />
            </button>
          </div>

          <div class="modal-body">
            <p class="confirmation-text">
              Are you sure you want to delete
              <strong>"{{ employmentType?.name }}"</strong>?
            </p>

            <div v-if="(employmentType?.employments_count ?? 0) > 0" class="warning-callout">
              <AlertTriangle :size="16" class="warning-icon" />
              <div>
                <strong>Assigned Employees Warning</strong>
                <p>
                  There are currently <strong>{{ employmentType?.employments_count }}</strong> employee(s) assigned
                  to this employment type. Deleting it may affect their active records.
                </p>
              </div>
            </div>

            <p class="sub-text">
              The classification will be permanently removed from the system.
            </p>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="cancel-btn"
              :disabled="deleting"
              @click="emit('close')"
            >
              Cancel
            </button>
            <button
              type="button"
              class="delete-btn"
              :disabled="deleting"
              @click="handleConfirm"
            >
              <Trash2 :size="14" />
              <span>{{ deleting ? 'Deleting...' : 'Delete Employment Type' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(3, 8, 18, 0.76);
  backdrop-filter: blur(4px);
}

.modal-card {
  display: flex;
  width: 100%;
  max-width: 480px;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 13px;
  background: var(--bg-card);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid var(--border-soft);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon.danger {
  display: flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

.modal-header h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.modal-header p {
  margin: 3px 0 0;
  font-size: 10px;
  color: var(--text-muted);
}

.close-button {
  display: flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.close-button:hover:not(:disabled) {
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

.close-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-body {
  padding: 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.confirmation-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-primary);
}

.confirmation-text strong {
  color: #ef4444;
}

.warning-callout {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 9px;
  background: rgba(245, 158, 11, 0.08);
  color: var(--text-primary);
  font-size: 11px;
  line-height: 1.45;
}

.warning-icon {
  color: #f59e0b;
  flex-shrink: 0;
  margin-top: 2px;
}

.warning-callout strong {
  display: block;
  font-size: 11px;
  color: #f59e0b;
  margin-bottom: 2px;
}

.warning-callout p {
  margin: 0;
  color: var(--text-secondary);
}

.sub-text {
  margin: 0;
  font-size: 11px;
  color: var(--text-muted);
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 9px;
  padding: 14px 18px;
  border-top: 1px solid var(--border-soft);
  background: var(--bg-card-soft);
}

.cancel-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cancel-btn:hover:not(:disabled) {
  background: var(--bg-card-soft);
  border-color: var(--text-muted);
}

.cancel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.delete-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 15px;
  border: 1px solid #ef4444;
  border-radius: 7px;
  background: #ef4444;
  color: #fff;
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.delete-btn:hover:not(:disabled) {
  background: #dc2626;
  border-color: #dc2626;
}

.delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>

