
<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  X,
} from 'lucide-vue-next'

import type { LoanType } from '~/types/loans/loan-types/loanType'

const props = withDefaults(
  defineProps<{
    loanType: LoanType
    busy?: boolean
  }>(),
  {
    busy: false,
  },
)

const emit = defineEmits<{
  edit: [item: LoanType]
  delete: [item: LoanType]
}>()

const isOpen = ref(false)
const showDetails = ref(false)

const buttonRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)

const menuPosition = ref({
  top: 0,
  left: 0,
})

const closeMenu = () => {
  isOpen.value = false
}

const updatePosition = () => {
  if (!buttonRef.value) return

  const rect = buttonRef.value.getBoundingClientRect()

  const menuWidth = 205
  const menuHeight = 145
  const gap = 6

  menuPosition.value = {
    left: Math.max(
      8,
      Math.min(
        rect.right - menuWidth,
        window.innerWidth - menuWidth - 8,
      ),
    ),

    top:
      rect.bottom + menuHeight + gap > window.innerHeight
        ? Math.max(8, rect.top - menuHeight - gap)
        : rect.bottom + gap,
  }
}

const toggleMenu = async () => {
  if (props.busy) return

  if (isOpen.value) {
    closeMenu()
    return
  }

  isOpen.value = true

  await nextTick()
  updatePosition()
}

const handleView = () => {
  closeMenu()
  showDetails.value = true
}

const handleEdit = () => {
  closeMenu()
  emit('edit', props.loanType)
}

const handleDelete = () => {
  closeMenu()
  emit('delete', props.loanType)
}

const handleOutsideClick = (event: MouseEvent) => {
  const target = event.target

  if (!(target instanceof Node)) return

  if (buttonRef.value?.contains(target)) return
  if (menuRef.value?.contains(target)) return

  closeMenu()
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return

  closeMenu()
  showDetails.value = false
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
  document.addEventListener('keydown', handleEscape)
  window.addEventListener('scroll', closeMenu, true)
  window.addEventListener('resize', closeMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
  document.removeEventListener('keydown', handleEscape)
  window.removeEventListener('scroll', closeMenu, true)
  window.removeEventListener('resize', closeMenu)
})
</script>

