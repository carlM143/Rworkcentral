<script setup lang="ts">
import {
  LayoutDashboard,
  Users,
  Clock3,
  Umbrella,
  WalletCards,
  HandCoins,
  Landmark,
  Truck,
  CalendarDays,
  House,
  CalendarClock,
  // ReceiptText,
  Building2,
  BarChart3,
  Settings,
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Moon,
  Sun,
  UserRound,
  BriefcaseBusiness,
  FileText,
  ClipboardCheck,
  MapPin,
  LogOut,
} from 'lucide-vue-next'
// import App from '~/app.vue'

const route = useRoute()
const router = useRouter()

const sidebarOpen = ref(false)
const isDark = ref(false)

const companyMenuOpen = ref(false)

const companyMenuRef =
  ref<HTMLElement | null>(null)

const openMenus = reactive<Record<string, boolean>>({
  employees: false,
  timekeeping: false,
  payroll: false,
  contributions: false,
  loans: false,
  drivers: false,
  leave: false,
  // overtime: false,
  departments: false,
  approvals: false,
  wfh: false,
  documents: false,
  'employee-lifecycle': false,
  reports: false,
})

const menuItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    to: '/admin',
  },

  {
    label: 'Employees',
    key: 'employees',
    icon: Users,
    children: [
      {
        label: 'Add New Employee',
        to: '/admin/employees/create-employee',
      },
      {
        label: 'Active Employees',
        to: '/admin/employees',
      },
      {
        label: 'Inactive Employees',
        to: '/admin/employees/inactive',
      }
    ],
  },

  // =====================================================
  // TIMEKEEPING
  // =====================================================
  {
    label: 'Timekeeping',
    key: 'timekeeping',
    icon: Clock3,
    children: [
       {
        label: 'Time Logs',
        to: '/admin/time-logs',
      },
      // {
      //   label: 'Overtime Requests',
      //   to: '/admin/timekeeping/overtime-requests',
      // },
      {
        label: 'Time Log Correction Requests',
        to: '/admin/timekeeping/time-log-correction-requests',
      },
      {
        label: 'Late Adjustment',
        to: '/admin/late-adjustment',
      },
      {
        label: 'Manual Time In / Out',
        to: '/admin/manual-time-in-out',
      },
      {
        label: 'Manage Trips',
        to: '/admin/manage-trips',
      },
      {
        label: 'Trip Tickets',
        to: '/admin/trip-tickets',
      },
      {
        label: 'Field Leaves',
        to: '/admin/filed-leaves',
      },
      {
        label: 'Switch Rest Day',
        to: '/admin/switch-rest-day',
      },
    ],
  },

  {
    label: 'Work Schedules',
    icon: CalendarClock,
    to: '/admin/work-schedules',
  },

  {
    label: 'Payroll',
    key: 'payroll',
    icon: WalletCards,
    children: [
      {
        label: 'Rates',
        to: '/admin/rates',
      },
      {
        label: 'Wage Adjustments',
        to: '/admin/payroll/wage-adjustments',
      },

      // PAY PERIODS
      {
        label: 'Driver Pay Periods',
        to: '/admin/driver-pay-periods',
      },
      {
        label: 'Employee Pay Periods',
        to: '/admin/employee-pay-periods',
      },
      // OLD SYSTEM PAYROLL SUBMENU
      {
        label: 'Pending Drivers Payroll',
        to: '/admin/pending-drivers-payroll',
      },
      {
        label: 'Completed Drivers Payroll',
        to: '/admin/completed-drivers-payroll',
      },
      {
        label: 'Pending Employees Payroll',
        to: '/admin/pending-employees-payroll',
      },
      {
        label: 'Completed Employees Payroll',
        to: '/admin/completed-employees-payroll',
      },

      {
        label: 'Employee Payroll',
        to: '/admin/employee-payroll',
      },
    ],
  },

  {
    label: 'Contributions',
    key: 'contributions',
    icon: Landmark,
    children: [
      {
        label: 'Contribution Types',
        to: '/admin/contribution/types',
      },
      {
        label: 'Contribution Rate',
        to: '/admin/contribution/rate-schedules',
      },
      {
        label: 'Contribution History',
        to: '/admin/contribution/rate-brackets',
      },
      {
        label: 'Contribution Settings',
        to: '/admin/contribution/deduction-settings',
      },
    ],
  },

  // =====================================================
  // LOANS
  // =====================================================
  {
    label: 'Loans',
    key: 'loans',
    icon: HandCoins,
    children: [
      { label: 'Loan Transactions', to: '/admin/loans/transactions' },
      { label: 'Loan Types', to: '/admin/loans/types' },
      { label: 'Employee Loans', to: '/admin/loans/employees' },
    ],
  },

  // =====================================================
  // ALL DRIVERS
  // =====================================================
  {
    label: 'All Drivers',
    key: 'drivers',
    icon: Truck,
    children: [
      { label: 'Drivers Directory', to: '/admin/drivers' },
      { label: 'Driver Pay Periods', to: '/admin/driver-pay-periods' },
      { label: 'Pending Drivers Payroll', to: '/admin/pending-drivers-payroll' },
      { label: 'Completed Drivers Payroll', to: '/admin/completed-drivers-payroll' },
    ],
  },

  // =====================================================
  // LEAVE
  // =====================================================
  {
  label: 'Leave Management',
  key: 'leave',
  icon: Umbrella,
  children: [
    {
      label: 'Leave Balances',
      to: '/admin/leave-balances',
    },
    {
      label: 'Leave Types',
      to: '/admin/leave-management/leave-types',
    },
    {
      label: 'Leave Policies',
      to: '/admin/leave-management/leave-policies',
    },
  ],
},

  {
    label: 'Holiday Leave',
    icon: CalendarDays,
    to: '/admin/holiday-leave',
  },

  {
    label: 'Departments',
    key: 'departments',
    icon: BriefcaseBusiness,
    children: [
      {
        label: 'Departments',
        to: '/admin/departments',
      },
      {
        label: 'Positions',
        to: '/admin/positions',
      },
      {
        label: 'Employment Types',
        to: '/admin/employment-types',
      },
      // Employee Assignment remains hidden until the route is needed.
      // {
      //   label: 'Employee Assignment',
      //   to: '/admin/department-assignments',
      // },
      {
        label: 'Employee Transfers',
        to: '/admin/employee-transfers',
      },
    ],
  },

  {
  label: 'Approval Center',
  key: 'approvals',
  icon: ClipboardCheck,
  children: [
    {
      label: 'Leave Approvals',
      to: '/admin/approvals/leaves',
    },
    {
      label: 'OT Approvals',
      to: '/admin/approvals/overtime',
    },
    {
      label: 'Undertime Approvals',
      to: '/admin/approvals/undertime',
    },
  ],
},

  // =====================================================
  // WFH (SEPARATE FRONTEND-ONLY MODULE)
  // =====================================================
  {
    label: 'Work From Home',
    key: 'wfh',
    icon: House,
    children: [
      { label: 'WFH Requests', to: '/admin/wfh/requests' },
      { label: 'WFH List', to: '/admin/wfh/list' },
      { label: 'WFH Attach Documents', to: '/admin/wfh/documents' },
    ],
  },

  // =====================================================
  // PERFORMANCE
  // =====================================================
  {
    label: 'Evaluation Templates',
    icon: ClipboardCheck,
    to: '/admin/performance/templates',
  },

  {
  label: 'Employee Lifecycle',
  key: 'employee-lifecycle',
  icon: UserRound,
  children: [

    {
      label: 'Onboarding',
      to: '/admin/employee-lifecycle/onboarding',
    },
    {
      label: 'Regularization',
      to: '/admin/employee-lifecycle/regularization',
    },
    {
      label: 'Employee Transfers',
      to: '/admin/employee-lifecycle/transfers',
    },
    {
      label: 'Promotions',
      to: '/admin/employee-lifecycle/promotions',
    },
    {
      label: 'Employment Changes',
      to: '/admin/employee-lifecycle/changes',
    },
    {
      label: 'Offboarding',
      to: '/admin/employee-lifecycle/offboarding',
    },
    {
      label: 'Lifecycle History',
      to: '/admin/employee-lifecycle/history',
    },
  ],
},

  // =====================================================
  // REPORTS
  // =====================================================
  {
    label: 'Reports & Analytics',
    key: 'reports',
    icon: BarChart3,
    children: [
      {
        label: 'Reports Center',
        to: '/admin/reports/center',
      },
      {
        label: 'Attendance Reports',
        to: '/admin/reports/attendance',
      },
      {
        label: 'Payroll Reports',
        to: '/admin/reports/payroll',
      },
      {
        label: '13th Month Pay',
        to: '/admin/13th-month-pay',
      },
      {
        label: 'SSS Report',
        to: '/admin/reports/sss',
      },
      {
        label: 'Pag-IBIG Report',
        to: '/admin/reports/pagibig',
      },
      {
        label: 'PhilHealth Report',
        to: '/admin/reports/philhealth',
      },
      {
        label: 'Wage Compliance',
        to: '/admin/reports/wage-compliance',
      },
    ],
  },
]

