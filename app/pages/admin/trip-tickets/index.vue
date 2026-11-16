<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import {
  Ban,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  Gauge,
  LogIn,
  LogOut,
  Pencil,
  Plus,
  Search,
  Truck,
} from 'lucide-vue-next'
import DriverStatCard from '~/components/admin/drivers/DriverStatCard.vue'
import BaseDataTable from '~/components/shared-table/BaseDataTable.vue'
import BaseTableFooter from '~/components/shared-table/BaseTableFooter.vue'
import TableActionMenu from '~/components/shared-table/TableActionMenu.vue'
import TripTicketActionModal from '~/components/admin/drivers/trip-tickets/TripTicketActionModal.vue'
import TripTicketViewModal from '~/components/admin/drivers/trip-tickets/TripTicketViewModal.vue'
import { driverErrorMessage, driverTimeText } from '~/composables/admin/drivers/useDriverApi'
import {
  useTripTicketApi,
  type TripTicketListParams,
  type TripTicketListResponse,
  type TripTicketRecord,
  type TripTicketStatus,
} from '~/composables/admin/drivers/useTripTicketApi'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const router = useRouter()
const api = useTripTicketApi()

const STATUS_LABELS: Record<TripTicketStatus, string> = {
  scheduled: 'Scheduled',
  ongoing: 'Ongoing',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

// =====================================================
// FILTERS (sent to the backend)
// =====================================================

const searchQuery = ref('')
const driverFilter = ref<'All' | number>('All')
const departmentFilter = ref<'All' | number>('All')
const statusFilter = ref<'All' | TripTicketStatus>('All')
const dateFrom = ref('')
const dateTo = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

const params = (overrides: TripTicketListParams = {}): TripTicketListParams => ({
  page: currentPage.value,
  per_page: itemsPerPage,
  search: searchQuery.value.trim(),
  status: statusFilter.value === 'All' ? '' : statusFilter.value,
  driver_id: driverFilter.value === 'All' ? null : driverFilter.value,
  department_id: departmentFilter.value === 'All' ? null : departmentFilter.value,
  date_from: dateFrom.value,
  date_to: dateTo.value,
  ...overrides,
})

// =====================================================
// DATA (one page at a time)
// =====================================================

const tickets = ref<TripTicketRecord[]>([])
const meta = ref<TripTicketListResponse['meta']>({ current_page: 1, last_page: 1, per_page: itemsPerPage, total: 0, from: 0, to: 0 })
const stats = ref<TripTicketListResponse['stats']>({ trips_today: 0, ongoing: 0, completed_today: 0, km_today: 0 })
const filterLists = ref<TripTicketListResponse['filters']>({ drivers: [], departments: [] })
const loading = ref(false)
const flash = ref('')
const loadError = ref('')
let loadRequest = 0

const load = async () => {
  const requestId = ++loadRequest
  loading.value = true
  loadError.value = ''
  try {
    const response = await api.list(params())
    if (requestId !== loadRequest) return // a newer request is on its way
    tickets.value = response.data
    meta.value = response.meta
    stats.value = response.stats
    filterLists.value = response.filters
  } catch (err) {
    if (requestId === loadRequest) loadError.value = driverErrorMessage(err, 'Unable to load trip tickets.')
  } finally {
    if (requestId === loadRequest) loading.value = false
  }
}

onMounted(async () => {
  // Coming back from the Create / Edit page
  const created = route.query.created
  const updated = route.query.updated
  if (typeof created === 'string') flash.value = `Trip ticket ${created} created.`
  if (typeof updated === 'string') flash.value = `Trip ticket ${updated} updated.`

  await load()

  // Opened from another page, e.g. /admin/trip-tickets?trip=TT-2026-0012
  const ticketNo = route.query.trip
  if (typeof ticketNo === 'string') {
    const response = await api.list({ search: ticketNo, per_page: 5 })
    const match = response.data.find(t => t.ticket_no === ticketNo)
    if (match) viewRecord.value = match
  }
})

// Filters reset to page 1; typing in search waits a moment before loading.
let searchTimer: ReturnType<typeof setTimeout> | undefined

watch(searchQuery, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    if (currentPage.value !== 1) currentPage.value = 1
    else load()
  }, 350)
})

watch([driverFilter, departmentFilter, statusFilter, dateFrom, dateTo], () => {
  if (currentPage.value !== 1) currentPage.value = 1
  else load()
})

