<script setup lang="ts">
import { ChevronLeft, ChevronRight, X } from 'lucide-vue-next'

definePageMeta({ layout: false, middleware: 'employee' })
interface CalendarEvent { id: string; date: string; category: string; title: string; detail: string }
interface CalendarResponse { events: CalendarEvent[]; location: { name: string; city: string } | null }
const { $api } = useNuxtApp()
const options = [
  { value: 'holiday', label: 'Holidays', color: '#eab308' },
  { value: 'company_event', label: 'Company Events', color: '#e11d48' },
  { value: 'leave', label: 'Approved Leave', color: '#3b82f6' },
  { value: 'overtime', label: 'Overtime', color: '#22c55e' },
  { value: 'undertime', label: 'Undertime', color: '#06b6d4' },
  { value: 'birthday', label: 'Birthday', color: '#ec4899' },
  { value: 'late', label: 'Late Attendance', color: '#f97316' },
  { value: 'anniversary', label: 'Work Anniversary', color: '#a855f7' },
]
const today = new Date()
const month = ref(new Date(today.getFullYear(), today.getMonth(), 1))
const selectedDay = ref('')
const loading = ref(false)
const error = ref('')
const calendar = ref<CalendarResponse>({ events: [], location: null })
const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const monthLabel = computed(() => month.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }))
const dates = computed(() => {
  const first = new Date(month.value.getFullYear(), month.value.getMonth(), 1 - month.value.getDay())
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(first.getFullYear(), first.getMonth(), first.getDate() + index)
    return { key: dateKey(date), day: date.getDate(), current: date.getMonth() === month.value.getMonth() }
  })
})
const color = (category: string) => ({ '--event-color': options.find(option => option.value === category)?.color ?? '#3b82f6' })
const eventsOn = (day: string) => calendar.value.events.filter(event => event.date === day)
const eventCategoriesOn = (day: string) => [...new Set(eventsOn(day).map(event => event.category))]
let version = 0
const load = async () => {
  const current = ++version
  loading.value = true
  error.value = ''
  try {
    const query = new URLSearchParams({ start: dates.value[0]!.key, end: dates.value[41]!.key })
    const response = await $api<{ data: CalendarResponse }>(`/employee/calendar?${query}`)
    if (current === version) calendar.value = response.data
  } catch (problem: any) {
    if (current === version) {
      calendar.value = { events: [], location: null }
      error.value = problem?.data?.message || 'Unable to load your calendar.'
    }
  } finally { if (current === version) loading.value = false }
}
watch(month, load)
onMounted(load)
const changeMonth = (offset: number) => { month.value = new Date(month.value.getFullYear(), month.value.getMonth() + offset, 1) }
</script>

<template>
  <section class="my-calendar">
    <header class="heading"><div><h1>Calendar</h1><p>Your approved requests, attendance and applicable holidays.</p></div></header>
    <p v-if="error" class="error" role="alert">{{ error }} <button type="button" @click="load">Retry</button></p>
    <div class="toolbar">
      <div><small>Work Location</small><strong>{{ calendar.location ? `${calendar.location.name} (${calendar.location.city})` : 'Not assigned' }}</strong></div>
      <div class="navigation">
        <button type="button" aria-label="Previous month" @click="changeMonth(-1)"><ChevronLeft :size="18" /></button>
        <strong>{{ monthLabel }}</strong>
        <button type="button" aria-label="Next month" @click="changeMonth(1)"><ChevronRight :size="18" /></button>
        <button type="button" @click="month = new Date(today.getFullYear(), today.getMonth(), 1)">Today</button>
        <button type="button" :disabled="loading" @click="load">Refresh</button>
      </div>
    </div>
    <p v-if="!loading && !error && !calendar.location" class="notice">No work location is assigned. Only company-wide holidays are shown; contact your administrator to assign a location.</p>
    <fieldset class="filters"><legend>Calendar Events</legend><div class="filter-options">
      <span v-for="option in options" :key="option.value" class="legend-item" :style="color(option.value)"><span class="dot" />{{ option.label }}</span>
    </div></fieldset>
    <p v-if="loading" role="status">Loading your calendar…</p>
    <div v-else-if="!error" class="grid">
      <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day" class="weekday">{{ day }}</div>
      <button v-for="day in dates" :key="day.key" type="button" class="day" :class="{ muted: !day.current, today: day.key === dateKey(today) }" :aria-label="`View ${day.key}`" @click="selectedDay = day.key">
        <strong>{{ day.day }}</strong>
        <span v-for="event in eventsOn(day.key).slice(0, 3)" :key="event.id" class="event" :style="color(event.category)">{{ event.title }}<small>{{ event.detail }}</small></span>
        <span v-if="eventsOn(day.key).length" class="mobile-event-dots" aria-hidden="true"><i v-for="category in eventCategoriesOn(day.key)" :key="category" class="dot" :style="color(category)" /></span>
        <small v-if="eventsOn(day.key).length > 3">+ {{ eventsOn(day.key).length - 3 }} more</small>
      </button>
    </div>
    <div v-if="selectedDay" class="overlay" @click.self="selectedDay = ''">
      <section class="dialog" role="dialog" aria-modal="true" aria-labelledby="calendar-day-title">
        <div class="dialog-header"><h2 id="calendar-day-title">{{ selectedDay }}</h2><button type="button" aria-label="Close" @click="selectedDay = ''"><X :size="20" /></button></div>
        <p v-if="!eventsOn(selectedDay).length">No events on this date.</p>
        <div v-for="event in eventsOn(selectedDay)" :key="event.id" class="event detail" :style="color(event.category)"><strong>{{ event.title }}</strong><p>{{ event.detail }}</p></div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.my-calendar { max-width: 1500px; margin: 0 auto; color: var(--text-primary); }
