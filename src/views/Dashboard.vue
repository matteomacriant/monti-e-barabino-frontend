<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const dashboardData = ref({
    saved_searches: [],
    favorite_practices: [],
    recent_practices: []
})
const loading = ref(true)

onMounted(async () => {
    try {
        const response = await auth.api().get('/dashboard')
        dashboardData.value = response.data
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
})
</script>

<template>
  <div class="header mb-6">
    <h1>Dashboard</h1>
  </div>
  
  <div class="grid">
    <!-- Saved Searches -->
    <div class="card">
        <h3>RICERCHE SALVATE</h3>
        <ul v-if="dashboardData.saved_searches.length">
            <li v-for="search in dashboardData.saved_searches" :key="search.id">
                {{ search.name }}
            </li>
        </ul>
        <p v-else class="text-muted">Nessuna ricerca salvata</p>
    </div>
    
    <!-- Favorites -->
    <div class="card">
        <h3>PRATICHE PREFERITE</h3>
         <ul v-if="dashboardData.favorite_practices.length">
            <li v-for="practice in dashboardData.favorite_practices" :key="practice.id">
                <router-link :to="`/practices/${practice.id}`">{{ practice.code }} - {{ practice.title }}</router-link>
            </li>
        </ul>
        <p v-else class="text-muted">Nessuna pratica preferita</p>
    </div>
    
    <!-- Recent -->
    <div class="card">
        <h3>PRATICHE RECENTI</h3>
         <ul v-if="dashboardData.recent_practices.length">
            <li v-for="practice in dashboardData.recent_practices" :key="practice.id">
                <router-link :to="`/practices/${practice.id}`">{{ practice.code }} - {{ practice.title }}</router-link>
            </li>
        </ul>
        <p v-else class="text-muted">Nessuna pratica recente</p>
    </div>
  </div>
</template>

<style scoped>
.mb-6 { margin-bottom: 1.5rem; }
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
}
.text-muted { color: #94a3b8; }
ul {
    list-style: none;
    padding: 0;
}
li {
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--color-border);
}
li:last-child { border-bottom: none; }
a {
    color: var(--color-primary);
    text-decoration: none;
}
</style>
