<script setup lang="ts">
const store = useAdminStore()
const toast = useToastStore()
const route = useRoute()

const userId = computed(() => route.params.id as string)
const user = computed(() => store.users.find((u) => u.id === userId.value))

// Edit mode
const isEditing = ref(false)
const editName = ref('')
const editEmail = ref('')
const editPhone = ref('')
const editCertEnabled = ref(false)

function startEdit() {
  if (!user.value) return
  editName.value = user.value.name
  editEmail.value = user.value.email
  editPhone.value = user.value.phone
  editCertEnabled.value = user.value.certificateEnabled
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
}

async function saveEdit() {
  if (!editName.value.trim()) return
  await store.updateUser(userId.value, {
    name: editName.value.trim(),
    email: editEmail.value.trim(),
    phone: editPhone.value.trim(),
    certificateEnabled: editCertEnabled.value,
  })
  toast.show('Student updated', 'success')
  isEditing.value = false
}

// Groups this student belongs to
const userGroups = computed(() =>
  store.groups.filter((g) => g.userIds.includes(userId.value)),
)

// Attempts / scores for this student
const userAttempts = computed(() =>
  store.attempts.filter((a) => a.userId === userId.value),
)

function testNameForGroup(groupId: string): string {
  const group = store.groups.find((g) => g.id === groupId)
  if (!group) return '—'
  return store.tests.find((t) => t.id === group.testId)?.name ?? '—'
}

function groupNameForAttempt(groupId: string): string {
  return store.groups.find((g) => g.id === groupId)?.name ?? '—'
}
</script>

<template>
  <div v-if="!user" class="not-found">
    <p>Student not found.</p>
    <NuxtLink to="/admin/users" class="back-link">← Back to students</NuxtLink>
  </div>

  <div v-else>
    <div class="page-header">
      <h1 class="page-heading">{{ user.name }}</h1>
      <div class="header-actions">
        <AppButton v-if="!isEditing" variant="primary" @click="startEdit"><i class="ti ti-edit" /> Edit</AppButton>
        <AppButton v-if="isEditing" variant="primary" @click="saveEdit">Save</AppButton>
        <AppButton v-if="isEditing" variant="ghost" @click="cancelEdit">Cancel</AppButton>
      </div>
    </div>

    <!-- Detail Card -->
    <AppCard padding="md" class="form-card">
      <template v-if="!isEditing">
        <dl class="detail-list">
          <div class="detail-row"><dt class="detail-label">Name</dt><dd class="detail-value">{{ user.name }}</dd></div>
          <div class="detail-row"><dt class="detail-label">Email</dt><dd class="detail-value">{{ user.email || '—' }}</dd></div>
          <div class="detail-row"><dt class="detail-label">Phone</dt><dd class="detail-value">{{ user.phone || '—' }}</dd></div>
          <div class="detail-row"><dt class="detail-label">Test code</dt><dd class="detail-value"><code>{{ user.testCode }}</code></dd></div>
          <div class="detail-row"><dt class="detail-label">Certificate</dt><dd class="detail-value"><AppBadge :label="user.certificateEnabled ? 'Enabled' : 'Disabled'" :variant="user.certificateEnabled ? 'success' : 'neutral'" /></dd></div>
        </dl>
      </template>
      <template v-else>
        <div class="edit-form">
          <AppInput v-model="editName" label="Name" />
          <AppInput v-model="editEmail" label="Email" type="email" />
          <AppInput v-model="editPhone" label="Phone" />
          <label class="toggle-label">
            <input v-model="editCertEnabled" type="checkbox" class="toggle-checkbox"> Certificate enabled
          </label>
        </div>
      </template>
    </AppCard>

    <!-- Groups -->
    <AppCard padding="md" class="form-card">
      <h2 class="card-heading">Groups ({{ userGroups.length }})</h2>
      <div v-if="userGroups.length > 0" class="related-list">
        <button
          v-for="g in userGroups"
          :key="g.id"
          type="button"
          class="related-link"
          @click="navigateTo(`/admin/groups/${g.id}`)"
        >
          {{ g.name }} — {{ testNameForGroup(g.id) }}
        </button>
      </div>
      <div v-else class="empty-hint">Not assigned to any group.</div>
    </AppCard>

    <!-- Scores -->
    <AppCard v-if="userAttempts.length > 0" padding="md" class="form-card">
      <h2 class="card-heading">Scores</h2>
      <div class="scores-table-wrap">
        <table class="scores-table">
          <thead>
            <tr>
              <th>Group</th>
              <th>Test</th>
              <th>Status</th>
              <th>Total Score</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in userAttempts" :key="a.id">
              <td>
                <button class="related-link" type="button" @click="navigateTo(`/admin/groups/${a.groupId}`)">
                  {{ groupNameForAttempt(a.groupId) }}
                </button>
              </td>
              <td>{{ testNameForGroup(a.groupId) }}</td>
              <td><AppBadge :label="a.status" :variant="a.status === 'completed' ? 'success' : 'primary'" /></td>
              <td class="score-value">{{ a.totalScore }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </AppCard>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
  gap: var(--space-3);
}

.page-heading {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

.header-actions {
  display: flex;
  gap: var(--space-3);
}

.form-card {
  margin-bottom: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.card-heading {
  margin: 0 0 var(--space-1);
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--color-text-primary);
}

.detail-list {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.detail-row {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
}

.detail-label {
  width: 120px;
  flex-shrink: 0;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.detail-value {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-text-primary);
}

.empty-hint {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  text-align: center;
  padding: var(--space-2) 0;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.related-link {
  display: block;
  width: 100%;
  text-align: left;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-card);
  color: var(--color-primary);
  font-size: var(--text-sm);
  font-family: inherit;
  cursor: pointer;
  transition: border-color 150ms ease, background-color 150ms ease;
}

.related-link:hover {
  border-color: var(--color-primary);
  background-color: var(--color-bg-tint);
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

.edit-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.not-found {
  text-align: center;
  padding: var(--space-12) 0;
  color: var(--color-text-muted);
}

.back-link {
  color: var(--color-primary);
  text-decoration: none;
  font-size: var(--text-sm);
}

.back-link:hover {
  text-decoration: underline;
}

.scores-table-wrap {
  overflow-x: auto;
}

.scores-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}

.scores-table th {
  text-align: left;
  padding: var(--space-2) var(--space-3);
  border-bottom: 2px solid var(--color-border);
  color: var(--color-text-secondary);
  font-weight: 600;
  font-size: var(--text-xs);
}

.scores-table td {
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.score-value {
  font-weight: 600;
  color: var(--color-primary-dark);
}
</style>
