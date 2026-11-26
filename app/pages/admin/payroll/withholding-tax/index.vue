<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Calculator, Pencil, Plus, RefreshCw, Save, Settings2, Table2, Trash2, X } from 'lucide-vue-next'
import {
  FREQUENCY_LABELS,
  apiMessage,
  useWithholdingTax,
  type TaxBracket,
  type TaxFrequency,
  type TaxSettings,
  type TaxTable,
} from '~/composables/admin/payroll/useWithholdingTax'

/**
 * Payroll › Withholding Tax: BIR withholding tax tables used by payroll
 * generation, company tax rules, and a quick calculator.
 */
definePageMeta({ layout: 'admin' })
useHead({ title: 'Withholding Tax | RWorkCentral' })

const api = useWithholdingTax()
const { success, error: toastError } = useToast()
const { can } = useAuth()
const canEdit = computed(() => can('payroll', 'withholding_tax.edit'))

type Tab = 'tables' | 'settings' | 'calculator'
const tab = ref<Tab>('tables')

const tables = ref<TaxTable[]>([])
const allowanceNames = ref<string[]>([])
const settings = reactive<TaxSettings>({ apply_mwe_exemption: true, main_allowance_taxable: true, non_taxable_allowances: [] })
const loading = ref(true)
const frequency = ref<TaxFrequency>('semi_monthly')

const load = async () => {
  loading.value = true
  try {
    const res = await api.load()
    tables.value = res.data
    allowanceNames.value = res.allowance_names
    Object.assign(settings, res.settings)
  } catch (err) {
    toastError('Unable to load withholding tax', apiMessage(err, 'Please try again.'))
  } finally {
    loading.value = false
  }
}
onMounted(load)

