<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CalendarDays,
  Sparkles,
  RotateCcw,
} from 'lucide-vue-next'

const start = defineModel<string>('start', { required: true })
const end = defineModel<string>('end', { default: '' })

const props = withDefaults(defineProps<{
  minDate?: string
  maxDate?: string
  activeDates?: string[]
  totalDays?: number
  readonly?: boolean
  hidePresets?: boolean
}>(), {
  readonly: false,
  hidePresets: false,
})

// Parsing & formatting utilities (pure string-based, timezone-proof)
const parseDateString = (str: string): Date | null => {
  if (!str) return null
  const parts = str.split('-').map(Number)
  if (parts.length !== 3 || parts.some(isNaN)) return null
  return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0)
}

const formatDateString = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const getAdjacentDateStr = (dateStr: string, offsetDays: number): string => {
  const d = parseDateString(dateStr)
  if (!d) return ''
  d.setDate(d.getDate() + offsetDays)
  return formatDateString(d)
}

const formatPrettyDate = (dateStr: string) => {
  if (!dateStr) return '--'
  const d = parseDateString(dateStr)
  if (!d) return dateStr
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Current viewed month and year
const viewDate = ref<Date>(new Date())
const isSelectingEnd = ref(false)
const hoverDate = ref<string | null>(null)
const showMonthPicker = ref(false)
const showManualInputs = ref(false)

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]
const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const weekdays = [
  { short: 'SU', full: 'Sunday' },
  { short: 'MO', full: 'Monday' },
  { short: 'TU', full: 'Tuesday' },
  { short: 'WE', full: 'Wednesday' },
  { short: 'TH', full: 'Thursday' },
  { short: 'FR', full: 'Friday' },
  { short: 'SA', full: 'Saturday' },
]

// Sync viewDate to start date when opening or when start updates externally
watch(() => start.value, (newStart) => {
  if (newStart) {
    const d = parseDateString(newStart)
    if (d) {
      // Only jump view if start date's month differs from current viewDate
      if (d.getFullYear() !== viewDate.value.getFullYear() || d.getMonth() !== viewDate.value.getMonth()) {
        viewDate.value = new Date(d.getFullYear(), d.getMonth(), 1, 12, 0, 0)
      }
    }
  }
}, { immediate: true })

// Jump to activeDates month if start is not explicitly provided
watch(() => props.activeDates, (dates) => {
  if (dates && dates.length > 0 && !start.value) {
    const first = parseDateString(dates[0])
    if (first) {
      viewDate.value = new Date(first.getFullYear(), first.getMonth(), 1, 12, 0, 0)
    }
  }
}, { immediate: true })

const currentMonthLabel = computed(() => {
  return `${monthNames[viewDate.value.getMonth()]} ${viewDate.value.getFullYear()}`
})

const prevMonth = () => {
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() - 1, 1, 12, 0, 0)
}

const nextMonth = () => {
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + 1, 1, 12, 0, 0)
}

const prevYear = () => {
  viewDate.value = new Date(viewDate.value.getFullYear() - 1, viewDate.value.getMonth(), 1, 12, 0, 0)
}

const nextYear = () => {
  viewDate.value = new Date(viewDate.value.getFullYear() + 1, viewDate.value.getMonth(), 1, 12, 0, 0)
}

const selectMonthIndex = (index: number) => {
  viewDate.value = new Date(viewDate.value.getFullYear(), index, 1, 12, 0, 0)
  showMonthPicker.value = false
}

const goToToday = () => {
  const today = new Date()
  viewDate.value = new Date(today.getFullYear(), today.getMonth(), 1, 12, 0, 0)
}

// Days Calculation
interface CalendarCell {
  dateStr: string
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
  isWeekend: boolean
  isStart: boolean
  isEnd: boolean
  isInRange: boolean
  isSingleDay: boolean
  isHoverPreview: boolean
  isRangeLeftEdge: boolean
  isRangeRightEdge: boolean
}

