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
    .filter(Boolean) as Array<{ id: string; name: string }>,
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

    <!-- Users Card -->
    <AppCard padding="md" class="form-card">
      <h2 class="card-heading">Users</h2>

      <div v-if="assignedUsers.length === 0" class="empty-hint">
        No users assigned yet.
      </div>

      <div v-else class="user-chip-list">
        <span v-for="user in assignedUsers" :key="user.id" class="user-chip">
          {{ user.name }}
          <button
            type="button"
            class="chip-remove-btn"
            aria-label="Remove user"
            @click="removeUser(user.id)"
          >
            ×
          </button>
        </span>
      </div>

      <div v-if="availableUsers.length > 0" class="available-section">
        <h3 class="available-heading">Add users</h3>
        <div class="available-list">
          <button
            v-for="user in availableUsers"
            :key="user.id"
            type="button"
            class="add-user-btn"
            @click="addUser(user.id)"
          >
            + {{ user.name }}
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

.user-chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.user-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  background-color: var(--color-bg-tint);
  color: var(--color-primary-dark);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 500;
}

.chip-remove-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  border: none;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-text-muted);
  font-size: 14px;
  cursor: pointer;
  line-height: 1;
}

.chip-remove-btn:hover {
  background-color: var(--color-danger-bg);
  color: var(--color-danger);
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
