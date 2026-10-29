<script setup lang="ts">
import {
  X,
  CalendarClock,
  Save,
  Clock3,
  Coffee,
  Info,
} from 'lucide-vue-next'

import type {
  WorkScheduleFormData,
  WorkScheduleStatus,
  WorkScheduleType,
} from '~/types/workSchedule'

const props = defineProps<{
  open: boolean
  suggestedCode: string
  scheduleTypes: WorkScheduleType[]
  saving: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [data: WorkScheduleFormData]
}>()

const {
  error,
} = useToast()

const statusOptions: WorkScheduleStatus[] = [
  'Active',
  'Inactive',
]


/* =========================================================
   FORM
========================================================= */

const form = reactive<WorkScheduleFormData>({
  code: '',
  name: '',
  type: '',

  timeIn: '08:00',
  timeOut: '17:00',

  breakStart: '12:00',
  breakEnd: '13:00',

  workHours: 8,
  gracePeriod: 5,

  status: 'Active',
})

interface DaySchedule {
  day: string
  label: string
  enabled: boolean
  timeIn: string
  timeOut: string
}

const weekDays = reactive<DaySchedule[]>([
  { day: 'monday', label: 'Monday', enabled: true, timeIn: '08:00', timeOut: '17:00' },
  { day: 'tuesday', label: 'Tuesday', enabled: true, timeIn: '08:00', timeOut: '17:00' },
  { day: 'wednesday', label: 'Wednesday', enabled: true, timeIn: '08:00', timeOut: '17:00' },
  { day: 'thursday', label: 'Thursday', enabled: true, timeIn: '08:00', timeOut: '17:00' },
  { day: 'friday', label: 'Friday', enabled: true, timeIn: '08:00', timeOut: '17:00' },
  { day: 'saturday', label: 'Saturday', enabled: false, timeIn: '08:00', timeOut: '12:00' },
  { day: 'sunday', label: 'Sunday', enabled: false, timeIn: '08:00', timeOut: '12:00' },
])