const calendarCells = computed<CalendarCell[]>(() => {
  const year = viewDate.value.getFullYear()
  const month = viewDate.value.getMonth()

  const firstDay = new Date(year, month, 1, 12, 0, 0)
  const lastDay = new Date(year, month + 1, 0, 12, 0, 0)

  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const todayStr = formatDateString(new Date())
  const hasActiveDatesList = Boolean(props.activeDates && props.activeDates.length > 0)
  const activeDateSet = new Set(
    (props.activeDates || [])
      .map(d => (d || '').slice(0, 10))
      .filter(Boolean),
  )

  const rawStart = start.value || ''
  const rawEnd = end.value || rawStart

  // Handle active preview while picking end date
  let activeStart = rawStart
  let activeEnd = rawEnd

  if (isSelectingEnd.value && hoverDate.value) {
    if (hoverDate.value < rawStart) {
      activeStart = hoverDate.value
      activeEnd = rawStart
    } else {
      activeStart = rawStart
      activeEnd = hoverDate.value
    }
  }

  const cells: CalendarCell[] = []

  // Helper to build a cell
  const makeCell = (dateStr: string, dayNum: number, isCurrent: boolean, dayOfWeek: number): CalendarCell => {
    // Discrete active dates mode (when specific days are filed)
    if (hasActiveDatesList) {
      const isSelected = activeDateSet.has(dateStr)
      if (!isSelected) {
        return {
          dateStr,
          dayNumber: dayNum,
          isCurrentMonth: isCurrent,
          isToday: dateStr === todayStr,
          isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
          isStart: false,
          isEnd: false,
          isInRange: false,
          isSingleDay: false,
          isHoverPreview: false,
          isRangeLeftEdge: false,
          isRangeRightEdge: false,
        }
      }

      // Day is in active dates list. Only connect ribbon if adjacent days are also scheduled
      const prevDateStr = getAdjacentDateStr(dateStr, -1)
      const nextDateStr = getAdjacentDateStr(dateStr, 1)
      const hasPrev = activeDateSet.has(prevDateStr)
      const hasNext = activeDateSet.has(nextDateStr)

      // Standalone separate day (neither previous nor next day is on leave)
      if (!hasPrev && !hasNext) {
        return {
          dateStr,
          dayNumber: dayNum,
          isCurrentMonth: isCurrent,
          isToday: dateStr === todayStr,
          isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
          isStart: true,
          isEnd: true,
          isInRange: false,
          isSingleDay: true,
          isHoverPreview: false,
          isRangeLeftEdge: true,
          isRangeRightEdge: true,
        }
      }

      // Start of a consecutive multi-day group
      if (!hasPrev && hasNext) {
        return {
          dateStr,
          dayNumber: dayNum,
          isCurrentMonth: isCurrent,
          isToday: dateStr === todayStr,
          isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
          isStart: true,
          isEnd: false,
          isInRange: false,
          isSingleDay: false,
          isHoverPreview: false,
          isRangeLeftEdge: true,
          isRangeRightEdge: dayOfWeek === 6,
        }
      }

      // End of a consecutive multi-day group
      if (hasPrev && !hasNext) {
        return {
          dateStr,
          dayNumber: dayNum,
          isCurrentMonth: isCurrent,
          isToday: dateStr === todayStr,
          isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
          isStart: false,
          isEnd: true,
          isInRange: false,
          isSingleDay: false,
          isHoverPreview: false,
          isRangeLeftEdge: dayOfWeek === 0,
          isRangeRightEdge: true,
        }
      }

      // Middle of a consecutive multi-day group
      return {
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: isCurrent,
        isToday: dateStr === todayStr,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        isStart: false,
        isEnd: false,
        isInRange: true,
        isSingleDay: false,
        isHoverPreview: false,
        isRangeLeftEdge: dayOfWeek === 0,
        isRangeRightEdge: dayOfWeek === 6,
      }
    }

    // Default continuous start -> end range mode
    const isStart = activeStart !== '' && dateStr === activeStart
    const isEnd = activeEnd !== '' && dateStr === activeEnd
    const isSingleDay = isStart && isEnd
    const isInRange = activeStart !== '' && activeEnd !== '' && dateStr > activeStart && dateStr < activeEnd
    const isHoverPreview = isSelectingEnd.value && (isStart || isEnd || isInRange)

    // Check if cell is the left/right edge of row for border radius continuation
    const isRangeLeftEdge = dayOfWeek === 0 || isStart
    const isRangeRightEdge = dayOfWeek === 6 || isEnd

    return {
      dateStr,
      dayNumber: dayNum,
      isCurrentMonth: isCurrent,
      isToday: dateStr === todayStr,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      isStart,
      isEnd,
      isInRange,
      isSingleDay,
      isHoverPreview,
      isRangeLeftEdge,
      isRangeRightEdge,
    }
  }

  // Previous month padding
  const prevMonthLastDay = new Date(year, month, 0, 12, 0, 0).getDate()
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i
    const d = new Date(year, month - 1, dayNum, 12, 0, 0)
    const dateStr = formatDateString(d)
    cells.push(makeCell(dateStr, dayNum, false, d.getDay()))
  }

  // Current month
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const d = new Date(year, month, dayNum, 12, 0, 0)
    const dateStr = formatDateString(d)
    cells.push(makeCell(dateStr, dayNum, true, d.getDay()))
  }

  // Next month padding to fill grid to full weeks (35 or 42 cells)
  const totalCells = cells.length <= 35 ? 35 : 42
  const remaining = totalCells - cells.length
  for (let dayNum = 1; dayNum <= remaining; dayNum++) {
    const d = new Date(year, month + 1, dayNum, 12, 0, 0)
    const dateStr = formatDateString(d)
    cells.push(makeCell(dateStr, dayNum, false, d.getDay()))
  }

  return cells
})

