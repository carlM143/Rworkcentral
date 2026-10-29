<script setup lang="ts">
import { Pencil, Trash2, Building2, CheckCircle, XCircle } from 'lucide-vue-next'
import type { EmploymentTypeRecord } from '~/composables/admin/employmentTypes/useEmploymentTypeApi'

defineProps<{
  employmentTypes: EmploymentTypeRecord[]
}>()

const emit = defineEmits<{
  edit: [item: EmploymentTypeRecord]
  delete: [item: EmploymentTypeRecord]
}>()

const isStatusActive = (status: string | boolean | number) =>
  status === 'active' || status === 'Active' || status === '1' || status === true || status === 1
</script>

<template>
  <div class="table-container card">
    <div class="table-scroll" tabindex="0">
      <table class="data-table">
        <thead>
          <tr>
            <th scope="col">Employment Type</th>
            <th scope="col">Description</th>
            <th scope="col">Assigned Employees</th>
            <th scope="col">Status</th>
            <th scope="col" class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!employmentTypes.length">
            <td colspan="5" class="empty-state">No employment types found. Click "Add Employment Type" to create one.</td>
          </tr>
          <tr v-for="item in employmentTypes" :key="item.id">
            <td>
              <div class="cell-primary">
                <Building2 :size="15" class="cell-icon" />
                <strong>{{ item.name }}</strong>
              </div>
            </td>
            <td>
              <span class="cell-secondary">{{ item.description || 'No description provided.' }}</span>
            </td>
            <td>
              <span class="badge count-badge">{{ item.employments_count ?? 0 }} employee(s)</span>
            </td>
            <td>
              <span class="badge" :class="isStatusActive(item.status) ? 'active' : 'inactive'">
                <CheckCircle v-if="isStatusActive(item.status)" :size="12" />
                <XCircle v-else :size="12" />
                {{ isStatusActive(item.status) ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="text-right">
              <div class="row-actions">
                <button type="button" class="action-btn" title="Edit employment type" @click="emit('edit', item)">
                  <Pencil :size="14" />
                </button>
                <button type="button" class="action-btn delete" title="Delete employment type" @click="emit('delete', item)">
                  <Trash2 :size="14" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.card { border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); box-shadow: var(--shadow); overflow: hidden; }
.table-scroll { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 11px; }
th, td { padding: 13px 16px; border-top: 1px solid var(--border-soft); color: var(--text-secondary); }
thead th { background: var(--bg-card-soft); color: var(--text-primary); font-weight: 600; white-space: nowrap; }
tbody tr:first-child td { border-top: 0; }
.empty-state { text-align: center; padding: 36px; color: var(--text-muted); }
.cell-primary { display: flex; align-items: center; gap: 8px; color: var(--text-primary); }
.cell-icon { color: var(--primary); flex-shrink: 0; }
.cell-secondary { color: var(--text-muted); }
.badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 500; white-space: nowrap; }
.badge.active { background: var(--green-soft); color: var(--green); }
.badge.inactive { background: var(--bg-card-soft); color: var(--text-muted); }
.count-badge { background: var(--primary-soft); color: var(--primary); }
.text-right { text-align: right; }
.row-actions { display: inline-flex; align-items: center; gap: 6px; }
.action-btn { display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-card); color: var(--text-secondary); cursor: pointer; transition: all 0.15s ease; }
.action-btn:hover { background: var(--primary-soft); color: var(--primary); border-color: var(--primary); }
.action-btn.delete:hover { background: var(--red-soft, rgba(239, 68, 68, 0.1)); color: var(--red, #ef4444); border-color: var(--red, #ef4444); }
</style>
