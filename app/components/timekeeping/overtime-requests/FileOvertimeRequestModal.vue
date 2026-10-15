<script setup lang="ts">
import {
  Clock3,
  FileText,
  Plus,
  Upload,
  UserRound,
  X,
} from 'lucide-vue-next'

import type {
  FileOvertimeRequestPayload,
} from '~/types/overtimeActions'

defineProps<{
  open: boolean
}>()

const emit =
  defineEmits<{
    close: []

    submit: [
      payload:
        FileOvertimeRequestPayload,
    ]
  }>()

const employees = [
  {
    id: 1,
    employeeNo: 'EMP-001',
    name: 'Juan Dela Cruz',
    department: 'Operations',
    position: 'Driver',
  },
  {
    id: 3,
    employeeNo: 'EMP-003',
    name: 'Pedro Reyes',
    department: 'Finance',
    position: 'Finance Staff',
  },
  {
    id: 4,
    employeeNo: 'EMP-004',
    name: 'Ana Garcia',
    department: 'Operations',
    position: 'Operations Staff',
  },
  {
    id: 5,
    employeeNo: 'EMP-005',
    name: 'Carlo Mendoza',
    department: 'IT',
    position: 'Software Developer',
  },
]

const employeeId =
  ref(1)

const otDate =
  ref('2026-10-15')

const schedule =
  ref('08:00 AM - 05:00 PM')

const otStart =
  ref('17:00')

const otEnd =
  ref('20:00')

const otType =
  ref('Regular OT')

const reason = ref('')

const attachment =
  ref('')

const selectedEmployee =
  computed(() => {
    return employees.find(
      item =>
        item.id ===
        employeeId.value,
    ) || employees[0]
  })

const requestedHours =
  computed(() => {
    if (
      !otStart.value ||
      !otEnd.value
    ) {
      return 0
    }

    const [sh, sm] =
      otStart.value
        .split(':')
        .map(Number)

    const [eh, em] =
      otEnd.value
        .split(':')
        .map(Number)

    let start =
      sh * 60 + sm

    let end =
      eh * 60 + em

    if (end < start) {
      end += 1440
    }

    return Number(
      (
        (end - start) /
        60
      ).toFixed(2),
    )
  })

const handleFile = (
  event: Event,
) => {
  const target =
    event.target as
      HTMLInputElement

  attachment.value =
    target.files?.[0]?.name ||
    ''
}

const reset = () => {
  employeeId.value = 1
  otDate.value = '2026-10-15'

  schedule.value =
    '08:00 AM - 05:00 PM'

  otStart.value = '17:00'
  otEnd.value = '20:00'

  otType.value =
    'Regular OT'

  reason.value = ''
  attachment.value = ''
}

const submit = () => {
  if (
    !selectedEmployee.value ||
    !reason.value.trim() ||
    requestedHours.value <= 0
  ) {
    return
  }

  emit(
    'submit',
    {
      employeeId:
        selectedEmployee.value.id,

      employeeName:
        selectedEmployee.value.name,

      employeeNo:
        selectedEmployee.value
          .employeeNo,

      department:
        selectedEmployee.value
          .department,

      position:
        selectedEmployee.value
          .position,

      otDate:
        otDate.value,

      schedule:
        schedule.value,

      otStart:
        otStart.value,

      otEnd:
        otEnd.value,

      requestedHours:
        requestedHours.value,

      otType:
        otType.value,

      reason:
        reason.value,

      attachment:
        attachment.value ||
        undefined,
    },
  )

  reset()

  emit('close')
}
</script>

<template>
  <Teleport to="body">

    <div
      v-if="open"
      class="overlay"
      @click.self="emit('close')"
    >

      <article class="modal">

        <header>

          <div class="header-main">

            <div class="header-icon">
              <Plus :size="18" />
            </div>

            <div>
              <h2>
                File Overtime Request
              </h2>

              <p>
                Create an overtime request for review and approval.
              </p>
            </div>

          </div>

          <button
            type="button"
            class="close"
            @click="emit('close')"
          >
            <X :size="18" />
          </button>

        </header>

        <main>

          <section>

            <div class="section-title">

              <UserRound
                :size="14"
              />

              Employee Information

            </div>

            <label class="field">

              <span>
                Employee *
              </span>

              <select
                v-model.number="employeeId"
              >
                <option
                  v-for="employee in employees"
                  :key="employee.id"
                  :value="employee.id"
                >
                  {{ employee.employeeNo }}
                  -
                  {{ employee.name }}
                </option>
              </select>

            </label>

            <div class="employee-preview">

              <strong>
                {{ selectedEmployee.name }}
              </strong>

              <span>
                {{ selectedEmployee.department }}
                ·
                {{ selectedEmployee.position }}
              </span>

            </div>

          </section>

          <section>

            <div class="section-title">

              <Clock3 :size="14" />

              Overtime Schedule

            </div>

            <div class="grid">

              <label class="field full">

                <span>
                  OT Date *
                </span>

                <input
                  v-model="otDate"
                  type="date"
                >

              </label>

              <label class="field full">

                <span>
                  Regular Schedule
                </span>

                <input
                  v-model="schedule"
                  type="text"
                >

              </label>

              <label class="field">

                <span>
                  OT Start *
                </span>

                <input
                  v-model="otStart"
                  type="time"
                >

              </label>

              <label class="field">

                <span>
                  OT End *
                </span>

                <input
                  v-model="otEnd"
                  type="time"
                >

              </label>

            </div>

            <div class="hours">

              <Clock3 :size="16" />

              <div>
                <span>
                  REQUESTED HOURS
                </span>

                <strong>
                  {{ requestedHours }}
                  hrs
                </strong>
              </div>

            </div>

          </section>

          <section>

            <div class="section-title">

              <FileText
                :size="14"
              />

              Request Details

            </div>

            <label class="field">

              <span>
                OT Type *
              </span>

              <select v-model="otType">

                <option>
                  Regular OT
                </option>

                <option>
                  Rest Day OT
                </option>

                <option>
                  Holiday OT
                </option>

                <option>
                  Special Holiday OT
                </option>

              </select>

            </label>

            <label class="field">

              <span>
                Reason *
              </span>

              <textarea
                v-model="reason"
                rows="4"
                placeholder="Enter overtime reason..."
              />

            </label>

            <label class="upload">

              <Upload :size="16" />

              <div>

                <strong>
                  Supporting Attachment
                </strong>

                <span>
                  Optional supporting document.
                </span>

              </div>

              <input
                type="file"
                @change="handleFile"
              >

            </label>

            <p
              v-if="attachment"
              class="selected-file"
            >
              Selected:
              {{ attachment }}
            </p>

          </section>

        </main>

        <footer>

          <AppButton
            variant="secondary"
            @click="emit('close')"
          >
            Cancel
          </AppButton>

          <AppButton
            :icon="Plus"
            @click="submit"
          >
            Submit Request
          </AppButton>

        </footer>

      </article>

    </div>

  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  z-index: 99990;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;

  background:
    rgba(3, 10, 24, .76);

  backdrop-filter:
    blur(4px);
}

