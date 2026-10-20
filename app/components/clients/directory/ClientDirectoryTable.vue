<script setup lang="ts">
import {
  Building2,
  Eye,
  Mail,
  MapPin,
  MoreHorizontal,
  Pencil,
  Phone,
  Store,
  UserRoundCog,
  UsersRound,
} from 'lucide-vue-next'

import type {
  ClientDirectoryRecord,
} from '~/composables/useClientDirectory'

defineProps<{
  clients:
    ClientDirectoryRecord[]
}>()

const emit =
  defineEmits<{
    view: [
      client:
        ClientDirectoryRecord,
    ]

    edit: [
      client:
        ClientDirectoryRecord,
    ]

    assignments: [
      client:
        ClientDirectoryRecord,
    ]
  }>()

const openMenuId =
  ref<number | null>(
    null,
  )

const toggleMenu = (
  id: number,
) => {
  openMenuId.value =
    openMenuId.value === id
      ? null
      : id
}

const closeMenu = () => {
  openMenuId.value =
    null
}

const handleView = (
  client:
    ClientDirectoryRecord,
) => {
  closeMenu()

  emit(
    'view',
    client,
  )
}

const handleEdit = (
  client:
    ClientDirectoryRecord,
) => {
  closeMenu()

  emit(
    'edit',
    client,
  )
}

const handleAssignments = (
  client:
    ClientDirectoryRecord,
) => {
  closeMenu()

  emit(
    'assignments',
    client,
  )
}

const handleWindowClick = () => {
  closeMenu()
}

onMounted(() => {
  window.addEventListener(
    'click',
    handleWindowClick,
  )
})

onBeforeUnmount(() => {
  window.removeEventListener(
    'click',
    handleWindowClick,
  )
})

const formatDate = (
  value: string,
) => {
  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    },
  ).format(
    new Date(
      `${value}T00:00:00`,
    ),
  )
}

const contractClass = (
  status: string,
) => {
  if (
    status ===
    'Active'
  ) {
    return 'active'
  }

  if (
    status ===
    'Expiring Soon'
  ) {
    return 'expiring'
  }

  return 'expired'
}
</script>