.heading { margin-bottom: 20px; } h1 { font-size: 24px; font-weight: 700; } .heading p, .notice { color: var(--text-secondary); font-size: 13px; margin-top: 6px; }
.toolbar, .navigation, .filter-options, .dialog-header { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.toolbar, .filters { padding: 16px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; }
.toolbar small, .toolbar strong { display: block; } .toolbar small { color: var(--text-secondary); margin-bottom: 5px; }
.navigation { margin-left: auto; } button { font: inherit; cursor: pointer; color: var(--text-primary); background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px; padding: 8px; } button:disabled { opacity: .5; }
.filters { margin: 16px 0; } .filters legend { font-size: 12px; padding: 0 6px; } .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; }
.dot { width: 9px; height: 9px; border-radius: 50%; background: var(--event-color); }
.grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
.weekday { background: var(--bg-card); padding: 10px; text-align: center; font-size: 12px; }
.day { min-height: 130px; display: flex; flex-direction: column; gap: 6px; text-align: left; border: 0; border-radius: 0; } .day.muted { opacity: .55; } .day.today { box-shadow: inset 0 0 0 2px #3b82f6; }
.event { display: block; border-left: 3px solid var(--event-color); background: color-mix(in srgb, var(--event-color) 16%, var(--bg-card)); border-radius: 5px; padding: 6px; font-size: 11px; width: 100%; overflow-wrap: anywhere; } .event small { display: block; margin-top: 3px; font-size: 10px; }
.mobile-event-dots { display: none; }
.overlay { position: fixed; inset: 0; z-index: 1000; background: #0009; display: flex; align-items: center; justify-content: center; padding: 20px; }
.dialog { width: min(520px, 100%); max-height: 85vh; overflow: auto; padding: 24px; border-radius: 12px; background: var(--bg-card); } .dialog-header { justify-content: space-between; margin-bottom: 18px; } .detail { margin-bottom: 10px; font-size: 13px; } .detail p { margin-top: 4px; }
.error { color: #dc2626; margin-bottom: 12px; }
@media (max-width: 700px) {
  .navigation { margin-left: 0; width: 100%; gap: 6px; }
  .navigation strong { flex: 1; text-align: center; font-size: 13px; }
  .navigation button { padding: 7px; font-size: 11px; }
  .grid { grid-template-columns: repeat(7, minmax(0, 1fr)); }
  .weekday { padding: 8px 0; font-size: 10px; }
  .day { min-height: 64px; padding: 5px 2px; align-items: center; gap: 4px; font-size: 12px; }
  .day .event, .day > small { display: none; }
  .mobile-event-dots { display: flex; justify-content: center; flex-wrap: wrap; gap: 2px; }
  .mobile-event-dots .dot { width: 5px; height: 5px; }
  .filters { padding: 10px; }
  .filter-options { gap: 10px; }
}
</style>
