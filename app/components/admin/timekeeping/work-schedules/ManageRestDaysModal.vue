<script setup lang="ts">
import {
  X,
  CalendarDays,
  Clock3,
  Info,
  Save,
} from 'lucide-vue-next'

import type {
  WorkSchedule,
} from '~/types/workSchedule'

const props = defineProps<{
  open: boolean
  schedules: WorkSchedule[]
}>()

const emit = defineEmits<{
  close: []

  save: [
    data: {
      scheduleId: number
      restDays: string[]
      effectiveDate: string
    },
  ]
}>()

const {
  error,
} = useToast()

/* =========================================================
   DAYS
========================================================= */

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
   STATE
========================================================= */

const selectedScheduleId =
  ref<number | null>(null)

const effectiveDate =
  ref('')

const selectedRestDays =
  ref<string[]>([])

/* =========================================================
   HELPERS
========================================================= */

const getToday = () => {
  const now =
    new Date()

  const localDate =
    new Date(
      now.getTime() -
      now.getTimezoneOffset() *
        60000,
    )

  return localDate
    .toISOString()
    .slice(0, 10)
}

/* =========================================================
   SELECTED SCHEDULE
========================================================= */

const selectedSchedule =
  computed(() => {
    if (
      selectedScheduleId.value ===
      null
    ) {
      return undefined
    }

    return props.schedules.find(
      schedule =>
        schedule.id ===
        selectedScheduleId.value,
    )
  })

const currentRestDays =
  computed(() => {
    if (
      !selectedSchedule.value
    ) {
      return 'Not configured'
    }

    if (
      !selectedSchedule.value
        .restDays.length
    ) {
      return 'No rest day'
    }

    return selectedSchedule.value
      .restDays
      .join(', ')
  })

const workingHours =
  computed(() => {
    if (
      !selectedSchedule.value
    ) {
      return '—'
    }

    if (
      !selectedSchedule.value
        .timeIn ||
      !selectedSchedule.value
        .timeOut
    ) {
      return 'Flexible'
    }

    return `${selectedSchedule.value.timeIn} - ${selectedSchedule.value.timeOut}`
  })

/* =========================================================
   LOAD CURRENT REST DAYS
========================================================= */

const loadScheduleRestDays = () => {
  if (
    !selectedSchedule.value
  ) {
    selectedRestDays.value =
      []

    return
  }

  selectedRestDays.value = [
    ...selectedSchedule.value
      .restDays,
  ]
}

/* =========================================================
   RESET
========================================================= */

const resetModal = () => {
  effectiveDate.value =
    getToday()

  const firstActive =
    props.schedules.find(
      schedule =>
        schedule.status ===
        'Active',
    )

  const firstSchedule =
    firstActive ??
    props.schedules[0]

  selectedScheduleId.value =
    firstSchedule?.id ??
    null

  loadScheduleRestDays()
}

/* =========================================================
   WATCH
========================================================= */

watch(
  () => props.open,
  value => {
    if (value) {
      resetModal()
    }
  },
)

watch(
  selectedScheduleId,
  () => {
    loadScheduleRestDays()
  },
)

/* =========================================================
   REST DAY SELECTION
========================================================= */

const isSelected = (
  day: string,
) => {
  return selectedRestDays.value
    .includes(day)
}

const toggleRestDay = (
  day: string,
) => {
  if (
    selectedRestDays.value
      .includes(day)
  ) {
    selectedRestDays.value =
      selectedRestDays.value
        .filter(
          item =>
            item !== day,
        )

    return
  }

  selectedRestDays.value.push(
    day,
  )
}

/* =========================================================
   CLOSE
========================================================= */

const handleClose = () => {
  emit('close')
}

/* =========================================================
   SAVE
========================================================= */