// Date selection interactions
const handleCellClick = (cell: CalendarCell) => {
  if (props.readonly) return

  // If clicked a cell outside current month, smoothly navigate to that month
  if (!cell.isCurrentMonth) {
    const d = parseDateString(cell.dateStr)
    if (d) {
      viewDate.value = new Date(d.getFullYear(), d.getMonth(), 1, 12, 0, 0)
    }
  }

  if (!isSelectingEnd.value) {
    // First click: sets start date & temporary end
    start.value = cell.dateStr
    end.value = cell.dateStr
    isSelectingEnd.value = true
  } else {
    // Second click: sets end date
    if (cell.dateStr < start.value) {
      end.value = start.value
      start.value = cell.dateStr
    } else {
      end.value = cell.dateStr
    }
    isSelectingEnd.value = false
    hoverDate.value = null
  }
}

const handleCellHover = (dateStr: string) => {
  if (props.readonly) return
  if (isSelectingEnd.value) {
    hoverDate.value = dateStr
  }
}

const handleMouseLeaveGrid = () => {
  hoverDate.value = null
}

const resetToSingleDay = () => {
  end.value = start.value
  isSelectingEnd.value = false
  hoverDate.value = null
}

// Quick Presets
const setPreset = (type: 'today' | 'tomorrow' | 'next3' | 'nextWeek') => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0)

  if (type === 'today') {
    const s = formatDateString(today)
    start.value = s
    end.value = s
  } else if (type === 'tomorrow') {
    const tom = new Date(today.getTime())
    tom.setDate(tom.getDate() + 1)
    const s = formatDateString(tom)
    start.value = s
    end.value = s
  } else if (type === 'next3') {
    const s = formatDateString(today)
    const eDate = new Date(today.getTime())
    eDate.setDate(eDate.getDate() + 2)
    start.value = s
    end.value = formatDateString(eDate)
  } else if (type === 'nextWeek') {
    const dayOfWeek = today.getDay()
    const daysUntilNextMon = dayOfWeek === 0 ? 1 : 8 - dayOfWeek
    const nextMon = new Date(today.getTime())
    nextMon.setDate(nextMon.getDate() + daysUntilNextMon)
    const nextFri = new Date(nextMon.getTime())
    nextFri.setDate(nextFri.getDate() + 4)
    start.value = formatDateString(nextMon)
    end.value = formatDateString(nextFri)
  }

  isSelectingEnd.value = false
  hoverDate.value = null

  const d = parseDateString(start.value)
  if (d) {
    viewDate.value = new Date(d.getFullYear(), d.getMonth(), 1, 12, 0, 0)
  }
}

