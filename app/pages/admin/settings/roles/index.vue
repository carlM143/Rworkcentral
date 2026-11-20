<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import {
  BarChart3,
  BriefcaseBusiness,
  CalendarClock,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  Crown,
  DoorOpen,
  HandCoins,
  House,
  Landmark,
  LayoutDashboard,
  Lock,
  Pencil,
  Plus,
  Scale,
  Settings,
  Shield,
  Trash2,
  Truck,
  Umbrella,
  UserRound,
  Users,
  WalletCards,
} from 'lucide-vue-next'
import AppConfirmModal from '~/components/shared/AppConfirmModal.vue'
import {
  rolesApiError,
  useRolesApi,
  type CatalogModule,
  type PermissionAction,
  type PrivilegeCatalog,
  type RoleDetail,
  type RoleSummary,
} from '~/composables/admin/settings/useRolesApi'

definePageMeta({
  layout: 'admin',
})

const api = useRolesApi()
const { can, refreshUser } = useAuth()
const { success, error: toastError } = useToast()

const canCreate = computed(() => can('settings', 'roles.create'))
const canEdit = computed(() => can('settings', 'roles.edit'))
const canDelete = computed(() => can('settings', 'roles.delete'))

const ACTION_LABELS: Record<PermissionAction, string> = {
  view: 'View',
  create: 'Create',
  edit: 'Edit',
  delete: 'Delete',
  approve: 'Approve',
  export: 'Export',
}

const MODULE_ICONS: Record<string, unknown> = {
  door: DoorOpen,
  dashboard: LayoutDashboard,
  users: Users,
  clock: Clock3,
  'calendar-clock': CalendarClock,
  wallet: WalletCards,
  scale: Scale,
  landmark: Landmark,
  'hand-coins': HandCoins,
  truck: Truck,
  umbrella: Umbrella,
  calendar: CalendarDays,
  briefcase: BriefcaseBusiness,
  'clipboard-check': ClipboardCheck,
  house: House,
  clipboard: ClipboardList,
  'user-round': UserRound,
  chart: BarChart3,
  settings: Settings,
}

// =====================================================
// LOAD
// =====================================================

const roles = ref<RoleSummary[]>([])
const catalog = ref<PrivilegeCatalog | null>(null)
const role = ref<RoleDetail | null>(null)
const selectedId = ref<number | null>(null)
const activeModule = ref('')
const tab = ref<'permissions' | 'users'>('permissions')
const loading = ref(true)
const loadingRole = ref(false)
const loadError = ref('')

// Checked privilege ids (editable copy) and the saved ones.
const checked = reactive(new Set<number>())
const saved = ref<number[]>([])

const loadRoles = async () => {
  roles.value = (await api.list()).data
}

const selectRole = async (id: number) => {
  if (dirty.value && !window.confirm('Discard the unsaved changes to this role?')) return
  selectedId.value = id
  loadingRole.value = true
  try {
    const data = (await api.show(id)).data
    role.value = data
    saved.value = [...data.privilege_ids]
    checked.clear()
    data.privilege_ids.forEach(pid => checked.add(pid))
  } catch (err) {
    toastError('Unable to load the role', rolesApiError(err, 'Please try again.'))
  } finally {
    loadingRole.value = false
  }
}

onMounted(async () => {
  try {
    const [, cat] = await Promise.all([loadRoles(), api.catalog()])
    catalog.value = cat.data
    activeModule.value = cat.data.modules[0]?.key ?? ''
    const first = roles.value.find(r => !r.locked) ?? roles.value[0]
    if (first) await selectRole(first.id)
  } catch (err) {
    loadError.value = rolesApiError(err, 'Unable to load roles and permissions.')
  } finally {
    loading.value = false
  }
})

// =====================================================
// MATRIX
// =====================================================

const locked = computed(() => !!role.value?.locked)
const editable = computed(() => canEdit.value && !locked.value)

const module = computed<CatalogModule | null>(() =>
  catalog.value?.modules.find(m => m.key === activeModule.value) ?? null,
)

// Columns shown: only actions used by at least one feature of the module.
const columns = computed<PermissionAction[]>(() =>
  (catalog.value?.actions ?? []).filter(action => module.value?.features.some(f => f.actions[action])),
)

