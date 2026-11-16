<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { ChevronDown, Download, RefreshCw, Search } from 'lucide-vue-next'
import BaseTableFooter from '~/components/shared-table/BaseTableFooter.vue'
import {
  UPCOMING_EVENT_STYLE,
  UPCOMING_TYPE_LABELS,
  useUpcomingEvents,
  type UpcomingEvent,
  type UpcomingEventType,
  type UpcomingEventsPage,
  type UpcomingListParams,
} from '~/composables/admin/dashboard/useUpcomingEvents'

/**
 * Full list of upcoming events, grouped by date.
 * Used by /admin/upcoming-events (from the dashboard) and
 * /admin/employees/celebrations (Birthdays & Anniversaries).
 */
const props = withDefaults(defineProps<{
  title: string
  description: string
  allowedTypes?: UpcomingEventType[]
  defaultRange?: '7' | '30' | '90' | 'month'
  exportName?: string
}>(), {
  allowedTypes: () => ['birthday', 'anniversary', 'regularization', 'holiday', 'milestone'],
  defaultRange: '30',
  exportName: 'upcoming-events',
})

const { list } = useUpcomingEvents()

const thisMonth = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

// =====================================================
// FILTERS
// =====================================================

const typeTab = ref<UpcomingEventType | ''>('')
const range = ref(props.defaultRange)
const month = ref(thisMonth())
const departmentId = ref<number | ''>('')
const search = ref('')
const currentPage = ref(1)
const PER_PAGE = 20

const params = (overrides: UpcomingListParams = {}): UpcomingListParams => ({
  ...(range.value === 'month' ? { month: month.value } : { days: Number(range.value) }),
  types: typeTab.value ? [typeTab.value] : props.allowedTypes,
  department_id: departmentId.value === '' ? null : departmentId.value,
  search: search.value.trim(),
  page: currentPage.value,
  per_page: PER_PAGE,
  ...overrides,
})

// =====================================================
// DATA
// =====================================================

const result = ref<UpcomingEventsPage | null>(null)
const loading = ref(false)
const loadError = ref('')
let requestId = 0

const load = async () => {
  const id = ++requestId
  loading.value = true
  loadError.value = ''
  try {
    const response = await list(params())
    if (id === requestId) result.value = response.data
  } catch {
    if (id === requestId) loadError.value = 'Unable to load events.'
  } finally {
    if (id === requestId) loading.value = false
  }
}

onMounted(load)

let searchTimer: ReturnType<typeof setTimeout> | undefined

watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    if (currentPage.value !== 1) currentPage.value = 1
    else load()
  }, 350)
})

watch([typeTab, range, month, departmentId], () => {
  if (currentPage.value !== 1) currentPage.value = 1
  else load()
})

watch(currentPage, load)

const reset = () => {
  typeTab.value = ''
  range.value = props.defaultRange
  month.value = thisMonth()
  departmentId.value = ''
  search.value = ''
}

// =====================================================
// TABS + GROUPING
// =====================================================

const tabs = computed(() => {
  const counts = result.value?.counts ?? {}
  const all = props.allowedTypes.reduce((sum, t) => sum + (counts[t] ?? 0), 0)
  return [
    { type: '' as const, label: 'All', count: all },
    ...props.allowedTypes.map(t => ({ type: t, label: UPCOMING_TYPE_LABELS[t], count: counts[t] ?? 0 })),
  ]
})

const dayHeading = (date: string) =>
  new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    .format(new Date(`${date}T00:00:00`))

const relative = (days: number) => {
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days === -1) return 'Yesterday'
  return days > 0 ? `In ${days} days` : `${Math.abs(days)} days ago`
}

const groups = computed(() => {
  const map = new Map<string, UpcomingEvent[]>()
  for (const event of result.value?.items ?? []) {
    map.set(event.date, [...(map.get(event.date) ?? []), event])
  }
  return [...map.entries()].map(([date, events]) => ({
    date,
    heading: dayHeading(date),
    relative: relative(events[0]!.days_until),
    past: events[0]!.days_until < 0,
    today: events[0]!.days_until === 0,
    events,
  }))
})

