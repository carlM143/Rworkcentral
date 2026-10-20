<script setup lang="ts">
import {
  X,
  RefreshCw,
  Clock3,
  CalendarCheck,
  Calculator,
  Landmark,
} from 'lucide-vue-next'

defineProps<{
  open: boolean
  recordCount: number
}>()

const emit =
  defineEmits<{
    close: []
    refresh: []
  }>()
</script>

<template>
  <Teleport to="body">

    <div
      v-if="open"
      class="overlay"
      @click.self="
        emit('close')
      "
    >

      <article class="modal">

        <header>

          <div class="heading">

            <div class="icon">
              <RefreshCw
                :size="18"
              />
            </div>

            <div>

              <h2>
                Refresh Employee Payroll
              </h2>

              <p>
                Recalculate payroll using the latest employee records.
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

          <div class="count-card">

            <span>
              PAYROLL RECORDS
            </span>

            <strong>
              {{ recordCount }}
            </strong>

          </div>

          <div class="items">

            <div>

              <Clock3
                :size="16"
              />

              <div>

                <strong>
                  Timekeeping
                </strong>

                <span>
                  Recheck attendance,
                  late, undertime and absences.
                </span>

              </div>

            </div>

            <div>

              <CalendarCheck
                :size="16"
              />

              <div>

                <strong>
                  Leave and Overtime
                </strong>

                <span>
                  Recheck approved leaves,
                  holidays and overtime records.
                </span>

              </div>

            </div>

            <div>

              <Landmark
                :size="16"
              />

              <div>

                <strong>
                  Government Contributions
                </strong>

                <span>
                  Review SSS, PhilHealth
                  and Pag-IBIG calculations.
                </span>

              </div>

            </div>

            <div>

              <Calculator
                :size="16"
              />

              <div>

                <strong>
                  Payroll Totals
                </strong>

                <span>
                  Recalculate earnings,
                  deductions and net pay.
                </span>

              </div>

            </div>

          </div>

          <div class="notice">
            Frontend preview only. Actual payroll
            recalculation will be performed by the
            Laravel payroll service later.
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
            :icon="
              RefreshCw
            "
            @click="
              emit('refresh')
            "
          >
            Refresh Payroll
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
  max-width: 570px;

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

.count-card {
  padding: 12px;

  border-radius: 8px;

  background:
    var(--primary-soft);
}

.count-card span,
.count-card strong {
  display: block;
}

.count-card span {
  color:
    var(--text-muted);

  font-size: 7px;
}

.count-card strong {
  margin-top: 3px;

  color:
    var(--primary);

  font-size: 18px;
}

.items {
  margin-top: 10px;
}

.items > div {
  display: flex;

  align-items:
    flex-start;

  gap: 8px;

  padding:
    10px 0;

  border-bottom:
    1px solid var(--border-soft);

  color:
    var(--primary);
}

.items strong,
.items span {
  display: block;
}

.items strong {
  color:
    var(--text-primary);

  font-size: 8px;
}

.items span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 7px;
}

.notice {
  margin-top: 11px;

  padding: 10px;

  border-radius: 7px;

  background:
    var(--orange-soft);

  color:
    var(--text-secondary);

  font-size: 8px;
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
</style>