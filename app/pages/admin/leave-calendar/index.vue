<script setup lang="ts">
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-vue-next'

definePageMeta({ alias: ['/admin/holiday-leave', '/admin/work-calendar'] })
interface Location { id: number; location_name: string; city: string }
interface Holiday {
  id: number; holiday_name: string; holiday_date: string; holiday_type_id: number; is_working_day: boolean
  applies_to: string; locations: Location[]; holiday_type?: { type_name: string }
}
interface HolidayType { id: number; type_name: string; type_code: string }
interface CalendarData { holidays: Holiday[]; locations: Location[]; types: HolidayType[] }
const { $api } = useNuxtApp()
const { success } = useToast()
const today = new Date()
const month = ref(new Date(today.getFullYear(), today.getMonth(), 1))
const locationId = ref('')
const selectedDay = ref('')
const loading = ref(false)
const error = ref('')
const data = ref<CalendarData>({ holidays: [], locations: [], types: [] })
const classificationOptions = computed(() => data.value.types.filter(type => ['REGULAR', 'SPECIAL', 'COMPANY', 'LOCAL'].includes(type.type_code)))
const formOpen = ref(false)
const saving = ref(false)
const formError = ref('')
const editingHoliday = ref<Holiday | null>(null)
const form = reactive({ holiday_name: '', holiday_date: '', holiday_type_id: 0, is_working_day: false, applies_to: 'all_locations', location_ids: [] as number[] })
const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const monthLabel = computed(() => month.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }))
const dates = computed(() => {
  const start = new Date(month.value.getFullYear(), month.value.getMonth(), 1 - month.value.getDay())
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    return { key: dateKey(date), day: date.getDate(), current: date.getMonth() === month.value.getMonth() }
  })
})
const holidaysOn = (day: string) => data.value.holidays.filter(holiday => holiday.holiday_date.slice(0, 10) === day)
let loadVersion = 0
const load = async () => {
  const version = ++loadVersion
  loading.value = true
  error.value = ''
  try {
    const query = new URLSearchParams({ start: dates.value[0]!.key, end: dates.value[41]!.key })
    if (locationId.value) query.set('location_id', locationId.value)
    const response = await $api<{ data: CalendarData }>(`/admin/work-calendar?${query}`)
    if (version === loadVersion) data.value = response.data
  } catch (problem: any) {
    if (version === loadVersion) { error.value = problem?.data?.message || 'Unable to load holidays.'; data.value.holidays = [] }
  } finally { if (version === loadVersion) loading.value = false }
}
watch([month, locationId], load)
onMounted(load)
const changeMonth = (offset: number) => { month.value = new Date(month.value.getFullYear(), month.value.getMonth() + offset, 1) }
const openForm = (holiday?: Holiday) => {
  editingHoliday.value = holiday ?? null
  formError.value = ''
  Object.assign(form, {
    holiday_name: holiday?.holiday_name ?? '', holiday_date: holiday?.holiday_date.slice(0, 10) ?? (selectedDay.value || dateKey(today)),
    holiday_type_id: holiday?.holiday_type_id ?? classificationOptions.value[0]?.id ?? 0,
    is_working_day: holiday?.is_working_day ?? false,
    applies_to: holiday?.applies_to ?? (locationId.value ? 'specific_locations' : 'all_locations'),
    location_ids: holiday?.locations.map(location => location.id) ?? (locationId.value ? [Number(locationId.value)] : []),
  })
  formOpen.value = true
}
const save = async () => {
  if (form.applies_to === 'specific_locations' && !form.location_ids.length) { formError.value = 'Select at least one location.'; return }
  saving.value = true
  formError.value = ''
  try {
    await $api(`/admin/work-calendar${editingHoliday.value ? `/${editingHoliday.value.id}` : ''}`, { method: editingHoliday.value ? 'PUT' : 'POST', body: { ...form } })
    formOpen.value = false
    success('Holiday Saved', 'Holiday information saved successfully.')
    const [year, monthNumber] = form.holiday_date.split('-').map(Number)
    selectedDay.value = form.holiday_date
    if (year !== month.value.getFullYear() || monthNumber !== month.value.getMonth() + 1) month.value = new Date(year!, monthNumber! - 1, 1)
    else await load()
  } catch (problem: any) { formError.value = String(Object.values(problem?.data?.errors ?? {}).flat()[0] || problem?.data?.message || 'Unable to save holiday.') }
  finally { saving.value = false }
}
const remove = async (holiday: Holiday) => {
  if (!window.confirm(`Remove "${holiday.holiday_name}"?`)) return
  saving.value = true
  try { await $api(`/admin/work-calendar/${holiday.id}`, { method: 'DELETE' }); success('Holiday Removed', 'Holiday removed from the calendar.'); await load() }
  catch (problem: any) { error.value = problem?.data?.message || 'Unable to remove holiday.' }
  finally { saving.value = false }
}
</script>

