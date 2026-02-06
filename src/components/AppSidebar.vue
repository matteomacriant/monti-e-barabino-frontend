<script setup>
import { useAuthStore } from '../stores/auth'
import { ref } from 'vue'

const auth = useAuthStore()
</script>

<template>
  <div class="sidebar">
    <div class="brand">
        MONTI E BARABINO
    </div>
    
    <div class="menu">
        <router-link to="/">Dashboard</router-link>
        <router-link to="/search">Cerca</router-link>
        <router-link to="/practices">Pratiche</router-link>
        
        <div v-if="auth.user?.role === 'admin'">
            <router-link to="/operators">Operatori</router-link>
        </div>
        
        <a href="#" @click.prevent="auth.logout()" class="mt-4">Logout</a>
    </div>
  </div>
</template>

<style scoped>
.menu {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
.mt-4 {
    margin-top: auto; /* Push logout to bottom if flex container has height, but here it's just margin top */
    margin-top: 2rem;
    border-top: 1px solid rgba(255,255,255,0.1);
    padding-top: 1rem;
}
</style>
