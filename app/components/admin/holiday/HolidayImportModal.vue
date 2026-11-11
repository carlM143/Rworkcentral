<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Download, FileUp, Flag, Plus, Trash2, Upload, X } from 'lucide-vue-next'

interface Location { id: number; location_name: string; city: string }
interface HolidayType { id: number; type_name: string; type_code: string }
interface ExistingHoliday { holiday_name: string; holiday_date: string }
interface ImportRow {
  uid: number
  selected: boolean
  holiday_name: string
  holiday_date: string
  end_date: string
  type_code: string
  is_working_day: boolean
  note?: string
}

const props = defineProps<{
  types: HolidayType[]
  locations: Location[]
  defaultYear: number
  defaultLocationId?: string
}>()

const emit = defineEmits<{
  close: []
  imported: [year: number, message: string]
}>()

const { $api } = useNuxtApp()

const TYPE_CODES = ['REGULAR', 'SPECIAL', 'COMPANY', 'LOCAL']
const typeOptions = computed(() => props.types.filter(t => TYPE_CODES.includes(t.type_code)))
const typeIdFor = (code: string) => props.types.find(t => t.type_code === code)?.id

const year = ref(props.defaultYear)
const yearOptions = computed(() => {
  const base = new Date().getFullYear()
  return [base - 1, base, base + 1, base + 2]
})
const source = ref<'preset' | 'csv'>('preset')
const rows = ref<ImportRow[]>([])
const existing = ref<ExistingHoliday[]>([])
const loadingExisting = ref(false)
const saving = ref(false)
const error = ref('')
const csvName = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const coverage = reactive({
  applies_to: props.defaultLocationId ? 'specific_locations' : 'all_locations',
  location_ids: props.defaultLocationId ? [Number(props.defaultLocationId)] : [] as number[],
})

let uid = 0
const pad = (n: number) => String(n).padStart(2, '0')
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

// Anonymous Gregorian algorithm for Easter Sunday.
const easterSunday = (y: number) => {
  const a = y % 19
  const b = Math.floor(y / 100)
  const c = y % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(y, month - 1, day)
}
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const lastMondayOf = (y: number, monthIndex: number) => {
  const last = new Date(y, monthIndex + 1, 0)
  return addDays(last, -((last.getDay() + 6) % 7))
}

