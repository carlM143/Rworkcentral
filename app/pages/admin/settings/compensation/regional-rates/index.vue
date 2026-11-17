<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ArrowLeft, Landmark, Save } from 'lucide-vue-next'
import {
  peso,
  useWageOrders,
  wageApiError,
  wageDate,
  type RegionalRates,
  type WageMeta,
} from '~/composables/admin/compensation/useWageOrders'

definePageMeta({
  layout: 'admin',
})

const router = useRouter()
const api = useWageOrders()
const { success, error: toastError } = useToast()

const data = ref<RegionalRates | null>(null)
const meta = ref<WageMeta | null>(null)
const loading = ref(true)
const loadError = ref('')

// Editable region/classification per location (id => values).
const edits = reactive<Record<number, { region_code: string, wage_classification: string }>>({})
const savingId = ref<number | null>(null)

const load = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const [rates, m] = await Promise.all([api.regionalRates(), meta.value ? Promise.resolve({ data: meta.value }) : api.meta()])
    data.value = rates.data
    meta.value = m.data
    for (const l of rates.data.locations) {
      edits[l.id] = {
        region_code: l.region_code ?? m.data.default_region,
        wage_classification: l.wage_classification ?? 'non_agriculture',
      }
    }
  } catch (err) {
    loadError.value = wageApiError(err, 'Unable to load regional rates.').message
  } finally {
    loading.value = false
  }
}

onMounted(load)

const changed = (l: RegionalRates['locations'][number]) =>
  edits[l.id] && (edits[l.id]!.region_code !== l.region_code || edits[l.id]!.wage_classification !== l.wage_classification)

const saveLocation = async (l: RegionalRates['locations'][number]) => {
  const values = edits[l.id]
  if (!values) return
  savingId.value = l.id
  try {
    await api.updateLocation(l.id, values)
    success('Location updated', `${l.name} now follows ${values.region_code}.`)
    await load()
  } catch (err) {
    toastError('Unable to update location', wageApiError(err, 'Please try again.').message)
  } finally {
    savingId.value = null
  }
}
</script>