const toggleMenu = (key?: string) => {
  if (!key) return
  openMenus[key] = !openMenus[key]
}

const isRouteActive = (to?: string) => {
  if (!to) return false

  return route.path === to
}

const hasActiveChild = (
  children?: { to: string }[],
) => {
  return children?.some((child) => {
    if (route.path === child.to) {
      return true
    }

    if (
      child.to === '/admin/employees' &&
      route.path.startsWith('/admin/employees/')
    ) {
      return true
    }

    return false
  }) ?? false
}

const applyTheme = () => {
  if (!import.meta.client) return

  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('hris-theme', isDark.value ? 'dark' : 'light')
}

const toggleDarkMode = () => {
  isDark.value = !isDark.value
  applyTheme()
}

const toggleCompanyMenu = () => {
  companyMenuOpen.value =
    !companyMenuOpen.value
}

const closeCompanyMenu = () => {
  companyMenuOpen.value =
    false
}

const goToCompanySettings = async () => {
  closeCompanyMenu()

  await router.push(
    '/admin/settings',
  )
}

const handleAdminLogout = async () => {
  closeCompanyMenu()

  if (import.meta.client) {
    sessionStorage.removeItem(
      'rworkcentral-auth',
    )
  }

  await router.replace(
    '/auth/login',
  )
}

