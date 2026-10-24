<script setup lang="ts">
import {
  Clock3,
  FileWarning,
  Upload,
  Files,
  BadgeCheck,
} from 'lucide-vue-next'

import type {
  DocumentRecord,
  MissingDocumentRequirement,
} from '~/types/document'

defineProps<{
  expiringDocuments: DocumentRecord[]

  missingRequirements:
    MissingDocumentRequirement[]
}>()

const emit = defineEmits<{
  upload: []
  verification: []
  requirements: []
}>()

const formatShortDate = (
  value?: string,
) => {
  if (!value) {
    return 'No expiry'
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
    },
  ).format(
    new Date(
      `${value}T00:00:00`,
    ),
  )
}
</script>

<template>
  <aside class="documents-side">

    <!-- EXPIRING -->
    <article class="side-card">

      <div class="side-heading">

        <div class="side-icon orange">
          <Clock3 :size="17" />
        </div>

        <div>
          <h3>
            Expiring Documents
          </h3>

          <p>
            Documents requiring renewal.
          </p>
        </div>

      </div>

      <div class="side-list">

        <div
          v-for="document in expiringDocuments"
          :key="document.id"
          class="side-row"
        >
          <div>
            <strong>
              {{ document.employeeName }}
            </strong>

            <span>
              {{ document.documentType }}
            </span>
          </div>

          <small
            :class="{
              expired:
                document.status ===
                'Expired',
            }"
          >
            {{
              document.status === 'Expired'
                ? 'Expired'
                : formatShortDate(
                    document.expiresAt,
                  )
            }}
          </small>
        </div>

      </div>

    </article>

    <!-- MISSING -->
    <article class="side-card">

      <div class="side-heading">

        <div class="side-icon red">
          <FileWarning :size="17" />
        </div>

        <div>
          <h3>
            Missing Requirements
          </h3>

          <p>
            Required documents not yet submitted.
          </p>
        </div>

      </div>

      <div class="side-list">

        <div
          v-for="item in missingRequirements"
          :key="item.id"
          class="side-row"
        >
          <div>
            <strong>
              {{ item.employeeName }}
            </strong>

            <span>
              {{ item.documentType }}
            </span>
          </div>

          <small class="missing">
            Missing
          </small>
        </div>

      </div>

    </article>

    <!-- QUICK ACTIONS -->
    <article class="side-card">

      <div class="side-heading">

        <div class="side-icon blue">
          <Files :size="17" />
        </div>

        <div>
          <h3>
            Quick Actions
          </h3>

          <p>
            Common document management tasks.
          </p>
        </div>

      </div>

      <div class="quick-list">

        <button
          type="button"
          @click="emit('upload')"
        >
          <Upload :size="15" />

          Upload Document
        </button>

        <button
          type="button"
          @click="emit('verification')"
        >
          <BadgeCheck :size="15" />

          Pending Verification
        </button>

        <button
          type="button"
          @click="emit('requirements')"
        >
          <FileWarning :size="15" />

          Required Documents
        </button>

      </div>

    </article>

  </aside>
</template>

<style scoped>
.documents-side {
  display: flex;

  flex-direction: column;

  gap: 14px;
}

.side-card {
  overflow: hidden;

  border: 1px solid var(--border);
  border-radius: 11px;

  background: var(--bg-card);

  box-shadow: var(--shadow);
}

/* HEADER */

.side-heading {
  display: flex;

  align-items: center;

  gap: 10px;

  padding: 14px;

  border-bottom: 1px solid var(--border-soft);
}

.side-icon {
  display: flex;

  width: 38px;
  height: 38px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 9px;
}

.side-icon.orange {
  background: var(--orange-soft);
  color: var(--orange);
}

.side-icon.red {
  background: var(--red-soft);
  color: var(--red);
}

.side-icon.blue {
  background: var(--primary-soft);
  color: var(--primary);
}

.side-heading h3 {
  margin: 0;

  color: var(--text-primary);

  font-size: 13px;
  font-weight: 700;
}

.side-heading p {
  margin: 4px 0 0;

  color: var(--text-muted);

  font-size: 10px;

  line-height: 1.4;
}

/* ROWS */

.side-list {
  padding: 5px 14px 10px;
}

.side-row {
  display: flex;

  min-height: 53px;

  align-items: center;
  justify-content: space-between;

  gap: 12px;

  padding: 10px 0;

  border-bottom: 1px solid var(--border-soft);
}

.side-row:last-child {
  border-bottom: 0;
}

.side-row strong {
  display: block;

  color: var(--text-primary);

  font-size: 11px;
  font-weight: 650;
}

.side-row span {
  display: block;

  margin-top: 4px;

  color: var(--text-muted);

  font-size: 9px;
}

.side-row small {
  flex-shrink: 0;

  color: var(--orange);

  font-size: 9px;
  font-weight: 650;
}

.side-row small.expired,
.side-row small.missing {
  color: var(--red);
}

/* QUICK ACTIONS */

.quick-list {
  padding: 8px;
}

.quick-list button {
  display: flex;

  width: 100%;
  min-height: 44px;

  align-items: center;

  gap: 10px;

  padding: 0 11px;

  border: 0;
  border-radius: 7px;

  background: transparent;

  color: var(--text-secondary);

  font-size: 10px;
  font-weight: 500;

  text-align: left;

  cursor: pointer;
}

.quick-list button:hover {
  background: var(--bg-card-soft);
  color: var(--primary);
}
</style>