// Selected day count
const selectedDayCount = computed(() => {
  if (props.totalDays !== undefined && props.totalDays > 0) {
    return props.totalDays
  }
  if (props.activeDates && props.activeDates.length > 0) {
    return props.activeDates.length
  }
  if (!start.value) return 0
  const s = parseDateString(start.value)
  const e = parseDateString(end.value || start.value)
  if (!s || !e || e < s) return 1
  const diffTime = Math.abs(e.getTime() - s.getTime())
  return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1
})
</script>

<template>
  <div class="leave-calendar-card" aria-label="Leave date range calendar">
    <!-- Summary Header Strip -->
    <div v-if="!hidePresets" class="calendar-summary-strip">
      <div class="summary-selection">
        <div class="date-chip" :class="{ 'chip-pending': isSelectingEnd }">
          <span class="chip-tag">START</span>
          <span class="chip-date">{{ formatPrettyDate(start) }}</span>
        </div>
        <span class="range-separator">→</span>
        <div class="date-chip" :class="{ 'chip-pending': isSelectingEnd }">
          <span class="chip-tag">END</span>
          <span class="chip-date">{{ formatPrettyDate(end || start) }}</span>
        </div>
      </div>
      <div class="summary-actions">
        <span class="day-count-badge">
          {{ selectedDayCount }} day{{ selectedDayCount === 1 ? '' : 's' }}
        </span>
        <button
          v-if="!readonly && start !== (end || start)"
          type="button"
          class="reset-single-btn"
          title="Reset to 1-day leave"
          @click="resetToSingleDay"
        >
          <RotateCcw :size="12" />
          <span>1 Day</span>
        </button>
      </div>
    </div>

    <!-- Interactive Instruction / Hint -->
    <div v-if="!readonly && !hidePresets" class="calendar-hint-row">
      <span v-if="isSelectingEnd" class="hint-text hint-active">
        <span class="hint-dot pulse"></span>
        Tap an <strong>end date</strong> to complete range (or tap same date for 1 day)
      </span>
      <span v-else class="hint-text">
        <CalendarDays :size="12" class="hint-icon" />
        Tap date to choose <strong>start</strong> & <strong>end</strong> days
      </span>
    </div>

    <!-- Quick Presets -->
    <div v-if="!readonly && !hidePresets" class="presets-row">
      <div class="presets-label">
        <Sparkles :size="11" />
        <span>Quick:</span>
      </div>
      <div class="presets-list">
        <button type="button" class="preset-pill" @click="setPreset('today')">Today</button>
        <button type="button" class="preset-pill" @click="setPreset('tomorrow')">Tomorrow</button>
        <button type="button" class="preset-pill" @click="setPreset('next3')">3 Days</button>
        <button type="button" class="preset-pill" @click="setPreset('nextWeek')">Mon–Fri Next Week</button>
      </div>
    </div>

    <!-- Calendar Month Navigation Header -->
    <div class="calendar-nav-header">
      <div class="month-title-wrapper">
        <button
          type="button"
          class="month-title-btn"
          :title="showMonthPicker ? 'Show calendar view' : 'Choose month and year'"
          @click="showMonthPicker = !showMonthPicker"
        >
          <strong>{{ currentMonthLabel }}</strong>
          <ChevronDown :size="14" class="dropdown-caret-icon" />
        </button>
        <button
          type="button"
          class="today-jump-btn"
          title="Jump to current month"
          @click="goToToday"
        >
          Today
        </button>
      </div>

      <div class="nav-arrows">
        <button
          type="button"
          class="nav-btn"
          aria-label="Previous month"
          @click="prevMonth"
        >
          <ChevronLeft :size="16" />
        </button>
        <button
          type="button"
          class="nav-btn"
          aria-label="Next month"
          @click="nextMonth"
        >
          <ChevronRight :size="16" />
        </button>
      </div>
    </div>

    <!-- Month & Year Quick Selector View (Toggleable) -->
    <div v-if="showMonthPicker" class="month-picker-overlay">
      <div class="year-nav-row">
        <button type="button" class="nav-btn" aria-label="Previous year" @click="prevYear">
          <ChevronLeft :size="14" />
        </button>
        <span class="year-display">{{ viewDate.getFullYear() }}</span>
        <button type="button" class="nav-btn" aria-label="Next year" @click="nextYear">
          <ChevronRight :size="14" />
        </button>
      </div>
      <div class="months-grid">
        <button
          v-for="(name, idx) in shortMonthNames"
          :key="name"
          type="button"
          class="month-btn"
          :class="{ 'is-active-month': viewDate.getMonth() === idx }"
          @click="selectMonthIndex(idx)"
        >
          {{ name }}
        </button>
      </div>
    </div>

    <!-- Main Calendar Grid View -->
    <div v-else class="calendar-body">
      <!-- Weekday Headers -->
      <div class="weekdays-row">
        <span
          v-for="day in weekdays"
          :key="day.short"
          class="weekday-label"
          :title="day.full"
        >
          {{ day.short }}
        </span>
      </div>

      <!-- Days Matrix -->
      <div class="calendar-grid" @mouseleave="handleMouseLeaveGrid">
        <div
          v-for="cell in calendarCells"
          :key="cell.dateStr"
          class="day-cell-wrapper"
          :class="{
            'is-other-month': !cell.isCurrentMonth,
            'is-weekend': cell.isWeekend,
            'is-today': cell.isToday,
            'range-single': cell.isSingleDay,
            'range-start': cell.isStart && !cell.isSingleDay,
            'range-end': cell.isEnd && !cell.isSingleDay,
            'range-mid': cell.isInRange,
            'range-preview': cell.isHoverPreview,
            'range-left-edge': cell.isRangeLeftEdge,
            'range-right-edge': cell.isRangeRightEdge,
          }"
        >
          <button
            type="button"
            class="day-btn"
            :class="{
              'day-selected': cell.isStart || cell.isEnd,
              'day-in-range': cell.isInRange,
            }"
            :aria-label="cell.dateStr"
            @click="handleCellClick(cell)"
            @mouseenter="handleCellHover(cell.dateStr)"
          >
            <span class="day-num">{{ cell.dayNumber }}</span>
            <span v-if="cell.isToday && !cell.isStart && !cell.isEnd" class="today-dot"></span>
          </button>
        </div>
      </div>
    </div>

    <!-- Manual Inputs Toggle Link (For Screen Readers or Direct Typing) -->
    <div v-if="!readonly" class="calendar-footer">
      <button
        type="button"
        class="toggle-inputs-btn"
        @click="showManualInputs = !showManualInputs"
      >
        {{ showManualInputs ? 'Hide standard date inputs' : 'Need manual date inputs?' }}
      </button>

      <div v-if="showManualInputs" class="manual-inputs-container">
        <label class="manual-field">
          <span>Start Date</span>
          <input v-model="start" type="date" required>
        </label>
        <label class="manual-field">
          <span>End Date</span>
          <input v-model="end" type="date" :min="start" required>
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.leave-calendar-card {
  background: var(--bg-card-soft);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  user-select: none;
}