<template>
  <div class="loan-actions">

    <!-- THREE DOTS BUTTON -->
    <button
      ref="buttonRef"
      type="button"
      class="loan-more-button"
      :aria-label="`Actions for ${loanType.loan_name}`"
      :aria-expanded="isOpen"
      aria-haspopup="menu"
      :disabled="busy"
      @click.stop="toggleMenu"
    >
      <MoreHorizontal :size="18" />
    </button>

    <!-- ACTION DROPDOWN -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="menuRef"
        class="loan-action-dropdown"
        role="menu"
        :style="{
          top: `${menuPosition.top}px`,
          left: `${menuPosition.left}px`,
        }"
      >
        <button
          type="button"
          role="menuitem"
          @click.stop="handleView"
        >
          <Eye :size="15" />
          <span>View Details</span>
        </button>

        <button
          type="button"
          role="menuitem"
          :disabled="busy"
          @click.stop="handleEdit"
        >
          <Pencil :size="15" />
          <span>Edit Loan Type</span>
        </button>

        <div class="dropdown-divider" />

        <button
          type="button"
          role="menuitem"
          class="danger"
          :disabled="busy"
          @click.stop="handleDelete"
        >
          <Trash2 :size="15" />
          <span>Delete Loan Type</span>
        </button>
      </div>
    </Teleport>

    <!-- VIEW DETAILS MODAL -->
    <Teleport to="body">
      <div
        v-if="showDetails"
        class="loan-modal-overlay"
        @click.self="showDetails = false"
      >
        <div
          class="loan-modal"
          role="dialog"
          aria-modal="true"
          :aria-label="`${loanType.loan_name} details`"
        >
          <div class="modal-header">
            <div>
              <h3>Loan Type Details</h3>
              <p>View loan category information.</p>
            </div>

            <button
              type="button"
              class="close-button"
              aria-label="Close details"
              @click="showDetails = false"
            >
              <X :size="18" />
            </button>
          </div>

          <div class="modal-body">
            <div class="detail-row">
              <span>Loan Code</span>
              <strong>{{ loanType.loan_code }}</strong>
            </div>

            <div class="detail-row">
              <span>Loan Name</span>
              <strong>{{ loanType.loan_name }}</strong>
            </div>

            <div class="detail-row">
              <span>Provider</span>
              <strong>{{ loanType.provider || 'Not provided' }}</strong>
            </div>

            <div class="detail-row">
              <span>Status</span>

              <span
                class="detail-status"
                :class="loanType.status ? 'active' : 'inactive'"
              >
                {{ loanType.status ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="close-modal-button"
              @click="showDetails = false"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.loan-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.loan-more-button {
  display: inline-flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border, #29364d);
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary, #a2b0c6);
  cursor: pointer;
  transition: .15s ease;
}

.loan-more-button:hover,
.loan-more-button[aria-expanded="true"] {
  border-color: var(--primary, #327bff);
  background: var(--primary-soft, #15345f);
  color: var(--primary, #327bff);
}

.loan-more-button:disabled {
  opacity: .45;
  cursor: not-allowed;
}

/* DROPDOWN */
.loan-action-dropdown {
  position: fixed;
  z-index: 9999;
  width: 205px;
  padding: 6px;
  border: 1px solid var(--border, #29364d);
  border-radius: 10px;
  background: var(--bg-card, #131e30);
  box-shadow: 0 15px 35px rgba(0, 0, 0, .28);
}

.loan-action-dropdown button {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  padding: 11px 12px;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: var(--text-primary, #fff);
  font-family: inherit;
  font-size: 12px;
  font-weight: 400;
  text-align: left;
  cursor: pointer;
}

.loan-action-dropdown button:hover {
  background: var(--bg-card-soft, #182438);
}

.loan-action-dropdown button.danger {
  color: var(--red, #ef4444);
}

.loan-action-dropdown button.danger:hover {
  background: var(--red-soft, rgba(239,68,68,.1));
}

.loan-action-dropdown button:disabled {
  opacity: .45;
  cursor: not-allowed;
}

.dropdown-divider {
  height: 1px;
  margin: 5px 0;
  background: var(--border, #29364d);
}

/* MODAL */
.loan-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, .55);
  backdrop-filter: blur(5px);
}

.loan-modal {
  width: 100%;
  max-width: 500px;
  border: 1px solid var(--border, #29364d);
  border-radius: 14px;
  background: var(--bg-card, #131e30);
  box-shadow: 0 20px 60px rgba(0, 0, 0, .3);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid var(--border, #29364d);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary, #fff);
  font-size: 17px;
  font-weight: 700;
}

.modal-header p {
  margin: 5px 0 0;
  color: var(--text-muted, #94a3b8);
  font-size: 12px;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--border, #29364d);
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary, #a2b0c6);
  cursor: pointer;
}

.modal-body {
  padding: 8px 20px;
}

.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 15px 0;
  border-bottom: 1px solid var(--border-soft, #253247);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row > span:first-child {
  color: var(--text-muted, #94a3b8);
  font-size: 13px;
}

.detail-row strong {
  color: var(--text-primary, #fff);
  font-size: 13px;
  font-weight: 600;
  text-align: right;
}

.detail-status {
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
}

.detail-status.active {
  background: var(--green-soft, #103b2e);
  color: var(--green, #10b981);
}

.detail-status.inactive {
  background: var(--red-soft, #481e29);
  color: var(--red, #ef4444);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 20px;
  border-top: 1px solid var(--border, #29364d);
}

.close-modal-button {
  padding: 10px 18px;
  border: 1px solid var(--border, #29364d);
  border-radius: 8px;
  background: transparent;
  color: var(--text-primary, #fff);
  font-size: 12px;
  cursor: pointer;
}

.close-modal-button:hover {
  background: var(--bg-card-soft, #182438);
}
</style>
