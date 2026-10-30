
<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description?: string
  hasRows: boolean
  loading?: boolean
  minWidth?: string
  emptyTitle?: string
  emptyDescription?: string
  compact?: boolean
}>(), {
  description: '',
  loading: false,
  minWidth: '1000px',
  emptyTitle: 'No records found',
  emptyDescription: 'Try adjusting your filters.',
  compact: false,
})
</script>

<template>
  <article
    class="base-table-card"
    :class="{ 'is-compact': compact }"
  >
    <!-- HEADER -->
    <header class="table-heading">
      <div class="table-heading-content">
        <h3>{{ title }}</h3>
        <p v-if="description">
          {{ description }}
        </p>
      </div>

      <div
        v-if="$slots['heading-actions']"
        class="table-heading-actions"
      >
        <slot name="heading-actions" />
      </div>
    </header>

    <!-- TOOLBAR -->
    <div
      v-if="$slots.toolbar"
      class="table-toolbar"
    >
      <slot name="toolbar" />
    </div>

    <!-- LOADING -->
    <div
      v-if="loading"
      class="table-state"
      role="status"
      aria-live="polite"
    >
      <span class="loading-spinner" aria-hidden="true" />
      <strong>Loading records...</strong>
    </div>

    <!-- TABLE -->
    <div
      v-else-if="hasRows"
      class="table-scroll"
    >
      <table :style="{ minWidth }">
        <thead>
          <tr>
            <slot name="headers" />
          </tr>
        </thead>

        <tbody>
          <slot name="rows" />
        </tbody>
      </table>
    </div>

    <!-- EMPTY STATE -->
    <div
      v-else
      class="table-state empty-state"
    >
      <slot name="empty">
        <strong>{{ emptyTitle }}</strong>
        <span>{{ emptyDescription }}</span>
      </slot>
    </div>

    <!-- FOOTER -->
    <div
      v-if="$slots.bottom"
      class="table-bottom"
    >
      <slot name="bottom" />
    </div>
  </article>
</template>

<style scoped>
/* =========================================
   GLOBAL TABLE TYPOGRAPHY
   ========================================= */

