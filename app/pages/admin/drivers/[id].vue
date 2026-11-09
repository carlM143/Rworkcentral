<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Gauge,
  IdCard,
  ImageOff,
  Plus,
} from 'lucide-vue-next'
import DriverStatCard from '~/components/admin/drivers/DriverStatCard.vue'
import BaseDataTable from '~/components/shared-table/BaseDataTable.vue'
import {
  driverTimeText,
  driverTodayLocal,
  useDriverApi,
  type DriverAvailabilityStatus,
  type DriverRecord,
} from '~/composables/admin/drivers/useDriverApi'
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
const driverApi = useDriverApi()
const tripApi = useTripTicketApi()

const driverId = Number(route.params.id)
const today = driverTodayLocal()

const AVAILABILITY_LABELS: Record<DriverAvailabilityStatus, string> = {
  available: 'Available',
  on_trip: 'On Trip',
  rest_day: 'Rest Day',
  on_leave: 'On Leave',
  license_expired: 'License Expired',
}

const TRIP_LABELS: Record<TripTicketStatus, string> = {
  scheduled: 'Scheduled',
  ongoing: 'Ongoing',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const driver = ref<DriverRecord | null>(null) 
const tickets = ref<TripTicketRecord[]>([])
const loading = ref(true)
const notFound = ref(false)

const scheduleDate = ref(today)
const scheduleDriver = ref<DriverRecord | null>(null)
const scheduleLoading = ref(false)

const load = async () => {
  loading.value = true
  try {
    const [availability, list] = await Promise.all([
      driverApi.availability(today),
      tripApi.list(),
    ])
    driver.value = availability.data.find(d => d.id === driverId) ?? null
    notFound.value = !driver.value
    scheduleDriver.value = driver.value
    tickets.value = list.data.filter(t => t.driver.id === driverId)
  } finally {
    loading.value = false
  }
}

const loadSchedule = async () => {
  if (scheduleDate.value === today) {
    scheduleDriver.value = driver.value
    return
  }
  scheduleLoading.value = true
  try {
    const response = await driverApi.availability(scheduleDate.value)
    scheduleDriver.value = response.data.find(d => d.id === driverId) ?? null
  } finally {
    scheduleLoading.value = false
  }
}

onMounted(load)
watch(scheduleDate, loadSchedule)

// =====================================================
// STATS
// =====================================================

const activeTickets = computed(() => tickets.value.filter(t => t.status !== 'cancelled'))

const todaysTrips = computed(() =>
  activeTickets.value.filter(t => t.trip_date === today))

const nextTrip = computed(() => {
  const now = new Date()
  const nowHHmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  return [...activeTickets.value]
    .filter(t => t.status === 'scheduled'
      && (t.trip_date > today || (t.trip_date === today && t.scheduled_departure >= nowHHmm)))
    .sort((a, b) => a.trip_date.localeCompare(b.trip_date) || a.scheduled_departure.localeCompare(b.scheduled_departure))[0] ?? null
})

const monthKey = today.slice(0, 7)
const distanceThisMonth = computed(() =>
  tickets.value
    .filter(t => t.status === 'completed' && t.trip_date.startsWith(monthKey))
    .reduce((n, t) => n + (t.distance_km ?? 0), 0))

const license = computed(() => {
  if (!driver.value) return { value: '—', note: '', tone: 'muted' }
  const days = Math.round(
    (new Date(`${driver.value.expire_date}T00:00:00`).getTime() - new Date(`${today}T00:00:00`).getTime()) / 86400000,
  )
  if (days < 0) return { value: 'Expired', note: `Since ${dateText(driver.value.expire_date)}`, tone: 'danger' }
  if (days <= 30) return { value: `${days} day${days === 1 ? '' : 's'} left`, note: `Expires ${dateText(driver.value.expire_date)}`, tone: 'warning' }
  return { value: 'Valid', note: `Until ${dateText(driver.value.expire_date)}`, tone: 'muted' }
})

// =====================================================
// SCHEDULE + RECENT TRIPS
// =====================================================

const scheduleTrips = computed(() =>
  tickets.value
    .filter(t => t.trip_date === scheduleDate.value)
    .sort((a, b) => a.scheduled_departure.localeCompare(b.scheduled_departure)))

const recentTrips = computed(() =>
  [...tickets.value]
    .filter(t => t.trip_date <= today)
    .sort((a, b) => b.trip_date.localeCompare(a.trip_date) || b.scheduled_departure.localeCompare(a.scheduled_departure))
    .slice(0, 10))

const isScheduleToday = computed(() => scheduleDate.value === today)

// =====================================================
// HELPERS
// =====================================================

function dateText(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const longDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })

