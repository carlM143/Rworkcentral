<script setup lang="ts">
import {
  ArrowLeft,
  AlertCircle,
  LoaderCircle,
} from 'lucide-vue-next'

import ManualTimeEntryForm from '~/components/admin/timekeeping/manual-time-in-out/ManualTimeEntryForm.vue'

import type {
  ManualTimeEntry,
} from '~/types/manualTimeEntry'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const router = useRouter()

const {
  getManualEntry,
} = useManualTimeEntries()

const entryId = computed(() =>
  Number(route.params.id),
)

const selectedEntry = ref<ManualTimeEntry | null>(null)
const loading = ref(true)
const loadError = ref('')

const loadEntry = async () => {
  loading.value = true
  loadError.value = ''
  selectedEntry.value = null

  try {
    if (!Number.isInteger(entryId.value) || entryId.value <= 0) {
      throw new Error('Invalid manual entry ID.')
    }

    selectedEntry.value = await getManualEntry(entryId.value)
  } catch (err: unknown) {
    const apiError = err as {
      data?: { message?: string }
      message?: string
    }

    loadError.value =
      apiError.data?.message ??
      apiError.message ??
      'Unable to load manual attendance.'
  } finally {
    loading.value = false
  }
}

watch(entryId, loadEntry, {
  immediate: true,
})

const goBack = () => {
  router.push('/admin/manual-time-in-out')
}
</script>

<template>
  <div v-if="loading" class="page-feedback">
    <LoaderCircle :size="32" class="spin" />
    <h2>Loading Manual Attendance</h2>
    <p>Retrieving the latest attendance record...</p>
  </div>

  <ManualTimeEntryForm
    v-else-if="selectedEntry"
    mode="edit"
    :entry="selectedEntry"
  />

  <section v-else class="page-feedback">
    <AlertCircle :size="35" />

    <h2>Manual Entry Not Available</h2>

    <p>
      {{ loadError || 'This attendance record could not be found.' }}
    </p>

    <AppButton :icon="ArrowLeft" @click="goBack">
      Back to Manual Entries
    </AppButton>
  </section>
</template>

<style scoped>
.page-feedback {
  display: flex;
  min-height: 360px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 13px;
  padding: 30px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  color: var(--text-muted);
  text-align: center;
}

.page-feedback h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 17px;
}

.page-feedback p {
  margin: 0 0 10px;
  font-size: 12px;
}

.spin {
  animation: rotate 0.8s linear infinite;
}

@keyframes rotate {
  to {
    transform: rotate(360deg);
  }
}
</style>