<template>
  <article class="table-card">

    <!-- HEADER -->

    <div class="table-heading">

      <div>

        <h3>
          Client Directory
        </h3>

        <p>
          View and manage registered clients,
          contact information, employee assignments
          and contract status.
        </p>

      </div>

    </div>

    <!-- TABLE -->

    <div
      v-if="
        clients.length
      "
      class="table-scroll"
    >

      <table>

        <thead>

          <tr>
            <th>Client Code</th>
            <th>Client</th>
            <th>Industry</th>
            <th>Contact Person</th>
            <th>Contact Details</th>
            <th>Location</th>
            <th>Client Sites</th>
            <th>Employees</th>
            <th>Contract</th>
            <th>Client Status</th>
            <th>Started</th>
            <th />
          </tr>

        </thead>

        <tbody>

          <tr
            v-for="
              client in clients
            "
            :key="
              client.id
            "
          >

            <!-- CODE -->

            <td>

              <strong class="client-code">
                {{ client.code }}
              </strong>

            </td>

            <!-- CLIENT -->

            <td>

              <div class="client-cell">

                <div class="client-icon">

                  <Building2
                    :size="16"
                  />

                </div>

                <div>

                  <strong>
                    {{ client.name }}
                  </strong>

                  <span>
                    {{ client.branches }}
                    {{
                      client.branches === 1
                        ? 'site'
                        : 'sites'
                    }}
                  </span>

                </div>

              </div>

            </td>

            <!-- INDUSTRY -->

            <td>

              <span class="industry-badge">
                {{
                  client.industry ||
                  'Not specified'
                }}
              </span>

            </td>

            <!-- CONTACT PERSON -->

            <td>

              <strong class="contact-person">
                {{ client.contactPerson }}
              </strong>

            </td>

            <!-- CONTACT -->

            <td>

              <div class="contact-details">

                <span
                  v-if="
                    client.email
                  "
                >

                  <Mail :size="11" />

                  {{ client.email }}

                </span>

                <span
                  v-if="
                    client.phone
                  "
                >

                  <Phone :size="11" />

                  {{ client.phone }}

                </span>

              </div>

            </td>

            <!-- LOCATION -->

            <td>

              <div class="location-cell">

                <MapPin :size="12" />

                <span>
                  {{
                    client.address ||
                    'Not specified'
                  }}
                </span>

              </div>

            </td>

            <!-- SITES -->

            <td>

              <div class="count-cell">

                <Store :size="13" />

                <strong>
                  {{ client.branches }}
                </strong>

              </div>

            </td>

            <!-- EMPLOYEES -->

            <td>

              <div class="employees-cell">

                <UsersRound
                  :size="13"
                />

                <strong>
                  {{
                    client.assignedEmployees
                  }}
                </strong>

              </div>

            </td>

            <!-- CONTRACT -->

            <td>

              <span
                class="contract-badge"
                :class="
                  contractClass(
                    client.contractStatus,
                  )
                "
              >
                {{ client.contractStatus }}
              </span>

            </td>

            <!-- STATUS -->

            <td>

              <StatusBadge
                :status="
                  client.status
                "
              />

            </td>

            <!-- STARTED -->

            <td>

              <span class="date-value">
                {{
                  formatDate(
                    client.dateStarted,
                  )
                }}
              </span>

            </td>

            <!-- ACTION -->

            <td class="action-cell">

              <div class="action-wrapper">

                <button
                  type="button"
                  class="action-button"
                  title="Client actions"
                  @click.stop="
                    toggleMenu(
                      client.id,
                    )
                  "
                >

                  <MoreHorizontal
                    :size="17"
                  />

                </button>

                <Transition name="menu-fade">

                  <div
                    v-if="
                      openMenuId ===
                      client.id
                    "
                    class="action-menu"
                    @click.stop
                  >

                    <button
                      type="button"
                      @click="
                        handleView(
                          client,
                        )
                      "
                    >

                      <Eye :size="14" />

                      <div>

                        <strong>
                          View Details
                        </strong>

                        <span>
                          Review client information
                        </span>

                      </div>

                    </button>

                    <button
                      type="button"
                      @click="
                        handleEdit(
                          client,
                        )
                      "
                    >

                      <Pencil :size="14" />

                      <div>

                        <strong>
                          Edit Client
                        </strong>

                        <span>
                          Update client details
                        </span>

                      </div>

                    </button>

                    <button
                      type="button"
                      @click="
                        handleAssignments(
                          client,
                        )
                      "
                    >

                      <UserRoundCog :size="14" />

                      <div>

                        <strong>
                          Employee Assignments
                        </strong>

                        <span>
                          View deployed employees
                        </span>

                      </div>

                    </button>

                  </div>

                </Transition>

              </div>

            </td>

          </tr>

        </tbody>

      </table>

    </div>

    <!-- EMPTY -->

    <div
      v-else
      class="empty-state"
    >

      <Building2
        :size="32"
      />

      <strong>
        No clients found
      </strong>

      <span>
        Try changing your client filters.
      </span>

    </div>

  </article>
</template>

<style scoped>
.table-card {
  overflow: visible;

  border:
    1px solid var(--border);

  border-radius: 11px;

  background:
    var(--bg-card);

  box-shadow:
    var(--shadow);
}

.table-heading {
  padding:
    15px 16px;

  border-bottom:
    1px solid var(--border-soft);
}

.table-heading h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 14px;
}

.table-heading p {
  margin:
    5px 0 0;

  color:
    var(--text-muted);

  font-size: 9px;
}

.table-scroll {
  overflow-x: auto;

  overflow-y: visible;
}

table {
  width: 100%;

  min-width: 1900px;

  border-collapse:
    collapse;
}

th {
  padding:
    12px 13px;

  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);

  font-size: 9px;
  font-weight: 700;

  text-align: left;

  text-transform:
    uppercase;

  white-space: nowrap;
}

td {
  padding:
    13px;

  border-top:
    1px solid var(--border-soft);

  color:
    var(--text-secondary);

  font-size: 9px;

  vertical-align: middle;
}

