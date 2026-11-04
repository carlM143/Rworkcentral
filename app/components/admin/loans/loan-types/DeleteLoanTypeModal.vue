<script setup lang="ts">
import { AlertTriangle, Trash2, X } from 'lucide-vue-next'

import type { LoanType } from '~/types/loans/loan-types/loanType'

const props = withDefaults(defineProps<{
  open: boolean
  loanType?: LoanType | null
  busy?: boolean
  error?: string
}>(), {
  loanType: null,
  busy: false,
  error: '',
})

const emit = defineEmits<{
  close: []
  confirm: [item: LoanType]
}>()

const close = () => {
  if (!props.busy) emit('close')
}

const confirm = () => {
  if (!props.busy && props.loanType) emit('confirm', props.loanType)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open && loanType" class="modal-overlay" @click.self="close">
      <section class="delete-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-loan-type-title">
        <header>
          <span class="warning-icon"><AlertTriangle :size="22" /></span>
          <div>
            <h3 id="delete-loan-type-title">Delete Loan Type</h3>
            <p>This action cannot be undone.</p>
          </div>
          <button type="button" class="close-button" :disabled="busy" aria-label="Close" @click="close"><X :size="18" /></button>
        </header>

        <div class="modal-body">
          <p>Delete <strong>{{ loanType.loan_name }}</strong> ({{ loanType.loan_code }})?</p>
          <p class="notice">Deletion may be rejected when employee loans are already connected to this loan type.</p>
          <div v-if="error" class="form-error" role="alert">{{ error }}</div>
        </div>

        <footer>
          <AppButton variant="secondary" :disabled="busy" @click="close">Cancel</AppButton>
          <button type="button" class="delete-button" :disabled="busy" @click="confirm">
            <Trash2 :size="15" />
            {{ busy ? 'Deleting...' : 'Delete Loan Type' }}
          </button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay { position: fixed; inset: 0; z-index: 10000; display: grid; padding: 20px; place-items: center; background: rgb(0 0 0 / 58%); backdrop-filter: blur(5px); }
.delete-modal { width: min(500px, 100%); border: 1px solid var(--border); border-radius: 14px; background: var(--bg-card); box-shadow: 0 20px 60px rgb(0 0 0 / 30%); }
header { display: flex; align-items: flex-start; gap: 12px; padding: 20px; border-bottom: 1px solid var(--border); }
.warning-icon { display: grid; width: 42px; height: 42px; flex: 0 0 auto; place-items: center; border-radius: 10px; background: var(--red-soft); color: var(--red); }
header > div { min-width: 0; flex: 1; }
header h3 { margin: 0; color: var(--text-primary); font-size: 17px; }
header p { margin: 5px 0 0; color: var(--text-muted); font-size: 12px; }
.close-button { display: grid; width: 34px; height: 34px; place-items: center; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text-secondary); }
.modal-body { padding: 18px 20px; }
.modal-body > p { margin: 0; color: var(--text-primary); font-size: 13px; line-height: 1.6; }
.modal-body .notice { margin-top: 10px; color: var(--text-muted); font-size: 12px; }
.form-error { padding: 10px 12px; margin-top: 14px; border: 1px solid var(--red); border-radius: 8px; background: var(--red-soft); color: var(--red); font-size: 12px; }
footer { display: flex; justify-content: flex-end; gap: 9px; padding: 15px 20px; border-top: 1px solid var(--border); }
.delete-button { display: inline-flex; min-height: 40px; align-items: center; justify-content: center; gap: 7px; padding: 0 14px; border: 1px solid var(--red); border-radius: 8px; background: var(--red); color: white; font-size: 12px; font-weight: 600; }
button:disabled { opacity: .55; cursor: not-allowed; }
@media (max-width: 520px) { footer { align-items: stretch; flex-direction: column-reverse; } }
</style>
