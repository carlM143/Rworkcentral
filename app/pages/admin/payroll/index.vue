<script setup lang="ts">
import {
  Download,
  Calculator,
  Clock3,
  WalletCards,
  Settings2,
} from 'lucide-vue-next'

const {
  currentPeriod,

  payrollRecords,

  stats,

  statusBreakdown,

  issues,

  recentPayrollRuns,
} = usePayrollDashboard()

const router =
  useRouter()

const {
  info,
} = useToast()

const handleExport = () => {
  info(
    'Export Payroll',
    'Payroll export will be connected later.',
  )
}

const handleCreatePayroll = () => {
  info(
    'Create Payroll',
    'Payroll creation workflow will be implemented in the payroll processing module.',
  )
}
</script>

<template>
  <section class="payroll-page">

    <!-- HEADER -->
    <PageHeader
      title="Payroll"
      description="Review payroll periods, employee computations, payroll issues and recent processing activity."
    >
      <AppButton
        variant="secondary"
        :icon="Download"
        @click="handleExport"
      >
        Export
      </AppButton>

      <AppButton
        :icon="Calculator"
        @click="handleCreatePayroll"
      >
        Create Payroll
      </AppButton>
    </PageHeader>

    <!-- STATS -->
    <PayrollStats
      :stats="stats"
    />

    <!-- PERIOD -->
    <PayrollPeriodCard
      :period="currentPeriod"
      :breakdown="statusBreakdown"
    />

    <!-- MAIN -->
    <div class="payroll-layout">

      <div class="payroll-main">

        <PayrollPreviewTable
          :records="payrollRecords"
        />

      </div>

      <aside class="payroll-side">

        <PayrollIssuesCard
          :issues="issues"
        />

        <!-- QUICK ACTIONS -->
        <article class="quick-card">

          <div class="quick-heading">
            <div class="quick-icon">
              <WalletCards :size="17" />
            </div>

            <div>
              <h3>
                Quick Actions
              </h3>

              <p>
                Common payroll tasks.
              </p>
            </div>
          </div>

          <div class="quick-list">

            <button
              type="button"
              @click="
                router.push(
                  '/employee-pay-periods',
                )
              "
            >
              <Clock3 :size="15" />

              View Pay Periods
            </button>

            <button
              type="button"
              @click="
                router.push('/admin/rates')
              "
            >
              <Settings2 :size="15" />

              Manage Payroll Rates
            </button>

            <button
              type="button"
              @click="
                router.push(
                  '/admin/pending-employees-payroll',
                )
              "
            >
              <Calculator :size="15" />

              Pending Payroll
            </button>

          </div>

        </article>

        <RecentPayrollRuns
          :runs="recentPayrollRuns"
        />

      </aside>

    </div>

  </section>
</template>

<style scoped>
.payroll-page {
  width: 100%;
  max-width: 1660px;

  margin: 0 auto;
}

.payroll-layout {
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    300px;

  gap: 12px;

  margin-top: 12px;
}

.payroll-main {
  min-width: 0;
}

.payroll-side {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* QUICK ACTIONS */

.quick-card {
  overflow: hidden;

  border: 1px solid var(--border);
  border-radius: 11px;

  background: var(--bg-card);

  box-shadow: var(--shadow);
}

.quick-heading {
  display: flex;
  align-items: center;
  gap: 9px;

  padding: 12px 13px;

  border-bottom:
    1px solid var(--border-soft);
}

.quick-icon {
  display: flex;

  width: 34px;
  height: 34px;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background: var(--primary-soft);
  color: var(--primary);
}

.quick-heading h3 {
  margin: 0;

  color: var(--text-primary);

  font-size: 10px;
}

.quick-heading p {
  margin: 3px 0 0;

  color: var(--text-muted);

  font-size: 7px;
}

.quick-list {
  padding: 7px;
}

.quick-list button {
  display: flex;

  width: 100%;
  min-height: 38px;

  align-items: center;
  gap: 9px;

  padding: 0 9px;

  border: 0;
  border-radius: 7px;

  background: transparent;
  color: var(--text-secondary);

  font-size: 8px;

  text-align: left;
}

.quick-list button:hover {
  background: var(--bg-card-soft);
  color: var(--primary);
}

@media (max-width: 1100px) {
  .payroll-layout {
    grid-template-columns: 1fr;
  }

  .payroll-side {
    display: grid;

    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 850px) {
  .payroll-side {
    grid-template-columns: 1fr;
  }
}
</style>