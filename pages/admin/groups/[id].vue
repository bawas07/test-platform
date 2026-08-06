<script setup lang="ts">
const store = useAdminStore()
const toast = useToastStore()
const route = useRoute()

const groupId = computed(() => route.params.id as string)
const group = computed(() => store.groups.find((g) => g.id === groupId.value))

// Local copy
const localName = ref('')
const localTestId = ref('')
const localStartTime = ref('')
const localEndTime = ref('')
const localCertDelay = ref(48)
const localUserIds = ref<string[]>([])

watch(
  group,
  (g) => {
    if (!g) return
    localName.value = g.name
    localTestId.value = g.testId
    localStartTime.value = g.startTime ? toDatetimeLocal(g.startTime) : ''
    localEndTime.value = g.endTime ? toDatetimeLocal(g.endTime) : ''
    localCertDelay.value = g.certificateDelayHours
    localUserIds.value = [...g.userIds]
  },
  { immediate: true },
)

function toDatetimeLocal(iso: string): string {
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return ''
    // Format as YYYY-MM-DDTHH:mm
    const offset = d.getTimezoneOffset()
    const local = new Date(d.getTime() - offset * 60000)
    return local.toISOString().slice(0, 16)
  } catch {
    return ''
  }
}

// Assigned users
const assignedUsers = computed(() =>
  localUserIds.value
    .map((id) => store.users.find((u) => u.id === id))
    .filter(Boolean) as Array<{
      id: string
      name: string
      email: string
      testCode: string
      certificateEnabled: boolean
    }>,
)

const availableUsers = computed(() =>
  store.users.filter((u) => !localUserIds.value.includes(u.id)),
)

function addUser(userId: string) {
  localUserIds.value = [...localUserIds.value, userId]
}

function removeUser(userId: string) {
  localUserIds.value = localUserIds.value.filter((id) => id !== userId)
}

async function saveGroup() {
  const old = group.value
  if (old) {
    const added = localUserIds.value.filter((id) => !old.userIds.includes(id))
    const removed = old.userIds.filter((id) => !localUserIds.value.includes(id))
    for (const userId of added) {
      await store.assignUserToGroup(groupId.value, userId)
    }
    for (const userId of removed) {
      await store.removeUserFromGroup(groupId.value, userId)
    }
  }
  try {
    await store.updateGroup(groupId.value, {
      name: localName.value,
      testId: localTestId.value,
      startTime: localStartTime.value ? new Date(localStartTime.value).toISOString() : '',
      endTime: localEndTime.value ? new Date(localEndTime.value).toISOString() : '',
      certificateDelayHours: localCertDelay.value,
      userIds: localUserIds.value,
    })
    toast.show('Group saved', 'success')
  } catch (err) {
    toast.show(err instanceof Error ? err.message : 'Failed to save group', 'danger')
  }
}

async function deleteThis() {
  if (!confirm('Delete this group?')) return
  try {
    await store.deleteGroup(groupId.value)
    toast.show('Group deleted', 'success')
    await navigateTo('/admin/groups')
  } catch (err) {
    toast.show(err instanceof Error ? err.message : 'Failed to delete group', 'danger')
  }
}
</script>

