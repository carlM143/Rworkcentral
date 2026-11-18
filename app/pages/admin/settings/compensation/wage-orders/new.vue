<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'
import WageOrderForm from '~/components/admin/compensation/WageOrderForm.vue'
import {
  useWageOrders,
  wageApiError,
  type WageMeta,
  type WageOrderPayload,
} from '~/composables/admin/compensation/useWageOrders'

definePageMeta({
  layout: 'admin',
})

const router = useRouter()
const api = useWageOrders()
const { success, error: toastError } = useToast()

const meta = ref<WageMeta | null>(null)
const saving = ref(false)
const errors = ref<Record<string, string[]>>({})

onMounted(async () => {
  meta.value = (await api.meta()).data
})

const save = async (payload: WageOrderPayload) => {
  saving.value = true
  errors.value = {}
  try {
    const response = await api.store(payload)
    success('Wage order saved', `${response.message} Publish it to start applying the rates.`)
    await router.push(`/admin/settings/compensation/wage-orders/${response.data.id}`)
  } catch (err) {
    const e = wageApiError(err, 'Unable to save the wage order.')
    errors.value = e.errors
    toastError('Unable to save', e.message)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="wage-page">
    <button type="button" class="back-link" @click="router.push('/admin/settings/compensation/wage-orders')">
      <ArrowLeft :size="14" /> Back to Wage Orders
    </button>

    <PageHeader title="Add Wage Order" description="Record a regional wage order. It is saved as a draft until you publish it." />

    <div v-if="!meta" class="state">Loading...</div>
    <WageOrderForm
      v-else
      :meta="meta"
      :saving="saving"
      :errors="errors"
      submit-label="Save as Draft"
      @save="save"
      @cancel="router.push('/admin/settings/compensation/wage-orders')"
    />
  </section>
</template>

<style scoped>
.wage-page { width: 100%; max-width: 1400px; margin: 0 auto; display: grid; gap: 14px; }
.back-link { display: inline-flex; width: fit-content; align-items: center; gap: 6px; padding: 0; border: 0; background: transparent; color: var(--primary); font-family: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
.back-link:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.state { padding: 40px; color: var(--text-muted); text-align: center; }
</style>
