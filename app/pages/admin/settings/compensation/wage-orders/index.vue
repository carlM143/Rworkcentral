<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { CalendarClock, ChevronDown, FileText, Landmark, MapPinned, Plus, Scale, Search } from 'lucide-vue-next'
import DriverStatCard from '~/components/admin/drivers/DriverStatCard.vue'
import {
  WAGE_STATUS_LABELS,
  peso,
  useWageOrders,
  wageApiError,
  wageDate,
  type WageMeta,
  type WageOrderSummary,
} from '~/composables/admin/compensation/useWageOrders'

definePageMeta({
  layout: 'admin',
})

const router = useRouter()
const api = useWageOrders()

const orders = ref<WageOrderSummary[]>([])
const stats = ref({ total: 0, active: 0, scheduled: 0, regions: 0 })
const meta = ref<WageMeta | null>(null)
const loading = ref(true)
const loadError = ref('')

const search = ref('')
const region = ref('')
const status = ref('')

let requestId = 0
const load = async () => {
  const id = ++requestId
  loading.value = true
  loadError.value = ''
  try {
    const response = await api.list({ search: search.value.trim(), region: region.value, status: status.value })
    if (id !== requestId) return
    orders.value = response.data
    stats.value = response.stats
  } catch (err) {
    if (id === requestId) loadError.value = wageApiError(err, 'Unable to load wage orders.').message
  } finally {
    if (id === requestId) loading.value = false
  }
}

onMounted(async () => {
  try {
    meta.value = (await api.meta()).data
  } catch {
    // Filters fall back to the regions present in the list.
  }
  await load()
})

let timer: ReturnType<typeof setTimeout> | undefined
watch(search, () => {
  clearTimeout(timer)
  timer = setTimeout(load, 350)
})
watch([region, status], load)

const reset = () => {
  search.value = ''
  region.value = ''
  status.value = ''
}

const open = (order: WageOrderSummary) => router.push(`/admin/settings/compensation/wage-orders/${order.id}`)

const regionOptions = computed(() => meta.value?.regions ?? [])
</script>

<template>
  <section class="wage-page">
    <PageHeader
      title="Wage Orders"
      description="Regional minimum wage orders (RTWPB): new minimum per classification, effective date, and the employees it was applied to."
    >
      <AppButton variant="secondary" :icon="MapPinned" @click="router.push('/admin/settings/compensation/regional-rates')">
        Regional Rates
      </AppButton>
      <AppButton :icon="Plus" @click="router.push('/admin/settings/compensation/wage-orders/new')">
        Add Wage Order
      </AppButton>
    </PageHeader>

    <section class="stats-grid">
      <DriverStatCard label="Wage Orders" :value="stats.total" description="All recorded orders" accent="blue" :icon="Landmark" />
      <DriverStatCard label="Active" :value="stats.active" description="Rates in force now" accent="green" :icon="Scale" />
      <DriverStatCard label="Scheduled" :value="stats.scheduled" description="Take effect later" accent="orange" :icon="CalendarClock" />
      <DriverStatCard label="Regions Covered" :value="stats.regions" description="With active or scheduled rates" accent="purple" :icon="MapPinned" />
    </section>

    <div class="filters-row">
      <div class="search-box">
        <Search :size="15" />
        <input v-model="search" type="text" placeholder="Search wage order no., title, region or classification..." aria-label="Search wage orders">
      </div>
      <div class="select-wrap">
        <select v-model="region" aria-label="Region">
          <option value="">All Regions</option>
          <option v-for="r in regionOptions" :key="r.code" :value="r.code">{{ r.name }}</option>
        </select>
        <ChevronDown :size="14" class="select-icon" />
      </div>
      <div class="select-wrap">
        <select v-model="status" aria-label="Status">
          <option value="">All Status</option>
          <option v-for="(label, value) in WAGE_STATUS_LABELS" :key="value" :value="value">{{ label }}</option>
        </select>
        <ChevronDown :size="14" class="select-icon" />
      </div>
      <button type="button" class="reset-btn" @click="reset">Reset</button>
    </div>

    <p v-if="loadError" class="load-error" role="alert">{{ loadError }} <button type="button" @click="load">Retry</button></p>

    <section class="list-card">
      <header class="list-header">
        <h2>Government Wage Orders</h2>
        <p>Click a wage order to see its rates and apply it to employees.</p>
      </header>

      <div v-if="loading && !orders.length" class="list-state">Loading wage orders...</div>
      <div v-else-if="!orders.length" class="list-state">
        <strong>No wage orders yet</strong>
        <span>Add the current wage order of your region (Region XI – Davao Region) to start.</span>
        <AppButton :icon="Plus" @click="router.push('/admin/settings/compensation/wage-orders/new')">Add Wage Order</AppButton>
      </div>

      <div v-else class="table-wrap" :class="{ dimmed: loading }">
        <table class="table">
          <thead>
            <tr>
              <th scope="col">Wage Order</th>
              <th scope="col">Region</th>
              <th scope="col">Classifications</th>
              <th scope="col">Previous</th>
              <th scope="col">New Minimum</th>
              <th scope="col">Increase</th>
              <th scope="col">Effective</th>
              <th scope="col">Applied to</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in orders" :key="o.id" tabindex="0" @click="open(o)" @keydown.enter="open(o)">
              <td>
                <strong class="link">{{ o.order_no }}</strong>
                <small>{{ o.title }}</small>
              </td>
              <td>{{ o.region_code }}</td>
              <td class="classes">{{ o.classification_names.join(', ') || '—' }}</td>
              <td>{{ peso(o.headline?.previous_rate) }}</td>
              <td><strong class="good">{{ peso(o.headline?.new_rate) }}</strong></td>
              <td class="good">{{ o.headline?.increase !== null && o.headline?.increase !== undefined ? `+${peso(o.headline.increase)}` : '—' }}</td>
              <td>
                {{ wageDate(o.effective_date) }}
                <FileText v-if="o.has_document" :size="13" class="doc-icon" aria-label="Has document" />
              </td>
              <td>{{ o.adjustments_created ? `${o.adjustments_created} employee${o.adjustments_created === 1 ? '' : 's'}` : '—' }}</td>
              <td><span class="status" :class="o.display_status">{{ WAGE_STATUS_LABELS[o.display_status] }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </section>
</template>

<style scoped>
.wage-page { width: 100%; max-width: 1660px; margin: 0 auto; }
.stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin: 18px 0 14px; }