.modal {
  width: 100%;
  max-width: 700px;

  max-height:
    calc(100vh - 40px);

  overflow-y: auto;

  border:
    1px solid var(--border);

  border-radius: 13px;

  background:
    var(--bg-card);
}

header,
footer {
  position: sticky;

  z-index: 3;

  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 12px;

  padding:
    15px 17px;

  background:
    var(--bg-card);
}

header {
  top: 0;

  border-bottom:
    1px solid var(--border);
}

footer {
  bottom: 0;

  justify-content: flex-end;

  border-top:
    1px solid var(--border);
}

.header-main {
  display: flex;

  align-items: center;

  gap: 10px;
}

.header-icon {
  display: flex;

  width: 38px;
  height: 38px;

  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

h2 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 14px;
}

header p {
  margin:
    3px 0 0;

  color:
    var(--text-muted);

  font-size: 8px;
}

.close {
  display: flex;

  width: 31px;
  height: 31px;

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

main {
  padding:
    14px 16px;
}

section {
  padding: 12px;

  border:
    1px solid var(--border);

  border-radius: 9px;

  background:
    var(--bg-card-soft);
}

section + section {
  margin-top: 10px;
}

.section-title {
  display: flex;

  align-items: center;

  gap: 6px;

  margin-bottom: 10px;

  color:
    var(--text-primary);

  font-size: 9px;
  font-weight: 700;
}

.grid {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 8px;
}

.full {
  grid-column:
    1 / -1;
}

.field {
  display: block;

  margin-top: 8px;
}

.field:first-of-type {
  margin-top: 0;
}

.field > span {
  display: block;

  margin-bottom: 4px;

  color:
    var(--text-secondary);

  font-size: 8px;
  font-weight: 650;
}

.field input,
.field select,
.field textarea {
  width: 100%;

  box-sizing: border-box;

  border:
    1px solid var(--border);

  border-radius: 7px;

  outline: 0;

  background:
    var(--bg-card);

  color:
    var(--text-primary);

  font: inherit;

  font-size: 8.5px;
}

.field input,
.field select {
  height: 34px;

  padding:
    0 9px;
}

.field textarea {
  padding: 9px;

  resize: vertical;
}

.employee-preview {
  margin-top: 7px;

  padding: 8px;

  border-radius: 7px;

  background:
    var(--primary-soft);
}

.employee-preview strong,
.employee-preview span {
  display: block;
}

.employee-preview strong {
  color:
    var(--text-primary);

  font-size: 8.5px;
}

.employee-preview span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 7.5px;
}

.hours {
  display: flex;

  align-items: center;

  gap: 8px;

  margin-top: 9px;

  padding: 9px;

  border-radius: 7px;

  background:
    var(--green-soft);

  color:
    var(--green);
}

.hours span,
.hours strong {
  display: block;
}

.hours span {
  font-size: 7px;
  font-weight: 700;
}

.hours strong {
  margin-top: 2px;

  font-size: 11px;
}

.upload {
  display: flex;

  align-items: center;

  gap: 8px;

  margin-top: 9px;

  padding: 9px;

  border:
    1px dashed var(--border);

  border-radius: 7px;

  color:
    var(--primary);
}

.upload div {
  flex: 1;
}

.upload strong,
.upload span {
  display: block;
}

.upload strong {
  color:
    var(--text-primary);

  font-size: 8px;
}

.upload span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 7px;
}

.upload input {
  width: 165px;

  font-size: 7px;
}

.selected-file {
  margin:
    6px 0 0;

  color:
    var(--green);

  font-size: 7.5px;
}

@media (max-width: 600px) {
  .grid {
    grid-template-columns:
      1fr;
  }

  .full {
    grid-column:
      auto;
  }
}
</style>