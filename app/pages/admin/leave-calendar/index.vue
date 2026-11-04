<script setup lang="ts">
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-vue-next'

definePageMeta({ alias: ['/admin/holiday-leave', '/admin/work-calendar'] })
interface Location { id: number; location_name: string; city: string }
interface HolidayType { id: number; type_name: string; type_code: string }
interface Entry {
  id: number; holiday_name: string; holiday_date: string; holiday_type_id: number
  is_working_day: boolean; applies_to: string; locations: Location[]
  holiday_type?: HolidayType
}
interface CompanyEvent { id: number; name: string; event_date: string; event_time: string | null; description: string | null; applies_to: string; locations: Location[] }
interface Leave {
  id: string; date: string; employee_id: number; employee_name: string
  department: string; location: string | null; leave_type: string; day_type?: string; day_value?: string
  filter_key?: string; category: 'leave' | 'overtime' | 'undertime' | 'birthday' | 'late' | 'anniversary'; time_label?: string
}
interface CalendarData { holidays: Entry[]; company_events: CompanyEvent[]; leaves: Leave[]; employee_events: Leave[]; locations: Location[]; types: HolidayType[]; request_types: { value: string; label: string }[] }
const { $api } = useNuxtApp()
const { success } = useToast()
const today = new Date()
const month = ref(new Date(today.getFullYear(), today.getMonth(), 1))
const locationId = ref('')
const eventOptions = [
  { value: 'holiday', label: 'Holidays', color: '#eab308' },
  { value: 'company_event', label: 'Company Events', color: '#e11d48' },
  { value: 'leave', label: 'Approved Leave', color: '#3b82f6' },
  { value: 'overtime', label: 'Overtime (OT)', color: '#22c55e' },
  { value: 'undertime', label: 'Undertime', color: '#06b6d4' },
  { value: 'birthday', label: 'Birthdays', color: '#ec4899' },
  { value: 'late', label: 'Late Attendance', color: '#f97316' },
  { value: 'anniversary', label: 'Work Anniversaries', color: '#a855f7' },
]
const eventStyle = (category: string) => ({ '--event-color': eventOptions.find(option => option.value === category)?.color ?? '#3b82f6' })
const visibleCategories = ref(eventOptions.map(option => option.value))
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const formError = ref('')
const data = ref<CalendarData>({ holidays: [], company_events: [], leaves: [], employee_events: [], locations: [], types: [], request_types: [] })
const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const monthLabel = computed(() => month.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }))
const dates = computed(() => {
  const start = new Date(month.value.getFullYear(), month.value.getMonth(), 1 - month.value.getDay())
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    return { key: dateKey(date), day: date.getDate(), current: date.getMonth() === month.value.getMonth() }
  })
})
const filteredLeaves = computed(() => [
  ...data.value.leaves,
  ...(data.value.employee_events ?? []),
].filter(event => visibleCategories.value.includes(event.category)))
const requestDetail = (request: Leave) => request.category === 'leave'
  ? `${Number(request.day_value) < 1 ? 'Half day' : 'Full day'} (${request.day_value} day)`
  : request.time_label
