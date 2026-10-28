<script setup lang="ts">
withDefaults(defineProps<{
  showingFrom: number
  showingTo: number
  totalItems: number
  totalPages: number
  itemLabel?: string
}>(), { itemLabel: 'records' })

const currentPage = defineModel<number>({ default: 1 })
</script>

<template>
  <div class="table-footer">
    <p>Showing <strong>{{ showingFrom }}–{{ showingTo }}</strong> of <strong>{{ totalItems }}</strong> {{ itemLabel }}</p>
    <AppPagination v-model="currentPage" :total-pages="totalPages" />
  </div>
</template>

<style scoped>
.table-footer { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 14px 3px 0; }
.table-footer p { margin: 0; color: var(--text-muted); font-size: 11px; }
.table-footer strong { color: var(--text-primary); font-weight: 650; }
@media (max-width: 650px) { .table-footer { flex-direction: column; align-items: stretch; } }
</style>