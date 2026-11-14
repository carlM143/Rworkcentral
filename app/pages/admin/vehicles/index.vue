<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  Ban,
  Car,
  CheckCircle2,
  ChevronDown,
  Pencil,
  Plus,
  Search,
  Trash2,
  Truck,
  Wrench,
} from 'lucide-vue-next'
import DriverStatCard from '~/components/admin/drivers/DriverStatCard.vue'
import BaseDataTable from '~/components/shared-table/BaseDataTable.vue'
import BaseTableFooter from '~/components/shared-table/BaseTableFooter.vue'
import TableActionMenu from '~/components/shared-table/TableActionMenu.vue'
import AppConfirmModal from '~/components/shared/AppConfirmModal.vue'
import VehicleFormModal from '~/components/admin/drivers/vehicles/VehicleFormModal.vue'
import { driverErrorMessage } from '~/composables/admin/drivers/useDriverApi'
import {
  VEHICLE_STATUS_LABELS,
  useVehicleApi,
  type VehicleListResponse,
  type VehicleRecord,
  type VehicleStatus,
} from '~/composables/admin/drivers/useVehicleApi'

definePageMeta({
  layout: 'admin',
})

const api = useVehicleApi()

// =====================================================
// DATA
// =====================================================

const vehicles = ref<VehicleRecord[]>([])
const stats = ref<VehicleListResponse['stats']>({ total: 0, active: 0, maintenance: 0, inactive: 0, on_trip: 0 })
const loading = ref(false)
const flash = ref('')
const loadError = ref('')

const load = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const response = await api.list()
    vehicles.value = response.data
    stats.value = response.stats
  } catch (err) {
    loadError.value = driverErrorMessage(err, 'Unable to load vehicles.')
  } finally {
    loading.value = false
  }
}

onMounted(load)

// =====================================================
// FILTERS + PAGINATION
// =====================================================

const searchQuery = ref('')
const statusFilter = ref<'All' | VehicleStatus>('All')
const currentPage = ref(1)
const itemsPerPage = 8

const filtered = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return vehicles.value.filter(v =>
    (!q || `${v.plate_no} ${v.description} ${v.vehicle_type ?? ''}`.toLowerCase().includes(q))
    && (statusFilter.value === 'All' || v.status === statusFilter.value))
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / itemsPerPage)))
const paginated = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filtered.value.slice(start, start + itemsPerPage)
})
const showingFrom = computed(() => (filtered.value.length ? (currentPage.value - 1) * itemsPerPage + 1 : 0))
const showingTo = computed(() => Math.min(currentPage.value * itemsPerPage, filtered.value.length))

watch([searchQuery, statusFilter], () => {
  currentPage.value = 1
})

const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = 'All'
}

// =====================================================
// ACTIONS
// =====================================================

const formOpen = ref(false)
const editing = ref<VehicleRecord | null>(null)

const confirm = ref<{
  title: string
  message: string
  label: string
  danger: boolean
  run: () => Promise<{ message: string }>
} | null>(null)
const confirmBusy = ref(false)
const confirmError = ref('')

const openAdd = () => {
  editing.value = null
  formOpen.value = true
}

const menuItems = (v: VehicleRecord) => [
  { key: 'edit', label: 'Edit Vehicle', icon: Pencil },
  ...(v.status !== 'active' ? [{ key: 'active', label: 'Set Active', icon: CheckCircle2 }] : []),
  ...(v.status !== 'maintenance' ? [{ key: 'maintenance', label: 'Set Under Maintenance', icon: Wrench }] : []),
  ...(v.status !== 'inactive' ? [{ key: 'inactive', label: 'Set Inactive', icon: Ban }] : []),
  ...(v.trips_count === 0 ? [{ key: 'delete', label: 'Delete Vehicle', icon: Trash2, danger: true, dividerBefore: true }] : []),
]

const setStatus = (v: VehicleRecord, status: VehicleStatus) =>
  api.update(v.id, {
    plate_no: v.plate_no,
    description: v.description,
    vehicle_type: v.vehicle_type ?? '',
    capacity: v.capacity,
    status,
  })

const onAction = (v: VehicleRecord, key: string) => {
  confirmError.value = ''

  if (key === 'edit') {
    editing.value = v
    formOpen.value = true
    return
  }

  if (key === 'delete') {
    confirm.value = {
      title: `Delete ${v.plate_no}?`,
      message: 'This vehicle has no trip history and will be removed permanently.',
      label: 'Delete vehicle',
      danger: true,
      run: () => api.destroy(v.id),
    }
    return
  }

  const status = key as VehicleStatus
  const messages: Record<VehicleStatus, string> = {
    active: 'The vehicle can be assigned to trip tickets again.',
    maintenance: 'The vehicle stays listed but cannot be assigned until it is set Active again.',
    inactive: 'The vehicle is hidden from trip tickets. Its trip history is kept.',
  }
  confirm.value = {
    title: `${VEHICLE_STATUS_LABELS[status]}: ${v.plate_no}`,
    message: messages[status],
    label: `Set ${VEHICLE_STATUS_LABELS[status]}`,
    danger: status === 'inactive',
    run: () => setStatus(v, status),
  }
}

const runConfirm = async () => {
  if (!confirm.value) return
  confirmBusy.value = true
  confirmError.value = ''
  try {
    const response = await confirm.value.run()
    flash.value = response.message
    confirm.value = null
    await load()
  } catch (err) {
    confirmError.value = driverErrorMessage(err, 'Unable to save the change.')
  } finally {
    confirmBusy.value = false
  }
}

const onSaved = async (_vehicle: VehicleRecord, message: string) => {
  formOpen.value = false
  flash.value = message
  await load()
}
</script>

