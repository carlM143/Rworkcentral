<script setup lang="ts">
import type { ReportFormat } from '~/utils/reportExport'
import { exportReport, reportColumns, reportLabel, reportValue, validReportDates } from '~/utils/reportExport'
const props = withDefaults(defineProps<{ open: boolean; title: string; records: object[]; filters?: Record<string, string>; dateFrom?: string; dateTo?: string; sample?: boolean }>(), { sample: true })
const emit = defineEmits<{ close: [] }>()
const format = ref<ReportFormat>('Excel')
const busy = ref(false)
const error = ref('')
watch(() => props.open, () => { format.value = 'Excel'; error.value = '' })
const columns = computed(() => reportColumns(props.records as Record<string, unknown>[]).slice(0, 5))
const download = async () => {
  if (busy.value) return
  error.value = ''
  if (!validReportDates(props.dateFrom ?? '', props.dateTo ?? '')) { error.value = 'Use a valid date range with the start date on or before the end date.'; return }
  busy.value = true
  try {
    await exportReport({ title: props.title, period: props.dateFrom || props.dateTo ? (props.dateFrom || 'Beginning') + ' to ' + (props.dateTo || 'Latest') : 'Current filtered selection',
      rows: props.records as Record<string, unknown>[], filters: Object.fromEntries(Object.entries(props.filters ?? {}).filter(([, value]) => value)), generatedAt: new Date().toISOString(), sample: props.sample }, format.value)
  } catch (problem) { error.value = problem instanceof Error ? problem.message : 'Unable to export these records.' }
  finally { busy.value = false }
}
</script>

<template>
  <PayrollDialog :open="open" :title="'Export ' + title" description="Downloads include all matching records across pages, using the current filters." @close="emit('close')">
    <p>{{ records.length }} records selected <span v-if="sample">· Sample data</span></p>
    <p v-if="filters && Object.values(filters).some(Boolean)">{{ Object.entries(filters).filter(([, value]) => value).map(([key, value]) => `${key}: ${value}`).join(' · ') }}</p>
    <label>File Format<select v-model="format" aria-label="File Format"><option>Excel</option><option>PDF</option><option>CSV</option></select></label>
    <p v-if="error" role="alert" class="error">{{ error }}</p>
    <p v-if="!records.length">No records match the current filters. Close this dialog and adjust the filters.</p>
    <div v-else class="table-wrap"><table><thead><tr><th v-for="key in columns" :key="key">{{ reportLabel(key) }}</th></tr></thead><tbody><tr v-for="(row, index) in records.slice(0, 3)" :key="index"><td v-for="key in columns" :key="key">{{ reportValue((row as Record<string, unknown>)[key]) }}</td></tr></tbody></table></div>
    <p v-if="records.length > 3">Preview shows the first 3 records. The download includes all {{ records.length }} records and all columns.</p>
    <footer><AppButton variant="secondary" @click="emit('close')">Close</AppButton><AppButton :disabled="busy || !records.length" @click="download">{{ busy ? 'Exporting…' : 'Download ' + format }}</AppButton></footer>
  </PayrollDialog>
</template>

<style scoped>
p, label { font-size:12px;line-height:1.6; } label { display:flex;flex-direction:column;gap:7px;margin:15px 0; } select { padding:10px;border:1px solid var(--border);border-radius:7px;background:var(--bg-card-soft);color:var(--text-primary); }
.error { color:var(--red); } .table-wrap { overflow:auto; } table { width:100%;border-collapse:collapse;font-size:12px; } td,th { padding:10px;text-align:left;border-bottom:1px solid var(--border);white-space:nowrap; } footer { display:flex;gap:10px;justify-content:flex-end;margin-top:22px; }
</style>
