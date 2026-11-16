<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Save } from 'lucide-vue-next'
import AppModalShell from '~/components/shared/AppModalShell.vue'
import { driverErrorMessage } from '~/composables/admin/drivers/useDriverApi'
import {
  VEHICLE_STATUS_LABELS,
  useVehicleApi,
  type VehicleRecord,
  type VehicleStatus,
} from '~/composables/admin/drivers/useVehicleApi'

const props = defineProps<{
  vehicle?: VehicleRecord | null // null = add
}>()

const emit = defineEmits<{
  close: []
  saved: [vehicle: VehicleRecord, message: string]
}>()

const api = useVehicleApi()
const isEdit = !!props.vehicle

const form = reactive({
  plate_no: props.vehicle?.plate_no ?? '',
  description: props.vehicle?.description ?? '',
  vehicle_type: props.vehicle?.vehicle_type ?? '',
  capacity: props.vehicle?.capacity ?? null as number | null,
  status: (props.vehicle?.status ?? 'active') as VehicleStatus,
})

const saving = ref(false)
const error = ref('')

const TYPES = ['Van', 'Pickup', 'Truck', 'SUV', 'Sedan', 'Motorcycle']

const submit = async () => {
  error.value = ''
  if (!form.plate_no.trim()) { error.value = 'Enter the plate number.'; return }
  if (!form.description.trim()) { error.value = 'Enter the make and model.'; return }
  if (!form.capacity || form.capacity < 1) { error.value = 'Capacity must be at least 1 passenger.'; return }

  saving.value = true
  try {
    const response = isEdit
      ? await api.update(props.vehicle!.id, { ...form })
      : await api.store({ ...form })
    emit('saved', response.data, response.message)
  } catch (err) {
    error.value = driverErrorMessage(err, 'Unable to save the vehicle.')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <AppModalShell
    eyebrow="VEHICLE"
    :title="isEdit ? `Edit ${vehicle!.plate_no}` : 'Add Vehicle'"
    subtitle="Vehicles marked Active can be assigned to trip tickets."
    :busy="saving"
    @close="emit('close')"
  >
    <div class="form-grid">
      <div>
        <label for="vh-plate">Plate number</label>
        <input id="vh-plate" v-model="form.plate_no" type="text" placeholder="e.g. ABC-1234" autocomplete="off">
      </div>
      <div>
        <label for="vh-desc">Make and model</label>
        <input id="vh-desc" v-model="form.description" type="text" placeholder="e.g. Toyota Hiace">
      </div>
      <div>
        <label for="vh-type">Type</label>
        <input id="vh-type" v-model="form.vehicle_type" type="text" list="vh-type-options" placeholder="e.g. Van">
        <datalist id="vh-type-options">
          <option v-for="t in TYPES" :key="t" :value="t" />
        </datalist>
      </div>
      <div>
        <label for="vh-capacity">Passenger capacity</label>
        <input id="vh-capacity" v-model.number="form.capacity" type="number" min="1" max="100" step="1" inputmode="numeric">
      </div>
      <div class="full">
        <label for="vh-status">Status</label>
        <select id="vh-status" v-model="form.status">
          <option v-for="(label, value) in VEHICLE_STATUS_LABELS" :key="value" :value="value">{{ label }}</option>
        </select>
        <p class="hint">
          Under Maintenance: listed but cannot be assigned. Inactive: hidden from trip tickets (e.g. sold).
        </p>
      </div>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <div class="modal-actions">
      <button type="button" class="btn ghost" :disabled="saving" @click="emit('close')">Cancel</button>
      <button type="button" class="btn primary" :disabled="saving" @click="submit">
        <Save :size="15" /> {{ saving ? 'Saving...' : isEdit ? 'Save changes' : 'Add vehicle' }}
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

input[type='number'] {
  width: 100%;
  padding: 9px 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 13px;
}

@media (max-width: 550px) {
  .form-grid { grid-template-columns: 1fr; }
}
</style>
