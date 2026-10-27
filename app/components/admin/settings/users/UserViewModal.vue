
<script setup lang="ts">
import { computed } from 'vue'
import {
  X,
  UserRound,
  Mail,
  ShieldCheck,
  Building2,
  Clock3,
  Pencil,
  LockKeyhole,
  CircleCheck,
  CircleX,
} from 'lucide-vue-next'

import type { SystemUser } from '~/types/userAccess'

const props = defineProps<{
  open: boolean
  user: SystemUser | null
}>()

const emit = defineEmits<{
  close: []
  edit: [user: SystemUser]
}>()

const userDetails = computed(() => {
  if (!props.user) return null

  const raw = props.user as unknown as Record<string, unknown>

  return {
    name: props.user.name,
    email: props.user.email,
    role: props.user.role,
    department: String(raw.department ?? 'Not assigned'),
    status: String(raw.status ?? 'Unknown'),
    lastLogin: String(
      raw.lastLogin ?? raw.last_login ?? 'Never'
    ),
    twoFactor: Boolean(
      raw.twoFactorEnabled ?? raw.two_factor_enabled ?? false
    ),
    employeeNumber: String(
      raw.employeeNumber ?? raw.employee_number ?? 'N/A'
    ),
  }
})

const isActive = computed(() =>
  userDetails.value?.status.toLowerCase() === 'active'
)

const closeModal = () => emit('close')

const editUser = () => {
  if (!props.user) return
  emit('edit', props.user)
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.open) {
    closeModal()
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open && userDetails"
      class="user-view-overlay"
      @click.self="closeModal"
      @keydown="onKeydown"
    >
      <section
        class="user-view-modal"
        role="dialog"
        aria-modal="true"
        aria-label="System User Details"
        tabindex="-1"
      >
        <!-- HEADER -->
        <header class="modal-header">
          <div class="header-left">
            <span class="header-icon">
              <UserRound :size="21" />
            </span>

            <div>
              <h2>System User Details</h2>
              <p>View user information, role and account access.</p>
            </div>
          </div>

          <button
            type="button"
            class="close-button"
            aria-label="Close modal"
            @click="closeModal"
          >
            <X :size="19" />
          </button>
        </header>

        <div class="modal-body">
          <!-- PROFILE -->
          <div class="user-profile">
            <div class="profile-avatar">
              {{ userDetails.name
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map(part => part.charAt(0))
                .join('')
                .toUpperCase()
              }}
            </div>

            <div class="profile-info">
              <h3>{{ userDetails.name }}</h3>
              <p>{{ userDetails.email }}</p>

              <span
                class="status-badge"
                :class="isActive ? 'active' : 'disabled'"
              >
                <CircleCheck v-if="isActive" :size="13" />
                <CircleX v-else :size="13" />

                {{ userDetails.status }}
              </span>
            </div>
          </div>

          <!-- ACCOUNT INFORMATION -->
          <section class="detail-section">
            <h4>
              <UserRound :size="16" />
              Account Information
            </h4>

            <div class="details-grid">
              <div class="detail-item">
                <label>Full Name</label>
                <strong>{{ userDetails.name }}</strong>
              </div>

              <div class="detail-item">
                <label>Employee Number</label>
                <strong>{{ userDetails.employeeNumber }}</strong>
              </div>

              <div class="detail-item full">
                <label>Email Address</label>
                <strong class="with-icon">
                  <Mail :size="14" />
                  {{ userDetails.email }}
                </strong>
              </div>
            </div>
          </section>

          <!-- ROLE AND ACCESS -->
          <section class="detail-section">
            <h4>
              <ShieldCheck :size="16" />
              Role & Access
            </h4>

            <div class="details-grid">
              <div class="detail-item">
                <label>System Role</label>
                <strong class="role-value">
                  <ShieldCheck :size="14" />
                  {{ userDetails.role }}
                </strong>
              </div>

              <div class="detail-item">
                <label>Department</label>
                <strong class="with-icon">
                  <Building2 :size="14" />
                  {{ userDetails.department }}
                </strong>
              </div>

              <div class="detail-item">
                <label>Account Status</label>
                <strong :class="isActive ? 'green-text' : 'red-text'">
                  {{ userDetails.status }}
                </strong>
              </div>
            </div>
          </section>

          <!-- SECURITY -->
          <section class="detail-section">
            <h4>
              <LockKeyhole :size="16" />
              Security & Activity
            </h4>

            <div class="details-grid">
              <div class="detail-item">
                <label>Two-Factor Authentication</label>

                <strong
                  :class="userDetails.twoFactor ? 'green-text' : 'orange-text'"
                >
                  {{ userDetails.twoFactor ? 'Enabled' : 'Not Enabled' }}
                </strong>
              </div>

              <div class="detail-item">
                <label>Last Login</label>
                <strong class="with-icon">
                  <Clock3 :size="14" />
                  {{ userDetails.lastLogin }}
                </strong>
              </div>
            </div>
          </section>
        </div>

        <!-- FOOTER -->
        <footer class="modal-footer">
          <button
            type="button"
            class="secondary-button"
            @click="closeModal"
          >
            Close
          </button>

          <button
            v-if="user && user.employeeId"
            type="button"
            class="primary-button"
            @click="editUser"
          >
            <Pencil :size="15" />
            Edit User
          </button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.user-view-overlay {
  position: fixed;
  inset: 0;
  z-index: 10050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgba(3, 9, 23, .76);
  backdrop-filter: blur(5px);
}

.user-view-modal {
  width: 100%;
  max-width: 620px;
  max-height: 92vh;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 15px;
  background: var(--bg-card);
  box-shadow: 0 25px 70px rgba(0, 0, 0, .3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 22px;
  border-bottom: 1px solid var(--border);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  display: flex;
  width: 43px;
  height: 43px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  background: var(--primary-soft);
  color: var(--primary);
}

.modal-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 750;
}

.modal-header p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 11px;
}

