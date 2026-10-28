<script setup lang="ts">
import type { PayrollUiGroup } from '~/composables/admin/usePayrollWorkspace'
import { reportTimestamp } from '~/utils/reportExport'
const props = defineProps<{ open: boolean; mode: 'view' | 'form' | 'delete'; group: PayrollUiGroup | null }>()
const emit = defineEmits<{ close: [] }>()
const workspace = usePayrollWorkspace()
const error = ref('')
const search = ref('')
const form = reactive({ name: '', description: '', frequency: 'Semi-Monthly' as PayrollUiGroup['frequency'], status: 'Active' as PayrollUiGroup['status'], memberIds: [] as number[] })
watch(() => [props.open, props.mode, props.group?.id], () => {
  error.value = ''; search.value = ''
  Object.assign(form, props.group ? { ...props.group, memberIds: [...props.group.memberIds] } : { name: '', description: '', frequency: 'Semi-Monthly', status: 'Active', memberIds: [] })
}, { immediate: true })
const employees = computed(() => workspace.employees.value.filter(employee => !search.value.trim() || [employee.firstName, employee.lastName, employee.employeeNumber, employee.department].join(' ').toLowerCase().includes(search.value.trim().toLowerCase())))
const members = computed(() => workspace.employees.value.filter(employee => props.group?.memberIds.includes(employee.id)))
const assignedGroup = (id: number) => workspace.groups.value.find(group => group.id !== props.group?.id && group.status === 'Active' && group.memberIds.includes(id))
const title = computed(() => props.mode === 'delete' ? 'Delete Payroll Group' : props.mode === 'view' ? 'Payroll Group Details' : props.group ? 'Edit Payroll Group' : 'Add Payroll Group')
const save = () => {
  error.value = ''
  try { workspace.saveGroup(form, props.group?.id); emit('close') }
  catch (problem) { error.value = problem instanceof Error ? problem.message : 'Unable to save this group.' }
}
const remove = () => {
  error.value = ''
  try { if (props.group) workspace.deleteGroup(props.group.id); emit('close') }
  catch (problem) { error.value = problem instanceof Error ? problem.message : 'Unable to delete this group.' }
}
</script>

<template>
  <PayrollDialog :open="open" :title="title" description="Sample payroll grouping for this session. Employee profiles and production payroll are not changed." @close="emit('close')">
    <p v-if="error" role="alert" class="error">{{ error }}</p>
    <form v-if="mode === 'form'" @submit.prevent="save">
      <div class="form-grid"><label>Group Name<input v-model="form.name" required maxlength="100"></label><label>Pay Frequency<select v-model="form.frequency" aria-label="Pay Frequency"><option>Weekly</option><option>Semi-Monthly</option><option>Monthly</option></select></label><label>Status<select v-model="form.status" aria-label="Group Status"><option>Active</option><option>Inactive</option></select></label><label>Description<input v-model="form.description" maxlength="250"></label></div>
      <label>Find Employees<input v-model="search" placeholder="Search employee name, number or department"></label>
      <p>{{ form.memberIds.length }} selected. Employees may belong to only one active payroll group.</p>
      <p v-if="!employees.length">No employees match this search.</p>
      <label v-for="employee in employees" :key="employee.id" class="check"><input v-model="form.memberIds" type="checkbox" :value="employee.id" :disabled="form.status === 'Active' && !!assignedGroup(employee.id)">{{ employee.firstName }} {{ employee.lastName }} · {{ employee.employeeNumber }}<small v-if="assignedGroup(employee.id)">Assigned to {{ assignedGroup(employee.id)?.name }}</small></label>
      <footer><AppButton variant="secondary" @click="emit('close')">Cancel</AppButton><AppButton type="submit">Save Group</AppButton></footer>
    </form>
    <template v-else-if="mode === 'delete' && group"><p>Delete <strong>{{ group.name }}</strong> from this sample workspace?</p><p>This removes the group only. Employee profiles are not deleted.</p><footer><AppButton variant="secondary" @click="emit('close')">Cancel</AppButton><AppButton variant="danger" :disabled="workspace.groupInUse(group.id)" @click="remove">Delete Group</AppButton></footer><p v-if="workspace.groupInUse(group.id)">This group is referenced by a saved payroll draft and cannot be deleted.</p></template>
    <template v-else-if="group"><dl><div><dt>Group Name</dt><dd>{{ group.name }}</dd></div><div><dt>Pay Frequency</dt><dd>{{ group.frequency }}</dd></div><div><dt>Status</dt><dd>{{ group.status }}</dd></div><div><dt>Updated</dt><dd>{{ reportTimestamp(group.updatedAt) }}</dd></div></dl><p>{{ group.description || 'No description recorded.' }}</p><h3>Members · {{ members.length }}</h3><ul><li v-for="employee in members" :key="employee.id">{{ employee.firstName }} {{ employee.lastName }} · {{ employee.employeeNumber }} · {{ employee.department }}</li></ul><footer><AppButton variant="secondary" @click="emit('close')">Close</AppButton></footer></template>
  </PayrollDialog>
</template>

<style scoped>
p,label,li { font-size:12px;line-height:1.6; } h3 { font-size:14px; }.form-grid,dl { display:grid;grid-template-columns:1fr 1fr;gap:16px; } label { display:flex;flex-direction:column;gap:7px;margin:10px 0; }
input:not([type="checkbox"]),select { padding:10px;border:1px solid var(--border);border-radius:7px;color:var(--text-primary);background:var(--bg-card-soft); }.check { flex-direction:row;align-items:center;gap:8px; } small,dt { color:var(--text-muted);font-size:11px; } dd { margin:5px 0;font-size:13px; }.error { color:var(--red); } footer { display:flex;justify-content:flex-end;gap:10px;margin-top:20px; }
@media(max-width:600px) { .form-grid,dl { grid-template-columns:1fr; } }
</style>