<template>
  <section class="vehicles-page">
    <PageHeader
      title="Vehicles"
      description="Company vehicles that can be assigned to trip tickets."
    >
      <AppButton :icon="Plus" @click="openAdd">
        Add Vehicle
      </AppButton>
    </PageHeader>

    <section class="stats-grid">
      <DriverStatCard label="Total Vehicles" :value="stats.total" description="Registered vehicles" accent="blue" :icon="Car" />
      <DriverStatCard label="Active" :value="stats.active" description="Can be assigned" accent="green" :icon="CheckCircle2" />
      <DriverStatCard label="On Trip" :value="stats.on_trip" description="Currently out" accent="orange" :icon="Truck" />
      <DriverStatCard label="Under Maintenance" :value="stats.maintenance" :description="`${stats.inactive} inactive`" accent="purple" :icon="Wrench" />
    </section>

    <p v-if="flash" class="flash" role="status">
      <CheckCircle2 :size="15" /> {{ flash }}
      <button type="button" class="flash-close" aria-label="Dismiss" @click="flash = ''">×</button>
    </p>
    <p v-if="loadError" class="load-error" role="alert">{{ loadError }}</p>

    <div class="filters-row">
      <div class="search-box">
        <Search :size="15" />
        <input v-model="searchQuery" type="text" placeholder="Search plate number, make, model or type..." aria-label="Search vehicles">
      </div>

      <div class="select-wrap">
        <select v-model="statusFilter" aria-label="Status">
          <option value="All">All Status</option>
          <option v-for="(label, value) in VEHICLE_STATUS_LABELS" :key="value" :value="value">{{ label }}</option>
        </select>
        <ChevronDown :size="14" class="select-icon" />
      </div>

      <button type="button" class="reset-btn" @click="resetFilters">Reset</button>
    </div>

    <BaseDataTable
      title="Vehicle List"
      description="Status, current use and last odometer reading of each vehicle."
      :has-rows="paginated.length > 0"
      :loading="loading"
      min-width="900px"
      empty-title="No vehicles found"
      empty-description="Add a vehicle or adjust your filters."
    >
      <template #headers>
        <th>Plate No.</th>
        <th>Type</th>
        <th>Capacity</th>
        <th>Status</th>
        <th>Current Use</th>
        <th>Last Odometer</th>
        <th>Trips</th>
        <th class="text-right"><span class="sr-only">Actions</span></th>
      </template>

      <template #rows>
        <tr v-for="v in paginated" :key="v.id">
          <td>
            <strong class="cell-title">{{ v.plate_no }}</strong>
            <small class="cell-sub">{{ v.description }}</small>
          </td>
          <td>{{ v.vehicle_type || '—' }}</td>
          <td>{{ v.capacity }} pax</td>
          <td>
            <span class="status-pill" :class="`vehicle-${v.status}`">{{ VEHICLE_STATUS_LABELS[v.status] }}</span>
          </td>
          <td>
            <span v-if="v.current_trip" class="cell-title on-trip">On {{ v.current_trip }}</span>
            <span v-else class="cell-title">Idle</span>
            <small class="cell-sub">
              {{ v.upcoming_trips ? `${v.upcoming_trips} upcoming trip${v.upcoming_trips > 1 ? 's' : ''}` : 'No upcoming trips' }}
            </small>
          </td>
          <td>{{ v.last_odometer !== null ? `${v.last_odometer.toLocaleString()} km` : '—' }}</td>
          <td>{{ v.trips_count }}</td>
          <td class="text-right">
            <TableActionMenu
              :items="menuItems(v)"
              :label="`Actions for ${v.plate_no}`"
              @select="key => onAction(v, key)"
            />
          </td>
        </tr>
      </template>
    </BaseDataTable>

    <BaseTableFooter
      v-model="currentPage"
      :showing-from="showingFrom"
      :showing-to="showingTo"
      :total-items="filtered.length"
      :total-pages="totalPages"
      item-label="vehicles"
    />

    <VehicleFormModal
      v-if="formOpen"
      :vehicle="editing"
      @close="formOpen = false"
      @saved="onSaved"
    />

    <AppConfirmModal
      v-if="confirm"
      :title="confirm.title"
      :message="confirm.message"
      :confirm-label="confirm.label"
      :danger="confirm.danger"
      :busy="confirmBusy"
      :error="confirmError"
      @close="confirm = null"
      @confirm="runConfirm"
    />
  </section>
</template>

<style scoped>
.vehicles-page {
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

.flash,
.load-error {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 14px;
  padding: 10px 12px;
  border-radius: 9px;
  font-size: 13px;
}

.flash { background: var(--green-soft); color: var(--green); }
.load-error { background: rgba(239, 68, 68, 0.12); color: #f87171; }

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

.search-box {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 8px;
  min-width: 240px;
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
  color: var(--text-muted);
}

.search-box input {
  width: 100%;
  border: 0;
  background: transparent;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 12px;
  outline: none;
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
.select-wrap select:focus-visible,
.reset-btn:focus-visible {
  border-color: var(--primary);
  outline: none;
}

.cell-title { display: block; }

.cell-sub {
  display: block;
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 11px;
}

.on-trip { color: #fbbf24; }

.vehicle-active { background: rgba(34, 197, 94, 0.12); color: #4ade80; }
.vehicle-maintenance { background: rgba(245, 158, 11, 0.12); color: #fbbf24; }
.vehicle-inactive { background: rgba(148, 163, 184, 0.12); color: #a8b3c4; }

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
  .select-wrap,
  .reset-btn { width: 100%; }
}
</style>