const handleSave = () => {
  if (
    selectedScheduleId.value ===
    null
  ) {
    error(
      'Schedule Required',
      'Please select a work schedule.',
    )

    return
  }

  if (!effectiveDate.value) {
    error(
      'Effective Date Required',
      'Please select an effective date.',
    )

    return
  }

  if (
    !selectedRestDays.value
      .length
  ) {
    error(
      'Rest Day Required',
      'Please select at least one rest day.',
    )

    return
  }

  emit('save', {
    scheduleId:
      selectedScheduleId.value,

    restDays: [
      ...selectedRestDays.value,
    ],

    effectiveDate:
      effectiveDate.value,
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

          <!-- =========================================
               HEADER
          ========================================== -->

          <div class="modal-header">

            <div class="header-left">

              <div class="header-icon">
                <CalendarDays :size="20" />
              </div>

              <div>
                <h2>
                  Manage Rest Days
                </h2>

                <p>
                  Configure the default rest days
                  assigned to a work schedule.
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

          <!-- =========================================
               BODY
          ========================================== -->

          <div class="modal-body">

            <!-- SCHEDULE -->

            <section class="form-section">

              <div class="section-heading">

                <div class="section-icon blue">
                  <Clock3 :size="17" />
                </div>

                <div>
                  <h3>
                    Work Schedule
                  </h3>

                  <p>
                    Select the schedule whose
                    default rest days will be updated.
                  </p>
                </div>

              </div>

              <div class="form-grid">

                <div class="field-group">

                  <label>
                    Work Schedule
                    <span>*</span>
                  </label>

                  <select
                    v-model="
                      selectedScheduleId
                    "
                    class="native-select"
                  >
                    <option
                      :value="null"
                      disabled
                    >
                      Select schedule
                    </option>

                    <option
                      v-for="schedule in schedules"
                      :key="schedule.id"
                      :value="schedule.id"
                    >
                      {{ schedule.name }}
                      ·
                      {{ schedule.code }}
                    </option>
                  </select>

                </div>

                <div class="field-group">

                  <label>
                    Effective Date
                    <span>*</span>
                  </label>

                  <div class="date-field">

                    <CalendarDays
                      :size="15"
                    />

                    <input
                      v-model="
                        effectiveDate
                      "
                      type="date"
                    >

                  </div>

                </div>

              </div>

              <!-- CURRENT SCHEDULE INFO -->

              <div
                v-if="selectedSchedule"
                class="schedule-preview"
              >

                <div>
                  <span>
                    Schedule
                  </span>

                  <strong>
                    {{
                      selectedSchedule.name
                    }}
                  </strong>
                </div>

                <div>
                  <span>
                    Working Hours
                  </span>

                  <strong>
                    {{ workingHours }}
                  </strong>
                </div>

                <div>
                  <span>
                    Required Hours
                  </span>

                  <strong>
                    {{
                      selectedSchedule.workHours
                    }}
                    hours
                  </strong>
                </div>

                <div>
                  <span>
                    Current Rest Day
                  </span>

                  <strong>
                    {{ currentRestDays }}
                  </strong>
                </div>

              </div>

            </section>

            <!-- REST DAYS -->

            <section class="rest-day-section">

              <div class="section-heading">

                <div class="section-icon purple">
                  <CalendarDays :size="17" />
                </div>

                <div>
                  <h3>
                    Rest Day Configuration
                  </h3>

                  <p>
                    Select one or more default
                    rest days for this schedule.
                  </p>
                </div>

              </div>

              <div class="rest-day-summary">

                <span>
                  Selected Rest Days
                </span>

                <strong>
                  {{
                    selectedRestDays.length
                      ? selectedRestDays.join(
                          ', ',
                        )
                      : 'None selected'
                  }}
                </strong>

              </div>

              <div class="days-grid">

                <button
                  v-for="day in days"
                  :key="day"
                  type="button"
                  class="day-card"
                  :class="{
                    selected:
                      isSelected(day),
                  }"
                  @click="
                    toggleRestDay(day)
                  "
                >

                  <div class="checkbox">

                    <span
                      v-if="
                        isSelected(day)
                      "
                    >
                      ✓
                    </span>

                  </div>

                  <div class="day-info">
                    <strong>
                      {{ day }}
                    </strong>

                    <span>
                      {{
                        isSelected(day)
                          ? 'Rest Day'
                          : 'Working Day'
                      }}
                    </span>
                  </div>

                </button>

              </div>

            </section>

            <!-- INFO -->

            <div class="info-box">

              <Info :size="17" />

              <div>
                <strong>
                  Schedule-level configuration
                </strong>

                <p>
                  This updates the default rest
                  days of the selected work schedule.
                  Employee-specific rest day overrides
                  can be managed separately later.
                </p>
              </div>

            </div>

          </div>

          <!-- =========================================
               FOOTER
          ========================================== -->

          <div class="modal-footer">

            <div class="footer-summary">

              <CalendarDays :size="15" />

              <span>
                <strong>
                  {{
                    selectedRestDays.length
                  }}
                </strong>

                rest day(s) selected
              </span>

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
                Save Rest Days
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
    rgba(3, 8, 18, 0.76);

  backdrop-filter: blur(3px);
}

.modal-card {
  display: flex;

  width: 100%;
  max-width: 850px;
  max-height:
    calc(100vh - 40px);

  flex-direction: column;

  overflow: hidden;

  border:
    1px solid var(--border);

  border-radius: 13px;

  background:
    var(--bg-card);

  box-shadow:
    0 24px 80px
    rgba(0, 0, 0, 0.4);
}

/* =========================================
   HEADER
========================================= */

.modal-header {
  display: flex;

  flex-shrink: 0;

  align-items: center;
  justify-content: space-between;

  gap: 15px;

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

  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.modal-header h2 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 16px;
  font-weight: 700;
}

.modal-header p {
  margin: 4px 0 0;

  color:
    var(--text-muted);

  font-size: 10px;

  line-height: 1.5;
}

.close-button {
  display: flex;

  width: 34px;
  height: 34px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background: transparent;

  color:
    var(--text-secondary);

  cursor: pointer;
}

.close-button:hover {
  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);
}

/* =========================================
   BODY
========================================= */

.modal-body {
  flex: 1;

  overflow-y: auto;

  padding: 17px 18px;
}

/* =========================================
   SECTIONS
========================================= */

