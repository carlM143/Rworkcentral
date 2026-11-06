<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ArrowLeft, CheckCircle2, Circle, ImageUp, Info, X } from 'lucide-vue-next'
import {
  driverErrorMessage,
  driverTodayLocal,
  useDriverApi,
  type DriverEmployeeOption,
} from '~/composables/admin/drivers/useDriverApi'

definePageMeta({
  layout: 'admin',
})

const router = useRouter()
const api = useDriverApi()

// =====================================================
// DATA
// =====================================================

const employees = ref<DriverEmployeeOption[]>([])
const loadingEmployees = ref(true)
const recentDrivers = ref(api.recent())

onMounted(async () => {
  try {
    const response = await api.eligibleEmployees()
    employees.value = response.data
  } finally {
    loadingEmployees.value = false
  }
})

// =====================================================
// FORM
// =====================================================

const form = reactive({
  employee_id: null as number | null,
  drivers_code: api.nextDriverCode(),
  licence_no: '',
  expire_date: '',
})

const image = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const imageInput = ref<HTMLInputElement | null>(null)
const saving = ref(false)
const error = ref('')

const today = driverTodayLocal()
const minExpiry = (() => {
  const d = new Date(`${today}T00:00:00`)
  d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})()

const selectedEmployee = computed(() => employees.value.find(e => e.id === form.employee_id) ?? null)

const daysToExpiry = computed(() => {
  if (!form.expire_date) return null
  const diff = new Date(`${form.expire_date}T00:00:00`).getTime() - new Date(`${today}T00:00:00`).getTime()
  return Math.round(diff / 86400000)
})

const expiryHint = computed(() => {
  const days = daysToExpiry.value
  if (days === null) return null
  if (days <= 0) return { tone: 'danger', text: 'This license is already expired. The driver cannot be assigned to trips.' }
  if (days <= 30) return { tone: 'warning', text: `License expires in ${days} day${days === 1 ? '' : 's'}. Remind the driver to renew.` }
  return null
})

const selectImage = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null
  if (!file) return
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 4 * 1024 * 1024) {
    error.value = 'License photo must be JPG, PNG or WEBP, up to 4 MB.'
    return
  }
  error.value = ''
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
  image.value = file
  imagePreview.value = URL.createObjectURL(file)
}

const removeImage = () => {
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
  image.value = null
  imagePreview.value = null
  if (imageInput.value) imageInput.value.value = ''
}

// =====================================================
// CHECKLIST (updates live as the form is filled)
// =====================================================

const checklist = computed(() => [
  { label: 'Employee selected', done: !!form.employee_id },
  { label: 'Driver code assigned', done: !!form.drivers_code.trim() },
  { label: 'License number entered', done: !!form.licence_no.trim() },
  { label: 'License is valid', done: (daysToExpiry.value ?? 0) > 0 },
  { label: 'License photo uploaded (optional)', done: !!image.value },
])

const canSave = computed(() =>
  !!form.employee_id && !!form.drivers_code.trim() && !!form.licence_no.trim() && (daysToExpiry.value ?? 0) > 0)

