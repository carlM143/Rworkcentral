<script setup lang="ts">
import { CalendarDays, X } from 'lucide-vue-next'

const props = defineProps<{ open: boolean; employeeId?: number }>()
const emit = defineEmits<{ close: []; saved: [] }>()
const { $api } = useNuxtApp()
const toast = useToast()
const dialog = ref<HTMLDialogElement | null>(null)
interface EmployeeOption {
  employeeId: number; employeeNumber: string; employeeName: string
  employmentId: number | null; employmentTypeId: number | null; employmentType: string; dateHired: string
}
interface EmploymentTypeOption { id: number; name: string; status?: string | boolean | number }
interface LifecyclePolicy { id: number; name: string; employment_type_id: number | null; status: string | boolean | number }
interface LifecycleStage { id: number; lifecycle_policy_id: number; stage_name: string; months_after_hire: number; status: string | boolean | number }
interface Change {
  id: number; previous_type_name: string; new_type_name: string; reason: string; changed_by_name: string; created_at: string
}
const employees = ref<EmployeeOption[]>([])
const types = ref<EmploymentTypeOption[]>([])
const policies = ref<LifecyclePolicy[]>([])
const stages = ref<LifecycleStage[]>([])
const history = ref<Change[]>([])
const employeeId = ref('')
const newTypeId = ref('')
const reason = ref('')
const loading = ref(false)
const saving = ref(false)
const historyLoading = ref(false)
const error = ref('')
const historyError = ref('')
const employee = computed(() => employees.value.find(e => e.employeeId === Number(employeeId.value)))
const newType = computed(() => types.value.find(t => t.id === Number(newTypeId.value)))
const isActive = (status: unknown) => [true, 1, '1', 'active', 'Active'].includes(status as string | number | boolean)
const availableTypes = computed(() => {
  const active = types.value.filter(t => isActive(t.status))
  return active.length ? active : types.value
})
const addMonths = (value: string, months: number) => {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(date.getTime())) return null
  const day = date.getDate()
  date.setDate(1)
  date.setMonth(date.getMonth() + months)
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  date.setDate(Math.min(day, lastDay))
  return date
}
const formatDate = (date: Date | null) => date
  ? date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  : 'Date unavailable'
const hireDate = computed(() => employee.value?.dateHired ? addMonths(employee.value.dateHired, 0) : null)
// Target dates preview, calculated exactly like the backend: hire date plus
// the stage offset of the policy that matches the selected employment type.
const planStages = computed(() => {
  const current = employee.value
  const type = newType.value
  if (!current?.dateHired || !type) return []
  const policyIds = policies.value
    .filter(policy => isActive(policy.status) && Number(policy.employment_type_id) === type.id)
    .map(policy => policy.id)
  return stages.value
    .filter(stage => isActive(stage.status) && policyIds.includes(Number(stage.lifecycle_policy_id)))
    .slice()
    .sort((a, b) => a.months_after_hire - b.months_after_hire)
    .map(stage => ({ ...stage, targetDate: formatDate(addMonths(current.dateHired, stage.months_after_hire)) }))
})
let historyRequest = 0
watch(employeeId, async id => {
  newTypeId.value = ''
  reason.value = ''
  history.value = []
  historyError.value = ''
  const request = ++historyRequest
  if (!id) { historyLoading.value = false; return }
  historyLoading.value = true
  try {
    const response = await $api<{ data: Change[] }>(`/admin/lifecycle/employees/${id}/employment-type-changes`)
    if (request === historyRequest) history.value = response.data
  } catch { if (request === historyRequest) historyError.value = 'Unable to load employment type history.' }
  finally { if (request === historyRequest) historyLoading.value = false }
})
watch(() => props.open, async open => {
  if (!open) { dialog.value?.close(); return }
  dialog.value?.showModal()
  error.value = ''; employeeId.value = ''; newTypeId.value = ''; reason.value = ''
  employees.value = []; types.value = []; policies.value = []; stages.value = []; history.value = []
  loading.value = true
  try {
    const [people, typeResponse] = await Promise.all([
      $api<{ data: EmployeeOption[] }>('/admin/lifecycle/employees'),
      $api<{ data: EmploymentTypeOption[] }>('/admin/employment-types'),
    ])
    employees.value = people.data; types.value = typeResponse.data
    employeeId.value = props.employeeId ? String(props.employeeId) : ''
    try {
      const [policyResponse, stageResponse] = await Promise.all([
        $api<{ data: LifecyclePolicy[] }>('/admin/lifecycle/policies'),
        $api<{ data: LifecycleStage[] }>('/admin/lifecycle/stages'),
      ])
      policies.value = policyResponse.data; stages.value = stageResponse.data
    } catch {
      policies.value = []; stages.value = []
    }
  } catch (err: any) { error.value = err?.data?.message || 'Unable to load employment details. Close and try again.' }
  finally { loading.value = false }
})
const close = () => { if (!saving.value) emit('close') }
const save = async () => {
  if (saving.value || !employee.value?.employmentId) return
  saving.value = true; error.value = ''
  try {
    await $api(`/admin/lifecycle/employees/${employee.value.employeeId}/employment-type-changes`, {
      method: 'POST', body: {
        employment_id: employee.value.employmentId, previous_type_id: employee.value.employmentTypeId,
        employment_type_id: Number(newTypeId.value), reason: reason.value.trim(),
      },
    })
    toast.success('Employment type updated', `${employee.value.employeeName}'s milestones now follow the new employment type policy.`)
    emit('saved'); emit('close')
  } catch (err: any) { error.value = Object.values(err?.data?.errors || {}).flat().join(' ') || err?.data?.message || 'Unable to update employment type.' }
  finally { saving.value = false }
}
</script>

