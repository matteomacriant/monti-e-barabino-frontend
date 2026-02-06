<script setup>
import { ref, onMounted, computed, watch, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
// id is derived from route, use it dynamically
const getId = () => route.params.id

const practice = ref(null)
const loading = ref(true)
const fileInput = ref(null)
const activeTab = ref('details') // details, attachments, alyante

const orderedLineage = computed(() => {
    if (!practice.value?.lineage) return []
    // User wants "Root" at the bottom (last node).
    // Backend returns [Root, Child, Grandchild].
    // So we reverse it to get [Grandchild, Child, Root].
    return [...practice.value.lineage].reverse()
})

const fetchPractice = async () => {
    loading.value = true
    try {
        const response = await auth.api().get(`/practices/${getId()}`)
        practice.value = response.data
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchPractice()
})

watch(() => route.params.id, (newId) => {
    if (newId) fetchPractice()
})

const deletePractice = async () => {
    if (!confirm('Sei sicuro di voler eliminare questa pratica?')) return
    try {
        await auth.api().delete(`/practices/${getId()}`)
        router.push('/practices')
    } catch (e) {
        alert('Errore eliminazione')
    }
}

const toggleFavorite = async () => {
    try {
        await auth.api().post(`/practices/${getId()}/favorite`)
        alert('Preferito aggiornato') // Simple feedback
    } catch (e) {
        console.error(e)
    }
}

const uploadFile = async () => {
    const file = fileInput.value.files[0]
    if (!file) return
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('practice_id', getId())
    
    try {
        await auth.api().post('/attachments', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        fetchPractice() // Refresh
        fileInput.value.value = ''
    } catch (e) {
        alert('Errore upload')
    }
}

const deleteAttachment = async (attId) => {
     if (!confirm('Eliminare allegato?')) return
      try {
        await auth.api().delete(`/attachments/${attId}`)
        fetchPractice()
    } catch (e) {
        alert('Errore eliminazione allegato')
    }
}

const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
}

const isViewable = (filename) => {
    const ext = filename.split('.').pop().toLowerCase()
    return ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
}

// Clone Logic
import ClonePracticeModal from '../../components/Practice/ClonePracticeModal.vue'

const showCloneModal = ref(false)

const openCloneModal = () => {
    showCloneModal.value = true
}

const handleCloneSuccess = (newPractice) => {
    showCloneModal.value = false
    // Redirect to list view as requested
    router.push('/practices')
     alert(`Pratica ${newPractice.code} creata con successo`)
}

const canDelete = computed(() => {
    if (!practice.value || !auth.user) return false
    if (auth.user.role === 'admin') return true
    
    // Check ownership
    if (practice.value.user_id !== auth.user.id) return false
    
    // Check 24h window
    const created = new Date(practice.value.created_at)
    const now = new Date()
    const diffHours = (now - created) / (1000 * 60 * 60)
    
    return diffHours <= 24
})
</script>

<template>
  <div v-if="loading" class="text-center p-8">Caricamento...</div>
  
  <div v-else-if="practice" class="practice-show">
      <!-- Header -->
      <div class="header mb-6 flex justify-between items-start">
        <div>
            <div class="flex items-center gap-3 mb-2">
                 <h1 class="text-2xl font-bold">{{ practice.code }}</h1>
                 <span :class="['badge', practice.status === 'active' ? 'badge-success' : 'badge-neutral']">{{ practice.status }}</span>
            </div>
            <h2 class="text-xl text-gray-600">{{ practice.title }}</h2>
        </div>
        <div class="actions flex gap-2">
            <button @click="toggleFavorite" class="btn btn-outline">★ Preferito</button>
            <button @click="openCloneModal" class="btn btn-outline">📋 Clona</button>
            <router-link :to="`/practices/${route.params.id}/edit`" class="btn btn-primary">Modifica</router-link>
            <button v-if="canDelete" @click="deletePractice" class="btn btn-outline text-red-600 border-red-200">Elimina</button>
        </div>
      </div>
      
      <!-- Tabs -->
      <div class="tabs mb-6">
          <button @click="activeTab = 'details'" :class="['tab-btn', activeTab === 'details' ? 'active' : '']">Dati Generali</button>
          <button @click="activeTab = 'attachments'" :class="['tab-btn', activeTab === 'attachments' ? 'active' : '']">Allegati ({{ practice.attachments.length }})</button>
          <button @click="activeTab = 'alyante'" :class="['tab-btn', activeTab === 'alyante' ? 'active' : '']">Documenti Alyante</button>
      </div>
      
      <!-- Content: Details -->
      <div v-if="activeTab === 'details'" class="grid-details">
         <div class="card">
             <h3 class="mb-4 text-lg font-semibold border-b pb-2">Informazioni</h3>
             <div class="grid grid-cols-2 gap-4">
                 <div class="field">
                     <label>Cliente</label>
                     <div class="value">{{ practice.client || '-' }}</div>
                 </div>
                 <div class="field">
                     <label>Cod. Cliente</label>
                     <div class="value">{{ practice.client_id || '-' }}</div>
                 </div>
                  <div class="field">
                     <label>Fornitore</label>
                     <div class="value">{{ practice.supplier || '-' }}</div>
                 </div>
                 <div class="field">
                     <label>Periodo</label>
                     <div class="value">{{ practice.year }} / {{ practice.month }}</div>
                 </div>
                  <div class="field">
                     <label>Nr. Ordine</label>
                     <div class="value">{{ practice.order_number || '-' }}</div>
                 </div>
                  <div class="field">
                     <label>Nr. Fattura</label>
                     <div class="value">{{ practice.invoice_number || '-' }}</div>
                 </div>
             </div>
             
             <div class="mt-6">
                 <label class="block font-medium mb-1">Note</label>
                 <div class="bg-gray-50 p-3 rounded text-sm min-h-[100px] whitespace-pre-wrap">{{ practice.notes || practice.note || 'Nessuna nota.' }}</div>
             </div>
         </div>
         
         <div class="card">
             <h3 class="mb-4 text-lg font-semibold border-b pb-2 uppercase">Relazioni con altre pratiche</h3>
             <div v-if="orderedLineage && orderedLineage.length" class="lineage-container relative pl-2">
                 <!-- Vertical Line -->
                 <div class="absolute left-[11px] top-2 bottom-6 w-0.5 bg-gray-300"></div>

                 <div v-for="(node, index) in orderedLineage" :key="node.id" class="relative z-10 mb-4 flex items-center gap-3">
                     <!-- Bullet -->
                     <div class="flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-600 bg-white flex items-center justify-center"
                          :class="{ 'bg-gray-800 border-gray-800': node.id === practice.id }">
                         <div v-if="node.id === practice.id" class="w-2 h-2 rounded-full bg-white"></div>
                     </div>
                     
                     <!-- Content -->
                     <div class="flex-1">
                         <span v-if="node.id === practice.id" class="font-bold text-gray-900">
                             {{ node.code }} - {{ node.title }}
                         </span>
                         <router-link v-else :to="`/practices/${node.id}`" class="text-gray-600 hover:text-primary hover:underline block">
                             {{ node.code }} - {{ node.title }}
                         </router-link>
                     </div>
                 </div>
             </div>
             <p v-else class="text-muted text-sm">Nessuna relazione trovata.</p>
         </div>
      </div>
      
      <!-- Content: Attachments -->
      <div v-if="activeTab === 'attachments'" class="card">
          <div class="flex justify-between mb-4">
              <h3 class="text-lg font-semibold">Allegati</h3>
          </div>
          
           <ul v-if="practice.attachments.length" class="file-list mb-6">
               <li v-for="att in practice.attachments" :key="att.id">
                   <div class="flex items-center gap-3">
                       <div class="icon">
                           <span v-if="isViewable(att.filename)">📄</span>
                           <span v-else>⬇️</span>
                       </div>
                       <div>
                           <a :href="`/storage/${att.filepath}`" 
                              :target="isViewable(att.filename) ? '_blank' : '_self'" 
                              class="font-medium hover:underline text-primary"
                              :download="!isViewable(att.filename) ? att.filename : null"
                           >
                               {{ att.filename }}
                           </a>
                           <div class="text-xs text-gray-500">{{ formatDate(att.created_at) }}</div>
                       </div>
                   </div>
                   <button @click="deleteAttachment(att.id)" class="text-red-500 hover:bg-red-50 p-1 rounded">Elimina</button>
               </li>
           </ul>
            <p v-else class="text-muted mb-6">Nessun allegato presente.</p>
           
           <div class="border-t pt-4">
               <h4 class="mb-2 font-medium">Carica Nuovo File</h4>
               <div class="flex gap-2">
                   <input type="file" ref="fileInput" class="input" />
                   <button @click="uploadFile" class="btn btn-primary">Carica</button>
               </div>
           </div>
      </div>
      
       <!-- Content: Alyante -->
      <div v-if="activeTab === 'alyante'" class="card">
          <div class="text-center p-8 text-muted">
              <h3 class="mb-2 text-lg">Integrazione Alyante</h3>
              <p>Nessun documento trovato nel sistema gestionale.</p>
          </div>
      </div>
  </div>

    <ClonePracticeModal 
        :isOpen="showCloneModal" 
        :practice="practice"
        @close="showCloneModal = false"
        @success="handleCloneSuccess"
    />
</template>

<style scoped>
.flex { display: flex; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mt-6 { margin-top: 1.5rem; }
.p-8 { padding: 2rem; }
.p-4 { padding: 1rem; }
.p-2 { padding: 0.5rem; }
.p-3 { padding: 0.75rem; }
.p-1 { padding: 0.25rem; }
.pt-4 { padding-top: 1rem; }
.pb-2 { padding-bottom: 0.5rem; }
.min-h-\[100px\] { min-height: 100px; }
.rounded { border-radius: 0.375rem; }
.text-center { text-align: center; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
.font-medium { font-weight: 500; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.text-lg { font-size: 1.125rem; }
.text-sm { font-size: 0.875rem; }
.text-xs { font-size: 0.75rem; }

.text-gray-600 { color: #4b5563; }
.text-gray-500 { color: #6b7280; }
.text-primary { color: var(--color-primary); }
.text-red-500 { color: #ef4444; }
.bg-gray-50 { background-color: #f9fafb; }
.border-b { border-bottom-width: 1px; border-color: #e5e7eb; }
.border-t { border-top-width: 1px; border-color: #e5e7eb; }
.text-red-600 { color: #dc2626; }
.border-red-200 { border-color: #fecaca; }

.grid-details {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.5rem;
}
.grid { display: grid; }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }

.field label {
    display: block;
    font-size: 0.75rem;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.25rem;
}
.field .value {
    font-weight: 500;
}

.tabs {
    border-bottom: 2px solid #e5e7eb;
}
.tab-btn {
    padding: 0.75rem 1.5rem;
    font-weight: 500;
    color: #6b7280;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    transition: all 0.2s;
}
.tab-btn:hover { color: var(--color-primary); }
.tab-btn.active {
    color: var(--color-primary);
    border-bottom-color: var(--color-primary);
}

.file-list {
    list-style: none;
    padding: 0;
}
.file-list li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid #f3f4f6;
}
.file-list li:last-child { border-bottom: none; }
.btn-xs { padding: 0.1rem 0.5rem; font-size: 0.7rem; }

.badge {
    padding: 0.25rem 0.5rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
}
.badge-success { background: #dcfce7; color: #166534; }
.badge-neutral { background: #f1f5f9; color: #64748b; }
</style>
