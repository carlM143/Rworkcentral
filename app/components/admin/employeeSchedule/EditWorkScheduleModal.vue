<script setup lang="ts">
import {
  X,
  Pencil,
  Clock3,
  Coffee,
  Save,
  Info,
} from 'lucide-vue-next'

import type {
  WorkSchedule,
  WorkScheduleFormData,
  WorkScheduleStatus,
  WorkScheduleType,
} from '~/types/workSchedule'

const props = defineProps<{
  open: boolean

  schedule:
    WorkSchedule | null
  scheduleTypes: WorkScheduleType[]
  saving: boolean
}>()

const emit = defineEmits<{
  close: []

  save: [
    payload: {
      scheduleId: number
      data: WorkScheduleFormData
    },
  ]
}>()

const {
  error,
} = useToast()

const statusOptions:
  WorkScheduleStatus[] = [
    'Active',
    'Inactive',
  ]

/* =========================================================
   FORM
========================================================= */

const form =
  reactive<WorkScheduleFormData>({
    code: '',

    name: '',

    type: 'Regular',

    timeIn: '08:00',

    timeOut: '17:00',

    breakStart: '12:00',

    breakEnd: '13:00',

    workHours: 8,

    gracePeriod: 5,

    status: 'Active',
  })

const isFlexible =
  computed(() => {
    return (
      form.type ===
      'Flexible'
    )
  })

/* =========================================================
   CONVERT DISPLAY TIME TO INPUT TIME
========================================================= */

const convertToInputTime = (
  value?: string,
) => {
  if (!value) {
    return ''
  }

  const clean =
    value
      .trim()
      .toUpperCase()

  const match =
    clean.match(
      /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/,
    )

  if (!match) {
    return ''
  }

  let hours =
    Number(
      match[1],
    )

  const minutes =
    match[2] ?? '00'

  const period =
    match[3]

  if (period === 'PM') {
    if (hours < 12) {
      hours += 12
    }
  }

  if (period === 'AM') {
    if (hours === 12) {
      hours = 0
    }
  }

  return `${String(
    hours,
  ).padStart(
    2,
    '0',
  )}:${minutes}`
}

/* =========================================================
   LOAD SCHEDULE
========================================================= */

const loadSchedule = () => {
  if (!props.schedule) {
    return
  }

  form.code =
    props.schedule.code

  form.name =
    props.schedule.name

  form.type =
    props.schedule.type

  form.status =
    props.schedule.status

  form.workHours =
    props.schedule.workHours

  form.gracePeriod =
    props.schedule.gracePeriod

  form.timeIn =
    convertToInputTime(
      props.schedule.timeIn,
    ) || '08:00'

  form.timeOut =
    convertToInputTime(
      props.schedule.timeOut,
    ) || '17:00'

  form.breakStart =
    convertToInputTime(
      props.schedule.breakStart,
    ) || '12:00'

  form.breakEnd =
    convertToInputTime(
      props.schedule.breakEnd,
    ) || '13:00'
}

/* =========================================================
   WATCH
========================================================= */

watch(
  [
    () => props.open,
    () =>
      props.schedule?.id,
  ],
  () => {
    if (
      props.open &&
      props.schedule
    ) {
      loadSchedule()
    }
  },
  {
    immediate: true,
  },
)


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
  if (!props.schedule) {
    return
  }

  if (!form.name.trim()) {
    error(
      'Schedule Name Required',
      'Please enter the schedule name.',
    )

    return
  }

  if (!form.code.trim()) {
    error(
      'Schedule Code Required',
      'Please enter the schedule code.',
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
    Number(
      form.workHours,
    ) <= 0
  ) {
    error(
      'Invalid Work Hours',
      'Required work hours must be greater than zero.',
    )

    return
  }

  emit('save', {
    scheduleId:
      props.schedule.id,

    data: {
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

      status:
        form.status,
    },
  })
}
</script>