/* Reset all buttons within calendar to prevent global min-height: 44px stretching */
.leave-calendar-card button {
  min-height: 0 !important;
  min-width: 0;
  box-sizing: border-box;
  font-family: inherit;
}

/* Summary Strip */
.calendar-summary-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background: var(--bg-card);
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  padding: 6px 10px;
  flex-wrap: wrap;
}

.summary-selection {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.date-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  background: var(--bg-card-soft);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 3px 7px;
  transition: all 0.15s ease;
}

.date-chip.chip-pending {
  border-color: var(--primary);
  background: var(--primary-soft);
}

.chip-tag {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--text-muted);
}

.chip-date {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

.range-separator {
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 600;
}

.summary-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.day-count-badge {
  display: inline-flex;
  align-items: center;
  background: var(--primary-soft);
  color: var(--primary);
  border: 1px solid #1f68f230;
  border-radius: 6px;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.reset-single-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid var(--border);
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  border-radius: 6px;
  height: 24px !important;
  min-height: 24px !important;
  padding: 0 8px !important;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.reset-single-btn:hover {
  background: var(--border);
  color: var(--text-primary);
}

/* Hint Row */
.calendar-hint-row {
  display: flex;
  align-items: center;
  min-height: 18px;
}

.hint-text {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text-muted);
}

.hint-text.hint-active {
  color: var(--primary);
  font-weight: 500;
}

.hint-icon {
  color: var(--primary);
  flex-shrink: 0;
}

.hint-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--primary);
  display: inline-block;
  flex-shrink: 0;
}

