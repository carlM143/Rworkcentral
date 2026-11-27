<script setup lang="ts">
import {
  Save,
  Users,
  UserCheck,
  ShieldCheck,
  UserX,
  Info,
  RotateCcw,
  UserRound,
  Building2,
} from 'lucide-vue-next'
import StatCard from '~/components/shared/StatCard.vue'
import AppButton from '~/components/ui/AppButton.vue'
import AppInput from '~/components/ui/AppInput.vue'
import AppSelect from '~/components/ui/AppSelect.vue'
import { useDepartmentApi, type DepartmentApiRecord } from '~/composables/admin/departments/useDepartmentApi'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Request Approvers | RWorkCentral' })

type Member = {
  id: number
  name: string
  position: string | null
  assigned: boolean
  eligible: boolean
}

const { $api } = useNuxtApp()
const departmentApi = useDepartmentApi()
const toast = useToast()

const departments = ref<DepartmentApiRecord[]>([])
const departmentId = ref<number | null>(null)
const members = ref<Member[]>([])
const selected = ref<number[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')

const search = ref('')
const eligibilityFilter = ref('')
const eligibilityOptions = ['Eligible Only', 'Assigned Only', 'Not Eligible']

let loadVersion = 0

const errorText = (cause: unknown) => {
  const result = cause as { data?: { message?: string }, message?: string }
  return result.data?.message || result.message || 'Please try again.'
}

const currentDepartmentName = computed(() =>
  departments.value.find(d => d.id === departmentId.value)?.department_name || 'Department',
)

const stats = computed(() => {
  const total = members.value.length
  const eligible = members.value.filter(m => m.eligible).length
  const assigned = selected.value.length
  const notEligible = total - eligible
  return { total, eligible, assigned, notEligible }
})

const hasUnsavedChanges = computed(() => {
  const original = members.value.filter(m => m.assigned).map(m => m.id).sort((a, b) => a - b)
  const current = [...selected.value].sort((a, b) => a - b)
  return original.length !== current.length || original.some((id, idx) => id !== current[idx])
})

const filteredMembers = computed(() => {
  const kw = search.value.trim().toLowerCase()
  return members.value.filter((m) => {
    const matchesSearch =
      !kw
      || m.name.toLowerCase().includes(kw)
      || (m.position || '').toLowerCase().includes(kw)

    const isSelected = selected.value.includes(m.id)
    const matchesFilter =
      !eligibilityFilter.value
      || (eligibilityFilter.value === 'Eligible Only' && m.eligible)
      || (eligibilityFilter.value === 'Assigned Only' && isSelected)
      || (eligibilityFilter.value === 'Not Eligible' && !m.eligible)

    return matchesSearch && matchesFilter
  }).slice().sort((a, b) => {
    // Eligible / assigned members float to the top for quick scanning
    if (a.eligible !== b.eligible) return a.eligible ? -1 : 1
    return a.name.localeCompare(b.name)
  })
})

const resetFilters = () => {
  search.value = ''
  eligibilityFilter.value = ''
}

const toggleMember = (member: Member) => {
  if (saving.value) return
  const isSelected = selected.value.includes(member.id)
  if (!member.eligible && !isSelected) return
  if (isSelected) {
    selected.value = selected.value.filter(id => id !== member.id)
  } else {
    selected.value = [...selected.value, member.id]
  }
}

onMounted(async () => {
  try {
    departments.value = (await departmentApi.getDepartments()).data
    departmentId.value = departments.value[0]?.id ?? null
  } catch (cause) {
    error.value = errorText(cause)
  }
})

watch(departmentId, async (id) => {
  const version = ++loadVersion
  members.value = []
  selected.value = []
  error.value = ''
  resetFilters()
  if (!id) return
  loading.value = true
  try {
    const response = await $api<{ data: Member[] }>(`/admin/departments/${id}/approvers`)
    if (version !== loadVersion) return
    members.value = response.data
    selected.value = response.data.filter(member => member.assigned).map(member => member.id)
  } catch (cause) {
    if (version === loadVersion) error.value = errorText(cause)
  } finally {
    if (version === loadVersion) loading.value = false
  }
})

const save = async () => {
  if (!departmentId.value || saving.value) return
  saving.value = true
  error.value = ''
  try {
    await $api(`/admin/departments/${departmentId.value}/approvers`, {
      method: 'PUT',
      body: { employee_ids: selected.value },
    })
    members.value = members.value.map(member => ({ ...member, assigned: selected.value.includes(member.id) }))
    toast.success('Approver Assignments Saved', `Updated department approvers for ${currentDepartmentName.value}.`)
  } catch (cause) {
    const msg = errorText(cause)
    error.value = msg
    toast.error('Unable to Save Assignments', msg)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="approvers-page">
    <!-- PAGE HEADER -->
    <PageHeader
      title="Request Approvers"
      description="Assign eligible employees to review and approve employee requests for their department before HR final approval."
    >
      <div class="header-actions">
        <AppButton
          :icon="Save"
          :disabled="saving || !departmentId || !hasUnsavedChanges"
          @click="save"
        >
          {{ saving ? 'Saving…' : 'Save Assignments' }}
        </AppButton>
      </div>
    </PageHeader>

    <!-- STATS GRID -->
    <div class="stats-grid">
      <StatCard
        label="Department Employees"
        :value="stats.total"
        :description="`In ${currentDepartmentName}`"
        :icon="Users"
        tone="blue"
      />
      <StatCard
        label="Assigned Approvers"
        :value="stats.assigned"
        description="Selected for department approval"
        :icon="UserCheck"
        tone="purple"
      />
      <StatCard
        label="Eligible Approvers"
        :value="stats.eligible"
        description="Active with approval permissions"
        :icon="ShieldCheck"
        tone="green"
      />
      <StatCard
        label="Not Eligible"
        :value="stats.notEligible"
        description="Missing module permissions"
        :icon="UserX"
        tone="orange"
      />
    </div>

    <!-- INFO NOTICE -->
    <div class="info-banner" role="status">
      <Info :size="16" class="info-icon" />
      <span>
        All eligible assigned approvers must approve before a request moves to HR for final approval.
        New requests snapshot their approver list when filed; changing assignments here only applies to future requests.
      </span>
    </div>

    <!-- FILTERS BAR -->
    <div class="filters-card">
      <div class="filters-grid">
        <div class="dept-select-wrap">
          <Building2 :size="15" class="dept-select-icon" />
          <select
            id="department"
            v-model="departmentId"
            class="dept-select"
            aria-label="Select Department"
            :disabled="saving || !departments.length"
          >
            <option v-if="!departments.length" :value="null">No departments available</option>
            <option v-for="department in departments" :key="department.id" :value="department.id">
              {{ department.department_name }}
            </option>
          </select>
        </div>

        <AppInput
          v-model="search"
          searchable
          placeholder="Search employee name or position..."
        />

        <AppSelect
          v-model="eligibilityFilter"
          :options="eligibilityOptions"
          placeholder="All Employees"
        />

        <AppButton
          variant="secondary"
          :icon="RotateCcw"
          @click="resetFilters"
        >
          Reset
        </AppButton>
      </div>
    </div>

    <p v-if="error" class="error-banner" role="alert">{{ error }}</p>

    <!-- TABLE CARD -->
    <article class="table-card">
      <div class="table-heading">
        <div>
          <h3>{{ currentDepartmentName }} — Department Approvers</h3>
          <p>Employees must be active and have View and Edit/Approve permissions for the request modules.</p>
        </div>
        <div class="heading-right">
          <span v-if="hasUnsavedChanges" class="unsaved-pill">Unsaved changes</span>
          <span class="record-count">
            {{ filteredMembers.length }}
            {{ filteredMembers.length === 1 ? 'Employee' : 'Employees' }}
          </span>
        </div>
      </div>

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th class="col-check">Assign</th>
              <th>Employee</th>
              <th>Eligibility</th>
              <th>Assignment Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="4">
                <div class="empty-state">
                  <div class="empty-icon"><Users :size="22" /></div>
                  <strong>Loading department employees…</strong>
                  <span>Fetching eligibility and current assignments.</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="!members.length">
              <td colspan="4">
                <div class="empty-state">
                  <div class="empty-icon"><Users :size="22" /></div>
                  <strong>No employees found in {{ currentDepartmentName }}</strong>
                  <span>Assign employees to this department first before configuring approvers.</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="!filteredMembers.length">
              <td colspan="4">
                <div class="empty-state">
                  <div class="empty-icon"><Users :size="22" /></div>
                  <strong>No matching employees</strong>
                  <span>Try adjusting your search keyword or eligibility filter.</span>
                </div>
              </td>
            </tr>
            <tr
              v-for="member in filteredMembers"
              v-else
              :key="member.id"
              class="member-row"
              :class="{
                'is-selectable': member.eligible || selected.includes(member.id),
                'is-selected': selected.includes(member.id),
                'is-disabled': !member.eligible && !selected.includes(member.id),
              }"
              @click="toggleMember(member)"
            >
              <td class="col-check" @click.stop>
                <input
                  v-model="selected"
                  type="checkbox"
                  class="styled-checkbox"
                  :value="member.id"
                  :aria-label="`Assign ${member.name}`"
                  :disabled="saving || (!member.eligible && !selected.includes(member.id))"
                >
              </td>
              <td>
                <div class="employee-cell">
                  <div class="employee-avatar" :class="{ assigned: selected.includes(member.id) }">
                    <UserRound :size="16" />
                  </div>
                  <div class="employee-info">
                    <strong>{{ member.name }}</strong>
                    <span>{{ member.position || 'No position recorded' }}</span>
                  </div>
                </div>
              </td>
              <td>
                <span class="status-badge" :class="member.eligible ? 'eligible' : 'not-eligible'">
                  <span class="status-dot" />
                  {{ member.eligible ? 'Eligible' : 'Not Eligible' }}
                </span>
              </td>
              <td>
                <span class="status-badge" :class="selected.includes(member.id) ? 'assigned' : 'unassigned'">
                  <span class="status-dot" />
                  {{ selected.includes(member.id) ? 'Assigned' : 'Unassigned' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- FOOTER -->
      <div class="table-footer">
        <p>
          <strong>{{ stats.assigned }}</strong> of <strong>{{ stats.eligible }}</strong> eligible employees assigned as approvers for <strong>{{ currentDepartmentName }}</strong>
        </p>
        <AppButton
          :icon="Save"
          :disabled="saving || !departmentId || !hasUnsavedChanges"
          @click="save"
        >
          {{ saving ? 'Saving…' : 'Save Assignments' }}
        </AppButton>
      </div>
    </article>
  </section>
</template>

<style scoped>
.approvers-page {
  width: 100%;
  max-width: 1680px;
  margin: 0 auto;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* STATS */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 14px;
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

/* INFO BANNER */
.info-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  padding: 11px 14px;
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 10px;
  background: rgba(59, 130, 246, 0.07);
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.5;
}

.info-icon {
  flex-shrink: 0;
  color: var(--primary);
}

.error-banner {
  margin: 0 0 14px;
  padding: 11px 14px;
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
  font-size: 12.5px;
}

/* FILTERS */
.filters-card {
  margin-bottom: 14px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.filters-grid {
  display: grid;
  grid-template-columns: 240px minmax(220px, 1fr) 180px auto;
  gap: 10px;
  align-items: center;
}

@media (max-width: 1024px) {
  .filters-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 600px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }
}

.dept-select-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.dept-select-icon {
  position: absolute;
  left: 11px;
  color: var(--text-muted);
  pointer-events: none;
}

.dept-select {
  width: 100%;
  height: 38px;
  padding: 0 12px 0 34px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font: inherit;
  font-size: 12.5px;
  font-weight: 600;
  outline: none;
  cursor: pointer;
}

.dept-select:focus {
  border-color: var(--primary);
}

/* TABLE CARD */
.table-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.table-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--border-soft);
}

.table-heading h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 700;
}

.table-heading p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 11.5px;
}

