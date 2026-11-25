<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { AlertTriangle, ArrowLeft, ArrowRight, Check, MapPin, X } from 'lucide-vue-next'
import {
  peso,
  useWageOrders,
  wageApiError,
  type RegionalRates,
  type WageEmployee,
  type WageMeta,
} from '~/composables/admin/compensation/useWageOrders'

/**
 * "+ New Minimum Wage": one wizard instead of Wage Orders → Publish → Apply.
 *
 *   1. Region      regions with employees and their current minimum (Regional Rates)
 *   2. New rate    new daily minimum per classification and the effective date
 *   3. Employees   who is affected: below minimum (required) and above (optional)
 *   4. Confirm     publishes the wage order and creates the wage adjustments
 *
 * A draft wage order is saved at step 2 to list the employees; it is deleted
 * if HR cancels before confirming.
 */
const emit = defineEmits<{ close: [], done: [message: string] }>()

const api = useWageOrders()

const step = ref<1 | 2 | 3 | 4>(1)
const loading = ref(true)
const busy = ref(false)
const error = ref('')

const meta = ref<WageMeta | null>(null)
const regional = ref<RegionalRates | null>(null)

onMounted(async () => {
  try {
    const [m, r] = await Promise.all([api.meta(), api.regionalRates()])
    meta.value = m.data
    regional.value = r.data
  } catch (err) {
    error.value = wageApiError(err, 'Unable to load regions.')
  } finally {
    loading.value = false
  }
})

// =====================================================
// STEP 1: REGION
// =====================================================

interface RegionOption {
  code: string
  name: string
  employees: number
  locations: string[]
  classifications: { key: string, name: string, current: number | null }[]
}

const regions = computed<RegionOption[]>(() => {
  if (!regional.value) return []
  const map = new Map<string, RegionOption>()

  for (const loc of regional.value.locations) {
    if (!loc.region_code || !loc.active) continue
    const entry = map.get(loc.region_code) ?? {
      code: loc.region_code,
      name: loc.region_name ?? loc.region_code,
      employees: 0,
      locations: [],
      classifications: [],
    }
    entry.employees += loc.employees
    entry.locations.push(loc.name)
    const cls = loc.wage_classification ?? 'non_agriculture'
    if (!entry.classifications.some(c => c.key === cls)) {
      const rate = regional.value.rates.find(r => r.region_code === loc.region_code && r.classification === cls)
      entry.classifications.push({
        key: cls,
        name: loc.classification_name ?? rate?.classification_name ?? cls,
        current: rate?.current?.daily_rate ?? null,
      })
    }
    map.set(loc.region_code, entry)
  }

  return [...map.values()].sort((a, b) => b.employees - a.employees)
})

const region = ref<RegionOption | null>(null)

// =====================================================
// STEP 2: NEW RATES
// =====================================================

const today = new Date().toISOString().slice(0, 10)
const form = reactive({
  effective_date: today,
  order_no: '',
  rates: {} as Record<string, number | ''>,
})

const pickRegion = (r: RegionOption) => {
  region.value = r
  form.rates = Object.fromEntries(r.classifications.map(c => [c.key, '']))
  form.order_no = `${r.code}-${today.replace(/-/g, '')}`
  error.value = ''
  step.value = 2
}

const rateRows = computed(() => region.value?.classifications ?? [])

const rateErrors = computed(() =>
  rateRows.value.filter(c => {
    const v = Number(form.rates[c.key])
    return !v || v <= 0
  }).map(c => c.key),
)

const draftId = ref<number | null>(null)
const people = ref<WageEmployee[]>([])
const chosen = reactive(new Map<number, number>()) // employee_id → new salary

const createDraftAndList = async () => {
  if (!region.value) return
  if (rateErrors.value.length) {
    error.value = 'Enter the new daily minimum for every classification.'
    return
  }
  busy.value = true
  error.value = ''
  try {
    if (draftId.value) await api.destroy(draftId.value).catch(() => undefined)
    const created = await api.store({
      region_code: region.value.code,
      order_no: form.order_no.trim() || `${region.value.code}-${form.effective_date.replace(/-/g, '')}`,
      title: `Minimum wage increase — ${region.value.name}`,
      effective_date: form.effective_date,
      issued_date: null,
      published_date: null,
      source: null,
      remarks: 'Created with New Minimum Wage.',
      rates: rateRows.value.map(c => ({
        classification: c.key,
        daily_rate: Number(form.rates[c.key]),
        cola: 0,
        previous_rate: c.current,
        notes: null,
      })),
    })
    draftId.value = created.data.id
    const list = await api.employees(created.data.id)
    people.value = list.data
    chosen.clear()
    // Below the new minimum: required, pre-selected.
    list.data
      .filter(e => e.status === 'below' && !e.blocked_reason && e.suggested_salary)
      .forEach(e => chosen.set(e.employee_id, e.suggested_salary!))
    step.value = 3
  } catch (err) {
    error.value = wageApiError(err, 'Unable to prepare the wage order.')
  } finally {
    busy.value = false
  }
}

