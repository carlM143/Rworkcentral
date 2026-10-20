<script setup lang="ts">
import {
  X,
  CreditCard,
  CircleCheck,
  Send,
} from 'lucide-vue-next'

import type {
  CompletedDriverPayroll,
} from '~/types/completedDriverPayroll'

const props =
  defineProps<{
    open: boolean

    payroll:
      CompletedDriverPayroll |
      null

    action:
      'view' |
      'paid' |
      'released'
  }>()

const emit =
  defineEmits<{
    close: []

    confirm: [
      payload: {
        action:
          'paid' |
          'released'

        referenceNumber: string
      },
    ]
  }>()

const referenceNumber =
  ref('')

watch(
  [
    () => props.open,
    () => props.payroll?.id,
  ],
  () => {
    if (!props.open) {
      return
    }

    referenceNumber.value =
      props.payroll
        ?.referenceNumber ??
      ''
  },
)

const title =
  computed(() => {
    if (
      props.action === 'paid'
    ) {
      return 'Mark Payroll as Paid'
    }

    if (
      props.action ===
      'released'
    ) {
      return 'Release Driver Payroll'
    }

    return 'Payment Details'
  })

const handleConfirm = () => {
  if (
    props.action === 'view'
  ) {
    emit('close')
    return
  }

  emit('confirm', {
    action:
      props.action,

    referenceNumber:
      referenceNumber.value.trim(),
  })
}
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

            <div class="icon">
              <CreditCard :size="18" />
            </div>

            <div>

              <h2>
                {{ title }}
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

          <div class="payroll-card">

            <div>

              <span>DRIVER</span>

              <strong>
                {{ payroll.driverName }}
              </strong>

            </div>

            <div>

              <span>PAYMENT STATUS</span>

              <strong>
                {{ payroll.paymentStatus }}
              </strong>

            </div>

            <div>

              <span>NET PAY</span>

              <strong class="green">
                {{
                  new Intl.NumberFormat(
                    'en-PH',
                    {
                      style: 'currency',
                      currency: 'PHP',
                    },
                  ).format(
                    payroll.netPay,
                  )
                }}
              </strong>

            </div>

          </div>

          <div class="field">

            <label>
              Payment Reference Number
            </label>

            <input
              v-model="
                referenceNumber
              "
              :readonly="
                action === 'view'
              "
              placeholder="Example: DRV-PMT-2026-1001-001"
            >

          </div>

          <div
            v-if="
              payroll.paidBy
            "
            class="payment-meta"
          >
            <span>
              Processed by
            </span>

            <strong>
              {{ payroll.paidBy }}
            </strong>
          </div>

          <div class="notice">

            <template
              v-if="
                action === 'paid'
              "
            >
              This will mark the payroll payment as
              <strong>Paid</strong>.
            </template>

            <template
              v-else-if="
                action === 'released'
              "
            >
              This will mark the payroll as
              <strong>Released</strong>.
            </template>

            <template v-else>
              Payment information for this completed payroll record.
            </template>

          </div>

        </div>

        <footer>

          <AppButton
            variant="secondary"
            @click="
              emit('close')
            "
          >
            Close
          </AppButton>

          <AppButton
            v-if="
              action !== 'view'
            "
            :icon="
              action === 'paid'
                ? CircleCheck
                : Send
            "
            @click="
              handleConfirm
            "
          >
            {{
              action === 'paid'
                ? 'Mark as Paid'
                : 'Release Payroll'
            }}
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
  max-width: 540px;

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

.payroll-card {
  display: grid;

  grid-template-columns:
    repeat(3, minmax(0, 1fr));

  gap: 7px;
}

.payroll-card > div {
  padding: 9px;

  border:
    1px solid var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card-soft);
}

.payroll-card span,
.payroll-card strong {
  display: block;
}

.payroll-card span {
  color:
    var(--text-muted);

  font-size: 6px;
}

.payroll-card strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 8px;
}

.green {
  color:
    var(--green) !important;
}

.field {
  margin-top: 13px;
}

.field label {
  display: block;

  margin-bottom: 6px;

  color:
    var(--text-primary);

  font-size: 8px;
  font-weight: 600;
}

.field input {
  box-sizing: border-box;

  width: 100%;
  height: 39px;

  padding: 0 10px;

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

  outline: none;
}

.payment-meta {
  margin-top: 10px;
}

.payment-meta span,
.payment-meta strong {
  display: block;
}

.payment-meta span {
  color:
    var(--text-muted);

  font-size: 7px;
}

.payment-meta strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 8px;
}

.notice {
  margin-top: 11px;

  padding: 10px;

  border-radius: 7px;

  background:
    var(--primary-soft);

  color:
    var(--text-secondary);

  font-size: 8px;
}

footer {
  display: flex;

  justify-content: flex-end;

  gap: 7px;

  padding: 13px 18px;

  border-top:
    1px solid var(--border-soft);
}

@media (max-width: 550px) {
  .payroll-card {
    grid-template-columns: 1fr;
  }
}
</style>