.heading-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.unsaved-pill {
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(245, 158, 11, 0.14);
  border: 1px solid rgba(245, 158, 11, 0.35);
  color: #fbbf24;
  font-size: 10.5px;
  font-weight: 700;
}

.record-count {
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 10.5px;
  font-weight: 650;
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  padding: 12px 16px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
}

td {
  padding: 12px 16px;
  border-top: 1px solid var(--border-soft);
  color: var(--text-secondary);
  font-size: 12px;
  vertical-align: middle;
}

.col-check {
  width: 64px;
  text-align: center;
}

.member-row {
  transition: background 0.15s ease;
}

.member-row.is-selectable {
  cursor: pointer;
}

.member-row.is-selectable:hover {
  background: var(--bg-card-soft);
}

.member-row.is-selected {
  background: rgba(59, 130, 246, 0.06);
}

.member-row.is-disabled {
  opacity: 0.65;
}

.styled-checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--primary);
  cursor: pointer;
}

.styled-checkbox:disabled {
  cursor: not-allowed;
}

.employee-cell {
  display: flex;
  align-items: center;
  gap: 11px;
}

.employee-avatar {
  display: flex;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: var(--bg-card-soft);
  border: 1px solid var(--border);
  color: var(--text-muted);
}

.employee-avatar.assigned {
  background: var(--primary-soft);
  border-color: rgba(59, 130, 246, 0.35);
  color: var(--primary);
}

