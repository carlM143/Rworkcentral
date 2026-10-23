
<script setup lang="ts">
import { CalendarRange, Eye, Pencil, Trash2 } from 'lucide-vue-next'
import type { PayrollPeriod } from '~/types/payrollPeriod'

defineProps<{ periods: PayrollPeriod[] }>()

const emit = defineEmits<{
  view: [period: PayrollPeriod]
  edit: [period: PayrollPeriod]
  delete: [period: PayrollPeriod]
}>()

const formatDate = (value: string) => {
  if (!value) return '—'
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }).format(date)
}
</script>

<template>
  <article class="table-card">
    <div class="table-heading">
      <div>
        <h3>Payroll Periods</h3>
        <p>Manage company payroll cutoff dates, payment schedules and period status.</p>
      </div>
    </div>

    <div v-if="periods.length" class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Period ID</th>
            <th>Payroll Period</th>
            <th>Cutoff Start</th>
            <th>Cutoff End</th>
            <th>Payment Date</th>
            <th>Status</th>
            <th class="actions-header">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="period in periods" :key="period.id">
            <td><strong class="period-code">#{{ period.id }}</strong></td>

            <td>
              <div class="period-cell">
                <div class="period-icon"><CalendarRange :size="15" /></div>
                <div>
                  <strong>{{ period.periodName }}</strong>
                  <span>{{ formatDate(period.cutoffStart) }} – {{ formatDate(period.cutoffEnd) }}</span>
                </div>
              </div>
            </td>

            <td>{{ formatDate(period.cutoffStart) }}</td>
            <td>{{ formatDate(period.cutoffEnd) }}</td>
            <td>{{ formatDate(period.paymentDate) }}</td>

            <td>
              <StatusBadge :status="period.status" />
            </td>

            <td>
              <div class="row-actions">
                <button type="button" class="action-button" title="View Payroll Period" @click="emit('view', period)">
                  <Eye :size="15" />
                </button>

                <button
                  type="button"
                  class="action-button"
                  title="Edit Payroll Period"
                  :disabled="period.status.toLowerCase() !== 'draft'"
                  @click="emit('edit', period)"
                >
                  <Pencil :size="15" />
                </button>

                <button
                  type="button"
                  class="action-button danger"
                  title="Delete Draft Period"
                  :disabled="period.status.toLowerCase() !== 'draft'"
                  @click="emit('delete', period)"
                >
                  <Trash2 :size="15" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-state">
      <CalendarRange :size="30" />
      <strong>No payroll periods found</strong>
      <span>Create your first payroll period or adjust the filters.</span>
    </div>
  </article>
</template>

<style scoped>
.table-card{overflow:hidden;border:1px solid var(--border);border-radius:11px;background:var(--bg-card);box-shadow:var(--shadow)}
.table-heading{padding:15px 16px;border-bottom:1px solid var(--border-soft)}
.table-heading h3{margin:0;color:var(--text-primary);font-size:14px}
.table-heading p{margin:5px 0 0;color:var(--text-muted);font-size:9px}
.table-scroll{overflow-x:auto}
table{width:100%;min-width:950px;border-collapse:collapse}
th{padding:12px 13px;background:var(--bg-card-soft);color:var(--text-secondary);font-size:9px;font-weight:700;text-align:left;text-transform:uppercase;white-space:nowrap}
td{padding:13px;border-top:1px solid var(--border-soft);color:var(--text-secondary);font-size:10px;vertical-align:middle}
tbody tr:hover{background:var(--bg-card-soft)}
.period-code{color:var(--primary);font-size:10px}
.period-cell{display:flex;min-width:220px;align-items:center;gap:9px}
.period-icon{display:flex;width:34px;height:34px;flex-shrink:0;align-items:center;justify-content:center;border-radius:8px;background:var(--primary-soft);color:var(--primary)}
.period-cell strong,.period-cell span{display:block}
.period-cell strong{color:var(--text-primary);font-size:10px;font-weight:650}
.period-cell span{margin-top:3px;color:var(--text-muted);font-size:8px}
.actions-header{text-align:right}
.row-actions{display:flex;align-items:center;justify-content:flex-end;gap:5px}
.action-button{display:flex;width:29px;height:29px;align-items:center;justify-content:center;border:1px solid var(--border);border-radius:6px;background:var(--bg-card);color:var(--text-secondary);cursor:pointer}
.action-button:hover{background:var(--primary-soft);color:var(--primary)}
.action-button.danger:hover{background:var(--red-soft);color:var(--red)}
.action-button:disabled{opacity:.3;cursor:not-allowed}
.empty-state{display:flex;min-height:240px;flex-direction:column;align-items:center;justify-content:center;gap:7px;color:var(--text-muted)}
.empty-state strong{color:var(--text-primary);font-size:11px}
.empty-state span{font-size:9px}
</style>