// =====================================================
// STEP 3: EMPLOYEES
// =====================================================

const below = computed(() => people.value.filter(e => e.status === 'below' && !e.blocked_reason))
const above = computed(() => people.value.filter(e => (e.status === 'at' || e.status === 'above') && !e.blocked_reason && (e.suggested_salary ?? 0) > (e.current_salary ?? 0)))
const blocked = computed(() => people.value.filter(e => !!e.blocked_reason))

const toggle = (e: WageEmployee) => {
  if (chosen.has(e.employee_id)) chosen.delete(e.employee_id)
  else if (e.suggested_salary) chosen.set(e.employee_id, e.suggested_salary)
}

const skippedBelow = computed(() => below.value.filter(e => !chosen.has(e.employee_id)).length)

const selected = computed(() => people.value.filter(e => chosen.has(e.employee_id)))
const dailyIncrease = computed(() => selected.value.reduce((sum, e) => {
  const daily = (e.current_daily ?? 0)
  const minimum = e.new_minimum ?? 0
  return sum + Math.max(0, (e.status === 'below' ? minimum - daily : 0))
}, 0))

const salaryInvalid = (e: WageEmployee) => {
  const v = chosen.get(e.employee_id)
  return v !== undefined && (!v || v <= (e.current_salary ?? 0))
}

const anyInvalid = computed(() => selected.value.some(salaryInvalid))

// =====================================================
// STEP 4: CONFIRM
// =====================================================

const confirm = async () => {
  if (!draftId.value || anyInvalid.value) return
  busy.value = true
  error.value = ''
  try {
    await api.publish(draftId.value)
    let created = 0
    if (selected.value.length) {
      const result = await api.apply(draftId.value, {
        items: selected.value.map(e => ({ employee_id: e.employee_id, new_basic_salary: Number(chosen.get(e.employee_id)) })),
      })
      created = (result.data as { created?: unknown[] })?.created?.length ?? selected.value.length
    }
    const id = draftId.value
    draftId.value = null // published: keep it
    emit('done', created
      ? `New minimum for ${region.value?.name} saved. ${created} wage adjustment(s) are waiting for approval.`
      : `New minimum for ${region.value?.name} saved (wage order #${id}). No employees needed an adjustment.`)
  } catch (err) {
    error.value = wageApiError(err, 'Unable to save. Nothing was published if this was the first error.')
  } finally {
    busy.value = false
  }
}

const close = async () => {
  if (draftId.value) await api.destroy(draftId.value).catch(() => undefined)
  emit('close')
}

const back = async () => {
  if (step.value === 3 && draftId.value) {
    await api.destroy(draftId.value).catch(() => undefined)
    draftId.value = null
  }
  step.value = (step.value - 1) as 1 | 2 | 3
}

