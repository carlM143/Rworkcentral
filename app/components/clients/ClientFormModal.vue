<script setup lang="ts">
import {
  Building2,
  Save,
  X,
} from 'lucide-vue-next'

import type {
  Client,
  ClientStatus,
  ContractStatus,
} from '~/types/client'

interface ClientFormData {
  code: string
  name: string
  industry: string

  contactPerson: string
  email: string
  phone: string

  address: string

  branches: number

  contractStart: string
  contractEnd: string

  contractStatus:
    ContractStatus

  status:
    ClientStatus
}

const props =
  defineProps<{
    open: boolean

    client?:
      Client |
      null
  }>()

const emit =
  defineEmits<{
    close: []

    save: [
      data:
        ClientFormData,
    ]
  }>()

const isEditing =
  computed(() => {
    return Boolean(
      props.client,
    )
  })

const form =
  reactive<ClientFormData>({
    code: '',
    name: '',
    industry: '',

    contactPerson: '',
    email: '',
    phone: '',

    address: '',

    branches: 1,

    contractStart: '',
    contractEnd: '',

    contractStatus:
      'Active',

    status:
      'Active',
  })

const resetForm = () => {
  form.code =
    props.client?.code ??
    ''

  form.name =
    props.client?.name ??
    ''

  form.industry =
    props.client?.industry ??
    ''

  form.contactPerson =
    props.client?.contactPerson ??
    ''

  form.email =
    props.client?.email ??
    ''

  form.phone =
    props.client?.phone ??
    ''

  form.address =
    props.client?.address ??
    ''

  form.branches =
    props.client?.branches ??
    1

  form.contractStart =
    props.client?.contractStart ??
    ''

  form.contractEnd =
    props.client?.contractEnd ??
    ''

  form.contractStatus =
    props.client?.contractStatus ??
    'Active'

  form.status =
    props.client?.status ??
    'Active'
}

watch(
  [
    () =>
      props.open,

    () =>
      props.client,
  ],
  () => {
    if (
      props.open
    ) {
      resetForm()
    }
  },
  {
    immediate:
      true,
  },
)

const handleSubmit = () => {
  emit(
    'save',
    {
      ...form,

      branches:
        Number(
          form.branches,
        ) || 1,
    },
  )
}
</script>

