<!-- employee layout -->
<script setup lang="ts">
import '~/assets/css/employee-theme.css'
import {
  LayoutDashboard,
  Clock3,
  TimerReset,
  ClipboardCheck,
  WalletCards,
  CalendarDays,
  ChevronDown,
  LogOut,
  MoreHorizontal,
  UserRound,
  Landmark,
  X,
  Moon,
  Sun,
  Building2,
} from 'lucide-vue-next'

const route = useRoute()
const auth = useAuth()
const moreDialog = ref<HTMLDialogElement | null>(null)
const moreOpen = ref(false)

const openMore = () => {
  moreDialog.value?.showModal()
  moreOpen.value = true
}

const closeMore = () => {
  moreDialog.value?.close()
  moreOpen.value = false
}

const moreActive = computed(() =>
  ['/employee/profile', '/employee/leave-credit', '/employee/loans']
    .includes(route.path)
)

const isDark = ref(false)
const requestsOpen = ref(route.path === '/employee/requests')

const requestLinks = [
  { label: 'Leave', category: 'leave', icon: CalendarDays },
  { label: 'Undertime', category: 'undertime', icon: Clock3 },
  { label: 'Overtime', category: 'overtime', icon: TimerReset },
]

const selectedRequestCategory = computed(() => ['undertime', 'overtime'].includes(String(route.query.category)) ? String(route.query.category) : 'leave')
const { profile, displayName, initials } = useEmployeePortal()

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/employee' },
  { label: 'Attendance', icon: Clock3, to: '/employee/attendance' },
  { label: 'Leave Credits', icon: CalendarDays, to: '/employee/leave-credit' },
  { label: 'Requests', icon: ClipboardCheck, to: '/employee/requests' },
  { label: 'Payslips', icon: WalletCards, to: '/employee/payslips' },
  { label: 'Loans', icon: Landmark, to: '/employee/loans' },
]

const bottomItems = [
  { label: 'Home', icon: LayoutDashboard, to: '/employee' },
  { label: 'Attendance', icon: Clock3, to: '/employee/attendance' },
  { label: 'Requests', icon: ClipboardCheck, to: '/employee/requests' },
  { label: 'Payslips', icon: WalletCards, to: '/employee/payslips' },
]

const applyTheme = () => {
  document.documentElement.classList.toggle('dark', isDark.value)
  try {
    localStorage.setItem('rworkcentral-employee-theme', isDark.value ? 'dark' : 'light')
  } catch {
    // Theme still works without storage.
  }
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  applyTheme()
}

const signOut = async () => {
  closeMore()
  auth.clearSession()
  await navigateTo('/')
}

let mobileQuery: MediaQueryList | undefined
const onViewportChange = (event: MediaQueryListEvent) => {
  if (!event.matches) closeMore()
}

onMounted(() => {
  mobileQuery = window.matchMedia('(max-width: 850px)')
  mobileQuery.addEventListener('change', onViewportChange)
  try {
    const theme = localStorage.getItem('rworkcentral-employee-theme')
    isDark.value = theme ? theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    isDark.value = false
  }
  applyTheme()
})

onBeforeUnmount(() => {
  mobileQuery?.removeEventListener('change', onViewportChange)
  closeMore()
})

watch(() => route.fullPath, () => {
  closeMore()
  if (route.path === '/employee/requests') requestsOpen.value = true
})
</script>

