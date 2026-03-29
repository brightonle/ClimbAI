import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // send httpOnly cookies automatically
})

// Attempt token refresh on 401, but only for non-auth endpoints
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    // Skip refresh logic for auth endpoints — let React handle unauthenticated state
    if (
      err.response?.status === 401 &&
      !original._retry &&
      !original.url.includes('/auth/')
    ) {
      original._retry = true
      try {
        await api.post('/auth/refresh')
        return api(original)
      } catch {
        // Refresh failed — just reject, App.tsx will show the login page
      }
    }
    return Promise.reject(err)
  }
)

export default api