const entriesOn = (day: string) => visibleCategories.value.includes('holiday') ? data.value.holidays.filter(entry => entry.holiday_date.slice(0, 10) === day) : []
const companyEventsOn = (day: string) => visibleCategories.value.includes('company_event') ? data.value.company_events.filter(event => event.event_date.slice(0, 10) === day) : []
const leavesOn = (day: string) => filteredLeaves.value.filter(leave => leave.date === day)
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
    if (version === loadVersion) {
      error.value = problem?.data?.message || 'Unable to load the work calendar.'
      data.value.holidays = []
      data.value.company_events = []
      data.value.leaves = []
      data.value.employee_events = []
    }
  } finally {
    if (version === loadVersion) loading.value = false
  }
}
watch([month, locationId], load)
onMounted(load)
const changeMonth = (offset: number) => { month.value = new Date(month.value.getFullYear(), month.value.getMonth() + offset, 1) }
const selectedDay = ref('')
const editingId = ref<number | null>(null)
const formOpen = ref(false)
const eventFormOpen = ref(false)
const eventId = ref<number | null>(null)
const eventForm = reactive({ name: '', event_date: '', event_time: '', description: '', applies_to: 'all_locations', location_ids: [] as number[] })
const openEventForm = (event?: CompanyEvent) => {
  eventId.value = event?.id ?? null
  formError.value = ''
  Object.assign(eventForm, {
    name: event?.name ?? '', event_date: event?.event_date.slice(0, 10) ?? (selectedDay.value || dateKey(today)),
    event_time: event?.event_time?.slice(0, 5) ?? '', description: event?.description ?? '',
    applies_to: event?.applies_to ?? (locationId.value ? 'specific_locations' : 'all_locations'),
    location_ids: event?.locations.map(location => location.id) ?? (locationId.value ? [Number(locationId.value)] : []),
  })
  eventFormOpen.value = true
}
const saveEvent = async () => {
  if (eventForm.applies_to === 'specific_locations' && !eventForm.location_ids.length) { formError.value = 'Select at least one location.'; return }
  saving.value = true
  formError.value = ''
  try {
    await $api(`/admin/calendar-events${eventId.value ? `/${eventId.value}` : ''}`, { method: eventId.value ? 'PUT' : 'POST', body: { ...eventForm, event_time: eventForm.event_time || null, description: eventForm.description || null } })
    eventFormOpen.value = false
    success('Event Saved', 'Company event saved successfully.')
    await load()
  } catch (problem: any) { formError.value = String(Object.values(problem?.data?.errors ?? {}).flat()[0] || problem?.data?.message || 'Unable to save event.') }
  finally { saving.value = false }
}
const removeEvent = async (event: CompanyEvent) => {
  if (!window.confirm(`Remove "${event.name}"?`)) return
  saving.value = true
  try { await $api(`/admin/calendar-events/${event.id}`, { method: 'DELETE' }); await load() }
  catch (problem: any) { error.value = problem?.data?.message || 'Unable to remove event.' }
  finally { saving.value = false }
}
const form = reactive({ holiday_name: '', holiday_date: '', holiday_type_id: 0, is_working_day: false, applies_to: 'all_locations', location_ids: [] as number[] })
const openForm = (entry?: Entry) => {
  editingId.value = entry?.id ?? null
  formError.value = ''
  Object.assign(form, {
    holiday_name: entry?.holiday_name ?? '',
    holiday_date: entry?.holiday_date.slice(0, 10) ?? (selectedDay.value || dateKey(today)),
    holiday_type_id: entry?.holiday_type_id ?? data.value.types[0]?.id ?? 0,
    is_working_day: entry?.is_working_day ?? false,
    applies_to: entry?.applies_to ?? (locationId.value ? 'specific_locations' : 'all_locations'),
    location_ids: entry?.locations.map(location => location.id) ?? (locationId.value ? [Number(locationId.value)] : []),
  })
  formOpen.value = true
}
const selectType = () => {
  const code = data.value.types.find(type => type.id === form.holiday_type_id)?.type_code
  form.is_working_day = code === 'SPECIAL_WORKING'
}
const save = async () => {
  if (form.applies_to === 'specific_locations' && !form.location_ids.length) {
    formError.value = 'Select at least one location.'
    return
  }
  saving.value = true
  formError.value = ''
  try {
    await $api(`/admin/work-calendar${editingId.value ? `/${editingId.value}` : ''}`, { method: editingId.value ? 'PUT' : 'POST', body: { ...form } })
    formOpen.value = false
    success('Calendar Updated', 'Calendar entry saved successfully.')
    await load()
  } catch (problem: any) {
    formError.value = String(Object.values(problem?.data?.errors ?? {}).flat()[0] || problem?.data?.message || 'Unable to save entry.')
  } finally { saving.value = false }
}
const remove = async (entry: Entry) => {
  saving.value = true
  try {
    await $api(`/admin/work-calendar/${entry.id}`, { method: 'DELETE' })
    await load()
  } catch (problem: any) { error.value = problem?.data?.message || 'Unable to remove entry.' }
  finally { saving.value = false }
}
</script>