.filters-row { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-bottom: 18px; padding: 12px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
.search-box { display: flex; flex: 1; min-width: 240px; height: 40px; align-items: center; gap: 8px; padding: 0 12px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-card-soft); color: var(--text-muted); }
.search-box input { width: 100%; border: 0; background: transparent; color: var(--text-primary); font-family: inherit; font-size: 12px; outline: none; }
.select-wrap { position: relative; min-width: 190px; }
.select-wrap select { width: 100%; height: 40px; padding: 0 34px 0 12px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-card-soft); color: var(--text-primary); font-family: inherit; font-size: 12px; appearance: none; }
.select-icon { position: absolute; top: 50%; right: 10px; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
.reset-btn { height: 40px; padding: 0 14px; border: 1px solid var(--border); border-radius: 9px; background: transparent; color: var(--text-primary); font-family: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
.search-box:focus-within, .select-wrap select:focus-visible { border-color: var(--primary); outline: none; }
.reset-btn:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }

.load-error { margin: 0 0 14px; padding: 10px 12px; border-radius: 9px; background: var(--red-soft); color: var(--red); font-size: 13px; }
.load-error button { margin-left: 8px; border: 0; background: transparent; color: var(--primary); font-family: inherit; cursor: pointer; }

.list-card { overflow: hidden; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
.list-header { padding: 16px 18px; border-bottom: 1px solid var(--border-soft); }
.list-header h2 { margin: 0; font-size: 16px; }
.list-header p { margin: 3px 0 0; color: var(--text-secondary); font-size: 12px; }
.list-state { display: flex; min-height: 220px; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: var(--text-muted); font-size: 13px; text-align: center; }
.list-state strong { color: var(--text-primary); font-size: 15px; }
.dimmed { opacity: 0.6; }

.table-wrap { overflow-x: auto; }
.table { width: 100%; min-width: 1100px; border-collapse: collapse; font-size: 13px; }
.table th { padding: 12px 14px; color: var(--text-secondary); font-size: 11px; font-weight: 700; text-align: left; text-transform: uppercase; letter-spacing: 0.05em; }
.table td { padding: 13px 14px; border-top: 1px solid var(--border-soft); color: var(--text-secondary); vertical-align: middle; }
.table tbody tr { cursor: pointer; }
.table tbody tr:hover { background: var(--bg-card-soft); }
.table tbody tr:focus-visible { outline: 2px solid var(--primary); outline-offset: -2px; }
.table td small { display: block; margin-top: 3px; color: var(--text-muted); font-size: 11px; }
.link { color: var(--primary); }
.good { color: var(--green); }
.classes { max-width: 220px; }
.doc-icon { margin-left: 6px; vertical-align: -2px; color: var(--text-muted); }

.status { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; background: var(--bg-card-soft); color: var(--text-secondary); }
.status.active { background: var(--green-soft); color: var(--green); }
.status.scheduled { background: var(--purple-soft); color: var(--purple); }
.status.draft { background: var(--orange-soft); color: var(--orange); }
.status.cancelled { background: var(--red-soft); color: var(--red); }

@media (max-width: 1000px) { .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
