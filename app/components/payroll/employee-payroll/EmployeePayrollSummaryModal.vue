<script setup lang="ts">
import {
  X,
  FileBarChart,
  UsersRound,
  WalletCards,
  ReceiptText,
  CircleDollarSign,
} from 'lucide-vue-next'

defineProps<{
  open: boolean

  stats: {
    totalRecords: number
    grossPay: number
    deductions: number
    netPay: number
  }

  pending: number
  completed: number
  paid: number
  unpaid: number
}>()

const emit =
  defineEmits<{
    close: []
  }>()

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

        <header>

          <div class="heading">

            <div class="icon">
              <FileBarChart :size="18" />
            </div>

            <div>

              <h2>
                Employee Payroll Summary
              </h2>

              <p>
                Current payroll ledger overview based on the selected filters.
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

          <div class="stats">

            <div>

              <div class="stat-icon blue">
                <UsersRound :size="16" />
              </div>

              <span>
                Payroll Records
              </span>

              <strong>
                {{ stats.totalRecords }}
              </strong>

            </div>

            <div>

              <div class="stat-icon purple">
                <WalletCards :size="16" />
              </div>

              <span>
                Gross Payroll
              </span>

              <strong>
                {{ money(stats.grossPay) }}
              </strong>

            </div>

            <div>

              <div class="stat-icon orange">
                <ReceiptText :size="16" />
              </div>

              <span>
                Deductions
              </span>

              <strong>
                {{ money(stats.deductions) }}
              </strong>

            </div>

            <div>

              <div class="stat-icon green">
                <CircleDollarSign :size="16" />
              </div>

              <span>
                Net Payroll
              </span>

              <strong>
                {{ money(stats.netPay) }}
              </strong>

            </div>

          </div>

          <section>

            <h3>
              Payroll Status
            </h3>

            <div class="status-grid">

              <div>

                <span>
                  Pending / Review / Ready
                </span>

                <strong>
                  {{ pending }}
                </strong>

              </div>

              <div>

                <span>
                  Completed
                </span>

                <strong class="green-text">
                  {{ completed }}
                </strong>

              </div>

            </div>

          </section>

          <section>

            <h3>
              Payment Status
            </h3>

            <div class="status-grid">

              <div>

                <span>
                  Paid / Released
                </span>

                <strong class="green-text">
                  {{ paid }}
                </strong>

              </div>

              <div>

                <span>
                  Not Yet Paid / Pending
                </span>

                <strong class="orange-text">
                  {{ unpaid }}
                </strong>

              </div>

            </div>

          </section>

          <div class="formula">

            <span>
              Gross Payroll
            </span>

            <strong>
              {{ money(stats.grossPay) }}
            </strong>

            <span class="operator">
              −
            </span>

            <span>
              Deductions
            </span>

            <strong class="red-text">
              {{ money(stats.deductions) }}
            </strong>

            <span class="operator">
              =
            </span>

            <span>
              Net Payroll
            </span>

            <strong class="green-text">
              {{ money(stats.netPay) }}
            </strong>

          </div>

        </div>

        <footer>

          <AppButton
            @click="
              emit('close')
            "
          >
            Close Summary
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

  max-width: 700px;

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

.stats {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 7px;
}

.stats > div {
  padding: 10px;

  border:
    1px solid var(--border-soft);

  border-radius: 8px;

  background:
    var(--bg-card-soft);
}

.stat-icon {
  display: flex;

  width: 31px;
  height: 31px;

  align-items: center;
  justify-content: center;

  margin-bottom: 7px;

  border-radius: 7px;
}

.stat-icon.blue {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.stat-icon.purple {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.stat-icon.orange {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.stat-icon.green {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.stats span,
.stats strong {
  display: block;
}

.stats span {
  color:
    var(--text-muted);

  font-size: 6.5px;
}

.stats strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 10px;
}

section {
  margin-top: 16px;
}

section h3 {
  margin:
    0 0 7px;

  color:
    var(--text-primary);

  font-size: 9px;
}

.status-grid {
  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 7px;
}

.status-grid > div {
  padding: 10px;

  border:
    1px solid var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card-soft);
}

.status-grid span,
.status-grid strong {
  display: block;
}

.status-grid span {
  color:
    var(--text-muted);

  font-size: 7px;
}

.status-grid strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 13px;
}

.formula {
  display: grid;

  grid-template-columns:
    1fr auto
    auto
    1fr auto
    auto
    1fr auto;

  align-items: center;

  gap: 7px;

  margin-top: 16px;

  padding: 11px;

  border-radius: 8px;

  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);

  font-size: 7px;
}

.formula strong {
  color:
    var(--text-primary);
}

.operator {
  color:
    var(--text-muted);

  font-weight: 700;
}

.green-text {
  color:
    var(--green) !important;
}

.orange-text {
  color:
    var(--orange) !important;
}

.red-text {
  color:
    var(--red) !important;
}

footer {
  display: flex;

  justify-content: flex-end;

  padding:
    13px 18px;

  border-top:
    1px solid var(--border-soft);
}

@media (max-width: 650px) {
  .stats,
  .status-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .formula {
    grid-template-columns: 1fr;
  }
}
</style>