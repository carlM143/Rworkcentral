<script setup lang="ts">
import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-vue-next'

const currentPage = defineModel<number>({
  default: 1,
})

const props = defineProps<{
  totalPages: number
}>()

const pages = computed(() => {
  const maxVisible = 5

  if (props.totalPages <= maxVisible) {
    return Array.from(
      { length: props.totalPages },
      (_, index) => index + 1,
    )
  }

  let start = Math.max(
    1,
    currentPage.value - 2,
  )

  let end = Math.min(
    props.totalPages,
    start + maxVisible - 1,
  )

  if (end - start < maxVisible - 1) {
    start = Math.max(
      1,
      end - maxVisible + 1,
    )
  }

  return Array.from(
    { length: end - start + 1 },
    (_, index) => start + index,
  )
})

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < props.totalPages) {
    currentPage.value++
  }
}
</script>

<template>
  <div class="pagination">
    <button
      type="button"
      class="pagination-button arrow"
      :disabled="currentPage <= 1"
      @click="previousPage"
    >
      <ChevronLeft :size="15" />
    </button>

    <button
      v-for="page in pages"
      :key="page"
      type="button"
      class="pagination-button"
      :class="{
        active: page === currentPage,
      }"
      @click="currentPage = page"
    >
      {{ page }}
    </button>

    <button
      type="button"
      class="pagination-button arrow"
      :disabled="currentPage >= totalPages"
      @click="nextPage"
    >
      <ChevronRight :size="15" />
    </button>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  gap: 5px;
}

.pagination-button {
  display: flex;
  min-width: 31px;
  height: 31px;
  align-items: center;
  justify-content: center;

  padding: 0 8px;

  border: 1px solid var(--border);
  border-radius: 7px;

  background: var(--bg-card);
  color: var(--text-secondary);

  font-size: 10px;
  font-weight: 600;
}

.pagination-button:hover:not(:disabled) {
  border-color: var(--primary);
  color: var(--primary);
}

.pagination-button.active {
  border-color: var(--primary);
  background: var(--primary);
  color: white;
}

.pagination-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>