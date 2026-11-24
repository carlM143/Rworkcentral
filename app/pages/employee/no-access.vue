<script setup lang="ts">
import { ArrowLeft, ShieldOff } from 'lucide-vue-next'
import { firstEmployeePath } from '~/utils/employeeAccess'

definePageMeta({ layout: false, middleware: 'employee' })
useHead({ title: 'No access | Employee Portal' })

const router = useRouter()
const route = useRoute()
const { can } = useAuth()

const firstAllowed = computed(() => firstEmployeePath(can))
const fromPage = computed(() => (typeof route.query.from === 'string' ? route.query.from : ''))
</script>

<template>
  <section class="no-access">
    <div class="card">
      <span class="icon"><ShieldOff :size="28" /></span>
      <h1>You don’t have access to this page</h1>
      <p>
        Your role does not include <code v-if="fromPage">{{ fromPage }}</code><template v-else>this page</template>.
        Ask HR or your administrator if you need it.
      </p>
      <div class="actions">
        <button type="button" class="btn ghost" @click="router.back()"><ArrowLeft :size="16" /> Go back</button>
        <NuxtLink v-if="firstAllowed" :to="firstAllowed" class="btn primary">Go to my portal</NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.no-access { display: grid; min-height: calc(100vh - 200px); place-items: center; padding: 16px; }
.card { max-width: 480px; padding: 32px 28px; border: 1px solid var(--border, #e6eaf0); border-radius: 14px; background: var(--bg-card, #fff); text-align: center; }
.icon { display: inline-grid; width: 58px; height: 58px; place-items: center; border-radius: 50%; background: var(--red-soft, #fff0f0); color: var(--red, #ef4444); }
h1 { margin: 14px 0 8px; font-size: 19px; }
p { margin: 0; color: var(--text-secondary, #667085); font-size: 13px; line-height: 1.6; }
code { padding: 1px 6px; border-radius: 5px; background: var(--bg-card-soft, #f8fafc); font-size: 12px; }
.actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 20px; }
.btn { display: inline-flex; align-items: center; gap: 6px; height: 40px; padding: 0 16px; border-radius: 9px; font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer; }
.btn.ghost { border: 1px solid var(--border, #e6eaf0); background: transparent; color: var(--text-primary, #172033); }
.btn.primary { border: 0; background: var(--primary, #246bfd); color: #fff; }
.btn:focus-visible { outline: 2px solid var(--primary, #246bfd); outline-offset: 2px; }
</style>