<template>
  <div class="employee-shell">
    <aside class="sidebar" aria-label="Employee navigation">
      <div class="brand">
        <NuxtLink to="/employee" aria-label="Employee dashboard">
          <img src="/logo-white.png" alt="RWorkCentral">
        </NuxtLink>
      </div>
      <div class="sidebar-content">
        <p class="menu-section-title">Employee Workspace</p>
        <nav class="sidebar-menu">
          <template v-for="item in menuItems" :key="item.to">
            <div v-if="item.to === '/employee/requests'" class="request-menu">
              <button
                type="button"
                class="menu-link"
                :class="{ 'request-parent-active': route.path === item.to }"
                :aria-expanded="requestsOpen"
                aria-controls="employee-request-submenu"
                @click="requestsOpen = !requestsOpen"
              >
                <component :is="item.icon" :size="19" :stroke-width="1.9" />
                <span>{{ item.label }}</span>
                <ChevronDown :size="16" class="submenu-chevron" :class="{ expanded: requestsOpen }" />
              </button>
              <div v-show="requestsOpen" id="employee-request-submenu" class="request-submenu">
                <NuxtLink
                  v-for="link in requestLinks"
                  :key="link.category"
                  :to="{ path: '/employee/requests', query: { category: link.category } }"
                  class="menu-link submenu-link"
                  :class="{ active: route.path === item.to && selectedRequestCategory === link.category }"
                  :aria-current="route.path === item.to && selectedRequestCategory === link.category ? 'page' : undefined"
                >
                  <component :is="link.icon" :size="16" />
                  <span>{{ link.label }}</span>
                </NuxtLink>
              </div>
            </div>
            <NuxtLink
              v-else
              :to="item.to"
              class="menu-link"
              :class="{ active: route.path === item.to }"
              :aria-current="route.path === item.to ? 'page' : undefined"
            >
              <component :is="item.icon" :size="19" :stroke-width="1.9" />
              <span>{{ item.label }}</span>
            </NuxtLink>
          </template>
        </nav>
      </div>

      <button class="menu-link sign-out" @click="signOut">
        <LogOut :size="19" />
        <span>Sign Out</span>
      </button>

      <NuxtLink to="/employee/profile" class="sidebar-user">
        <img
          v-if="profile.profilePhotoUrl"
          :src="profile.profilePhotoUrl"
          alt="Avatar"
          class="user-avatar-img"
        >
        <span v-else class="user-avatar">{{ initials }}</span>
        <span class="user-info">
          <strong>{{ displayName }}</strong>
          <small>Employee · {{ profile.department }}</small>
        </span>
      </NuxtLink>
    </aside>

    <div class="main-area">
      <header class="topbar">
        <div class="topbar-left">
          <strong>Employee Portal</strong>
        </div>
        <div class="topbar-right">
          <button
            class="icon-button"
            :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            @click="toggleTheme"
          >
            <Sun v-if="isDark" :size="20" />
            <Moon v-else :size="20" />
          </button>
          <span class="topbar-separator" />
          <div class="company-selector">
            <span class="company-icon"><Building2 :size="18" /></span>
            <span class="company-info">
              <strong>RWorkCentral Inc.</strong>
              <small>Main Branch</small>
            </span>
          </div>
        </div>
      </header>

      <main class="page-content">
        <slot />
      </main>
    </div>

    <nav class="mobile-bottom-nav" aria-label="Employee mobile navigation">
      <NuxtLink
        v-for="item in bottomItems"
        :key="item.to"
        :to="item.to"
        class="bottom-link"
        :class="{ selected: route.path === item.to }"
        :aria-current="route.path === item.to ? 'page' : undefined"
      >
        <component :is="item.icon" :size="21" :stroke-width="1.9" />
        <span>{{ item.label }}</span>
      </NuxtLink>
      <button
        type="button"
        class="bottom-link"
        :class="{ selected: moreActive || moreOpen }"
        aria-haspopup="dialog"
        aria-controls="employee-mobile-more"
        :aria-expanded="moreOpen"
        @click="openMore"
      >
        <MoreHorizontal :size="21" />
        <span>More</span>
      </button>
    </nav>

    <dialog
      id="employee-mobile-more"
      ref="moreDialog"
      class="mobile-more-sheet"
      aria-labelledby="mobile-more-title"
      @close="moreOpen = false"
      @click="($event.target === moreDialog) && closeMore()"
    >
      <div class="sheet-header">
        <div>
          <h2 id="mobile-more-title">Your Workspace</h2>
          <p>{{ displayName }}</p>
        </div>
        <button type="button" class="icon-button" aria-label="Close more navigation" @click="closeMore">
          <X :size="21" />
        </button>
      </div>
      <nav class="sheet-links" aria-label="More employee pages">
        <NuxtLink
            to="/employee/leave-credit"
            :aria-current="route.path === '/employee/leave-credit' ? 'page' : undefined"
            @click="closeMore"
          >
            <CalendarDays :size="20" />
            <span>Leave Credits</span>
          </NuxtLink>

        <NuxtLink to="/employee/loans" :aria-current="route.path === '/employee/loans' ? 'page' : undefined" @click="closeMore">
          <Landmark :size="20" />
          <span>Loans</span>
        </NuxtLink>
        <NuxtLink to="/employee/profile" :aria-current="route.path === '/employee/profile' ? 'page' : undefined" @click="closeMore">
          <UserRound :size="20" />
          <span>Profile</span>
        </NuxtLink>
      </nav>
      <button type="button" class="sheet-sign-out" @click="signOut">
        <LogOut :size="20" />
        <span>Sign Out</span>
      </button>
    </dialog>
  </div>
