export default defineNuxtRouteMiddleware((to) => {
  // Allow unauthenticated access to the login page
  if (to.path === '/admin/login') return

  const auth = useAuthStore()
  if (!auth.isLoggedIn) {
    return navigateTo('/admin/login')
  }
})