.close-button {
  display: flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.close-button:hover {
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

.modal-body {
  padding: 21px 22px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 17px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card-soft);
}

.profile-avatar {
  display: flex;
  width: 57px;
  height: 57px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 13px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 17px;
  font-weight: 750;
}

.profile-info {
  min-width: 0;
}

.profile-info h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 750;
}

.profile-info p {
  overflow-wrap: anywhere;
  margin: 5px 0 9px;
  color: var(--text-muted);
  font-size: 11px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 9px;
  border-radius: 30px;
  font-size: 10px;
  font-weight: 650;
}

.status-badge.active {
  background: var(--green-soft);
  color: var(--green);
}

.status-badge.disabled {
  background: var(--red-soft);
  color: var(--red);
}

.detail-section {
  margin-top: 22px;
}

.detail-section h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 14px;
  padding-bottom: 11px;
  border-bottom: 1px solid var(--border-soft);
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 700;
}

.detail-section h4 svg {
  color: var(--primary);
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 17px;
}

.detail-item {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 7px;
}

.detail-item.full {
  grid-column: 1 / -1;
}

.detail-item label {
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 550;
}

.detail-item strong {
  overflow-wrap: anywhere;
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 650;
}

.with-icon,
.role-value {
  display: flex;
  align-items: center;
  gap: 7px;
}

.with-icon svg {
  flex-shrink: 0;
  color: var(--text-muted);
}

.role-value {
  color: var(--primary) !important;
}

.green-text {
  color: var(--green) !important;
}

.red-text {
  color: var(--red) !important;
}

.orange-text {
  color: var(--orange) !important;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  padding: 16px 22px;
  border-top: 1px solid var(--border);
}

.secondary-button,
.primary-button {
  display: inline-flex;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 650;
  cursor: pointer;
}

.secondary-button {
  border: 1px solid var(--border);
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

.primary-button {
  border: 1px solid var(--primary);
  background: var(--primary);
  color: #fff;
}

.primary-button:hover {
  filter: brightness(1.08);
}

@media (max-width: 560px) {
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 15px;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .user-profile {
    align-items: flex-start;
  }
}
</style>