watch(currentPage, load)

const resetFilters = () => {
  searchQuery.value = ''
  driverFilter.value = 'All'
  departmentFilter.value = 'All'
  statusFilter.value = 'All'
  dateFrom.value = ''
  dateTo.value = ''
}

// =====================================================
// ROW ACTIONS
// =====================================================

const menuItems = (t: TripTicketRecord) => [
  { key: 'view', label: 'View Ticket', icon: Eye },
  ...(t.status === 'scheduled' ? [{ key: 'edit', label: 'Edit Ticket', icon: Pencil }] : []),
  ...(t.status === 'scheduled' ? [{ key: 'depart', label: 'Record Departure', icon: LogOut }] : []),
  ...(t.status === 'ongoing' ? [{ key: 'return', label: 'Record Return', icon: LogIn }] : []),
  ...(t.status === 'scheduled' ? [{ key: 'cancel', label: 'Cancel Ticket', icon: Ban, danger: true, dividerBefore: true }] : []),
]

const viewRecord = ref<TripTicketRecord | null>(null)
const actionRecord = ref<TripTicketRecord | null>(null)
const actionType = ref<'depart' | 'return' | 'cancel'>('depart')

const onAction = (t: TripTicketRecord, key: string) => {
  if (key === 'view') {
    viewRecord.value = t
    return
  }
  if (key === 'edit') {
    router.push(`/admin/trip-tickets/${t.id}/edit`)
    return
  }
  actionType.value = key as 'depart' | 'return' | 'cancel'
  actionRecord.value = t
}

const onSaved = async (_record: TripTicketRecord, message: string) => {
  actionRecord.value = null
  flash.value = message
  await load()
}

// =====================================================
// DISPLAY HELPERS
// =====================================================

const dateText = (v: string) =>
  new Date(`${v}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const passengerSummary = (t: TripTicketRecord) => {
  if (!t.passengers.length) return 'Driver only'
  const first = t.passengers.slice(0, 2).map(p => p.name.split(' ')[0]).join(', ')
  return t.passengers.length > 2 ? `${first} +${t.passengers.length - 2}` : first
}

const csvEscape = (v: unknown) => {
  const s = String(v ?? '')
  const safe = /^[\s]*[=+@-]/.test(s) ? `'${s}` : s
  return `"${safe.replace(/"/g, '""')}"`
}

const exporting = ref(false)

