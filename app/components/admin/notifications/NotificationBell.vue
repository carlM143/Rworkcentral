<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Bell, CheckCheck } from 'lucide-vue-next'
import {
  LEVEL_TONE,
  notificationIcon,
  timeAgo,
  useNotifications,
  type AppNotification,
} from '~/composables/admin/notifications/useNotifications'

/**
 * Bell in the top bar: unread count, and the latest notifications in a
 * dropdown. Shares its data with the dashboard card and View all page.
 */
const router = useRouter()
const { unreadCount, latest, loaded, error, loadSummary, markRead, markAllRead, startPolling, stopPolling } = useNotifications()

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)

const toggle = async () => {
  open.value = !open.value
  if (open.value) await loadSummary()
}

const close = () => {
  open.value = false
}

const openItem = async (item: AppNotification) => {
  close()
  try {
    await markRead(item)
  } catch {
    // Reading should still navigate even if marking fails.
  }
  if (item.url) await router.push(item.url)
}

const viewAll = async () => {
  close()
  await router.push('/admin/notifications')
}

const onClickOutside = (event: MouseEvent) => {
  if (rootRef.value && !rootRef.value.contains(event.target as Node)) close()
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') close()
}

onMounted(() => {
  void loadSummary()
  startPolling()
  document.addEventListener('click', onClickOutside)
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  stopPolling()
  document.removeEventListener('click', onClickOutside)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div ref="rootRef" class="bell-wrap">
    <button
      type="button"
      class="icon-button notification-button"
      :aria-label="unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'"
      :aria-expanded="open"
      aria-haspopup="true"
      @click.stop="toggle"
    >
      <Bell :size="20" />
      <span v-if="unreadCount" class="notification-count">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
    </button>

    <Transition name="bell-dropdown">
      <section v-if="open" class="bell-panel" role="dialog" aria-label="Notifications" @click.stop>
        <header class="bell-head">
          <div>
            <strong>Notifications</strong>
            <span>{{ unreadCount ? `${unreadCount} unread` : 'All caught up' }}</span>
          </div>
          <button v-if="unreadCount" type="button" class="link-btn" @click="markAllRead()">
            <CheckCheck :size="14" /> Mark all as read
          </button>
        </header>

        <p v-if="error && !loaded" class="bell-empty">{{ error }}</p>
        <p v-else-if="!loaded" class="bell-empty">Loading...</p>
        <p v-else-if="!latest.length" class="bell-empty">No notifications yet.</p>

        <ul v-else class="bell-list">
          <li v-for="item in latest" :key="item.id">
            <button type="button" class="bell-item" :class="{ unread: !item.read }" @click="openItem(item)">
              <span class="bell-icon" :class="`tone-${LEVEL_TONE[item.level] ?? 'blue'}`">
                <component :is="notificationIcon(item.category)" :size="16" />
              </span>
              <span class="bell-text">
                <strong>{{ item.title }}</strong>
                <span class="msg">{{ item.message }}</span>
                <small>{{ timeAgo(item.created_at) }}<template v-if="item.actor"> · {{ item.actor }}</template></small>
              </span>
              <span v-if="!item.read" class="dot" aria-label="Unread" />
            </button>
          </li>
        </ul>

        <footer class="bell-foot">
          <button type="button" class="link-btn" @click="viewAll">View all notifications</button>
        </footer>
      </section>
    </Transition>
  </div>
</template>

<style scoped>
.bell-wrap { position: relative; }

.icon-button {
  position: relative; display: flex; width: 39px; height: 39px; align-items: center; justify-content: center;
  border: 1px solid transparent; border-radius: 9px; background: transparent; color: var(--text-secondary); cursor: pointer;
}

.icon-button:hover { background: var(--bg-card-soft); color: var(--text-primary); }
.icon-button:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }

.notification-count {
  position: absolute; top: 2px; right: 1px; display: flex; min-width: 17px; height: 17px; align-items: center; justify-content: center;
  padding: 0 3px; border: 2px solid var(--bg-card); border-radius: 100px; background: #ef4444; color: white; font-size: 8px; font-weight: 700;
}

.bell-panel {
  position: absolute; top: calc(100% + 9px); right: 0; z-index: 200; width: 370px; max-width: calc(100vw - 24px);
  overflow: hidden; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); box-shadow: 0 18px 45px rgba(0, 0, 0, 0.25);
}

.bell-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 14px; border-bottom: 1px solid var(--border-soft); }
.bell-head strong { display: block; color: var(--text-primary); font-size: 13px; }
.bell-head span { display: block; margin-top: 2px; color: var(--text-muted); font-size: 11px; }

.link-btn {
  display: inline-flex; align-items: center; gap: 5px; border: 0; background: transparent; color: var(--primary);
  font-family: inherit; font-size: 11px; font-weight: 600; cursor: pointer;
}

.link-btn:focus-visible, .bell-item:focus-visible { outline: 2px solid var(--primary); outline-offset: -2px; }

.bell-empty { margin: 0; padding: 26px 14px; color: var(--text-muted); font-size: 12px; text-align: center; }

.bell-list { max-height: 380px; margin: 0; padding: 0; overflow-y: auto; list-style: none; }

.bell-item {
  display: flex; width: 100%; align-items: flex-start; gap: 10px; padding: 11px 14px; border: 0; border-bottom: 1px solid var(--border-soft);
  background: transparent; color: inherit; font-family: inherit; text-align: left; cursor: pointer;
}

.bell-item:hover { background: var(--bg-card-soft); }
.bell-item.unread { background: color-mix(in srgb, var(--primary-soft) 45%, transparent); }

.bell-icon { display: flex; width: 32px; height: 32px; flex-shrink: 0; align-items: center; justify-content: center; border-radius: 50%; }
.tone-blue { background: var(--primary-soft); color: var(--primary); }
.tone-green { background: var(--green-soft); color: var(--green); }
.tone-orange { background: var(--orange-soft); color: var(--orange); }
.tone-red { background: var(--red-soft); color: var(--red); }

.bell-text { min-width: 0; flex: 1; }
.bell-text strong { display: block; color: var(--text-primary); font-size: 12px; }
.bell-text .msg { display: -webkit-box; margin-top: 3px; overflow: hidden; color: var(--text-secondary); font-size: 11px; line-height: 1.4; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.bell-text small { display: block; margin-top: 4px; color: var(--text-muted); font-size: 10px; }

.dot { width: 7px; height: 7px; flex-shrink: 0; margin-top: 6px; border-radius: 50%; background: var(--primary); }

.bell-foot { padding: 10px 14px; text-align: center; }

.bell-dropdown-enter-active, .bell-dropdown-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.bell-dropdown-enter-from, .bell-dropdown-leave-to { opacity: 0; transform: translateY(-6px); }
</style>