tbody tr:hover {
  background:
    var(--bg-card-soft);
}

.client-code {
  color:
    var(--primary);

  font-size: 9px;

  white-space: nowrap;
}

.client-cell {
  display: flex;

  min-width: 230px;

  align-items: center;

  gap: 9px;
}

.client-icon {
  display: flex;

  width: 36px;
  height: 36px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.client-cell strong,
.client-cell span {
  display: block;
}

.client-cell strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.client-cell span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 8px;
}

.industry-badge {
  display: inline-flex;

  padding:
    5px 7px;

  border-radius: 5px;

  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);

  font-size: 8px;

  white-space: nowrap;
}

.contact-person {
  color:
    var(--text-primary);

  font-size: 9px;

  white-space: nowrap;
}

.contact-details {
  min-width: 205px;
}

.contact-details span {
  display: flex;

  align-items: center;

  gap: 5px;

  margin:
    2px 0;

  color:
    var(--text-secondary);

  font-size: 8px;

  white-space: nowrap;
}

.location-cell {
  display: flex;

  min-width: 180px;

  align-items: center;

  gap: 5px;

  color:
    var(--text-secondary);
}

.location-cell svg {
  flex-shrink: 0;

  color:
    var(--text-muted);
}

.count-cell,
.employees-cell {
  display: inline-flex;

  align-items: center;

  gap: 5px;
}

.count-cell {
  color:
    var(--purple);
}

.employees-cell {
  color:
    var(--primary);
}

.count-cell strong,
.employees-cell strong {
  font-size: 10px;
}

.contract-badge {
  display: inline-flex;

  padding:
    5px 8px;

  border-radius: 20px;

  font-size: 8px;
  font-weight: 650;

  white-space: nowrap;
}

.contract-badge.active {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.contract-badge.expiring {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.contract-badge.expired {
  background:
    var(--red-soft);

  color:
    var(--red);
}

.date-value {
  color:
    var(--text-secondary);

  white-space: nowrap;
}

/* ACTION */

.action-cell {
  position: relative;

  width: 45px;
}

.action-wrapper {
  position: relative;
}

.action-button {
  display: flex;

  width: 31px;
  height: 31px;

  align-items: center;
  justify-content: center;

  border:
    1px solid transparent;

  border-radius: 7px;

  background:
    transparent;

  color:
    var(--text-secondary);

  cursor: pointer;
}

.action-button:hover {
  border-color:
    var(--border);

  background:
    var(--bg-card-soft);

  color:
    var(--primary);
}

.action-menu {
  position: absolute;

  z-index: 200;

  top: calc(100% + 5px);
  right: 0;

  width: 215px;

  overflow: hidden;

  padding: 5px;

  border:
    1px solid var(--border);

  border-radius: 9px;

  background:
    var(--bg-card);

  box-shadow:
    0 16px 40px
    rgba(0, 0, 0, 0.22);
}

.action-menu button {
  display: flex;

  width: 100%;

  align-items: flex-start;

  gap: 8px;

  padding: 8px;

  border: 0;
  border-radius: 6px;

  background:
    transparent;

  color:
    var(--text-secondary);

  font-family:
    inherit;

  text-align: left;

  cursor: pointer;
}

.action-menu button:hover {
  background:
    var(--bg-card-soft);

  color:
    var(--primary);
}

.action-menu svg {
  flex-shrink: 0;

  margin-top: 2px;
}

.action-menu strong,
.action-menu span {
  display: block;
}

.action-menu strong {
  color:
    var(--text-primary);

  font-size: 8px;
}

.action-menu span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 7px;
}

/* EMPTY */

.empty-state {
  display: flex;

  min-height: 250px;

  flex-direction: column;

  align-items: center;
  justify-content: center;

  gap: 7px;

  color:
    var(--text-muted);
}

.empty-state strong {
  color:
    var(--text-primary);

  font-size: 11px;
}

.empty-state span {
  font-size: 9px;
}

.menu-fade-enter-active,
.menu-fade-leave-active {
  transition:
    0.12s ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;

  transform:
    translateY(-3px);
}
</style>