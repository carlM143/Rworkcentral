<script setup lang="ts">
import {
  Building2,
  CalendarDays,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Store,
  UserRound,
  UsersRound,
  X,
} from 'lucide-vue-next'

import type {
  ClientDirectoryRecord,
} from '~/composables/useClientDirectory'

defineProps<{
  open: boolean

  client:
    ClientDirectoryRecord |
    null
}>()

const emit =
  defineEmits<{
    close: []

    edit: [
      client:
        ClientDirectoryRecord,
    ]

    assignments: [
      client:
        ClientDirectoryRecord,
    ]
  }>()

const formatDate = (
  value?: string,
) => {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month:
        'short',

      day:
        'numeric',

      year:
        'numeric',
    },
  ).format(
    new Date(
      `${value}T00:00:00`,
    ),
  )
}
</script>

<template>
  <Teleport to="body">

    <Transition name="modal-fade">

      <div
        v-if="
          open &&
          client
        "
        class="modal-overlay"
        @click.self="
          emit('close')
        "
      >

        <article class="modal-card">

          <!-- HEADER -->

          <header class="modal-header">

            <div class="header-main">

              <div class="header-icon">

                <Building2
                  :size="19"
                />

              </div>

              <div>

                <h2>
                  {{ client.name }}
                </h2>

                <p>
                  {{ client.code }}

                  <template
                    v-if="
                      client.industry
                    "
                  >
                    · {{ client.industry }}
                  </template>
                </p>

              </div>

            </div>

            <button
              type="button"
              class="close-button"
              @click="
                emit('close')
              "
            >
              <X :size="18" />
            </button>

          </header>

          <!-- BODY -->

          <div class="modal-body">

            <!-- STATUS -->

            <div class="status-grid">

              <div>

                <span>
                  Client Status
                </span>

                <StatusBadge
                  :status="
                    client.status
                  "
                />

              </div>

              <div>

                <span>
                  Contract Status
                </span>

                <StatusBadge
                  :status="
                    client.contractStatus
                  "
                />

              </div>

            </div>

            <!-- COMPANY -->

            <section>

              <h3>
                Client Information
              </h3>

              <div class="detail-grid">

                <div class="detail-item">

                  <Building2 :size="15" />

                  <div>

                    <span>
                      Client Code
                    </span>

                    <strong>
                      {{ client.code }}
                    </strong>

                  </div>

                </div>

                <div class="detail-item">

                  <Building2 :size="15" />

                  <div>

                    <span>
                      Industry
                    </span>

                    <strong>
                      {{
                        client.industry ||
                        'Not specified'
                      }}
                    </strong>

                  </div>

                </div>

                <div class="detail-item">

                  <MapPin :size="15" />

                  <div>

                    <span>
                      Location
                    </span>

                    <strong>
                      {{
                        client.address ||
                        'Not specified'
                      }}
                    </strong>

                  </div>

                </div>

                <div class="detail-item">

                  <CalendarDays :size="15" />

                  <div>

                    <span>
                      Client Since
                    </span>

                    <strong>
                      {{
                        formatDate(
                          client.dateStarted,
                        )
                      }}
                    </strong>

                  </div>

                </div>

              </div>

            </section>

            <!-- CONTACT -->

            <section>

              <h3>
                Contact Information
              </h3>

              <div class="detail-grid">

                <div class="detail-item">

                  <UserRound :size="15" />

                  <div>

                    <span>
                      Contact Person
                    </span>

                    <strong>
                      {{ client.contactPerson }}
                    </strong>

                  </div>

                </div>

                <div class="detail-item">

                  <Mail :size="15" />

                  <div>

                    <span>
                      Email Address
                    </span>

                    <strong>
                      {{
                        client.email ||
                        'Not provided'
                      }}
                    </strong>

                  </div>

                </div>

                <div class="detail-item">

                  <Phone :size="15" />

                  <div>

                    <span>
                      Phone Number
                    </span>

                    <strong>
                      {{
                        client.phone ||
                        'Not provided'
                      }}
                    </strong>

                  </div>

                </div>

              </div>

            </section>

            <!-- DEPLOYMENT -->

            <section>

              <h3>
                Employee Deployment
              </h3>

              <div class="deployment-grid">

                <div>

                  <Store :size="18" />

                  <span>
                    Client Sites
                  </span>

                  <strong>
                    {{ client.branches }}
                  </strong>

                </div>

                <div>

                  <UsersRound :size="18" />

                  <span>
                    Assigned Employees
                  </span>

                  <strong>
                    {{ client.assignedEmployees }}
                  </strong>

                </div>

              </div>

            </section>

          </div>

          <!-- FOOTER -->

          <footer class="modal-footer">

            <AppButton
              variant="secondary"
              :icon="UsersRound"
              @click="
                emit(
                  'assignments',
                  client,
                )
              "
            >
              Employee Assignments
            </AppButton>

            <AppButton
              :icon="Pencil"
              @click="
                emit(
                  'edit',
                  client,
                )
              "
            >
              Edit Client
            </AppButton>

          </footer>

        </article>

      </div>

    </Transition>

  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  z-index: 99990;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;

  background:
    rgba(3, 10, 24, 0.76);

  backdrop-filter:
    blur(4px);
}

