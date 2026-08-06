<template>
  <div class="blank-layout">
    <slot />
  </div>
</template>

<style scoped>
.blank-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  width: 100%;
  overflow-x: hidden;
}

@media (min-width: 640px) {
  .blank-layout {
    padding: var(--space-6);
  }
}
</style>
