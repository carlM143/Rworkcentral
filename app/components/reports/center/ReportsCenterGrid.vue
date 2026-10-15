<script setup lang="ts">
import {
  BarChart3,
  Building2,
  Clock3,
  FileBarChart,
  FileText,
  Gift,
  HeartPulse,
  History,
  Home,
  Landmark,
  ReceiptText,
  ShieldCheck,
  TimerReset,
  Umbrella,
  Users,
  WalletCards,
  ArrowUpRight,
  Download,
} from 'lucide-vue-next'

import type {
  ReportAvailability,
  ReportCenterItem,
} from '~/types/reportCenter'

const props =
  defineProps<{
    reports:
      ReportCenterItem[]
  }>()

const emit =
  defineEmits<{
    open: [
      report:
        ReportCenterItem,
    ]
    export: [
      report:
        ReportCenterItem,
    ]
  }>()

const iconMap:
  Record<string, any> = {
    users: Users,
    clock: Clock3,
    timer: Clock3,
    'timer-reset': TimerReset,
    umbrella: Umbrella,
    wallet: WalletCards,
    receipt: ReceiptText,
    building: Building2,
    file: FileText,
    gift: Gift,
    shield: ShieldCheck,
    home: Home,
    heart: HeartPulse,
    history: History,
    chart: BarChart3,
    landmark: Landmark,
  }

const reportIcon = (
  key: string,
) => {
  return (
    iconMap[key] ||
    FileBarChart
  )
}

const availabilityClass = (
  value:
    ReportAvailability,
) => {
  if (
    value ===
    'Available'
  ) {
    return 'available'
  }

  if (
    value ===
    'Coming Soon'
  ) {
    return 'coming'
  }

  return 'restricted'
}

const formatDateTime = (
  value?: string,
) => {
  if (!value) {
    return 'Never generated'
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    },
  ).format(
    new Date(value),
  )
}
</script>

<template>
  <div
    v-if="reports.length"
    class="reports-grid"
  >

    <article
      v-for="report in reports"
      :key="report.id"
      class="report-card"
      :class="{
        disabled:
          report.availability !==
          'Available',
      }"
    >

      <div class="card-top">

        <div class="report-icon">

          <component
            :is="
              reportIcon(
                report.iconKey,
              )
            "
            :size="20"
          />

        </div>

        <span
          class="availability-badge"
          :class="
            availabilityClass(
              report.availability,
            )
          "
        >
          {{ report.availability }}
        </span>

      </div>

      <div class="report-main">

        <div class="report-code">
          {{ report.code }}
        </div>

        <h3>
          {{ report.title }}
        </h3>

        <p>
          {{ report.description }}
        </p>

      </div>

      <div class="report-meta">

        <div class="meta-row">

          <span>
            Category
          </span>

          <strong>
            {{ report.category }}
          </strong>

        </div>

        <div class="meta-row">

          <span>
            Frequency
          </span>

          <strong>
            {{ report.frequency }}
          </strong>

        </div>

        <div class="meta-row">

          <span>
            Generated
          </span>

          <strong>
            {{ report.generatedCount }}
          </strong>

        </div>

      </div>

      <div class="formats">

        <span
          v-for="
            format in report.exportFormats
          "
          :key="format"
          class="format-badge"
        >
          {{ format }}
        </span>

      </div>

      <div class="last-generated">

        <span>
          Last generated
        </span>

        <strong>
          {{
            formatDateTime(
              report.lastGenerated,
            )
          }}
        </strong>

      </div>

      <div class="card-actions">

        <button
          type="button"
          class="secondary-action"
          :disabled="
            report.availability !==
            'Available'
          "
          @click="
            emit(
              'export',
              report,
            )
          "
        >

          <Download
            :size="14"
          />

          Export

        </button>

        <button
          type="button"
          class="primary-action"
          :disabled="
            report.availability !==
            'Available'
          "
          @click="
            emit(
              'open',
              report,
            )
          "
        >

          Open Report

          <ArrowUpRight
            :size="14"
          />

        </button>

      </div>

    </article>

  </div>

  <div
    v-else
    class="empty-state"
  >

    <FileBarChart
      :size="38"
    />

    <strong>
      No reports found
    </strong>

    <span>
      Try changing your report filters.
    </span>

  </div>
</template>

