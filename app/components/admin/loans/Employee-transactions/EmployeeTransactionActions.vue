<script setup lang="ts">
import { Eye, X } from 'lucide-vue-next'
import { ref } from 'vue'

import type { EmployeeLoanTransaction } from '~/types/loans/employee-loan-transactions/employeeLoan'

const props = defineProps<{ transaction: EmployeeLoanTransaction }>()
const open = ref(false)

const money = (value: string | number | null) => value === null
  ? '—'
  : new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value) || 0)
</script>

<template>
  <button type="button" class="table-action-button" aria-label="View transaction details" @click="open = true">
    <Eye :size="16" />
  </button>

  <Teleport to="body">
    <div v-if="open" class="modal-overlay" @click.self="open = false">
      <section class="details-modal" role="dialog" aria-modal="true" aria-labelledby="transaction-title">
        <header>
          <div><h3 id="transaction-title">Loan Transaction Details</h3><p>{{ transaction.referenceNo }}</p></div>
          <button type="button" aria-label="Close" @click="open = false"><X :size="18" /></button>
        </header>
        <div class="details">
          <div><span>Employee</span><strong>{{ transaction.employeeName }}</strong></div>
          <div><span>Employee Loan</span><strong>{{ transaction.loanReferenceNo }}</strong></div>
          <div><span>Loan Type</span><strong>{{ transaction.loanTypeName }}</strong></div>
          <div><span>Transaction Type</span><strong>{{ transaction.transactionType }}</strong></div>
          <div><span>Amount</span><strong>{{ money(transaction.amount) }}</strong></div>
          <div><span>Balance Before</span><strong>{{ money(transaction.balanceBefore) }}</strong></div>
          <div><span>Balance After</span><strong>{{ money(transaction.balanceAfter) }}</strong></div>
          <div><span>Status</span><strong>{{ transaction.status }}</strong></div>
          <div><span>Created By</span><strong>{{ transaction.createdBy || '—' }}</strong></div>
          <div class="remarks"><span>Remarks</span><strong>{{ transaction.remarks || '—' }}</strong></div>
        </div>
        <footer><AppButton variant="secondary" @click="open = false">Close</AppButton></footer>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay { position: fixed; inset: 0; z-index: 10000; display: grid; padding: 20px; place-items: center; background: rgb(0 0 0 / 58%); backdrop-filter: blur(5px); }
.details-modal { width: min(620px, 100%); max-height: 90vh; overflow: auto; border: 1px solid var(--border); border-radius: 14px; background: var(--bg-card); box-shadow: 0 20px 60px rgb(0 0 0 / 30%); }
header, footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 17px 20px; border-bottom: 1px solid var(--border); }
header h3 { margin: 0; color: var(--text-primary); font-size: 17px; }
header p { margin: 4px 0 0; color: var(--text-muted); font-size: 12px; }
header > button { display: grid; width: 34px; height: 34px; place-items: center; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text-primary); }
.details { padding: 7px 20px; }
.details > div { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 12px 0; border-bottom: 1px solid var(--border-soft); }
.details span { color: var(--text-muted); font-size: 12px; }
.details strong { color: var(--text-primary); font-size: 13px; font-weight: 500; text-align: right; }
.details .remarks { align-items: flex-start; }
footer { justify-content: flex-end; border-top: 1px solid var(--border); border-bottom: 0; }
</style>
