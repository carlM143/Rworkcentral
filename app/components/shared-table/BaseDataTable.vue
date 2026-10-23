<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description?: string
  hasRows: boolean
  minWidth?: string
  emptyTitle?: string
  emptyDescription?: string
}>(), {
  minWidth: '1000px',
  emptyTitle: 'No records found',
  emptyDescription: 'Try adjusting your filters.',
})
</script>

<template>
  <article class="base-table-card">
    <div class="table-heading">
      <h3>{{ title }}</h3>
      <p v-if="description">{{ description }}</p>
    </div>

    <div v-if="hasRows" class="table-scroll">
      <table :style="{ minWidth }">
        <thead><tr><slot name="headers" /></tr></thead>
        <tbody><slot name="rows" /></tbody>
      </table>
    </div>

    <div v-else class="empty-state">
      <slot name="empty">
        <strong>{{ emptyTitle }}</strong>
        <span>{{ emptyDescription }}</span>
      </slot>
    </div>
  </article>
</template>

<style scoped>
.base-table-card { overflow: hidden; border: 1px solid var(--border); border-radius: 11px; background: var(--bg-card); box-shadow: var(--shadow); }
.table-heading { padding: 16px 17px; border-bottom: 1px solid var(--border-soft); }
.table-heading h3 { margin: 0; color: var(--text-primary); font-size: 15px; font-weight: 700; }
.table-heading p { margin: 5px 0 0; color: var(--text-muted); font-size: 10px; }
.table-scroll { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
table :deep(th) { padding: 12px 13px; background: var(--bg-card-soft); color: var(--text-secondary); font-size: 10px; font-weight: 700; text-align: left; text-transform: uppercase; white-space: nowrap; }
table :deep(td) { padding: 13px; border-top: 1px solid var(--border-soft); color: var(--text-secondary); font-size: 10px; vertical-align: middle; }
table :deep(tbody tr:hover) { background: var(--bg-card-soft); }
.empty-state { display: flex; min-height: 260px; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: var(--text-muted); }
.empty-state strong { color: var(--text-primary); font-size: 12px; }
.empty-state span { font-size: 10px; }
</style>