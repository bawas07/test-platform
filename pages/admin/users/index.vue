<script setup lang="ts">
import type { AdminUser } from '~/types/admin'

const store = useAdminStore()
const toast = useToastStore()

const showModal = ref(false)
const editingId = ref<string | null>(null)

// Form state
const formName = ref('')
const formCertEnabled = ref(false)
const formTestCode = ref('')

function openCreate() {
  editingId.value = null
  formName.value = ''
  formCertEnabled.value = false
  formTestCode.value = ''
  showModal.value = true
}

function openEdit(user: AdminUser) {
  editingId.value = user.id
  formName.value = user.name
  formCertEnabled.value = user.certificateEnabled
  formTestCode.value = user.testCode
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingId.value = null
}

async function saveUser() {
  if (!formName.value.trim()) return

  try {
    if (editingId.value) {
      await store.updateUser(editingId.value, {
        name: formName.value.trim(),
        certificateEnabled: formCertEnabled.value,
      })
      toast.show('Student updated', 'success')
    } else {
      await store.createUser({
        name: formName.value.trim(),
        certificateEnabled: formCertEnabled.value,
        groupIds: [],
      })
      toast.show('Student created', 'success')
    }
    closeModal()
  } catch (err) {
    toast.show(err instanceof Error ? err.message : 'Failed to save student', 'danger')
  }
}

async function deleteUser(id: string) {
  if (!confirm('Delete this student?')) return
  try {
    await store.deleteUser(id)
    toast.show('Student deleted', 'success')
  } catch (err) {
    toast.show(err instanceof Error ? err.message : 'Failed to delete student', 'danger')
  }
}

function groupNames(user: AdminUser): string[] {
  return user.groupIds
    .map((gid) => store.groups.find((g) => g.id === gid)?.name)
    .filter(Boolean) as string[]
}

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'testCode', label: 'Test Code' },
  { key: 'certificate', label: 'Certificate' },
  { key: 'groups', label: 'Groups' },
  { key: 'actions', label: 'Actions' },
]
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-heading">Students</h1>
      <AppButton variant="primary" size="md" @click="openCreate">
        <i class="ti ti-plus" /> Add student
      </AppButton>
    </div>

    <DataTable :columns="columns" :rows="store.users">
      <template #cell-certificate="{ row }">
        <AppBadge
          :label="row.certificateEnabled ? 'Enabled' : 'Disabled'"
          :variant="row.certificateEnabled ? 'success' : 'neutral'"
        />
      </template>
      <template #cell-groups="{ row }">
        <div class="badge-stack">
          <AppBadge
            v-for="name in groupNames(row)"
            :key="name"
            :label="name"
            variant="primary"
          />
          <span v-if="groupNames(row).length === 0" class="no-groups">—</span>
        </div>
      </template>
      <template #cell-actions="{ row }">
        <div class="actions-cell">
          <AppButton variant="ghost" size="sm" @click="openEdit(row)"><i class="ti ti-edit" /> Edit</AppButton>
          <AppButton variant="ghost" size="sm" class="delete-ghost" @click="deleteUser(row.id)"><i class="ti ti-trash" /> Delete</AppButton>
        </div>
      </template>
    </DataTable>

    <!-- Modal -->
    <AppModal v-model="showModal" :title="editingId ? 'Edit student' : 'Add student'">
      <div class="modal-form">
        <AppInput v-model="formName" label="Name" placeholder="Student name" />

        <div v-if="editingId" class="readonly-field">
          <label class="field-label">Test Code</label>
          <p class="readonly-value">{{ formTestCode }}</p>
        </div>

        <label class="toggle-label">
          <input v-model="formCertEnabled" type="checkbox" class="toggle-checkbox">
          Certificate enabled
        </label>
      </div>

      <template #footer>
        <AppButton variant="ghost" @click="closeModal">Cancel</AppButton>
        <AppButton variant="primary" @click="saveUser">
          {{ editingId ? 'Save student' : 'Save student' }}
        </AppButton>
      </template>
    </AppModal>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-6);
}

.page-heading {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

.actions-cell {
  display: flex;
  gap: var(--space-1);
}

.delete-ghost {
  color: var(--color-danger);
}

.delete-ghost:hover {
  color: var(--color-danger);
  background-color: var(--color-danger-bg);
}

.badge-stack {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.no-groups {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

/* Modal */
.modal-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.readonly-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.field-label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-primary);
}

.readonly-value {
  margin: 0;
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-bg-page);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  font-family: monospace;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  cursor: pointer;
}

.toggle-checkbox {
  accent-color: var(--color-primary);
  cursor: pointer;
}
</style>
