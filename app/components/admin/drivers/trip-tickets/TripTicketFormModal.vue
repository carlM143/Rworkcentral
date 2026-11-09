<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Plus, Search } from 'lucide-vue-next'
import AppModalShell from '~/components/shared/AppModalShell.vue'
import { driverErrorMessage, driverTodayLocal } from '~/composables/admin/drivers/useDriverApi'
import {
  useTripTicketApi,
  type TripDriverOption,
  type TripPassengerOption,
  type TripTicketRecord,
  type TripVehicleOption,
} from '~/composables/admin/drivers/useTripTicketApi'

const emit = defineEmits<{
  close: []
  saved: [record: TripTicketRecord, message: string]
}>()

const api = useTripTicketApi()
const today = driverTodayLocal()

const form = reactive({
  trip_date: today,
  scheduled_departure: '08:00',
  expected_return: '12:00',
  driver_id: null as number | null,
  vehicle_id: null as number | null,
  destination: '',
  purpose: '',
  passenger_ids: [] as number[],
  remarks: '',
})

const drivers = ref<TripDriverOption[]>([])
const vehicles = ref<TripVehicleOption[]>([])
const passengers = ref<TripPassengerOption[]>([])
const loadingOptions = ref(false)
const saving = ref(false)
const error = ref('')
const passengerSearch = ref('')

const timeValid = computed(() => form.expected_return > form.scheduled_departure)

// Reload who/what is free whenever the date or time window changes.
const loadOptions = async () => {
  if (!form.trip_date || !timeValid.value) return
  loadingOptions.value = true
  try {
    const options = await api.formOptions(form.trip_date, form.scheduled_departure, form.expected_return)
    drivers.value = options.drivers
    vehicles.value = options.vehicles
    passengers.value = options.passengers

    // Clear selections that are no longer free in the new window.
    if (form.driver_id && !options.drivers.find(d => d.id === form.driver_id)?.available) form.driver_id = null
    if (form.vehicle_id && !options.vehicles.find(v => v.id === form.vehicle_id)?.available) form.vehicle_id = null
    form.passenger_ids = form.passenger_ids.filter(id => options.passengers.find(p => p.id === id)?.available)
  } finally {
    loadingOptions.value = false
  }
}

watch(() => [form.trip_date, form.scheduled_departure, form.expected_return], loadOptions, { immediate: true })

const selectedVehicle = computed(() => vehicles.value.find(v => v.id === form.vehicle_id) ?? null)
const availableDriverCount = computed(() => drivers.value.filter(d => d.available).length)

const filteredPassengers = computed(() => {
  const q = passengerSearch.value.trim().toLowerCase()
  return passengers.value.filter(p => !q || `${p.name} ${p.emp_id} ${p.department ?? ''}`.toLowerCase().includes(q))
})

const overCapacity = computed(() =>
  !!selectedVehicle.value && form.passenger_ids.length > selectedVehicle.value.capacity)

const togglePassenger = (passenger: TripPassengerOption) => {
  if (!passenger.available) return
  const index = form.passenger_ids.indexOf(passenger.id)
  if (index >= 0) form.passenger_ids.splice(index, 1)
  else form.passenger_ids.push(passenger.id)
}

