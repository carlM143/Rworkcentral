<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Eye,
  Pencil,
  Plus,
  Power,
  PowerOff,
  Search,
  Truck,
  UserX,
  Users,
} from 'lucide-vue-next'
import DriverStatCard from '~/components/admin/drivers/DriverStatCard.vue'
import BaseDataTable from '~/components/shared-table/BaseDataTable.vue'
import BaseTableFooter from '~/components/shared-table/BaseTableFooter.vue'
import TableActionMenu from '~/components/shared-table/TableActionMenu.vue'
import AppConfirmModal from '~/components/shared/AppConfirmModal.vue'
import DriverEditModal from '~/components/admin/drivers/DriverEditModal.vue'
import {
  driverErrorMessage,
  driverTodayLocal,
  useDriverApi,
  type DriverAvailabilityStatus,
  type DriverRecord,
} from '~/composables/admin/drivers/useDriverApi'

definePageMeta({
  layout: 'admin',
})

const router = useRouter()
const api = useDriverApi()

const STATUS_LABELS: Record<DriverAvailabilityStatus, string> = {
  available: 'Available',
  on_trip: 'On Trip',
  rest_day: 'Rest Day',
  on_leave: 'On Leave',
  license_expired: 'License Expired',
  inactive: 'Inactive',
}

// =====================================================
// DATA
// =====================================================

const drivers = ref<DriverRecord[]>([])
const loading = ref(false)
const selectedDate = ref(driverTodayLocal())