<style scoped>
.reports-grid {
  display: grid;

  grid-template-columns:
    repeat(
      3,
      minmax(0, 1fr)
    );

  gap: 14px;
}

.report-card {
  display: flex;

  min-height: 355px;

  flex-direction: column;

  padding: 16px;

  border:
    1px solid var(--border);

  border-radius: 12px;

  background:
    var(--bg-card);

  box-shadow:
    var(--shadow);

  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.report-card:hover {
  transform:
    translateY(-2px);

  border-color:
    color-mix(
      in srgb,
      var(--primary) 25%,
      var(--border)
    );
}

.report-card.disabled {
  opacity: 0.72;
}

/* TOP */

.card-top {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 10px;
}

.report-icon {
  display: flex;

  width: 40px;
  height: 40px;

  align-items: center;
  justify-content: center;

  border-radius: 10px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.availability-badge {
  display: inline-flex;

  padding:
    5px 8px;

  border-radius: 20px;

  font-size: 9px;
  font-weight: 650;
}

.availability-badge.available {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.availability-badge.coming {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.availability-badge.restricted {
  background:
    var(--red-soft);

  color:
    var(--red);
}

/* MAIN */

.report-main {
  margin-top: 15px;
}

.report-code {
  color:
    var(--primary);

  font-size: 9px;
  font-weight: 700;

  letter-spacing:
    0.5px;
}

.report-main h3 {
  margin:
    5px 0 0;

  color:
    var(--text-primary);

  font-size: 14px;

  line-height: 1.35;
}

.report-main p {
  min-height: 52px;

  margin:
    8px 0 0;

  color:
    var(--text-secondary);

  font-size: 10.5px;

  line-height: 1.6;
}

/* META */

.report-meta {
  display: grid;

  grid-template-columns:
    repeat(
      3,
      minmax(0, 1fr)
    );

  gap: 7px;

  margin-top: 14px;
}

.meta-row {
  padding:
    8px;

  border-radius: 8px;

  background:
    var(--bg-card-soft);
}

.meta-row span,
.meta-row strong {
  display: block;
}

.meta-row span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.meta-row strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 9.5px;
}

/* FORMATS */

.formats {
  display: flex;

  flex-wrap: wrap;

  gap: 5px;

  margin-top: 12px;
}

.format-badge {
  padding:
    4px 7px;

  border:
    1px solid var(--border);

  border-radius: 6px;

  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);

  font-size: 8.5px;
  font-weight: 600;
}

/* LAST GENERATED */

.last-generated {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 10px;

  margin-top: auto;

  padding-top: 14px;
}

.last-generated span {
  color:
    var(--text-muted);

  font-size: 8.5px;
}

.last-generated strong {
  color:
    var(--text-secondary);

  font-size: 8.5px;

  text-align: right;
}

/* ACTIONS */

.card-actions {
  display: grid;

  grid-template-columns:
    1fr
    1fr;

  gap: 7px;

  margin-top: 11px;
}

.card-actions button {
  display: flex;

  min-height: 35px;

  align-items: center;
  justify-content: center;

  gap: 5px;

  border-radius: 8px;

  font-family: inherit;

  font-size: 9.5px;
  font-weight: 650;

  cursor: pointer;
}

.secondary-action {
  border:
    1px solid var(--border);

  background:
    var(--bg-card);

  color:
    var(--text-secondary);
}

.secondary-action:hover:not(:disabled) {
  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);
}

.primary-action {
  border:
    1px solid var(--primary);

  background:
    var(--primary);

  color:
    #ffffff;
}

.primary-action:hover:not(:disabled) {
  background:
    var(--primary-dark);
}

.card-actions button:disabled {
  opacity: 0.45;

  cursor:
    not-allowed;
}

/* EMPTY */

.empty-state {
  display: flex;

  min-height: 320px;

  flex-direction: column;

  align-items: center;
  justify-content: center;

  gap: 8px;

  border:
    1px solid var(--border);

  border-radius: 12px;

  background:
    var(--bg-card);

  color:
    var(--text-muted);
}

.empty-state strong {
  color:
    var(--text-primary);

  font-size: 13px;
}

.empty-state span {
  font-size: 11px;
}

@media (max-width: 1250px) {
  .reports-grid {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }
}

@media (max-width: 700px) {
  .reports-grid {
    grid-template-columns:
      1fr;
  }
}
</style>