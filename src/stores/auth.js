import { defineStore } from 'pinia'
import axios from 'axios'
import router from '../router'

const api = axios.create({
    baseURL: 'http://localhost:8000/api', // Will match docker port map. Wait, browser access localhost:8000 which is mapped to backend. Yes.
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
})

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token') || null,
        user: JSON.parse(localStorage.getItem('user')) || null
    }),
    actions: {
        async login(email, password) {
            try {
                const response = await api.post('/login', { email, password })
                this.token = response.data.access_token
                this.user = response.data.user

                localStorage.setItem('token', this.token)
                localStorage.setItem('user', JSON.stringify(this.user))

                // Update axios default
                api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`

                router.push('/')
            } catch (error) {
                console.error('Login failed', error)
                throw error
            }
        },
        logout() {
            api.post('/logout').finally(() => {
                this.token = null
                this.user = null
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                delete api.defaults.headers.common['Authorization']
                router.push('/login')
            })
        },
        api() {
            // Return api instance helper
            if (this.token) {
                api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
            }
            return api
        }
    }
})
