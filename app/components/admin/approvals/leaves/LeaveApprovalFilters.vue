<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import {
  CalendarDays,
  RotateCcw,
  X,
} from 'lucide-vue-next'
import EmployeeLeaveDateCalendar from '~/components/employee/EmployeeLeaveDateCalendar.vue'

const search =
  defineModel<string>(
    'search',
    {
      default: '',
    },
  )

const status =
  defineModel<string>(
    'status',
    {
      default: '',
    },
  )

const department =
  defineModel<string>(
    'department',
    {
      default: '',
    },
  )

const dateFrom =
  defineModel<string>(
    'dateFrom',
    {
      default: '',
    },
  )

const dateTo =
  defineModel<string>(
    'dateTo',
    {
      default: '',
    },
  )

defineProps<{
  departments: string[]
}>()

const emit =
  defineEmits<{
    reset: []
  }>()

const showCalendarPopover = ref(false)
const dateRowRef = ref<HTMLElement | null>(null)
const todayStr = new Date().toISOString().slice(0, 10)
const pickerStart = ref('')
const pickerEnd = ref('')

watch([dateFrom, dateTo], ([f, t]) => {
  pickerStart.value = f || ''
  pickerEnd.value = t || f || ''
}, { immediate: true })

watch([pickerStart, pickerEnd], ([s, e]) => {
  if (s !== dateFrom.value) dateFrom.value = s
  if (e !== dateTo.value) dateTo.value = e
})

const openCalendarPicker = () => {
  if (!pickerStart.value) {
    pickerStart.value = todayStr
    pickerEnd.value = todayStr
  }
  showCalendarPopover.value = !showCalendarPopover.value
}

const clearDates = () => {
  dateFrom.value = ''
  dateTo.value = ''
  pickerStart.value = ''
  pickerEnd.value = ''
  showCalendarPopover.value = false
}

const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return 'All Dates'
  const d = new Date(`${dateStr.slice(0, 10)}T12:00:00`)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const handleClickOutside = (event: MouseEvent) => {
  if (showCalendarPopover.value && dateRowRef.value && !dateRowRef.value.contains(event.target as Node)) {
    showCalendarPopover.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<template>
  <div class="filters-card">

    <div class="filter-row">

      <AppInput
        v-model="search"
        searchable
        clearable
        placeholder="Search request no., employee or leave type..."
      />

      <AppSelect
        v-model="department"
        :options="departments"
        placeholder="All Departments"
      />

      <select
        v-model="status"
        class="status-select"
        aria-label="Filter leave requests by status"
      >
        <option value="">
          All Status
        </option>

        <option value="pending">
          Pending Approval
        </option>

        <option value="approved">
          Approved
        </option>

        <option value="rejected">
          Rejected
        </option>

        <option value="cancelled">
          Cancelled
        </option>
      </select>

    </div>

    <div ref="dateRowRef" class="date-row">

      <button
        type="button"
        class="date-control"
        :class="{ 'is-active': showCalendarPopover }"
        aria-label="Request date from"
        @click="openCalendarPicker"
      >
        <CalendarDays :size="15" />

        <div>
          <span>Request Date From</span>
          <strong>{{ formatDisplayDate(dateFrom) }}</strong>
        </div>
      </button>

      <button
        type="button"
        class="date-control"
        :class="{ 'is-active': showCalendarPopover }"
        aria-label="Request date to"
        @click="openCalendarPicker"
      >
        <CalendarDays :size="15" />

        <div>
          <span>Request Date To</span>
          <strong>{{ formatDisplayDate(dateTo || dateFrom) }}</strong>
        </div>
      </button>

      <AppButton
        variant="secondary"
        :icon="RotateCcw"
        @click="
          showCalendarPopover = false;
          emit('reset')
        "
      >
        Reset Filters
      </AppButton>

      <!-- Employee POV Calendar Popover -->
      <div v-if="showCalendarPopover" class="calendar-popover">
        <div class="popover-header">
          <span>Filter by Request Date Range</span>
          <div class="popover-actions">
            <button type="button" class="clear-range-btn" @click="clearDates">
              Clear
            </button>
            <button type="button" class="close-popover-btn" aria-label="Close calendar" @click="showCalendarPopover = false">
              <X :size="14" />
            </button>
          </div>
        </div>
        <EmployeeLeaveDateCalendar
          v-model:start="pickerStart"
          v-model:end="pickerEnd"
          hide-presets
        />
      </div>

    </div>

  </div>
</template>

<style scoped>
.filters-card {
  margin-bottom: 14px;
  padding: 11px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.filter-row {
  display: grid;
  grid-template-columns:
    minmax(320px, 1fr)
    230px
    175px;
  gap: 8px;
}

.status-select {
  width: 100%;
  height: 40px;
  padding: 0 34px 0 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  outline: 0;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 11px;
  font-family: inherit;
  cursor: pointer;
}

.status-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(36, 107, 253, 0.08);
}

.date-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.date-control {
  display: flex;
  width: 215px;
  height: 42px;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--bg-card-soft);
  color: var(--text-muted);
  text-align: left;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.date-control:hover,
.date-control.is-active {
  border-color: var(--primary);
}

.date-control > div {
  min-width: 0;
  flex: 1;
}

.date-control span {
  display: block;
  font-size: 9px;
  color: var(--text-muted);
}

.date-control strong {
  display: block;
  margin-top: 2px;
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.calendar-popover {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 60;
  width: 360px;
  max-width: calc(100vw - 32px);
  padding: 10px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
}

.popover-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 0 4px;
}

.popover-header span {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
}

.popover-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.clear-range-btn {
  padding: 3px 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
}

.clear-range-btn:hover {
  color: var(--primary);
  border-color: var(--primary);
}

.close-popover-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.close-popover-btn:hover {
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

.filter-row :deep(input),
.filter-row :deep(select),
.filter-row :deep(button) {
  font-size: 11px;
}

@media (max-width: 1100px) {
  .filter-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 650px) {
  .filter-row {
    grid-template-columns: 1fr;
  }

  .date-row {
    align-items: stretch;
    flex-direction: column;
  }

  .date-control {
    width: 100%;
  }
}
</style>