.modal-card {
  width: 100%;
  max-width: 650px;

  max-height:
    calc(100vh - 40px);

  overflow-y: auto;

  border:
    1px solid var(--border);

  border-radius: 14px;

  background:
    var(--bg-card);

  box-shadow:
    0 25px 70px
    rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 12px;

  padding: 16px 18px;

  border-bottom:
    1px solid var(--border);
}

.header-main {
  display: flex;
  align-items: center;

  gap: 10px;
}

.header-icon {
  display: flex;

  width: 40px;
  height: 40px;

  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: 9px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.modal-header h2 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 14px;
}

.modal-header p {
  margin: 3px 0 0;

  color:
    var(--text-muted);

  font-size: 8px;
}

.close-button {
  display: flex;

  width: 31px;
  height: 31px;

  align-items: center;
  justify-content: center;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    transparent;

  color:
    var(--text-secondary);

  cursor: pointer;
}

.modal-body {
  padding: 17px 18px;
}

.status-grid {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 8px;

  margin-bottom: 18px;
}

.status-grid > div {
  padding: 10px;

  border:
    1px solid var(--border-soft);

  border-radius: 8px;

  background:
    var(--bg-card-soft);
}

.status-grid span {
  display: block;

  margin-bottom: 6px;

  color:
    var(--text-muted);

  font-size: 7px;
}

section + section {
  margin-top: 18px;
}

section h3 {
  margin:
    0 0 8px;

  color:
    var(--text-primary);

  font-size: 9px;
}

.detail-grid {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 7px;
}

.detail-item {
  display: flex;

  align-items: flex-start;

  gap: 8px;

  padding: 10px;

  border:
    1px solid var(--border-soft);

  border-radius: 8px;

  background:
    var(--bg-card-soft);

  color:
    var(--primary);
}

.detail-item span,
.detail-item strong {
  display: block;
}

.detail-item span {
  color:
    var(--text-muted);

  font-size: 7px;
}

.detail-item strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 8px;
}

.deployment-grid {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 8px;
}

.deployment-grid > div {
  display: grid;

  grid-template-columns:
    auto 1fr;

  column-gap: 8px;

  align-items: center;

  padding: 11px;

  border-radius: 8px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.deployment-grid svg {
  grid-row:
    1 / 3;
}

.deployment-grid span {
  color:
    var(--text-muted);

  font-size: 7px;
}

.deployment-grid strong {
  margin-top: 2px;

  color:
    var(--text-primary);

  font-size: 13px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;

  gap: 7px;

  padding: 13px 18px;

  border-top:
    1px solid var(--border);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition:
    opacity 0.18s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 650px) {
  .status-grid,
  .detail-grid,
  .deployment-grid {
    grid-template-columns:
      1fr;
  }

  .modal-footer {
    align-items: stretch;

    flex-direction:
      column-reverse;
  }
}
</style>