// Exports every ticket matching the current filters, not just this page.
const exportCsv = async () => {
  exporting.value = true
  try {
    const all: TripTicketRecord[] = []
    let page = 1
    let lastPage = 1
    do {
      const response = await api.list(params({ page, per_page: 200 }))
      all.push(...response.data)
      lastPage = response.meta.last_page
      page++
    } while (page <= lastPage)

    const rows = [
      ['Ticket No.', 'Trip Date', 'Requesting Department', 'Requested By', 'Driver', 'Driver Code', 'Plate', 'Vehicle', 'Destination', 'Purpose', 'Passengers', 'Planned Departure', 'Actual Departure', 'Expected Return', 'Actual Return', 'Odometer Out', 'Odometer In', 'Distance (km)', 'Status'],
      ...all.map(t => [
        t.ticket_no, t.trip_date, t.requesting_department?.name, t.requested_by?.name, t.driver.name, t.driver.drivers_code, t.vehicle.plate_no, t.vehicle.description,
        t.destination, t.purpose, t.passengers.map(p => p.name).join('; '),
        t.scheduled_departure, t.departed_at, t.expected_return, t.returned_at,
        t.odometer_out, t.odometer_in, t.distance_km, STATUS_LABELS[t.status],
      ]),
    ]
    const csv = rows.map(r => r.map(csvEscape).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'trip-tickets.csv'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch (err) {
    loadError.value = driverErrorMessage(err, 'Unable to export trip tickets.')
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <section class="trip-tickets-page">
    <PageHeader
      title="Trip Tickets"
      description="Assign a driver and vehicle, record departure and return with odometer readings, and track passengers."
    >
      <AppButton variant="secondary" :icon="Download" :disabled="!meta.total || exporting" @click="exportCsv">
        Export
      </AppButton>
      <AppButton :icon="Plus" @click="router.push('/admin/trip-tickets/create')">
        Create Trip Ticket
      </AppButton>
    </PageHeader>

    <section class="stats-grid">
      <DriverStatCard label="Trips Today" :value="stats.trips_today" description="Scheduled, ongoing or completed" accent="blue" :icon="CalendarDays" />
      <DriverStatCard label="Ongoing" :value="stats.ongoing" description="Departed, not yet returned" accent="orange" :icon="Truck" />
      <DriverStatCard label="Completed Today" :value="stats.completed_today" description="Returned to the office" accent="green" :icon="CheckCircle2" />
      <DriverStatCard label="Distance Today" :value="`${stats.km_today.toLocaleString()} km`" description="From odometer readings" accent="purple" :icon="Gauge" />
    </section>

    <p v-if="loadError" class="load-error" role="alert">{{ loadError }}</p>

    <p v-if="flash" class="flash" role="status">
      <CheckCircle2 :size="15" /> {{ flash }}
      <button type="button" class="flash-close" aria-label="Dismiss" @click="flash = ''">×</button>
    </p>

    <div class="filters-row">
      <div class="search-box">
        <Search :size="15" />
        <input v-model="searchQuery" type="text" placeholder="Search ticket, driver, plate, destination, passenger..." aria-label="Search trip tickets">
      </div>

      <label class="date-box">
        <span class="date-label">From</span>
        <input v-model="dateFrom" type="date" aria-label="Date from">
      </label>

      <label class="date-box">
        <span class="date-label">To</span>
        <input v-model="dateTo" type="date" aria-label="Date to">
      </label>

      <div class="select-wrap">
        <select v-model="departmentFilter" aria-label="Requesting department">
          <option value="All">All Departments</option>
          <option v-for="d in filterLists.departments" :key="d.id" :value="d.id">{{ d.name }}</option>
        </select>
        <ChevronDown :size="14" class="select-icon" />
      </div>

      <div class="select-wrap">
        <select v-model="driverFilter" aria-label="Driver">
          <option value="All">All Drivers</option>
          <option v-for="d in filterLists.drivers" :key="d.id" :value="d.id">{{ d.name }}</option>
        </select>
        <ChevronDown :size="14" class="select-icon" />
      </div>

      <div class="select-wrap">
        <select v-model="statusFilter" aria-label="Status">
          <option value="All">All Status</option>
          <option v-for="(label, value) in STATUS_LABELS" :key="value" :value="value">{{ label }}</option>
        </select>
        <ChevronDown :size="14" class="select-icon" />
      </div>

      <button type="button" class="reset-btn" @click="resetFilters">Reset</button>
    </div>

    <BaseDataTable
      title="Trip Ticket Records"
      description="One ticket per trip: driver, vehicle, passengers, time out and in, and odometer."
      :has-rows="tickets.length > 0"
      :loading="loading"
      min-width="1320px"
      empty-title="No trip tickets found"
      empty-description="Try adjusting your filters, or create a new trip ticket."
    >
      <template #headers>
        <th>Ticket No.</th>
        <th>Requested By</th>
        <th>Driver</th>
        <th>Vehicle</th>
        <th>Destination</th>
        <th>Passengers</th>
        <th>Departure</th>
        <th>Return</th>
        <th>Odometer</th>
        <th>Status</th>
        <th class="text-right"><span class="sr-only">Actions</span></th>
      </template>

      <template #rows>
        <tr v-for="t in tickets" :key="t.id">
          <td>
            <span class="ticket-no">{{ t.ticket_no }}</span>
            <small class="cell-sub">{{ dateText(t.trip_date) }}</small>
          </td>
          <td>
            <span class="cell-title">{{ t.requested_by?.name ?? '—' }}</span>
            <small class="cell-sub">{{ t.requesting_department?.name ?? '—' }}</small>
          </td>
          <td>
            <strong class="cell-title">{{ t.driver.name }}</strong>
            <small class="cell-sub">{{ t.driver.drivers_code }}</small>
          </td>
          <td>
            <span class="cell-title">{{ t.vehicle.plate_no }}</span>
            <small class="cell-sub">{{ t.vehicle.description }}</small>
          </td>
          <td class="destination">
            <strong class="cell-title">{{ t.destination }}</strong>
            <small class="cell-sub">{{ t.purpose }}</small>
          </td>
          <td>
            <span class="cell-title">{{ t.passengers.length }} pax</span>
            <small class="cell-sub">{{ passengerSummary(t) }}</small>
          </td>
          <td>
            <span class="cell-title">{{ t.departed_at ? driverTimeText(t.departed_at) : '—' }}</span>
            <small class="cell-sub">Plan {{ driverTimeText(t.scheduled_departure) }}</small>
          </td>
          <td>
            <span class="cell-title">{{ t.returned_at ? driverTimeText(t.returned_at) : '—' }}</span>
            <small class="cell-sub">Exp. {{ driverTimeText(t.expected_return) }}</small>
          </td>
          <td>
            <span class="cell-title">
              {{ t.odometer_out?.toLocaleString() ?? '—' }} → {{ t.odometer_in?.toLocaleString() ?? '—' }}
            </span>
            <small class="cell-sub">{{ t.distance_km !== null ? `${t.distance_km.toLocaleString()} km` : '—' }}</small>
          </td>
          <td>
            <span class="status-pill" :class="`trip-${t.status}`">{{ STATUS_LABELS[t.status] }}</span>
          </td>
          <td class="text-right">
            <TableActionMenu
              :items="menuItems(t)"
              :label="`Actions for ${t.ticket_no}`"
              @select="key => onAction(t, key)"
            />
          </td>
        </tr>
      </template>
    </BaseDataTable>

    <BaseTableFooter
      v-model="currentPage"
      :showing-from="meta.from"
      :showing-to="meta.to"
      :total-items="meta.total"
      :total-pages="meta.last_page"
      item-label="trip tickets"
    />

    <TripTicketActionModal
      v-if="actionRecord"
      :key="`${actionRecord.id}-${actionType}`"
      :record="actionRecord"
      :action="actionType"
      @close="actionRecord = null"
      @saved="onSaved"
    />

    <TripTicketViewModal
      v-if="viewRecord"
      :record="viewRecord"
      @close="viewRecord = null"
    />
  </section>
</template>

<style scoped>
.trip-tickets-page {
  width: 100%;
  max-width: 1660px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin: 18px 0 14px;
}

.flash {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 14px;
  padding: 10px 12px;
  border-radius: 9px;
  background: var(--green-soft);
  color: var(--green);
  font-size: 13px;
}

.load-error {
  margin: 0 0 14px;
  padding: 10px 12px;
  border-radius: 9px;
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
  font-size: 13px;
}

.flash-close {
  margin-left: auto;
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}

.filters-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  margin-bottom: 18px;
}

.search-box,
.date-box {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
  color: var(--text-muted);
}

.search-box {
  flex: 1;
  min-width: 240px;
}

.search-box input,
.date-box input {
  border: 0;
  background: transparent;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 12px;
  outline: none;
}

.search-box input { width: 100%; }
.date-box input { color-scheme: dark; }

.date-label {
  font-size: 11px;
  font-weight: 600;
}

.select-wrap {
  position: relative;
  min-width: 160px;
}

.select-wrap select {
  width: 100%;
  height: 40px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  padding: 0 34px 0 12px;
  font-family: inherit;
  font-size: 12px;
  appearance: none;
}

.select-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.reset-btn {
  height: 40px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: transparent;
  color: var(--text-primary);
  padding: 0 14px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.search-box:focus-within,
.date-box:focus-within,
.select-wrap select:focus-visible,
.reset-btn:focus-visible {
  border-color: var(--primary);
  outline: none;
}

/* ===== Table cells ===== */

.ticket-no {
  display: block;
  color: var(--primary);
  font-weight: 700;
}

.cell-title { display: block; }

.cell-sub {
  display: block;
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 11px;
}

.destination { max-width: 240px; }

/* Status colors (shape and dot come from BaseDataTable's .status-pill) */
.trip-scheduled { background: rgba(59, 130, 246, 0.12); color: #60a5fa; }
.trip-ongoing { background: rgba(245, 158, 11, 0.12); color: #fbbf24; }
.trip-completed { background: rgba(34, 197, 94, 0.12); color: #4ade80; }
.trip-cancelled { background: rgba(148, 163, 184, 0.12); color: #a8b3c4; }

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@media (max-width: 980px) {
  .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 640px) {
  .stats-grid { grid-template-columns: 1fr; }

  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box,
  .date-box,
  .select-wrap,
  .reset-btn { width: 100%; }
}
</style>
