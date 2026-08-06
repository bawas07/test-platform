<script setup lang="ts">
const store = useAdminStore()
const route = useRoute()

const groupId = computed(() => route.params.id as string)
const group = computed(() => store.groups.find((g) => g.id === groupId.value))

const attempts = computed(() => store.getAttemptsForGroup(groupId.value))

const sectionNames = computed(() => {
  const names = new Set<string>()
  for (const attempt of attempts.value) {
    for (const score of attempt.sectionScores) {
      names.add(score.sectionName)
    }
  }
  return Array.from(names)
})
</script>

<template>
  <div v-if="!group" class="not-found">
    <p>Group not found.</p>
    <NuxtLink to="/admin/groups" class="back-link">← Back to groups</NuxtLink>
  </div>

  <div v-else>
    <div class="page-header">
      <h1 class="page-heading">Results: {{ group.name }}</h1>
      <AppButton variant="ghost" size="sm" @click="navigateTo(`/admin/groups/${groupId}`)">
        ← Back to group
      </AppButton>
    </div>

    <AppCard padding="md">
      <ResultsTable :attempts="attempts" :section-names="sectionNames" />
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
