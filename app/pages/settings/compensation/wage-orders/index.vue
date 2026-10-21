
<script setup lang="ts">
import {
  CalendarDays,
  CirclePlus,
  Landmark,
  RefreshCcw,
  Scale,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-vue-next'

import WageOrderModal from '~/components/settings/compensation/wage-orders/WageOrderModal.vue'
import WageOrderActions from '~/components/settings/compensation/wage-orders/WageOrderActions.vue'

import type {
  WageOrder,
} from '~/types/wageManagement'

type ModalMode = 'create' | 'view' | 'edit'
type WageOrderPayload = Omit<WageOrder, 'id' | 'increaseAmount'>

const { wageOrders, wageAdjustments } = useWageManagement()
const { info, success, warning } = useToast()
const router = useRouter()

/* =========================================
   FILTERS
========================================= */

const search = ref('')
const region = ref('')
const status = ref('')

const regionOptions = computed(() => [
  ...new Set(wageOrders.value.map(item => item.region)),
])

const statusOptions = [
  'Draft',
  'Scheduled',
  'Active',
  'Superseded',
]

const filteredOrders = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  return wageOrders.value.filter(item => {
    const matchesSearch =
      !keyword ||
      [
        item.code,
        item.title,
        item.classification,
        item.region,
        item.tranche,
      ].some(value => value.toLowerCase().includes(keyword))

    return (
      matchesSearch &&
      (!region.value || item.region === region.value) &&
      (!status.value || item.status === status.value)
    )
  })
})

const resetFilters = () => {
  search.value = ''
  region.value = ''
  status.value = ''
  currentPage.value = 1
}

/* =========================================
   STATS
========================================= */

const activeCount = computed(() =>
  wageOrders.value.filter(item => item.status === 'Active').length,
)

const scheduledCount = computed(() =>
  wageOrders.value.filter(item => item.status === 'Scheduled').length,
)

const affectedRegions = computed(() =>
  new Set(wageOrders.value.map(item => item.region)).size,
)

/* =========================================
   PAGINATION
========================================= */

const currentPage = ref(1)
const perPage = 6

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredOrders.value.length / perPage)),
)

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredOrders.value.slice(start, start + perPage)
})

const showingFrom = computed(() =>
  filteredOrders.value.length === 0
    ? 0
    : (currentPage.value - 1) * perPage + 1,
)

const showingTo = computed(() =>
  Math.min(currentPage.value * perPage, filteredOrders.value.length),
)

watch([search, region, status], () => {
  currentPage.value = 1
})

watch(totalPages, pages => {
  if (currentPage.value > pages) currentPage.value = pages
})

/* =========================================
   FORMATTERS
========================================= */

const money = (value: number) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(value)

