<script setup lang="ts">
import { computed } from 'vue'
import AppModalShell from '~/components/shared/AppModalShell.vue'
import { driverTimeText } from '~/composables/admin/drivers/useDriverApi'
import type { TripTicketRecord } from '~/composables/admin/drivers/useTripTicketApi'

const props = defineProps<{ record: TripTicketRecord }>()
const emit = defineEmits<{ close: [] }>()

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Scheduled',
  ongoing: 'Ongoing',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const dateText = (v: string) =>
  new Date(`${v}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })

const duration = computed(() => {
  const m = props.record.duration_minutes
  return m === null ? '—' : `${Math.floor(m / 60)}h ${m % 60}m`
})
</script>

<template>
  <AppModalShell
    :eyebrow="record.ticket_no"
    title="Trip Ticket"
    :subtitle="`${dateText(record.trip_date)} · ${record.destination}`"
    @close="emit('close')"
  >
    <div class="info-grid">
      <div><small>Status</small><strong><span class="pill" :class="`pill-${record.status}`">{{ STATUS_LABELS[record.status] }}</span></strong></div>
      <div><small>Driver</small><strong>{{ record.driver.name }} · {{ record.driver.drivers_code }}</strong></div>
      <div><small>Vehicle</small><strong>{{ record.vehicle.plate_no }} · {{ record.vehicle.description }}</strong></div>
      <div><small>Passengers</small><strong>{{ record.passengers.length }} pax</strong></div>
      <div>
        <small>Departure</small>
        <strong>{{ record.departed_at ? driverTimeText(record.departed_at) : '—' }}</strong>
        <small>Plan {{ driverTimeText(record.scheduled_departure) }}</small>
      </div>
      <div>
        <small>Return</small>
        <strong>{{ record.returned_at ? driverTimeText(record.returned_at) : '—' }}</strong>
        <small>Expected {{ driverTimeText(record.expected_return) }}</small>
      </div>
      <div>
        <small>Odometer</small>
        <strong>
          {{ record.odometer_out?.toLocaleString() ?? '—' }} → {{ record.odometer_in?.toLocaleString() ?? '—' }}
        </strong>
        <small v-if="record.distance_km !== null">{{ record.distance_km.toLocaleString() }} km traveled</small>
      </div>
      <div><small>Duration</small><strong>{{ duration }}</strong></div>
    </div>

    <h3>Purpose</h3>
    <p class="detail-text">{{ record.purpose }}</p>

    <h3>Passengers</h3>
    <ul v-if="record.passengers.length" class="passengers">
      <li v-for="p in record.passengers" :key="p.id">
        <strong>{{ p.name }}</strong>
        <span>{{ p.emp_id }}<template v-if="p.department"> · {{ p.department }}</template></span>
      </li>
    </ul>
    <p v-else class="detail-text">No passengers (driver only).</p>

    <template v-if="record.remarks">
      <h3>Remarks</h3>
      <p class="detail-text">{{ record.remarks }}</p>
    </template>

    <div class="modal-actions">
      <button type="button" class="btn ghost" @click="emit('close')">Close</button>
    </div>
  </AppModalShell>
</template>

<style scoped>
.passengers {
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.passengers li {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 11px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
  font-size: 13px;
}

.passengers span {
  color: var(--text-muted);
  font-size: 12px;
}

.pill {
  display: inline-flex;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.pill-scheduled { background: rgba(59, 130, 246, 0.12); color: #60a5fa; }
.pill-ongoing { background: rgba(245, 158, 11, 0.12); color: #fbbf24; }
.pill-completed { background: rgba(34, 197, 94, 0.12); color: #4ade80; }
.pill-cancelled { background: rgba(148, 163, 184, 0.12); color: #a8b3c4; }
</style>