const STEPS = ['Region', 'New minimum', 'Employees', 'Confirm']
const date = (v: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${v}T00:00:00`))
</script>

<template>
  <div class="backdrop" @click.self="close">
    <section class="wizard" role="dialog" aria-modal="true" aria-labelledby="nmw-title">
      <header class="head">
        <div>
          <h2 id="nmw-title">New Minimum Wage</h2>
          <p>Record a new regional minimum and adjust the salaries of affected employees in one go.</p>
        </div>
        <button type="button" class="icon-btn" aria-label="Close" @click="close"><X :size="18" /></button>
      </header>

      <ol class="steps" aria-label="Steps">
        <li v-for="(s, i) in STEPS" :key="s" :class="{ on: step === i + 1, done: step > i + 1 }">
          <span>{{ step > i + 1 ? '✓' : i + 1 }}</span>{{ s }}
        </li>
      </ol>

      <div class="body">
        <p v-if="error" class="error" role="alert"><AlertTriangle :size="15" /> {{ error }}</p>

        <!-- STEP 1 -->
        <template v-if="step === 1">
          <div v-if="loading" class="state">Loading regions...</div>
          <div v-else-if="!regions.length" class="state">
            <strong>No work locations with a region yet</strong>
            <span>Set each location’s region in Compensation › Regional Rates.</span>
          </div>
          <div v-else class="regions">
            <button v-for="r in regions" :key="r.code" type="button" class="region" @click="pickRegion(r)">
              <span class="pin"><MapPin :size="18" /></span>
              <span class="region-text">
                <strong>{{ r.name }}</strong>
                <small>{{ r.employees }} employee(s) · {{ r.locations.join(', ') }}</small>
                <small v-for="c in r.classifications" :key="c.key">
                  {{ c.name }}: <b>{{ c.current ? `${peso(c.current)}/day` : 'no minimum yet' }}</b>
                </small>
              </span>
              <ArrowRight :size="16" class="go" />
            </button>
          </div>
        </template>

        <!-- STEP 2 -->
        <template v-else-if="step === 2 && region">
          <p class="lead"><strong>{{ region.name }}</strong> · {{ region.employees }} employee(s)</p>
          <div class="rates">
            <div v-for="c in rateRows" :key="c.key" class="rate">
              <label :for="`rate-${c.key}`">{{ c.name }}</label>
              <small>Current: {{ c.current ? `${peso(c.current)}/day` : 'none' }}</small>
              <div class="money">
                <span>₱</span>
                <input :id="`rate-${c.key}`" v-model.number="form.rates[c.key]" type="number" min="1" step="0.01" placeholder="New daily minimum">
              </div>
              <small v-if="c.current && Number(form.rates[c.key]) > c.current" class="inc">+{{ peso(Number(form.rates[c.key]) - c.current) }} a day</small>
            </div>
          </div>
          <div class="grid2">
            <div>
              <label for="nmw-date">Effective date</label>
              <input id="nmw-date" v-model="form.effective_date" type="date">
            </div>
            <div>
              <label for="nmw-no">Wage order no.</label>
              <input id="nmw-no" v-model="form.order_no" maxlength="50" placeholder="e.g. RB XI-24">
              <small>From the wage board, or keep the suggested number.</small>
            </div>
          </div>
        </template>

        <!-- STEP 3 -->
        <template v-else-if="step === 3">
          <p class="lead">
            New minimum effective <strong>{{ date(form.effective_date) }}</strong>.
            Check who gets a salary adjustment; you can change the new salary.
          </p>

          <section class="group">
            <h3>Below the new minimum <span class="req">Required by law</span></h3>
            <p v-if="!below.length" class="muted">No employee is below the new minimum.</p>
            <label v-for="e in below" :key="e.employee_id" class="person" :class="{ off: !chosen.has(e.employee_id) }">
              <input type="checkbox" :checked="chosen.has(e.employee_id)" @change="toggle(e)">
              <span class="who"><strong>{{ e.name }}</strong><small>{{ e.emp_id }} · {{ e.department ?? '—' }} · {{ e.salary_type }}</small></span>
              <span class="from">{{ peso(e.current_salary) }}</span>
              <span class="arrow">→</span>
              <input v-if="chosen.has(e.employee_id)" class="new" :class="{ bad: salaryInvalid(e) }" type="number" step="0.01" :value="chosen.get(e.employee_id)" :aria-label="`New salary for ${e.name}`" @input="chosen.set(e.employee_id, Number(($event.target as HTMLInputElement).value))">
              <span v-else class="muted">not included</span>
            </label>
            <p v-if="skippedBelow" class="warn"><AlertTriangle :size="14" /> {{ skippedBelow }} employee(s) below the minimum are not included. Paying below the minimum wage is a violation unless they are exempted.</p>
          </section>

          <section v-if="above.length" class="group">
            <h3>Already at or above the minimum <span class="opt">Optional</span></h3>
            <label v-for="e in above" :key="e.employee_id" class="person" :class="{ off: !chosen.has(e.employee_id) }">
              <input type="checkbox" :checked="chosen.has(e.employee_id)" @change="toggle(e)">
              <span class="who"><strong>{{ e.name }}</strong><small>{{ e.emp_id }} · {{ e.department ?? '—' }} · {{ e.salary_type }}</small></span>
              <span class="from">{{ peso(e.current_salary) }}</span>
              <span class="arrow">→</span>
              <input v-if="chosen.has(e.employee_id)" class="new" type="number" step="0.01" :value="chosen.get(e.employee_id)" :aria-label="`New salary for ${e.name}`" @input="chosen.set(e.employee_id, Number(($event.target as HTMLInputElement).value))">
              <span v-else class="muted">suggested {{ peso(e.suggested_salary) }}</span>
            </label>
          </section>

          <section v-if="blocked.length" class="group">
            <h3>Cannot be included now</h3>
            <div v-for="e in blocked" :key="e.employee_id" class="person blocked">
              <span class="who"><strong>{{ e.name }}</strong><small>{{ e.blocked_reason }}</small></span>
            </div>
          </section>
        </template>

        <!-- STEP 4 -->
        <template v-else-if="step === 4 && region">
          <div class="summary">
            <div><small>Region</small><strong>{{ region.name }}</strong></div>
            <div><small>Effective</small><strong>{{ date(form.effective_date) }}</strong></div>
            <div><small>Wage order</small><strong>{{ form.order_no }}</strong></div>
            <div v-for="c in rateRows" :key="c.key"><small>{{ c.name }}</small><strong>{{ c.current ? `${peso(c.current)} → ` : '' }}{{ peso(Number(form.rates[c.key])) }}/day</strong></div>
            <div><small>Salary adjustments</small><strong>{{ selected.length }} employee(s)</strong></div>
            <div v-if="dailyIncrease"><small>Added daily cost (below-minimum)</small><strong>{{ peso(dailyIncrease) }}</strong></div>
          </div>
          <p class="note">
            The adjustments are created as <strong>Pending</strong>. Approve them, then apply them on or after the effective date
            in Wage Adjustments, so payroll uses the new salary.
          </p>
          <p v-if="skippedBelow" class="warn"><AlertTriangle :size="14" /> {{ skippedBelow }} employee(s) below the minimum are not included.</p>
        </template>
      </div>

      <footer class="foot">
        <button v-if="step > 1" type="button" class="btn ghost" :disabled="busy" @click="back"><ArrowLeft :size="15" /> Back</button>
        <span class="spacer" />
        <button type="button" class="btn ghost" :disabled="busy" @click="close">Cancel</button>
        <button v-if="step === 2" type="button" class="btn primary" :disabled="busy" @click="createDraftAndList">
          {{ busy ? 'Checking employees...' : 'Next: employees' }} <ArrowRight :size="15" />
        </button>
        <button v-if="step === 3" type="button" class="btn primary" :disabled="busy || anyInvalid" @click="step = 4">
          Review ({{ selected.length }}) <ArrowRight :size="15" />
        </button>
        <button v-if="step === 4" type="button" class="btn primary" :disabled="busy" @click="confirm">
          <Check :size="15" /> {{ busy ? 'Saving...' : selected.length ? `Save and create ${selected.length} adjustment(s)` : 'Save new minimum' }}
        </button>
      </footer>
    </section>
  </div>
</template>

<style scoped>
.backdrop { position: fixed; inset: 0; z-index: 300; display: grid; place-items: center; padding: 16px; background: rgba(5, 15, 30, 0.6); }
.wizard { display: flex; width: 100%; max-width: 820px; max-height: 92vh; flex-direction: column; overflow: hidden; border: 1px solid var(--border); border-radius: 16px; background: var(--bg-card); }
.head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 20px 22px 12px; }
.head h2 { margin: 0; font-size: 19px; }
.head p { margin: 4px 0 0; color: var(--text-secondary); font-size: 12px; }
.icon-btn { display: grid; width: 34px; height: 34px; flex-shrink: 0; place-items: center; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text-secondary); cursor: pointer; }

.steps { display: flex; gap: 6px; margin: 0; padding: 0 22px 14px; border-bottom: 1px solid var(--border-soft); list-style: none; }
.steps li { display: flex; flex: 1; align-items: center; gap: 8px; color: var(--text-muted); font-size: 12px; font-weight: 600; }
.steps li span { display: grid; width: 24px; height: 24px; flex-shrink: 0; place-items: center; border: 1px solid var(--border); border-radius: 50%; font-size: 11px; }
.steps li.on { color: var(--text-primary); }
.steps li.on span { border-color: var(--primary); background: var(--primary); color: #fff; }
.steps li.done span { border-color: var(--green); background: var(--green-soft); color: var(--green); }

.body { display: grid; flex: 1; gap: 14px; overflow-y: auto; padding: 18px 22px; }
.state { display: grid; min-height: 160px; place-items: center; align-content: center; gap: 6px; color: var(--text-muted); font-size: 13px; text-align: center; }
.state strong { color: var(--text-primary); }
.error { display: flex; align-items: center; gap: 8px; margin: 0; padding: 10px 12px; border-radius: 9px; background: var(--red-soft); color: var(--red); font-size: 13px; }
.lead { margin: 0; color: var(--text-secondary); font-size: 13px; }
.lead strong { color: var(--text-primary); }
.muted { color: var(--text-muted); font-size: 12px; }

.regions { display: grid; gap: 10px; }
.region { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card-soft); color: inherit; font-family: inherit; text-align: left; cursor: pointer; }
.region:hover, .region:focus-visible { border-color: var(--primary); outline: none; }
.pin { display: grid; width: 40px; height: 40px; flex-shrink: 0; place-items: center; border-radius: 10px; background: var(--primary-soft); color: var(--primary); }
.region-text { display: grid; flex: 1; gap: 2px; }
.region-text strong { color: var(--text-primary); font-size: 14px; }
.region-text small { color: var(--text-secondary); font-size: 12px; }
.region-text b { color: var(--text-primary); }
.go { color: var(--text-muted); }

label { display: block; margin-bottom: 6px; color: var(--text-secondary); font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
input[type='date'], input[type='number'], input:not([type]) { width: 100%; height: 40px; padding: 0 12px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-card-soft); color: var(--text-primary); font-family: inherit; font-size: 14px; box-sizing: border-box; }
input:focus-visible { border-color: var(--primary); outline: none; }
small { display: block; margin-top: 4px; color: var(--text-muted); font-size: 11px; }
.rates { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
.rate { padding: 14px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card-soft); }
.money { display: flex; align-items: center; gap: 6px; margin-top: 8px; }
.money span { color: var(--text-muted); font-weight: 700; }
.inc { color: var(--green); font-weight: 700; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.group { display: grid; gap: 8px; }
.group h3 { display: flex; align-items: center; gap: 8px; margin: 4px 0 2px; font-size: 13px; }
.req { padding: 2px 8px; border-radius: 999px; background: var(--red-soft); color: var(--red); font-size: 10px; }
.opt { padding: 2px 8px; border-radius: 999px; background: var(--bg-card-soft); color: var(--text-muted); font-size: 10px; }
.person { display: grid; grid-template-columns: 20px 1fr auto auto 150px; align-items: center; gap: 10px; margin: 0; padding: 10px 12px; border: 1px solid var(--border); border-radius: 10px; color: var(--text-secondary); font-size: 13px; letter-spacing: 0; text-transform: none; cursor: pointer; }
.person.off { opacity: 0.65; }
.person.blocked { grid-template-columns: 1fr; cursor: default; }
.person input[type='checkbox'] { width: 16px; height: 16px; accent-color: var(--primary); }
.who strong { display: block; color: var(--text-primary); font-weight: 600; }
.who small { margin-top: 2px; }
.from { font-variant-numeric: tabular-nums; }
.arrow { color: var(--text-muted); }
.new { height: 34px !important; font-size: 13px !important; }
.new.bad { border-color: var(--red) !important; }
.warn { display: flex; align-items: center; gap: 6px; margin: 0; padding: 8px 10px; border-radius: 8px; background: var(--orange-soft); color: var(--orange); font-size: 12px; }

.summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
.summary div { padding: 12px 14px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-card-soft); }
.summary small { margin: 0 0 3px; }
.summary strong { color: var(--text-primary); font-size: 14px; }
.note { margin: 0; padding: 10px 12px; border-radius: 9px; background: var(--primary-soft); color: var(--text-secondary); font-size: 12px; line-height: 1.6; }

.foot { display: flex; align-items: center; gap: 10px; padding: 14px 22px; border-top: 1px solid var(--border-soft); }
.spacer { flex: 1; }
.btn { display: inline-flex; align-items: center; gap: 6px; height: 40px; padding: 0 16px; border-radius: 9px; font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer; }
.btn.ghost { border: 1px solid var(--border); background: transparent; color: var(--text-primary); }
.btn.primary { border: 0; background: var(--primary); color: #fff; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn:focus-visible, .icon-btn:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }

@media (max-width: 700px) {
  .grid2 { grid-template-columns: 1fr; }
  .person { grid-template-columns: 20px 1fr; }
  .person .from, .person .arrow { display: none; }
  .person .new, .person .muted { grid-column: 2; }
  .steps li { font-size: 0; }
}
</style>