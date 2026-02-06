<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

const initialCriteria = {
    code: '',
    year: '',
    month: '',
    client: '',
    client_id: '',
    supplier: '',
    notes: '',
    filename: '',
    order_number: '',
    supplier_order_number: '',
    ddt_number: '',
    invoice_number: '',
    date_from: '',
    date_to: ''
}

const criteria = reactive({ ...initialCriteria })

const practicesResults = ref([])
const documentsResults = ref([])
const hasSearched = ref(false)
const searchName = ref('')
const loading = ref(false)
const activeTab = ref('practices')

const resetFilters = () => {
    Object.assign(criteria, initialCriteria)
    hasSearched.value = false
    practicesResults.value = []
    documentsResults.value = []
}

const handleSearch = async () => {
    loading.value = true
    hasSearched.value = true
    try {
        // Parallel requests
        const [practicesRes, docsRes] = await Promise.all([
            auth.api().get('/practices', { params: criteria }),
            auth.api().get('/attachments', { params: criteria })
        ])
        
        practicesResults.value = practicesRes.data.data
        documentsResults.value = docsRes.data.data
        
        // Auto-switch tab if no practices found but docs found
        if (practicesResults.value.length === 0 && documentsResults.value.length > 0) {
            activeTab.value = 'documents'
        } else {
            activeTab.value = 'practices'
        }
    } catch (e) {
        console.error(e)
        alert('Errore durante la ricerca')
    } finally {
        loading.value = false
    }
}

const saveSearch = async () => {
    if (!searchName.value) return
    try {
        await auth.api().post('/saved-searches', {
            name: searchName.value,
            criteria: criteria
        })
        alert('Ricerca salvata!')
        searchName.value = ''
    } catch (e) {
        alert('Errore salvataggio')
    }
}

const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
}
</script>

