<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Plus } from 'lucide-vue-next'
import WfhModalShell from '~/components/admin/wfh/WfhModalShell.vue'
import { wfhErrorMessage } from '~/composables/admin/wfh/useWfhDocumentApi'
import {
  useWfhRequestApi,
  type WfhEmployeeOption, type WfhRequestRecord,
} from '~/composables/admin/wfh/useWfhRequestApi'

const props = defineProps<{ employees: WfhEmployeeOption[] }>()

const emit = defineEmits<{
  close: []
  saved: [record: WfhRequestRecord, message: string]
}>()

const api = useWfhRequestApi()
const saving = ref(false)
const error = ref('')
const days = ref<number | null>(null)
const daysError = ref('')

const form = reactive({
  employee_id: null as number | null,
  start_date: '',
  end_date: '',
  request_date: api.todayLocal(),
  supervisor_name: '',
  reason: '',
})

const selectedEmployee = computed(() => props.employees.find(e => e.id === form.employee_id) ?? null)

// Recalculate scheduled days whenever employee or dates change.
watch(() => [form.employee_id, form.start_date, form.end_date], async () => {
  days.value = null
  daysError.value = ''
  if (!form.employee_id || !form.start_date || !form.end_date) return
  try {
    const response = await api.preview({
      employee_id: form.employee_id,
      start_date: form.start_date,
      end_date: form.end_date,
    })
    days.value = response.data.number_of_days
  } catch (err) {
    daysError.value = wfhErrorMessage(err, 'Unable to calculate WFH days.')
  }
})

const submit = async () => {
  if (!form.employee_id) { error.value = 'Select an employee.'; return }
  if (!form.start_date || !form.end_date) { error.value = 'Enter the WFH start and end dates.'; return }
  if (!form.supervisor_name.trim()) { error.value = 'Enter the supervisor name.'; return }
  if (!form.reason.trim()) { error.value = 'Enter the reason for WFH.'; return }

  saving.value = true
  error.value = ''
  try {
    const response = await api.store({
      employee_id: form.employee_id,
      start_date: form.start_date,
      end_date: form.end_date,
      request_date: form.request_date,
      supervisor_name: form.supervisor_name.trim(),
      reason: form.reason.trim(),
    })
    emit('saved', response.data, response.message)
  } catch (err) {
    error.value = wfhErrorMessage(err, 'Unable to file the WFH request.')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <WfhModalShell
    eyebrow="WFH REQUEST"
    title="New WFH Request"
    subtitle="File a work-from-home request on behalf of an employee."
    :busy="saving"
    @close="emit('close')"
  >
    <div class="form-grid">
      <div class="full">
        <label for="req-employee">Employee</label>
        <select id="req-employee" v-model="form.employee_id">
          <option :value="null" disabled>Select employee</option>
          <option v-for="e in employees" :key="e.id" :value="e.id">{{ e.emp_id }} · {{ e.name }}</option>
        </select>
        <p v-if="selectedEmployee" class="hint">
          {{ selectedEmployee.department || 'No department' }}<template v-if="selectedEmployee.position"> · {{ selectedEmployee.position }}</template>
        </p>
      </div>

      <div>
        <label for="req-start">Start date</label>
        <input id="req-start" v-model="form.start_date" type="date">
      </div>

      <div>
        <label for="req-end">End date</label>
        <input id="req-end" v-model="form.end_date" type="date" :min="form.start_date || undefined">
      </div>

      <div class="full days-box" :class="{ invalid: daysError }">
        <template v-if="daysError">{{ daysError }}</template>
        <template v-else-if="days !== null">
          <strong>{{ days }}</strong> scheduled WFH {{ days === 1 ? 'day' : 'days' }}, based on the employee's work schedule
        </template>
        <template v-else>Select an employee and dates to calculate the number of WFH days.</template>
      </div>

      <div>
        <label for="req-date">Request date</label>
        <input id="req-date" v-model="form.request_date" type="date">
      </div>

      <div>
        <label for="req-supervisor">Supervisor name</label>
        <input id="req-supervisor" v-model="form.supervisor_name" type="text" placeholder="e.g. Roger Perez">
      </div>

      <div class="full">
        <label for="req-reason">Reason for WFH</label>
        <textarea id="req-reason" v-model="form.reason" rows="4" placeholder="Why does the employee need to work from home?" />
      </div>
    </div>

    <p class="hint">The request is saved as Pending. Approve it from the list to move it to WFH Document Review.</p>
    <p v-if="error" class="error">{{ error }}</p>

    <div class="modal-actions">
      <button class="btn ghost" :disabled="saving" @click="emit('close')">Cancel</button>
      <button class="btn primary" :disabled="saving || !!daysError" @click="submit">
        <Plus :size="15" /> {{ saving ? 'Filing...' : 'File request' }}
      </button>
    </div>
  </WfhModalShell>
</template>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 12px;
}

.form-grid .full { grid-column: 1 / -1; }

.days-box {
  margin-top: 14px;
  padding: 12px;
  border-radius: 8px;
  background: var(--primary-soft, rgb(50 123 255 / 12%));
  color: var(--text-secondary, #a2b0c6);
  font-size: 12px;
}

.days-box strong { color: var(--text-primary, #f8fafc); font-size: 15px; }
.days-box.invalid { background: var(--red-soft, rgb(239 68 68 / 12%)); color: var(--red, #ef4444); }

@media (max-width: 550px) {
  .form-grid { grid-template-columns: 1fr; }
}
</style>