const saveDriver = async () => {
  if (!canSave.value) {
    error.value = 'Complete the required fields before saving.'
    return
  }
  saving.value = true
  error.value = ''
  try {
    await api.store({
      employee_id: form.employee_id!,
      drivers_code: form.drivers_code,
      licence_no: form.licence_no,
      expire_date: form.expire_date,
      image: image.value,
    })
    router.push('/admin/drivers')
  } catch (err) {
    error.value = driverErrorMessage(err, 'Unable to save the driver.')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="drivers-create-page">
    <PageHeader
      title="Add Driver"
      description="Register an existing employee as a company driver and record their license details."
    >
      <AppButton variant="secondary" :icon="ArrowLeft" @click="router.back()">
        Back
      </AppButton>
    </PageHeader>

    <div class="content-grid">
      <div class="form-panel">
        <div class="panel-header">
          <h2>Driver Information</h2>
          <span>Saved to drivers_info</span>
        </div>

        <div class="form-grid">
          <!-- EMPLOYEE -->
          <div class="field wide">
            <label for="driver-employee">Employee <em>*</em></label>
            <select id="driver-employee" v-model="form.employee_id" :disabled="loadingEmployees">
              <option :value="null" disabled>
                {{ loadingEmployees ? 'Loading employees...' : employees.length ? 'Select employee' : 'All employees are already drivers' }}
              </option>
              <option v-for="e in employees" :key="e.id" :value="e.id">
                {{ e.emp_id }} · {{ e.name }}
              </option>
            </select>
            <small v-if="selectedEmployee" class="hint">
              {{ selectedEmployee.department || 'No department' }}<template v-if="selectedEmployee.position"> · {{ selectedEmployee.position }}</template>
            </small>
            <small v-else class="hint">Only employees who are not yet drivers are listed.</small>
          </div>

          <!-- DRIVER CODE -->
          <div class="field">
            <label for="driver-code">Driver Code <em>*</em></label>
            <input id="driver-code" v-model="form.drivers_code" type="text" placeholder="DRV-007">
            <small class="hint">Suggested automatically. You can change it.</small>
          </div>

          <!-- LICENSE NO -->
          <div class="field">
            <label for="driver-license">License No. <em>*</em></label>
            <input id="driver-license" v-model="form.licence_no" type="text" placeholder="N03-2025-12345">
          </div>

          <!-- EXPIRY -->
          <div class="field">
            <label for="driver-expiry">License Expiry <em>*</em></label>
            <input id="driver-expiry" v-model="form.expire_date" type="date" :min="minExpiry">
            <small v-if="expiryHint" class="hint" :class="`hint-${expiryHint.tone}`">{{ expiryHint.text }}</small>
          </div>

          <!-- LICENSE PHOTO -->
          <div class="field">
            <label for="driver-photo">License Photo</label>
            <div v-if="imagePreview" class="photo-preview">
              <img :src="imagePreview" alt="License photo preview">
              <button type="button" class="photo-remove" aria-label="Remove photo" @click="removeImage">
                <X :size="14" />
              </button>
            </div>
            <label v-else class="photo-drop" for="driver-photo">
              <ImageUp :size="18" />
              <span>Upload JPG, PNG or WEBP (max 4 MB)</span>
            </label>
            <input id="driver-photo" ref="imageInput" class="sr-only" type="file" accept=".jpg,.jpeg,.png,.webp" @change="selectImage">
          </div>
        </div>

        <p class="info-note">
          <Info :size="15" />
          Vehicle, plate and route are chosen per trip ticket. Availability is computed automatically from the
          driver's work schedule, approved leave, trips and license expiry.
        </p>

        <p v-if="error" class="form-error" role="alert">{{ error }}</p>

        <div class="action-row">
          <AppButton variant="secondary" :disabled="saving" @click="router.back()">Cancel</AppButton>
          <AppButton :icon="CheckCircle2" :disabled="saving || !canSave" @click="saveDriver">
            {{ saving ? 'Saving...' : 'Save Driver' }}
          </AppButton>
        </div>
      </div>

      <aside class="side-panel">
        <div class="panel-header">
          <h2>Checklist</h2>
          <span>Before saving</span>
        </div>

        <ul class="checklist">
          <li v-for="item in checklist" :key="item.label" :class="{ done: item.done }">
            <CheckCircle2 v-if="item.done" :size="15" />
            <Circle v-else :size="15" />
            {{ item.label }}
          </li>
        </ul>

        <div class="mini-list">
          <h3>Recent driver records</h3>
          <div v-for="item in recentDrivers" :key="item.id" class="mini-item">
            <strong>{{ item.name }}</strong>
            <span>{{ item.drivers_code }}<template v-if="item.department"> · {{ item.department }}</template></span>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.drivers-create-page {
  width: 100%;
  max-width: 1660px;
  margin: 0 auto;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.9fr) minmax(260px, 0.9fr);
  gap: 18px;
  align-items: start;
}

.form-panel,
.side-panel {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 18px 18px 14px;
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
  gap: 16px;
  padding: 18px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.field.wide {
  grid-column: 1 / -1;
}

.field > label {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-secondary);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.field em {
  color: var(--red);
  font-style: normal;
}

.field input[type='text'],
.field input[type='date'],
.field select {
  height: 42px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  padding: 0 12px;
  font-family: inherit;
  font-size: 13px;
  color-scheme: dark;
}

.field input:focus-visible,
.field select:focus-visible {
  border-color: var(--primary);
  outline: none;
}

.hint {
  color: var(--text-muted);
  font-size: 11px;
}

.hint-warning { color: #fbbf24; }
.hint-danger { color: #f87171; }

.photo-drop {
  display: flex;
  height: 42px;
  align-items: center;
  gap: 9px;
  padding: 0 12px;
  border: 1px dashed var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
}

.photo-drop:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.photo-preview {
  position: relative;
  width: 120px;
  height: 80px;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 9px;
}

.photo-preview img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  display: grid;
  width: 22px;
  height: 22px;
  place-items: center;
  border: 0;
  border-radius: 6px;
  background: rgb(0 0 0 / 60%);
  color: #fff;
  cursor: pointer;
}

.info-note {
  display: flex;
  gap: 9px;
  margin: 0 18px 16px;
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

.form-error {
  margin: 0 18px 12px;
  color: var(--red);
  font-size: 12px;
}

.action-row {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 0 18px 18px;
}

.side-panel {
  padding-bottom: 18px;
}

.checklist {
  list-style: none;
  margin: 0;
  padding: 18px;
  display: grid;
  gap: 11px;
}

.checklist li {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-muted);
  font-size: 12px;
}

.checklist li.done {
  color: var(--text-primary);
}

.checklist li.done svg {
  color: var(--green);
}

.mini-list {
  border-top: 1px solid var(--border-soft);
  padding: 18px 18px 0;
}

.mini-list h3 {
  margin: 0 0 10px;
  font-size: 12px;
}

.mini-item {
  padding: 8px 0;
  border-bottom: 1px solid var(--border-soft);
}

.mini-item:last-child {
  border-bottom: 0;
}

.mini-item strong,
.mini-item span {
  display: block;
}

.mini-item strong {
  font-size: 13px;
}

.mini-item span {
  margin-top: 2px;
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

@media (max-width: 980px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>