const applyMonToWeekdays = () => {
  const mon = weekDays.find(d => d.day === 'monday')
  if (!mon) return
  weekDays.forEach(d => {
    if (['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(d.day)) {
      d.timeIn = mon.timeIn
      d.timeOut = mon.timeOut
      d.enabled = true
    }
  })
}

/* =========================================================
   COMPUTED
========================================================= */

const isFlexible = computed(() => {
  return form.type === 'Flexible' || form.type.toLowerCase().includes('flexible')
})

/* =========================================================
   RESET
========================================================= */

const resetForm = () => {
  form.code = props.suggestedCode

  form.name = ''
  form.type = props.scheduleTypes[0] ?? ''

  form.timeIn = '08:00'
  form.timeOut = '17:00'

  form.breakStart = '12:00'
  form.breakEnd = '13:00'

  form.workHours = 8
  form.gracePeriod = 5

  form.status = 'Active'

  weekDays.forEach((d, i) => {
    d.enabled = i < 5
    d.timeIn = '08:00'
    d.timeOut = '17:00'
  })
}

/* =========================================================
   OPEN WATCHER
========================================================= */

watch(
  () => props.open,
  value => {
    if (value) {
      resetForm()
    }
  },
)

/* =========================================================
   ACTIONS
========================================================= */

const handleClose = () => {
  emit('close')
}

const handleSave = () => {
  if (!form.name.trim()) {
    error(
      'Schedule Name Required',
      'Please enter a work schedule name.',
    )

    return
  }

  if (!form.code.trim()) {
    error(
      'Schedule Code Required',
      'Please enter a work schedule code.',
    )

    return
  }

  if (!form.type) {
    error(
      'Schedule Type Required',
      'Please select a schedule type.',
    )

    return
  }

  const activeDay = weekDays.find(d => d.enabled && d.timeIn && d.timeOut) || weekDays[0]
  const finalTimeIn = !isFlexible.value ? (activeDay?.timeIn || form.timeIn || '08:00') : form.timeIn
  const finalTimeOut = !isFlexible.value ? (activeDay?.timeOut || form.timeOut || '17:00') : form.timeOut

  if (!isFlexible.value && (!finalTimeIn || !finalTimeOut)) {
    error(
      'Working Hours Required',
      'Please provide time in and time out for active work days.',
    )
    return
  }

  if (
    !form.workHours ||
    form.workHours <= 0
  ) {
    error(
      'Invalid Work Hours',
      'Required work hours must be greater than zero.',
    )

    return
  }

  emit('save', {
    code:
      form.code.trim(),

    name:
      form.name.trim(),

    type:
      form.type,
    timeIn:
      finalTimeIn,

    timeOut:
      finalTimeOut,

    breakStart:
      form.breakStart,

    breakEnd:
      form.breakEnd,

    workHours:
      Number(
        form.workHours,
      ),

    gracePeriod:
      Number(
        form.gracePeriod,
      ),

    status:
      form.status,
  })
}
</script>

<template>
  <Teleport to="body">

    <Transition name="modal">

      <div
        v-if="open"
        class="modal-backdrop"
        @click.self="handleClose"
      >

        <div class="modal-card">

          <!-- ================================
               HEADER
          ================================= -->

          <div class="modal-header">

            <div class="header-left">

              <div class="header-icon">
                <CalendarClock :size="20" />
              </div>

              <div>
                <h2>
                  Add Work Schedule
                </h2>

               <p>
                  Create a reusable employee shift with
                  working hours and break configuration.
                </p>
              </div>

            </div>

            <button
              type="button"
              class="close-button"
              @click="handleClose"
            >
              <X :size="18" />
            </button>

          </div>

          <!-- ================================
               BODY
          ================================= -->

          <div class="modal-body">

            <!-- BASIC INFORMATION -->

            <div class="form-section">

              <div class="section-heading">

                <div class="section-icon blue">
                  <CalendarClock :size="16" />
                </div>

                <div>
                  <h3>
                    Schedule Information
                  </h3>

                  <p>
                    Basic schedule name, code and type.
                  </p>
                </div>

              </div>

              <div class="form-grid">

                <div class="field-group">
                  <label>
                    Schedule Name
                    <span>*</span>
                  </label>

                  <AppInput
                    v-model="form.name"
                    placeholder="Example: Regular Day Shift"
                  />
                </div>

                <div class="field-group">
                  <label>
                    Schedule Code
                    <span>*</span>
                  </label>

                  <AppInput
                    v-model="form.code"
                    placeholder="WS-005"
                  />
                </div>

                <div class="field-group">
                  <label>
                    Schedule Type
                  </label>

                  <AppSelect
                    v-model="form.type"
                    :options="props.scheduleTypes"
                    placeholder="Select schedule type"
                  />
                </div>

                <div class="field-group">
                  <label>
                    Status
                  </label>

                  <AppSelect
                    v-model="form.status"
                    :options="statusOptions"
                  />
                </div>

              </div>

            </div>

            <!-- WORKING HOURS & DAY-BY-DAY SHIFT TIMINGS -->

            <div class="form-section">

              <div class="section-heading">

                <div class="section-icon green">
                  <Clock3 :size="16" />
                </div>

                <div class="heading-with-action">
                  <div>
                    <h3>
                      Day-by-Day Shift Timings (Monday – Sunday)
                    </h3>
                    <p>
                      Set specific Time In and Time Out for each workday. Uncheck non-working days.
                    </p>
                  </div>
                  <button
                    type="button"
                    class="btn-text-action"
                    @click="applyMonToWeekdays"
                  >
                    Apply Monday to Weekdays
                  </button>
                </div>

              </div>

              <!-- WEEKDAYS TIMINGS TABLE / CARDS -->
              <div class="days-schedule-container">
                <div
                  v-for="d in weekDays"
                  :key="d.day"
                  class="day-schedule-row"
                  :class="{ 'day-disabled': !d.enabled }"
                >
                  <label class="day-checkbox-label">
                    <input
                      v-model="d.enabled"
                      type="checkbox"
                    >
                    <span class="day-name">{{ d.label }}</span>
                  </label>

                  <div class="day-times" v-if="d.enabled">
                    <div class="mini-field">
                      <span class="mini-label">In:</span>
                      <input
                        v-model="d.timeIn"
                        type="time"
                        class="native-input mini"
                      >
                    </div>
                    <span class="time-dash">-</span>
                    <div class="mini-field">
                      <span class="mini-label">Out:</span>
                      <input
                        v-model="d.timeOut"
                        type="time"
                        class="native-input mini"
                      >
                    </div>
                  </div>
                  <div class="day-rest-badge" v-else>
                    Rest Day / Off
                  </div>
                </div>
              </div>

              <div class="form-grid small-top">

                <div class="field-group">
                  <label>
                    Required Work Hours (Daily)
                  </label>

                  <div class="number-input">
                    <input
                      v-model.number="form.workHours"
                      type="number"
                      min="1"
                      max="24"
                      step="0.5"
                    >

                    <span>
                      hours
                    </span>
                  </div>
                </div>

                <div class="field-group">
                  <label>
                    Grace Period
                  </label>

                  <div class="number-input">
                    <input
                      v-model.number="form.gracePeriod"
                      type="number"
                      min="0"
                      max="120"
                    >

                    <span>
                      minutes
                    </span>
                  </div>
                </div>

              </div>

              <div
                v-if="isFlexible"
                class="info-box"
              >
                <Info :size="16" />

                <div>
                  <strong>
                    Flexible Schedule
                  </strong>

                  <p>
                    Fixed time in and time out are optional for flexible schedules. Required work hours will still be used for attendance computation.
                  </p>
                </div>
              </div>

            </div>

            <!-- BREAK -->

            <div
              v-if="!isFlexible"
              class="form-section"
            >

              <div class="section-heading">

                <div class="section-icon orange">
                  <Coffee :size="16" />
                </div>

                <div>
                  <h3>
                    Break Schedule
                  </h3>

                  <p>
                    Configure the standard employee break period.
                  </p>
                </div>

              </div>

              <div class="time-grid">

                <div class="field-group">
                  <label>
                    Break Start
                  </label>

                  <input
                    v-model="form.breakStart"
                    type="time"
                    class="native-input"
                  >
                </div>

                <div class="field-group">
                  <label>
                    Break End
                  </label>

                  <input
                    v-model="form.breakEnd"
                    type="time"
                    class="native-input"
                  >
                </div>

              </div>

            </div>

          </div>

          <!-- ================================
               FOOTER
          ================================= -->

          <div class="modal-footer">

           <div class="footer-note">
              <Info :size="14" />

              Rest days are assigned individually
              from the employee's employment information.
            </div>

            <div class="footer-actions">

              <AppButton
                variant="secondary"
                @click="handleClose"
              >
                Cancel
              </AppButton>

              <AppButton
                :icon="Save"
                :disabled="saving"
                @click="handleSave"
              >
                {{ saving ? 'Saving...' : 'Save Schedule' }}
              </AppButton>

            </div>

          </div>

        </div>

      </div>

    </Transition>

  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;

  z-index: 9999;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;

  background:
    rgba(3, 8, 18, 0.74);

  backdrop-filter: blur(3px);
}

