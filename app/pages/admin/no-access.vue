<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft, ShieldOff } from 'lucide-vue-next'
import { ADMIN_MENU } from '~/utils/adminAccess'

definePageMeta({
  layout: 'admin',
})

const router = useRouter()
const route = useRoute()
const { canAny } = useAuth()

// First page this user can open, to offer a way forward.
const firstAllowed = computed(() => {
  for (const item of ADMIN_MENU) {
    if (item.to && item.access && canAny(item.access.module, item.access.names)) return item
    const child = item.children?.find(c => canAny(c.access.module, c.access.names))
    if (child) return child
  }
  return null
})

const fromPage = computed(() => (typeof route.query.from === 'string' && route.query.from !== 'dashboard' ? route.query.from : ''))
</script>

<template>
  <section class="no-access">
    <div class="card">
      <span class="icon"><ShieldOff :size="28" /></span>
      <h1>You don’t have access to this page</h1>
      <p>
        Your role does not include permission to open
        <code v-if="fromPage">{{ fromPage }}</code><template v-else>this page</template>.
        Ask your administrator to update your role in Settings › Users & Access › Roles & Permissions.
      </p>
      <div class="actions">
        <AppButton variant="secondary" :icon="ArrowLeft" @click="router.back()">Go back</AppButton>
        <AppButton v-if="firstAllowed" @click="router.push(firstAllowed.to!)">Open {{ firstAllowed.label }}</AppButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.no-access { display: grid; min-height: calc(100vh - 160px); place-items: center; }
.card { max-width: 520px; padding: 36px 32px; border: 1px solid var(--border); border-radius: 14px; background: var(--bg-card); text-align: center; }
.icon { display: inline-grid; width: 60px; height: 60px; place-items: center; border-radius: 50%; background: var(--red-soft); color: var(--red); }
h1 { margin: 16px 0 8px; font-size: 20px; }
p { margin: 0; color: var(--text-secondary); font-size: 13px; line-height: 1.6; }
code { padding: 1px 6px; border-radius: 5px; background: var(--bg-card-soft); color: var(--text-primary); font-size: 12px; }
.actions { display: flex; justify-content: center; gap: 10px; margin-top: 22px; }
</style>