<template>
  <section class="rates-page">
    <button type="button" class="back-link" @click="router.push('/admin/settings/compensation/wage-orders')">
      <ArrowLeft :size="14" /> Back to Wage Orders
    </button>

    <PageHeader
      title="Regional Rates"
      :description="data ? `Minimum daily wage in force as of ${wageDate(data.as_of)}, from published wage orders.` : 'Minimum daily wage per region and classification.'"
    >
      <AppButton variant="secondary" :icon="Landmark" @click="router.push('/admin/settings/compensation/wage-orders')">Wage Orders</AppButton>
    </PageHeader>

    <div v-if="loading && !data" class="state">Loading regional rates...</div>
    <div v-else-if="loadError" class="state">
      <strong>Unable to load regional rates</strong>
      <span>{{ loadError }}</span>
      <AppButton variant="secondary" @click="load">Retry</AppButton>
    </div>

    <template v-else-if="data">
      <!-- CURRENT RATES -->
      <section class="panel">
        <header class="panel-header">
          <h2>Current Minimum Wage</h2>
          <p>From published wage orders only.</p>
        </header>

        <div v-if="!data.rates.length" class="empty">
          No published wage orders yet. Add and publish your region’s wage order to see the rates here.
        </div>

        <div v-else class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th scope="col">Region</th>
                <th scope="col">Classification</th>
                <th scope="col">Minimum daily wage</th>
                <th scope="col">Since</th>
                <th scope="col">Wage order</th>
                <th scope="col">Upcoming</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in data.rates" :key="`${r.region_code}-${r.classification}`">
                <td><strong>{{ r.region_code }}</strong><small>{{ r.region_name }}</small></td>
                <td>{{ r.classification_name }}</td>
                <td><strong class="good">{{ r.current ? peso(r.current.daily_rate) : 'Not yet effective' }}</strong></td>
                <td>{{ wageDate(r.current?.effective_date) }}</td>
                <td>
                  <button v-if="r.current" type="button" class="link" @click="router.push(`/admin/settings/compensation/wage-orders/${r.current.wage_order_id}`)">
                    {{ r.current.order_no }}
                  </button>
                  <span v-else>—</span>
                </td>
                <td>
                  <template v-if="r.next">
                    <strong>{{ peso(r.next.daily_rate) }}</strong>
                    <small>on {{ wageDate(r.next.effective_date) }} · {{ r.next.order_no }}</small>
                  </template>
                  <span v-else class="muted">None scheduled</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- LOCATIONS -->
      <section class="panel">
        <header class="panel-header">
          <h2>Work Locations</h2>
          <p>Which region and classification each location follows. Employees use the minimum of their work location.</p>
        </header>

        <div v-if="!data.locations.length" class="empty">No work locations yet. Add them in Company Settings.</div>

        <div v-else class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th scope="col">Location</th>
                <th scope="col">Employees</th>
                <th scope="col">Region</th>
                <th scope="col">Classification</th>
                <th scope="col">Minimum now</th>
                <th scope="col"><span class="sr-only">Save</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="l in data.locations" :key="l.id">
                <td>
                  <strong>{{ l.name }}</strong>
                  <small>{{ [l.city, l.province].filter(Boolean).join(', ') }}<template v-if="!l.active"> · Inactive</template></small>
                </td>
                <td>{{ l.employees }}</td>
                <td>
                  <select v-if="edits[l.id] && meta" v-model="edits[l.id]!.region_code" :aria-label="`Region of ${l.name}`">
                    <option v-for="r in meta.regions" :key="r.code" :value="r.code">{{ r.name }}</option>
                  </select>
                </td>
                <td>
                  <select v-if="edits[l.id] && meta" v-model="edits[l.id]!.wage_classification" :aria-label="`Classification of ${l.name}`">
                    <option v-for="c in meta.classifications" :key="c.key" :value="c.key">{{ c.name }}</option>
                  </select>
                </td>
                <td>
                  <strong v-if="l.minimum_daily !== null" class="good">{{ peso(l.minimum_daily) }}</strong>
                  <span v-else class="muted">No rate yet</span>
                  <small v-if="l.minimum_order_no">{{ l.minimum_order_no }}</small>
                </td>
                <td>
                  <AppButton v-if="changed(l)" size="sm" :icon="Save" :disabled="savingId === l.id" @click="saveLocation(l)">
                    {{ savingId === l.id ? 'Saving...' : 'Save' }}
                  </AppButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </section>
</template>

<style scoped>
.rates-page { width: 100%; max-width: 1500px; margin: 0 auto; display: grid; gap: 14px; }
.back-link { display: inline-flex; width: fit-content; align-items: center; gap: 6px; padding: 0; border: 0; background: transparent; color: var(--primary); font-family: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
.back-link:focus-visible, .link:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }

.state { display: flex; min-height: 220px; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); color: var(--text-muted); font-size: 13px; }
.state strong { color: var(--text-primary); font-size: 15px; }

.panel { overflow: hidden; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
.panel-header { padding: 16px 18px; border-bottom: 1px solid var(--border-soft); }
.panel-header h2 { margin: 0; font-size: 16px; }
.panel-header p { margin: 3px 0 0; color: var(--text-secondary); font-size: 12px; }
.empty { padding: 26px 18px; color: var(--text-muted); font-size: 13px; text-align: center; }

.table-wrap { overflow-x: auto; }
.table { width: 100%; min-width: 950px; border-collapse: collapse; font-size: 13px; }
.table th { padding: 10px 16px; color: var(--text-secondary); font-size: 11px; font-weight: 700; text-align: left; text-transform: uppercase; letter-spacing: 0.05em; }
.table td { padding: 12px 16px; border-top: 1px solid var(--border-soft); color: var(--text-secondary); vertical-align: middle; }
.table td strong { color: var(--text-primary); }
.table td small { display: block; margin-top: 3px; color: var(--text-muted); font-size: 11px; }
.good { color: var(--green) !important; }
.muted { color: var(--text-muted); }

.link { padding: 0; border: 0; background: transparent; color: var(--primary); font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }

.table select { min-width: 200px; height: 36px; padding: 0 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); color: var(--text-primary); font-family: inherit; font-size: 12px; }
.table select:focus-visible { border-color: var(--primary); outline: none; }

.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
</style>