<script setup lang="ts">
const route = useRoute()

interface NavItem {
  label: string
  to: string
  icon: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/admin', icon: 'ti-chart-bar' },
  { label: 'Questions', to: '/admin/questions', icon: 'ti-list' },
  { label: 'Sections', to: '/admin/sections', icon: 'ti-layout-list' },
  { label: 'Tests', to: '/admin/tests', icon: 'ti-file-description' },
  { label: 'Groups', to: '/admin/groups', icon: 'ti-users-group' },
  { label: 'Students', to: '/admin/users', icon: 'ti-user' },
  { label: 'Results', to: '/admin/groups/group-1/results', icon: 'ti-chart-bar' },
]

function isActive(to: string): boolean {
  if (to === '/admin') {
    return route.path === '/admin'
  }
  return route.path.startsWith(to)
}
</script>

<template>
  <nav class="sidebar-nav">
    <ul class="sidebar-nav__list">
      <li v-for="item in navItems" :key="item.to">
        <NuxtLink
          :to="item.to"
          class="sidebar-nav__link"
          :class="{ 'sidebar-nav__link--active': isActive(item.to) }"
        >
          <i class="ti sidebar-nav__icon" :class="item.icon" aria-hidden="true" />
          <span class="sidebar-nav__label">{{ item.label }}</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.sidebar-nav {
  width: 240px;
  flex-shrink: 0;
  padding: var(--space-4) 0;
}

.sidebar-nav__list {
  list-style: none;
  margin: 0;
  padding: 0 var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.sidebar-nav__link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  text-decoration: none;
  border-left: 3px solid transparent;
  transition:
    background-color 150ms ease,
    color 150ms ease,
    border-color 150ms ease;
}

.sidebar-nav__link:hover {
  background-color: var(--color-bg-page);
  color: var(--color-text-primary);
}

.sidebar-nav__link--active {
  background-color: var(--color-bg-tint);
  color: var(--color-primary-dark);
  border-left-color: var(--color-primary);
}

.sidebar-nav__icon {
  font-size: var(--text-md);
  flex-shrink: 0;
  line-height: 1;
}
</style>
