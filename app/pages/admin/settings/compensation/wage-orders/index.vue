<script setup lang="ts">
import type { WageOrder } from '~/types/wageManagement'
import { wageToday } from '~/utils/wageWorkflow'
import {
  CalendarDays,
  CirclePlus,
  Landmark,
  RefreshCcw,
  Scale,
} from 'lucide-vue-next'

const workflow = useWageWorkflow()
const { wageOrders } = workflow
const router = useRouter()



const search = ref('')
const region = ref('')
const status = ref('')

const regionOptions =
  computed(() => [
    ...new Set(
      wageOrders.value.map(
        item => item.region,
      ),
    ),
  ])

const statusOptions = [
  'Draft',
  'Scheduled',
  'Active',
  'Superseded',
]

const filteredOrders =
  computed(() => {
    const keyword =
      search.value
        .trim()
        .toLowerCase()

    return wageOrders.value.filter(
      item => {
        const matchesSearch =
          !keyword ||
          item.code
            .toLowerCase()
            .includes(keyword) ||
          item.title
            .toLowerCase()
            .includes(keyword) ||
          item.classification
            .toLowerCase()
            .includes(keyword)

        const matchesRegion =
          !region.value ||
          item.region ===
            region.value

        const matchesStatus =
          !status.value ||
          item.status ===
            status.value

        return (
          matchesSearch &&
          matchesRegion &&
          matchesStatus
        )
      },
    )
  })

const activeCount =
  computed(
    () =>
      wageOrders.value.filter(
        item =>
          item.status ===
          'Active',
      ).length,
  )

const scheduledCount =
  computed(
    () =>
      wageOrders.value.filter(
        item =>
          item.status ===
          'Scheduled',
      ).length,
  )

const affectedRegions =
  computed(
    () =>
      new Set(
        wageOrders.value.map(
          item => item.region,
        ),
      ).size,
  )

const money = (
  value: number,
) => {
  return new Intl.NumberFormat(
    'en-PH',
    {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    },
  ).format(value)
}

const formatDate = (
  value: string,
) => {
  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    },
  ).format(
    new Date(
      `${value}T00:00:00`,
    ),
  )
}

const resetFilters = () => {
  search.value = ''
  region.value = ''
  status.value = ''
}

const dialogOpen = ref(false)
const dialogMode = ref('view')
const selectedOrder = ref<WageOrder | null>(null)
const handleNewOrder = () => { selectedOrder.value = null; dialogMode.value = 'form'; dialogOpen.value = true }
const orderActions = (order: WageOrder) => [
  { key: 'view', label: 'View Details' },
  { key: 'form', label: 'Edit Order', disabled: !workflow.orderEditable(order), reason: 'Only unused draft or scheduled orders can be edited.' },
  { key: 'affected', label: 'View Affected Employees' },
  { key: 'publish', label: order.effectiveDate > wageToday() ? 'Schedule Order' : 'Activate Order', disabled: !['Draft', 'Scheduled'].includes(order.status) || (order.status === 'Scheduled' && order.effectiveDate > wageToday()), reason: 'Available for drafts or scheduled orders that are due.' },
  { key: 'supersede', label: 'Supersede Order', disabled: order.status !== 'Active', reason: 'Only active orders can be superseded.' },
  { key: 'history', label: 'View History' },
]
const handleActions = (key: string, order: WageOrder) => {
  if (key === 'affected') { router.push('/admin/payroll/wage-adjustments?order=' + encodeURIComponent(order.code)); return }
  selectedOrder.value = order; dialogMode.value = key; dialogOpen.value = true
}
const currentPage = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(filteredOrders.value.length / 10)))
const paginatedOrders = computed(() => filteredOrders.value.slice((currentPage.value - 1) * 10, currentPage.value * 10))
watch([search, region, status], () => { currentPage.value = 1 })
watch(totalPages, value => { currentPage.value = Math.min(currentPage.value, value) })
</script>