const moduleIds = (m: CatalogModule) =>
  m.features.flatMap(f => Object.values(f.actions)).filter((id): id is number => typeof id === 'number')

const moduleCount = (m: CatalogModule) => {
  const ids = moduleIds(m)
  return { on: ids.filter(id => checked.has(id)).length, total: ids.length }
}

const toggle = (id: number | null | undefined) => {
  if (!editable.value || !id) return
  if (checked.has(id)) checked.delete(id)
  else checked.add(id)
}

// Turning on any action also turns on View for that feature (nothing works without it).
const toggleAction = (featureActions: Partial<Record<PermissionAction, number | null>>, action: PermissionAction) => {
  const id = featureActions[action]
  if (!editable.value || !id) return
  const turningOn = !checked.has(id)
  toggle(id)
  if (turningOn && action !== 'view' && featureActions.view) checked.add(featureActions.view)
  if (!turningOn && action === 'view') {
    Object.values(featureActions).forEach(other => other && checked.delete(other))
  }
}

const setModule = (on: boolean) => {
  if (!editable.value || !module.value) return
  moduleIds(module.value).forEach(id => (on ? checked.add(id) : checked.delete(id)))
}

const dirty = computed(() => {
  if (!role.value || locked.value) return false
  if (checked.size !== saved.value.length) return true
  return saved.value.some(id => !checked.has(id))
})

const cancelChanges = () => {
  checked.clear()
  saved.value.forEach(id => checked.add(id))
}

const saving = ref(false)

const save = async () => {
  if (!role.value || !dirty.value) return
  saving.value = true
  try {
    const response = await api.savePrivileges(role.value.id, [...checked])
    role.value = response.data
    saved.value = [...response.data.privilege_ids]
    await loadRoles()
    await refreshUser() // your own menu updates if you changed your own role
    success('Permissions saved', response.message)
  } catch (err) {
    toastError('Unable to save', rolesApiError(err, 'Please try again.'))
  } finally {
    saving.value = false
  }
}

// Warn before leaving the browser tab with unsaved changes.
const onBeforeUnload = (event: BeforeUnloadEvent) => {
  if (dirty.value) event.preventDefault()
}
onMounted(() => window.addEventListener('beforeunload', onBeforeUnload))
onBeforeUnmount(() => window.removeEventListener('beforeunload', onBeforeUnload))

watch(selectedId, () => {
  tab.value = 'permissions'
})

// =====================================================
// ADD / RENAME / DELETE ROLE
// =====================================================

const showAdd = ref(false)
const addForm = reactive({ name: '', copyFrom: null as number | null })
const adding = ref(false)
const addError = ref('')

const openAdd = () => {
  addForm.name = ''
  addForm.copyFrom = null
  addError.value = ''
  showAdd.value = true
}

const createRole = async () => {
  addError.value = ''
  if (!addForm.name.trim()) {
    addError.value = 'Enter the role name.'
    return
  }
  adding.value = true
  try {
    const response = await api.create({ name: addForm.name.trim(), copy_from_role_id: addForm.copyFrom })
    showAdd.value = false
    await loadRoles()
    await selectRole(response.data.id)
    success('Role created', 'Now choose what this role can do.')
  } catch (err) {
    addError.value = rolesApiError(err, 'Unable to create the role.')
  } finally {
    adding.value = false
  }
}

const renaming = ref(false)
const renameValue = ref('')

const startRename = () => {
  renameValue.value = role.value?.name ?? ''
  renaming.value = true
}

const saveRename = async () => {
  if (!role.value || !renameValue.value.trim() || renameValue.value.trim() === role.value.name) {
    renaming.value = false
    return
  }
  try {
    const response = await api.rename(role.value.id, renameValue.value.trim())
    role.value = { ...role.value, name: response.data.name }
    renaming.value = false
    await loadRoles()
    success('Role renamed', response.message)
  } catch (err) {
    toastError('Unable to rename', rolesApiError(err, 'Please try again.'))
  }
}

const confirmDelete = ref(false)
const deleting = ref(false)
const deleteError = ref('')