<template>
  <Teleport to="body">

    <Transition name="modal">

      <div
        v-if="
          open &&
          schedule
        "
        class="modal-backdrop"
        @click.self="handleClose"
      >

        <div class="modal-card">

          <!-- HEADER -->

          <div class="modal-header">

            <div class="header-left">

              <div class="header-icon">
                <Pencil :size="20" />
              </div>

              <div>
                <h2>
                  Edit Work Schedule
                </h2>

              <p>
                Update schedule information,
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

          <!-- BODY -->

          <div class="modal-body">

            <!-- INFORMATION -->

            <section class="form-section">

              <div class="section-heading">

                <div class="section-icon blue">
                  <Pencil :size="16" />
                </div>

                <div>
                  <h3>
                    Schedule Information
                  </h3>

                  <p>
                    Update the schedule name,
                    code, type and status.
                  </p>
                </div>

              </div>

              <div class="form-grid">

                <div class="field-group">

                  <label>
                    Schedule Name
                    <span>*</span>
                  </label>

                  <input
                    v-model="form.name"
                    type="text"
                    class="native-input"
                  >

                </div>

                <div class="field-group">

                  <label>
                    Schedule Code
                    <span>*</span>
                  </label>

                  <input
                    v-model="form.code"
                    type="text"
                    class="native-input"
                  >

                </div>

                <div class="field-group">

                  <label>
                    Schedule Type
                  </label>

                  <select
                    v-model="form.type"
                    class="native-input"
                  >
                    <option
                      v-for="item in props.scheduleTypes"
                      :key="item"
                      :value="item"
                    >
                      {{ item }}
                    </option>
                  </select>

                </div>

                <div class="field-group">

                  <label>
                    Status
                  </label>

                  <select
                    v-model="form.status"
                    class="native-input"
                  >
                    <option
                      v-for="item in statusOptions"
                      :key="item"
                      :value="item"
                    >
                      {{ item }}
                    </option>
                  </select>

                </div>

              </div>

            </section>

            <!-- WORKING HOURS -->

            <section class="form-section">

              <div class="section-heading">

                <div class="section-icon green">
                  <Clock3 :size="16" />
                </div>

                <div>
                  <h3>
                    Working Hours
                  </h3>

                  <p>
                    Configure work hours and
                    employee grace period.
                  </p>
                </div>

              </div>

              <div
                v-if="!isFlexible"
                class="form-grid"
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

              <div
                class="form-grid spacing-top"
              >

                <div class="field-group">

                  <label>
                    Required Work Hours
                  </label>

                  <div class="number-field">

                    <input
                      v-model.number="
                        form.workHours
                      "
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

                  <div class="number-field">

                    <input
                      v-model.number="
                        form.gracePeriod
                      "
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
                    Fixed time in and time out
                    will not be used for this
                    schedule.
                  </p>
                </div>

              </div>

            </section>

            <!-- BREAK -->

            <section
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
                    Configure the standard
                    employee break period.
                  </p>
                </div>

              </div>

              <div class="form-grid">

                <div class="field-group">

                  <label>
                    Break Start
                  </label>

                  <input
                    v-model="
                      form.breakStart
                    "
                    type="time"
                    class="native-input"
                  >

                </div>

                <div class="field-group">

                  <label>
                    Break End
                  </label>

                  <input
                    v-model="
                      form.breakEnd
                    "
                    type="time"
                    class="native-input"
                  >

                </div>

              </div>

            </section>

          </div>

          <!-- FOOTER -->

          <div class="modal-footer">

           <span class="footer-note">
              Rest days are managed per employee,
              not by the work schedule.
            </span>

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
                {{ saving ? 'Saving...' : 'Save Changes' }}
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

  backdrop-filter:
    blur(3px);
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

/* HEADER */

.modal-header {
  display: flex;

  flex-shrink: 0;

  align-items: center;
  justify-content: space-between;

  gap: 16px;

  padding:
    16px 18px;

  border-bottom:
    1px solid
    var(--border-soft);
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
    var(--primary-soft);

  color:
    var(--primary);
}