<template>
  <section class="page">
    <p class="demo-notice">Sample wage configuration · Daily rates in PHP · Changes are retained for this session.</p>

    <PageHeader
      title="Wage Orders"
      description="Configure government-mandated minimum wage orders, regional rates, tranches and effective dates."
    >

      <AppButton
        :icon="CirclePlus"
        @click="handleNewOrder"
      >
        Add Wage Order
      </AppButton>

    </PageHeader>

    <div class="stats-grid">

      <StatCard
        label="Wage Orders"
        :value="wageOrders.length"
        description="Configured wage orders"
        :icon="Landmark"
        tone="blue"
      />

      <StatCard
        label="Active"
        :value="activeCount"
        description="Currently effective orders"
        :icon="Scale"
        tone="green"
      />

      <StatCard
        label="Scheduled"
        :value="scheduledCount"
        description="Future effective tranches"
        :icon="CalendarDays"
        tone="orange"
      />

      <StatCard
        label="Regions Covered"
        :value="affectedRegions"
        description="Regions with configured rates"
        :icon="Landmark"
        tone="purple"
      />

    </div>

    <article class="filter-card">

      <div class="filter-grid">

        <AppInput
          v-model="search"
          searchable
          placeholder="Search wage order or classification..."
        />

        <AppSelect
          v-model="region"
          :options="regionOptions"
          placeholder="All Regions"
        />

        <AppSelect
          v-model="status"
          :options="statusOptions"
          placeholder="All Status"
        />

        <AppButton
          variant="secondary"
          :icon="RefreshCcw"
          @click="resetFilters"
        >
          Reset
        </AppButton>

      </div>

    </article>

    <article class="table-card">

      <div class="table-head">
        <div>
          <h3>
            Government Wage Orders
          </h3>

          <p>
            Frontend preview of regional minimum wage configuration.
          </p>
        </div>
      </div>

      <div class="table-scroll">

        <table>

          <thead>
            <tr>
              <th>Wage Order</th>
              <th>Region</th>
              <th>Classification</th>
              <th>Previous Rate</th>
              <th>New Minimum</th>
              <th>Increase</th>
              <th>Effective Date</th>
              <th>Tranche</th>
              <th>Source</th>
              <th>Status</th>
              <th class="action-cell">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="!filteredOrders.length"><td colspan="11">No wage orders match your filters.</td></tr>

            <tr
              v-for="item in paginatedOrders"
              :key="item.id"
            >

              <td>
                <strong class="primary">
                  {{ item.code }}
                </strong>

                <span class="secondary">
                  {{ item.title }}
                </span>
              </td>

              <td>
                <strong>
                  {{ item.region }}
                </strong>
              </td>

              <td>
                {{ item.classification }}
              </td>

              <td>
                {{ money(item.oldMinimumRate) }}
              </td>

              <td>
                <strong class="new-rate">
                  {{ money(item.newMinimumRate) }}
                </strong>
              </td>

              <td>
                <span class="increase">
                  +{{ money(item.increaseAmount) }}
                </span>
              </td>

              <td>
                {{ formatDate(item.effectiveDate) }}
              </td>

              <td>
                {{ item.tranche }}
              </td>

              <td>
                {{ item.source }}
              </td>

              <td>
                <span
                  class="badge"
                  :class="item.status.toLowerCase()"
                >
                  {{ item.status }}
                </span>
              </td>

              <td class="action-cell"><WageActionMenu :label="'Actions for ' + item.code" :items="orderActions(item)" @select="key => handleActions(key, item)" /></td>

            </tr>

          </tbody>

        </table>

      </div>

    </article>

    <div class="wage-footer"><p>{{ filteredOrders.length }} wage orders</p><AppPagination v-model="currentPage" :total-pages="totalPages" /></div>
    <WageOrderDialog :open="dialogOpen" :mode="dialogMode" :order="selectedOrder" @close="dialogOpen = false" />
  </section>
</template>

<style scoped>
.demo-notice, .wage-footer { font-size: 12px; color: var(--text-muted); }
.wage-footer { display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:14px; }
.action-cell { position: sticky; right: 0; background: var(--bg-card); box-shadow: -5px 0 8px #0001; text-align:center; min-width:76px; }
th.action-cell { background: var(--bg-card-soft); }

.page {
  width: 100%;
  max-width: 1680px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 14px;
}

.filter-card,
.table-card {
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
}

.filter-card {
  padding: 12px;
  margin-bottom: 14px;
}

.filter-grid {
  display: grid;
  grid-template-columns:
    minmax(300px, 1fr)
    220px
    200px
    auto;
  gap: 9px;
}

.table-card {
  overflow: hidden;
}

.table-head {
  padding: 15px 17px;
}

.table-head h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 14px;
}

.table-head p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 1500px;
  border-collapse: collapse;
}

th {
  padding: 11px 12px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 9px;
  text-align: left;
  white-space: nowrap;
}

td {
  padding: 12px;
  border-top: 1px solid var(--border-soft);
  color: var(--text-secondary);
  font-size: 10px;
}

.primary,
.new-rate {
  color: var(--text-primary);
}

.primary {
  display: block;
  color: var(--primary);
}

.secondary {
  display: block;
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 9px;
}

.new-rate {
  color: var(--green);
}

.increase {
  color: var(--green);
  font-weight: 700;
}

.badge {
  display: inline-flex;
  padding: 5px 8px;
  border-radius: 20px;
  font-size: 8.5px;
  font-weight: 650;
  white-space: nowrap;
}

.badge.active {
  background: var(--green-soft);
  color: var(--green);
}

.badge.scheduled {
  background: var(--purple-soft);
  color: var(--purple);
}

.badge.draft {
  background: var(--orange-soft);
  color: var(--orange);
}

.badge.superseded {
  background: var(--bg-card-soft);
  color: var(--text-muted);
}

.icon-action {
  display: flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
}

.icon-action:hover {
  background: var(--primary-soft);
  color: var(--primary);
}

@media (max-width: 1100px) {
  .stats-grid,
  .filter-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 650px) {
  .stats-grid,
  .filter-grid {
    grid-template-columns: 1fr;
  }
}
</style>