.hint-dot.pulse {
  animation: pulse-dot 1.4s ease-in-out infinite;
}

@keyframes pulse-dot {
  0% { transform: scale(0.9); opacity: 0.6; }
  50% { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.6; }
}

/* Presets Row */
.presets-row {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 2px;
}

.presets-row::-webkit-scrollbar {
  display: none;
}

.presets-label {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.presets-list {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: nowrap;
}

.preset-pill {
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 600;
  height: 26px !important;
  min-height: 26px !important;
  padding: 0 10px !important;
  border-radius: 13px !important;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.preset-pill:hover {
  background: var(--primary-soft);
  color: var(--primary);
  border-color: #1f68f240;
}

/* Calendar Header */
.calendar-nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 2px 0 4px;
}

.month-title-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.month-title-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  height: 28px !important;
  min-height: 28px !important;
  padding: 0 6px !important;
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.month-title-btn:hover {
  background: var(--border-soft);
}

.dropdown-caret {
  font-size: 9px;
  color: var(--text-muted);
}

.today-jump-btn {
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 600;
  height: 24px !important;
  min-height: 24px !important;
  padding: 0 8px !important;
  border-radius: 6px !important;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.today-jump-btn:hover {
  color: var(--primary);
  border-color: var(--primary);
}

.nav-arrows {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px !important;
  height: 28px !important;
  min-width: 28px !important;
  min-height: 28px !important;
  max-width: 28px !important;
  max-height: 28px !important;
  padding: 0 !important;
  border: 1px solid var(--border);
  border-radius: 6px !important;
  background: var(--bg-card);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.nav-btn:hover {
  background: var(--border);
  color: var(--text-primary);
}

/* Month Picker Overlay */
.month-picker-overlay {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.year-nav-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.year-display {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}

.months-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.month-btn {
  border: 1px solid var(--border);
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 600;
  padding: 8px 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.month-btn:hover {
  background: var(--primary-soft);
  color: var(--primary);
}

.month-btn.is-active-month {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

/* Calendar Weekdays & Grid */
.calendar-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.weekdays-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
}

.weekday-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.5px;
  padding: 4px 0;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  row-gap: 3px;
  column-gap: 0;
}

.day-cell-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  min-height: 36px;
  max-height: 36px;
  padding: 0;
  margin: 0;
}

/* Continuous Range Ribbon using pseudo-elements matching circle height */
.day-cell-wrapper.range-mid::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 32px;
  transform: translateY(-50%);
  background: var(--primary-soft);
  z-index: 0;
}

.day-cell-wrapper.range-preview.range-mid::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 32px;
  transform: translateY(-50%);
  background: var(--primary-soft);
  opacity: 0.85;
  z-index: 0;
}

.day-cell-wrapper.range-start:not(.range-single)::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  right: 0;
  height: 32px;
  transform: translateY(-50%);
  background: var(--primary-soft);
  z-index: 0;
}

