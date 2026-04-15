import axios from 'axios'

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/api'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
})

/** Calls that need a Clerk JWT. Pass the token from useAuth(). */
export function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}
