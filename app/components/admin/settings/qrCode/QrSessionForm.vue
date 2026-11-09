<!-- Attendance QR: create a new QR session (name + active time window). -->
<script setup lang="ts">
import { QrCode } from 'lucide-vue-next'
import type { QrSessionPayload } from '~/types/qrCode/qrCode'

defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [payload: QrSessionPayload]
}>()

const pad = (value: number) => String(value).padStart(2, '0')

// <input type="datetime-local"> value in the browser's local time.
const toLocalInput = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`

const todayLabel = () =>
  new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const form = reactive<QrSessionPayload>({ name: '', starts_at: '', ends_at: '' })
const formError = ref('')

const setRange = (start: Date, end: Date) => {
  form.starts_at = toLocalInput(start)
  form.ends_at = toLocalInput(end)
}

const presetNowToEndOfDay = () => {
  const end = new Date()
  end.setHours(23, 59, 0, 0)
  setRange(new Date(), end)
}

const presetHours = (hours: number) => {
  const start = new Date()
  setRange(start, new Date(start.getTime() + hours * 3600_000))
}

const reset = () => {
  form.name = `Attendance – ${todayLabel()}`
  presetNowToEndOfDay()
  formError.value = ''
}

reset()

const submit = () => {
  formError.value = ''
  if (!form.name.trim()) {
    formError.value = 'Session name is required.'
    return
  }
  if (!form.starts_at || !form.ends_at) {
    formError.value = 'Start and end time are required.'
    return
  }
  if (form.ends_at <= form.starts_at) {
    formError.value = 'End time must be after the start time.'
    return
  }
  // The API runs in UTC; send full ISO timestamps so local times are not shifted.
  emit('submit', {
    name: form.name.trim(),
    starts_at: new Date(form.starts_at).toISOString(),
    ends_at: new Date(form.ends_at).toISOString(),
  })
}

defineExpose({ reset })
</script>

<template>
  <form class="qr-card" @submit.prevent="submit">
    <div class="card-heading">
      <h3>Generate QR Code</h3>
      <p>Employees scan this code to time in and time out while the session is active.</p>
    </div>

    <div class="card-body">
      <label class="field">
        <span>Session Name <em>*</em></span>
        <input v-model="form.name" maxlength="255" required placeholder="e.g. Main Office – Morning" />
      </label>

      <div class="field-row">
        <label class="field">
          <span>Starts At <em>*</em></span>
          <input v-model="form.starts_at" type="datetime-local" required />
        </label>
        <label class="field">
          <span>Ends At <em>*</em></span>
          <input v-model="form.ends_at" type="datetime-local" :min="form.starts_at" required />
        </label>
      </div>

      <div class="presets">
        <span>Quick set:</span>
        <button type="button" @click="presetNowToEndOfDay">Now – end of day</button>
        <button type="button" @click="presetHours(4)">Next 4 hours</button>
        <button type="button" @click="presetHours(9)">Next 9 hours</button>
      </div>

      <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>

      <AppButton type="submit" :icon="QrCode" :disabled="loading">
        {{ loading ? 'Generating...' : 'Generate QR Code' }}
      </AppButton>
    </div>
  </form>
</template>

<style scoped>
.qr-card{overflow:hidden;border:1px solid var(--border);border-radius:11px;background:var(--bg-card);box-shadow:var(--shadow)}
.card-heading{padding:15px 16px;border-bottom:1px solid var(--border-soft)}
.card-heading h3{margin:0;color:var(--text-primary);font-size:14px;font-weight:700}
.card-heading p{margin:5px 0 0;color:var(--text-muted);font-size:11px;line-height:1.5}
.card-body{display:grid;gap:12px;padding:16px}
.field{display:grid;gap:6px;min-width:0}
.field>span{color:var(--text-primary);font-size:11px;font-weight:650}
.field em{color:var(--red,#ef4444);font-style:normal}
.field input{width:100%;height:39px;box-sizing:border-box;padding:0 11px;border:1px solid var(--border);border-radius:8px;background:var(--bg-card-soft);color:var(--text-primary);font:inherit;font-size:12px;outline:none;color-scheme:inherit}
.field input:focus{border-color:var(--primary)}
.field-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.presets{display:flex;flex-wrap:wrap;align-items:center;gap:6px;color:var(--text-muted);font-size:10px}
.presets button{padding:5px 9px;border:1px solid var(--border-soft);border-radius:6px;background:var(--bg-card-soft);color:var(--text-secondary);font:inherit;font-size:10px;cursor:pointer}
.presets button:hover{border-color:var(--primary);color:var(--primary)}
.form-error{margin:0;padding:10px 12px;border:1px solid #ef444455;border-radius:8px;background:var(--red-soft,#ef444415);color:var(--red,#ef4444);font-size:11px}
@media(max-width:600px){.field-row{grid-template-columns:1fr}}
</style>
