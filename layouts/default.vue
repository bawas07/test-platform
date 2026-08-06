<script setup lang="ts">
definePageMeta({
  middleware: 'admin',
})

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const config = useRuntimeConfig()

const appName = config.public.appName as string

const pageTitle = computed(() => {
  const path = route.path
  if (path === '/admin') return 'Dashboard'
  if (path.startsWith('/admin/questions')) return 'Questions'
  if (path.startsWith('/admin/sections')) return 'Sections'
  if (path.startsWith('/admin/tests')) return 'Tests'
  if (path.startsWith('/admin/groups')) return 'Groups'
  if (path.startsWith('/admin/users')) return 'Students'
  if (path.startsWith('/admin/login')) return 'Login'
  return path
})

async function handleLogout() {
  auth.logout()
  await router.push('/admin/login')
}
</script>

<template>
  <div class="admin-layout">
    <!-- Top Bar -->
    <header class="admin-topbar">
      <div class="admin-topbar__left">
        <span class="admin-topbar__app-name">{{ appName }}</span>
        <span class="admin-topbar__page-title">/ {{ pageTitle }}</span>
      </div>
      <div class="admin-topbar__right">
        <span class="admin-topbar__email">{{ auth.admin?.email }}</span>
        <AppButton variant="ghost" size="sm" @click="handleLogout">
          Logout
        </AppButton>
      </div>
    </header>

    <!-- Body -->
    <div class="admin-body">
      <aside class="admin-sidebar">
        <SidebarNav />
      </aside>
      <main class="admin-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ---- Top Bar ---- */

.admin-topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-6);
  height: 56px;
  background-color: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.admin-topbar__app-name {
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--color-text-primary);
}

.admin-topbar__right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.admin-topbar__email {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

/* ---- Body ---- */

.admin-body {
  display: flex;
  flex: 1;
}

.admin-sidebar {
  background-color: var(--color-bg-card);
  border-right: 1px solid var(--color-border);
}

.admin-topbar__page-title {
  display: none;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin-left: var(--space-1);
}

@media (max-width: 1023px) {
  .admin-topbar__page-title {
    display: inline;
  }

  .admin-sidebar {
    display: none;
  }

  .admin-content {
    padding: var(--space-4);
  }
}

.admin-content {
  flex: 1;
  background-color: var(--color-bg-page);
  padding: var(--space-8);
  overflow: auto;
}
</style>