.employee-info strong {
  display: block;
  color: var(--text-primary);
  font-size: 12.5px;
  font-weight: 700;
}

.employee-info span {
  display: block;
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 11px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.status-badge.eligible {
  background: rgba(34, 197, 94, 0.14);
  border: 1px solid rgba(34, 197, 94, 0.35);
  color: #4ade80;
}

.status-badge.not-eligible {
  background: var(--bg-card-soft);
  border: 1px solid var(--border);
  color: var(--text-muted);
}

.status-badge.assigned {
  background: rgba(59, 130, 246, 0.14);
  border: 1px solid rgba(59, 130, 246, 0.35);
  color: #60a5fa;
}

.status-badge.unassigned {
  background: var(--bg-card-soft);
  border: 1px solid var(--border);
  color: var(--text-muted);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 42px 16px;
  text-align: center;
  color: var(--text-muted);
}

.empty-icon {
  display: flex;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: var(--bg-card-soft);
  color: var(--primary);
}

.empty-state strong {
  color: var(--text-primary);
  font-size: 13.5px;
}

.empty-state span {
  font-size: 12px;
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 14px 18px;
  border-top: 1px solid var(--border-soft);
  font-size: 12px;
  color: var(--text-muted);
}

.table-footer p {
  margin: 0;
}

.table-footer strong {
  color: var(--text-primary);
}
</style>
