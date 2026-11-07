<script setup lang="ts">
import { computed, ref } from 'vue'
import { Ban, LogIn, LogOut } from 'lucide-vue-next'
import AppModalShell from '~/components/shared/AppModalShell.vue'
import { driverErrorMessage, driverTimeText } from '~/composables/admin/drivers/useDriverApi'
import { tripNowHHmm, useTripTicketApi, type TripTicketRecord } from '~/composables/admin/drivers/useTripTicketApi'

type TripAction = 'depart' | 'return' | 'cancel'

const props = defineProps<{
  record: TripTicketRecord
  action: TripAction
}>()

const emit = defineEmits<{
  close: []
  saved: [record: TripTicketRecord, message: string]
}>()

const api = useTripTicketApi()
const saving = ref(false)
const error = ref('')

const lastReading = api.lastOdometer(props.record.vehicle.id, props.record.id)

const time = ref(tripNowHHmm())
const odometer = ref<number | null>(
  props.action === 'depart' ? lastReading : props.record.odometer_out,
)
const reason = ref('')

const title = computed(() => ({
  depart: 'Record Departure',
  return: 'Record Return',
  cancel: 'Cancel Trip Ticket',
})[props.action])

const subtitle = computed(() =>
  `${props.record.driver.name} · ${props.record.vehicle.plate_no} · ${props.record.destination}`)

const distance = computed(() =>
  props.action === 'return' && odometer.value !== null && props.record.odometer_out !== null
    ? odometer.value - props.record.odometer_out
    : null)

const duration = computed(() => {
  if (props.action !== 'return' || !props.record.departed_at || !time.value) return null
  const [dh, dm] = props.record.departed_at.split(':').map(Number)
  const [rh, rm] = time.value.split(':').map(Number)
  const minutes = ((rh ?? 0) * 60 + (rm ?? 0)) - ((dh ?? 0) * 60 + (dm ?? 0))
  return minutes > 0 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : null
})

const submit = async () => {
  saving.value = true
  error.value = ''
  try {
    const response = props.action === 'depart'
      ? await api.depart(props.record.id, { departed_at: time.value, odometer_out: odometer.value })
      : props.action === 'return'
        ? await api.returnTrip(props.record.id, { returned_at: time.value, odometer_in: odometer.value })
        : await api.cancel(props.record.id, reason.value)
    emit('saved', response.data, response.message)
  } catch (err) {
    error.value = driverErrorMessage(err, 'Unable to save.')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <AppModalShell
    :eyebrow="record.ticket_no"
    :title="title"
    :subtitle="subtitle"
    :busy="saving"
    @close="emit('close')"
  >
    <!-- DEPART / RETURN -->
    <template v-if="action !== 'cancel'">
      <div class="review-note">
        <template v-if="action === 'depart'">
          Planned departure: <strong>{{ driverTimeText(record.scheduled_departure) }}</strong>.
          <template v-if="lastReading !== null">
            Last recorded odometer for {{ record.vehicle.plate_no }}: <strong>{{ lastReading.toLocaleString() }} km</strong>.
          </template>
        </template>
        <template v-else>
          Departed at <strong>{{ driverTimeText(record.departed_at!) }}</strong> with
          odometer <strong>{{ record.odometer_out?.toLocaleString() }} km</strong>.
          Expected back by {{ driverTimeText(record.expected_return) }}.
        </template>
      </div>

      <div class="pair">
        <div>
          <label for="tt-time">{{ action === 'depart' ? 'Actual departure time' : 'Actual return time' }}</label>
          <input id="tt-time" v-model="time" type="time">
        </div>
        <div>
          <label for="tt-odo">{{ action === 'depart' ? 'Odometer out (km)' : 'Odometer in (km)' }}</label>
          <input id="tt-odo" v-model.number="odometer" type="number" min="0" step="1" inputmode="numeric">
        </div>
      </div>

      <p v-if="action === 'return' && (distance !== null || duration)" class="hint">
        <template v-if="distance !== null">Distance: <strong>{{ distance.toLocaleString() }} km</strong></template>
        <template v-if="distance !== null && duration"> · </template>
        <template v-if="duration">Trip duration: <strong>{{ duration }}</strong></template>
      </p>
    </template>

    <!-- CANCEL -->
    <template v-else>
      <div class="review-note">
        Cancel the trip to <strong>{{ record.destination }}</strong> on {{ record.trip_date }}
        ({{ driverTimeText(record.scheduled_departure) }}–{{ driverTimeText(record.expected_return) }}).
        The driver and vehicle become free for that time again.
      </div>
      <label for="tt-reason">Reason (required)</label>
      <textarea id="tt-reason" v-model="reason" rows="3" placeholder="Why is this trip cancelled?" />
    </template>

    <p v-if="error" class="error">{{ error }}</p>

    <div class="modal-actions">
      <button type="button" class="btn ghost" :disabled="saving" @click="emit('close')">Close</button>
      <button
        type="button"
        class="btn"
        :class="action === 'cancel' ? 'reject' : 'primary'"
        :disabled="saving"
        @click="submit"
      >
        <LogOut v-if="action === 'depart'" :size="15" />
        <LogIn v-else-if="action === 'return'" :size="15" />
        <Ban v-else :size="15" />
        {{ saving ? 'Saving...' : action === 'depart' ? 'Record departure' : action === 'return' ? 'Record return' : 'Cancel ticket' }}
      </button>
    </div>
  </AppModalShell>
</template>

<style scoped>
.pair {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 12px;
}

input[type='time'],
input[type='number'] {
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

@media (max-width: 550px) {
  .pair { grid-template-columns: 1fr; }
}
</style>