const handleClickOutside = (
  event: MouseEvent,
) => {
  const target =
    event.target as Node | null

  if (
    companyMenuRef.value &&
    target &&
    !companyMenuRef.value.contains(
      target,
    )
  ) {
    companyMenuOpen.value =
      false
  }
}

onMounted(() => {
  const savedTheme =
    localStorage.getItem(
      'hris-theme',
    )

  if (savedTheme) {
    isDark.value =
      savedTheme === 'dark'
  } else {
    isDark.value =
      window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches
  }

  applyTheme()

  menuItems.forEach(
    (item) => {
      if (
        item.key &&
        item.children &&
        hasActiveChild(
          item.children,
        )
      ) {
        openMenus[item.key] =
          true
      }
    },
  )

  document.addEventListener(
    'click',
    handleClickOutside,
  )
})

onBeforeUnmount(() => {
  document.removeEventListener(
    'click',
    handleClickOutside,
  )
})

</script>



<template>
  <div class="app-shell">

    <!-- =====================================================
         GLOBAL TOAST
    ====================================================== -->
    <ClientOnly>
      <AppToast />
    </ClientOnly>

    <!-- =====================================================
         MOBILE OVERLAY
    ====================================================== -->
    <Transition name="fade">
      <div
        v-if="sidebarOpen"
        class="sidebar-overlay"
        @click="sidebarOpen = false"
      />
    </Transition>

    <!-- =====================================================
         SIDEBAR
    ====================================================== -->
    <aside
      class="sidebar"
      :class="{ 'sidebar-mobile-open': sidebarOpen }"
    >
      <!-- BRAND -->
      <div class="brand">

  <NuxtLink
  to="/admin"
  class="brand-image-link"
  @click="sidebarOpen = false"
>
  <img
    src="/logo-white.png"
    alt="RWorkCentral"
    class="brand-image"
  >