<template>
  <section class="work-calendar">
    <PageHeader title="Work Calendar" description="Manage holidays by location and view approved requests, birthdays, late attendance and work anniversaries.">
      <div class="header-buttons">
        <AppButton :icon="Plus" :disabled="loading || !!error" @click="openEventForm()">Add Event</AppButton>
        <AppButton :icon="Plus" :disabled="loading || !!error || !data.types.length" @click="openForm()">Add Holiday</AppButton>
      </div>
    </PageHeader>

    <div v-if="error" class="notice" role="alert">{{ error }} <button type="button" @click="load">Retry</button></div>
    <div class="toolbar">
      <label>Work Location
        <select v-model="locationId">
          <option value="">All locations</option>
          <option v-for="location in data.locations" :key="location.id" :value="String(location.id)">{{ location.location_name }} ({{ location.city }})</option>
        </select>
      </label>
      <div class="month-nav">
        <button type="button" aria-label="Previous month" @click="changeMonth(-1)"><ChevronLeft :size="18" /></button>
        <strong>{{ monthLabel }}</strong>
        <button type="button" aria-label="Next month" @click="changeMonth(1)"><ChevronRight :size="18" /></button>
        <button type="button" @click="month = new Date(today.getFullYear(), today.getMonth(), 1)">Today</button>
        <button type="button" :disabled="loading" @click="load">Refresh</button>
      </div>
    </div>
    <fieldset class="event-filters">
      <legend>Show on Calendar</legend>
      <div class="event-options">
        <label v-for="option in eventOptions" :key="option.value" class="checkbox" :style="eventStyle(option.value)">
          <input v-model="visibleCategories" type="checkbox" :value="option.value" /><span class="event-dot" aria-hidden="true" />{{ option.label }}
        </label>
        <button type="button" @click="visibleCategories = eventOptions.map(option => option.value)">Show All</button>
        <button type="button" @click="visibleCategories = []">Clear All</button>
      </div>
    </fieldset>
    <p v-if="!visibleCategories.length" class="hint">No event categories selected. Check a category to show its events.</p>
    <p v-if="loading" role="status">Loading calendar…</p>
    <div v-else class="calendar-grid">
      <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day" class="weekday">{{ day }}</div>
      <button v-for="day in dates" :key="day.key" type="button" class="day" :class="{ muted: !day.current, today: day.key === dateKey(today) }" :aria-label="`View calendar for ${day.key}`" @click="selectedDay = day.key">
        <strong>{{ day.day }}</strong>
        <span v-for="entry in entriesOn(day.key)" :key="entry.id" class="entry" :style="eventStyle('holiday')">
          {{ entry.holiday_name }}<small>{{ entry.is_working_day ? 'Working' : 'Non-working' }} · {{ entry.applies_to === 'all_locations' ? 'All locations' : entry.locations.map(location => location.location_name).join(', ') }}</small>
        </span>
        <span v-for="event in companyEventsOn(day.key)" :key="event.id" class="entry" :style="eventStyle('company_event')">{{ event.name }}<small>{{ event.event_time?.slice(0, 5) || 'All day' }} · {{ event.applies_to === 'all_locations' ? 'All locations' : event.locations.map(location => location.location_name).join(', ') }}</small></span>
        <span v-for="leave in leavesOn(day.key).slice(0, 3)" :key="leave.id" class="leave" :style="eventStyle(leave.category)">{{ leave.employee_name }}<small>{{ leave.leave_type }} · {{ requestDetail(leave) }}</small></span>
        <small v-if="leavesOn(day.key).length > 3">+ {{ leavesOn(day.key).length - 3 }} more events</small>
      </button>
    </div>

    <div v-if="selectedDay && !formOpen && !eventFormOpen" class="overlay" @click.self="selectedDay = ''">
      <section class="dialog" role="dialog" aria-modal="true" aria-labelledby="day-title">
        <div class="dialog-heading"><h2 id="day-title">{{ selectedDay }}</h2><button type="button" aria-label="Close date details" @click="selectedDay = ''"><X :size="20" /></button></div>
        <h3>Calendar Entries</h3>
        <p v-if="!visibleCategories.includes('holiday')">Holidays are hidden by your calendar filters.</p>
        <p v-else-if="!entriesOn(selectedDay).length">No calendar override. Follow employee work schedules.</p>
        <div v-for="entry in entriesOn(selectedDay)" :key="entry.id" class="detail event-detail" :style="eventStyle('holiday')">
          <strong>{{ entry.holiday_name }}</strong>
          <p>{{ entry.holiday_type?.type_name }} · {{ entry.is_working_day ? 'Working day' : 'Non-working day' }}</p>
          <p>{{ entry.applies_to === 'all_locations' ? 'All locations' : entry.locations.map(location => location.location_name).join(', ') }}</p>
          <button type="button" :disabled="saving" @click="openForm(entry)">Edit</button>
          <button type="button" :disabled="saving" @click="remove(entry)">Remove</button>
        </div>
        <AppButton :icon="Plus" :disabled="!data.types.length" @click="openForm()">Add Entry</AppButton>
        <h3>Company Events</h3>
        <p v-if="!visibleCategories.includes('company_event')">Company events are hidden by your calendar filters.</p>
        <p v-else-if="!companyEventsOn(selectedDay).length">No company events on this date.</p>
        <div v-for="event in companyEventsOn(selectedDay)" :key="event.id" class="detail event-detail" :style="eventStyle('company_event')">
          <strong>{{ event.name }}</strong><p>{{ event.event_time?.slice(0, 5) || 'All day' }} · {{ event.applies_to === 'all_locations' ? 'All locations' : event.locations.map(location => location.location_name).join(', ') }}</p>
          <p v-if="event.description">{{ event.description }}</p>
          <button type="button" :disabled="saving" @click="openEventForm(event)">Edit</button><button type="button" :disabled="saving" @click="removeEvent(event)">Remove</button>
        </div>
        <AppButton :icon="Plus" @click="openEventForm()">Add Event</AppButton>
        <h3>Employee Events</h3>
        <p v-if="!leavesOn(selectedDay).length">No employee events match the selected filters.</p>
        <div v-for="leave in leavesOn(selectedDay)" :key="leave.id" class="detail event-detail" :style="eventStyle(leave.category)">
          <strong>{{ leave.employee_name }}</strong>
          <p>{{ leave.leave_type }} · {{ requestDetail(leave) }}</p>
          <small>{{ leave.department }} · {{ leave.location || 'Work location unassigned' }}</small>
        </div>
      </section>
    </div>

    <div v-if="eventFormOpen" class="overlay" @click.self="!saving && (eventFormOpen = false)">
      <form class="dialog" role="dialog" aria-modal="true" aria-labelledby="company-event-title" @submit.prevent="saveEvent">
        <div class="dialog-heading"><h2 id="company-event-title">{{ eventId ? 'Edit' : 'Add' }} Company Event</h2><button type="button" :disabled="saving" aria-label="Close event" @click="eventFormOpen = false"><X :size="20" /></button></div>
        <p v-if="formError" class="notice" role="alert">{{ formError }}</p>
        <fieldset :disabled="saving">
          <label>Event Name<input v-model="eventForm.name" required maxlength="255" /></label>
          <label>Date<input v-model="eventForm.event_date" type="date" required /></label>
          <label>Time (optional)<input v-model="eventForm.event_time" type="time" /></label>
          <label>Description (optional)<textarea v-model="eventForm.description" maxlength="5000" rows="3" /></label>
          <label>Applies To<select v-model="eventForm.applies_to"><option value="all_locations">All locations</option><option value="specific_locations">Selected locations</option></select></label>
          <div v-if="eventForm.applies_to === 'specific_locations'"><label v-for="location in data.locations" :key="location.id" class="checkbox"><input v-model="eventForm.location_ids" type="checkbox" :value="location.id" />{{ location.location_name }} ({{ location.city }})</label></div>
          <button type="submit" class="save">{{ saving ? 'Saving…' : 'Save Event' }}</button>
        </fieldset>
      </form>
    </div>

    <div v-if="formOpen" class="overlay" @click.self="!saving && (formOpen = false)">
      <form class="dialog" role="dialog" aria-modal="true" aria-labelledby="entry-title" @submit.prevent="save">
        <div class="dialog-heading"><h2 id="entry-title">{{ editingId ? 'Edit' : 'Add' }} Calendar Entry</h2><button type="button" :disabled="saving" aria-label="Close calendar entry" @click="formOpen = false"><X :size="20" /></button></div>
        <p v-if="formError" class="notice" role="alert">{{ formError }}</p>
        <fieldset :disabled="saving">
          <label>Name<input v-model="form.holiday_name" required maxlength="255" placeholder="e.g. Christmas Day" /></label>
          <label>Date<input v-model="form.holiday_date" type="date" required /></label>
          <label>Classification<select v-model="form.holiday_type_id" required @change="selectType"><option v-for="type in data.types" :key="type.id" :value="type.id">{{ type.type_name }}</option></select></label>
          <label>Day Status<select v-model="form.is_working_day"><option :value="false">Non-working day</option><option :value="true">Working day</option></select></label>
          <label>Applies To<select v-model="form.applies_to"><option value="all_locations">All locations</option><option value="specific_locations">Selected locations</option></select></label>
          <div v-if="form.applies_to === 'specific_locations'">
            <label v-for="location in data.locations" :key="location.id" class="checkbox"><input v-model="form.location_ids" type="checkbox" :value="location.id" />{{ location.location_name }} ({{ location.city }})</label>
          </div>
          <button type="submit" class="save">{{ saving ? 'Saving…' : 'Save Calendar Entry' }}</button>
        </fieldset>
      </form>
    </div>
  </section>