const deleteRole = async () => {
  if (!role.value) return
  deleting.value = true
  deleteError.value = ''
  try {
    await api.remove(role.value.id)
    confirmDelete.value = false
    role.value = null
    selectedId.value = null
    saved.value = []
    checked.clear()
    await loadRoles()
    const first = roles.value[0]
    if (first) await selectRole(first.id)
    success('Role deleted', 'The role was removed.')
  } catch (err) {
    deleteError.value = rolesApiError(err, 'Unable to delete the role.')
  } finally {
    deleting.value = false
  }
}

const roleIcon = (r: RoleSummary) => {
  const n = r.name.toLowerCase()
  if (r.locked) return Crown
  if (n.includes('human') || n.includes('hr')) return Shield
  if (n.includes('payroll')) return WalletCards
  if (n.includes('manager') || n.includes('supervisor')) return BriefcaseBusiness
  if (n.includes('driver') || n.includes('fleet')) return Truck
  return UserRound
}
</script>

<template>
  <section class="roles-page">
    <PageHeader title="Users & Access" description="Who can sign in, and what each role can see and do." />

    <nav class="page-tabs" aria-label="Users and access">
      <NuxtLink to="/admin/settings/users" class="page-tab">System Users</NuxtLink>
      <span class="page-tab active" aria-current="page">Roles & Permissions</span>
    </nav>

    <div v-if="loading" class="state">Loading roles and permissions...</div>
    <div v-else-if="loadError" class="state">
      <strong>Unable to load</strong>
      <span>{{ loadError }}</span>
    </div>

    <template v-else>
      <p v-if="catalog?.missing" class="warn" role="alert">
        {{ catalog.missing }} permission(s) are not in the database yet. Run
        <code>php artisan db:seed --class=PrivilegeSeeder</code> on the backend.
      </p>

      <div class="layout">
        <!-- ROLES -->
        <aside class="panel roles-panel">
          <header class="roles-head">
            <h2>User Roles</h2>
            <button v-if="canCreate" type="button" class="link-btn" @click="openAdd"><Plus :size="15" /> Add Role</button>
          </header>
          <ul class="role-list">
            <li v-for="r in roles" :key="r.id">
              <button
                type="button"
                class="role-item"
                :class="{ active: r.id === selectedId }"
                :aria-current="r.id === selectedId"
                @click="selectRole(r.id)"
              >
                <span class="role-icon" :class="{ gold: r.locked }"><component :is="roleIcon(r)" :size="17" /></span>
                <span class="role-text">
                  <strong>{{ r.name }}</strong>
                  <small>{{ r.portal }}<template v-if="r.locked"> · Locked</template></small>
                </span>
                <span class="role-count">{{ r.users_count }} {{ r.users_count === 1 ? 'User' : 'Users' }}</span>
              </button>
            </li>
          </ul>
        </aside>

        <!-- ROLE DETAIL -->
        <section class="panel detail-panel">
          <div v-if="loadingRole && !role" class="state flat">Loading role...</div>
          <div v-else-if="!role" class="state flat">Select a role.</div>

          <template v-else>
            <header class="detail-head">
              <div class="title-row">
                <template v-if="!renaming">
                  <h2>{{ role.name }}</h2>
                  <button v-if="canEdit && !role.locked" type="button" class="icon-btn" aria-label="Rename role" @click="startRename"><Pencil :size="14" /></button>
                  <button v-if="canDelete && !role.locked" type="button" class="icon-btn danger" aria-label="Delete role" @click="deleteError = ''; confirmDelete = true"><Trash2 :size="14" /></button>
                </template>
                <form v-else class="rename" @submit.prevent="saveRename">
                  <input v-model="renameValue" maxlength="60" aria-label="Role name" autofocus>
                  <AppButton size="sm" @click="saveRename">Save</AppButton>
                  <AppButton size="sm" variant="secondary" @click="renaming = false">Cancel</AppButton>
                </form>
              </div>
              <p>{{ role.portal }} — applies to users with this role ({{ role.users_count }}).</p>
              <div class="tabs">
                <button type="button" :class="{ active: tab === 'permissions' }" @click="tab = 'permissions'">Permissions</button>
                <button type="button" :class="{ active: tab === 'users' }" @click="tab = 'users'">Users ({{ role.users_count }})</button>
              </div>
            </header>

            <p v-if="role.locked" class="locked-note"><Lock :size="14" /> The Administrator role always has every permission and cannot be changed.</p>
            <p v-else-if="!canEdit" class="locked-note"><Lock :size="14" /> You can view this role but not change it.</p>

            <!-- PERMISSIONS -->
            <div v-if="tab === 'permissions'" class="perm-body">
              <nav class="module-nav" aria-label="Modules">
                <button
                  v-for="m in catalog?.modules ?? []"
                  :key="m.key"
                  type="button"
                  class="module-item"
                  :class="{ active: m.key === activeModule }"
                  @click="activeModule = m.key"
                >
                  <component :is="MODULE_ICONS[m.icon ?? ''] ?? Settings" :size="16" />
                  <span>{{ m.label }}</span>
                  <small :class="{ some: moduleCount(m).on > 0 }">{{ moduleCount(m).on }}/{{ moduleCount(m).total }}</small>
                </button>
              </nav>

              <div v-if="module" class="matrix">
                <div class="matrix-head">
                  <div>
                    <h3>{{ module.label }} Permissions</h3>
                    <p>Set what this role can do in {{ module.label }}.</p>
                  </div>
                  <div v-if="editable" class="bulk">
                    <button type="button" class="link-btn" @click="setModule(true)">Allow all</button>
                    <button type="button" class="link-btn muted" @click="setModule(false)">Clear</button>
                  </div>
                </div>

                <div class="table-wrap">
                  <table class="perm-table">
                    <thead>
                      <tr>
                        <th scope="col">Permission</th>
                        <th v-for="c in columns" :key="c" scope="col" class="center">{{ ACTION_LABELS[c] }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="f in module.features" :key="f.key">
                        <th scope="row">
                          <span class="feature">{{ f.label }}</span>
                          <small v-if="f.notes" class="notes">{{ f.notes }}</small>
                        </th>
                        <td v-for="c in columns" :key="c" class="center">
                          <input
                            v-if="f.actions[c]"
                            type="checkbox"
                            class="perm-check"
                            :checked="checked.has(f.actions[c]!)"
                            :disabled="!editable"
                            :aria-label="`${f.label}: ${ACTION_LABELS[c]}`"
                            @change="toggleAction(f.actions, c)"
                          >
                          <span v-else class="na" aria-hidden="true">–</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- USERS -->
            <div v-else class="users-body">
              <p v-if="!role.users.length" class="state flat">No users have this role.</p>
              <table v-else class="perm-table">
                <thead>
                  <tr><th scope="col">Name</th><th scope="col">Email</th><th scope="col">Employee No.</th></tr>
                </thead>
                <tbody>
                  <tr v-for="u in role.users" :key="u.id">
                    <td>{{ u.name }}</td>
                    <td>{{ u.email }}</td>
                    <td>{{ u.emp_id ?? '—' }}</td>
                  </tr>
                </tbody>
              </table>
              <p class="hint">Change a user’s role in System Users.</p>
            </div>

            <footer v-if="tab === 'permissions' && editable" class="detail-foot">
              <span v-if="dirty" class="unsaved">Unsaved changes</span>
              <AppButton variant="secondary" :disabled="!dirty || saving" @click="cancelChanges">Cancel</AppButton>
              <AppButton :disabled="!dirty || saving" @click="save">{{ saving ? 'Saving...' : 'Save Changes' }}</AppButton>
            </footer>
          </template>
        </section>
      </div>
    </template>

    <!-- ADD ROLE -->
    <div v-if="showAdd" class="modal-backdrop" @click.self="showAdd = false">
      <form class="modal" role="dialog" aria-modal="true" aria-labelledby="add-role-title" @submit.prevent="createRole">
        <h2 id="add-role-title">Add Role</h2>
        <p>Create a role, then choose its permissions.</p>
        <label for="role-name">Role name</label>
        <input id="role-name" v-model="addForm.name" maxlength="60" placeholder="e.g. Payroll Officer" autofocus>
        <label for="role-copy">Start from (optional)</label>
        <select id="role-copy" v-model="addForm.copyFrom">
          <option :value="null">No permissions</option>
          <option v-for="r in roles" :key="r.id" :value="r.id">Copy of {{ r.name }}</option>
        </select>
        <p v-if="addError" class="error" role="alert">{{ addError }}</p>
        <div class="modal-actions">
          <AppButton variant="secondary" :disabled="adding" @click="showAdd = false">Cancel</AppButton>
          <AppButton :disabled="adding" @click="createRole">{{ adding ? 'Creating...' : 'Create Role' }}</AppButton>
        </div>
      </form>
    </div>

    <AppConfirmModal
      v-if="confirmDelete && role"
      :title="`Delete ${role.name}?`"
      :message="role.users_count ? `${role.users_count} user(s) still have this role. Move them to another role first.` : 'The role and its permissions are removed.'"
      confirm-label="Delete role"
      danger
      :busy="deleting"
      :error="deleteError"
      @close="confirmDelete = false"
      @confirm="deleteRole"
    />
  </section>
</template>

<style scoped>
.roles-page { width: 100%; max-width: 1600px; margin: 0 auto; display: grid; gap: 14px; }
.back-link { display: inline-flex; width: fit-content; align-items: center; gap: 6px; padding: 0; border: 0; background: transparent; color: var(--primary); font-family: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }

.page-tabs { display: flex; gap: 6px; border-bottom: 1px solid var(--border); }
.page-tab { padding: 10px 14px; border-bottom: 2px solid transparent; color: var(--text-secondary); font-size: 13px; font-weight: 600; }
.page-tab.active { border-color: var(--primary); color: var(--text-primary); }

.state { display: flex; min-height: 200px; flex-direction: column; align-items: center; justify-content: center; gap: 6px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); color: var(--text-muted); font-size: 13px; }
.state.flat { min-height: 160px; border: 0; background: transparent; }
.warn { margin: 0; padding: 10px 12px; border-radius: 9px; background: var(--orange-soft); color: var(--orange); font-size: 12px; }
.warn code { color: var(--text-primary); }