.modal-card {
  display: flex;

  width: 100%;
  max-width: 820px;
  max-height: calc(100vh - 40px);

  flex-direction: column;

  overflow: hidden;

  border: 1px solid var(--border);
  border-radius: 13px;

  background: var(--bg-card);

  box-shadow:
    0 24px 80px
    rgba(0, 0, 0, 0.38);
}

/* =========================================
   HEADER
========================================= */

.modal-header {
  display: flex;

  flex-shrink: 0;

  align-items: center;
  justify-content: space-between;

  gap: 16px;

  padding: 16px 18px;

  border-bottom:
    1px solid var(--border-soft);
}

.header-left {
  display: flex;

  align-items: center;

  gap: 11px;
}

.header-icon {
  display: flex;

  width: 42px;
  height: 42px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 10px;

  background: var(--primary-soft);
  color: var(--primary);
}

.modal-header h2 {
  margin: 0;

  color: var(--text-primary);

  font-size: 16px;
  font-weight: 700;
}

.modal-header p {
  margin: 4px 0 0;

  color: var(--text-muted);

  font-size: 10px;

  line-height: 1.45;
}

.close-button {
  display: flex;

  width: 34px;
  height: 34px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border: 1px solid var(--border);
  border-radius: 7px;

  background: transparent;
  color: var(--text-secondary);

  cursor: pointer;
}