/** Philippine national holidays (RA 9492 / annual proclamations). */
const philippineHolidays = (y: number): Omit<ImportRow, 'uid' | 'selected'>[] => {
  const easter = easterSunday(y)
  const fixed = (m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`
  const row = (holiday_name: string, date: string, type_code: string, note?: string) =>
    ({ holiday_name, holiday_date: date, end_date: date, type_code, is_working_day: false, note })

  return [
    row("New Year's Day", fixed(1, 1), 'REGULAR'),
    row('EDSA People Power Revolution Anniversary', fixed(2, 25), 'SPECIAL'),
    row('Maundy Thursday', ymd(addDays(easter, -3)), 'REGULAR'),
    row('Good Friday', ymd(addDays(easter, -2)), 'REGULAR'),
    row('Black Saturday', ymd(addDays(easter, -1)), 'SPECIAL'),
    row('Araw ng Kagitingan', fixed(4, 9), 'REGULAR'),
    row('Labor Day', fixed(5, 1), 'REGULAR'),
    row('Independence Day', fixed(6, 12), 'REGULAR'),
    row('Ninoy Aquino Day', fixed(8, 21), 'SPECIAL'),
    row('National Heroes Day', ymd(lastMondayOf(y, 7)), 'REGULAR'),
    row("All Saints' Day", fixed(11, 1), 'SPECIAL'),
    row("All Souls' Day", fixed(11, 2), 'SPECIAL'),
    row('Bonifacio Day', fixed(11, 30), 'REGULAR'),
    row('Feast of the Immaculate Conception of Mary', fixed(12, 8), 'SPECIAL'),
    row('Christmas Eve', fixed(12, 24), 'SPECIAL'),
    row('Christmas Day', fixed(12, 25), 'REGULAR'),
    row('Rizal Day', fixed(12, 30), 'REGULAR'),
    row('Last Day of the Year', fixed(12, 31), 'SPECIAL'),
  ].sort((a, b) => a.holiday_date.localeCompare(b.holiday_date))
}

const isExisting = (r: ImportRow) =>
  existing.value.some(e =>
    e.holiday_date.slice(0, 10) === r.holiday_date
    && e.holiday_name.trim().toLowerCase() === r.holiday_name.trim().toLowerCase())

const setRows = (items: Omit<ImportRow, 'uid' | 'selected'>[]) => {
  rows.value = items.map(item => ({ ...item, uid: ++uid, selected: true }))
  rows.value.forEach(r => { if (isExisting(r)) r.selected = false })
}

const loadPreset = () => {
  setRows(philippineHolidays(year.value))
}

const loadExisting = async () => {
  loadingExisting.value = true
  try {
    const res = await $api<{ data: { holidays: ExistingHoliday[] } }>(`/admin/work-calendar/holidays?year=${year.value}`)
    existing.value = res.data.holidays
  } catch {
    existing.value = []
  } finally {
    loadingExisting.value = false
  }
}

const refresh = async () => {
  error.value = ''
  await loadExisting()
  if (source.value === 'preset') loadPreset()
  else rows.value.forEach(r => { if (isExisting(r)) r.selected = false })
}

watch(year, async () => {
  if (source.value === 'csv') rows.value = []
  csvName.value = ''
  await refresh()
})
watch(source, (value) => {
  error.value = ''
  if (value === 'preset') loadPreset()
  else { rows.value = []; csvName.value = '' }
})
onMounted(refresh)

// ---------- CSV ----------
const parseCsv = (text: string): string[][] => {
  const out: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++ }
      else if (ch === '"') quoted = false
      else cell += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') { row.push(cell); cell = '' }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(cell); cell = ''
      if (row.some(c => c.trim())) out.push(row)
      row = []
    } else cell += ch
  }
  row.push(cell)
  if (row.some(c => c.trim())) out.push(row)
  return out
}

const normalizeDate = (value: string): string => {
  const v = value.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v
  const mdy = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (mdy) return `${mdy[3]}-${pad(Number(mdy[1]))}-${pad(Number(mdy[2]))}`
  const parsed = new Date(v)
  return Number.isNaN(parsed.getTime()) ? '' : ymd(parsed)
}

const normalizeType = (value: string): string => {
  const v = value.trim().toUpperCase()
  if (!v) return 'REGULAR'
  if (TYPE_CODES.includes(v)) return v
  if (v.includes('REGULAR')) return 'REGULAR'
  if (v.includes('SPECIAL')) return 'SPECIAL'
  if (v.includes('COMPANY')) return 'COMPANY'
  if (v.includes('LOCAL')) return 'LOCAL'
  return 'REGULAR'
}

const onFile = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  error.value = ''
  csvName.value = file.name
  const lines = parseCsv(await file.text())
  if (!lines.length) { error.value = 'The CSV file is empty.'; return }

  const header = lines[0]!.map(h => h.trim().toLowerCase())
  const hasHeader = header.some(h => h.includes('name') || h.includes('date'))
  const col = (keys: string[], fallback: number) => {
    const idx = header.findIndex(h => keys.some(k => h.includes(k)))
    return hasHeader && idx >= 0 ? idx : fallback
  }
  const iName = col(['name', 'holiday'], 0)
  const iStart = col(['start', 'date'], 1)
  const iEnd = header.findIndex(h => h.includes('end'))
  const iType = col(['type', 'class'], 3)
  const iWork = col(['working', 'work'], 4)

  const items: Omit<ImportRow, 'uid' | 'selected'>[] = []
  const bad: number[] = []
  lines.slice(hasHeader ? 1 : 0).forEach((cells, index) => {
    const name = (cells[iName] ?? '').trim()
    const start = normalizeDate(cells[iStart] ?? '')
    const end = iEnd >= 0 ? normalizeDate(cells[iEnd] ?? '') : ''
    if (!name || !start) { bad.push(index + (hasHeader ? 2 : 1)); return }
    const work = (cells[iWork] ?? '').trim().toLowerCase()
    items.push({
      holiday_name: name,
      holiday_date: start,
      end_date: end && end >= start ? end : start,
      type_code: normalizeType(cells[iType] ?? ''),
      is_working_day: ['yes', 'y', 'true', '1', 'working'].includes(work),
    })
  })

  setRows(items)
  if (bad.length) error.value = `Skipped ${bad.length} invalid line(s): ${bad.slice(0, 8).join(', ')}${bad.length > 8 ? '…' : ''}. Each row needs a name and a valid date.`
  if (fileInput.value) fileInput.value.value = ''
}

const downloadTemplate = () => {
  const sample = [
    ['holiday_name', 'start_date', 'end_date', 'type', 'working_day'],
    ["New Year's Day", `${year.value}-01-01`, `${year.value}-01-01`, 'REGULAR', 'no'],
    ['Company Foundation Day', `${year.value}-03-15`, `${year.value}-03-15`, 'COMPANY', 'no'],
    ['Year-End Break', `${year.value}-12-26`, `${year.value}-12-29`, 'COMPANY', 'no'],
  ]
  const csv = sample.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `holiday-import-template-${year.value}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const onStartDateChange = (r: ImportRow) => {
  if (!r.end_date || r.end_date < r.holiday_date) {
    r.end_date = r.holiday_date
  }
}

// ---------- Rows ----------
const addRow = () => {
  const d = `${year.value}-01-01`
  rows.value.push({ uid: ++uid, selected: true, holiday_name: '', holiday_date: d, end_date: d, type_code: 'COMPANY', is_working_day: false })
}
const removeRow = (r: ImportRow) => { rows.value = rows.value.filter(x => x.uid !== r.uid) }

const selectable = computed(() => rows.value.filter(r => !isExisting(r)))
const selectedRows = computed(() => rows.value.filter(r => r.selected && !isExisting(r)))
const allSelected = computed({
  get: () => selectable.value.length > 0 && selectable.value.every(r => r.selected),
  set: (value: boolean) => selectable.value.forEach(r => { r.selected = value }),
})
const rowInvalid = (r: ImportRow) =>
  !r.holiday_name.trim() || !r.holiday_date || !r.holiday_date.startsWith(`${year.value}-`)
  || (!!r.end_date && r.end_date < r.holiday_date)

const formatDay = (value: string) => {
  if (!value) return ''
  const d = new Date(`${value}T00:00:00`)
  return d.toLocaleDateString('en-US', { weekday: 'short' })
}

const submit = async () => {
  error.value = ''
  if (!selectedRows.value.length) { error.value = 'Select at least one holiday to import.'; return }
  const invalid = selectedRows.value.find(rowInvalid)
  if (invalid) { error.value = `Check "${invalid.holiday_name || 'unnamed row'}" — it needs a name and a date within ${year.value}.`; return }
  if (coverage.applies_to === 'specific_locations' && !coverage.location_ids.length) { error.value = 'Select at least one location.'; return }
  const missingType = selectedRows.value.find(r => !typeIdFor(r.type_code))
  if (missingType) { error.value = `Classification "${missingType.type_code}" is not available.`; return }

  saving.value = true
  try {
    const res = await $api<{ message: string }>('/admin/work-calendar/holidays/import', {
      method: 'POST',
      body: {
        year: year.value,
        applies_to: coverage.applies_to,
        location_ids: coverage.applies_to === 'specific_locations' ? coverage.location_ids : [],
        holidays: selectedRows.value.map(r => ({
          holiday_name: r.holiday_name.trim(),
          holiday_date: r.holiday_date,
          end_date: r.end_date || r.holiday_date,
          holiday_type_id: typeIdFor(r.type_code),
          is_working_day: r.is_working_day,
        })),
      },
    })
    emit('imported', year.value, res.message)
  } catch (problem: any) {
    error.value = String(Object.values(problem?.data?.errors ?? {}).flat()[0] || problem?.data?.message || 'Unable to import holidays.')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="overlay" @click.self="!saving && emit('close')">
    <section class="dialog import-dialog" role="dialog" aria-modal="true" aria-labelledby="import-title">
      <header class="dialog-heading">
        <div>
          <h2 id="import-title">Import Holidays</h2>
          <p class="dialog-subtitle">Load a full year of holidays at once from the Philippine holiday list or a CSV file, then review before importing.</p>
        </div>
        <button type="button" :disabled="saving" aria-label="Close import" @click="emit('close')"><X :size="20" /></button>
      </header>

      <div class="controls">
        <label>Year
          <select v-model.number="year" :disabled="saving">
            <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
          </select>
        </label>
        <div class="source-tabs" role="tablist">
          <button type="button" role="tab" :class="{ active: source === 'preset' }" :aria-selected="source === 'preset'" :disabled="saving" @click="source = 'preset'">
            <Flag :size="14" /> Philippine Holidays
          </button>
          <button type="button" role="tab" :class="{ active: source === 'csv' }" :aria-selected="source === 'csv'" :disabled="saving" @click="source = 'csv'">
            <FileUp :size="14" /> Upload CSV
          </button>
        </div>
        <label>Applies To
          <select v-model="coverage.applies_to" :disabled="saving">
            <option value="all_locations">All locations</option>
            <option value="specific_locations">Selected locations</option>
          </select>
        </label>
      </div>

      <div v-if="coverage.applies_to === 'specific_locations'" class="locations-box">
        <label v-for="location in locations" :key="location.id" class="checkbox">
          <input v-model="coverage.location_ids" type="checkbox" :value="location.id" :disabled="saving" />
          {{ location.location_name }} ({{ location.city }})
        </label>
      </div>

      <p v-if="source === 'preset'" class="hint">
        Dates for Holy Week and National Heroes Day are computed for {{ year }}. Holidays set by yearly proclamation
        (Chinese New Year, Eid'l Fitr, Eid'l Adha, special days) can be added with <strong>Add Row</strong>, and any date can be edited before import.
      </p>
      <div v-else class="csv-box">
        <input ref="fileInput" type="file" accept=".csv,text/csv" hidden @change="onFile" />
        <button type="button" class="ghost" :disabled="saving" @click="fileInput?.click()"><Upload :size="14" /> Choose CSV File</button>
        <span class="csv-name">{{ csvName || 'No file selected' }}</span>
        <button type="button" class="link" @click="downloadTemplate"><Download :size="14" /> Download template</button>
        <small>Columns: holiday_name, start_date, end_date (optional), type (REGULAR / SPECIAL / COMPANY / LOCAL), working_day (yes/no).</small>
      </div>

      <p v-if="error" class="notice" role="alert">{{ error }}</p>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th class="w-check"><input v-model="allSelected" type="checkbox" :disabled="saving || !selectable.length" aria-label="Select all" /></th>
              <th>Holiday Name</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Classification</th>
              <th>Day Status</th>
              <th class="w-action" />
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.uid" :class="{ exists: isExisting(r), invalid: r.selected && !isExisting(r) && rowInvalid(r) }">
              <td class="w-check"><input v-model="r.selected" type="checkbox" :disabled="saving || isExisting(r)" /></td>
              <td>
                <input v-model="r.holiday_name" :disabled="saving" placeholder="Holiday name" />
                <small v-if="isExisting(r)" class="tag">Already in calendar</small>
              </td>
              <td>
                <input v-model="r.holiday_date" type="date" :disabled="saving" @change="onStartDateChange(r)" />
                <small class="weekday">{{ formatDay(r.holiday_date) }}</small>
              </td>
              <td><input v-model="r.end_date" type="date" :min="r.holiday_date" :disabled="saving" /></td>
              <td>
                <select v-model="r.type_code" :disabled="saving">
                  <option v-for="t in typeOptions" :key="t.id" :value="t.type_code">{{ t.type_name }}</option>
                </select>
              </td>
              <td>
                <select v-model="r.is_working_day" :disabled="saving">
                  <option :value="false">Non-working</option>
                  <option :value="true">Working</option>
                </select>
              </td>
              <td class="w-action"><button type="button" class="icon" :disabled="saving" aria-label="Remove row" @click="removeRow(r)"><Trash2 :size="14" /></button></td>
            </tr>
            <tr v-if="!rows.length">
              <td colspan="7" class="empty">{{ loadingExisting ? 'Loading…' : source === 'csv' ? 'Upload a CSV file to preview holidays.' : 'No holidays to show.' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer class="foot">
        <button type="button" class="ghost" :disabled="saving" @click="addRow"><Plus :size="14" /> Add Row</button>
        <span class="count">{{ selectedRows.length }} of {{ rows.length }} selected for {{ year }}</span>
        <button type="button" class="ghost" :disabled="saving" @click="emit('close')">Cancel</button>
        <button type="button" class="primary" :disabled="saving || !selectedRows.length" @click="submit">
          {{ saving ? 'Importing…' : `Import ${selectedRows.length} Holiday${selectedRows.length === 1 ? '' : 's'}` }}
        </button>
      </footer>
    </section>
  </div>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; background: #0009; display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.dialog { background: var(--bg-card); color: var(--text-primary); padding: 22px; border: 1px solid var(--border); border-radius: 14px; width: min(1040px, 96vw); max-height: 92vh; display: flex; flex-direction: column; gap: 14px; overflow: hidden; }
.dialog-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
h2 { font-size: 18px; margin: 0; }
.dialog-subtitle { font-size: 12.5px; color: var(--text-muted); margin: 4px 0 0; }
label { display: flex; flex-direction: column; gap: 6px; font-size: 12px; }
input, select, button { color: var(--text-primary); background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px; padding: 8px 9px; font: inherit; font-size: 12.5px; }
button { cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
button:disabled { opacity: .5; cursor: default; }
.controls { display: flex; gap: 14px; align-items: flex-end; flex-wrap: wrap; }
.source-tabs { display: inline-flex; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
.source-tabs button { border: 0; border-radius: 0; padding: 9px 14px; background: transparent; color: var(--text-muted); }
.source-tabs button.active { background: var(--primary); color: #fff; }
.locations-box { display: flex; flex-wrap: wrap; gap: 10px 18px; padding: 10px; border: 1px solid var(--border); border-radius: 8px; }
.checkbox { flex-direction: row; align-items: center; }
.hint { margin: 0; font-size: 12px; color: var(--text-muted); line-height: 1.5; }
.csv-box { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.csv-box small { flex-basis: 100%; color: var(--text-muted); font-size: 11.5px; }
.csv-name { font-size: 12px; color: var(--text-muted); }
.link { border: 0; background: transparent; color: var(--primary); padding: 4px; }
.notice { margin: 0; padding: 10px 12px; color: #ef4444; background: rgba(239, 68, 68, .08); border-radius: 8px; font-size: 12.5px; }
.table-wrap { flex: 1; min-height: 160px; overflow: auto; border: 1px solid var(--border); border-radius: 10px; }
table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
th { position: sticky; top: 0; background: var(--bg-card); text-align: left; padding: 10px 8px; font-size: 11px; text-transform: uppercase; letter-spacing: .4px; color: var(--text-muted); border-bottom: 1px solid var(--border); z-index: 1; }
td { padding: 6px 8px; border-bottom: 1px solid var(--border); vertical-align: top; }
td input:not([type="checkbox"]), td select { width: 100%; }
.w-check { width: 34px; text-align: center; padding-top: 14px; }
.w-action { width: 42px; }
tr.exists td { opacity: .55; }
tr.invalid td { background: rgba(239, 68, 68, .06); }
.tag { display: inline-block; margin-top: 4px; font-size: 10.5px; color: #22c55e; }
.weekday { display: block; margin-top: 3px; font-size: 10.5px; color: var(--text-muted); }
.icon { padding: 7px; }
.empty { text-align: center; padding: 28px; color: var(--text-muted); }
.foot { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.count { margin-left: auto; font-size: 12px; color: var(--text-muted); }
.ghost { background: transparent; }
.primary { background: var(--primary); color: #fff; border-color: var(--primary); font-weight: 600; }
@media (max-width: 760px) { .count { margin-left: 0; flex-basis: 100%; } }
</style>
