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
  <footer class="table-footer">
    <p>
      Showing <strong>{{ totalItems ? showingFrom : 0 }}–{{ totalItems ? showingTo : 0 }}</strong>
      of <strong>{{ totalItems }}</strong> {{ itemLabel }}
    </p>
    <AppPagination v-model="currentPage" :total-pages="totalPages" />
  </footer>
</template>

<style scoped>
.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 2px 0;
}
.table-footer p {
  margin: 0;
  color: var(--text-muted, #7c8da8);
  font-size: 12px;
  line-height: 1.5;
}
.table-footer strong { color: var(--text-primary, #f8fafc); font-weight: 700; }
@media (max-width: 650px) {
  .table-footer { flex-wrap: wrap; align-items: flex-start; }
}
</style>
