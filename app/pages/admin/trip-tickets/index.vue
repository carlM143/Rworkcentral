<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
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
import { driverTimeText, driverTodayLocal } from '~/composables/admin/drivers/useDriverApi'
import {
  useTripTicketApi,
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
// DATA
// =====================================================

const tickets = ref<TripTicketRecord[]>([])
const loading = ref(false)
const flash = ref('')

const load = async () => {
  loading.value = true
  try {
    const response = await api.list()
    tickets.value = response.data
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await load()
  // Coming back from the Create Trip Ticket page
  const created = route.query.created
  if (typeof created === 'string') flash.value = `Trip ticket ${created} created.`

  // Opened from another page, e.g. /admin/trip-tickets?trip=TT-2026-0012
  const ticketNo = route.query.trip
  if (typeof ticketNo === 'string') {
    const match = tickets.value.find(t => t.ticket_no === ticketNo)
    if (match) viewRecord.value = match
  }
})

// =====================================================
// FILTERS + PAGINATION
// =====================================================

const searchQuery = ref('')
const driverFilter = ref<'All' | number>('All')
const departmentFilter = ref<'All' | number>('All')
const statusFilter = ref<'All' | TripTicketStatus>('All')
const dateFrom = ref('')
const dateTo = ref('')
const currentPage = ref(1)
const itemsPerPage = 8

const driverOptions = computed(() => {
  const seen = new Map<number, string>()
  tickets.value.forEach(t => seen.set(t.driver.id, t.driver.name))
  return [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1]))
})

const departmentOptions = computed(() => {
  const seen = new Map<number, string>()
  tickets.value.forEach((t) => {
    if (t.requesting_department) seen.set(t.requesting_department.id, t.requesting_department.name)
  })
  return [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1]))
})

const filteredTickets = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return tickets.value.filter((t) => {
    const haystack = [
      t.ticket_no, t.driver.name, t.vehicle.plate_no, t.destination, t.purpose,
      t.requesting_department?.name, t.requested_by?.name,
      ...t.passengers.map(p => p.name),
    ].join(' ').toLowerCase()

    return (!q || haystack.includes(q))
      && (driverFilter.value === 'All' || t.driver.id === driverFilter.value)
      && (departmentFilter.value === 'All' || t.requesting_department?.id === departmentFilter.value)
      && (statusFilter.value === 'All' || t.status === statusFilter.value)
      && (!dateFrom.value || t.trip_date >= dateFrom.value)
      && (!dateTo.value || t.trip_date <= dateTo.value)
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredTickets.value.length / itemsPerPage)))
const paginatedTickets = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredTickets.value.slice(start, start + itemsPerPage)
})
const showingFrom = computed(() => (filteredTickets.value.length ? (currentPage.value - 1) * itemsPerPage + 1 : 0))
const showingTo = computed(() => Math.min(currentPage.value * itemsPerPage, filteredTickets.value.length))

watch([searchQuery, driverFilter, departmentFilter, statusFilter, dateFrom, dateTo], () => {
  currentPage.value = 1
})

const resetFilters = () => {
  searchQuery.value = ''
  driverFilter.value = 'All'
  departmentFilter.value = 'All'
  statusFilter.value = 'All'
  dateFrom.value = ''
  dateTo.value = ''
}

// =====================================================
// STATS (today)
// =====================================================

const today = driverTodayLocal()
const todays = computed(() => tickets.value.filter(t => t.trip_date === today && t.status !== 'cancelled'))
const ongoingCount = computed(() => tickets.value.filter(t => t.status === 'ongoing').length)
const completedToday = computed(() => todays.value.filter(t => t.status === 'completed').length)
const kmToday = computed(() => todays.value.reduce((n, t) => n + (t.distance_km ?? 0), 0))

// =====================================================
// ROW ACTIONS
// =====================================================

const menuItems = (t: TripTicketRecord) => [
  { key: 'view', label: 'View Ticket', icon: Eye },
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

const exportCsv = () => {
  const rows = [
    ['Ticket No.', 'Trip Date', 'Requesting Department', 'Requested By', 'Driver', 'Driver Code', 'Plate', 'Vehicle', 'Destination', 'Purpose', 'Passengers', 'Planned Departure', 'Actual Departure', 'Expected Return', 'Actual Return', 'Odometer Out', 'Odometer In', 'Distance (km)', 'Status'],
    ...filteredTickets.value.map(t => [
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
}
</script>

<template>
  <section class="trip-tickets-page">
    <PageHeader
      title="Trip Tickets"
      description="Assign a driver and vehicle, record departure and return with odometer readings, and track passengers."
    >
      <AppButton variant="secondary" :icon="Download" :disabled="!filteredTickets.length" @click="exportCsv">
        Export
      </AppButton>
      <AppButton :icon="Plus" @click="router.push('/admin/trip-tickets/create')">
        Create Trip Ticket
      </AppButton>
    </PageHeader>

    <section class="stats-grid">
      <DriverStatCard label="Trips Today" :value="todays.length" description="Scheduled, ongoing or completed" accent="blue" :icon="CalendarDays" />
      <DriverStatCard label="Ongoing" :value="ongoingCount" description="Departed, not yet returned" accent="orange" :icon="Truck" />
      <DriverStatCard label="Completed Today" :value="completedToday" description="Returned to the office" accent="green" :icon="CheckCircle2" />
      <DriverStatCard label="Distance Today" :value="`${kmToday.toLocaleString()} km`" description="From odometer readings" accent="purple" :icon="Gauge" />
    </section>

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
          <option v-for="[id, name] in departmentOptions" :key="id" :value="id">{{ name }}</option>
        </select>
        <ChevronDown :size="14" class="select-icon" />
      </div>

      <div class="select-wrap">
        <select v-model="driverFilter" aria-label="Driver">
          <option value="All">All Drivers</option>
          <option v-for="[id, name] in driverOptions" :key="id" :value="id">{{ name }}</option>
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
      :has-rows="paginatedTickets.length > 0"
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
        <tr v-for="t in paginatedTickets" :key="t.id">
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
      :showing-from="showingFrom"
      :showing-to="showingTo"
      :total-items="filteredTickets.length"
      :total-pages="totalPages"
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