<template>
  <dialog ref="dialog" class="employment-dialog" aria-labelledby="employment-change-title" @cancel.prevent="close">
    <header><h2 id="employment-change-title">Change Employment Type</h2><button type="button" aria-label="Close" :disabled="saving" @click="close"><X :size="20" /></button></header>
    <p>Update the employee’s employment type. Their lifecycle milestones are recalculated from the hire date and the new type’s policy stages. Completed history is kept.</p>
    <p v-if="loading" role="status">Loading employment details…</p>
    <p v-if="error" class="error" role="alert">{{ error }}</p>
    <form @submit.prevent="save">
      <fieldset :disabled="loading || saving">
        <label>Employee<select v-model="employeeId" required><option value="" disabled>Select employee</option><option v-for="e in employees" :key="e.employeeId" :value="String(e.employeeId)">{{ e.employeeNumber }} — {{ e.employeeName }}</option></select></label>
        <p v-if="employee">Current employment type: <strong>{{ employee.employmentType }}</strong><span v-if="hireDate"> · Hired {{ formatDate(hireDate) }}</span></p>
        <p v-if="employee && !employee.employmentId" role="status">This employee needs an employment record before their type can be changed.</p>
        <label>New employment type<select v-model="newTypeId" required :disabled="!employee?.employmentId"><option value="" disabled>Select new employment type</option><option v-for="t in availableTypes.filter(t => t.id !== employee?.employmentTypeId)" :key="t.id" :value="String(t.id)">{{ t.name }}</option></select></label>
        <label>Reason for change<textarea v-model="reason" required maxlength="5000" rows="3" placeholder="For example: qualified for regularization after evaluation" /></label>
      </fieldset>

      <section v-if="newTypeId && employee" class="plan-preview" aria-live="polite">
        <h3><CalendarDays :size="15" /> New lifecycle plan — {{ newType?.name }}</h3>
        <p v-if="!planStages.length" class="muted">No active lifecycle policy has stages for this employment type yet. Only the employment type will change; add a policy and stages to start tracking milestones.</p>
        <template v-else>
          <p class="muted">Target dates are based on the hire date ({{ formatDate(hireDate) }}) plus each stage's months after hire.</p>
          <ul>
            <li v-for="stage in planStages" :key="stage.id">
              <span>{{ stage.stage_name }}</span>
              <strong>{{ stage.targetDate }}</strong>
            </li>
          </ul>
          <p class="muted">Pending milestones from the previous plan are replaced. Completed milestones, remarks and evaluation attachments stay in the employee history.</p>
        </template>
      </section>

      <footer><AppButton type="button" variant="secondary" :disabled="saving" @click="close">Cancel</AppButton><AppButton type="submit" :disabled="loading || saving || !employee?.employmentId || !newTypeId || !reason.trim()">{{ saving ? 'Saving…' : 'Save Employment Type' }}</AppButton></footer>
    </form>
    <section v-if="employeeId" class="history">
      <h3>Employment Type History</h3>
      <p v-if="historyLoading" role="status">Loading history…</p><p v-else-if="historyError" role="alert">{{ historyError }}</p>
      <p v-else-if="!history.length">No employment type changes recorded.</p>
      <article v-for="change in history" :key="change.id"><strong>{{ change.previous_type_name }} → {{ change.new_type_name }}</strong><p>{{ change.reason }}</p><small>{{ change.changed_by_name }} · {{ change.created_at }}</small></article>
    </section>
  </dialog>
</template>

<style scoped>
.employment-dialog { width: min(620px, calc(100vw - 40px)); max-height: 90vh; overflow-y: auto; box-sizing: border-box; border: 1px solid var(--border); border-radius: 14px; padding: 24px; background: var(--bg-card); color: var(--text-primary); box-shadow: var(--shadow); }
.employment-dialog::backdrop { background: #0f172a80; }
header, footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; } h2 { font-size: 19px; margin: 0; } h3 { font-size: 14px; }
header button { border: 0; background: transparent; color: inherit; cursor: pointer; }
p, small { color: var(--text-muted); font-size: 12px; line-height: 1.6; } fieldset { border: 0; padding: 0; margin: 0; min-width: 0; }
label { display: flex; flex-direction: column; gap: 8px; margin: 18px 0; font-size: 12px; font-weight: 600; }
select, textarea { box-sizing: border-box; width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); background: var(--bg-card); font: inherit; }
footer { justify-content: flex-end; flex-wrap: wrap; margin-top: 18px; }.history { margin-top: 24px; border-top: 1px solid var(--border); } article { border-bottom: 1px solid var(--border); padding: 12px 0; font-size: 12px; }.error { color: #dc2626; }
.plan-preview { margin-top: 20px; padding: 14px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-card-soft); }
.plan-preview h3 { display: flex; align-items: center; gap: 7px; margin: 0 0 6px; color: var(--text-primary); }
.plan-preview .muted { margin: 6px 0; }
.plan-preview ul { list-style: none; margin: 10px 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.plan-preview li { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 10px; border-radius: 7px; background: var(--bg-card); font-size: 12px; }
.plan-preview li strong { color: var(--primary); white-space: nowrap; }
</style>
