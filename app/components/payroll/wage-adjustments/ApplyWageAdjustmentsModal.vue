<script setup lang="ts">
import {
  X,
  CheckCircle2,
  AlertTriangle,
  CircleDollarSign,
} from 'lucide-vue-next'

import type {
  WageAdjustmentRecord,
} from '~/types/wageManagement'

const props =
  defineProps<{
    open: boolean

    records:
      WageAdjustmentRecord[]
  }>()

const emit =
  defineEmits<{
    close: []
    apply: []
  }>()

const confirmed =
  ref(false)

watch(
  () => props.open,
  value => {
    if (value) {
      confirmed.value = false
    }
  },
)

const impact =
  computed(() => {
    return props.records.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.requiredIncrease *
          26,
      0,
    )
  })

const money = (
  value: number,
) => {
  return new Intl.NumberFormat(
    'en-PH',
    {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    },
  ).format(value)
}
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

        <header class="header">

          <div class="header-main">

            <div class="header-icon">
              <CircleDollarSign
                :size="18"
              />
            </div>

            <div>
              <h2>
                Apply Approved Adjustments
              </h2>

              <p>
                Confirm approved salary changes before marking them effective.
              </p>
            </div>

          </div>

          <button
            type="button"
            class="close"
            @click="
              emit('close')
            "
          >
            <X :size="18" />
          </button>

        </header>

        <div class="body">

          <section class="summary">

            <div>
              <span>
                APPROVED ADJUSTMENTS
              </span>

              <strong>
                {{ records.length }}
              </strong>
            </div>

            <div>
              <span>
                ESTIMATED MONTHLY IMPACT
              </span>

              <strong class="green">
                {{ money(impact) }}
              </strong>
            </div>

          </section>

          <div
            v-if="
              !records.length
            "
            class="warning"
          >
            <AlertTriangle
              :size="17"
            />

            No approved wage adjustments are currently ready to apply.
          </div>

          <div
            v-else
            class="records"
          >

            <div
              v-for="item in records"
              :key="item.id"
              class="record"
            >

              <div class="check">
                <CheckCircle2
                  :size="15"
                />
              </div>

              <div class="record-main">

                <strong>
                  {{ item.employeeName }}
                </strong>

                <span>
                  {{ item.employeeNumber }}
                  ·
                  {{ item.department }}
                </span>

              </div>

              <div class="change">

                <span>
                  {{ money(item.currentRate) }}
                </span>

                <strong>
                  →
                  {{ money(item.proposedRate) }}
                </strong>

              </div>

            </div>

          </div>

          <label
            v-if="
              records.length
            "
            class="confirmation"
          >

            <input
              v-model="
                confirmed
              "
              type="checkbox"
            >

            <div>
              <strong>
                Confirm salary adjustment
              </strong>

              <span>
                I confirm that these adjustments were reviewed and approved before applying them to employee compensation.
              </span>
            </div>

          </label>

        </div>

        <footer class="footer">

          <AppButton
            variant="secondary"
            @click="
              emit('close')
            "
          >
            Cancel
          </AppButton>

          <AppButton
            :disabled="
              !confirmed ||
              !records.length
            "
            :icon="CheckCircle2"
            @click="
              emit('apply')
            "
          >
            Apply Adjustments
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
    rgba(3, 10, 24, 0.76);

  backdrop-filter:
    blur(4px);
}

.modal {
  width: 100%;
  max-width: 650px;

  border:
    1px solid var(--border);

  border-radius: 14px;

  background:
    var(--bg-card);
}

.header {
  display: flex;

  align-items: center;
  justify-content: space-between;

  padding: 15px 18px;

  border-bottom:
    1px solid var(--border);
}

.header-main {
  display: flex;

  align-items: center;

  gap: 10px;
}

.header-icon {
  display: flex;

  width: 39px;
  height: 39px;

  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background:
    var(--green-soft);

  color:
    var(--green);
}

.header h2 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 14px;
}

.header p {
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

.summary {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 8px;
}

.summary > div {
  padding: 11px;

  border:
    1px solid var(--border);

  border-radius: 8px;

  background:
    var(--bg-card-soft);
}

.summary span,
.summary strong {
  display: block;
}

.summary span {
  color:
    var(--text-muted);

  font-size: 7px;
  font-weight: 700;
}

.summary strong {
  margin-top: 4px;

  color:
    var(--text-primary);

  font-size: 13px;
}

.summary .green {
  color:
    var(--green);
}

.records {
  max-height: 250px;

  overflow-y: auto;

  margin-top: 12px;
}

.record {
  display: flex;

  align-items: center;

  gap: 9px;

  padding: 9px;

  border-bottom:
    1px solid var(--border-soft);
}

.check {
  display: flex;

  width: 29px;
  height: 29px;

  align-items: center;
  justify-content: center;

  border-radius: 7px;

  background:
    var(--green-soft);

  color:
    var(--green);
}

.record-main {
  flex: 1;
}

.record-main strong,
.record-main span,
.change span,
.change strong {
  display: block;
}

.record-main strong {
  color:
    var(--text-primary);

  font-size: 8.5px;
}

.record-main span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 7px;
}

.change {
  text-align: right;
}

.change span {
  color:
    var(--text-muted);

  font-size: 7px;
}

.change strong {
  margin-top: 2px;

  color:
    var(--green);

  font-size: 8px;
}

.warning {
  display: flex;

  align-items: center;

  gap: 7px;

  margin-top: 12px;

  padding: 10px;

  border-radius: 8px;

  background:
    var(--orange-soft);

  color:
    var(--orange);

  font-size: 8px;
}

.confirmation {
  display: flex;

  align-items: flex-start;

  gap: 8px;

  margin-top: 14px;

  padding: 11px;

  border:
    1px solid var(--border);

  border-radius: 8px;

  background:
    var(--bg-card-soft);

  cursor: pointer;
}

.confirmation input {
  margin-top: 2px;

  accent-color:
    var(--primary);
}

.confirmation strong,
.confirmation span {
  display: block;
}

.confirmation strong {
  color:
    var(--text-primary);

  font-size: 8px;
}

.confirmation span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 7px;

  line-height: 1.45;
}

.footer {
  display: flex;

  justify-content: flex-end;

  gap: 7px;

  padding: 13px 18px;

  border-top:
    1px solid var(--border);
}
</style>