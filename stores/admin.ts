import type {
  AdminAttempt,
  AdminGroup,
  AdminQuestion,
  AdminSection,
  AdminTest,
  AdminUser,
  ScoreMapRow,
  TestSectionAssignment,
} from '~/types/admin'
import {
  sampleAttempts,
  sampleGroups,
  sampleQuestions,
  sampleSections,
  sampleTests,
  sampleUsers,
} from '~/data/sample-admin'

function generateCode(): string {
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `USER-${suffix}`
}

function cloneArray<T>(arr: readonly T[]): T[] {
  return arr.map((item) => ({ ...item }) as T)
}

export const useAdminStore = defineStore('admin', () => {
  const questions = ref<AdminQuestion[]>([])
  const sections = ref<AdminSection[]>([])
  const tests = ref<AdminTest[]>([])
  const groups = ref<AdminGroup[]>([])
  const users = ref<AdminUser[]>([])
  const attempts = ref<AdminAttempt[]>([])

  // -----------------------------------------------------------------------
  // Initialization
  // -----------------------------------------------------------------------

  function initFromSamples(): void {
    questions.value = cloneArray(sampleQuestions)
    sections.value = cloneArray(sampleSections)
    tests.value = cloneArray(sampleTests)
    groups.value = cloneArray(sampleGroups)
    users.value = cloneArray(sampleUsers)
    attempts.value = cloneArray(sampleAttempts)
  }

  // Auto-init on store creation so consuming pages don't need to call it
  initFromSamples()

  // -----------------------------------------------------------------------
  // Questions CRUD
  // -----------------------------------------------------------------------

  async function createQuestion(
    data: Omit<AdminQuestion, 'id'>,
  ): Promise<AdminQuestion> {
    const newQuestion: AdminQuestion = {
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ...data,
    }
    questions.value = [...questions.value, newQuestion]
    return newQuestion
  }

  async function updateQuestion(
    id: string,
    data: Partial<Omit<AdminQuestion, 'id'>>,
  ): Promise<AdminQuestion> {
    const idx = questions.value.findIndex((q) => q.id === id)
    if (idx === -1) throw new Error(`Question ${id} not found`)

    const updated: AdminQuestion = { ...questions.value[idx], ...data }
    questions.value = [
      ...questions.value.slice(0, idx),
      updated,
      ...questions.value.slice(idx + 1),
    ]
    return updated
  }

  async function deleteQuestion(id: string): Promise<void> {
    const found = questions.value.some((q) => q.id === id)
    if (!found) throw new Error(`Question ${id} not found`)
    questions.value = questions.value.filter((q) => q.id !== id)
  }

  // -----------------------------------------------------------------------
  // Sections CRUD
  // -----------------------------------------------------------------------

  async function createSection(
    data: Omit<AdminSection, 'id'>,
  ): Promise<AdminSection> {
    const newSection: AdminSection = {
      id: `section-${Date.now()}`,
      ...data,
    }
    sections.value = [...sections.value, newSection]
    return newSection
  }

  async function updateSection(
    id: string,
    data: Partial<Omit<AdminSection, 'id'>>,
  ): Promise<AdminSection> {
    const idx = sections.value.findIndex((s) => s.id === id)
    if (idx === -1) throw new Error(`Section ${id} not found`)

    const updated: AdminSection = { ...sections.value[idx], ...data }
    sections.value = [
      ...sections.value.slice(0, idx),
      updated,
      ...sections.value.slice(idx + 1),
    ]
    return updated
  }

  async function deleteSection(id: string): Promise<void> {
    const found = sections.value.some((s) => s.id === id)
    if (!found) throw new Error(`Section ${id} not found`)
    sections.value = sections.value.filter((s) => s.id !== id)
  }

  async function updateSectionScoreMap(
    sectionId: string,
    rows: ScoreMapRow[],
  ): Promise<void> {
    const section = sections.value.find((s) => s.id === sectionId)
    if (!section) throw new Error(`Section ${sectionId} not found`)
    section.scoreMap = rows.map((r) => ({ ...r }))
  }

  // -----------------------------------------------------------------------
  // Tests CRUD
  // -----------------------------------------------------------------------

  async function createTest(data: Omit<AdminTest, 'id'>): Promise<AdminTest> {
    const newTest: AdminTest = {
      id: `test-${Date.now()}`,
      ...data,
    }
    tests.value = [...tests.value, newTest]
    return newTest
  }

  async function updateTest(
    id: string,
    data: Partial<Omit<AdminTest, 'id'>>,
  ): Promise<AdminTest> {
    const idx = tests.value.findIndex((t) => t.id === id)
    if (idx === -1) throw new Error(`Test ${id} not found`)

    const updated: AdminTest = { ...tests.value[idx], ...data }
    tests.value = [
      ...tests.value.slice(0, idx),
      updated,
      ...tests.value.slice(idx + 1),
    ]
    return updated
  }

  async function deleteTest(id: string): Promise<void> {
    const found = tests.value.some((t) => t.id === id)
    if (!found) throw new Error(`Test ${id} not found`)
    tests.value = tests.value.filter((t) => t.id !== id)
  }

  async function reorderTestSections(
    testId: string,
    assignments: TestSectionAssignment[],
  ): Promise<void> {
    const test = tests.value.find((t) => t.id === testId)
    if (!test) throw new Error(`Test ${testId} not found`)
    test.sectionAssignments = assignments.map((a) => ({ ...a }))
  }

  // -----------------------------------------------------------------------
  // Groups CRUD
  // -----------------------------------------------------------------------

  async function createGroup(data: Omit<AdminGroup, 'id'>): Promise<AdminGroup> {
    const newGroup: AdminGroup = {
      id: `group-${Date.now()}`,
      ...data,
    }
    groups.value = [...groups.value, newGroup]
    return newGroup
  }

  async function updateGroup(
    id: string,
    data: Partial<Omit<AdminGroup, 'id'>>,
  ): Promise<AdminGroup> {
    const idx = groups.value.findIndex((g) => g.id === id)
    if (idx === -1) throw new Error(`Group ${id} not found`)

    const updated: AdminGroup = { ...groups.value[idx], ...data }
    groups.value = [
      ...groups.value.slice(0, idx),
      updated,
      ...groups.value.slice(idx + 1),
    ]
    return updated
  }

  async function deleteGroup(id: string): Promise<void> {
    const found = groups.value.some((g) => g.id === id)
    if (!found) throw new Error(`Group ${id} not found`)
    groups.value = groups.value.filter((g) => g.id !== id)
  }

  async function assignUserToGroup(
    groupId: string,
    userId: string,
  ): Promise<void> {
    const group = groups.value.find((g) => g.id === groupId)
    if (!group) throw new Error(`Group ${groupId} not found`)

    if (!group.userIds.includes(userId)) {
      group.userIds = [...group.userIds, userId]
    }

    // Also update the user's groupIds
    const user = users.value.find((u) => u.id === userId)
    if (user && !user.groupIds.includes(groupId)) {
      user.groupIds = [...user.groupIds, groupId]
    }
  }

  async function removeUserFromGroup(
    groupId: string,
    userId: string,
  ): Promise<void> {
    const group = groups.value.find((g) => g.id === groupId)
    if (!group) throw new Error(`Group ${groupId} not found`)

    group.userIds = group.userIds.filter((uid) => uid !== userId)

    const user = users.value.find((u) => u.id === userId)
    if (user) {
      user.groupIds = user.groupIds.filter((gid) => gid !== groupId)
    }
  }

  // -----------------------------------------------------------------------
  // Users CRUD
  // -----------------------------------------------------------------------

  async function createUser(
    data: Omit<AdminUser, 'id' | 'testCode' | 'email' | 'phone'> & {
      email?: string
      phone?: string
    },
  ): Promise<AdminUser> {
    const newUser: AdminUser = {
      id: `user-${Date.now()}`,
      testCode: generateCode(),
      email: '',
      phone: '',
      ...data,
    }
    users.value = [...users.value, newUser]
    return newUser
  }

  async function updateUser(
    id: string,
    data: Partial<Omit<AdminUser, 'id'>>,
  ): Promise<AdminUser> {
    const idx = users.value.findIndex((u) => u.id === id)
    if (idx === -1) throw new Error(`User ${id} not found`)

    const updated: AdminUser = { ...users.value[idx], ...data }
    users.value = [
      ...users.value.slice(0, idx),
      updated,
      ...users.value.slice(idx + 1),
    ]
    return updated
  }

  async function deleteUser(id: string): Promise<void> {
    const found = users.value.some((u) => u.id === id)
    if (!found) throw new Error(`User ${id} not found`)
    users.value = users.value.filter((u) => u.id !== id)
  }

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  function getAttemptsForGroup(groupId: string): AdminAttempt[] {
    return attempts.value.filter((a) => a.groupId === groupId)
  }

  function getRecentAttempts(limit: number = 5): AdminAttempt[] {
    return [...attempts.value]
      .sort((a, b) => {
        const aTime = a.completedAt ? new Date(a.completedAt).getTime() : 0
        const bTime = b.completedAt ? new Date(b.completedAt).getTime() : 0
        return bTime - aTime
      })
      .slice(0, limit)
  }

  function getDashboardStats(): {
    groupCount: number
    activeTestCount: number
    studentCount: number
  } {
    return {
      groupCount: groups.value.length,
      activeTestCount: tests.value.length,
      studentCount: users.value.length,
    }
  }

  return {
    // State
    questions,
    sections,
    tests,
    groups,
    users,
    attempts,

    // Init
    initFromSamples,

    // Questions
    createQuestion,
    updateQuestion,
    deleteQuestion,

    // Sections
    createSection,
    updateSection,
    deleteSection,
    updateSectionScoreMap,

    // Tests
    createTest,
    updateTest,
    deleteTest,
    reorderTestSections,

    // Groups
    createGroup,
    updateGroup,
    deleteGroup,
    assignUserToGroup,
    removeUserFromGroup,

    // Users
    createUser,
    updateUser,
    deleteUser,

    // Helpers
    getAttemptsForGroup,
    getRecentAttempts,
    getDashboardStats,
  }
})