.form-section,
.rest-day-section {
  padding: 15px;

  border:
    1px solid var(--border-soft);

  border-radius: 10px;

  background:
    var(--bg-card-soft);
}

.rest-day-section {
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

  width: 35px;
  height: 35px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;
}

.section-icon.blue {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.section-icon.purple {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.section-heading h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 12px;
  font-weight: 700;
}

.section-heading p {
  margin: 3px 0 0;

  color:
    var(--text-muted);

  font-size: 9px;

  line-height: 1.5;
}

/* =========================================
   FIELDS
========================================= */

.form-grid {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 12px;
}

.field-group label {
  display: block;

  margin-bottom: 6px;

  color:
    var(--text-primary);

  font-size: 10px;
  font-weight: 600;
}

.field-group label span {
  color:
    var(--red);
}

.native-select,
.date-field {
  width: 100%;
  height: 39px;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    var(--bg-card);

  color:
    var(--text-primary);
}

.native-select {
  padding: 0 10px;

  outline: none;

  font-family: inherit;
  font-size: 10px;
}

.date-field {
  display: flex;

  align-items: center;

  gap: 8px;

  padding: 0 10px;

  color:
    var(--text-muted);
}

.date-field input {
  min-width: 0;

  flex: 1;

  border: 0;
  outline: 0;

  background: transparent;

  color:
    var(--text-primary);

  font-family: inherit;
  font-size: 10px;

  color-scheme: dark;
}

html:not(.dark)
.date-field input {
  color-scheme: light;
}

/* =========================================
   PREVIEW
========================================= */

.schedule-preview {
  display: grid;

  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );

  gap: 8px;

  margin-top: 12px;
}

.schedule-preview > div {
  min-width: 0;

  padding: 10px;

  border:
    1px solid var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card);
}

.schedule-preview span,
.schedule-preview strong {
  display: block;
}

.schedule-preview span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.schedule-preview strong {
  margin-top: 4px;

  overflow: hidden;

  color:
    var(--text-primary);

  font-size: 10px;
  font-weight: 650;

  white-space: nowrap;
  text-overflow: ellipsis;
}

/* =========================================
   REST DAY SUMMARY
========================================= */

.rest-day-summary {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 15px;

  margin-bottom: 12px;

  padding: 10px 12px;

  border:
    1px solid var(--border);

  border-radius: 8px;

  background:
    var(--bg-card);
}

.rest-day-summary span {
  color:
    var(--text-muted);

  font-size: 9px;
}

.rest-day-summary strong {
  color:
    var(--primary);

  font-size: 10px;
  font-weight: 650;

  text-align: right;
}

/* =========================================
   DAYS
========================================= */

.days-grid {
  display: grid;

  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );

  gap: 8px;
}

.day-card {
  display: flex;

  min-height: 60px;

  align-items: center;

  gap: 9px;

  padding: 10px;

  border:
    1px solid var(--border);

  border-radius: 8px;

  background:
    var(--bg-card);

  color:
    var(--text-secondary);

  text-align: left;

  cursor: pointer;

  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}

.day-card:hover {
  border-color:
    var(--primary);
}

.day-card.selected {
  border-color:
    var(--primary);

  background:
    var(--primary-soft);
}

.checkbox {
  display: flex;

  width: 20px;
  height: 20px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border:
    1px solid var(--border);

  border-radius: 5px;

  background:
    var(--bg-card);

  color: white;

  font-size: 11px;
  font-weight: 700;
}

.day-card.selected
.checkbox {
  border-color:
    var(--primary);

  background:
    var(--primary);
}

.day-info {
  min-width: 0;
}

.day-info strong,
.day-info span {
  display: block;
}

.day-info strong {
  color:
    var(--text-primary);

  font-size: 10px;
  font-weight: 650;
}

.day-info span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 8px;
}

.day-card.selected
.day-info span {
  color:
    var(--primary);
}

/* =========================================
   INFO
========================================= */

.info-box {
  display: flex;

  gap: 9px;

  margin-top: 13px;

  padding: 12px;

  border:
    1px solid var(--border-soft);

  border-radius: 8px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.info-box > svg {
  flex-shrink: 0;

  margin-top: 1px;
}

.info-box strong {
  display: block;

  color:
    var(--text-primary);

  font-size: 10px;
}

.info-box p {
  margin: 4px 0 0;

  color:
    var(--text-secondary);

  font-size: 9px;

  line-height: 1.55;
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

  background:
    var(--bg-card-soft);
}

.footer-summary {
  display: flex;

  align-items: center;

  gap: 7px;

  color:
    var(--text-secondary);

  font-size: 9px;
}

.footer-summary strong {
  color:
    var(--primary);
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
  transition:
    opacity 0.15s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* =========================================
   RESPONSIVE
========================================= */

@media (max-width: 800px) {
  .schedule-preview {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }

  .days-grid {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }
}

@media (max-width: 650px) {
  .form-grid,
  .schedule-preview {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    align-items: stretch;

    flex-direction: column;
  }

  .footer-actions {
    justify-content:
      flex-end;
  }
}

@media (max-width: 440px) {
  .days-grid {
    grid-template-columns:
      1fr;
  }
}
</style>