const peso = (v: number | null | undefined) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(Number(v ?? 0))
const date = (v: string | null) =>
  v ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${v.slice(0, 10)}T00:00:00`)) : 'No end date'

const FREQS: TaxFrequency[] = ['semi_monthly', 'monthly', 'weekly', 'daily']
const shown = computed(() => tables.value.filter(t => t.frequency === frequency.value))

const bracketText = (b: TaxBracket) => {
  if (!b.rate && !b.base_tax) return 'No tax'
  const base = b.base_tax ? `${peso(b.base_tax)} + ` : ''
  return `${base}${b.rate}% of the excess over ${peso(b.over)}`
}

// =====================================================
// TABLE EDITOR
// =====================================================

const editing = ref<null | { id: number | null, name: string, frequency: TaxFrequency, effective_from: string, effective_to: string, reference: string, is_active: boolean, brackets: TaxBracket[] }>(null)
const saving = ref(false)
const formError = ref('')

const openNew = () => {
  const current = shown.value.find(t => t.in_force) ?? shown.value[0]
  editing.value = {
    id: null,
    name: `BIR ${FREQUENCY_LABELS[frequency.value]} Withholding Tax Table`,
    frequency: frequency.value,
    effective_from: new Date().toISOString().slice(0, 10),
    effective_to: '',
    reference: '',
    is_active: true,
    brackets: current ? current.brackets.map(b => ({ ...b })) : [{ over: 0, up_to: null, base_tax: 0, rate: 0 }],
  }
  formError.value = ''
}

const openEdit = (t: TaxTable) => {
  editing.value = {
    id: t.id,
    name: t.name,
    frequency: t.frequency,
    effective_from: t.effective_from.slice(0, 10),
    effective_to: t.effective_to?.slice(0, 10) ?? '',
    reference: t.reference ?? '',
    is_active: t.is_active,
    brackets: t.brackets.map(b => ({ ...b })),
  }
  formError.value = ''
}

const addBracket = () => {
  const list = editing.value!.brackets
  const last = list[list.length - 1]
  list.push({ over: last?.up_to ?? 0, up_to: null, base_tax: 0, rate: 0 })
}

const saveTable = async () => {
  const f = editing.value
  if (!f) return
  if (!f.name.trim() || !f.effective_from || !f.brackets.length) {
    formError.value = 'Enter a name, an effective date and at least one bracket.'
    return
  }
  saving.value = true
  formError.value = ''
  try {
    const payload = {
      name: f.name.trim(),
      frequency: f.frequency,
      effective_from: f.effective_from,
      effective_to: f.effective_to || null,
      reference: f.reference || null,
      is_active: f.is_active,
      brackets: f.brackets.map(b => ({
        over: Number(b.over) || 0,
        up_to: b.up_to === null || (b.up_to as unknown) === '' ? null : Number(b.up_to),
        base_tax: Number(b.base_tax) || 0,
        rate: Number(b.rate) || 0,
      })),
    }
    if (f.id) await api.update(f.id, payload)
    else await api.create(payload)
    success(f.id ? 'Tax table saved' : 'Tax table added', 'Regenerate draft payroll to apply it.')
    editing.value = null
    await load()
  } catch (err) {
    formError.value = apiMessage(err, 'Unable to save the table.')
  } finally {
    saving.value = false
  }
}

const removeTable = async (t: TaxTable) => {
  if (!window.confirm(`Delete "${t.name}"?`)) return
  try {
    await api.remove(t.id)
    success('Tax table deleted', t.name)
    await load()
  } catch (err) {
    toastError('Unable to delete', apiMessage(err, 'Please try again.'))
  }
}

// =====================================================
// SETTINGS
// =====================================================

const savingSettings = ref(false)
const toggleAllowance = (name: string) => {
  const list = settings.non_taxable_allowances
  const i = list.findIndex(n => n.toLowerCase() === name.toLowerCase())
  if (i >= 0) list.splice(i, 1)
  else list.push(name)
}
const isNonTaxable = (name: string) => settings.non_taxable_allowances.some(n => n.toLowerCase() === name.toLowerCase())

const saveSettings = async () => {
  savingSettings.value = true
  try {
    const res = await api.saveSettings({ ...settings, non_taxable_allowances: [...settings.non_taxable_allowances] })
    success('Tax settings saved', res.message)
  } catch (err) {
    toastError('Unable to save settings', apiMessage(err, 'Please try again.'))
  } finally {
    savingSettings.value = false
  }
}

// =====================================================
// CALCULATOR
// =====================================================

const calc = reactive({ frequency: 'semi_monthly', taxable: '' as number | '', date: new Date().toISOString().slice(0, 10) })
const calcResult = ref<{ tax: number, bracket: TaxBracket | null, table: { name: string } | null } | null>(null)
let calcTimer: ReturnType<typeof setTimeout> | undefined
watch(() => [calc.frequency, calc.taxable, calc.date], () => {
  clearTimeout(calcTimer)
  if (calc.taxable === '' || Number(calc.taxable) < 0) {
    calcResult.value = null
    return
  }
  calcTimer = setTimeout(async () => {
    try {
      const res = await api.calculate(calc.frequency, Number(calc.taxable), calc.date)
      calcResult.value = res.data
    } catch {
      calcResult.value = null
    }
  }, 300)
})
</script>

<template>
  <section class="wt-page">
    <PageHeader
      title="Withholding Tax"
      description="BIR withholding tax on compensation (TRAIN law). Payroll generation uses the table of the employee's pay frequency in force on the cut-off end date."
    >
      <AppButton variant="secondary" :icon="RefreshCw" :disabled="loading" @click="load">Refresh</AppButton>
      <AppButton v-if="canEdit && tab === 'tables'" :icon="Plus" @click="openNew">New Tax Table</AppButton>
    </PageHeader>

    <div class="tabs" role="tablist" aria-label="Withholding tax">
      <button type="button" role="tab" :aria-selected="tab === 'tables'" :class="{ on: tab === 'tables' }" @click="tab = 'tables'"><Table2 :size="15" /> Tax Tables</button>
      <button type="button" role="tab" :aria-selected="tab === 'settings'" :class="{ on: tab === 'settings' }" @click="tab = 'settings'"><Settings2 :size="15" /> Settings</button>
      <button type="button" role="tab" :aria-selected="tab === 'calculator'" :class="{ on: tab === 'calculator' }" @click="tab = 'calculator'"><Calculator :size="15" /> Calculator</button>
    </div>

    <!-- HOW IT IS COMPUTED -->
    <div v-if="tab !== 'calculator'" class="formula">
      <strong>Taxable pay</strong> = basic + overtime + holiday pay + taxable allowances − late / undertime / unpaid leave − employee share of SSS, PhilHealth and Pag-IBIG.
      <strong>Minimum wage earners</strong> pay no tax on their basic, overtime and holiday pay.
    </div>

    <!-- TAX TABLES -->
    <template v-if="tab === 'tables'">
      <div class="chips" role="group" aria-label="Pay frequency">
        <button v-for="f in FREQS" :key="f" type="button" class="chip" :class="{ on: frequency === f }" :aria-pressed="frequency === f" @click="frequency = f">
          {{ FREQUENCY_LABELS[f] }}
        </button>
      </div>

      <div v-if="loading && !tables.length" class="state">Loading tax tables...</div>
      <div v-else-if="!shown.length" class="state">
        <strong>No {{ FREQUENCY_LABELS[frequency] }} table yet</strong>
        <span>Run <code>php artisan db:seed --class=WithholdingTaxSeeder</code>, or add one.</span>
      </div>

      <section v-for="t in shown" :key="t.id" class="panel">
        <header class="panel-head">
          <div>
            <h2>{{ t.name }}</h2>
            <p>{{ date(t.effective_from) }} – {{ date(t.effective_to) }}<template v-if="t.reference"> · {{ t.reference }}</template></p>
          </div>
          <div class="head-actions">
            <span class="pill" :class="t.in_force ? 'ok' : t.is_active ? 'muted' : 'off'">{{ t.in_force ? 'In force' : t.is_active ? 'Not in force' : 'Inactive' }}</span>
            <template v-if="canEdit">
              <button type="button" class="icon-btn" :aria-label="`Edit ${t.name}`" @click="openEdit(t)"><Pencil :size="15" /></button>
              <button type="button" class="icon-btn danger" :aria-label="`Delete ${t.name}`" @click="removeTable(t)"><Trash2 :size="15" /></button>
            </template>
          </div>
        </header>
        <div class="table-wrap">
          <table class="grid">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col" class="num">Taxable pay over</th>
                <th scope="col" class="num">Up to</th>
                <th scope="col">Withholding tax</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(b, i) in t.brackets" :key="i">
                <td class="muted">{{ i + 1 }}</td>
                <td class="num">{{ peso(b.over) }}</td>
                <td class="num">{{ b.up_to === null ? 'and above' : peso(b.up_to) }}</td>
                <td>{{ bracketText(b) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>

    <!-- SETTINGS -->
    <section v-else-if="tab === 'settings'" class="panel pad">
      <label class="toggle">
        <input v-model="settings.apply_mwe_exemption" type="checkbox" :disabled="!canEdit">
        <span>
          <strong>Exempt minimum wage earners</strong>
          <small>Employees whose daily rate is not above the regional minimum of their work location (Compensation › Regional Rates) pay no tax on basic, overtime and holiday pay.</small>
        </span>
      </label>

      <label class="toggle">
        <input v-model="settings.main_allowance_taxable" type="checkbox" :disabled="!canEdit">
        <span>
          <strong>Salary setup allowance is taxable</strong>
          <small>The “Allowance” in each employee’s salary setup. Uncheck it if it is a de minimis benefit within BIR limits.</small>
        </span>
      </label>

      <div class="allowances">
        <strong>Non-taxable (de minimis) additional allowances</strong>
        <small>Checked allowances are not taxed. Every other allowance is taxable, as BIR requires.</small>
        <p v-if="!allowanceNames.length" class="muted">No additional allowances in use yet.</p>
        <label v-for="name in allowanceNames" :key="name" class="allowance">
          <input type="checkbox" :checked="isNonTaxable(name)" :disabled="!canEdit" @change="toggleAllowance(name)">
          {{ name }}
        </label>
      </div>

      <div v-if="canEdit" class="actions">
        <AppButton :icon="Save" :disabled="savingSettings" @click="saveSettings">{{ savingSettings ? 'Saving...' : 'Save Settings' }}</AppButton>
      </div>
      <p class="note">Changes apply to payroll generated after saving. Regenerate draft payroll to update it; finalized payroll does not change.</p>
    </section>

    <!-- CALCULATOR -->
    <section v-else class="panel pad">
      <div class="calc">
        <div>
          <label for="wt-freq">Pay frequency</label>
          <select id="wt-freq" v-model="calc.frequency">
            <option v-for="(label, key) in FREQUENCY_LABELS" :key="key" :value="key">{{ label }}</option>
          </select>
        </div>
        <div>
          <label for="wt-taxable">Taxable pay for the period</label>
          <input id="wt-taxable" v-model.number="calc.taxable" type="number" min="0" step="0.01" placeholder="e.g. 28300">
        </div>
        <div>
          <label for="wt-date">Pay date</label>
          <input id="wt-date" v-model="calc.date" type="date">
        </div>
      </div>
      <div v-if="calcResult" class="calc-result" aria-live="polite">
        <small>Withholding tax</small>
        <strong>{{ peso(calcResult.tax) }}</strong>
        <span v-if="calcResult.bracket">{{ bracketText(calcResult.bracket) }}</span>
        <span v-if="calcResult.table" class="muted">{{ calcResult.table.name }}</span>
        <span v-else class="muted">No table for this frequency and date.</span>
      </div>
    </section>

    <!-- EDITOR -->
    <div v-if="editing" class="backdrop" @click.self="editing = null">
      <section class="modal" role="dialog" aria-modal="true" aria-labelledby="wt-edit-title">
        <header class="modal-head">
          <h2 id="wt-edit-title">{{ editing.id ? 'Edit Tax Table' : 'New Tax Table' }}</h2>
          <button type="button" class="icon-btn" aria-label="Close" @click="editing = null"><X :size="16" /></button>
        </header>
        <div class="modal-body">
          <p v-if="formError" class="error" role="alert">{{ formError }}</p>
          <div class="grid2">
            <div class="span2">
              <label for="wt-name">Name</label>
              <input id="wt-name" v-model="editing.name" maxlength="150">
            </div>
            <div>
              <label for="wt-f">Pay frequency</label>
              <select id="wt-f" v-model="editing.frequency">
                <option v-for="f in FREQS" :key="f" :value="f">{{ FREQUENCY_LABELS[f] }}</option>
              </select>
            </div>
            <div>
              <label for="wt-ref">BIR reference</label>
              <input id="wt-ref" v-model="editing.reference" maxlength="150" placeholder="e.g. RR 11-2018, Annex E">
            </div>
            <div>
              <label for="wt-from">Effective from</label>
              <input id="wt-from" v-model="editing.effective_from" type="date">
            </div>
            <div>
              <label for="wt-to">Effective until (optional)</label>
              <input id="wt-to" v-model="editing.effective_to" type="date">
            </div>
          </div>
          <p v-if="!editing.id" class="hint">The current table of this frequency ends the day before the new effective date.</p>

          <table class="grid edit">
            <thead>
              <tr>
                <th scope="col">Over (₱)</th>
                <th scope="col">Up to (₱)</th>
                <th scope="col">Base tax (₱)</th>
                <th scope="col">Rate (%)</th>
                <th scope="col"><span class="sr-only">Remove</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(b, i) in editing.brackets" :key="i">
                <td><input v-model.number="b.over" type="number" min="0" step="0.01" :aria-label="`Bracket ${i + 1} over`"></td>
                <td><input v-model.number="b.up_to" type="number" min="0" step="0.01" placeholder="and above" :aria-label="`Bracket ${i + 1} up to`"></td>
                <td><input v-model.number="b.base_tax" type="number" min="0" step="0.01" :aria-label="`Bracket ${i + 1} base tax`"></td>
                <td><input v-model.number="b.rate" type="number" min="0" max="100" step="0.01" :aria-label="`Bracket ${i + 1} rate`"></td>
                <td><button type="button" class="icon-btn danger" :disabled="editing.brackets.length === 1" :aria-label="`Remove bracket ${i + 1}`" @click="editing.brackets.splice(i, 1)"><Trash2 :size="14" /></button></td>
              </tr>
            </tbody>
          </table>
          <button type="button" class="link" @click="addBracket"><Plus :size="14" /> Add bracket</button>
        </div>
        <footer class="modal-foot">
          <AppButton variant="secondary" :disabled="saving" @click="editing = null">Cancel</AppButton>
          <AppButton :icon="Save" :disabled="saving" @click="saveTable">{{ saving ? 'Saving...' : 'Save Table' }}</AppButton>
        </footer>
      </section>
    </div>
  </section>
</template>

<style scoped>
.wt-page { display: grid; gap: 14px; width: 100%; max-width: 1200px; margin: 0 auto; }

.tabs { display: flex; gap: 4px; width: fit-content; padding: 4px; border: 1px solid var(--border); border-radius: 11px; background: var(--bg-card); }
.tabs button { display: inline-flex; align-items: center; gap: 7px; height: 36px; padding: 0 14px; border: 0; border-radius: 8px; background: transparent; color: var(--text-secondary); font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
.tabs button.on { background: var(--primary); color: #fff; }

.formula { padding: 12px 16px; border-radius: 10px; background: var(--primary-soft); color: var(--text-secondary); font-size: 13px; line-height: 1.6; }
.formula strong { color: var(--text-primary); }

.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip { height: 34px; padding: 0 14px; border: 1px solid var(--border); border-radius: 999px; background: var(--bg-card); color: var(--text-secondary); font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
.chip.on { border-color: var(--primary); background: var(--primary-soft); color: var(--text-primary); }

.state { display: flex; min-height: 160px; flex-direction: column; align-items: center; justify-content: center; gap: 6px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); color: var(--text-muted); font-size: 13px; text-align: center; }
.state strong { color: var(--text-primary); font-size: 15px; }

.panel { overflow: hidden; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
.panel.pad { display: grid; gap: 16px; padding: 20px; }
.panel-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; padding: 16px 18px; border-bottom: 1px solid var(--border-soft); }
.panel-head h2 { margin: 0; font-size: 16px; }
.panel-head p { margin: 4px 0 0; color: var(--text-secondary); font-size: 12px; }
.head-actions { display: flex; align-items: center; gap: 8px; }
.pill { padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
.pill.ok { background: var(--green-soft); color: var(--green); }
.pill.muted { background: var(--bg-card-soft); color: var(--text-muted); }
.pill.off { background: var(--red-soft); color: var(--red); }

.table-wrap { overflow-x: auto; }
.grid { width: 100%; border-collapse: collapse; font-size: 13px; }
.grid th { padding: 10px 16px; border-bottom: 1px solid var(--border); color: var(--text-secondary); font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-align: left; text-transform: uppercase; }
.grid td { padding: 10px 16px; border-top: 1px solid var(--border-soft); color: var(--text-secondary); }
.num { font-variant-numeric: tabular-nums; text-align: right !important; white-space: nowrap; }
.muted { color: var(--text-muted); }

.toggle { display: flex; align-items: flex-start; gap: 12px; cursor: pointer; }
.toggle input, .allowance input { width: 18px; height: 18px; margin-top: 2px; accent-color: var(--primary); }
.toggle span { display: grid; gap: 4px; }
.toggle strong, .allowances > strong { color: var(--text-primary); font-size: 14px; }
.toggle small, .allowances > small { color: var(--text-secondary); font-size: 12px; line-height: 1.5; }
.allowances { display: grid; gap: 8px; padding-top: 4px; }
.allowance { display: flex; align-items: center; gap: 10px; color: var(--text-primary); font-size: 13px; cursor: pointer; }
.actions { display: flex; justify-content: flex-end; }
.note, .hint { margin: 0; color: var(--text-muted); font-size: 12px; }

.calc { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
label { display: block; margin-bottom: 6px; color: var(--text-secondary); font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
input:not([type='checkbox']), select { width: 100%; height: 40px; padding: 0 12px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-card-soft); color: var(--text-primary); font-family: inherit; font-size: 14px; box-sizing: border-box; }
input:focus-visible, select:focus-visible { border-color: var(--primary); outline: none; }
.calc-result { display: grid; gap: 4px; padding: 16px; border-radius: 12px; background: var(--bg-card-soft); }
.calc-result small { color: var(--text-muted); font-size: 12px; }
.calc-result strong { color: var(--text-primary); font-size: 28px; }
.calc-result span { color: var(--text-secondary); font-size: 13px; }

.icon-btn { display: grid; width: 32px; height: 32px; place-items: center; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text-secondary); cursor: pointer; }
.icon-btn.danger:hover { border-color: var(--red); color: var(--red); }
.icon-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.link { display: inline-flex; align-items: center; gap: 6px; padding: 0; border: 0; background: transparent; color: var(--primary); font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer; }

.backdrop { position: fixed; inset: 0; z-index: 300; display: grid; place-items: center; padding: 16px; background: rgba(5, 15, 30, 0.6); }
.modal { display: flex; width: 100%; max-width: 760px; max-height: 92vh; flex-direction: column; overflow: hidden; border: 1px solid var(--border); border-radius: 14px; background: var(--bg-card); }
.modal-head, .modal-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 16px 20px; }
.modal-head { border-bottom: 1px solid var(--border-soft); }
.modal-head h2 { margin: 0; font-size: 17px; }
.modal-foot { justify-content: flex-end; border-top: 1px solid var(--border-soft); }
.modal-body { display: grid; gap: 14px; overflow-y: auto; padding: 18px 20px; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.span2 { grid-column: span 2; }
.grid.edit td { padding: 6px 6px; }
.grid.edit input { height: 36px; font-size: 13px; }
.error { margin: 0; padding: 10px 12px; border-radius: 9px; background: var(--red-soft); color: var(--red); font-size: 13px; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
button:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }

@media (max-width: 760px) { .calc, .grid2 { grid-template-columns: 1fr; } .span2 { grid-column: auto; } }
</style>