.layout { display: grid; grid-template-columns: 340px minmax(0, 1fr); gap: 14px; align-items: start; }
.panel { overflow: hidden; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }

/* Roles list */
.roles-head { display: flex; align-items: center; justify-content: space-between; padding: 16px 18px; border-bottom: 1px solid var(--border-soft); }
.roles-head h2 { margin: 0; font-size: 16px; }
.link-btn { display: inline-flex; align-items: center; gap: 5px; padding: 0; border: 0; background: transparent; color: var(--primary); font-family: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
.link-btn.muted { color: var(--text-muted); }
.role-list { display: grid; gap: 6px; margin: 0; padding: 10px; list-style: none; }
.role-item { display: flex; width: 100%; align-items: center; gap: 12px; padding: 12px; border: 1px solid transparent; border-radius: 10px; background: transparent; color: inherit; font-family: inherit; text-align: left; cursor: pointer; }
.role-item:hover { background: var(--bg-card-soft); }
.role-item.active { border-color: var(--primary); background: var(--primary-soft); }
.role-icon { display: grid; width: 36px; height: 36px; flex-shrink: 0; place-items: center; border-radius: 9px; background: var(--primary-soft); color: var(--primary); }
.role-icon.gold { background: var(--orange-soft); color: var(--orange); }
.role-text { min-width: 0; flex: 1; }
.role-text strong { display: block; font-size: 13px; }
.role-text small { display: block; margin-top: 2px; color: var(--text-muted); font-size: 11px; }
.role-count { color: var(--text-muted); font-size: 11px; white-space: nowrap; }

/* Detail */
.detail-head { padding: 16px 18px 0; border-bottom: 1px solid var(--border-soft); }
.title-row { display: flex; align-items: center; gap: 8px; }
.title-row h2 { margin: 0; font-size: 18px; }
.detail-head > p { margin: 4px 0 12px; color: var(--text-secondary); font-size: 12px; }
.icon-btn { display: grid; width: 28px; height: 28px; place-items: center; border: 1px solid var(--border); border-radius: 7px; background: transparent; color: var(--text-muted); cursor: pointer; }
.icon-btn:hover { color: var(--primary); border-color: var(--primary); }
.icon-btn.danger:hover { color: var(--red); border-color: var(--red); }
.rename { display: flex; align-items: center; gap: 8px; }
.rename input { height: 34px; padding: 0 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); color: var(--text-primary); font-family: inherit; font-size: 14px; }
.tabs { display: flex; gap: 6px; }
.tabs button { padding: 8px 14px; border: 0; border-radius: 8px 8px 0 0; background: transparent; color: var(--text-secondary); font-family: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
.tabs button.active { background: var(--primary); color: #fff; }
.locked-note { display: flex; align-items: center; gap: 6px; margin: 0; padding: 10px 18px; background: var(--bg-card-soft); color: var(--text-secondary); font-size: 12px; }

.perm-body { display: grid; grid-template-columns: 230px minmax(0, 1fr); min-height: 460px; }
.module-nav { display: flex; max-height: 620px; flex-direction: column; gap: 2px; padding: 10px; border-right: 1px solid var(--border-soft); overflow-y: auto; }
.module-item { display: flex; align-items: center; gap: 10px; padding: 10px; border: 0; border-radius: 8px; background: transparent; color: var(--text-secondary); font-family: inherit; font-size: 13px; text-align: left; cursor: pointer; }
.module-item span { flex: 1; }
.module-item small { color: var(--text-muted); font-size: 10px; }
.module-item small.some { color: var(--green); font-weight: 700; }
.module-item:hover { background: var(--bg-card-soft); color: var(--text-primary); }
.module-item.active { background: var(--primary-soft); color: var(--text-primary); font-weight: 600; }

.matrix { padding: 16px 18px; }
.matrix-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
.matrix-head h3 { margin: 0; font-size: 15px; }
.matrix-head p { margin: 3px 0 0; color: var(--text-secondary); font-size: 12px; }
.bulk { display: flex; gap: 12px; }

.table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: 10px; }
.perm-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.perm-table thead th { padding: 11px 12px; background: var(--primary-soft); color: var(--text-primary); font-size: 12px; font-weight: 700; text-align: left; }
.perm-table tbody th, .perm-table td { padding: 11px 12px; border-top: 1px solid var(--border-soft); color: var(--text-secondary); font-weight: 400; text-align: left; }
.perm-table .center { width: 84px; text-align: center; }
.feature { display: block; color: var(--text-primary); font-weight: 600; }
.notes { display: block; margin-top: 3px; color: var(--text-muted); font-size: 11px; line-height: 1.4; }
.perm-check { width: 18px; height: 18px; cursor: pointer; accent-color: var(--primary); }
.perm-check:disabled { cursor: not-allowed; }
.na { color: var(--text-muted); }

.users-body { padding: 16px 18px; }
.hint { margin: 10px 0 0; color: var(--text-muted); font-size: 12px; }

.detail-foot { display: flex; align-items: center; justify-content: flex-end; gap: 10px; padding: 14px 18px; border-top: 1px solid var(--border-soft); }
.unsaved { margin-right: auto; color: var(--orange); font-size: 12px; font-weight: 600; }

/* Add role modal */
.modal-backdrop { position: fixed; inset: 0; z-index: 300; display: grid; place-items: center; padding: 16px; background: rgba(5, 15, 30, 0.6); }
.modal { display: grid; width: 100%; max-width: 420px; gap: 8px; padding: 22px; border: 1px solid var(--border); border-radius: 14px; background: var(--bg-card); }
.modal h2 { margin: 0; font-size: 17px; }
.modal p { margin: 0 0 6px; color: var(--text-secondary); font-size: 12px; }
.modal label { margin-top: 6px; color: var(--text-secondary); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
.modal input, .modal select { height: 40px; padding: 0 12px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-card-soft); color: var(--text-primary); font-family: inherit; font-size: 13px; }
.modal .error { color: var(--red); }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; }

button:focus-visible, .page-tab:focus-visible, .perm-check:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }

@media (max-width: 1100px) {
  .layout { grid-template-columns: 1fr; }
  .perm-body { grid-template-columns: 1fr; }
  .module-nav { max-height: none; flex-direction: row; flex-wrap: wrap; border-right: 0; border-bottom: 1px solid var(--border-soft); }
}
</style>