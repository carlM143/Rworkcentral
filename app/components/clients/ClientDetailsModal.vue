<script setup lang="ts">
import {
  Building2,
  CalendarDays,
  Mail,
  MapPin,
  Pencil,
  Phone,
  UserRound,
  Users,
  X,
} from 'lucide-vue-next'

import type {
  Client,
} from '~/types/client'

defineProps<{
  open: boolean

  client:
    Client |
    null
}>()

const emit =
  defineEmits<{
    close: []
    edit: [client: Client]
    assignments: [client: Client]
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
                <Building2 :size="19" />
              </div>

              <div>

                <h2>
                  {{ client.name }}
                </h2>

                <p>
                  {{ client.code }}
                  <template v-if="client.industry">
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

            <div class="status-row">

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
                  Contract
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
                    <span>Industry</span>
                    <strong>
                      {{ client.industry || '—' }}
                    </strong>
                  </div>

                </div>

                <div class="detail-item">

                  <MapPin :size="15" />

                  <div>
                    <span>Address</span>
                    <strong>
                      {{ client.address || '—' }}
                    </strong>
                  </div>

                </div>

                <div class="detail-item">

                  <Building2 :size="15" />

                  <div>
                    <span>Branches</span>
                    <strong>
                      {{ client.branches }}
                    </strong>
                  </div>

                </div>

                <div class="detail-item">

                  <Users :size="15" />

                  <div>
                    <span>Assigned Employees</span>
                    <strong>
                      {{ client.assignedEmployees }}
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
                    <span>Contact Person</span>
                    <strong>
                      {{ client.contactPerson }}
                    </strong>
                  </div>

                </div>

                <div class="detail-item">

                  <Mail :size="15" />

                  <div>
                    <span>Email Address</span>
                    <strong>
                      {{ client.email || '—' }}
                    </strong>
                  </div>

                </div>

                <div class="detail-item">

                  <Phone :size="15" />

                  <div>
                    <span>Phone Number</span>
                    <strong>
                      {{ client.phone || '—' }}
                    </strong>
                  </div>

                </div>

              </div>

            </section>

            <!-- CONTRACT -->

            <section>

              <h3>
                Contract Period
              </h3>

              <div class="contract-period">

                <div>

                  <CalendarDays :size="15" />

                  <span>
                    Contract Start
                  </span>

                  <strong>
                    {{
                      formatDate(
                        client.contractStart,
                      )
                    }}
                  </strong>

                </div>

                <div class="arrow">
                  →
                </div>

                <div>

                  <CalendarDays :size="15" />

                  <span>
                    Contract End
                  </span>

                  <strong>
                    {{
                      formatDate(
                        client.contractEnd,
                      )
                    }}
                  </strong>

                </div>

              </div>

            </section>

          </div>

          <!-- FOOTER -->

          <footer class="modal-footer">

            <AppButton
              variant="secondary"
              @click="
                emit(
                  'assignments',
                  client,
                )
              "
            >
              View Assignments
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

.status-row {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 8px;

  margin-bottom: 17px;
}

.status-row > div {
  padding: 10px;

  border:
    1px solid var(--border-soft);

  border-radius: 8px;

  background:
    var(--bg-card-soft);
}

.status-row span {
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
  margin: 0 0 8px;

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

.contract-period {
  display: grid;

  grid-template-columns:
    1fr auto 1fr;

  align-items: center;

  gap: 10px;

  padding: 11px;

  border-radius: 8px;

  background:
    var(--primary-soft);
}

.contract-period > div:not(.arrow) {
  display: grid;

  grid-template-columns:
    auto 1fr;

  column-gap: 7px;

  align-items: center;
}

.contract-period svg {
  grid-row:
    1 / 3;

  color:
    var(--primary);
}

.contract-period span,
.contract-period strong {
  display: block;
}

.contract-period span {
  color:
    var(--text-muted);

  font-size: 7px;
}

.contract-period strong {
  margin-top: 2px;

  color:
    var(--text-primary);

  font-size: 8px;
}

.arrow {
  color:
    var(--primary);
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
  .status-row,
  .detail-grid {
    grid-template-columns:
      1fr;
  }

  .contract-period {
    grid-template-columns:
      1fr;
  }

  .arrow {
    transform:
      rotate(90deg);

    text-align: center;
  }

  .modal-footer {
    align-items: stretch;

    flex-direction: column-reverse;
  }
}
</style>