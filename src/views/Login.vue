<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
    loading.value = true
    error.value = ''
    try {
        await auth.login(email.value, password.value)
    } catch (e) {
        error.value = 'Credenziali non valide o errore del server.'
    } finally {
        loading.value = false
    }
}
</script>

<template>
  <div class="login-container card">
    <h2 style="text-align: center; margin-bottom: 2rem;">MONTI E BARABINO</h2>
    
    <form @submit.prevent="handleLogin">
        <div style="margin-bottom: 1rem;">
            <label class="block mb-1">Email</label>
            <input v-model="email" type="email" class="input" required placeholder="name@example.com" />
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <label class="block mb-1">Password</label>
            <input v-model="password" type="password" class="input" required placeholder="••••••••" />
        </div>
        
        <div v-if="error" class="error-msg">
            {{ error }}
        </div>
        
        <button type="submit" class="btn btn-primary w-full" :disabled="loading">
            {{ loading ? 'Accesso in corso...' : 'ACCEDI' }}
        </button>
        
        <div class="links">
            <a href="#">Password dimenticata?</a>
        </div>
    </form>
  </div>
</template>

<style scoped>
.login-container {
    width: 100%;
    max-width: 400px;
}
.block { display: block; }
.mb-1 { margin-bottom: 0.25rem; }
.w-full { width: 100%; }
.error-msg {
    color: var(--color-danger);
    background: rgba(239, 68, 68, 0.1);
    padding: 0.75rem;
    border-radius: var(--radius-sm);
    margin-bottom: 1rem;
    font-size: 0.875rem;
}
.links {
    margin-top: 1rem;
    text-align: center;
    font-size: 0.875rem;
}
.links a {
    color: var(--color-text);
    text-decoration: none;
}
</style>
