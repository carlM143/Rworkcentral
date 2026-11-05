<script setup lang="ts">
interface Location { id: number; location_name: string }
interface Holiday { id: number; holiday_name: string; holiday_date: string; applies_to: string; locations: Location[]; employee_coverage: 'all' | 'except' | 'only'; covered_employees: { id: number }[] }
interface Employee { id: number; emp_id: number; name: string; department: string | null; location_id: number | null; location: string | null; status: boolean }
const { $api } = useNuxtApp()
const { success } = useToast()
const year = ref(new Date().getFullYear())
const holidays = ref<Holiday[]>([])
const holidayId = ref<number | null>(null)
const holiday = ref<Holiday | null>(null)
const employees = ref<Employee[]>([])
const mode = ref<'all' | 'except' | 'only'>('all')
const selected = ref<number[]>([])
const search = ref('')
const loading = ref(false)
const saving = ref(false)
const error = ref('')
let listVersion = 0
let detailVersion = 0
const loadHolidays = async () => {
  const current = ++listVersion
  loading.value = true
  error.value = ''
  holiday.value = null
  holidayId.value = null
  try {
    const response = await $api<{ data: { holidays: Holiday[] } }>(`/admin/work-calendar/holidays?year=${year.value}`)
    if (current === listVersion) holidays.value = response.data.holidays
  } catch (problem: any) { if (current === listVersion) { holidays.value = []; error.value = problem?.data?.message || 'Unable to load holidays.' } }
  finally { if (current === listVersion) loading.value = false }
}
const loadCoverage = async () => {
  const current = ++detailVersion
  holiday.value = null
  employees.value = []
  if (!holidayId.value) return
  loading.value = true
  error.value = ''
  try {
    const response = await $api<{ data: { holiday: Holiday; employees: Employee[] } }>(`/admin/work-calendar/holidays/${holidayId.value}/coverage`)
    if (current !== detailVersion) return
    holiday.value = response.data.holiday
    employees.value = response.data.employees
    mode.value = response.data.holiday.employee_coverage
    selected.value = response.data.holiday.covered_employees.map(employee => employee.id)
  } catch (problem: any) { if (current === detailVersion) error.value = problem?.data?.message || 'Unable to load holiday coverage.' }
  finally { if (current === detailVersion) loading.value = false }
}
watch(year, loadHolidays)
watch(holidayId, loadCoverage)
onMounted(loadHolidays)
const matchesLocation = (employee: Employee) => holiday.value?.applies_to === 'all_locations' || holiday.value?.locations.some(location => location.id === employee.location_id)
const filtered = computed(() => employees.value.filter(employee => `${employee.name} ${employee.emp_id} ${employee.department ?? ''} ${employee.location ?? ''}`.toLowerCase().includes(search.value.trim().toLowerCase())))
const save = async () => {
  if (!holiday.value) return
  if (mode.value === 'only' && !selected.value.length) { error.value = 'Select at least one employee for the selected-only option.'; return }
  saving.value = true
  error.value = ''
  try {
    await $api(`/admin/work-calendar/holidays/${holiday.value.id}/coverage`, { method: 'PUT', body: { employee_coverage: mode.value, employee_ids: mode.value === 'all' ? [] : selected.value } })
    success('Coverage Saved', 'Holiday employee coverage was updated.')
    await loadCoverage()
  } catch (problem: any) { error.value = String(Object.values(problem?.data?.errors ?? {}).flat()[0] || problem?.data?.message || 'Unable to save coverage.') }
  finally { saving.value = false }
}
</script>

<template>
  <section class="coverage-page">
    <PageHeader title="Holiday Coverage" description="Choose which employees are covered by each holiday."><NuxtLink class="link-button" to="/admin/work-calendar">View Holiday Calendar</NuxtLink></PageHeader>
    <p v-if="error" class="error" role="alert">{{ error }}</p>
    <div class="panel selectors">
      <label>Year<input v-model.number.lazy="year" type="number" min="1900" max="9999" :disabled="saving" /></label>
      <label>Holiday<select v-model="holidayId" :disabled="saving || loading"><option :value="null">Select holiday</option><option v-for="item in holidays" :key="item.id" :value="item.id">{{ item.holiday_date.slice(0, 10) }} — {{ item.holiday_name }}</option></select></label>
    </div>
    <p v-if="loading" role="status">Loading holiday coverage…</p>
    <p v-else-if="!holidays.length && !error">No holidays found for this year.</p>
    <form v-if="holiday && !loading" class="panel" @submit.prevent="save">
      <h2>{{ holiday.holiday_name }}</h2>
      <p>Work locations: {{ holiday.applies_to === 'all_locations' ? 'All locations' : holiday.locations.map(location => location.location_name).join(', ') }}</p>
      <p>Location rules apply first. Employees outside the holiday's locations are not covered, even if selected. Current employee work locations are used.</p>
      <fieldset :disabled="saving"><legend>Apply Holiday To</legend>
        <label class="choice"><input v-model="mode" type="radio" value="all" /> All employees in selected locations</label>
        <label class="choice"><input v-model="mode" type="radio" value="except" /> All employees except selected employees</label>
        <label class="choice"><input v-model="mode" type="radio" value="only" /> Only selected employees</label>
        <div v-if="mode !== 'all'" class="employees">
          <label>Search employees<input v-model="search" placeholder="Name, number, department or location" /></label>
          <p>{{ selected.length }} selected. Inactive or out-of-location employees are shown for reference but are only covered when their location applies.</p>
          <div class="employee-list"><label v-for="employee in filtered" :key="employee.id" class="employee-row">
            <input v-model="selected" type="checkbox" :value="employee.id" />
            <span><strong>{{ employee.name }}</strong> · {{ employee.emp_id }}<small>{{ employee.department || 'No department' }} · {{ employee.location || 'No work location' }}{{ !employee.status ? ' · Inactive' : '' }}{{ !matchesLocation(employee) ? ' · Outside holiday locations' : '' }}</small></span>
          </label><p v-if="!filtered.length">No employees found.</p></div>
        </div>
        <button type="submit" class="save">{{ saving ? 'Saving…' : 'Save Coverage' }}</button>
      </fieldset>
    </form>
  </section>
</template>

<style scoped>
.coverage-page { max-width: 1660px; margin: auto; } .panel { border: 1px solid var(--border); background: var(--bg-card); border-radius: 12px; padding: 18px; margin-bottom: 16px; }
.selectors { display: flex; flex-wrap: wrap; gap: 16px; } label { display: flex; flex-direction: column; gap: 6px; font-size: 12px; }
input:not([type=radio]):not([type=checkbox]), select, button, .link-button { color: var(--text-primary); background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px; padding: 9px; font: inherit; }
.link-button { text-decoration: none; font-size: 12px; } h2 { font-size: 17px; } p { margin: 10px 0; color: var(--text-secondary); font-size: 12px; }
fieldset { border: 0; padding: 0; display: grid; gap: 12px; } legend { font-weight: 600; margin: 12px 0; } .choice, .employee-row { flex-direction: row; align-items: center; }
.employees { margin: 8px 0; } .employee-list { max-height: 360px; overflow: auto; border: 1px solid var(--border); border-radius: 8px; } .employee-row { padding: 10px; border-bottom: 1px solid var(--border); } small { display: block; margin-top: 4px; color: var(--text-secondary); }
.save { justify-self: start; background: var(--primary); color: white; cursor: pointer; } .error { color: #ef4444; }
</style>