.day-cell-wrapper.range-end:not(.range-single)::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 50%;
  height: 32px;
  transform: translateY(-50%);
  background: var(--primary-soft);
  z-index: 0;
}

.day-cell-wrapper.range-left-edge.range-mid::before {
  border-top-left-radius: 16px;
  border-bottom-left-radius: 16px;
}

.day-cell-wrapper.range-right-edge.range-mid::before {
  border-top-right-radius: 16px;
  border-bottom-right-radius: 16px;
}

/* Day Button - Guaranteed Perfect Circle */
.day-btn {
  position: relative;
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  max-width: 32px !important;
  min-height: 32px !important;
  max-height: 32px !important;
  aspect-ratio: 1 / 1 !important;
  border: none !important;
  background: transparent;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.15s ease;
  z-index: 1;
  padding: 0 !important;
  margin: 0 !important;
  line-height: 1;
  box-sizing: border-box !important;
  flex-shrink: 0;
}

.day-cell-wrapper.is-other-month .day-btn {
  color: var(--text-muted);
  opacity: 0.4;
}

.day-cell-wrapper.is-weekend:not(.range-start):not(.range-end):not(.range-mid) .day-btn {
  color: var(--text-secondary);
}

.day-btn:hover {
  background: var(--border-soft);
}

.day-cell-wrapper.range-mid .day-btn {
  color: var(--primary);
  font-weight: 600;
  border-radius: 50% !important;
  background: transparent !important;
}

.day-btn.day-selected {
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  max-width: 32px !important;
  min-height: 32px !important;
  max-height: 32px !important;
  aspect-ratio: 1 / 1 !important;
  border-radius: 50% !important;
  background: var(--primary) !important;
  color: #ffffff !important;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(36, 107, 253, 0.4) !important;
}

.today-dot {
  position: absolute;
  bottom: 2px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--primary);
  pointer-events: none;
}

/* Footer / Manual Inputs */
.calendar-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 4px;
  border-top: 1px dashed var(--border-soft);
}

.toggle-inputs-btn {
  align-self: flex-start;
  background: none;
  border: none;
  padding: 0;
  font-size: 10px;
  color: var(--text-muted);
  text-decoration: underline;
  cursor: pointer;
  transition: color 0.15s ease;
}

.toggle-inputs-btn:hover {
  color: var(--primary);
}

.manual-inputs-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.manual-field {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.manual-field span {
  font-size: 10px;
  color: var(--text-secondary);
  font-weight: 600;
}

.manual-field input {
  font-size: 11px;
  padding: 5px 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-card);
  color: var(--text-primary);
}

/* Responsive adjustments for Mobile */
@media (max-width: 480px) {
  .leave-calendar-card {
    padding: 10px 8px;
    gap: 8px;
  }
  .calendar-summary-strip {
    padding: 5px 8px;
  }
  .chip-date {
    font-size: 10px;
  }
  .day-cell-wrapper {
    height: 34px;
    min-height: 34px;
    max-height: 34px;
  }
  .day-cell-wrapper.range-mid::before,
  .day-cell-wrapper.range-preview.range-mid::before,
  .day-cell-wrapper.range-start:not(.range-single)::before,
  .day-cell-wrapper.range-end:not(.range-single)::before {
    height: 30px;
  }
  .day-cell-wrapper.range-left-edge.range-mid::before,
  .day-cell-wrapper.range-right-edge.range-mid::before {
    border-radius: 15px;
  }
  .day-btn {
    width: 30px !important;
    height: 30px !important;
    min-width: 30px !important;
    max-width: 30px !important;
    min-height: 30px !important;
    max-height: 30px !important;
    font-size: 11px;
  }
  .day-btn.day-selected {
    width: 30px !important;
    height: 30px !important;
    min-width: 30px !important;
    max-width: 30px !important;
    min-height: 30px !important;
    max-height: 30px !important;
  }
  .month-title-btn {
    font-size: 12px;
  }
}
</style>