<template>
  <div class="header mb-6">
    <h1>Ricerca Avanzata</h1>
  </div>
  
  <div class="card mb-6 p-6">
      <form @submit.prevent="handleSearch">
          
          <!-- General Info -->
          <div class="grid-form mb-4">
               <div>
                  <label class="block mb-1 font-medium">Codice</label>
                  <input v-model="criteria.code" class="input" placeholder="Es. 2025..." />
              </div>
               <div>
                  <label class="block mb-1 font-medium">Anno</label>
                  <input v-model="criteria.year" type="number" class="input" />
              </div>
              <div>
                  <label class="block mb-1 font-medium">Mese</label>
                   <select v-model="criteria.month" class="input">
                      <option value="">Tutti</option>
                      <option v-for="m in 12" :key="m" :value="m">{{ m }}</option>
                  </select>
              </div>
          </div>
          
          <div class="grid-form mb-4">
              <div>
                  <label class="block mb-1 font-medium">Cliente</label>
                  <input v-model="criteria.client" class="input" />
              </div>
               <div>
                  <label class="block mb-1 font-medium">Identificativo Cliente</label>
                  <input v-model="criteria.client_id" class="input" />
              </div>
              <div>
                  <label class="block mb-1 font-medium">Fornitore</label>
                  <input v-model="criteria.supplier" class="input" />
              </div>
          </div>

          <!-- Specific Refs -->
          <div class="grid-form mb-4 border-t pt-4">
               <div>
                  <label class="block mb-1 font-medium">Nr. Ordine</label>
                  <input v-model="criteria.order_number" class="input" />
              </div>
              <div>
                  <label class="block mb-1 font-medium">Nr. Ordine Fornitore</label>
                  <input v-model="criteria.supplier_order_number" class="input" />
              </div>
              <div>
                  <label class="block mb-1 font-medium">Nr. DDT</label>
                  <input v-model="criteria.ddt_number" class="input" />
              </div>
               <div>
                  <label class="block mb-1 font-medium">Nr. Fattura</label>
                  <input v-model="criteria.invoice_number" class="input" />
              </div>
          </div>
          
           <!-- Dates & Notes -->
          <div class="grid-form mb-6 border-t pt-4">
               <div>
                  <label class="block mb-1 font-medium">Data Da</label>
                  <input v-model="criteria.date_from" type="date" class="input" />
              </div>
              <div>
                  <label class="block mb-1 font-medium">Data A</label>
                  <input v-model="criteria.date_to" type="date" class="input" />
              </div>
               <div class="col-span-2">
                  <label class="block mb-1 font-medium">Note</label>
                  <input v-model="criteria.notes" class="input" placeholder="Cerca nelle note..." />
              </div>
               <div>
                  <label class="block mb-1 font-medium">Nome File (Allegato)</label>
                  <input v-model="criteria.filename" class="input" placeholder="Cerca nei file..." />
              </div>
          </div>
          
          <div class="flex justify-end gap-3">
              <button type="button" @click="resetFilters" class="btn btn-outline">Reset</button>
              <button type="submit" class="btn btn-primary px-8" :disabled="loading">
                  <span v-if="loading">Ricerca in corso...</span>
                  <span v-else>Cerca</span>
              </button>
          </div>
      </form>
  </div>
  
  <div v-if="hasSearched" class="results-section">
      <div class="flex justify-between items-center mb-4">
            <div class="tabs flex gap-4">
                <button 
                    @click="activeTab = 'practices'" 
                    :class="['tab-btn', activeTab === 'practices' ? 'active' : '']">
                    Pratiche ({{ practicesResults.length }})
                </button>
                <button 
                    @click="activeTab = 'documents'" 
                    :class="['tab-btn', activeTab === 'documents' ? 'active' : '']">
                    Documenti ({{ documentsResults.length }})
                </button>
            </div>
          
           <div class="save-search flex gap-2">
               <input v-model="searchName" placeholder="Nome ricerca..." class="input input-sm bg-white" />
               <button @click="saveSearch" class="btn btn-outline btn-sm bg-white">Salva Ricerca</button>
           </div>
      </div>
      
      <!-- Practices Table -->
      <div v-if="activeTab === 'practices'" class="card p-0 overflow-hidden">
        <table v-if="practicesResults.length" class="table w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-4 py-2 text-left">Codice</th>
                    <th class="px-4 py-2 text-left">Titolo</th>
                    <th class="px-4 py-2 text-left">Cliente</th>
                     <th class="px-4 py-2 text-left">Data</th>
                    <th class="px-4 py-2 text-center">Azioni</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="practice in practicesResults" :key="practice.id" class="border-t hover:bg-gray-50">
                    <td class="px-4 py-3 font-mono text-sm">{{ practice.code }}</td>
                    <td class="px-4 py-3">{{ practice.title }}</td>
                    <td class="px-4 py-3">{{ practice.client || '-' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-500">{{ formatDate(practice.created_at) }}</td>
                    <td class="px-4 py-3 text-center">
                        <router-link :to="`/practices/${practice.id}`" class="text-primary hover:underline">Vedi</router-link>
                    </td>
                </tr>
            </tbody>
        </table>
         <div v-else class="p-8 text-center text-muted">Nessuna pratica trovata.</div>
      </div>

      <!-- Documents Table -->
      <div v-if="activeTab === 'documents'" class="card p-0 overflow-hidden">
        <table v-if="documentsResults.length" class="table w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-4 py-2 text-left">File</th>
                    <th class="px-4 py-2 text-left">Pratica</th>
                    <th class="px-4 py-2 text-left">Data Caricamento</th>
                    <th class="px-4 py-2 text-center">Azioni</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="doc in documentsResults" :key="doc.id" class="border-t hover:bg-gray-50">
                    <td class="px-4 py-3 font-medium">{{ doc.filename }}</td>
                    <td class="px-4 py-3 text-sm">
                        <router-link :to="`/practices/${doc.practice_id}`" class="hover:underline">
                            {{ doc.practice?.code || 'Pratica #' + doc.practice_id }}
                        </router-link>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-500">{{ formatDate(doc.created_at) }}</td>
                    <td class="px-4 py-3 text-center">
                         <a :href="`/storage/${doc.filepath}`" target="_blank" class="text-primary hover:underline">Scarica</a>
                    </td>
                </tr>
            </tbody>
        </table>
        <div v-else class="p-8 text-center text-muted">Nessun documento trovato.</div>
      </div>
  </div>
</template>

<style scoped>
.mb-6 { margin-bottom: 1.5rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-1 { margin-bottom: 0.25rem; }
.block { display: block; }
.grid-form {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}
.flex { display: flex; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.gap-2 { gap: 0.5rem; }
.input-sm { padding: 0.25rem 0.5rem; width: auto; }
.btn-sm { padding: 0.25rem 0.5rem; }

.tabs {
    border-bottom: 2px solid #e2e8f0;
}
.tab-btn {
    padding: 0.5rem 1rem;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    font-weight: 500;
    color: #64748b;
    transition: all 0.2s;
}
.tab-btn:hover {
    color: var(--color-primary);
}
.tab-btn.active {
    color: var(--color-primary);
    border-bottom-color: var(--color-primary);
}
</style>
