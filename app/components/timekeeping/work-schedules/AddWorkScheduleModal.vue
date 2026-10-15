<script setup lang="ts">
import {
  X,
  CalendarClock,
  Save,
  Clock3,
  Coffee,
  CalendarDays,
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
}>()

const emit = defineEmits<{
  close: []
  save: [data: WorkScheduleFormData]
}>()

const {
  error,
} = useToast()

/* =========================================================
   OPTIONS
========================================================= */

const scheduleTypes: WorkScheduleType[] = [
  'Regular',
  'Morning Shift',
  'Night Shift',
  'Flexible',
]

const statusOptions: WorkScheduleStatus[] = [
  'Active',
  'Inactive',
]

const days = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

/* =========================================================
   FORM
========================================================= */

const form = reactive<WorkScheduleFormData>({
  code: '',
  name: '',
  type: 'Regular',

  timeIn: '08:00',
  timeOut: '17:00',

  breakStart: '12:00',
  breakEnd: '13:00',

  workHours: 8,
  gracePeriod: 5,

  restDays: ['Sunday'],

  status: 'Active',
})

/* =========================================================
   COMPUTED
========================================================= */

const isFlexible = computed(() => {
  return form.type === 'Flexible'
})

/* =========================================================
   RESET
========================================================= */

const resetForm = () => {
  form.code = props.suggestedCode

  form.name = ''
  form.type = 'Regular'

  form.timeIn = '08:00'
  form.timeOut = '17:00'

  form.breakStart = '12:00'
  form.breakEnd = '13:00'

  form.workHours = 8
  form.gracePeriod = 5

  form.restDays = [
    'Sunday',
  ]

  form.status = 'Active'
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
   REST DAY
========================================================= */

const toggleRestDay = (
  day: string,
) => {
  if (
    form.restDays.includes(day)
  ) {
    form.restDays =
      form.restDays.filter(
        item =>
          item !== day,
      )

    return
  }

  form.restDays.push(day)
}

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

  if (
    !isFlexible.value &&
    (
      !form.timeIn ||
      !form.timeOut
    )
  ) {
    error(
      'Working Hours Required',
      'Please provide the time in and time out.',
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
      form.timeIn,

    timeOut:
      form.timeOut,

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

    restDays: [
      ...form.restDays,
    ],

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
                  Create a new employee work schedule,
                  working hours and rest day configuration.
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
                    :options="scheduleTypes"
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

            <!-- WORKING HOURS -->

            <div class="form-section">

              <div class="section-heading">

                <div class="section-icon green">
                  <Clock3 :size="16" />
                </div>

                <div>
                  <h3>
                    Working Hours
                  </h3>

                  <p>
                    Configure employee time in,
                    time out and required working hours.
                  </p>
                </div>

              </div>

              <div
                v-if="!isFlexible"
                class="time-grid"
              >

                <div class="field-group">
                  <label>
                    Time In
                    <span>*</span>
                  </label>

                  <input
                    v-model="form.timeIn"
                    type="time"
                    class="native-input"
                  >
                </div>

                <div class="field-group">
                  <label>
                    Time Out
                    <span>*</span>
                  </label>

                  <input
                    v-model="form.timeOut"
                    type="time"
                    class="native-input"
                  >
                </div>

              </div>

              <div class="form-grid small-top">

                <div class="field-group">
                  <label>
                    Required Work Hours
                  </label>

                  <div class="number-input">
                    <input
                      v-model.number="form.workHours"
                      type="number"
                      min="1"
                      max="24"
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
                    Fixed time in and time out are not required
                    for flexible schedules. Required work hours
                    will still be used for attendance computation.
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

            <!-- REST DAYS -->

            <div class="form-section">

              <div class="section-heading">

                <div class="section-icon purple">
                  <CalendarDays :size="16" />
                </div>

                <div>
                  <h3>
                    Rest Day Configuration
                  </h3>

                  <p>
                    Select one or more default rest days.
                  </p>
                </div>

              </div>

              <div class="days-grid">

                <button
                  v-for="day in days"
                  :key="day"
                  type="button"
                  class="day-button"
                  :class="{
                    selected:
                      form.restDays.includes(
                        day,
                      ),
                  }"
                  @click="
                    toggleRestDay(day)
                  "
                >
                  <span class="day-check">
                    ✓
                  </span>

                  {{ day }}
                </button>

              </div>

            </div>

          </div>

          <!-- ================================
               FOOTER
          ================================= -->

          <div class="modal-footer">

            <div class="footer-note">
              <Info :size="14" />

              Employee assignments can be added
              after the schedule is created.
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
                @click="handleSave"
              >
                Save Schedule
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
   DAYS
========================================= */

.days-grid {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 7px;
}

.day-button {
  display: flex;

  min-height: 38px;

  align-items: center;

  gap: 7px;

  padding: 0 9px;

  border: 1px solid var(--border);
  border-radius: 7px;

  background: var(--bg-card);
  color: var(--text-secondary);

  font-size: 9px;

  cursor: pointer;
}

.day-button:hover {
  border-color: var(--primary);
}

.day-button.selected {
  border-color: var(--primary);

  background: var(--primary-soft);
  color: var(--primary);
}

.day-check {
  display: flex;

  width: 17px;
  height: 17px;

  align-items: center;
  justify-content: center;

  border: 1px solid var(--border);
  border-radius: 4px;

  color: transparent;

  font-size: 10px;
}

.day-button.selected .day-check {
  border-color: var(--primary);

  background: var(--primary);
  color: white;
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