</NuxtLink>

  <button
    class="mobile-close"
    type="button"
    @click="sidebarOpen = false"
  >
    <X :size="21" />
  </button>
      </div>

      <!-- =====================================================
           NAVIGATION
      ====================================================== -->
      <div class="sidebar-content">
        <p class="menu-section-title">
          Workspace
        </p>

        <nav class="sidebar-menu">
          <template
            v-for="item in menuItems"
            :key="item.label"
          >
            <!-- SIMPLE MENU -->
            <NuxtLink
              v-if="!item.children"
              :to="item.to"
              class="menu-link"
              :class="{
                active: isRouteActive(item.to),
              }"
              @click="sidebarOpen = false"
            >
              <component
                :is="item.icon"
                :size="19"
                :stroke-width="1.9"
              />

              <span>
                {{ item.label }}
              </span>
            </NuxtLink>

            <!-- MENU WITH SUBMENU -->
            <div
              v-else
              class="menu-group"
            >
              <button
                type="button"
                class="menu-link menu-button"
                :class="{
                  active: hasActiveChild(item.children),
                }"
                @click="toggleMenu(item.key)"
              >
                <component
                  :is="item.icon"
                  :size="19"
                  :stroke-width="1.9"
                />

                <span>
                  {{ item.label }}
                </span>

                <component
                  :is="
                    openMenus[item.key]
                      ? ChevronDown
                      : ChevronRight
                  "
                  class="menu-arrow"
                  :size="17"
                />
              </button>

              <Transition name="submenu">
                <div
                  v-show="openMenus[item.key]"
                  class="submenu"
                >
                  <NuxtLink
                    v-for="child in item.children"
                    :key="child.label"
                    :to="child.to"
                    class="submenu-link"
                    :class="{
                      active: isRouteActive(child.to),
                    }"
                    @click="sidebarOpen = false"
                  >
                    <span class="submenu-dot" />

                    {{ child.label }}
                  </NuxtLink>
                </div>
              </Transition>
            </div>
          </template>
        </nav>

        <!-- =====================================================
             SYSTEM
        ====================================================== -->
        <p class="menu-section-title system-label">
          System
        </p>

        <NuxtLink
          to="/admin/settings"
          class="menu-link"
          :class="{
            active: isRouteActive('/admin/settings'),
          }"
          @click="sidebarOpen = false"
        >
          <Settings
            :size="19"
            :stroke-width="1.9"
          />

          <span>
            Settings
          </span>
        </NuxtLink>

        <NuxtLink
          to="/admin/settings/compensation/wage-orders"
          class="menu-link"
          :class="{
            active:
              isRouteActive(
                '/admin/settings/compensation/wage-orders',
              ),
          }"
          @click="sidebarOpen = false"
        >
          <WalletCards
            :size="19"
            :stroke-width="1.9"
          />

          <span>
            Wage Orders
          </span>
        </NuxtLink>
      </div>

      <!-- =====================================================
           USER PROFILE
      ====================================================== -->
      <div class="sidebar-user">
        <div class="user-avatar">
          MS
        </div>

        <div class="sidebar-user-info">
          <strong>
            Maria Santos
          </strong>

          <span>
            HR Administrator
          </span>
        </div>

        <ChevronDown :size="17" />
      </div>
    </aside>

    <!-- =====================================================
         MAIN AREA
    ====================================================== -->
    <div class="main-area">

      <!-- =====================================================
           TOPBAR
      ====================================================== -->
      <header class="topbar">
        <div class="topbar-left">
          <!-- MOBILE MENU BUTTON -->
          <button
            type="button"
            class="icon-button menu-toggle"
            @click="sidebarOpen = true"
          >
            <Menu :size="21" />
          </button>

          <!-- SEARCH -->
          <div class="search-box">
            <Search
              :size="19"
              class="search-icon"
            />

            <input
              type="text"
              placeholder="Search employees, features..."
            >

            <kbd>
              ⌘ K
            </kbd>
          </div>
        </div>

       <!-- =====================================================
     TOPBAR RIGHT
====================================================== -->