<template>
  <div v-if="!group" class="not-found">
    <p>Group not found.</p>
    <NuxtLink to="/admin/groups" class="back-link">← Back to groups</NuxtLink>
  </div>

  <div v-else>
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-heading">Group: {{ group.name }}</h1>
      <div class="header-actions">
        <AppButton variant="primary" @click="saveGroup">Save</AppButton>
        <AppButton variant="danger" @click="deleteThis">Delete</AppButton>
      </div>
    </div>

    <!-- Form Card -->
    <AppCard padding="md" class="form-card">
      <AppInput v-model="localName" label="Name" />

      <div class="scoring-field">
        <label class="field-label">Test</label>
        <select v-model="localTestId" class="styled-select">
          <option value="">— Select a test —</option>
          <option v-for="t in store.tests" :key="t.id" :value="t.id">
            {{ t.name }}
          </option>
        </select>
      </div>

      <AppInput v-model="localStartTime" label="Start time" type="datetime-local" />
      <AppInput v-model="localEndTime" label="End time" type="datetime-local" />
      <AppInput v-model.number="localCertDelay" label="Certificate delay (hours)" type="number" />
    </AppCard>

    <!-- Students Card -->
    <AppCard padding="md" class="form-card">
      <h2 class="card-heading">Students ({{ assignedUsers.length }})</h2>

      <div v-if="assignedUsers.length > 0" class="student-table">
        <div class="student-header">
          <span class="student-col name-col">Name</span>
          <span class="student-col email-col">Email</span>
          <span class="student-col code-col">Code</span>
          <span class="student-col cert-col">Certificate</span>
          <span class="student-col actions-col"></span>
        </div>
        <div v-for="user in assignedUsers" :key="user.id" class="student-row">
          <button class="student-link name-col" type="button" @click="navigateTo(`/admin/users/${user.id}`)">
            {{ user.name }}
          </button>
          <span class="student-col email-col">{{ user.email || '—' }}</span>
          <code class="student-col code-col">{{ user.testCode }}</code>
          <span class="student-col cert-col">
            <AppBadge :label="user.certificateEnabled ? 'Yes' : 'No'" :variant="user.certificateEnabled ? 'success' : 'neutral'" />
          </span>
          <span class="student-col actions-col">
            <AppButton variant="ghost" size="sm" class="delete-ghost" @click="removeUser(user.id)">Remove</AppButton>
          </span>
        </div>
      </div>
      <div v-else class="empty-hint">No students assigned yet.</div>

      <!-- Add student -->
      <div v-if="availableUsers.length > 0" class="available-section">
        <h3 class="available-heading">Add student</h3>
        <div class="available-list">
          <button
            v-for="user in availableUsers"
            :key="user.id"
            type="button"
            class="add-user-btn"
            @click="addUser(user.id)"
          >
            + {{ user.name }} ({{ user.email || user.testCode }})
          </button>
        </div>
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

.scoring-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.field-label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-primary);
}

.styled-select {
  height: 40px;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-card);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  font-family: inherit;
  outline: none;
  cursor: pointer;
}

.styled-select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary) 35%, transparent);
}

.empty-hint {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  text-align: center;
  padding: var(--space-2) 0;
}

/* Student table */
.student-table {
  display: flex;
  flex-direction: column;
}

.student-header {
  display: flex;
  align-items: center;
  padding: var(--space-2) var(--space-3);
  border-bottom: 2px solid var(--color-border);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-secondary);
}

.student-row {
  display: flex;
  align-items: center;
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.student-row:hover {
  background-color: var(--color-bg-page);
}

.student-col {
  font-size: var(--text-sm);
  color: var(--color-text-primary);
}

.name-col {
  flex: 2;
  min-width: 120px;
}

.email-col {
  flex: 2;
  min-width: 140px;
}

.code-col {
  flex: 1;
  min-width: 90px;
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  background-color: var(--color-bg-page);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}

.cert-col {
  flex: 1;
  min-width: 80px;
}

.actions-col {
  flex: 0 0 auto;
  text-align: right;
}

.student-link {
  background: none;
  border: none;
  padding: 0;
  color: var(--color-primary);
  font-size: var(--text-sm);
  font-family: inherit;
  cursor: pointer;
  text-align: left;
}

.student-link:hover {
  text-decoration: underline;
}

.available-section {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

.available-heading {
  margin: 0 0 var(--space-2);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.available-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.add-user-btn {
  display: block;
  width: 100%;
  text-align: left;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-card);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  font-family: inherit;
  cursor: pointer;
  transition: border-color 150ms ease, background-color 150ms ease;
}

.add-user-btn:hover {
  border-color: var(--color-primary);
  background-color: var(--color-bg-tint);
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
</style>