.base-table-card {
  /* Font sizes */
  --table-title-font: 17px;
  --table-description-font: 12px;
  --table-controls-font: 13px;
  --table-column-font: 12px;
  --table-row-font: 13px;
  --table-status-font: 12px;
  --table-state-title-font: 14px;
  --table-state-description-font: 12px;

  /* Font weights */
  --table-title-weight: 700;
  --table-header-weight: 600;
  --table-row-weight: 400;
  --table-emphasis-weight: 600;
  --table-status-weight: 600;

  width: 100%;
  min-width: 0;
  overflow: hidden;

  border: 1px solid var(--border, #29364d);
  border-radius: 12px;

  background: var(--bg-card, #131e30);
  box-shadow: var(
    --shadow,
    0 6px 22px rgb(0 0 0 / 7%)
  );
}

/* =========================================
   TABLE HEADER
   ========================================= */

.table-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;

  gap: 12px;
  min-height: 60px;
  padding: 15px 17px;

  border-bottom: 1px solid var(
    --border-soft,
    #253247
  );
}

.table-heading-content {
  min-width: 0;
}

.table-heading h3 {
  margin: 0;

  color: var(--text-primary, #f8fafc);

  font-size: var(--table-title-font);
  font-weight: var(--table-title-weight);
  line-height: 1.4;
}

.table-heading p {
  margin: 4px 0 0;

  color: var(--text-secondary, #a2b0c6);

  font-size: var(--table-description-font);
  font-weight: 400;
  line-height: 1.5;
}

.table-heading-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 9px;
}

/* =========================================
   TABLE TOOLBAR
   ========================================= */

.table-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 9px;

  min-height: 58px;
  padding: 12px 15px;

  border-bottom: 1px solid var(
    --border-soft,
    #253247
  );
}

.table-toolbar :deep(.table-search),
.table-toolbar :deep(.table-filter) {
  min-height: 40px;
  max-width: 100%;
  padding: 0 12px;

  border: 1px solid var(--border, #29364d);
  border-radius: 7px;
  outline: none;

  background: var(--bg-card-soft, #182438);
  color: var(--text-primary, #f8fafc);

  font-family: inherit;
  font-size: var(--table-controls-font);
  font-weight: 400;
}

.table-toolbar :deep(.table-search) {
  width: min(280px, 100%);
}

.table-toolbar :deep(.table-filter) {
  min-width: 118px;
}

.table-toolbar :deep(.table-search::placeholder) {
  color: var(--text-muted, #7c8da8);
}

.table-toolbar :deep(.table-search:focus-visible),
.table-toolbar :deep(.table-filter:focus-visible) {
  border-color: var(--primary, #327bff);

  box-shadow: 0 0 0 2px
    color-mix(
      in srgb,
      var(--primary, #327bff) 13%,
      transparent
    );
}

/* =========================================
   TABLE CONTAINER
   ========================================= */

.table-scroll {
  width: 100%;
  overflow-x: auto;

  scrollbar-width: thin;
  scrollbar-color:
    var(--border, #29364d)
    transparent;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

/* =========================================
   TABLE COLUMN HEADERS
   ========================================= */

table :deep(thead th) {
  padding: 12px 15px;

  background: var(--bg-card-soft, #182438);
  color: var(--text-secondary, #a2b0c6);

  font-size: var(--table-column-font);
  font-weight: var(--table-header-weight);
  line-height: 1.4;

  text-align: left;
  letter-spacing: 0.025em;
  text-transform: uppercase;
  white-space: nowrap;
}

/* =========================================
   TABLE DATA
   ========================================= */

table :deep(tbody td) {
  padding: 17px 15px;

  border-top: 1px solid var(
    --border-soft,
    #253247
  );

  background: transparent;
  color: var(--text-secondary, #a2b0c6);

  font-size: var(--table-row-font);
  font-weight: var(--table-row-weight);
  line-height: 1.55;

  vertical-align: middle;
}

/* Important text such as names and titles */
table :deep(tbody td strong),
table :deep(tbody td b) {
  color: var(--text-primary, #e5edf9);
  font-weight: var(--table-emphasis-weight);
}

/* Normal text within cells */
table :deep(tbody td p),
table :deep(tbody td span) {
  line-height: 1.5;
}

/* Hover behavior */
table :deep(tbody tr) {
  transition: background-color 0.15s ease;
}

table :deep(tbody tr:hover) {
  background: color-mix(
    in srgb,
    var(--primary, #327bff) 5%,
    var(--bg-card, #131e30)
  );
}

table :deep(tbody tr:focus-within) {
  background: color-mix(
    in srgb,
    var(--primary, #327bff) 7%,
    var(--bg-card, #131e30)
  );
}

/* Right alignment */
table :deep(th:last-child.text-right),
table :deep(td:last-child.text-right) {
  text-align: right;
}

/* =========================================
   STATUS BADGES
   ========================================= */

table :deep(.status-pill) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;

  padding: 4px 10px;

  border-radius: 999px;

  font-size: var(--table-status-font);
  font-weight: var(--table-status-weight);
  line-height: 1.4;
  white-space: nowrap;
}

table :deep(.status-pill::before) {
  content: '';

  width: 5px;
  height: 5px;
  flex: 0 0 5px;

  border-radius: 50%;
  background: currentColor;
}

table :deep(.status-pill--active) {
  color: #22c55e;
  background: rgb(34 197 94 / 11%);
}

table :deep(.status-pill--inactive) {
  color: #f87171;
  background: rgb(248 113 113 / 11%);
}

/* =========================================
   ACTION BUTTONS
   ========================================= */

table :deep(.table-action-button) {
  display: inline-grid;
  width: 34px;
  height: 34px;

  place-items: center;

  border: 1px solid var(--border, #29364d);
  border-radius: 8px;

  background: transparent;
  color: var(--text-secondary, #a2b0c6);

  font-size: var(--table-controls-font);
  font-weight: 400;

  cursor: pointer;
}

table :deep(.table-action-button:hover) {
  border-color: var(--primary, #327bff);
  color: var(--primary, #327bff);

  background: color-mix(
    in srgb,
    var(--primary, #327bff) 9%,
    transparent
  );
}

/* =========================================
   EMPTY AND LOADING STATES
   ========================================= */

.table-state {
  display: flex;
  min-height: 230px;

  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 8px;
  padding: 24px;

  text-align: center;
  color: var(--text-muted, #7c8da8);
}

.table-state strong {
  color: var(--text-primary, #f8fafc);

  font-size: var(--table-state-title-font);
  font-weight: 600;
}

.table-state span {
  font-size: var(--table-state-description-font);
  font-weight: 400;
}

.loading-spinner {
  display: block;
  width: 20px;
  height: 20px;

  border: 2px solid var(--border, #29364d);
  border-top-color: var(--primary, #327bff);
  border-radius: 50%;

  animation: table-spin 0.75s linear infinite;
}

@keyframes table-spin {
  to {
    transform: rotate(360deg);
  }
}

/* =========================================
   TABLE BOTTOM
   ========================================= */

.table-bottom {
  border-top: 1px solid var(
    --border-soft,
    #253247
  );
}

/* =========================================
   COMPACT MODE
   ========================================= */

.is-compact table :deep(tbody td) {
  padding-top: 11px;
  padding-bottom: 11px;
}

.is-compact table :deep(thead th) {
  padding-top: 10px;
  padding-bottom: 10px;
}

/* =========================================
   RESPONSIVE
   ========================================= */

@media (max-width: 650px) {
  .table-heading {
    padding: 14px;
  }

  .table-toolbar {
    padding: 11px 12px;
  }

  .table-toolbar :deep(.table-search) {
    width: 100%;
  }

  table :deep(thead th) {
    padding: 11px 12px;
  }

  table :deep(tbody td) {
    padding: 14px 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .loading-spinner {
    animation: none;
  }

  table :deep(tbody tr) {
    transition: none;
  }
}
</style>
