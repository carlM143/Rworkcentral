<script setup lang="ts">
import {
  X,
  ClipboardCheck,
  TriangleAlert,
  CircleCheck,
} from 'lucide-vue-next'

import type {
  PendingEmployeePayroll,
} from '~/types/pendingEmployeePayroll'

const props =
  defineProps<{
    open: boolean

    payroll:
      PendingEmployeePayroll |
      null

    mode:
      'review' |
      'issues'
  }>()

const emit =
  defineEmits<{
    close: []

    ready: [
      payroll:
        PendingEmployeePayroll,
    ]

    resolved: [
      payroll:
        PendingEmployeePayroll,
    ]
  }>()

const notes =
  ref('')

watch(
  () =>
    props.open,
  value => {
    if (value) {
      notes.value =
        props.payroll
          ?.remarks ??
        ''
    }
  },
)
</script>

<template>
  <Teleport to="body">

    <div
      v-if="
        open &&
        payroll
      "
      class="overlay"
      @click.self="
        emit('close')
      "
    >

      <article class="modal">

        <header>

          <div class="heading">

            <div
              class="icon"
              :class="{
                warning:
                  mode ===
                  'issues',
              }"
            >

              <TriangleAlert
                v-if="
                  mode ===
                  'issues'
                "
                :size="18"
              />

              <ClipboardCheck
                v-else
                :size="18"
              />

            </div>

            <div>

              <h2>
                {{
                  mode ===
                  'issues'
                    ? 'Review Payroll Issues'
                    : 'Review Employee Payroll'
                }}
              </h2>

              <p>
                {{ payroll.payrollNumber }}
              </p>

            </div>

          </div>

          <button
            class="close"
            @click="
              emit('close')
            "
          >
            <X :size="18" />
          </button>

        </header>

        <div class="body">

          <div class="employee-card">

            <strong>
              {{ payroll.employeeName }}
            </strong>

            <span>
              {{ payroll.employeeNumber }}
              ·
              {{ payroll.department }}
              ·
              {{ payroll.periodName }}
            </span>

          </div>

          <div class="summary">

            <div>

              <span>
                Regular Days
              </span>

              <strong>
                {{ payroll.regularDays }}
              </strong>

            </div>

            <div>

              <span>
                OT Hours
              </span>

              <strong>
                {{ payroll.overtimeHours }}
              </strong>

            </div>

            <div>

              <span>
                Attendance Minutes
              </span>

              <strong>
                {{
                  payroll.lateMinutes +
                  payroll.undertimeMinutes
                }}
              </strong>

            </div>

            <div>

              <span>
                Issues
              </span>

              <strong
                :class="{
                  red:
                    payroll.issueCount >
                    0,
                }"
              >
                {{ payroll.issueCount }}
              </strong>

            </div>

          </div>

          <div
            v-if="
              payroll.issueCount > 0
            "
            class="issue-box"
          >

            <TriangleAlert
              :size="16"
            />

            <div>

              <strong>
                {{
                  payroll.issueCount
                }}
                payroll issue(s) need validation.
              </strong>

              <span>
                Verify attendance, overtime, leave,
                deductions and employee payroll records
                before marking this payroll ready.
              </span>

            </div>

          </div>

          <div class="checklist">

            <label>
              <input
                type="checkbox"
                checked
              >

              Time logs reviewed
            </label>

            <label>
              <input
                type="checkbox"
                checked
              >

              Overtime reviewed
            </label>

            <label>
              <input
                type="checkbox"
                checked
              >

              Leaves and absences reviewed
            </label>

            <label>
              <input
                type="checkbox"
                checked
              >

              SSS contribution reviewed
            </label>

            <label>
              <input
                type="checkbox"
                checked
              >

              PhilHealth contribution reviewed
            </label>

            <label>
              <input
                type="checkbox"
                checked
              >

              Pag-IBIG contribution reviewed
            </label>

            <label>
              <input
                type="checkbox"
                checked
              >

              Loans reviewed
            </label>

            <label>
              <input
                type="checkbox"
                checked
              >

              Net pay verified
            </label>

          </div>

          <div class="field">

            <label>
              Review Notes
            </label>

            <textarea
              v-model="notes"
              rows="4"
              placeholder="Enter payroll review notes..."
            />

          </div>

        </div>

        <footer>

          <AppButton
            variant="secondary"
            @click="
              emit('close')
            "
          >
            Cancel
          </AppButton>

          <AppButton
            v-if="
              mode ===
              'issues'
            "
            :icon="
              CircleCheck
            "
            @click="
              emit(
                'resolved',
                payroll,
              )
            "
          >
            Resolve Issues
          </AppButton>

          <AppButton
            v-else
            :icon="
              CircleCheck
            "
            :disabled="
              payroll.issueCount >
              0
            "
            @click="
              emit(
                'ready',
                payroll,
              )
            "
          >
            Mark as Ready
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
    rgba(3, 8, 18, 0.77);

  backdrop-filter:
    blur(4px);
}

.modal {
  width: 100%;
  max-width: 650px;

  border:
    1px solid var(--border);

  border-radius: 13px;

  background:
    var(--bg-card);
}

header {
  display: flex;

  align-items: center;
  justify-content: space-between;

  padding:
    15px 18px;

  border-bottom:
    1px solid var(--border-soft);
}

.heading {
  display: flex;

  align-items: center;

  gap: 9px;
}

.icon {
  display: flex;

  width: 38px;
  height: 38px;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.icon.warning {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

h2 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 14px;
}

.heading p {
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
}

.body {
  padding:
    17px 18px;
}

.employee-card {
  padding: 10px;

  border-radius: 7px;

  background:
    var(--bg-card-soft);
}

.employee-card strong,
.employee-card span {
  display: block;
}

.employee-card strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.employee-card span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 8px;
}

.summary {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 7px;

  margin-top: 9px;
}

.summary > div {
  padding: 9px;

  border:
    1px solid var(--border-soft);

  border-radius: 7px;
}

.summary span,
.summary strong {
  display: block;
}

.summary span {
  color:
    var(--text-muted);

  font-size: 6.5px;
}

.summary strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 9px;
}

.red {
  color:
    var(--red) !important;
}

.issue-box {
  display: flex;

  align-items:
    flex-start;

  gap: 8px;

  margin-top: 10px;

  padding: 10px;

  border-radius: 7px;

  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.issue-box strong,
.issue-box span {
  display: block;
}

.issue-box strong {
  font-size: 8px;
}

.issue-box span {
  margin-top: 3px;

  color:
    var(--text-secondary);

  font-size: 7px;
}

.checklist {
  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 7px;

  margin-top: 12px;
}

.checklist label {
  display: flex;

  align-items: center;

  gap: 6px;

  padding: 9px;

  border:
    1px solid var(--border-soft);

  border-radius: 7px;

  color:
    var(--text-secondary);

  font-size: 8px;
}

.checklist input {
  accent-color:
    var(--primary);
}

.field {
  margin-top: 12px;
}

.field label {
  display: block;

  margin-bottom: 6px;

  color:
    var(--text-primary);

  font-size: 8px;
  font-weight: 600;
}

textarea {
  box-sizing: border-box;

  width: 100%;

  padding: 10px;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);

  font-family:
    inherit;

  font-size: 9px;

  resize: vertical;
}

footer {
  display: flex;

  justify-content: flex-end;

  gap: 7px;

  padding:
    13px 18px;

  border-top:
    1px solid var(--border-soft);
}

@media (max-width: 600px) {
  .summary,
  .checklist {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}
</style>