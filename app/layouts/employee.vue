<script setup lang="ts">
import {
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const auth = useAuth()
const { displayName, email, initials } = useEmployeePortal()
const sidebarOpen = ref(false)

const navigation = [
  { label: 'Employee Portal', to: '/employee', icon: LayoutDashboard },
]

const logout = async () => {
  auth.clearSession()
  await router.replace('/auth/login')
}

watch(() => route.path, () => {
  sidebarOpen.value = false
})
</script>

<template>
  <div class="employee-shell">
    <aside :class="['employee-sidebar', { open: sidebarOpen }]">
      <div class="employee-brand">
        <img src="/logo-white.png" alt="RWorkCentral">
        <button type="button" aria-label="Close menu" @click="sidebarOpen = false">
          <X :size="19" />
        </button>
      </div>

      <p class="employee-sidebar__label">Employee workspace</p>

      <nav>
        <NuxtLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          :class="{ active: route.path === item.to }"
        >
          <component :is="item.icon" :size="18" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <div class="employee-account">
        <div class="employee-account__avatar">{{ initials }}</div>
        <div class="employee-account__details">
          <strong>{{ displayName }}</strong>
          <span>{{ email }}</span>
        </div>
        <button type="button" title="Sign out" @click="logout">
          <LogOut :size="17" />
        </button>
      </div>
    </aside>

    <div v-if="sidebarOpen" class="employee-backdrop" @click="sidebarOpen = false" />

    <main class="employee-main">
      <header class="employee-topbar">
        <button type="button" aria-label="Open menu" @click="sidebarOpen = true">
          <Menu :size="20" />
        </button>
        <span>Employee Self-Service</span>
      </header>

      <div class="employee-content">
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.employee-shell {
  display: grid;
  min-height: 100vh;
  grid-template-columns: 260px minmax(0, 1fr);
  background: #0c1422;
  color: #e2e8f0;
}

.employee-sidebar {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  height: 100vh;
  flex-direction: column;
  padding: 24px 18px;
  border-right: 1px solid #21304a;
  background: #101b2d;
}

.employee-brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.employee-brand img {
  width: 168px;
  height: 40px;
  object-fit: contain;
  object-position: left center;
}

.employee-brand button,
.employee-topbar button,
.employee-account button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
}

.employee-brand button,
.employee-topbar {
  display: none;
}

.employee-sidebar__label {
  margin: 34px 10px 12px;
  color: #60708a;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

nav {
  display: grid;
  gap: 5px;
}

nav a {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 11px 12px;
  border-radius: 9px;
  color: #9fb0c8;
  font-size: 13px;
  text-decoration: none;
}

nav a:hover,
nav a.active {
  background: #1a3769;
  color: #ffffff;
}

.employee-account {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) 30px;
  align-items: center;
  gap: 10px;
  margin-top: auto;
  padding: 14px 10px 0;
  border-top: 1px solid #21304a;
}

.employee-account__avatar {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 10px;
  background: #18366b;
  color: #73a7ff;
  font-size: 11px;
  font-weight: 700;
}

.employee-account__details {
  min-width: 0;
}

.employee-account__details strong,
.employee-account__details span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.employee-account__details strong {
  font-size: 11px;
}

.employee-account__details span {
  margin-top: 3px;
  color: #718099;
  font-size: 9px;
}

.employee-main {
  min-width: 0;
}

.employee-content {
  padding: 42px;
}

.employee-backdrop {
  display: none;
}

@media (max-width: 820px) {
  .employee-shell {
    display: block;
  }

  .employee-sidebar {
    position: fixed;
    left: 0;
    transform: translateX(-100%);
    width: 260px;
    transition: transform 0.2s ease;
  }

  .employee-sidebar.open {
    transform: translateX(0);
  }

  .employee-brand button,
  .employee-topbar {
    display: flex;
  }

  .employee-topbar {
    height: 60px;
    align-items: center;
    gap: 12px;
    padding: 0 20px;
    border-bottom: 1px solid #21304a;
    background: #101b2d;
    font-size: 12px;
    font-weight: 600;
  }

  .employee-backdrop {
    position: fixed;
    inset: 0;
    z-index: 20;
    display: block;
    background: rgb(2 8 23 / 65%);
  }

  .employee-content {
    padding: 28px 20px;
  }
}
</style>
