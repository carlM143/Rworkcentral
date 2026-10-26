<script setup lang="ts">
import { reportColumns, reportLabel, reportTimestamp, reportValue } from '~/utils/reportExport'
import type { ReportDocument, ReportFormat, ReportRow } from '~/utils/reportExport'

const props = defineProps<{
  report?: ReportDocument | null
  record?: ReportRow | null
  title?: string
  busy?: boolean
}>()
const emit = defineEmits<{
  close: []
  download: [format: ReportFormat, report: ReportDocument]
  print: [report: ReportDocument]
}>()
const dialog = ref<HTMLDialogElement | null>(null)
const columns = computed(() => reportColumns(props.report?.rows ?? (props.record ? [props.record] : [])))
let returnFocus: HTMLElement | null = null
watch(() => Boolean(props.report || props.record), async open => {
  await nextTick()
  if (open && !dialog.value?.open) {
    returnFocus = document.activeElement as HTMLElement | null
    dialog.value?.showModal()
  } else if (!open) {
    dialog.value?.close()
    returnFocus?.focus()
  }
}, { immediate: true })
onBeforeUnmount(() => { dialog.value?.close(); returnFocus?.focus() })
</script>

<template>
  <dialog ref="dialog" class="report-dialog" aria-labelledby="report-dialog-title" @cancel.prevent="emit('close')" @click="event => { if (event.target === dialog) emit('close') }">
    <header>
      <div>
        <h2 id="report-dialog-title">{{ report?.title ?? `${title ?? 'Report'} Details` }}</h2>
        <p v-if="report">{{ report.period }} · {{ report.rows.length }} records · {{ reportTimestamp(report.generatedAt) }}</p>
        <p>Sample data preview</p>
        <p v-if="report?.filters">{{ Object.entries(report.filters).map(([key, value]) => `${key}: ${value}`).join(' · ') }}</p>
      </div>
      <button type="button" class="close-button" aria-label="Close report dialog" @click="emit('close')">×</button>
    </header>
    <div class="dialog-content">
      <dl v-if="record" class="detail-grid">
        <div v-for="key in columns" :key="key"><dt>{{ reportLabel(key) }}</dt><dd>{{ reportValue(record[key]) }}</dd></div>
      </dl>
      <template v-if="report">
        <div class="preview-table" tabindex="0" aria-label="Report records">
          <table><thead><tr><th v-for="key in columns" :key="key">{{ reportLabel(key) }}</th></tr></thead>
            <tbody><tr v-for="(row, index) in report.rows" :key="index"><td v-for="key in columns" :key="key">{{ reportValue(row[key]) }}</td></tr></tbody>
          </table>
        </div>
        <dl v-if="report.totals" class="detail-grid totals">
          <div v-for="(value, key) in report.totals" :key="key"><dt>{{ reportLabel(String(key)) }}</dt><dd>{{ reportValue(value) }}</dd></div>
        </dl>
      </template>
    </div>
    <footer>
      <template v-if="report">
        <AppButton variant="secondary" :disabled="busy" @click="emit('print', report)">Print</AppButton>
        <AppButton v-for="format in (['CSV', 'Excel', 'PDF'] as const)" :key="format" :disabled="busy" @click="emit('download', format, report)">{{ busy ? 'Exporting…' : format }}</AppButton>
      </template>
      <AppButton variant="secondary" @click="emit('close')">Close</AppButton>
    </footer>
  </dialog>
</template>

<style scoped>
.report-dialog { width: min(1200px, 94vw); max-height: 90vh; padding: 0; border: 1px solid var(--border); border-radius: 14px; background: var(--bg-card); color: var(--text-primary); }
.report-dialog::backdrop { background: #00152e99; }
header, footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 18px 22px; }
header { border-bottom: 1px solid var(--border); }
h2 { margin: 0; font-size: 18px; } p { margin: 6px 0 0; font-size: 12px; color: var(--text-secondary); }
.close-button { font-size: 26px; border: 0; background: transparent; color: inherit; cursor: pointer; }
.dialog-content { padding: 18px 22px; max-height: 60vh; overflow-y: auto; }
.preview-table { overflow: auto; max-height: 42vh; }
table { width: 100%; border-collapse: collapse; font-size: 12px; }
th, td { padding: 10px; text-align: left; white-space: nowrap; border-bottom: 1px solid var(--border); }
th { position: sticky; top: 0; background: var(--bg-card-soft); }
.detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 18px; margin: 0; }
dt { font-size: 11px; color: var(--text-muted); } dd { margin: 5px 0 0; font-size: 13px; overflow-wrap: anywhere; }
.totals { margin-top: 20px; padding-top: 18px; border-top: 1px solid var(--border); }
footer { justify-content: flex-end; flex-wrap: wrap; border-top: 1px solid var(--border); }
</style>
