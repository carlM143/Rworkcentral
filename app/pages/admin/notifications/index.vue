<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { CheckCheck, RefreshCw } from 'lucide-vue-next'
import BaseTableFooter from '~/components/shared-table/BaseTableFooter.vue'
import {
  LEVEL_TONE,
  NOTIFICATION_CATEGORIES,
  notificationIcon,
  timeAgo,
  useNotifications,
  type AppNotification,
  type NotificationPage,
} from '~/composables/admin/notifications/useNotifications'

definePageMeta({
  layout: 'admin',
})

const router = useRouter()
const { unreadCount, list, markRead, markAllRead, loadSummary } = useNotifications()

// =====================================================
// FILTERS
// =====================================================

const show = ref<'all' | 'unread'>('all')
const category = ref('')
const currentPage = ref(1)
const PER_PAGE = 20

const categories = computed(() => [
  { value: '', label: 'All types' },
  ...Object.entries(NOTIFICATION_CATEGORIES).map(([value, c]) => ({ value, label: c.label })),
])

// =====================================================
// DATA
// =====================================================

const items = ref<AppNotification[]>([])
const meta = ref<NotificationPage['meta']>({ current_page: 1, last_page: 1, per_page: PER_PAGE, total: 0, from: 0, to: 0 })
const loading = ref(false)
const loadError = ref('')
let requestId = 0

const load = async () => {
  const id = ++requestId
  loading.value = true
  loadError.value = ''
  try {
    const response = await list({
      page: currentPage.value,
      per_page: PER_PAGE,
      category: category.value,
      unread: show.value === 'unread',
    })
    if (id !== requestId) return
    items.value = response.data
    meta.value = response.meta
    unreadCount.value = response.unread_count
  } catch {
    if (id === requestId) loadError.value = 'Unable to load notifications.'
  } finally {
    if (id === requestId) loading.value = false
  }
}

onMounted(load)

watch([show, category], () => {
  if (currentPage.value !== 1) currentPage.value = 1
  else load()
})

watch(currentPage, load)

// =====================================================
// ACTIONS
// =====================================================

const openItem = async (item: AppNotification) => {
  try {
    await markRead(item)
  } catch {
    // Still navigate.
  }
  if (item.url) await router.push(item.url)
}

const readAll = async () => {
  await markAllRead()
  items.value = items.value.map(n => ({ ...n, read: true }))
  if (show.value === 'unread') await load()
  void loadSummary()
}

// Group by day: Today, Yesterday, or the date.
const groups = computed(() => {
  const label = (iso: string) => {
    const d = new Date(iso)
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(today.getDate() - 1)
    if (d.toDateString() === today.toDateString()) return 'Today'
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(d)
  }

  const map = new Map<string, AppNotification[]>()
  for (const item of items.value) {
    const key = label(item.created_at)
    map.set(key, [...(map.get(key) ?? []), item])
  }
  return [...map.entries()].map(([heading, list]) => ({ heading, list }))
})
</script>

<template>
  <section class="notifications-page">
    <PageHeader title="Notifications" description="Requests, approvals, salary, trips and drivers activity for your account.">
      <AppButton variant="secondary" :icon="RefreshCw" :disabled="loading" @click="load">Refresh</AppButton>
      <AppButton :icon="CheckCheck" :disabled="!unreadCount" @click="readAll">Mark all as read</AppButton>
    </PageHeader>

    <div class="filters-row">
      <div class="segmented" role="group" aria-label="Show">
        <button type="button" :class="{ active: show === 'all' }" :aria-pressed="show === 'all'" @click="show = 'all'">All</button>
        <button type="button" :class="{ active: show === 'unread' }" :aria-pressed="show === 'unread'" @click="show = 'unread'">
          Unread <span v-if="unreadCount" class="count">{{ unreadCount }}</span>
        </button>
      </div>

      <select v-model="category" class="select" aria-label="Type">
        <option v-for="c in categories" :key="c.value" :value="c.value">{{ c.label }}</option>
      </select>
    </div>

    <p v-if="loadError" class="load-error" role="alert">
      {{ loadError }} <button type="button" @click="load">Retry</button>
    </p>

    <section class="list-card">
      <div v-if="loading && !items.length" class="list-state">Loading notifications...</div>
      <div v-else-if="!items.length" class="list-state">
        <strong>{{ show === 'unread' ? 'No unread notifications' : 'No notifications yet' }}</strong>
        <span>New requests, approvals and trip updates will appear here.</span>
      </div>

      <div v-else :class="{ dimmed: loading }">
        <section v-for="group in groups" :key="group.heading" class="day-group">
          <h2 class="day-heading">{{ group.heading }}</h2>
          <ul class="item-list">
            <li v-for="item in group.list" :key="item.id">
              <button type="button" class="item" :class="{ unread: !item.read }" @click="openItem(item)">
                <span class="icon" :class="`tone-${LEVEL_TONE[item.level] ?? 'blue'}`">
                  <component :is="notificationIcon(item.category)" :size="17" />
                </span>
                <span class="text">
                  <strong>{{ item.title }}</strong>
                  <span>{{ item.message }}</span>
                </span>
                <span class="meta">
                  <small>{{ timeAgo(item.created_at) }}</small>
                  <small v-if="item.actor">by {{ item.actor }}</small>
                </span>
                <span v-if="!item.read" class="dot" aria-label="Unread" />
              </button>
            </li>
          </ul>
        </section>
      </div>
    </section>

    <BaseTableFooter
      v-model="currentPage"
      :showing-from="meta.from"
      :showing-to="meta.to"
      :total-items="meta.total"
      :total-pages="meta.last_page"
      item-label="notifications"
    />
  </section>
