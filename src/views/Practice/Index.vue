<script setup>
import { ref, onMounted, reactive, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const practices = ref([])
const pagination = ref({})
const loading = ref(true)

const activeStatus = ref('active') // active, archived, all

const filters = reactive({
    code: '',
    year: '',
    client: '',
    supplier: ''
})

const fetchPractices = async (page = 1) => {
    loading.value = true
    try {
        const params = {
            page,
            ...filters,
        }
        if (activeStatus.value !== 'all') {
            params.status = activeStatus.value
        }

        const response = await auth.api().get('/practices', { params })
        practices.value = response.data.data
        pagination.value = {
            current_page: response.data.current_page,
            last_page: response.data.last_page
        }
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

const toggleFavorite = async (practice) => {
    // Optimistic update
    practice.is_favorite = !practice.is_favorite
    
    try {
        await auth.api().post(`/practices/${practice.id}/favorite`)
    } catch (e) {
        console.error(e)
        // Revert on error
        practice.is_favorite = !practice.is_favorite
    }
}

const archivePractice = async (practice) => {
    if (!confirm('Vuoi archiviare questa pratica?')) return
    try {
        await auth.api().put(`/practices/${practice.id}`, { status: 'archived' })
        fetchPractices(pagination.value.current_page)
    } catch (e) {
        console.error(e)
    }
}

const deletePractice = async (practice) => {
    if (!confirm('Sei sicuro di voler eliminare questa pratica?')) return
    try {
        await auth.api().delete(`/practices/${practice.id}`)
        fetchPractices(pagination.value.current_page)
    } catch (e) {
        console.error(e)
    }
}

const formatDate = (dateString) => {
     if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
}

// Clone Modal Logic
import ClonePracticeModal from '../../components/Practice/ClonePracticeModal.vue'

const showCloneModal = ref(false)
const practiceToClone = ref(null)

const openCloneModal = (practice) => {
    practiceToClone.value = practice
    showCloneModal.value = true
}

const handleCloneSuccess = () => {
    showCloneModal.value = false
    practiceToClone.value = null
    fetchPractices(pagination.value.current_page)
    alert('Pratica clonata con successo!')
}

watch(activeStatus, () => fetchPractices(1))

onMounted(() => {
    fetchPractices()
})
</script>

<template>
  <div class="flex justify-between items-center mb-6">
    <h1>Pratiche</h1>
    <router-link to="/practices/create" class="btn btn-primary">NUOVO</router-link>
  </div>
  
  <div class="card mb-6 p-0 overflow-hidden">
      <!-- Status Tabs -->
      <div class="flex border-b bg-gray-50">
          <button 
            @click="activeStatus = 'active'"
            :class="['px-6 py-3 font-medium', activeStatus === 'active' ? 'text-primary border-b-2 border-primary bg-white' : 'text-gray-500 hover:text-gray-700']"
            >
              Attive
          </button>
          <button 
             @click="activeStatus = 'archived'"
             :class="['px-6 py-3 font-medium', activeStatus === 'archived' ? 'text-primary border-b-2 border-primary bg-white' : 'text-gray-500 hover:text-gray-700']"
             >
              Archiviate
          </button>
           <button 
             @click="activeStatus = 'all'"
             :class="['px-6 py-3 font-medium', activeStatus === 'all' ? 'text-primary border-b-2 border-primary bg-white' : 'text-gray-500 hover:text-gray-700']"
             >
              Tutte
          </button>
      </div>
      
    <div class="p-4 grid-form border-b bg-white">
        <input v-model="filters.code" placeholder="Cerca Codice..." class="input" @keyup.enter="fetchPractices(1)"/>
        <input v-model="filters.year" placeholder="Anno..." class="input" @keyup.enter="fetchPractices(1)"/>
        <input v-model="filters.client" placeholder="Cliente..." class="input" @keyup.enter="fetchPractices(1)"/>
        <button @click="fetchPractices(1)" class="btn btn-primary">Cerca</button>
    </div>
    
    <table class="table w-full">
        <thead>
            <tr>
                <th>Codice</th>
                <th>Titolo</th>
                <th>Cliente</th>
                <th>Stato</th>
                <th>Data Creazione</th>
                <th class="text-right">Azioni</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="practice in practices" :key="practice.id" class="border-t hover:bg-gray-50">
                <td class="font-mono">{{ practice.code }}</td>
                <td>{{ practice.title }}</td>
                <td>{{ practice.client || '-' }}</td>
                <td>
                    <span :class="['badge', practice.status === 'active' ? 'badge-success' : 'badge-neutral']">
                        {{ practice.status }}
                    </span>
                </td>
                <td>{{ formatDate(practice.created_at) }}</td>
                <td class="text-right flex justify-end gap-2">
                    <button @click="toggleFavorite(practice)" class="btn btn-ghost btn-sm" :class="{ 'text-yellow-400': practice.is_favorite }" :style="practice.is_favorite ? 'color: #facc15 !important' : ''" title="Preferito">★</button>
                    <router-link :to="`/practices/${practice.id}`" class="btn btn-outline btn-sm">Vedi</router-link>
                    <router-link :to="`/practices/${practice.id}/edit`" class="btn btn-outline btn-sm">Modifica</router-link>
                    <button @click="openCloneModal(practice)" class="btn btn-outline btn-sm" title="Clona">📋</button>
                    <button v-if="practice.status !== 'archived'" @click="archivePractice(practice)" class="btn btn-outline btn-sm" title="Archivia">📥</button>
                     <button @click="deletePractice(practice)" class="btn btn-outline btn-sm text-red-600 border-red-200 hover:bg-red-50" title="Elimina">🗑</button>
                </td>
            </tr>
             <tr v-if="practices.length === 0">
                <td colspan="6" class="text-center p-8 text-muted">Nessun risultato</td>
            </tr>
        </tbody>
    </table>
    
    <div class="pagination p-4 flex justify-between items-center border-t bg-gray-50">
        <button 
            :disabled="pagination.current_page <= 1" 
            @click="fetchPractices(pagination.current_page - 1)"
            class="btn btn-outline btn-sm"
        >
            Precedente
        </button>
        <span class="text-sm text-gray-600">Pagina {{ pagination.current_page }} di {{ pagination.last_page }}</span>
        <button 
            :disabled="pagination.current_page >= pagination.last_page" 
            @click="fetchPractices(pagination.current_page + 1)"
            class="btn btn-outline btn-sm"
        >
            Successiva
        </button>
    </div>
    </div>

    <ClonePracticeModal 
        :isOpen="showCloneModal" 
        :practice="practiceToClone"
        @close="showCloneModal = false"
        @success="handleCloneSuccess"
    />
</template>

<style scoped>
.flex { display: flex; }
.justify-between { justify-content: space-between; }
.justify-end { justify-content: flex-end; }
.items-center { align-items: center; }
.mb-6 { margin-bottom: 1.5rem; }
.gap-2 { gap: 0.5rem; }
.grid-form {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    align-items: center;
}
.text-center { text-align: center; }
.text-right { text-align: right; }
.btn-sm { padding: 0.25rem 0.5rem; font-size: 0.75rem; }
.btn-ghost { background: transparent; border: none; color: #cbd5e1; font-size: 1.2rem; padding: 0 0.5rem; }
.btn-ghost:hover { color: #f59e0b; background: transparent; }

.badge {
    padding: 0.25rem 0.5rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
}
.badge-success { background: #dcfce7; color: #166534; }
.badge-neutral { background: #f1f5f9; color: #64748b; }
.text-red-600 { color: #dc2626; }
.bg-white { background: white; }
.bg-gray-50 { background: #f9fafb; }
.border-b { border-bottom: 1px solid #e2e8f0; border-color: #e2e8f0; }
.border-t { border-top: 1px solid #e2e8f0; }
.text-primary { color: var(--color-primary); }
</style>
