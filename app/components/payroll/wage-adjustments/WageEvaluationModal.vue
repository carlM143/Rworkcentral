<script setup lang="ts">
import {
  X,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  CircleDollarSign,
  Play,
} from 'lucide-vue-next'

import type {
  WageAdjustmentRecord,
  WageOrder,
} from '~/types/wageManagement'

const props =
  defineProps<{
    open: boolean

    wageOrder:
      WageOrder |
      null

    records:
      WageAdjustmentRecord[]
  }>()

const emit =
  defineEmits<{
    close: []
    evaluate: []
  }>()

const required =
  computed(
    () =>
      props.records.filter(
        item =>
          item.result ===
          'Required',
      ).length,
  )

const compliant =
  computed(
    () =>
      props.records.filter(
        item =>
          item.result ===
          'Compliant',
      ).length,
  )

const distortion =
  computed(
    () =>
      props.records.filter(
        item =>
          item.distortionRisk,
      ).length,
  )

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
              <ClipboardCheck
                :size="18"
              />
            </div>

            <div>
              <h2>
                Evaluate Employees
              </h2>

              <p>
                Review employees against the active government wage order.
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

          <section
            v-if="wageOrder"
            class="order-card"
          >

            <div>
              <span>
                ACTIVE WAGE ORDER
              </span>

              <strong>
                {{ wageOrder.code }}
              </strong>
            </div>

            <div>
              <span>
                REGION
              </span>

              <strong>
                {{ wageOrder.region }}
              </strong>
            </div>

            <div>
              <span>
                NEW MINIMUM
              </span>

              <strong class="green">
                {{
                  money(
                    wageOrder.newMinimumRate,
                  )
                }}
              </strong>
            </div>

            <div>
              <span>
                EFFECTIVE DATE
              </span>

              <strong>
                {{ wageOrder.effectiveDate }}
              </strong>
            </div>

          </section>

          <div
            v-else
            class="no-order"
          >
            <AlertTriangle
              :size="18"
            />

            No active wage order found.
          </div>

          <section class="summary">

            <div>

              <div class="summary-icon blue">
                <ClipboardCheck
                  :size="16"
                />
              </div>

              <span>
                Employees
              </span>

              <strong>
                {{ records.length }}
              </strong>

            </div>

            <div>

              <div class="summary-icon orange">
                <CircleDollarSign
                  :size="16"
                />
              </div>

              <span>
                Required
              </span>

              <strong>
                {{ required }}
              </strong>

            </div>

            <div>

              <div class="summary-icon green">
                <CheckCircle2
                  :size="16"
                />
              </div>

              <span>
                Compliant
              </span>

              <strong>
                {{ compliant }}
              </strong>

            </div>

            <div>

              <div class="summary-icon purple">
                <AlertTriangle
                  :size="16"
                />
              </div>

              <span>
                Distortion
              </span>

              <strong>
                {{ distortion }}
              </strong>

            </div>

          </section>

          <section class="process">

            <h3>
              Evaluation Process
            </h3>

            <div class="step">
              <span>1</span>

              <div>
                <strong>
                  Load Wage Order
                </strong>

                <p>
                  Use the active regional minimum wage and effective date.
                </p>
              </div>
            </div>

            <div class="step">
              <span>2</span>

              <div>
                <strong>
                  Compare Employee Rates
                </strong>

                <p>
                  Identify employees earning below the applicable minimum.
                </p>
              </div>
            </div>

            <div class="step">
              <span>3</span>

              <div>
                <strong>
                  Detect Wage Distortion
                </strong>

                <p>
                  Flag salary gaps that require HR review.
                </p>
              </div>
            </div>

            <div class="step">
              <span>4</span>

              <div>
                <strong>
                  Prepare Adjustments
                </strong>

                <p>
                  Generate proposed rates for HR approval.
                </p>
              </div>
            </div>

          </section>

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
            :icon="Play"
            :disabled="
              !wageOrder
            "
            @click="
              emit('evaluate')
            "
          >
            Run Evaluation
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
  max-width: 680px;

  border:
    1px solid var(--border);

  border-radius: 14px;

  background:
    var(--bg-card);

  box-shadow:
    0 25px 70px
    rgba(0, 0, 0, 0.3);
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
    var(--primary-soft);

  color:
    var(--primary);
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

.order-card {
  display: grid;

  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );

  gap: 7px;

  padding: 11px;

  border:
    1px solid var(--border);

  border-radius: 9px;

  background:
    var(--bg-card-soft);
}

.order-card span,
.order-card strong {
  display: block;
}

.order-card span {
  color:
    var(--text-muted);

  font-size: 6.5px;
  font-weight: 700;
}

.order-card strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 8px;
}

.order-card .green {
  color:
    var(--green);
}

.no-order {
  display: flex;

  align-items: center;

  gap: 7px;

  padding: 10px;

  border-radius: 7px;

  background:
    var(--red-soft);

  color:
    var(--red);

  font-size: 8px;
}

.summary {
  display: grid;

  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );

  gap: 7px;

  margin-top: 12px;
}

.summary > div {
  padding: 10px;

  border:
    1px solid var(--border);

  border-radius: 8px;
}

.summary-icon {
  display: flex;

  width: 29px;
  height: 29px;

  align-items: center;
  justify-content: center;

  margin-bottom: 7px;

  border-radius: 7px;
}

.summary-icon.blue {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.summary-icon.orange {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.summary-icon.green {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.summary-icon.purple {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.summary span,
.summary strong {
  display: block;
}

.summary span {
  color:
    var(--text-muted);

  font-size: 7px;
}

.summary strong {
  margin-top: 2px;

  color:
    var(--text-primary);

  font-size: 12px;
}

.process {
  margin-top: 16px;
}

.process h3 {
  margin:
    0 0 9px;

  color:
    var(--text-primary);

  font-size: 10px;
}

.step {
  display: flex;

  gap: 9px;

  padding: 9px 0;

  border-bottom:
    1px solid var(--border-soft);
}

.step > span {
  display: flex;

  width: 24px;
  height: 24px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background:
    var(--primary-soft);

  color:
    var(--primary);

  font-size: 8px;
  font-weight: 700;
}

.step strong,
.step p {
  display: block;
}

.step strong {
  color:
    var(--text-primary);

  font-size: 8px;
}

.step p {
  margin:
    2px 0 0;

  color:
    var(--text-muted);

  font-size: 7px;
}

.footer {
  display: flex;

  justify-content: flex-end;

  gap: 7px;

  padding: 13px 18px;

  border-top:
    1px solid var(--border);
}

@media (max-width: 650px) {
  .order-card,
  .summary {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }
}
</style>