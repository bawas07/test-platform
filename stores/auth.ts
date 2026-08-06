export interface AdminUser {
  id: string
  email: string
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const admin = ref<AdminUser | null>(null)

  const isLoggedIn = computed(() => accessToken.value !== null && admin.value !== null)

  async function login(email: string, _password: string): Promise<void> {
    if (!email || email.trim().length === 0) {
      throw new Error('Email is required')
    }

    // Demo auth: any non-empty email succeeds
    accessToken.value = 'demo-token'
    admin.value = {
      id: 'admin-1',
      email: email.trim(),
    }
  }

  function logout(): void {
    accessToken.value = null
    admin.value = null
  }

  return {
    accessToken,
    admin,
    isLoggedIn,
    login,
    logout,
  }
})