const load = async () => {
  loading.value = true
  try {
    const response = await api.availability(selectedDate.value)
    drivers.value = response.data
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(selectedDate, load)

const isToday = computed(() => selectedDate.value === driverTodayLocal())

const dateLabel = computed(() =>
  new Date(`${selectedDate.value}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric', year: 'numeric',
  }))

// =====================================================
// FILTERS + PAGINATION
// =====================================================

const searchQuery = ref('')
const statusFilter = ref<'All' | DriverAvailabilityStatus>('All')
const currentPage = ref(1)
const itemsPerPage = 5

const filteredDrivers = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return drivers.value.filter((driver) => {
    const matchesQuery = !query || [
      driver.employee.name,
      driver.employee.emp_id,
      driver.drivers_code,
      driver.licence_no,
      driver.employee.department,
    ].join(' ').toLowerCase().includes(query)

    const matchesStatus = statusFilter.value === 'All' || driver.availability.status === statusFilter.value

    return matchesQuery && matchesStatus
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredDrivers.value.length / itemsPerPage)))

const paginatedDrivers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredDrivers.value.slice(start, start + itemsPerPage)
})

const showingFrom = computed(() => (filteredDrivers.value.length ? (currentPage.value - 1) * itemsPerPage + 1 : 0))
const showingTo = computed(() => Math.min(currentPage.value * itemsPerPage, filteredDrivers.value.length))

watch([searchQuery, statusFilter, selectedDate], () => {
  currentPage.value = 1
})

const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = 'All'
  selectedDate.value = driverTodayLocal()
}

// =====================================================
// STATS
// =====================================================

const countBy = (...statuses: DriverAvailabilityStatus[]) =>
  drivers.value.filter(d => statuses.includes(d.availability.status)).length

const availableCount = computed(() => countBy('available'))
const onTripCount = computed(() => countBy('on_trip'))
const unavailableCount = computed(() => countBy('rest_day', 'on_leave', 'license_expired', 'inactive'))

// =====================================================
// LICENSE EXPIRY
// =====================================================

const daysUntil = (date: string) => {
  const from = new Date(`${selectedDate.value}T00:00:00`).getTime()
  const to = new Date(`${date}T00:00:00`).getTime()
  return Math.round((to - from) / 86400000)
}

const licenseNote = (driver: DriverRecord) => {
  const days = daysUntil(driver.expire_date)
  if (days < 0) return { text: 'Expired', tone: 'danger' }
  if (days <= 30) return { text: `Expires in ${days} day${days === 1 ? '' : 's'}`, tone: 'warning' }
  return { text: `Valid until ${new Date(`${driver.expire_date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`, tone: 'muted' }
}

// =====================================================
// ACTIONS
// =====================================================

const goToCreateDriver = () => {
  router.push('/admin/drivers/create')
}

const menuItems = (driver: DriverRecord) => [
  { key: 'profile', label: 'View Profile', icon: Eye },
  { key: 'edit', label: 'Edit Driver', icon: Pencil },
  driver.status === 'inactive'
    ? { key: 'activate', label: 'Activate Driver', icon: Power, dividerBefore: true }
    : { key: 'deactivate', label: 'Deactivate Driver', icon: PowerOff, danger: true, dividerBefore: true },
]

const flash = ref('')
const editing = ref<DriverRecord | null>(null)
const confirmDriver = ref<{ driver: DriverRecord, action: 'activate' | 'deactivate' } | null>(null)
const confirmBusy = ref(false)
const confirmError = ref('')

const onAction = (driver: DriverRecord, key: string) => {
  if (key === 'profile') {
    router.push(`/admin/drivers/${driver.id}`)
    return
  }
  if (key === 'edit') {
    editing.value = driver
    return
  }
  confirmError.value = ''
  confirmDriver.value = { driver, action: key as 'activate' | 'deactivate' }
}

const runConfirm = async () => {
  if (!confirmDriver.value) return
  const { driver, action } = confirmDriver.value
  confirmBusy.value = true
  confirmError.value = ''
  try {
    const response = action === 'deactivate'
      ? await api.deactivate(driver.id)
      : await api.activate(driver.id)
    flash.value = response.message
    confirmDriver.value = null
    await load()
  } catch (err) {
    confirmError.value = driverErrorMessage(err, 'Unable to update the driver.')
  } finally {
    confirmBusy.value = false
  }
}

const onSaved = async (_driver: DriverRecord, message: string) => {
  editing.value = null
  flash.value = message
  await load()
}
</script>

<template>
  <section class="drivers-page">
    <PageHeader
      title="Drivers Directory"
      description="See which drivers are available on a given day before assigning a trip ticket."
    >
      <AppButton :icon="Plus" @click="goToCreateDriver">
        Add Driver
      </AppButton>
    </PageHeader>

    <p v-if="flash" class="flash" role="status">
      <CheckCircle2 :size="15" /> {{ flash }}
      <button type="button" class="flash-close" aria-label="Dismiss" @click="flash = ''">×</button>
    </p>

    <section class="stats-grid">
      <DriverStatCard
        label="Total Drivers"
        :value="drivers.length"
        description="Registered drivers"
        accent="blue"
        :icon="Users"
      />
      <DriverStatCard
        label="Available"
        :value="availableCount"
        :description="isToday ? 'Free to assign now' : 'Working that day'"
        accent="green"
        :icon="CheckCircle2"
      />
      <DriverStatCard
        label="On Trip"
        :value="onTripCount"
        description="Currently out of the office"
        accent="orange"
        :icon="Truck"
      />
      <DriverStatCard
        label="Unavailable"
        :value="unavailableCount"
        description="Rest day, leave, expired license or inactive"
        accent="purple"
        :icon="UserX"
      />
    </section>

    <div class="filters-row">
      <div class="search-box">
        <Search :size="15" />
        <input v-model="searchQuery" type="text" placeholder="Search driver, employee no., driver code, license..." aria-label="Search drivers">
      </div>

      <label class="date-box">
        <CalendarDays :size="15" />
        <span class="sr-only">Availability date</span>
        <input v-model="selectedDate" type="date">
      </label>

      <div class="select-wrap">
        <select v-model="statusFilter" aria-label="Availability">
          <option value="All">All Availability</option>
          <option v-for="(label, value) in STATUS_LABELS" :key="value" :value="value">
            {{ label }}
          </option>
        </select>
        <ChevronDown :size="14" class="select-icon" />
      </div>

      <button type="button" class="reset-btn" @click="resetFilters">
        Reset
      </button>
    </div>

    <BaseDataTable
      title="Driver Availability"
      :description="`Showing availability for ${dateLabel}${isToday ? ' (today)' : ''}.`"
      :has-rows="paginatedDrivers.length > 0"
      :loading="loading"
      empty-title="No drivers found"
      empty-description="Try adjusting your search or filters."
    >
      <template #headers>
        <th>Driver</th>
        <th>Department</th>
        <th>License</th>
        <th>Availability</th>
        <th>Schedule That Day</th>
        <th class="text-right">
          <span class="sr-only">Actions</span>
        </th>
      </template>

      <template #rows>
        <tr v-for="driver in paginatedDrivers" :key="driver.id">
          <td>
            <strong class="cell-title">{{ driver.employee.name }}</strong>
            <small class="cell-sub">{{ driver.drivers_code }} · {{ driver.employee.emp_id }}</small>
          </td>

          <td>{{ driver.employee.department || '—' }}</td>

          <td>
            <span class="cell-title">{{ driver.licence_no }}</span>
            <small class="cell-sub" :class="`license-${licenseNote(driver).tone}`">{{ licenseNote(driver).text }}</small>
          </td>

          <td>
            <span class="status-pill" :class="`avail-${driver.availability.status}`">
              {{ STATUS_LABELS[driver.availability.status] }}
            </span>
            <small class="cell-sub">{{ driver.availability.note }}</small>
          </td>

          <td>
            <ul v-if="driver.availability.busy.length" class="busy-list">
              <li v-for="block in driver.availability.busy" :key="block.ticket_no">
                <strong>{{ block.start }}–{{ block.end }}</strong>
                <span>{{ block.ticket_no }} · {{ block.destination }}</span>
              </li>
            </ul>
            <span v-else class="cell-sub">No trips</span>
          </td>

          <td class="text-right">
            <TableActionMenu
              :items="menuItems(driver)"
              :label="`Actions for ${driver.employee.name}`"
              @select="key => onAction(driver, key)"
            />
          </td>
        </tr>
      </template>
    </BaseDataTable>

    <BaseTableFooter
      v-model="currentPage"
      :showing-from="showingFrom"
      :showing-to="showingTo"
      :total-items="filteredDrivers.length"
      :total-pages="totalPages"
      item-label="drivers"
    />

    <DriverEditModal
      v-if="editing"
      :driver="editing"
      @close="editing = null"
      @saved="onSaved"
    />

    <AppConfirmModal
      v-if="confirmDriver"
      :title="`${confirmDriver.action === 'deactivate' ? 'Deactivate' : 'Activate'} ${confirmDriver.driver.employee.name}?`"
      :message="confirmDriver.action === 'deactivate'
        ? 'The driver will no longer appear in new trip tickets. Their trip history is kept, and you can activate them again later.'
        : 'The driver can be assigned to trip tickets again.'"
      :confirm-label="confirmDriver.action === 'deactivate' ? 'Deactivate' : 'Activate'"
      :danger="confirmDriver.action === 'deactivate'"
      :busy="confirmBusy"
      :error="confirmError"
      @close="confirmDriver = null"
      @confirm="runConfirm"
    />
  </section>
</template>

<style scoped>
.drivers-page {
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

.filters-row {
  display: flex;
  align-items: center;
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
  min-width: 220px;
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

.search-box input {
  width: 100%;
}

.date-box input {
  color-scheme: dark;
}

.select-wrap {
  position: relative;
  min-width: 180px;
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

.cell-title {
  display: block;
}

.cell-sub {
  display: block;
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 11px;
}

.license-warning { color: #fbbf24; }
.license-danger { color: #f87171; }

/* Availability colors (shape and dot come from BaseDataTable's .status-pill) */
.avail-available { background: rgba(34, 197, 94, 0.12); color: #4ade80; }
.avail-on_trip { background: rgba(59, 130, 246, 0.12); color: #60a5fa; }
.avail-on_leave { background: rgba(245, 158, 11, 0.12); color: #fbbf24; }
.avail-rest_day { background: rgba(148, 163, 184, 0.12); color: #a8b3c4; }
.avail-license_expired { background: rgba(239, 68, 68, 0.12); color: #f87171; }
.avail-inactive { background: rgba(100, 116, 139, 0.18); color: #94a3b8; }

.flash {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 14px 0 0;
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

.busy-list {
  display: grid;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.busy-list li {
  font-size: 12px;
}

.busy-list strong {
  margin-right: 6px;
}

.busy-list span {
  color: var(--text-muted);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@media (max-width: 980px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filters-row {
    flex-wrap: wrap;
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box,
  .date-box,
  .select-wrap,
  .reset-btn {
    width: 100%;
  }
}
</style>