const tripWindow = (t: TripTicketRecord) =>
  `${driverTimeText(t.departed_at ?? t.scheduled_departure)} – ${driverTimeText(t.returned_at ?? t.expected_return)}`

const openTicket = (ticketNo: string) => {
  router.push({ path: '/admin/trip-tickets', query: { trip: ticketNo } })
}
</script>

<template>
  <section class="driver-profile-page">
    <PageHeader
      title="Driver Profile"
      :description="driver ? `${driver.employee.name} · license, availability and trip history.` : 'Driver details, availability and trip history.'"
    >
      <AppButton variant="secondary" :icon="ArrowLeft" @click="router.push('/admin/drivers')">
        Back
      </AppButton>
      <AppButton v-if="driver" :icon="Plus" @click="router.push({ path: '/admin/trip-tickets/create', query: { driver: driverId } })">
        Create Trip Ticket
      </AppButton>
    </PageHeader>

    <!-- LOADING / NOT FOUND -->
    <div v-if="loading" class="state-card">Loading driver...</div>

    <div v-else-if="notFound || !driver" class="state-card">
      <strong>Driver not found</strong>
      <span>This driver may have been removed.</span>
      <AppButton variant="secondary" :icon="ArrowLeft" @click="router.push('/admin/drivers')">Back to Drivers Directory</AppButton>
    </div>

    <template v-else>
      <!-- SUMMARY -->
      <section class="summary-card">
        <div>
          <span class="eyebrow">Driver</span>
          <h2>{{ driver.employee.name }}</h2>
          <p>
            {{ driver.drivers_code }} · {{ driver.employee.emp_id }}
            <template v-if="driver.employee.position"> · {{ driver.employee.position }}</template>
            <template v-if="driver.employee.department"> · {{ driver.employee.department }}</template>
          </p>
        </div>
        <div class="summary-status">
          <span class="pill" :class="`avail-${driver.availability.status}`">
            {{ AVAILABILITY_LABELS[driver.availability.status] }}
          </span>
          <small>{{ driver.availability.note }}</small>
        </div>
      </section>

      <!-- STATS -->
      <section class="stats-grid">
        <DriverStatCard
          label="Trips Today"
          :value="todaysTrips.length"
          description="Scheduled, ongoing or completed"
          accent="blue"
          :icon="CalendarDays"
        />
        <DriverStatCard
          label="Next Trip"
          :value="nextTrip ? driverTimeText(nextTrip.scheduled_departure) : '—'"
          :description="nextTrip ? `${nextTrip.ticket_no} · ${nextTrip.trip_date === today ? 'today' : dateText(nextTrip.trip_date)}` : 'No upcoming trips'"
          accent="orange"
          :icon="Clock3"
        />
        <DriverStatCard
          label="License"
          :value="license.value"
          :description="license.note"
          accent="green"
          :icon="IdCard"
        />
        <DriverStatCard
          label="Distance This Month"
          :value="`${distanceThisMonth.toLocaleString()} km`"
          description="From completed trips"
          accent="purple"
          :icon="Gauge"
        />
      </section>

      <!-- DETAILS + SCHEDULE -->
      <div class="detail-grid">
        <section class="panel">
          <header class="panel-header">
            <h3>Driver Details</h3>
          </header>

          <dl class="detail-list">
            <div><dt>Employee No.</dt><dd>{{ driver.employee.emp_id }}</dd></div>
            <div><dt>Driver Code</dt><dd>{{ driver.drivers_code }}</dd></div>
            <div><dt>Department</dt><dd>{{ driver.employee.department || '—' }}</dd></div>
            <div><dt>Position</dt><dd>{{ driver.employee.position || '—' }}</dd></div>
            <div><dt>License No.</dt><dd>{{ driver.licence_no }}</dd></div>
            <div>
              <dt>License Expiry</dt>
              <dd :class="`license-${license.tone}`">{{ dateText(driver.expire_date) }}</dd>
            </div>
          </dl>

          <div class="photo-block">
            <span class="photo-label">License Photo</span>
            <a v-if="driver.image_path" :href="driver.image_path" target="_blank" rel="noopener" class="photo">
              <img :src="driver.image_path" :alt="`License photo of ${driver.employee.name}`">
            </a>
            <div v-else class="photo photo-empty">
              <ImageOff :size="18" />
              <span>No license photo uploaded</span>
            </div>
          </div>
        </section>

        <section class="panel">
          <header class="panel-header">
            <div>
              <h3>Schedule</h3>
              <p>{{ longDate(scheduleDate) }}{{ isScheduleToday ? ' (today)' : '' }}</p>
            </div>
            <label class="date-box">
              <CalendarDays :size="15" />
              <span class="sr-only">Schedule date</span>
              <input v-model="scheduleDate" type="date">
            </label>
          </header>

          <div class="schedule-body">
            <p v-if="scheduleLoading" class="muted">Loading schedule...</p>

            <template v-else>
              <p
                v-if="scheduleDriver && scheduleDriver.availability.status !== 'available' && scheduleDriver.availability.status !== 'on_trip'"
                class="schedule-note"
                :class="`avail-${scheduleDriver.availability.status}`"
              >
                {{ AVAILABILITY_LABELS[scheduleDriver.availability.status] }} · {{ scheduleDriver.availability.note }}
              </p>

              <ul v-if="scheduleTrips.length" class="timeline">
                <li v-for="t in scheduleTrips" :key="t.id" :class="{ cancelled: t.status === 'cancelled' }">
                  <span class="timeline-time">{{ tripWindow(t) }}</span>
                  <div class="timeline-body">
                    <button type="button" class="ticket-link" @click="openTicket(t.ticket_no)">{{ t.ticket_no }}</button>
                    <strong>{{ t.destination }}</strong>
                    <small>
                      <template v-if="t.requesting_department">{{ t.requesting_department.name }} · </template>{{ t.vehicle.plate_no }} · {{ t.passengers.length }} pax
                      <template v-if="t.distance_km !== null"> · {{ t.distance_km.toLocaleString() }} km</template>
                    </small>
                  </div>
                  <span class="pill" :class="`trip-${t.status}`">{{ TRIP_LABELS[t.status] }}</span>
                </li>
              </ul>

              <p v-else class="empty">No trips on this day.</p>
            </template>
          </div>
        </section>
      </div>

      <!-- RECENT TRIPS -->
      <BaseDataTable
        title="Recent Trips"
        description="Last 10 trips of this driver, newest first. Click a ticket to open it."
        :has-rows="recentTrips.length > 0"
        min-width="1040px"
        empty-title="No trips yet"
        empty-description="Trips appear here once a trip ticket is assigned to this driver."
      >
        <template #headers>
          <th>Ticket No.</th>
          <th>Requested By</th>
          <th>Vehicle</th>
          <th>Destination</th>
          <th>Passengers</th>
          <th>Time</th>
          <th>Distance</th>
          <th>Status</th>
        </template>

        <template #rows>
          <tr v-for="t in recentTrips" :key="t.id">
            <td>
              <button type="button" class="ticket-link" @click="openTicket(t.ticket_no)">{{ t.ticket_no }}</button>
              <small class="cell-sub">{{ dateText(t.trip_date) }}</small>
            </td>
            <td>
              <span class="cell-title">{{ t.requested_by?.name ?? '—' }}</span>
              <small class="cell-sub">{{ t.requesting_department?.name ?? '—' }}</small>
            </td>
            <td>
              <span class="cell-title">{{ t.vehicle.plate_no }}</span>
              <small class="cell-sub">{{ t.vehicle.description }}</small>
            </td>
            <td>
              <strong class="cell-title">{{ t.destination }}</strong>
              <small class="cell-sub">{{ t.purpose }}</small>
            </td>
            <td>{{ t.passengers.length }} pax</td>
            <td>{{ tripWindow(t) }}</td>
            <td>{{ t.distance_km !== null ? `${t.distance_km.toLocaleString()} km` : '—' }}</td>
            <td><span class="status-pill" :class="`trip-${t.status}`">{{ TRIP_LABELS[t.status] }}</span></td>
          </tr>
        </template>
      </BaseDataTable>
    </template>
  </section>