</template>

<style scoped>
.notifications-page { width: 100%; max-width: 1100px; margin: 0 auto; }

.filters-row { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin: 18px 0; }

.segmented { display: inline-flex; padding: 3px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-card); }

.segmented button {
  display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 14px; border: 0; border-radius: 7px;
  background: transparent; color: var(--text-secondary); font-family: inherit; font-size: 12px; font-weight: 600; cursor: pointer;
}

.segmented button.active { background: var(--primary-soft); color: var(--text-primary); }
.segmented .count { padding: 1px 7px; border-radius: 999px; background: var(--primary); color: #fff; font-size: 10px; }

.select {
  height: 40px; min-width: 170px; padding: 0 12px; border: 1px solid var(--border); border-radius: 9px;
  background: var(--bg-card); color: var(--text-primary); font-family: inherit; font-size: 12px;
}

.segmented button:focus-visible, .select:focus-visible, .item:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }

.load-error { margin: 0 0 14px; padding: 10px 12px; border-radius: 9px; background: var(--red-soft); color: var(--red); font-size: 13px; }
.load-error button { margin-left: 8px; border: 0; background: transparent; color: var(--primary); font-family: inherit; cursor: pointer; }

.list-card { overflow: hidden; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
.list-state { display: flex; min-height: 200px; flex-direction: column; align-items: center; justify-content: center; gap: 6px; color: var(--text-muted); font-size: 13px; }
.list-state strong { color: var(--text-primary); font-size: 15px; }
.dimmed { opacity: 0.6; }

.day-heading { margin: 0; padding: 10px 18px; background: var(--bg-card-soft); color: var(--text-primary); font-size: 12px; font-weight: 700; }

.item-list { margin: 0; padding: 0; list-style: none; }

.item {
  display: flex; width: 100%; align-items: center; gap: 12px; padding: 13px 18px; border: 0; border-top: 1px solid var(--border-soft);
  background: transparent; color: inherit; font-family: inherit; text-align: left; cursor: pointer;
}

.item:hover { background: var(--bg-card-soft); }
.item.unread { background: color-mix(in srgb, var(--primary-soft) 40%, transparent); }

.icon { display: flex; width: 36px; height: 36px; flex-shrink: 0; align-items: center; justify-content: center; border-radius: 50%; }
.tone-blue { background: var(--primary-soft); color: var(--primary); }
.tone-green { background: var(--green-soft); color: var(--green); }
.tone-orange { background: var(--orange-soft); color: var(--orange); }
.tone-red { background: var(--red-soft); color: var(--red); }

.text { min-width: 0; flex: 1; }
.text strong { display: block; color: var(--text-primary); font-size: 13px; }
.text span { display: block; margin-top: 3px; color: var(--text-secondary); font-size: 12px; line-height: 1.45; }

.meta { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; color: var(--text-muted); white-space: nowrap; }
.meta small { font-size: 11px; }

.dot { width: 8px; height: 8px; flex-shrink: 0; border-radius: 50%; background: var(--primary); }

@media (max-width: 640px) {
  .item { flex-wrap: wrap; }
  .meta { width: 100%; flex-direction: row; gap: 8px; padding-left: 48px; }
}
</style>