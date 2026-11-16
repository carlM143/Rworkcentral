<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { ImageUp, Save, X } from 'lucide-vue-next'
import AppModalShell from '~/components/shared/AppModalShell.vue'
import {
  driverErrorMessage,
  driverTodayLocal,
  useDriverApi,
  type DriverRecord,
} from '~/composables/admin/drivers/useDriverApi'

const props = defineProps<{ driver: DriverRecord }>()

const emit = defineEmits<{
  close: []
  saved: [driver: DriverRecord, message: string]
}>()

const api = useDriverApi()
const today = driverTodayLocal()

const form = reactive({
  drivers_code: props.driver.drivers_code,
  licence_no: props.driver.licence_no,
  expire_date: props.driver.expire_date,
})

const image = ref<File | null>(null)
const preview = ref<string | null>(props.driver.image_path)
const removeImage = ref(false)
const saving = ref(false)
const error = ref('')

const expired = computed(() => !!form.expire_date && form.expire_date < today)

const onFile = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null
  error.value = ''
  if (!file) return
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    error.value = 'Upload a JPG, PNG or WEBP image.'
    return
  }
  if (file.size > 4 * 1024 * 1024) {
    error.value = 'The photo must be 4 MB or smaller.'
    return
  }
  if (image.value && preview.value?.startsWith('blob:')) URL.revokeObjectURL(preview.value)
  image.value = file
  preview.value = URL.createObjectURL(file)
  removeImage.value = false
}

const clearPhoto = () => {
  if (preview.value?.startsWith('blob:')) URL.revokeObjectURL(preview.value)
  image.value = null
  preview.value = null
  removeImage.value = !!props.driver.image_path
}

onBeforeUnmount(() => {
  if (preview.value?.startsWith('blob:')) URL.revokeObjectURL(preview.value)
})

const submit = async () => {
  error.value = ''
  if (!form.drivers_code.trim()) { error.value = 'Enter the driver code.'; return }
  if (!form.licence_no.trim()) { error.value = 'Enter the license number.'; return }
  if (!form.expire_date) { error.value = 'Enter the license expiry date.'; return }

  saving.value = true
  try {
    const response = await api.update(props.driver.id, {
      ...form,
      image: image.value,
      remove_image: removeImage.value,
    })
    emit('saved', response.data, response.message)
  } catch (err) {
    error.value = driverErrorMessage(err, 'Unable to update the driver.')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <AppModalShell
    eyebrow="DRIVER"
    :title="`Edit ${driver.employee.name}`"
    subtitle="Renew or correct the license details. Department and position come from the employee record."
    :busy="saving"
    @close="emit('close')"
  >
    <div class="form-grid">
      <div>
        <label for="de-code">Driver code</label>
        <input id="de-code" v-model="form.drivers_code" type="text" autocomplete="off">
      </div>
      <div>
        <label for="de-licence">License number</label>
        <input id="de-licence" v-model="form.licence_no" type="text" autocomplete="off">
      </div>
      <div class="full">
        <label for="de-expiry">License expiry</label>
        <input id="de-expiry" v-model="form.expire_date" type="date">
        <p v-if="expired" class="warn">This date has passed, so the driver will show as License Expired and cannot be assigned.</p>
      </div>

      <div class="full">
        <label>License photo</label>
        <div class="photo-row">
          <div class="photo">
            <img v-if="preview" :src="preview" :alt="`License photo of ${driver.employee.name}`">
            <span v-else>No photo</span>
          </div>
          <div class="photo-actions">
            <label class="btn ghost upload">
              <ImageUp :size="15" /> {{ preview ? 'Replace photo' : 'Upload photo' }}
              <input type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" @change="onFile">
            </label>
            <button v-if="preview" type="button" class="btn ghost" @click="clearPhoto">
              <X :size="15" /> Remove
            </button>
            <p class="hint">JPG, PNG or WEBP, up to 4 MB.</p>
          </div>
        </div>
      </div>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <div class="modal-actions">
      <button type="button" class="btn ghost" :disabled="saving" @click="emit('close')">Cancel</button>
      <button type="button" class="btn primary" :disabled="saving" @click="submit">
        <Save :size="15" /> {{ saving ? 'Saving...' : 'Save changes' }}
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

.warn {
  margin: 8px 0 0;
  color: #fbbf24;
  font-size: 11px;
}

.photo-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.photo {
  display: flex;
  width: 160px;
  height: 100px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
  color: var(--text-muted);
  font-size: 11px;
}

.photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.photo-actions .hint { flex-basis: 100%; margin: 0; }

.upload {
  margin: 0 !important;
  cursor: pointer;
}

.upload:focus-within {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@media (max-width: 550px) {
  .form-grid { grid-template-columns: 1fr; }
  .photo-row { flex-direction: column; align-items: flex-start; }
}
</style>