</template>

<style scoped>
.driver-profile-page {
  width: 100%;
  max-width: 1660px;
  margin: 0 auto;
}

.state-card {
  display: flex;
  min-height: 220px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  color: var(--text-muted);
  font-size: 13px;
}

.state-card strong {
  color: var(--text-primary);
  font-size: 15px;
}

/* ===== Summary ===== */

.summary-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 18px;
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.1), var(--bg-card));
}

.eyebrow {
  color: var(--text-secondary);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.summary-card h2 {
  margin: 4px 0;
  font-size: 22px;
}

.summary-card p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 12px;
}

.summary-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  text-align: right;
}

.summary-status small {
  color: var(--text-muted);
  font-size: 11px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin: 14px 0;
}

/* ===== Panels ===== */

.detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr);
  gap: 14px;
  margin-bottom: 14px;
}

.panel {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 60px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border-soft);
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
}

.panel-header p {
  margin: 3px 0 0;
  color: var(--text-secondary);
  font-size: 12px;
}

.detail-list {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 18px;
}

.detail-list div {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-soft);
}

.detail-list dt {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
}

.detail-list dd {
  margin: 0;
  font-size: 13px;
  text-align: right;
}

.license-warning { color: #fbbf24; }
.license-danger { color: #f87171; }

.photo-block {
  padding: 0 18px 18px;
}

.photo-label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
}

.photo {
  display: block;
  width: 180px;
  height: 115px;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 9px;
}

.photo img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: var(--bg-card-soft);
  color: var(--text-muted);
  font-size: 11px;
}