const formatDate = (value: string) => {
  if (!value) return '—'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

/* =========================================
   MODAL STATE
========================================= */

const modalOpen = ref(false)
const modalMode = ref<ModalMode>('create')
const selectedOrder = ref<WageOrder | null>(null)

const deleteOpen = ref(false)
const deletingOrder = ref<WageOrder | null>(null)

const orderCodes = computed(() =>
  wageOrders.value.map(item => item.code),
)

/* =========================================
   CREATE / VIEW / EDIT
========================================= */

const handleNewOrder = () => {
  selectedOrder.value = null
  modalMode.value = 'create'
  modalOpen.value = true
}

const handleView = (item: WageOrder) => {
  selectedOrder.value = item
  modalMode.value = 'view'
  modalOpen.value = true
}

const handleEdit = (item: WageOrder) => {
  selectedOrder.value = item
  modalMode.value = 'edit'
  modalOpen.value = true
}

const handleCloseModal = () => {
  modalOpen.value = false
  selectedOrder.value = null
}

/* =========================================
   SAVE
========================================= */

const handleSave = (payload: WageOrderPayload) => {
  const increaseAmount = Number(
    (
      payload.newMinimumRate -
      payload.oldMinimumRate
    ).toFixed(2),
  )

  const duplicate = wageOrders.value.some(
    item =>
      item.code.toLowerCase() === payload.code.toLowerCase() &&
      item.id !== selectedOrder.value?.id,
  )

  if (duplicate) {
    warning(
      'Duplicate Wage Order',
      'A wage order with this number already exists.',
    )
    return
  }

  if (modalMode.value === 'create') {
    const nextId =
      Math.max(0, ...wageOrders.value.map(item => item.id)) + 1

    wageOrders.value = [
      ...wageOrders.value,
      {
        id: nextId,
        ...payload,
        increaseAmount,
      },
    ]

    success(
      'Wage Order Added',
      `${payload.code} has been added successfully.`,
    )
  } else if (modalMode.value === 'edit' && selectedOrder.value) {
    const id = selectedOrder.value.id
    const originalCode = selectedOrder.value.code

    const hasLinkedAdjustments = wageAdjustments.value.some(
      item => item.wageOrderCode === originalCode,
    )

    if (
      hasLinkedAdjustments &&
      (
        payload.code !== selectedOrder.value.code ||
        payload.region !== selectedOrder.value.region ||
        payload.classification !== selectedOrder.value.classification ||
        payload.newMinimumRate !== selectedOrder.value.newMinimumRate ||
        payload.effectiveDate !== selectedOrder.value.effectiveDate
      )
    ) {
      warning(
        'Linked Wage Adjustments',
        'This wage order has linked employee adjustments. Key wage order details cannot be changed in this preview. Review the affected adjustments first.',
      )
      return
    }

    wageOrders.value = wageOrders.value.map(item =>
      item.id === id
        ? {
            ...item,
            ...payload,
            increaseAmount,
          }
        : item,
    )

    success(
      'Wage Order Updated',
      `${payload.code} has been updated successfully.`,
    )
  }

  handleCloseModal()
}

/* =========================================
   DELETE
========================================= */

const handleDelete = (item: WageOrder) => {
  deletingOrder.value = item
  deleteOpen.value = true
}

const closeDelete = () => {
  deleteOpen.value = false
  deletingOrder.value = null
}

const confirmDelete = () => {
  const item = deletingOrder.value
  if (!item) return

  const linked = wageAdjustments.value.some(
    adjustment => adjustment.wageOrderCode === item.code,
  )

  if (linked) {
    warning(
      'Cannot Delete Wage Order',
      'This wage order is referenced by employee wage adjustments. Remove or reconcile those references before deleting.',
    )
    closeDelete()
    return
  }

  if (item.status === 'Active' || item.status === 'Superseded') {
    warning(
      'Cannot Delete Wage Order',
      'Active and superseded wage orders should be retained for historical reference.',
    )
    closeDelete()
    return
  }

  wageOrders.value = wageOrders.value.filter(
    order => order.id !== item.id,
  )

  success(
    'Wage Order Deleted',
    `${item.code} has been deleted.`,
  )

  closeDelete()
}

/* =========================================
   EVALUATE EMPLOYEES
========================================= */

const handleEvaluate = (item: WageOrder) => {
  info(
    'Evaluate Employees',
    `Opening wage adjustments for ${item.code}.`,
  )

  router.push({
    path: '/payroll/wage-adjustments',
    query: {
      wageOrder: item.code,
    },
  })
}
</script>

<template>
  <section class="wage-orders-page">

    <!-- HEADER -->

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

    <!-- STATS -->

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

    <!-- FILTERS -->

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

    <!-- TABLE -->

    <article class="table-card">
      <div class="table-head">
        <div>
          <h3>Government Wage Orders</h3>
          <p>
            Manage regional minimum wage rates,
            classifications and effective dates.
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
              <th class="actions-heading">Actions</th>
            </tr>
          </thead>

          <tbody>
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
                <strong>{{ item.region }}</strong>
              </td>

              <td>{{ item.classification }}</td>

              <td>{{ money(item.oldMinimumRate) }}</td>

              <td>
                <strong class="new-rate">
                  {{ money(item.newMinimumRate) }}
                </strong>
              </td>

              <td>
                <span class="increase">
                  {{ item.increaseAmount >= 0 ? '+' : '' }}
                  {{ money(item.increaseAmount) }}
                </span>
              </td>

              <td>{{ formatDate(item.effectiveDate) }}</td>

              <td>{{ item.tranche }}</td>

              <td>{{ item.source }}</td>

              <td>
                <span
                  class="status-badge"
                  :class="item.status.toLowerCase()"
                >
                  {{ item.status }}
                </span>
              </td>

              <td class="actions-cell">
                <WageOrderActions
                  :order="item"
                  @view="handleView"
                  @edit="handleEdit"
                  @evaluate="handleEvaluate"
                  @delete="handleDelete"
                />
              </td>
            </tr>

            <tr v-if="!paginatedOrders.length">
              <td colspan="11" class="empty-state">
                No wage orders found. Try changing your filters
                or add a new wage order.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <!-- PAGINATION -->

    <div class="table-footer">
      <p>
        Showing
        <strong>{{ showingFrom }}–{{ showingTo }}</strong>
        of
        <strong>{{ filteredOrders.length }}</strong>
        wage orders
      </p>

      <div class="pagination-buttons">
        <button
          type="button"
          :disabled="currentPage <= 1"
          aria-label="Previous page"
          @click="currentPage--"
        >
          <ChevronLeft :size="15" />
        </button>

        <button
          v-for="page in totalPages"
          :key="page"
          type="button"
          :class="{ active: currentPage === page }"
          @click="currentPage = page"
        >
          {{ page }}
        </button>

        <button
          type="button"
          :disabled="currentPage >= totalPages"
          aria-label="Next page"
          @click="currentPage++"
        >
          <ChevronRight :size="15" />
        </button>
      </div>
    </div>

    <!-- CREATE / VIEW / EDIT MODAL -->

    <WageOrderModal
      :open="modalOpen"
      :mode="modalMode"
      :order="selectedOrder"
      :existing-codes="orderCodes"
      @close="handleCloseModal"
      @save="handleSave"
    />

    <!-- DELETE CONFIRMATION -->

    <Teleport to="body">
      <div
        v-if="deleteOpen"
        class="delete-overlay"
        @click.self="closeDelete"
      >
        <div
          class="delete-dialog"
          role="dialog"
          aria-modal="true"
          aria-label="Delete Wage Order"
        >
          <div class="delete-heading">
            <span class="delete-icon">
              <Trash2 :size="18" />
            </span>

            <div>
              <h3>Delete Wage Order</h3>
              <p>Confirm wage order removal</p>
            </div>

            <button
              type="button"
              class="dialog-close"
              aria-label="Close"
              @click="closeDelete"
            >
              <X :size="17" />
            </button>
          </div>

          <div class="delete-body">
            <p>
              Are you sure you want to delete
              <strong>{{ deletingOrder?.code }}</strong>?
            </p>

            <small>
              Wage orders linked to employee adjustments or retained
              as active/historical orders cannot be deleted.
            </small>
          </div>

          <div class="delete-footer">
            <button
              type="button"
              class="cancel-button"
              @click="closeDelete"
            >
              Cancel
            </button>

            <button
              type="button"
              class="confirm-delete"
              @click="confirmDelete"
            >
              <Trash2 :size="14" />
              Delete Wage Order
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </section>
</template>

<style scoped>
.wage-orders-page {
  width: 100%;
  max-width: 1680px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 14px;
}

.filter-card,
.table-card {
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.filter-card {
  padding: 12px;
  margin-bottom: 14px;
}

.filter-grid {
  display: grid;
  grid-template-columns:
    minmax(300px, 1fr) 220px 200px auto;
  gap: 9px;
}

.table-card {
  overflow: hidden;
}

.table-head {
  padding: 15px 17px;
  border-bottom: 1px solid var(--border-soft);
}

.table-head h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 700;
}

.table-head p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.table-scroll {
  overflow-x: auto;
  width: 100%;
}

table {
  width: 100%;
  min-width: 1400px;
  border-collapse: collapse;
}

th {
  padding: 12px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 9px;
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
}

td {
  padding: 13px 12px;
  border-top: 1px solid var(--border-soft);
  color: var(--text-secondary);
  font-size: 10px;
  vertical-align: middle;
}

tbody tr:hover {
  background: var(--bg-card-soft);
}

.primary {
  display: block;
  color: var(--primary);
  font-weight: 700;
  white-space: nowrap;
}

.secondary {
  display: block;
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 9px;
}

.new-rate,
.increase {
  color: var(--green);
  font-weight: 700;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 5px 9px;
  border-radius: 20px;
  font-size: 9px;
  font-weight: 700;
  white-space: nowrap;
}

.status-badge.active {
  background: var(--green-soft);
  color: var(--green);
}

.status-badge.scheduled {
  background: var(--purple-soft);
  color: var(--purple);
}

.status-badge.draft {
  background: var(--orange-soft);
  color: var(--orange);
}

.status-badge.superseded {
  background: var(--bg-card-soft);
  color: var(--text-muted);
}

.actions-heading,
.actions-cell {
  width: 80px;
  text-align: center;
}

.empty-state {
  padding: 40px 15px;
  text-align: center;
  color: var(--text-muted);
  font-size: 11px;
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 14px 3px 0;
}

.table-footer p {
  margin: 0;
  color: var(--text-muted);
  font-size: 10px;
}

.table-footer strong {
  color: var(--text-primary);
  font-weight: 650;
}

.pagination-buttons {
  display: flex;
  align-items: center;
  gap: 5px;
}

.pagination-buttons button {
  display: inline-flex;
  min-width: 29px;
  height: 29px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 10px;
  cursor: pointer;
}

.pagination-buttons button.active {
  border-color: var(--primary);
  background: var(--primary);
  color: white;
}

.pagination-buttons button:disabled {
  opacity: .35;
  cursor: not-allowed;
}

.delete-overlay {
  position: fixed;
  inset: 0;
  z-index: 10050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgba(2,9,22,.76);
  backdrop-filter: blur(5px);
}

.delete-dialog {
  width: 100%;
  max-width: 440px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  color: var(--text-primary);
  box-shadow: 0 24px 65px rgba(0,0,0,.3);
}

.delete-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  border-bottom: 1px solid var(--border);
}

.delete-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--red-soft);
  color: var(--red);
}

.delete-heading > div {
  flex: 1;
}

.delete-heading h3 {
  margin: 0;
  font-size: 13px;
}

.delete-heading p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.dialog-close {
  border: 0;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.delete-body {
  padding: 18px;
}

.delete-body p {
  margin: 0 0 10px;
  font-size: 12px;
  line-height: 1.6;
}

.delete-body small {
  color: var(--text-muted);
  font-size: 10px;
  line-height: 1.5;
}

.delete-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px;
  border-top: 1px solid var(--border);
}

.cancel-button,
.confirm-delete {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 35px;
  padding: 0 13px;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.cancel-button {
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-primary);
}

.confirm-delete {
  border: 0;
  background: var(--red);
  color: white;
}

@media (max-width: 1100px) {
  .stats-grid,
  .filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 650px) {
  .stats-grid,
  .filter-grid {
    grid-template-columns: 1fr;
  }

  .table-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