const submit = async () => {
  error.value = ''
  if (!timeValid.value) { error.value = 'Expected return must be after the departure time.'; return }
  if (overCapacity.value) { error.value = 'Too many passengers for the selected vehicle.'; return }
  saving.value = true
  try {
    const response = await api.store({ ...form })
    emit('saved', response.data, response.message)
  } catch (err) {
    error.value = driverErrorMessage(err, 'Unable to create the trip ticket.')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <AppModalShell
    eyebrow="TRIP TICKET"
    title="Create Trip Ticket"
    subtitle="Only drivers, vehicles and employees free in the selected time are selectable."
    :busy="saving"
    @close="emit('close')"
  >
    <div class="form-grid">
      <!-- WHEN -->
      <div>
        <label for="tt-date">Trip date</label>
        <input id="tt-date" v-model="form.trip_date" type="date" :min="today">
      </div>
      <div class="time-pair">
        <div>
          <label for="tt-start">Departure (plan)</label>
          <input id="tt-start" v-model="form.scheduled_departure" type="time">
        </div>
        <div>
          <label for="tt-end">Expected return</label>
          <input id="tt-end" v-model="form.expected_return" type="time">
        </div>
      </div>
      <p v-if="!timeValid" class="error full">Expected return must be after the departure time.</p>

      <!-- DRIVER -->
      <div>
        <label for="tt-driver">Driver</label>
        <select id="tt-driver" v-model="form.driver_id" :disabled="loadingOptions || !timeValid">
          <option :value="null" disabled>
            {{ loadingOptions ? 'Checking availability...' : `Select driver (${availableDriverCount} available)` }}
          </option>
          <option v-for="d in drivers" :key="d.id" :value="d.id" :disabled="!d.available">
            {{ d.name }} · {{ d.drivers_code }}{{ d.available ? '' : ` — ${d.reason}` }}
          </option>
        </select>
      </div>

      <!-- VEHICLE -->
      <div>
        <label for="tt-vehicle">Vehicle (plate)</label>
        <select id="tt-vehicle" v-model="form.vehicle_id" :disabled="loadingOptions || !timeValid">
          <option :value="null" disabled>Select vehicle</option>
          <option v-for="v in vehicles" :key="v.id" :value="v.id" :disabled="!v.available">
            {{ v.plate_no }} · {{ v.description }} ({{ v.capacity }} pax){{ v.available ? '' : ` — ${v.reason}` }}
          </option>
        </select>
      </div>

      <!-- WHERE / WHY -->
      <div class="full">
        <label for="tt-destination">Destination</label>
        <input id="tt-destination" v-model="form.destination" type="text" placeholder="e.g. Toril Client Site">
      </div>
      <div class="full">
        <label for="tt-purpose">Purpose</label>
        <input id="tt-purpose" v-model="form.purpose" type="text" placeholder="e.g. Equipment installation support">
      </div>

      <!-- PASSENGERS -->
      <div class="full">
        <label>
          Passengers
          <span class="count" :class="{ over: overCapacity }">
            {{ form.passenger_ids.length }}<template v-if="selectedVehicle"> / {{ selectedVehicle.capacity }}</template> selected
          </span>
        </label>
        <div class="passenger-box">
          <div class="passenger-search">
            <Search :size="14" />
            <input v-model="passengerSearch" type="text" placeholder="Search employee..." aria-label="Search passengers">
          </div>
          <ul class="passenger-list">
            <li v-for="p in filteredPassengers" :key="p.id">
              <label class="passenger-item" :class="{ disabled: !p.available }">
                <input
                  type="checkbox"
                  :checked="form.passenger_ids.includes(p.id)"
                  :disabled="!p.available"
                  @change="togglePassenger(p)"
                >
                <span>
                  <strong>{{ p.name }}</strong>
                  <small>{{ p.emp_id }}<template v-if="p.department"> · {{ p.department }}</template><template v-if="!p.available"> · {{ p.reason }}</template></small>
                </span>
              </label>
            </li>
            <li v-if="!filteredPassengers.length" class="empty">No employees match your search.</li>
          </ul>
        </div>
        <p v-if="overCapacity" class="error">Too many passengers for {{ selectedVehicle?.plate_no }}.</p>
      </div>

      <div class="full">
        <label for="tt-remarks">Remarks (optional)</label>
        <textarea id="tt-remarks" v-model="form.remarks" rows="2" placeholder="Notes for the driver or guard" />
      </div>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <div class="modal-actions">
      <button type="button" class="btn ghost" :disabled="saving" @click="emit('close')">Cancel</button>
      <button type="button" class="btn primary" :disabled="saving || !timeValid || overCapacity" @click="submit">
        <Plus :size="15" /> {{ saving ? 'Creating...' : 'Create ticket' }}
      </button>
    </div>
  </AppModalShell>
</template>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 12px;
}

.full { grid-column: 1 / -1; }

.time-pair {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 10px;
}

input[type='time'] {
  width: 100%;
  padding: 9px 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 13px;
  color-scheme: dark;
}

.count {
  margin-left: 6px;
  color: var(--text-muted);
  font-weight: 500;
}

.count.over { color: var(--red); }

.passenger-box {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
}

.passenger-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  border-bottom: 1px solid var(--border-soft);
  color: var(--text-muted);
}

.passenger-search input {
  width: 100%;
  min-height: 36px;
  border: 0 !important;
  background: transparent !important;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 12px;
  outline: none;
}

.passenger-list {
  max-height: 180px;
  margin: 0;
  padding: 4px;
  overflow-y: auto;
  list-style: none;
}

.passenger-item {
  display: flex !important;
  align-items: center;
  gap: 10px;
  margin: 0 !important;
  padding: 7px 8px;
  border-radius: 6px;
  font-weight: 400 !important;
  cursor: pointer;
}

.passenger-item:hover { background: var(--bg-card); }
.passenger-item.disabled { opacity: 0.45; cursor: not-allowed; }

.passenger-item input {
  width: 15px !important;
  height: 15px;
  accent-color: var(--primary);
}

.passenger-item strong,
.passenger-item small { display: block; }
.passenger-item strong { font-size: 12px; }
.passenger-item small { color: var(--text-muted); font-size: 11px; }

.empty {
  padding: 10px;
  color: var(--text-muted);
  font-size: 12px;
}

@media (max-width: 550px) {
  .form-grid { grid-template-columns: 1fr; }
}
</style>