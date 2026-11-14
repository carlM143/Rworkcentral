<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ArrowLeft, CheckCircle2, Circle, Info, Plus, Search } from 'lucide-vue-next'
import { driverErrorMessage, driverTimeText, driverTodayLocal } from '~/composables/admin/drivers/useDriverApi'
import {
  useTripTicketApi,
  type TripDepartmentOption,
  type TripDriverOption,
  type TripPassengerOption,
  type TripRequesterOption,
  type TripVehicleOption,
} from '~/composables/admin/drivers/useTripTicketApi'

/**
 * Create and edit form for trip tickets.
 * Used by pages/admin/trip-tickets/create.vue and [id]/edit.vue.
 */
const props = defineProps<{
  ticketId?: number | null // set when editing
}>()

const route = useRoute()
const router = useRouter()
const api = useTripTicketApi()
const today = driverTodayLocal()
const isEdit = computed(() => !!props.ticketId)
const ticketNo = ref('')
const loadingTicket = ref(false)
const loadFailed = ref('')

// Optional prefill, e.g. /admin/trip-tickets/create?driver=1 (from Driver Profile)
const prefillDriverId = Number(route.query.driver) || null

const form = reactive({
  requesting_department_id: null as number | null,
  requested_by: null as number | null,
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

const departments = ref<TripDepartmentOption[]>([])
const requesters = ref<TripRequesterOption[]>([])
const drivers = ref<TripDriverOption[]>([])
const vehicles = ref<TripVehicleOption[]>([])
const passengers = ref<TripPassengerOption[]>([])
const loadingRequesters = ref(false)
const loadingOptions = ref(false)
const saving = ref(false)
const error = ref('')
const passengerSearch = ref('')
let prefillApplied = false

const timeValid = computed(() => form.expected_return > form.scheduled_departure)

// =====================================================
// REQUESTING DEPARTMENT + REQUESTER
// =====================================================

api.departments().then((response) => {
  departments.value = response.data
})

let pendingRequester: number | null = null

// Load the department's employees and pre-select the department head.
watch(() => form.requesting_department_id, async (departmentId) => {
  requesters.value = []
  form.requested_by = null
  if (!departmentId) return
  loadingRequesters.value = true
  try {
    const response = await api.requesters(departmentId)
    requesters.value = response.data
    // When editing, keep the saved requester; otherwise pre-select the head.
    const keep = pendingRequester && response.data.some(r => r.id === pendingRequester)
    form.requested_by = keep ? pendingRequester : response.data.find(r => r.is_head)?.id ?? null
    pendingRequester = null
  } finally {
    loadingRequesters.value = false
  }
})

const hasHead = computed(() => requesters.value.some(r => r.is_head))
const selectedDepartment = computed(() => departments.value.find(d => d.id === form.requesting_department_id) ?? null)
const selectedRequester = computed(() => requesters.value.find(r => r.id === form.requested_by) ?? null)

// =====================================================
// DRIVERS / VEHICLES / PASSENGERS FOR THE TIME WINDOW
// =====================================================

let optionsRequest = 0

const loadOptions = async () => {
  if (!form.trip_date || !timeValid.value) return
  const requestId = ++optionsRequest
  loadingOptions.value = true
  try {
    const options = await api.formOptions(
      form.trip_date,
      form.scheduled_departure,
      form.expected_return,
      form.requesting_department_id,
      props.ticketId ?? null,
    )
    if (requestId !== optionsRequest) return // a newer request is on its way
    drivers.value = options.drivers
    vehicles.value = options.vehicles
    passengers.value = options.passengers

    if (!prefillApplied && prefillDriverId) {
      prefillApplied = true
      if (options.drivers.find(d => d.id === prefillDriverId)?.available) form.driver_id = prefillDriverId
    }

    // Clear selections that are no longer free in the new window.
    if (form.driver_id && !options.drivers.find(d => d.id === form.driver_id)?.available) form.driver_id = null
    if (form.vehicle_id && !options.vehicles.find(v => v.id === form.vehicle_id)?.available) form.vehicle_id = null
    form.passenger_ids = form.passenger_ids.filter(id => options.passengers.find(p => p.id === id)?.available)
  } finally {
    if (requestId === optionsRequest) loadingOptions.value = false
  }
}

watch(
  () => [form.trip_date, form.scheduled_departure, form.expected_return, form.requesting_department_id],
  loadOptions,
  { immediate: true },
)

const sameDepartmentDrivers = computed(() => drivers.value.filter(d => d.same_department))
const otherDrivers = computed(() => drivers.value.filter(d => !d.same_department))
const availableDriverCount = computed(() => drivers.value.filter(d => d.available).length)

const selectedDriver = computed(() => drivers.value.find(d => d.id === form.driver_id) ?? null)
const selectedVehicle = computed(() => vehicles.value.find(v => v.id === form.vehicle_id) ?? null)

const filteredPassengers = computed(() => {
  const q = passengerSearch.value.trim().toLowerCase()
  return passengers.value.filter(p => !q || `${p.name} ${p.emp_id} ${p.department ?? ''}`.toLowerCase().includes(q))
})

const selectedPassengers = computed(() => passengers.value.filter(p => form.passenger_ids.includes(p.id)))

const overCapacity = computed(() =>
  !!selectedVehicle.value && form.passenger_ids.length > selectedVehicle.value.capacity)

const togglePassenger = (passenger: TripPassengerOption) => {
  if (!passenger.available) return
  const index = form.passenger_ids.indexOf(passenger.id)
  if (index >= 0) form.passenger_ids.splice(index, 1)
  else form.passenger_ids.push(passenger.id)
}

// =====================================================
// EDIT: LOAD THE SAVED TICKET
// =====================================================

const loadTicket = async () => {
  if (!props.ticketId) return
  loadingTicket.value = true
  loadFailed.value = ''
  try {
    const { data: t } = await api.show(props.ticketId)
    if (t.status !== 'scheduled') {
      loadFailed.value = `${t.ticket_no} is ${t.status} and can no longer be edited.`
      return
    }
    ticketNo.value = t.ticket_no
    pendingRequester = t.requested_by?.id ?? null
    Object.assign(form, {
      requesting_department_id: t.requesting_department?.id ?? null,
      trip_date: t.trip_date,
      scheduled_departure: t.scheduled_departure,
      expected_return: t.expected_return,
      driver_id: t.driver.id,
      vehicle_id: t.vehicle.id,
      destination: t.destination,
      purpose: t.purpose,
      passenger_ids: t.passengers.map(p => p.id),
      remarks: t.remarks ?? '',
    })
  } catch (err) {
    loadFailed.value = driverErrorMessage(err, 'Unable to load the trip ticket.')
  } finally {
    loadingTicket.value = false
  }
}

loadTicket()

// =====================================================
// CHECKLIST + SAVE
// =====================================================

const checklist = computed(() => [
  { label: 'Requesting department and requester', done: !!form.requesting_department_id && !!form.requested_by },
  { label: 'Trip date and time', done: !!form.trip_date && timeValid.value },
  { label: 'Available driver selected', done: !!form.driver_id },
  { label: 'Vehicle selected', done: !!form.vehicle_id },
  { label: 'Destination and purpose', done: !!form.destination.trim() && !!form.purpose.trim() },
  { label: 'Passengers within vehicle capacity', done: !overCapacity.value },
])

const canSave = computed(() => checklist.value.every(item => item.done))

const submit = async () => {
  error.value = ''
  if (!canSave.value) {
    error.value = 'Complete the required fields before creating the ticket.'
    return
  }
  saving.value = true
  try {
    if (props.ticketId) {
      const response = await api.update(props.ticketId, { ...form })
      router.push({ path: '/admin/trip-tickets', query: { updated: response.data.ticket_no } })
    } else {
      const response = await api.store({ ...form })
      router.push({ path: '/admin/trip-tickets', query: { created: response.data.ticket_no } })
    }
  } catch (err) {
    error.value = driverErrorMessage(err, props.ticketId ? 'Unable to update the trip ticket.' : 'Unable to create the trip ticket.')
  } finally {
    saving.value = false
  }
}

const dateText = (v: string) =>
  new Date(`${v}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
</script>

<template>
  <section class="trip-create-page">
    <PageHeader
      :title="isEdit ? `Edit ${ticketNo || 'Trip Ticket'}` : 'Create Trip Ticket'"
      :description="isEdit
        ? 'Change the request, schedule, driver, vehicle or passengers before the trip departs.'
        : 'Record who requested the trip, then assign an available driver, vehicle and passengers.'"
    >
      <AppButton variant="secondary" :icon="ArrowLeft" @click="router.push('/admin/trip-tickets')">
        Back
      </AppButton>
    </PageHeader>

    <div v-if="loadingTicket" class="state-card">Loading trip ticket...</div>
    <div v-else-if="loadFailed" class="state-card">
      <strong>Cannot edit this ticket</strong>
      <span>{{ loadFailed }}</span>
      <AppButton variant="secondary" :icon="ArrowLeft" @click="router.push('/admin/trip-tickets')">Back to Trip Tickets</AppButton>
    </div>

    <div v-else class="content-grid">
      <div class="form-column">
        <!-- REQUEST -->
        <section class="panel">
          <header class="panel-header">
            <h2>Request</h2>
            <span>Who is asking for the trip</span>
          </header>
          <div class="form-grid">
            <div class="field">
              <label for="tt-department">Requesting department <em>*</em></label>
              <select id="tt-department" v-model="form.requesting_department_id">
                <option :value="null" disabled>Select department</option>
                <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
              </select>
            </div>
            <div class="field">
              <label for="tt-requester">Requested by <em>*</em></label>
              <select id="tt-requester" v-model="form.requested_by" :disabled="!form.requesting_department_id || loadingRequesters">
                <option :value="null" disabled>
                  {{ !form.requesting_department_id ? 'Select a department first' : loadingRequesters ? 'Loading employees...' : 'Select employee' }}
                </option>
                <option v-for="r in requesters" :key="r.id" :value="r.id">
                  {{ r.name }} · {{ r.position }}{{ r.is_head ? ' (Head)' : '' }}
                </option>
              </select>
              <small v-if="form.requesting_department_id && !loadingRequesters && !hasHead" class="hint">
                No department head found. Positions with "Head", "Manager" or "Supervisor" in the title are treated as head.
              </small>
            </div>
          </div>
        </section>

        <!-- SCHEDULE -->
        <section class="panel">
          <header class="panel-header">
            <h2>Schedule</h2>
            <span>Planned departure and return</span>
          </header>
          <div class="form-grid three">
            <div class="field">
              <label for="tt-date">Trip date <em>*</em></label>
              <input id="tt-date" v-model="form.trip_date" type="date" :min="today">
            </div>
            <div class="field">
              <label for="tt-start">Departure (plan) <em>*</em></label>
              <input id="tt-start" v-model="form.scheduled_departure" type="time">
            </div>
            <div class="field">
              <label for="tt-end">Expected return <em>*</em></label>
              <input id="tt-end" v-model="form.expected_return" type="time">
            </div>
            <p v-if="!timeValid" class="error wide">Expected return must be after the departure time.</p>
          </div>
        </section>

        <!-- ASSIGNMENT -->
        <section class="panel">
          <header class="panel-header">
            <h2>Driver &amp; Vehicle</h2>
            <span>Only free ones in the selected time can be chosen</span>
          </header>
          <div class="form-grid">
            <div class="field">
              <label for="tt-driver">Driver <em>*</em></label>
              <select id="tt-driver" v-model="form.driver_id" :disabled="loadingOptions || !timeValid">
                <option :value="null" disabled>
                  {{ loadingOptions ? 'Checking availability...' : `Select driver (${availableDriverCount} available)` }}
                </option>
                <optgroup v-if="sameDepartmentDrivers.length" :label="`${selectedDepartment?.name ?? ''} drivers`">
                  <option v-for="d in sameDepartmentDrivers" :key="d.id" :value="d.id" :disabled="!d.available">
                    {{ d.name }} · {{ d.drivers_code }}{{ d.available ? '' : ` — ${d.reason}` }}
                  </option>
                </optgroup>
                <optgroup :label="sameDepartmentDrivers.length ? 'Other departments' : 'All drivers'">
                  <option v-for="d in otherDrivers" :key="d.id" :value="d.id" :disabled="!d.available">
                    {{ d.name }} · {{ d.drivers_code }}{{ d.department ? ` · ${d.department}` : '' }}{{ d.available ? '' : ` — ${d.reason}` }}
                  </option>
                </optgroup>
              </select>
            </div>
            <div class="field">
              <label for="tt-vehicle">Vehicle (plate) <em>*</em></label>
              <select id="tt-vehicle" v-model="form.vehicle_id" :disabled="loadingOptions || !timeValid">
                <option :value="null" disabled>Select vehicle</option>
                <option v-for="v in vehicles" :key="v.id" :value="v.id" :disabled="!v.available">
                  {{ v.plate_no }} · {{ v.description }} ({{ v.capacity }} pax){{ v.available ? '' : ` — ${v.reason}` }}
                </option>
              </select>
            </div>
            <div class="field wide">
              <label for="tt-destination">Destination <em>*</em></label>
              <input id="tt-destination" v-model="form.destination" type="text" placeholder="e.g. Toril Client Site">
            </div>
            <div class="field wide">
              <label for="tt-purpose">Purpose <em>*</em></label>
              <input id="tt-purpose" v-model="form.purpose" type="text" placeholder="e.g. Equipment installation support">
            </div>
          </div>
        </section>

        <!-- PASSENGERS -->
        <section class="panel">
          <header class="panel-header">
            <h2>Passengers</h2>
            <span class="count" :class="{ over: overCapacity }">
              {{ form.passenger_ids.length }}<template v-if="selectedVehicle"> / {{ selectedVehicle.capacity }}</template> selected
            </span>
          </header>
          <div class="passenger-wrap">
            <div class="passenger-search">
              <Search :size="15" />
              <input v-model="passengerSearch" type="text" placeholder="Search employee, employee no. or department..." aria-label="Search passengers">
            </div>
            <ul class="passenger-list">
              <li v-for="p in filteredPassengers" :key="p.id">
                <label class="passenger-item" :class="{ disabled: !p.available, checked: form.passenger_ids.includes(p.id) }">
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
            <p v-if="overCapacity" class="error">Too many passengers for {{ selectedVehicle?.plate_no }}.</p>
          </div>
        </section>

        <!-- REMARKS -->
        <section class="panel">
          <header class="panel-header">
            <h2>Remarks</h2>
            <span>Optional</span>
          </header>
          <div class="form-grid one">
            <div class="field">
              <label for="tt-remarks" class="sr-only">Remarks</label>
              <textarea id="tt-remarks" v-model="form.remarks" rows="3" placeholder="Notes for the driver or guard" />
            </div>
          </div>
        </section>

        <p v-if="error" class="error form-error" role="alert">{{ error }}</p>

        <div class="action-row">
          <AppButton variant="secondary" :disabled="saving" @click="router.push('/admin/trip-tickets')">Cancel</AppButton>
          <AppButton :icon="Plus" :disabled="saving || !canSave" @click="submit">
            {{ saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Trip Ticket' }}
          </AppButton>
        </div>
      </div>

      <!-- SUMMARY -->
      <aside class="panel side-panel">
        <header class="panel-header">
          <h2>Ticket Summary</h2>
        </header>

        <dl class="summary">
          <div><dt>Requested by</dt><dd>{{ selectedRequester ? `${selectedRequester.name}` : '—' }}<small v-if="selectedRequester">{{ selectedRequester.position }} · {{ selectedDepartment?.name }}</small></dd></div>
          <div><dt>Schedule</dt><dd>{{ dateText(form.trip_date) }}<small v-if="timeValid">{{ driverTimeText(form.scheduled_departure) }} – {{ driverTimeText(form.expected_return) }}</small></dd></div>
          <div><dt>Driver</dt><dd>{{ selectedDriver?.name ?? '—' }}<small v-if="selectedDriver">{{ selectedDriver.drivers_code }}<template v-if="selectedDriver.department"> · {{ selectedDriver.department }}</template></small></dd></div>
          <div><dt>Vehicle</dt><dd>{{ selectedVehicle?.plate_no ?? '—' }}<small v-if="selectedVehicle">{{ selectedVehicle.description }} · {{ selectedVehicle.capacity }} pax</small></dd></div>
          <div><dt>Destination</dt><dd>{{ form.destination || '—' }}<small v-if="form.purpose">{{ form.purpose }}</small></dd></div>
          <div>
            <dt>Passengers</dt>
            <dd>
              {{ selectedPassengers.length ? `${selectedPassengers.length} pax` : 'Driver only' }}
              <small v-if="selectedPassengers.length">{{ selectedPassengers.map(p => p.name).join(', ') }}</small>
            </dd>
          </div>
        </dl>

        <div class="checklist-block">
          <h3>Checklist</h3>
          <ul class="checklist">
            <li v-for="item in checklist" :key="item.label" :class="{ done: item.done }">
              <CheckCircle2 v-if="item.done" :size="15" />
              <Circle v-else :size="15" />
              {{ item.label }}
            </li>
          </ul>
        </div>

        <p class="info-note">
          <Info :size="15" />
          {{ isEdit ? 'Changes are allowed until the trip departs.' : 'The ticket is saved as Scheduled.' }} Record the actual departure and return with odometer readings from the Trip Tickets list.
        </p>
      </aside>
    </div>
  </section>
</template>

<style scoped>
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

.trip-create-page {
  width: 100%;
  max-width: 1660px;
  margin: 0 auto;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.9fr) minmax(280px, 0.9fr);
  gap: 18px;
  align-items: start;
}

.form-column {
  display: grid;
  gap: 14px;
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
  gap: 10px;
  padding: 16px 18px 12px;
  border-bottom: 1px solid var(--border-soft);
}

.panel-header h2 {
  margin: 0;
  font-size: 16px;
}

.panel-header span {
  color: var(--text-secondary);
  font-size: 11px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  padding: 16px 18px 18px;
}

.form-grid.three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.form-grid.one { grid-template-columns: 1fr; }

.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.field.wide,
.wide { grid-column: 1 / -1; }

.field > label {
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.field em {
  color: var(--red);
  font-style: normal;
}

.field input,
.field select,
.field textarea {
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 13px;
  color-scheme: dark;
}

.field textarea {
  padding: 10px 12px;
  resize: vertical;
  line-height: 1.5;
}

.field input:focus-visible,
.field select:focus-visible,
.field textarea:focus-visible {
  border-color: var(--primary);
  outline: none;
}

.hint {
  color: var(--text-muted);
  font-size: 11px;
}

.error {
  margin: 0;
  color: var(--red);
  font-size: 12px;
}

.count { color: var(--text-muted); }
.count.over { color: var(--red) !important; }

/* ===== Passengers ===== */

.passenger-wrap {
  padding: 14px 18px 18px;
}

.passenger-search {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  margin-bottom: 10px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
  color: var(--text-muted);
}

.passenger-search:focus-within { border-color: var(--primary); }

.passenger-search input {
  width: 100%;
  border: 0;
  background: transparent;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 12px;
  outline: none;
}

.passenger-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  max-height: 300px;
  margin: 0 0 8px;
  padding: 0;
  overflow-y: auto;
  list-style: none;
}

.passenger-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
  cursor: pointer;
}

.passenger-item:hover { border-color: var(--text-muted); }
.passenger-item.checked { border-color: var(--primary); }
.passenger-item.disabled { opacity: 0.45; cursor: not-allowed; }

.passenger-item input {
  width: 15px;
  height: 15px;
  accent-color: var(--primary);
}

.passenger-item strong,
.passenger-item small { display: block; }
.passenger-item strong { font-size: 12px; }
.passenger-item small { margin-top: 2px; color: var(--text-muted); font-size: 11px; }

.empty {
  padding: 10px;
  color: var(--text-muted);
  font-size: 12px;
}

.form-error { padding: 0 2px; }

.action-row {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* ===== Summary ===== */

.side-panel {
  position: sticky;
  top: 88px;
}

.summary {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 16px 18px;
}

.summary div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-soft);
}

.summary dt {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
}

.summary dd {
  margin: 0;
  font-size: 13px;
  text-align: right;
}

.summary dd small {
  display: block;
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 11px;
}

.checklist-block {
  padding: 0 18px 14px;
}

.checklist-block h3 {
  margin: 4px 0 10px;
  font-size: 12px;
}

.checklist {
  display: grid;
  gap: 9px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.checklist li {
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--text-muted);
  font-size: 12px;
}

.checklist li.done { color: var(--text-primary); }
.checklist li.done svg { color: var(--green); }

.info-note {
  display: flex;
  gap: 9px;
  margin: 0 18px 18px;
  padding: 12px;
  border-radius: 9px;
  background: var(--primary-soft);
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.5;
}

.info-note svg {
  flex-shrink: 0;
  margin-top: 1px;
  color: var(--primary);
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
  .content-grid { grid-template-columns: 1fr; }
  .side-panel { position: static; }
}

@media (max-width: 640px) {
  .form-grid,
  .form-grid.three,
  .passenger-list { grid-template-columns: 1fr; }
}
</style>
