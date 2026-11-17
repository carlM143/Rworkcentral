<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next'

interface AllowanceRow {
  allowance_name: string
  amount: string | number
}

const model = defineModel<AllowanceRow[]>({ default: () => [] })

const addRow = () => {
  model.value = [...model.value, { allowance_name: '', amount: '' }]
}

const removeRow = (index: number) => {
  model.value = model.value.filter((_, i) => i !== index)
}

const updateRow = (index: number, key: keyof AllowanceRow, value: string) => {
  model.value = model.value.map((row, i) => (i === index ? { ...row, [key]: value } : row))
}
</script>

<template>
  <div class="allowance-repeater">
    <div class="repeater-head">
      <label>Additional Allowances</label>
      <button type="button" class="add-btn" @click="addRow">
        <Plus :size="14" /> Add Allowance
      </button>
    </div>

    <p v-if="!model.length" class="empty">No additional allowances. Click “Add Allowance” to add one.</p>

    <div v-for="(row, index) in model" :key="index" class="row">
      <input
        type="text"
        placeholder="Allowance name (e.g. Rice, Transport)"
        :value="row.allowance_name"
        @input="updateRow(index, 'allowance_name', ($event.target as HTMLInputElement).value)"
      >
      <input
        type="number"
        min="0"
        step="0.01"
        placeholder="Amount"
        :value="row.amount"
        @input="updateRow(index, 'amount', ($event.target as HTMLInputElement).value)"
      >
      <button type="button" class="remove-btn" aria-label="Remove allowance" @click="removeRow(index)">
        <Trash2 :size="15" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.allowance-repeater { display: flex; flex-direction: column; gap: 8px; }
.repeater-head { display: flex; align-items: center; justify-content: space-between; }
.repeater-head label { color: var(--text-primary); font-size: 11px; font-weight: 600; }
.add-btn { display: inline-flex; align-items: center; gap: 5px; padding: 6px 10px; border: 1px dashed #2563eb; border-radius: 8px; background: transparent; color: #60a5fa; font-size: 11px; font-weight: 600; cursor: pointer; }
.add-btn:hover { background: rgba(37, 99, 235, .1); }
.empty { margin: 0; color: var(--text-muted); font-size: 11px; }
.row { display: grid; grid-template-columns: 1fr 150px 36px; gap: 8px; }
.row input { height: 38px; padding: 0 11px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); color: var(--text-primary); font-size: 12px; outline: 0; min-width: 0; }
.row input:focus { border-color: #8fb4ff; }
.remove-btn { display: grid; place-items: center; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: #fb7185; cursor: pointer; }
.remove-btn:hover { background: rgba(244, 63, 94, .1); }
@media (max-width: 520px) { .row { grid-template-columns: 1fr 110px 36px; } }
</style>