/* ===== Schedule ===== */

.date-box {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
  color: var(--text-muted);
}

.date-box:focus-within { border-color: var(--primary); }

.date-box input {
  border: 0;
  background: transparent;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 12px;
  outline: none;
  color-scheme: dark;
}

.schedule-body {
  padding: 16px 18px;
}

.schedule-note {
  margin: 0 0 12px;
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 12px;
}

.timeline {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.timeline li {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card-soft);
}

.timeline li.cancelled { opacity: 0.55; }

.timeline-time {
  font-size: 13px;
  font-weight: 700;
}

.timeline-body strong,
.timeline-body small { display: block; }

.timeline-body strong {
  margin-top: 2px;
  font-size: 13px;
}

.timeline-body small {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 11px;
}

.ticket-link {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--primary);
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.ticket-link:hover { text-decoration: underline; }

.ticket-link:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.empty,
.muted {
  margin: 0;
  color: var(--text-muted);
  font-size: 12px;
}

/* ===== Pills ===== */

.pill {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.avail-available { background: rgba(34, 197, 94, 0.12); color: #4ade80; }
.avail-on_trip { background: rgba(59, 130, 246, 0.12); color: #60a5fa; }
.avail-on_leave { background: rgba(245, 158, 11, 0.12); color: #fbbf24; }
.avail-rest_day { background: rgba(148, 163, 184, 0.12); color: #a8b3c4; }
.avail-license_expired { background: rgba(239, 68, 68, 0.12); color: #f87171; }

.trip-scheduled { background: rgba(59, 130, 246, 0.12); color: #60a5fa; }
.trip-ongoing { background: rgba(245, 158, 11, 0.12); color: #fbbf24; }
.trip-completed { background: rgba(34, 197, 94, 0.12); color: #4ade80; }
.trip-cancelled { background: rgba(148, 163, 184, 0.12); color: #a8b3c4; }

/* ===== Recent trips cells ===== */

.cell-title { display: block; }

.cell-sub {
  display: block;
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 11px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@media (max-width: 1080px) {
  .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .detail-grid { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .stats-grid { grid-template-columns: 1fr; }

  .summary-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .summary-status {
    align-items: flex-start;
    text-align: left;
  }

  .timeline li { grid-template-columns: 1fr; }
}
</style>