.modal-header h2 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 16px;
  font-weight: 700;
}

.modal-header p {
  margin:
    4px 0 0;

  color:
    var(--text-muted);

  font-size: 10px;
  line-height: 1.5;
}

.close-button {
  display: flex;

  width: 34px;
  height: 34px;

  align-items: center;
  justify-content: center;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    transparent;

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

/* BODY */

.modal-body {
  flex: 1;

  overflow-y: auto;

  padding:
    17px 18px;
}

.form-section {
  padding: 15px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 10px;

  background:
    var(--bg-card-soft);
}

.form-section +
.form-section {
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

.section-icon.green {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.section-icon.orange {
  background:
    var(--orange-soft);

  color:
    var(--orange);
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
  margin:
    3px 0 0;

  color:
    var(--text-muted);

  font-size: 9px;
}

/* FIELDS */

.form-grid {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 12px;
}

.spacing-top {
  margin-top: 12px;
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

.native-input {
  width: 100%;
  height: 39px;

  padding:
    0 10px;

  border:
    1px solid var(--border);

  border-radius: 7px;

  outline: none;

  background:
    var(--bg-card);

  color:
    var(--text-primary);

  font-family: inherit;

  font-size: 10px;

  color-scheme: dark;
}

html:not(.dark)
.native-input {
  color-scheme: light;
}

.native-input:focus {
  border-color:
    var(--primary);
}

.number-field {
  display: flex;

  width: 100%;
  height: 39px;

  align-items: center;

  overflow: hidden;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    var(--bg-card);
}

.number-field input {
  min-width: 0;

  flex: 1;

  height: 100%;

  padding:
    0 10px;

  border: 0;
  outline: none;

  background:
    transparent;

  color:
    var(--text-primary);

  font-size: 10px;
}

.number-field span {
  padding:
    0 10px;

  border-left:
    1px solid
    var(--border-soft);

  color:
    var(--text-muted);

  font-size: 9px;
}

/* FLEXIBLE */

.info-box {
  display: flex;

  gap: 9px;

  margin-top: 12px;

  padding: 11px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 8px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.info-box strong {
  display: block;

  color:
    var(--text-primary);

  font-size: 10px;
}

.info-box p {
  margin:
    4px 0 0;

  color:
    var(--text-secondary);

  font-size: 9px;
}

/* DAYS */

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

  min-height: 55px;

  align-items: center;

  gap: 8px;

  padding:
    9px 10px;

  border:
    1px solid var(--border);

  border-radius: 8px;

  background:
    var(--bg-card);

  color:
    var(--text-secondary);

  text-align: left;

  cursor: pointer;
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

.day-check {
  display: flex;

  width: 19px;
  height: 19px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border:
    1px solid var(--border);

  border-radius: 4px;

  color: white;

  font-size: 10px;
}

.day-card.selected
.day-check {
  border-color:
    var(--primary);

  background:
    var(--primary);
}

.day-card strong,
.day-card small {
  display: block;
}

.day-card strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.day-card small {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 8px;
}

/* FOOTER */

.modal-footer {
  display: flex;

  flex-shrink: 0;

  align-items: center;
  justify-content: space-between;

  gap: 12px;

  padding:
    13px 18px;

  border-top:
    1px solid
    var(--border-soft);

  background:
    var(--bg-card-soft);
}

.footer-note {
  color:
    var(--text-muted);

  font-size: 9px;
}

.footer-actions {
  display: flex;

  gap: 8px;
}

.modal-enter-active,
.modal-leave-active {
  transition:
    opacity 0.15s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (max-width: 750px) {
  .form-grid {
    grid-template-columns:
      1fr;
  }

  .days-grid {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
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

@media (max-width: 450px) {
  .days-grid {
    grid-template-columns:
      1fr;
  }
}
</style>
