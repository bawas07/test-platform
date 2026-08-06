<script setup lang="ts">
withDefaults(
  defineProps<{
    studentName: string
    testName: string
    dateLabel: string
    score: number
    issuer?: string
  }>(),
  {
    issuer: 'Test Platform Academy',
  },
)
</script>

<template>
  <article class="certificate" aria-label="Certificate">
    <header class="certificate__header">
      <p class="certificate__brand">
        Test Platform
      </p>
    </header>

    <p class="certificate__eyebrow">
      This certifies that
    </p>

    <h1 class="certificate__name">
      {{ studentName }}
    </h1>

    <p class="certificate__eyebrow">
      has completed
    </p>

    <h2 class="certificate__test">
      {{ testName }}
    </h2>

    <p class="certificate__date">
      on {{ dateLabel }}
    </p>

    <p class="certificate__score">
      Score: {{ score }}
    </p>

    <footer class="certificate__footer">
      <p class="certificate__issuer">
        Issued by: {{ issuer }}
      </p>
    </footer>
  </article>
</template>

<style scoped>
.certificate {
  width: 100%;
  max-width: 720px;
  min-height: 520px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-4);
  background-color: #ffffff;
  border: 1px solid var(--color-border);
  border-top: 8px solid var(--color-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-4);
  overflow-wrap: anywhere;
}

@media (min-width: 640px) {
  .certificate {
    padding: var(--space-10) var(--space-8);
  }
}

.certificate__header {
  margin-bottom: var(--space-4);
}

.certificate__brand {
  margin: 0;
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--color-primary-dark);
  letter-spacing: 0.04em;
}

.certificate__eyebrow {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.certificate__name {
  margin: var(--space-2) 0;
  font-size: clamp(var(--text-lg), 8vw, var(--text-2xl));
  font-weight: 700;
  line-height: 1.1;
  color: var(--color-primary-dark);
  max-width: 100%;
}

.certificate__test {
  margin: var(--space-2) 0 0;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

.certificate__date {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.certificate__score {
  margin: var(--space-4) 0 0;
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-primary);
}

.certificate__footer {
  margin-top: auto;
  padding-top: var(--space-8);
  width: 100%;
  border-top: 1px solid var(--color-border);
}

.certificate__issuer {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

@media print {
  .certificate {
    box-shadow: none;
    border-left: none;
    border-right: none;
    border-bottom: none;
    max-width: none;
  }
}
</style>