</template>

<style scoped>
.employee-shell { min-height: 100vh; background: var(--bg-main); }
.sidebar { position: fixed; inset: 0 auto 0 0; z-index: 50; display: flex; width: 264px; flex-direction: column; background: linear-gradient(180deg, #062f6c 0%, #06285d 55%, #041f4c 100%); color: white; }
.brand { display: flex; height: 88px; align-items: center; padding: 0 18px; flex-shrink: 0; }
.brand a { display: flex; align-items: center; flex: 1; }
.brand img { width: 150px; max-width: 100%; height: 46px; object-fit: contain; object-position: left center; }
.sidebar-content { flex: 1; overflow-y: auto; padding: 14px 12px 20px; }
.menu-section-title { margin: 10px 10px 8px; color: #8eacd0; font-size: 10px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; }
.sidebar-menu { display: flex; flex-direction: column; gap: 3px; }
.submenu-chevron { margin-left: auto; transition: transform .18s ease; }
.submenu-chevron.expanded { transform: rotate(180deg); }
.request-parent-active { color: white; background: rgba(255, 255, 255, .07); }
.request-submenu { display: flex; flex-direction: column; gap: 3px; margin: 5px 0 7px 22px; padding-left: 8px; border-left: 1px solid rgba(255, 255, 255, .15); }
.submenu-link { min-height: 38px; font-size: 12px; }
.menu-link:focus-visible { outline: 2px solid #bdd4ff; outline-offset: -2px; }
.menu-link { display: flex; min-height: 44px; align-items: center; gap: 12px; width: 100%; padding: 0 13px; border: 0; border-radius: 9px; background: transparent; color: #d5e2f3; font-size: 13px; font-weight: 500; text-align: left; transition: background .18s ease; }
.menu-link:hover { background: rgba(255, 255, 255, .07); color: white; }
.menu-link.active { background: linear-gradient(90deg, #1e6df3, #327cff); color: white; box-shadow: 0 5px 14px rgba(12, 86, 212, .25); }
.sign-out { width: calc(100% - 24px); margin: 0 12px; flex-shrink: 0; }
.sidebar-user { display: flex; align-items: center; gap: 10px; margin: 12px; padding: 12px; border: 1px solid rgba(255, 255, 255, .12); border-radius: 11px; background: rgba(255, 255, 255, .045); }
.user-avatar { display: flex; width: 37px; height: 37px; flex-shrink: 0; align-items: center; justify-content: center; border-radius: 50%; background: linear-gradient(135deg, #ddeaff, #b8d1ff); color: #164b9b; font-size: 12px; font-weight: 700; }
.user-avatar-img { width: 37px; height: 37px; aspect-ratio: 1 / 1; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 1.5px solid rgba(255, 255, 255, .35); }
.user-info { min-width: 0; flex: 1; }
.user-info strong, .user-info small { display: block; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.user-info strong { font-size: 12px; font-weight: 600; }
.user-info small { margin-top: 2px; color: #9eb9da; font-size: 10px; }
.main-area { min-width: 0; min-height: 100vh; margin-left: 264px; }
.topbar { position: sticky; top: 0; z-index: 30; display: flex; height: 68px; align-items: center; justify-content: space-between; padding: 0 28px; border-bottom: 1px solid var(--border); background: color-mix(in srgb, var(--bg-card) 94%, transparent); backdrop-filter: blur(15px); }
.topbar-left, .topbar-right { display: flex; align-items: center; gap: 10px; }
.topbar-left > strong { font-size: 14px; }
.icon-button { display: flex; width: 39px; height: 39px; align-items: center; justify-content: center; border: 1px solid transparent; border-radius: 9px; background: transparent; color: var(--text-secondary); cursor: pointer; }
.icon-button:hover { background: var(--bg-card-soft); color: var(--text-primary); }
.topbar-separator { width: 1px; height: 25px; margin: 0 5px; background: var(--border); }
.company-selector { display: flex; align-items: center; gap: 9px; padding: 5px 8px; }
.company-icon { display: flex; width: 34px; height: 34px; align-items: center; justify-content: center; border-radius: 8px; background: var(--primary-soft); color: var(--primary); }
.company-info strong, .company-info small { display: block; }
.company-info strong { font-size: 11px; }
.company-info small { margin-top: 2px; font-size: 9px; color: var(--text-secondary); }
.page-content { min-width: 0; min-height: calc(100vh - 68px); padding: 28px; }
.mobile-bottom-nav { display: none; }
.mobile-more-sheet { width: 100%; max-width: 520px; max-height: calc(100dvh - 32px); margin: auto auto 0; padding: 20px 20px calc(20px + env(safe-area-inset-bottom, 0px)); border: 1px solid var(--border); border-bottom: 0; border-radius: 22px 22px 0 0; background: var(--bg-card); color: var(--text-primary); box-shadow: 0 -12px 48px #0002; overscroll-behavior: contain; box-sizing: border-box; }
.mobile-more-sheet::backdrop { background: #04152d80; }
.sheet-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
.sheet-header h2 { font-size: 17px; margin: 0; }
.sheet-header p { font-size: 12px; color: var(--text-secondary); margin: 6px 0 0; }
.sheet-links { display: grid; gap: 5px; }
.sheet-links a, .sheet-sign-out { display: flex; align-items: center; gap: 13px; min-height: 48px; padding: 10px 13px; border-radius: 10px; font-size: 13px; box-sizing: border-box; }
.sheet-links a { color: var(--text-primary); }
.sheet-links a svg { color: var(--primary); }
.sheet-links a:hover, .sheet-links a[aria-current='page'] { color: var(--primary); background: var(--primary-soft); }
.sheet-section-title { margin: 20px 13px 8px; color: var(--text-secondary); font-size: 10px; letter-spacing: 1px; text-transform: uppercase; }
.sheet-sign-out { width: 100%; margin-top: 18px; border: 1px solid var(--border); background: var(--red-soft); color: var(--red); text-align: left; cursor: pointer; }
.sheet-links a:focus-visible, .sheet-sign-out:focus-visible, .bottom-link:focus-visible { outline: 2px solid var(--primary); outline-offset: -3px; }
:global(html:has(.mobile-more-sheet[open])) { overflow: hidden; }

@media (max-width: 850px) {
  .sidebar { display: none; }
  .main-area { margin-left: 0; }
  .topbar { padding: 0 18px; }
  .page-content { padding: 20px 20px calc(96px + env(safe-area-inset-bottom, 0px)); }
  .mobile-bottom-nav { position: fixed; inset: auto 0 0; z-index: 50; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 2px; padding: 6px max(6px, env(safe-area-inset-right, 0px)) calc(6px + env(safe-area-inset-bottom, 0px)) max(6px, env(safe-area-inset-left, 0px)); border-top: 1px solid var(--border); background: var(--bg-card); box-shadow: 0 -4px 20px #00000009; }
  .bottom-link { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; min-width: 0; min-height: 56px; padding: 6px 2px; border: 0; border-radius: 10px; background: transparent; color: var(--text-secondary); font-family: inherit; font-size: 10px; font-weight: 500; text-decoration: none; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  .bottom-link.selected { color: var(--primary); background: var(--primary-soft); }
  .bottom-link svg { flex-shrink: 0; }
  :global(html) { scroll-padding-bottom: calc(90px + env(safe-area-inset-bottom, 0px)); }
}

@media (max-width: 550px) {
  .company-info, .topbar-separator { display: none; }
  .topbar { padding: 0 12px; }
  .page-content { padding: 15px 15px calc(90px + env(safe-area-inset-bottom, 0px)); }
}
</style>