.close-button:hover {
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

/* =========================================
   BODY
========================================= */

.modal-body {
  flex: 1;

  overflow-y: auto;

  padding: 17px 18px;
}

.form-section {
  padding: 15px;

  border: 1px solid var(--border-soft);
  border-radius: 10px;

  background: var(--bg-card-soft);
}

.form-section + .form-section {
  margin-top: 13px;
}

.section-heading {
  display: flex;

  align-items: center;

  gap: 9px;

  margin-bottom: 14px;
}

.section-icon {
  display: flex;

  width: 34px;
  height: 34px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;
}

.section-icon.blue {
  background: var(--primary-soft);
  color: var(--primary);
}

.section-icon.green {
  background: var(--green-soft);
  color: var(--green);
}

.section-icon.orange {
  background: var(--orange-soft);
  color: var(--orange);
}

.section-icon.purple {
  background: var(--purple-soft);
  color: var(--purple);
}

.section-heading h3 {
  margin: 0;

  color: var(--text-primary);

  font-size: 12px;
  font-weight: 700;
}

.section-heading p {
  margin: 3px 0 0;

  color: var(--text-muted);

  font-size: 9px;
}

/* =========================================
   FIELDS
========================================= */

.form-grid,
.time-grid {
  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 12px;
}

.small-top {
  margin-top: 12px;
}

.field-group label {
  display: block;

  margin-bottom: 6px;

  color: var(--text-primary);

  font-size: 10px;
  font-weight: 600;
}

.field-group label span {
  color: var(--red);
}

.native-input,
.number-input {
  width: 100%;

  height: 38px;

  border: 1px solid var(--border);
  border-radius: 7px;

  background: var(--bg-card);
  color: var(--text-primary);
}

.native-input {
  padding: 0 10px;

  outline: none;

  font-family: inherit;
  font-size: 10px;

  color-scheme: dark;
}

html:not(.dark) .native-input {
  color-scheme: light;
}

.native-input:focus {
  border-color: var(--primary);
}

.number-input {
  display: flex;

  align-items: center;

  overflow: hidden;
}

.number-input input {
  min-width: 0;

  flex: 1;

  height: 100%;

  padding: 0 10px;

  border: 0;
  outline: none;

  background: transparent;
  color: var(--text-primary);

  font-size: 10px;
}

.number-input span {
  padding: 0 10px;

  border-left:
    1px solid var(--border-soft);

  color: var(--text-muted);

  font-size: 9px;
}

/* =========================================
   FLEXIBLE INFO
========================================= */

.info-box {
  display: flex;

  gap: 9px;

  margin-top: 12px;

  padding: 11px;

  border: 1px solid var(--border-soft);
  border-radius: 8px;

  background: var(--primary-soft);
  color: var(--primary);
}

.info-box svg {
  flex-shrink: 0;

  margin-top: 1px;
}

.info-box strong {
  display: block;

  color: var(--text-primary);

  font-size: 10px;
}

.info-box p {
  margin: 4px 0 0;

  color: var(--text-secondary);

  font-size: 9px;

  line-height: 1.5;
}

/* =========================================
   DAY BY DAY SCHEDULE STYLES
========================================= */

.heading-with-action {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.btn-text-action {
  padding: 4px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-card);
  color: var(--primary);
  font-size: 9px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.btn-text-action:hover {
  background: var(--primary-soft);
  border-color: var(--primary);
}

.days-schedule-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
}

.day-schedule-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  background: var(--bg-card);
  transition: all 0.15s ease;
}

.day-schedule-row.day-disabled {
  opacity: 0.55;
  background: var(--bg-card-soft);
}

.day-checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.day-checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--primary);
  cursor: pointer;
}

.day-name {
  color: var(--text-primary);
  font-size: 10px;
  font-weight: 600;
  min-width: 75px;
}

.day-times {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mini-field {
  display: flex;
  align-items: center;
  gap: 5px;
}

.mini-label {
  color: var(--text-muted);
  font-size: 9px;
}

.native-input.mini {
  width: 110px;
  height: 32px;
  font-size: 9px;
}

.time-dash {
  color: var(--text-muted);
  font-size: 10px;
}

.day-rest-badge {
  padding: 3px 8px;
  border-radius: 4px;
  background: var(--bg-card-soft);
  color: var(--text-muted);
  font-size: 9px;
  font-weight: 500;
}

/* =========================================
   FOOTER
========================================= */

.modal-footer {
  display: flex;

  flex-shrink: 0;

  align-items: center;
  justify-content: space-between;

  gap: 15px;

  padding: 13px 18px;

  border-top:
    1px solid var(--border-soft);

  background: var(--bg-card-soft);
}

.footer-note {
  display: flex;

  align-items: center;

  gap: 6px;

  color: var(--text-muted);

  font-size: 9px;
}

.footer-actions {
  display: flex;

  gap: 8px;
}

/* =========================================
   TRANSITION
========================================= */

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.15s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* =========================================
   RESPONSIVE
========================================= */

@media (max-width: 700px) {
  .form-grid,
  .time-grid {
    grid-template-columns: 1fr;
  }

  .days-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .modal-footer {
    align-items: stretch;

    flex-direction: column;
  }

  .footer-actions {
    justify-content: flex-end;
  }
}
</style>
