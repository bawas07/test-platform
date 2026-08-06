<script setup lang="ts">
export interface DataTableColumn {
  key: string
  label: string
  sortable?: boolean
}

const props = withDefaults(
  defineProps<{
    columns: DataTableColumn[]
    rows: Record<string, any>[]
    loading?: boolean
    emptyMessage?: string
    pageSize?: number
    pageSizeOptions?: number[]
  }>(),
  {
    loading: false,
    emptyMessage: 'No data',
    pageSize: 10,
    pageSizeOptions: () => [10, 25, 50],
  },
)

const emit = defineEmits<{
  sort: [columnKey: string]
}>()

const sortColumn = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc'>('asc')

// Internal pagination state
const currentPage = ref(1)
const currentPageSize = ref(props.pageSize)

watch(() => props.rows, () => {
  currentPage.value = 1
})

const totalItems = computed(() => props.rows.length)
const totalPages = computed(() => Math.ceil(totalItems.value / currentPageSize.value) || 1)
const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * currentPageSize.value
  return props.rows.slice(start, start + currentPageSize.value)
})

function toggleSort(columnKey: string): void {
  if (sortColumn.value === columnKey) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = columnKey
    sortDirection.value = 'asc'
  }
  emit('sort', columnKey)
}

function goToPage(pageNum: number): void {
  if (pageNum < 1 || pageNum > totalPages.value) return
  currentPage.value = pageNum
}

const visiblePageNumbers = computed(() => {
  const total = totalPages.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = []
  const current = currentPage.value

  pages.push(1)
  if (current > 3) pages.push('ellipsis-start')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('ellipsis-end')
  pages.push(total)

  return pages
})

function setPageSize(size: number) {
  currentPageSize.value = size
  currentPage.value = 1
}

const hasPagination = computed(() => totalItems.value > 0)
const showEmpty = computed(() => !props.loading && props.rows.length === 0)
</script>

