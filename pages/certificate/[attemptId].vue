<script setup lang="ts">
import type { CertificateData } from '~/types/test'

definePageMeta({
  layout: 'blank',
})

const route = useRoute()
const testStore = useTestStore()

const attemptId = computed(() => String(route.params.attemptId))
const isDownloading = ref(false)
const downloadError = ref<string | null>(null)
const certificateRef = ref<HTMLElement | null>(null)

if (!testStore.isAttemptMatch(attemptId.value)) {
  await navigateTo('/')
}

const baseCertificate = await testStore.getCertificate()

const certificate = computed<CertificateData>(() => {
  if (!testStore.attempt) return baseCertificate

  return {
    ...baseCertificate,
    studentName: testStore.attempt.studentName,
    testName: testStore.attempt.testName,
    score: testStore.attempt.totalScore ?? baseCertificate.score,
  }
})

async function downloadPdf() {
  if (!certificateRef.value || isDownloading.value) return

  isDownloading.value = true
  downloadError.value = null

  try {
    const html2pdfModule = await import('html2pdf.js')
    const html2pdf = html2pdfModule.default ?? html2pdfModule

    const studentSlug = certificate.value?.studentName.replace(/\s+/g, '-').toLowerCase() ?? 'student'
    const filename = `certificate-${studentSlug}.pdf`

    await html2pdf()
      .set({
        margin: 10,
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(certificateRef.value)
      .save()
  } catch (error) {
    console.error('Certificate PDF download failed', error)
    downloadError.value = 'Could not generate the PDF. Please try again.'
  } finally {
    isDownloading.value = false
  }
}
</script>

<template>
  <div v-if="certificate" class="certificate-page">
    <div ref="certificateRef" class="certificate-page__sheet">
      <CertificateView
        :student-name="certificate.studentName"
        :test-name="certificate.testName"
        :date-label="certificate.dateLabel"
        :score="certificate.score"
        :issuer="certificate.issuer"
      />
    </div>

    <div class="certificate-page__actions">
      <p v-if="downloadError" class="certificate-page__error">
        {{ downloadError }}
      </p>
      <AppButton
        size="lg"
        :loading="isDownloading"
        @click="downloadPdf"
      >
        <i class="ti ti-download" aria-hidden="true" />
        Download PDF
      </AppButton>
    </div>
  </div>
</template>

<style scoped>
.certificate-page {
  width: min(760px, 100%);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  align-items: center;
}

.certificate-page__sheet {
  width: 100%;
}

.certificate-page__actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.certificate-page__error {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-danger);
}
</style>
