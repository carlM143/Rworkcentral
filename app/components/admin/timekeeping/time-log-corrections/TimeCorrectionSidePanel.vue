<script setup lang="ts">
import {
  Clock3,
  AlertTriangle,
  Paperclip,
  FileWarning,
  CircleCheck,
  CircleX,
} from 'lucide-vue-next'

defineProps<{
  summary: {
    pending: number
    urgent: number
    withAttachment: number
    missingLog: number
  }
}>()

const emit = defineEmits<{
  pending: []
  approved: []
  rejected: []
}>()
</script>

<template>
  <aside class="side-panel">

    <!-- REVIEW -->

    <article class="side-card">

      <div class="side-heading">

        <div class="side-icon orange">
          <AlertTriangle :size="17" />
        </div>

        <div>
          <h3>
            Pending Review
          </h3>

          <p>
            Requests requiring attention.
          </p>
        </div>

      </div>

      <div class="summary-list">

        <div class="summary-row">

          <span>
            <Clock3 :size="14" />
            Pending Requests
          </span>

          <strong>
            {{ summary.pending }}
          </strong>

        </div>

        <div class="summary-row">

          <span>
            <AlertTriangle :size="14" />
            Urgent Requests
          </span>

          <strong class="danger">
            {{ summary.urgent }}
          </strong>

        </div>

        <div class="summary-row">

          <span>
            <Paperclip :size="14" />
            With Attachment
          </span>

          <strong>
            {{ summary.withAttachment }}
          </strong>

        </div>

        <div class="summary-row">

          <span>
            <FileWarning :size="14" />
            Missing Logs
          </span>

          <strong class="purple">
            {{ summary.missingLog }}
          </strong>

        </div>

      </div>

    </article>

    <!-- QUICK -->

    <article class="side-card">

      <div class="side-heading">

        <div class="side-icon blue">
          <Clock3 :size="17" />
        </div>

        <div>
          <h3>
            Quick Filters
          </h3>

          <p>
            Review requests by status.
          </p>
        </div>

      </div>

      <div class="quick-list">

        <button
          type="button"
          @click="
            emit('pending')
          "
        >
          <Clock3 :size="15" />

          Review Pending
        </button>

        <button
          type="button"
          @click="
            emit('approved')
          "
        >
          <CircleCheck :size="15" />

          View Approved
        </button>

        <button
          type="button"
          @click="
            emit('rejected')
          "
        >
          <CircleX :size="15" />

          View Rejected
        </button>

      </div>

    </article>

  </aside>
</template>

<style scoped>
.side-panel {
  display: flex;

  flex-direction: column;

  gap: 14px;
}

.side-card {
  overflow: hidden;

  border:
    1px solid var(--border);

  border-radius: 11px;

  background:
    var(--bg-card);

  box-shadow:
    var(--shadow);
}

.side-heading {
  display: flex;

  align-items: center;

  gap: 9px;

  padding: 14px;

  border-bottom:
    1px solid
    var(--border-soft);
}

.side-icon {
  display: flex;

  width: 36px;
  height: 36px;

  align-items: center;
  justify-content: center;

  border-radius: 8px;
}

.side-icon.orange {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.side-icon.blue {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.side-heading h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 13px;
}

.side-heading p {
  margin:
    4px 0 0;

  color:
    var(--text-muted);

  font-size: 10px;
}

.summary-list {
  padding:
    5px 14px 10px;
}

.summary-row {
  display: flex;

  min-height: 44px;

  align-items: center;
  justify-content: space-between;

  gap: 10px;

  border-bottom:
    1px solid
    var(--border-soft);
}

.summary-row:last-child {
  border-bottom: 0;
}

.summary-row span {
  display: flex;

  align-items: center;

  gap: 7px;

  color:
    var(--text-secondary);

  font-size: 10px;
}

.summary-row strong {
  color:
    var(--primary);

  font-size: 11px;
}

.summary-row
strong.danger {
  color:
    var(--red);
}

.summary-row
strong.purple {
  color:
    var(--purple);
}

.quick-list {
  padding: 8px;
}

.quick-list button {
  display: flex;

  width: 100%;
  min-height: 43px;

  align-items: center;

  gap: 9px;

  padding:
    0 10px;

  border: 0;

  border-radius: 7px;

  background:
    transparent;

  color:
    var(--text-secondary);

  font-family: inherit;

  font-size: 10px;

  text-align: left;

  cursor: pointer;
}

.quick-list button:hover {
  background:
    var(--bg-card-soft);

  color:
    var(--primary);
}

@media (max-width: 1100px) {
  .side-panel {
    display: grid;

    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }
}

@media (max-width: 650px) {
  .side-panel {
    grid-template-columns:
      1fr;
  }
}
</style>