const rangeLabel = computed(() => {
  if (!result.value) return ''
  const fmt = (d: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${d}T00:00:00`))
  return `${fmt(result.value.from)} – ${fmt(result.value.to)}`
})

// =====================================================
// EXPORT (every event matching the filters)
// =====================================================

const exporting = ref(false)

const csvCell = (value: unknown) => {
  const text = value === null || value === undefined ? '' : String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

const exportCsv = async () => {
  exporting.value = true
  try {
    const all: UpcomingEvent[] = []
    let page = 1
    let lastPage = 1
    do {
      const response = await list(params({ page, per_page: 200 }))
      all.push(...response.data.items)
      lastPage = response.data.meta.last_page
      page++
    } while (page <= lastPage)

    const rows = [
      ['Date', 'Event', 'Name', 'Employee No.', 'Department', 'Details'],
      ...all.map(e => [e.date, e.label, e.title, e.emp_id, e.department, e.detail]),
    ]
    const csv = rows.map(r => r.map(csvCell).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `${props.exportName}-${range.value === 'month' ? month.value : `next-${range.value}-days`}.csv`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch {
    loadError.value = 'Unable to export events.'
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <section class="events-page">
    <PageHeader :title="title" :description="description">
      <AppButton variant="secondary" :icon="RefreshCw" :disabled="loading" @click="load">Refresh</AppButton>
      <AppButton variant="secondary" :icon="Download" :disabled="exporting || !result?.total" @click="exportCsv">
        {{ exporting ? 'Exporting...' : 'Export CSV' }}
      </AppButton>
    </PageHeader>

    <!-- TYPE TABS -->
    <nav class="type-tabs" aria-label="Event type">
      <button
        v-for="tab in tabs"
        :key="tab.type || 'all'"
        type="button"
        class="tab"
        :class="{ active: typeTab === tab.type }"
        :aria-pressed="typeTab === tab.type"
        @click="typeTab = tab.type"
      >
        <component :is="UPCOMING_EVENT_STYLE[tab.type].icon" v-if="tab.type" :size="14" :class="`tone-${UPCOMING_EVENT_STYLE[tab.type].color}`" />
        {{ tab.label }}
        <span class="tab-count">{{ tab.count }}</span>
      </button>
    </nav>

    <!-- FILTERS -->
    <div class="filters-row">
      <div class="select-wrap">
        <select v-model="range" aria-label="Date range">
          <option value="7">Next 7 days</option>
          <option value="30">Next 30 days</option>
          <option value="90">Next 90 days</option>
          <option value="month">Specific month</option>
        </select>
        <ChevronDown :size="14" class="select-icon" />
      </div>

      <input v-if="range === 'month'" v-model="month" type="month" class="month-input" aria-label="Month">

      <div class="select-wrap">
        <select v-model="departmentId" aria-label="Department">
          <option value="">All Departments</option>
          <option v-for="d in result?.departments ?? []" :key="d.id" :value="d.id">{{ d.name }}</option>
        </select>
        <ChevronDown :size="14" class="select-icon" />
      </div>

      <div class="search-box">
        <Search :size="15" />
        <input v-model="search" type="text" placeholder="Search name, department or details..." aria-label="Search events">
      </div>

      <button type="button" class="reset-btn" @click="reset">Reset</button>
    </div>

    <p v-if="loadError" class="load-error" role="alert">
      {{ loadError }}
      <button type="button" @click="load">Retry</button>
    </p>

    <!-- LIST GROUPED BY DATE -->
    <section class="list-card">
      <header class="list-header">
        <div>
          <h2>{{ result ? `${result.total} event${result.total === 1 ? '' : 's'}` : 'Events' }}</h2>
          <p>{{ rangeLabel }}</p>
        </div>
      </header>

      <div v-if="loading && !result" class="list-state">Loading events...</div>
      <div v-else-if="!groups.length" class="list-state">
        <strong>No events found</strong>
        <span>Try another date range, type or department.</span>
      </div>

      <div v-else :class="{ dimmed: loading }">
        <section v-for="group in groups" :key="group.date" class="day-group" :class="{ past: group.past }">
          <h3 class="day-heading">
            {{ group.heading }}
            <span class="relative" :class="{ today: group.today }">{{ group.relative }}</span>
          </h3>

          <ul class="event-list">
            <li v-for="event in group.events" :key="event.key" class="event-item">
              <span class="event-icon" :class="`bg-${UPCOMING_EVENT_STYLE[event.type].color}`">
                <component :is="UPCOMING_EVENT_STYLE[event.type].icon" :size="17" />
              </span>
              <div class="event-main">
                <strong>{{ event.title }}</strong>
                <span>{{ event.detail }}</span>
              </div>
              <div class="event-meta">
                <span v-if="event.department || event.emp_id">
                  {{ [event.emp_id, event.department].filter(Boolean).join(' · ') }}
                </span>
                <span class="type-tag" :class="`bg-${UPCOMING_EVENT_STYLE[event.type].color}`">{{ event.label }}</span>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </section>

    <BaseTableFooter
      v-if="result?.meta"
      v-model="currentPage"
      :showing-from="result.meta.from"
      :showing-to="result.meta.to"
      :total-items="result.meta.total"
      :total-pages="result.meta.last_page"
      item-label="events"
    />
  </section>
</template>

<style scoped>
.events-page { width: 100%; max-width: 1660px; margin: 0 auto; }

/* ===== Tabs ===== */
.type-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin: 18px 0 12px; }

.tab {
  display: inline-flex; align-items: center; gap: 7px; height: 36px; padding: 0 12px;
  border: 1px solid var(--border); border-radius: 999px; background: var(--bg-card);
  color: var(--text-secondary); font-family: inherit; font-size: 12px; font-weight: 600; cursor: pointer;
}

.tab:hover { color: var(--text-primary); }
.tab.active { border-color: var(--primary); background: var(--primary-soft); color: var(--text-primary); }
.tab-count { min-width: 22px; padding: 2px 7px; border-radius: 999px; background: var(--bg-card-soft); color: var(--text-primary); font-size: 11px; text-align: center; }

.tone-green { color: var(--green); }
.tone-orange { color: var(--orange); }
.tone-purple { color: var(--purple); }
.tone-blue { color: var(--primary); }
.tone-red { color: var(--red); }

/* ===== Filters ===== */
.filters-row {
  display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-bottom: 18px; padding: 12px;
  border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card);
}

.select-wrap { position: relative; min-width: 170px; }

.select-wrap select, .month-input {
  width: 100%; height: 40px; padding: 0 34px 0 12px; border: 1px solid var(--border); border-radius: 9px;
  background: var(--bg-card-soft); color: var(--text-primary); font-family: inherit; font-size: 12px; appearance: none;
}

.month-input { width: auto; padding: 0 12px; color-scheme: dark; }
.select-icon { position: absolute; top: 50%; right: 10px; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }

.search-box {
  display: flex; flex: 1; min-width: 220px; height: 40px; align-items: center; gap: 8px; padding: 0 12px;
  border: 1px solid var(--border); border-radius: 9px; background: var(--bg-card-soft); color: var(--text-muted);
}

.search-box input { width: 100%; border: 0; background: transparent; color: var(--text-primary); font-family: inherit; font-size: 12px; outline: none; }

.reset-btn {
  height: 40px; padding: 0 14px; border: 1px solid var(--border); border-radius: 9px; background: transparent;
  color: var(--text-primary); font-family: inherit; font-size: 12px; font-weight: 600; cursor: pointer;
}

.search-box:focus-within, .select-wrap select:focus-visible, .month-input:focus-visible { border-color: var(--primary); outline: none; }
.tab:focus-visible, .reset-btn:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }

.load-error { margin: 0 0 14px; padding: 10px 12px; border-radius: 9px; background: var(--red-soft); color: var(--red); font-size: 13px; }
.load-error button { margin-left: 10px; border: 0; background: transparent; color: var(--primary); font-family: inherit; cursor: pointer; }

/* ===== List ===== */
.list-card { overflow: hidden; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
.list-header { padding: 16px 18px; border-bottom: 1px solid var(--border-soft); }
.list-header h2 { margin: 0; font-size: 16px; }
.list-header p { margin: 3px 0 0; color: var(--text-secondary); font-size: 12px; }

.list-state { display: flex; min-height: 200px; flex-direction: column; align-items: center; justify-content: center; gap: 6px; color: var(--text-muted); font-size: 13px; }
.list-state strong { color: var(--text-primary); font-size: 15px; }

.dimmed { opacity: 0.6; }

.day-group { border-bottom: 1px solid var(--border-soft); }
.day-group:last-child { border-bottom: 0; }
.day-group.past { opacity: 0.6; }

.day-heading {
  display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 0; padding: 10px 18px;
  background: var(--bg-card-soft); color: var(--text-primary); font-size: 12px; font-weight: 700;
}

.relative { color: var(--text-muted); font-size: 11px; font-weight: 600; }
.relative.today { color: var(--primary); }

.event-list { margin: 0; padding: 0; list-style: none; }

.event-item { display: flex; align-items: center; gap: 12px; padding: 12px 18px; border-top: 1px solid var(--border-soft); }
.event-item:first-child { border-top: 0; }

.event-icon { display: flex; width: 36px; height: 36px; flex-shrink: 0; align-items: center; justify-content: center; border-radius: 50%; }

.event-main { min-width: 0; flex: 1; }
.event-main strong { display: block; font-size: 13px; }
.event-main span { display: block; margin-top: 3px; color: var(--text-muted); font-size: 12px; }

.event-meta { display: flex; align-items: center; gap: 12px; color: var(--text-secondary); font-size: 12px; white-space: nowrap; }
.type-tag { padding: 4px 9px; border-radius: 999px; font-size: 11px; font-weight: 600; }

.bg-green { background: var(--green-soft); color: var(--green); }
.bg-orange { background: var(--orange-soft); color: var(--orange); }
.bg-purple { background: var(--purple-soft); color: var(--purple); }
.bg-blue { background: var(--primary-soft); color: var(--primary); }
.bg-red { background: var(--red-soft); color: var(--red); }

@media (max-width: 760px) {
  .filters-row { flex-direction: column; align-items: stretch; }
  .select-wrap, .search-box, .reset-btn, .month-input { width: 100%; }
  .event-item { flex-wrap: wrap; }
  .event-meta { width: 100%; padding-left: 48px; white-space: normal; flex-wrap: wrap; }
}
</style>