<div class="topbar-right">

  <!-- =====================================================
       DARK MODE
  ====================================================== -->

  <button
    type="button"
    class="icon-button"
    :title="
      isDark
        ? 'Switch to light mode'
        : 'Switch to dark mode'
    "
    @click="
      toggleDarkMode
    "
  >

    <Sun
      v-if="isDark"
      :size="20"
    />

    <Moon
      v-else
      :size="20"
    />

  </button>

  <!-- =====================================================
       NOTIFICATION
  ====================================================== -->

  <button
    type="button"
    class="
      icon-button
      notification-button
    "
    title="Notifications"
  >

    <Bell
      :size="20"
    />

    <span class="notification-count">
      8
    </span>

  </button>

  <!-- SEPARATOR -->

  <div class="topbar-separator" />

  <!-- =====================================================
       COMPANY MENU
  ====================================================== -->

  <div
    ref="companyMenuRef"
    class="company-menu"
  >

    <!-- COMPANY BUTTON -->

    <button
      type="button"
      class="company-selector"
      :class="{
        'company-selector-open':
          companyMenuOpen,
      }"
      @click.stop="
        toggleCompanyMenu
      "
    >

      <div class="company-icon">

        <Building2
          :size="18"
        />

      </div>

      <div class="company-info">

        <strong>
          RWorkCentral Inc.
        </strong>

        <span>
          Main Branch
        </span>

      </div>

      <ChevronDown
        :size="16"
        class="company-chevron"
        :class="{
          rotated:
            companyMenuOpen,
        }"
      />

    </button>

    <!-- DROPDOWN -->

    <Transition name="company-dropdown">

      <div
        v-if="
          companyMenuOpen
        "
        class="company-dropdown"
        @click.stop
      >

        <!-- COMPANY HEADER -->

        <div class="company-dropdown-header">

          <div class="dropdown-company-logo">

            <Building2
              :size="18"
            />

          </div>

          <div>

            <strong>
              RWorkCentral Inc.
            </strong>

            <span>
              Main Branch
            </span>

          </div>

        </div>

        <div class="dropdown-divider" />

        <!-- ACCOUNT -->

        <button
          type="button"
          class="dropdown-item"
          @click="
            closeCompanyMenu
          "
        >

          <UserRound
            :size="16"
          />

          <div>

            <strong>
              My Account
            </strong>

            <span>
              Administrator profile
            </span>

          </div>

        </button>

        <!-- COMPANY SETTINGS -->

        <button
          type="button"
          class="dropdown-item"
          @click="
            goToCompanySettings
          "
        >

          <Settings
            :size="16"
          />

          <div>

            <strong>
              Company Settings
            </strong>

            <span>
              Company information
            </span>

          </div>

        </button>

        <!-- CURRENT BRANCH -->

        <button
          type="button"
          class="dropdown-item"
          @click="
            closeCompanyMenu
          "
        >

          <MapPin
            :size="16"
          />

          <div>

            <strong>
              Main Branch
            </strong>

            <span>
              Current branch
            </span>

          </div>

          <span class="current-badge">
            Current
          </span>

        </button>

        <div class="dropdown-divider" />

        <!-- LOGOUT -->

        <button
          type="button"
          class="
            dropdown-item
            logout-item
          "
          @click="
            handleAdminLogout
          "
        >
          <LogOut
            :size="16"
          />

          <div>

            <strong>
              Sign Out
            </strong>
            <span>
              Return to admin login
            </span>
          </div>
        </button>
      </div>
    </Transition>
  </div>
</div>
      </header>

      <!-- =====================================================
           PAGE CONTENT
      ====================================================== -->
      <main class="page-content">
        <slot />
      </main>

    </div>
  </div>
</template>

<style>
:root {
  color-scheme: light;

  --bg-main: #f5f7fb;
  --bg-card: #ffffff;
  --bg-card-soft: #f8fafc;
  --bg-sidebar: #062d67;
  --bg-sidebar-secondary: #073977;

  --text-primary: #172033;
  --text-secondary: #667085;
  --text-muted: #98a2b3;

  --border: #e6eaf0;
  --border-soft: #eff2f6;

  --primary: #246bfd;
  --primary-dark: #1657dd;
  --primary-soft: #edf4ff;

  --green: #16a663;
  --green-soft: #eaf8f1;

  --orange: #f59e0b;
  --orange-soft: #fff6df;

  --red: #ef4444;
  --red-soft: #fff0f0;

  --purple: #7c4dff;
  --purple-soft: #f2edff;

  --shadow:
    0 1px 2px rgba(16, 24, 40, 0.03),
    0 4px 16px rgba(16, 24, 40, 0.04);
}

html.dark {
  color-scheme: dark;

  --bg-main: #0d1421;
  --bg-card: #141d2c;
  --bg-card-soft: #192334;

  --text-primary: #f1f5f9;
  --text-secondary: #a9b4c4;
  --text-muted: #6f7d90;

  --border: #273448;
  --border-soft: #202d40;

  --primary-soft: #142950;

  --green-soft: #123326;
  --orange-soft: #3c2d12;
  --red-soft: #3a1d23;
  --purple-soft: #261e45;

  --shadow:
    0 1px 2px rgba(0, 0, 0, 0.12),
    0 8px 24px rgba(0, 0, 0, 0.16);
}

