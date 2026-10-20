<script setup lang="ts">
import {
  X,
  ClipboardCheck,
  TriangleAlert,
  CircleCheck,
} from 'lucide-vue-next'

import type {
  PendingDriverPayroll,
} from '~/types/pendingDriverPayroll'

const props =
  defineProps<{
    open: boolean

    payroll:
      PendingDriverPayroll |
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
        PendingDriverPayroll,
    ]

    resolved: [
      payroll:
        PendingDriverPayroll,
    ]
  }>()

const notes =
  ref('')

watch(
  () => props.open,
  value => {
    if (value) {
      notes.value =
        props.payroll?.remarks ??
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
                    : 'Review Driver Payroll'
                }}
              </h2>

              <p>
                {{ payroll.payrollNumber }}
              </p>

            </div>

          </div>

          <button
            class="close"
            @click="emit('close')"
          >
            <X :size="18" />
          </button>

        </header>

        <div class="body">

          <div class="driver">

            <strong>
              {{ payroll.driverName }}
            </strong>

            <span>
              {{ payroll.employeeNumber }}
              ·
              {{ payroll.periodName }}
            </span>

          </div>

          <div class="review-grid">

            <div>
              <span>Trips</span>

              <strong>
                {{ payroll.totalTrips }}
              </strong>
            </div>

            <div>
              <span>Regular Hours</span>

              <strong>
                {{ payroll.regularHours }}
              </strong>
            </div>

            <div>
              <span>OT Hours</span>

              <strong>
                {{ payroll.overtimeHours }}
              </strong>
            </div>

            <div>
              <span>Issues</span>

              <strong
                :class="{
                  red:
                    payroll.issueCount > 0,
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

            <TriangleAlert :size="16" />

            <div>

              <strong>
                {{
                  payroll.issueCount
                }}
                payroll issue(s) require review.
              </strong>

              <span>
                Verify time logs, trips, overtime and deductions before marking the payroll ready.
              </span>

            </div>

          </div>

          <div class="checklist">

            <label>
              <input
                type="checkbox"
                checked
              >

              Trip records verified
            </label>

            <label>
              <input
                type="checkbox"
                checked
              >

              Timekeeping records verified
            </label>

            <label>
              <input
                type="checkbox"
                checked
              >

              Government deductions reviewed
            </label>

            <label>
              <input
                type="checkbox"
                checked
              >

              Loan deductions reviewed
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
              mode === 'issues'
            "
            :icon="CircleCheck"
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
            :icon="CircleCheck"
            :disabled="
              payroll.issueCount > 0
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
  max-width: 620px;

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

  padding: 15px 18px;

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
  margin: 3px 0 0;

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
  padding: 17px 18px;
}

.driver {
  padding: 10px;

  border-radius: 7px;

  background:
    var(--bg-card-soft);
}

.driver strong,
.driver span {
  display: block;
}

.driver strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.driver span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 8px;
}

.review-grid {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 7px;

  margin-top: 9px;
}

.review-grid > div {
  padding: 9px;

  border:
    1px solid var(--border-soft);

  border-radius: 7px;
}

.review-grid span,
.review-grid strong {
  display: block;
}

.review-grid span {
  color:
    var(--text-muted);

  font-size: 6.5px;
}

.review-grid strong {
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

  align-items: flex-start;

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

  padding: 13px 18px;

  border-top:
    1px solid var(--border-soft);
}

@media (max-width: 600px) {
  .review-grid,
  .checklist {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}
</style>