<template>
  <Teleport to="body">

    <Transition name="modal-fade">

      <div
        v-if="open"
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
                <Building2 :size="18" />
              </div>

              <div>

                <h2>
                  {{
                    isEditing
                      ? 'Edit Client'
                      : 'Add Client'
                  }}
                </h2>

                <p>
                  {{
                    isEditing
                      ? 'Update client company, contact and contract information.'
                      : 'Register a new external client for employee assignment.'
                  }}
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

          <form
            class="modal-body"
            @submit.prevent="
              handleSubmit
            "
          >

            <!-- CLIENT INFO -->

            <section class="form-section">

              <div class="section-heading">

                <h3>
                  Client Information
                </h3>

                <p>
                  Basic company and client account details.
                </p>

              </div>

              <div class="form-grid">

                <label>

                  <span>
                    Client Code *
                  </span>

                  <input
                    v-model="
                      form.code
                    "
                    required
                    type="text"
                    placeholder="CL-006"
                  >

                </label>

                <label>

                  <span>
                    Client Name *
                  </span>

                  <input
                    v-model="
                      form.name
                    "
                    required
                    type="text"
                    placeholder="Example Company Inc."
                  >

                </label>

                <label>

                  <span>
                    Industry
                  </span>

                  <input
                    v-model="
                      form.industry
                    "
                    type="text"
                    placeholder="Logistics"
                  >

                </label>

                <label>

                  <span>
                    Number of Branches
                  </span>

                  <input
                    v-model.number="
                      form.branches
                    "
                    min="1"
                    type="number"
                  >

                </label>

                <label class="full">

                  <span>
                    Address
                  </span>

                  <input
                    v-model="
                      form.address
                    "
                    type="text"
                    placeholder="Davao City"
                  >

                </label>

              </div>

            </section>

            <!-- CONTACT -->

            <section class="form-section">

              <div class="section-heading">

                <h3>
                  Contact Information
                </h3>

                <p>
                  Primary contact person for this client.
                </p>

              </div>

              <div class="form-grid">

                <label>

                  <span>
                    Contact Person *
                  </span>

                  <input
                    v-model="
                      form.contactPerson
                    "
                    required
                    type="text"
                    placeholder="Juan Dela Cruz"
                  >

                </label>

                <label>

                  <span>
                    Email
                  </span>

                  <input
                    v-model="
                      form.email
                    "
                    type="email"
                    placeholder="contact@example.com"
                  >

                </label>

                <label>

                  <span>
                    Phone
                  </span>

                  <input
                    v-model="
                      form.phone
                    "
                    type="text"
                    placeholder="0917 123 4567"
                  >

                </label>

              </div>

            </section>

            <!-- CONTRACT -->

            <section class="form-section">

              <div class="section-heading">

                <h3>
                  Contract Information
                </h3>

                <p>
                  Contract period and current client status.
                </p>

              </div>

              <div class="form-grid">

                <label>

                  <span>
                    Contract Start *
                  </span>

                  <input
                    v-model="
                      form.contractStart
                    "
                    required
                    type="date"
                  >

                </label>

                <label>

                  <span>
                    Contract End *
                  </span>

                  <input
                    v-model="
                      form.contractEnd
                    "
                    required
                    type="date"
                  >

                </label>

                <label>

                  <span>
                    Contract Status
                  </span>

                  <select
                    v-model="
                      form.contractStatus
                    "
                  >

                    <option value="Active">
                      Active
                    </option>

                    <option value="Expiring Soon">
                      Expiring Soon
                    </option>

                    <option value="Expired">
                      Expired
                    </option>

                  </select>

                </label>

                <label>

                  <span>
                    Client Status
                  </span>

                  <select
                    v-model="
                      form.status
                    "
                  >

                    <option value="Active">
                      Active
                    </option>

                    <option value="For Review">
                      For Review
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>

                  </select>

                </label>

              </div>

            </section>

          </form>

          <!-- FOOTER -->

          <footer class="modal-footer">

            <AppButton
              variant="secondary"
              @click="
                emit('close')
              "
            >
              Cancel
            </AppButton>

            <AppButton
              :icon="Save"
              @click="
                handleSubmit
              "
            >
              {{
                isEditing
                  ? 'Save Changes'
                  : 'Add Client'
              }}
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
  max-width: 760px;

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
  position: sticky;
  z-index: 5;
  top: 0;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 16px 18px;

  border-bottom:
    1px solid var(--border);

  background:
    var(--bg-card);
}

.header-main {
  display: flex;
  align-items: center;

  gap: 10px;
}

.header-icon {
  display: flex;

  width: 39px;
  height: 39px;

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

.form-section + .form-section {
  margin-top: 18px;
}

.section-heading {
  margin-bottom: 9px;
}

.section-heading h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 10px;
}

.section-heading p {
  margin: 3px 0 0;

  color:
    var(--text-muted);

  font-size: 7px;
}

.form-grid {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 10px;
}

.form-grid label {
  display: flex;

  flex-direction: column;

  gap: 5px;
}

.form-grid label.full {
  grid-column:
    1 / -1;
}

.form-grid label span {
  color:
    var(--text-secondary);

  font-size: 8px;
  font-weight: 600;
}

.form-grid input,
.form-grid select {
  box-sizing: border-box;

  width: 100%;
  height: 39px;

  padding:
    0 10px;

  border:
    1px solid var(--border);

  border-radius: 7px;

  outline: 0;

  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);

  font-family:
    inherit;

  font-size: 9px;
}

.form-grid input:focus,
.form-grid select:focus {
  border-color:
    var(--primary);

  box-shadow:
    0 0 0 3px
    rgba(36, 107, 253, 0.08);
}

.modal-footer {
  position: sticky;
  z-index: 5;
  bottom: 0;

  display: flex;
  justify-content: flex-end;

  gap: 7px;

  padding: 13px 18px;

  border-top:
    1px solid var(--border);

  background:
    var(--bg-card);
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
  .form-grid {
    grid-template-columns:
      1fr;
  }

  .form-grid label.full {
    grid-column:
      auto;
  }

  .modal-footer {
    align-items: stretch;

    flex-direction:
      column-reverse;
  }
}
</style>