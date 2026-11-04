<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

interface EmployeeTableColumn {
  key: string
  label: string
  width?: string
  align?: 'left' | 'center' | 'right'
  hideOnMobile?: boolean
  mobileOnly?: boolean
}

const props = withDefaults(defineProps<{
  columns: EmployeeTableColumn[]
  rows: Record<string, unknown>[]
  rowKey?: string
  pageSize?: number
  loading?: boolean
  emptyMessage?: string
  mobileHint?: string
}>(), {
  rowKey: 'id',
  pageSize: 8,
  loading: false,
  emptyMessage: 'No records found.',
  mobileHint: 'Tap a request row to view its complete details.',
})

const emit = defineEmits<{
  rowClick: [row: Record<string, unknown>]
}>()

const page = ref(1)
const size = computed(() => Math.max(1, props.pageSize))
const totalPages = computed(() => Math.max(1, Math.ceil(props.rows.length / size.value)))
const start = computed(() => (page.value - 1) * size.value)
const visibleRows = computed(() => props.rows.slice(start.value, start.value + size.value))
const firstResult = computed(() => props.rows.length ? start.value + 1 : 0)
const lastResult = computed(() => Math.min(start.value + size.value, props.rows.length))

watch(() => [props.rows, props.pageSize], () => { page.value = 1 })

const rowId = (row: Record<string, unknown>, index: number) =>
  String(row[props.rowKey] ?? `row-${start.value + index}`)
</script>

<template>
  <div class="employee-data-table">
    <p v-if="mobileHint" class="mobile-table-hint">{{ mobileHint }}</p>

    <div class="table-scroll" role="region" aria-label="Employee request records" tabindex="0">
      <table class="mobile-compact-table request-table">
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
              :class="{
                'mobile-hide': column.hideOnMobile,
                'mobile-only': column.mobileOnly,
              }"
              :style="{ width: column.width, textAlign: column.align || 'left' }"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td :colspan="columns.length" class="empty-state">Loading records…</td>
          </tr>
          <tr
            v-for="(row, index) in (loading ? [] : visibleRows)"
            :key="rowId(row, index)"
            class="record-row"
            @click="emit('rowClick', row)"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              :class="{
                'mobile-hide': column.hideOnMobile,
                'mobile-only': column.mobileOnly,
              }"
              :style="{ textAlign: column.align || 'left' }"
            >
              <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
                {{ row[column.key] ?? '—' }}
              </slot>
            </td>
          </tr>
          <tr v-if="!loading && !rows.length">
            <td :colspan="columns.length" class="empty-state">{{ emptyMessage }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="table-footer">
      <span>Showing {{ firstResult }}–{{ lastResult }} of {{ rows.length }} records</span>
      <div class="pagination" aria-label="Pagination">
        <button type="button" aria-label="Previous page" :disabled="page <= 1" @click="page--">
          <ChevronLeft :size="16" />
        </button>
        <span>Page {{ page }} of {{ totalPages }}</span>
        <button type="button" aria-label="Next page" :disabled="page >= totalPages" @click="page++">
          <ChevronRight :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.employee-data-table { width: 100%; min-width: 0; }
.table-scroll { width: 100%; overflow-x: auto; }
.table-scroll:focus-visible { outline: 2px solid var(--primary, #2563eb); outline-offset: -2px; }
table { width: 100%; min-width: 590px; border-collapse: collapse; text-align: left; font-size: 11px; }
th { padding: 12px 18px; background: var(--bg-card-soft, #f8fafc); color: var(--text-secondary, #64748b); font-size: 10px; font-weight: 500; white-space: nowrap; }
td { padding: 15px 18px; border-top: 1px solid var(--border-soft, #e2e8f0); color: var(--text-secondary, #64748b); vertical-align: middle; }
td strong { color: var(--text-primary); font-weight: 600; }
td small { display: block; max-width: 320px; margin-top: 5px; color: var(--text-muted); font-size: 10px; overflow-wrap: anywhere; }
.empty-state { padding: 35px 18px; text-align: center; }
.table-footer { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 15px 18px; border-top: 1px solid var(--border-soft, #e2e8f0); color: var(--text-secondary, #64748b); font-size: 11px; }
.pagination { display: flex; align-items: center; gap: 9px; white-space: nowrap; }
.pagination button { display: grid; place-items: center; width: 32px; height: 32px; border: 1px solid var(--border, #e2e8f0); border-radius: 7px; background: var(--bg-card, #fff); color: var(--text-primary, #0f172a); cursor: pointer; }
.pagination button:disabled { opacity: .4; cursor: default; }
.pagination button:not(:disabled):hover { background: var(--primary-soft, #eff6ff); color: var(--primary, #2563eb); }
@media (max-width: 850px) {
  table.mobile-compact-table { min-width: 0; table-layout: fixed; }
  .table-footer { padding: 12px; }
}

@media (max-width: 640px) {
  .table-footer { align-items: flex-start; flex-direction: column; }
}
</style>