<template>
  <div class="data-table-wrapper">
    <!-- Table -->
    <div class="data-table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              class="data-table__th"
              :class="{ 'data-table__th--sortable': col.sortable }"
              :aria-sort="
                col.sortable && sortColumn === col.key
                  ? sortDirection === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : undefined
              "
              @click="col.sortable ? toggleSort(col.key) : undefined"
            >
              <span class="data-table__th-label">{{ col.label }}</span>
              <span
                v-if="col.sortable && sortColumn === col.key"
                class="data-table__sort-icon"
              >
                {{ sortDirection === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
          </tr>
        </thead>

        <tbody v-if="!showEmpty">
          <!-- Loading skeleton -->
          <template v-if="loading">
            <tr v-for="n in currentPageSize" :key="n" class="data-table__skeleton-row">
              <td v-for="col in columns" :key="col.key" class="data-table__td">
                <div class="data-table__skeleton" />
              </td>
            </tr>
          </template>

          <!-- Data rows -->
          <template v-else>
            <tr v-for="row in paginatedRows" :key="row.id ?? JSON.stringify(row)" class="data-table__row">
              <td v-for="col in columns" :key="col.key" class="data-table__td">
                <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                  {{ row[col.key] }}
                </slot>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Empty state -->
    <div v-if="showEmpty" class="data-table__empty">
      <i class="ti ti-inbox data-table__empty-icon" aria-hidden="true" />
      <p class="data-table__empty-text">{{ emptyMessage }}</p>
    </div>

    <!-- Pagination -->
    <div v-if="hasPagination" class="data-table__pagination">
      <div class="data-table__pagination-row">
        <span class="data-table__page-size-label">Rows per page:</span>
        <select
          class="data-table__page-size-select"
          :value="currentPageSize"
          @change="setPageSize(Number(($event.target as HTMLSelectElement).value))"
        >
          <option
            v-for="size in props.pageSizeOptions"
            :key="size"
            :value="size"
          >
            {{ size }}
          </option>
        </select>
      </div>

      <div class="data-table__pagination-row">
        <span class="data-table__page-info">
          {{ (currentPage - 1) * currentPageSize + 1 }}–{{
            Math.min(currentPage * currentPageSize, totalItems)
          }} of {{ totalItems }}
        </span>

        <div class="data-table__page-btns">
          <button
            class="data-table__page-btn"
            :disabled="currentPage <= 1"
            aria-label="First page"
            @click="goToPage(1)"
          >
            «
          </button>
          <button
            class="data-table__page-btn"
            :disabled="currentPage <= 1"
            aria-label="Previous page"
            @click="goToPage(currentPage - 1)"
          >
            ‹
          </button>

          <template v-for="p in visiblePageNumbers" :key="p">
            <span v-if="p === 'ellipsis-start' || p === 'ellipsis-end'" class="data-table__ellipsis">…</span>
            <button
              v-else
              class="data-table__page-btn"
              :class="{ 'data-table__page-btn--active': currentPage === p }"
              :aria-current="currentPage === p ? 'page' : undefined"
              @click="goToPage(p)"
            >
              {{ p }}
            </button>
          </template>

          <button
            class="data-table__page-btn"
            :disabled="currentPage >= totalPages"
            aria-label="Next page"
            @click="goToPage(currentPage + 1)"
          >
            ›
          </button>
          <button
            class="data-table__page-btn"
            :disabled="currentPage >= totalPages"
            aria-label="Last page"
            @click="goToPage(totalPages)"
          >
            »
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.data-table-wrapper {
  width: 100%;
}

.data-table-scroll {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}

.data-table__th {
  text-align: left;
  padding: var(--space-3) var(--space-4);
  border-bottom: 2px solid var(--color-border);
  color: var(--color-text-secondary);
  font-weight: 600;
  font-size: var(--text-xs);
  white-space: nowrap;
  user-select: none;
}

.data-table__th--sortable {
  cursor: pointer;
}

.data-table__th--sortable:hover {
  color: var(--color-text-primary);
}

.data-table__th-label {
  margin-right: var(--space-1);
}

.data-table__sort-icon {
  font-size: 10px;
}

.data-table__td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-primary);
}

.data-table__row:hover {
  background-color: var(--color-bg-page);
}

/* Skeleton */
.data-table__skeleton-row {
  pointer-events: none;
}

.data-table__skeleton {
  height: 16px;
  border-radius: var(--radius-sm);
  background: linear-gradient(
    90deg,
    var(--color-border) 25%,
    color-mix(in srgb, var(--color-border) 50%, transparent) 50%,
    var(--color-border) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Empty */
.data-table__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12) var(--space-4);
  color: var(--color-text-muted);
}

.data-table__empty-icon {
  font-size: 40px;
  margin-bottom: var(--space-3);
  opacity: 0.5;
}

.data-table__empty-text {
  margin: 0;
  font-size: var(--text-sm);
}

/* Pagination */
.data-table__pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4) 0 0;
  flex-wrap: wrap;
}

.data-table__pagination-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.data-table__page-size-label {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.data-table__page-size-select {
  height: 32px;
  padding: 0 var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-card);
  color: var(--color-text-primary);
  font-size: var(--text-xs);
  font-family: inherit;
}

.data-table__page-info {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.data-table__page-btns {
  display: flex;
  align-items: center;
  gap: 2px;
}

.data-table__page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-card);
  color: var(--color-text-secondary);
  font-size: var(--text-xs);
  font-family: inherit;
  cursor: pointer;
  transition:
    background-color 150ms ease,
    color 150ms ease,
    border-color 150ms ease;
}

.data-table__page-btn:hover:not(:disabled) {
  background-color: var(--color-bg-page);
  color: var(--color-text-primary);
}

.data-table__page-btn--active {
  background-color: var(--color-bg-tint);
  border-color: var(--color-primary);
  color: var(--color-primary-dark);
  font-weight: 600;
}

.data-table__page-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.data-table__ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  user-select: none;
}
</style>