<template>
  <section class="work-calendar">
    <PageHeader title="Holiday" description="Manage holidays and working or non-working days by location.">
      <AppButton :icon="Plus" :disabled="loading || !!error || !classificationOptions.length" @click="selectedDay = ''; openForm()">Add Holiday</AppButton>
    </PageHeader>
    <div v-if="error" class="notice" role="alert">{{ error }} <button type="button" @click="load">Retry</button></div>
    <div class="toolbar">
      <label>Work Location
        <select v-model="locationId"><option value="">All locations</option><option v-for="location in data.locations" :key="location.id" :value="String(location.id)">{{ location.location_name }} ({{ location.city }})</option></select>
      </label>
      <div class="month-nav">
        <button type="button" aria-label="Previous month" @click="changeMonth(-1)"><ChevronLeft :size="18" /></button>
        <strong>{{ monthLabel }}</strong>
        <button type="button" aria-label="Next month" @click="changeMonth(1)"><ChevronRight :size="18" /></button>
        <button type="button" @click="month = new Date(today.getFullYear(), today.getMonth(), 1)">Today</button>
        <button type="button" :disabled="loading" @click="load">Refresh</button>
      </div>
    </div>
    <p v-if="loading" role="status">Loading calendar…</p>
    <div v-else-if="!error" class="calendar-grid">
      <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day" class="weekday">{{ day }}</div>
      <button v-for="day in dates" :key="day.key" type="button" class="day" :class="{ muted: !day.current, today: day.key === dateKey(today) }" :aria-label="`View holidays for ${day.key}`" @click="selectedDay = day.key">
        <strong>{{ day.day }}</strong>
        <span v-for="holiday in holidaysOn(day.key)" :key="holiday.id" class="entry">{{ holiday.holiday_name }}<small>{{ holiday.is_working_day ? 'Working' : 'Non-working' }} · {{ holiday.applies_to === 'all_locations' ? 'All locations' : holiday.locations.map(location => location.location_name).join(', ') }}</small></span>
      </button>
    </div>
    <div v-if="selectedDay && !formOpen" class="overlay" @click.self="selectedDay = ''">
      <section class="dialog" role="dialog" aria-modal="true" aria-labelledby="day-title">
        <div class="dialog-heading"><h2 id="day-title">{{ selectedDay }}</h2><button type="button" aria-label="Close date details" @click="selectedDay = ''"><X :size="20" /></button></div>
        <h3>Holidays</h3>
        <p v-if="!holidaysOn(selectedDay).length">No holiday is configured for this date.</p>
        <div v-for="holiday in holidaysOn(selectedDay)" :key="holiday.id" class="detail">
          <strong>{{ holiday.holiday_name }}</strong><p>{{ holiday.holiday_type?.type_name }} · {{ holiday.is_working_day ? 'Working day' : 'Non-working day' }}</p>
          <p>{{ holiday.applies_to === 'all_locations' ? 'All locations' : holiday.locations.map(location => location.location_name).join(', ') }}</p>
          <button type="button" :disabled="saving" @click="openForm(holiday)">Edit</button> <button type="button" :disabled="saving" @click="remove(holiday)">Remove</button>
        </div>
        <AppButton :icon="Plus" :disabled="!classificationOptions.length" @click="openForm()">Add Holiday</AppButton>
      </section>
    </div>
    <div v-if="formOpen" class="overlay" @click.self="!saving && (formOpen = false)">
      <form class="dialog" role="dialog" aria-modal="true" aria-labelledby="holiday-title" @submit.prevent="save">
        <div class="dialog-heading"><h2 id="holiday-title">{{ editingHoliday ? 'Edit Holiday' : 'Add Holiday' }}</h2><button type="button" :disabled="saving" aria-label="Close holiday form" @click="formOpen = false"><X :size="20" /></button></div>
        <p v-if="formError" class="notice" role="alert">{{ formError }}</p>
        <fieldset :disabled="saving">
          <label>Name<input v-model="form.holiday_name" required maxlength="255" placeholder="e.g. Christmas Day" /></label>
          <label>Date<input v-model="form.holiday_date" type="date" required /></label>
          <label>Classification<select v-model="form.holiday_type_id" required><option v-if="editingHoliday && !classificationOptions.some(type => type.id === form.holiday_type_id)" :value="form.holiday_type_id">{{ editingHoliday.holiday_type?.type_name }} (previous classification)</option><option v-for="type in classificationOptions" :key="type.id" :value="type.id">{{ type.type_name }}</option></select></label>
          <label>Day Status<select v-model="form.is_working_day"><option :value="false">Non-working day</option><option :value="true">Working day</option></select></label>
          <label>Applies To<select v-model="form.applies_to"><option value="all_locations">All locations</option><option value="specific_locations">Selected locations</option></select></label>
          <div v-if="form.applies_to === 'specific_locations'"><label v-for="location in data.locations" :key="location.id" class="checkbox"><input v-model="form.location_ids" type="checkbox" :value="location.id" />{{ location.location_name }} ({{ location.city }})</label></div>
          <button type="submit" class="save">{{ saving ? 'Saving…' : 'Save Holiday' }}</button>
        </fieldset>
      </form>
    </div>
  </section>