* {
  box-sizing: border-box;
}

html,
body,
#__nuxt {
  min-height: 100%;
  margin: 0;
}

html {
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

body {
  margin: 0;
  background: var(--bg-main);
  color: var(--text-primary);
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

button,
input {
  font: inherit;
}

button {
  cursor: pointer;
}

a {
  color: inherit;
  text-decoration: none;
}

.app-shell {
  min-height: 100vh;
  background: var(--bg-main);
}

/* =========================
   SIDEBAR
========================= */

.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 50;

  display: flex;
  width: 264px;
  flex-direction: column;

  background:
    linear-gradient(
      180deg,
      #062f6c 0%,
      #06285d 55%,
      #041f4c 100%
    );

  color: white;
}

.brand {
  display: flex;

  width: 100%;
  height: 88px;

  flex-shrink: 0;

  align-items: center;

  gap: 10px;

  padding: 0 18px;

  background: transparent;

  border-bottom: 0;
}

.brand-image-link {
  display: flex;

  width: 100%;
  min-width: 0;

  height: 100%;

  align-items: center;
  justify-content: flex-start;

  overflow: hidden;

  text-decoration: none;
}

.brand-image {
  display: block;

  width: 150px;
  max-width: 100%;

  height: 46px;

  object-fit: contain;
  object-position: left center;

  background: transparent;
}

.brand-logo {
  display: flex;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;

  border-radius: 11px;
  background:
    linear-gradient(
      135deg,
      #4f8cff,
      #1762ef
    );

  box-shadow:
    0 6px 18px rgba(16, 92, 240, 0.35);
}

.brand-text {
  min-width: 0;
}

.brand-text h1 {
  margin: 0;

  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.2px;
}

.brand-text span {
  display: block;
  margin-top: 2px;

  color: #bdd0ea;

  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.mobile-close {
  display: none;

  margin-left: auto;

  padding: 7px;

  border: 0;

  border-radius: 8px;

  background:
    rgba(255, 255, 255, 0.10);

  color: #ffffff;

  cursor: pointer;
}

.mobile-close:hover {
  background:
    rgba(255, 255, 255, 0.16);
}

.mobile-close:hover {
  background: #dce9ff;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;

  padding: 14px 12px 20px;
}

.sidebar-content::-webkit-scrollbar {
  width: 5px;
}

.sidebar-content::-webkit-scrollbar-thumb {
  border-radius: 100px;
  background: rgba(255, 255, 255, 0.18);
}

.menu-section-title {
  margin: 10px 10px 8px;

  color: #8eacd0;

  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
}

.system-label {
  margin-top: 24px;
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.menu-link {
  position: relative;

  display: flex;
  min-height: 44px;
  align-items: center;
  gap: 12px;

  width: 100%;
  padding: 0 13px;

  border: 0;
  border-radius: 9px;

  background: transparent;
  color: #d5e2f3;

  font-size: 13px;
  font-weight: 500;

  transition:
    background 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
}

.menu-link:hover {
  background:
    rgba(255, 255, 255, 0.07);

  color: white;
}

.menu-link.active {
  background:
    linear-gradient(
      90deg,
      #1e6df3,
      #327cff
    );

  color: white;

  box-shadow:
    0 5px 14px rgba(12, 86, 212, 0.25);
}

.menu-button {
  text-align: left;
}

.menu-arrow {
  margin-left: auto;
}

.menu-group {
  width: 100%;
}

.submenu {
  display: flex;
  flex-direction: column;

  margin: 4px 0 6px 19px;
  padding-left: 16px;

  border-left:
    1px solid rgba(255, 255, 255, 0.13);
}

.submenu-link {
  display: flex;
  min-height: 35px;
  align-items: center;
  gap: 9px;

  padding: 5px 10px;

  border-radius: 7px;

  color: #aac0dc;

  font-size: 12px;

  transition:
    color 0.18s ease,
    background 0.18s ease;
}

.submenu-link:hover {
  background:
    rgba(255, 255, 255, 0.05);

  color: white;
}

.submenu-link.active {
  color: white;
  font-weight: 600;
}

.submenu-dot {
  width: 5px;
  height: 5px;

  flex-shrink: 0;

  border-radius: 100%;

  background: #7797bd;
}

.submenu-link.active .submenu-dot {
  background: #50a2ff;

  box-shadow:
    0 0 0 3px rgba(80, 162, 255, 0.15);
}

/* =========================
   SIDEBAR USER
========================= */

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 10px;

  margin: 12px;
  padding: 12px;

  border:
    1px solid rgba(255, 255, 255, 0.12);

  border-radius: 11px;

  background:
    rgba(255, 255, 255, 0.045);
}

.user-avatar {
  display: flex;
  width: 37px;
  height: 37px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background:
    linear-gradient(
      135deg,
      #ddeaff,
      #b8d1ff
    );

  color: #164b9b;

  font-size: 12px;
  font-weight: 700;
}

.sidebar-user-info {
  min-width: 0;
  flex: 1;
}

.sidebar-user-info strong,
.sidebar-user-info span {
  display: block;
  overflow: hidden;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.sidebar-user-info strong {
  font-size: 12px;
  font-weight: 600;
}

.sidebar-user-info span {
  margin-top: 2px;

  color: #9eb9da;

  font-size: 10px;
}

/* =========================
   MAIN / TOP BAR
========================= */

.main-area {
  min-height: 100vh;
  margin-left: 264px;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 30;

  display: flex;
  height: 68px;
  align-items: center;
  justify-content: space-between;

  padding: 0 28px;

  border-bottom:
    1px solid var(--border);

  background:
    color-mix(
      in srgb,
      var(--bg-card) 94%,
      transparent
    );

  backdrop-filter: blur(15px);
}

.topbar-left,
.topbar-right {
  display: flex;
  align-items: center;
}

.topbar-left {
  gap: 10px;
}

.topbar-right {
  gap: 8px;
}

.search-box {
  display: flex;
  width: 390px;
  height: 40px;
  align-items: center;

  padding: 0 11px;

  border:
    1px solid var(--border);

  border-radius: 9px;

  background: var(--bg-card-soft);

  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.search-box:focus-within {
  border-color: #8fb4ff;

  box-shadow:
    0 0 0 3px rgba(36, 107, 253, 0.08);
}

.search-icon {
  flex-shrink: 0;
  color: var(--text-muted);
}

.search-box input {
  width: 100%;
  height: 100%;

  margin-left: 9px;

  border: 0;
  outline: 0;

  background: transparent;
  color: var(--text-primary);

  font-size: 13px;
}

.search-box input::placeholder {
  color: var(--text-muted);
}

.search-box kbd {
  padding: 3px 6px;

  border:
    1px solid var(--border);

  border-radius: 5px;

  background: var(--bg-card);

  color: var(--text-muted);

  font-size: 10px;
  white-space: nowrap;
}

.icon-button {
  position: relative;

  display: flex;
  width: 39px;
  height: 39px;
  align-items: center;
  justify-content: center;

  border:
    1px solid transparent;

  border-radius: 9px;

  background: transparent;
  color: var(--text-secondary);

  transition:
    background 0.18s ease,
    color 0.18s ease;
}

.icon-button:hover {
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

.notification-count {
  position: absolute;
  top: 2px;
  right: 1px;

  display: flex;
  width: 17px;
  height: 17px;
  align-items: center;
  justify-content: center;

  border:
    2px solid var(--bg-card);

  border-radius: 100px;

  background: #ef4444;
  color: white;

  font-size: 8px;
  font-weight: 700;
}

.topbar-separator {
  width: 1px;
  height: 25px;

  margin: 0 5px;

  background: var(--border);
}

.company-selector {
  display: flex;
  min-width: 185px;
  align-items: center;
  gap: 9px;

  padding: 5px 8px;

  border: 0;
  border-radius: 9px;

  background: transparent;
  color: var(--text-primary);

  text-align: left;
}

.company-selector:hover {
  background: var(--bg-card-soft);
}

.company-icon {
  display: flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background: var(--primary-soft);
  color: var(--primary);
}

.company-info {
  min-width: 0;
  flex: 1;
}

.company-info strong,
.company-info span {
  display: block;
}

.company-info strong {
  font-size: 11px;
  font-weight: 700;
}

.company-info span {
  margin-top: 2px;

  color: var(--text-secondary);

  font-size: 9px;
}

.company-menu {
  position: relative;
}

.company-selector-open {
  background:
    var(--bg-card-soft);
}

.company-chevron {
  transition:
    transform 0.18s ease;
}

.company-chevron.rotated {
  transform:
    rotate(180deg);
}

.company-dropdown {
  position: absolute;

  top:
    calc(100% + 9px);

  right: 0;

  z-index: 200;

  width: 270px;

  padding: 8px;

  border:
    1px solid var(--border);

  border-radius: 11px;

  background:
    var(--bg-card);

  box-shadow:
    0 18px 45px
    rgba(0, 0, 0, 0.2);
}

.company-dropdown-header {
  display: flex;

  align-items: center;

  gap: 9px;

  padding:
    9px 8px 11px;
}

.dropdown-company-logo {
  display: flex;

  width: 37px;
  height: 37px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.company-dropdown-header strong,
.company-dropdown-header span {
  display: block;
}

.company-dropdown-header strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.company-dropdown-header span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 8px;
}

.dropdown-divider {
  height: 1px;

  margin:
    5px 0;

  background:
    var(--border-soft);
}

.dropdown-item {
  display: flex;

  width: 100%;

  align-items: center;

  gap: 10px;

  padding:
    9px 8px;

  border: 0;

  border-radius: 7px;

  background:
    transparent;

  color:
    var(--text-secondary);

  text-align: left;

  cursor: pointer;

  transition:
    background 0.16s ease,
    color 0.16s ease;
}

.dropdown-item:hover {
  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);
}

.dropdown-item > svg {
  flex-shrink: 0;
}

.dropdown-item > div {
  min-width: 0;

  flex: 1;
}

.dropdown-item strong,
.dropdown-item span {
  display: block;
}

.dropdown-item strong {
  color:
    var(--text-primary);

  font-size: 9px;

  font-weight: 600;
}

.dropdown-item span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 7px;
}

.current-badge {
  padding:
    3px 6px;

  border-radius: 20px;

  background:
    var(--green-soft);

  color:
    var(--green) !important;

  font-size:
    7px !important;

  font-weight: 700;
}

.logout-item {
  color:
    var(--red);
}

.logout-item strong {
  color:
    var(--red);
}

.logout-item:hover {
  background:
    var(--red-soft);
}

/* ANIMATION */

.company-dropdown-enter-active,
.company-dropdown-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.company-dropdown-enter-from,
.company-dropdown-leave-to {
  opacity: 0;

  transform:
    translateY(-6px);
}

.menu-toggle {
  display: none;
}

.page-content {
  min-height:
    calc(100vh - 68px);

  padding: 28px;
}

/* =========================
   TRANSITIONS
========================= */

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.submenu-enter-active,
.submenu-leave-active {
  transition: all 0.18s ease;
}

.submenu-enter-from,
.submenu-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* =========================
   RESPONSIVE
========================= */

.sidebar-overlay {
  display: none;
}

@media (max-width: 1100px) {
  .search-box {
    width: 300px;
  }

  .company-info {
    display: none;
  }

  .company-selector {
    min-width: auto;
  }
}

@media (max-width: 850px) {
  .sidebar {
    transform: translateX(-100%);

    transition:
      transform 0.25s ease;
  }

  .sidebar-mobile-open {
    transform: translateX(0);
  }

  .main-area {
    margin-left: 0;
  }

  .menu-toggle {
    display: flex;
  }

  .mobile-close {
    display: flex;
  }

  .sidebar-overlay {
    position: fixed;
    inset: 0;
    z-index: 40;

    display: block;

    background:
      rgba(5, 15, 30, 0.55);

    backdrop-filter: blur(2px);
  }

  .topbar {
    padding: 0 18px;
  }

  .page-content {
    padding: 20px;
  }
}

@media (max-width: 650px) {
  .search-box {
    width: 210px;
  }

  .search-box kbd {
    display: none;
  }

  .company-menu,
  .topbar-separator {
    display: none;
  }
}

@media (max-width: 460px) {
  .search-box {
    width:
      calc(100vw - 160px);
  }

  .topbar {
    padding: 0 12px;
  }

  .page-content {
    padding: 15px;
  }
}
</style>