</template>

<style scoped>
.work-calendar { max-width: 1660px; margin: auto; }
.toolbar, .month-nav, .dialog-heading { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.toolbar { padding: 16px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; }
.month-nav { margin-left: auto; }
.header-buttons { display: flex; gap: 8px; flex-wrap: wrap; }
.month-nav button { font-size: 12px; font-weight: 500; line-height: 1.4; }
label { display: flex; flex-direction: column; gap: 6px; font-size: 12px; }
input, select, textarea, button { color: var(--text-primary); background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px; padding: 9px; font: inherit; }
button { cursor: pointer; } button:disabled { opacity: .5; cursor: default; }
.hint { font-size: 12px; color: var(--text-secondary); margin: 14px 0; }
.calendar-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
.weekday { background: var(--bg-card); padding: 12px; text-align: center; font-size: 12px; }
.day { min-height: 145px; display: flex; flex-direction: column; gap: 6px; text-align: left; border: 0; border-radius: 0; padding: 10px; }
.day.muted { opacity: .55; } .day.today { box-shadow: inset 0 0 0 2px var(--primary); }
.entry, .leave { display: block; border-radius: 5px; padding: 6px; font-size: 11px; overflow-wrap: anywhere; width: 100%; background: color-mix(in srgb, var(--event-color) 16%, var(--bg-card)); border-left: 3px solid var(--event-color); }
.event-dot { width: 9px; height: 9px; flex-shrink: 0; border-radius: 50%; background: var(--event-color); }
.dialog .event-detail { border-left: 3px solid var(--event-color); padding-left: 12px; margin-bottom: 8px; }
.event-filters { margin-top: 14px; border: 1px solid var(--border); border-radius: 10px; padding: 12px 16px; background: var(--bg-card); }
.event-filters legend { font-size: 12px; padding: 0 6px; }
.event-options { display: flex; align-items: center; flex-wrap: wrap; gap: 12px 18px; }
.event-options input { accent-color: var(--event-color); }
.event-options button { font-size: 11px; }
small { display: block; font-size: 10px; margin-top: 3px; }
.overlay { position: fixed; inset: 0; background: #0009; display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.dialog { background: var(--bg-card); color: var(--text-primary); padding: 24px; border: 1px solid var(--border); border-radius: 14px; width: min(560px, 100%); max-height: 90vh; overflow: auto; }
.dialog-heading { justify-content: space-between; margin-bottom: 20px; } h2 { font-size: 18px; } h3 { font-size: 14px; margin: 20px 0 12px; }
fieldset { border: 0; padding: 0; display: grid; gap: 14px; } .checkbox { flex-direction: row; align-items: center; }
.detail { border-bottom: 1px solid var(--border); padding: 12px 0; font-size: 13px; } .detail button { margin: 8px 8px 0 0; }
.save { background: var(--primary); color: white; } .notice { padding: 12px; color: #ef4444; }
@media (max-width: 700px) { .calendar-grid { overflow-x: auto; grid-template-columns: repeat(7, minmax(115px, 1fr)); } .month-nav { margin-left: 0; } }
</style>
