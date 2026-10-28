<script setup lang="ts">
import { Plus, Download, Users, UsersRound, CalendarDays } from 'lucide-vue-next'
import type { PayrollUiGroup } from '~/composables/admin/usePayrollWorkspace'
const workspace = usePayrollWorkspace()
const search = ref('')
const status = ref('')
const currentPage = ref(1)
const filtered = computed(() => workspace.groups.value.filter(group => (!status.value || group.status === status.value) && (!search.value.trim() || [group.name, group.description, group.frequency].join(' ').toLowerCase().includes(search.value.trim().toLowerCase()))))
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / 8)))
const paginated = computed(() => filtered.value.slice((currentPage.value - 1) * 8, currentPage.value * 8))
watch([search, status], () => { currentPage.value = 1 })
watch(totalPages, count => { currentPage.value = Math.min(currentPage.value, count) })
const assigned = computed(() => new Set(workspace.groups.value.filter(group => group.status === 'Active').flatMap(group => group.memberIds)).size)
const open = ref(false)
const mode = ref<'view' | 'form' | 'delete'>('view')
const selected = ref<PayrollUiGroup | null>(null)
const exportOpen = ref(false)
const select = (action: string, group: PayrollUiGroup | null = null) => { mode.value = action as typeof mode.value; selected.value = group; open.value = true }
const exportRows = computed(() => filtered.value.map(group => ({ groupName: group.name, frequency: group.frequency, status: group.status, members: group.memberIds.length,
  employeeNames: workspace.employees.value.filter(employee => group.memberIds.includes(employee.id)).map(employee => employee.firstName + ' ' + employee.lastName).join('; '), description: group.description })))
</script>

<template>
  <section>
    <PageHeader title="Payroll Group" description="Organize employees by payroll frequency and group membership."><AppButton variant="secondary" :icon="Download" @click="exportOpen = true">Export</AppButton><AppButton :icon="Plus" @click="select('form')">Add Payroll Group</AppButton></PageHeader>
    <p class="notice">Sample groups · Changes are retained for this session.</p>
    <div class="group-stats"><StatCard label="Payroll Groups" :value="workspace.groups.value.length" description="Groups configured" :icon="Users" tone="blue" /><StatCard label="Active Groups" :value="workspace.groups.value.filter(group => group.status === 'Active').length" description="Available for payroll drafts" :icon="CalendarDays" tone="green" /><StatCard label="Assigned Employees" :value="assigned" description="Unique members of active groups" :icon="UsersRound" tone="purple" /></div>
    <div class="group-filters"><AppInput v-model="search" searchable placeholder="Search group name or frequency..." /><AppSelect v-model="status" :options="['Active', 'Inactive']" placeholder="All Statuses" aria-label="Group status filter" /><AppButton variant="secondary" @click="search = ''; status = ''">Reset</AppButton></div>
    <article class="group-table"><div class="table-scroll"><table><thead><tr><th>Group Name</th><th>Pay Frequency</th><th>Employees</th><th>Status</th><th>Description</th><th>Actions</th></tr></thead><tbody><tr v-if="!filtered.length"><td colspan="6">No payroll groups match your filters.</td></tr><tr v-for="group in paginated" :key="group.id"><td><strong>{{ group.name }}</strong></td><td>{{ group.frequency }}</td><td>{{ group.memberIds.length }}</td><td><StatusBadge :status="group.status" /></td><td>{{ group.description || '—' }}</td><td><PayrollActionMenu :label="'Actions for ' + group.name" :items="[{ key: 'view', label: 'View Details' }, { key: 'form', label: 'Edit Group' }, { key: 'delete', label: 'Delete Group', disabled: workspace.groupInUse(group.id), reason: 'Referenced by a saved payroll draft.' }]" @select="action => select(action, group)" /></td></tr></tbody></table></div></article>
    <footer><span>{{ filtered.length }} groups</span><AppPagination v-model="currentPage" :total-pages="totalPages" /></footer>
    <PayrollGroupDialog :open="open" :mode="mode" :group="selected" @close="open = false" />
    <PayrollExportDialog :open="exportOpen" title="Payroll Groups" :records="exportRows" :filters="{ Search: search, Status: status }" @close="exportOpen = false" />
  </section>
</template>

<style scoped>
.notice,footer { font-size:12px;color:var(--text-muted); }.group-stats { display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin:14px 0; }.group-filters { display:grid;grid-template-columns:1fr 200px auto;gap:10px;margin:14px 0;padding:12px;border:1px solid var(--border);border-radius:11px;background:var(--bg-card); }
.group-table { border:1px solid var(--border);border-radius:11px;background:var(--bg-card);overflow:hidden; }.table-scroll { overflow:auto; } table { width:100%;border-collapse:collapse;min-width:800px; } th,td { text-align:left;padding:13px;border-bottom:1px solid var(--border);font-size:12px; } th { background:var(--bg-card-soft);font-size:10px; } footer { display:flex;justify-content:space-between;align-items:center;margin-top:14px;gap:12px; }
@media(max-width:700px) { .group-stats,.group-filters { grid-template-columns:1fr; } }
</style>