</template>

<style scoped>
.work-calendar { max-width: 1660px; margin: auto; }
.toolbar, .month-nav, .dialog-heading { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.toolbar { padding: 16px; margin-bottom: 14px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; }
.month-nav { margin-left: auto; } .month-nav button { font-size: 12px; font-weight: 500; line-height: 1.4; }
.holiday-link { display: inline-flex; align-items: center; padding: 9px 12px; border: 1px solid var(--border); border-radius: 6px; color: var(--text-primary); text-decoration: none; font-size: 12px; }
label { display: flex; flex-direction: column; gap: 6px; font-size: 12px; }
input, select, button { color: var(--text-primary); background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px; padding: 9px; font: inherit; }
button { cursor: pointer; } button:disabled { opacity: .5; cursor: default; }
.calendar-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
.weekday { background: var(--bg-card); padding: 12px; text-align: center; font-size: 12px; }
.day { min-height: 145px; display: flex; flex-direction: column; gap: 6px; text-align: left; border: 0; border-radius: 0; padding: 10px; }
.day.muted { opacity: .55; } .day.today { box-shadow: inset 0 0 0 2px var(--primary); }
.entry { display: block; border-radius: 5px; padding: 6px; font-size: 11px; overflow-wrap: anywhere; width: 100%; background: color-mix(in srgb, #eab308 16%, var(--bg-card)); border-left: 3px solid #eab308; }
small { display: block; font-size: 10px; margin-top: 3px; }
.overlay { position: fixed; inset: 0; background: #0009; display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.dialog { background: var(--bg-card); color: var(--text-primary); padding: 24px; border: 1px solid var(--border); border-radius: 14px; width: min(560px, 100%); max-height: 90vh; overflow: auto; }
.dialog-heading { justify-content: space-between; margin-bottom: 20px; } h2 { font-size: 18px; } h3 { font-size: 14px; margin: 20px 0 12px; }
.detail { border-left: 3px solid #eab308; padding: 12px; margin-bottom: 8px; font-size: 13px; } .notice { padding: 12px; color: #ef4444; }
fieldset { border: 0; padding: 0; display: grid; gap: 14px; } .checkbox { flex-direction: row; align-items: center; } .save { background: var(--primary); color: white; }
@media (max-width: 700px) { .calendar-grid { overflow-x: auto; grid-template-columns: repeat(7, minmax(115px, 1fr)); } .month-nav { margin-left: 0; } }
</style>
