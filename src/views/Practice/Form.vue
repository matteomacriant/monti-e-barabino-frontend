<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const isEdit = computed(() => !!route.params.id)
const id = route.params.id

const form = reactive({
    title: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    client: '',
    client_id: '',
    supplier: '',
    note: '',
    notes: '', // Use notes for public/shared notes? Or just map one.
    order_number: '',
    supplier_order_number: '',
    ddt_number: '',
    invoice_number: '',
    invoice_year: new Date().getFullYear(),
    status: 'active'
})

const loading = ref(false)
const error = ref('')

onMounted(async () => {
    if (isEdit.value) {
        loading.value = true
        try {
            const response = await auth.api().get(`/practices/${id}`)
            Object.assign(form, response.data)
        } catch (e) {
            error.value = 'Errore nel caricamento della pratica'
        } finally {
            loading.value = false
        }
    }
})

const handleSubmit = async () => {
    loading.value = true
    error.value = ''
    try {
        if (isEdit.value) {
            await auth.api().put(`/practices/${id}`, form)
        } else {
            await auth.api().post('/practices', form)
        }
        router.push('/practices')
    } catch (e) {
        error.value = 'Errore nel salvataggio. Controlla i dati.'
        console.error(e)
    } finally {
        loading.value = false
    }
}
</script>

<template>
  <div class="header mb-6">
    <h1>{{ isEdit ? 'Modifica Pratica' : 'Nuova Pratica' }}</h1>
  </div>
  
  <div class="card max-w-4xl">
    <form @submit.prevent="handleSubmit">
        <div class="section mb-6">
            <h3 class="mb-4 text-lg font-medium border-b pb-2">Dati Principali</h3>
            
            <div class="mb-4">
                <label class="block mb-1 font-medium">Titolo / Oggetto *</label>
                <input v-model="form.title" class="input w-full" required />
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                    <label class="block mb-1 font-medium">Anno</label>
                    <input v-model="form.year" type="number" class="input w-full" />
                </div>
                 <div>
                    <label class="block mb-1 font-medium">Mese</label>
                    <select v-model="form.month" class="input w-full">
                        <option v-for="m in 12" :key="m" :value="m">{{ m }}</option>
                    </select>
                </div>
                 <div class="col-span-2">
                    <label class="block mb-1 font-medium">Stato</label>
                    <select v-model="form.status" class="input w-full">
                        <option value="active">Attiva</option>
                        <option value="archived">Archiviata</option>
                    </select>
                </div>
            </div>
        </div>
        
        <div class="section mb-6">
            <h3 class="mb-4 text-lg font-medium border-b pb-2">Clienti e Fornitori</h3>
             <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block mb-1 font-medium">Cliente</label>
                    <input v-model="form.client" class="input w-full" placeholder="Ragione Sociale" />
                </div>
                <div>
                    <label class="block mb-1 font-medium">Cod. Cliente</label>
                    <input v-model="form.client_id" class="input w-full" placeholder="Codice gestionale" />
                </div>
                 <div class="md:col-span-2">
                    <label class="block mb-1 font-medium">Fornitore</label>
                    <input v-model="form.supplier" class="input w-full" placeholder="Fornitore principale" />
                </div>
            </div>
        </div>

        <div class="section mb-6">
            <h3 class="mb-4 text-lg font-medium border-b pb-2">Riferimenti Documentali</h3>
             <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                    <label class="block mb-1 font-medium">Nr. Ordine</label>
                    <input v-model="form.order_number" class="input w-full" />
                </div>
                <div>
                    <label class="block mb-1 font-medium">Ord. Fornitore</label>
                    <input v-model="form.supplier_order_number" class="input w-full" />
                </div>
                 <div>
                    <label class="block mb-1 font-medium">Nr. DDT</label>
                    <input v-model="form.ddt_number" class="input w-full" />
                </div>
                 <div>
                    <label class="block mb-1 font-medium">Nr. Fattura</label>
                    <input v-model="form.invoice_number" class="input w-full" />
                </div>
            </div>
        </div>
        
        <div class="mb-6">
            <label class="block mb-1 font-medium">Note</label>
            <textarea v-model="form.note" class="input w-full h-32"></textarea>
        </div>
        
        <div v-if="error" class="error-msg mb-4 p-3 bg-red-50 text-red-700 rounded">{{ error }}</div>
        
        <div class="flex gap-3 justify-end mt-8 border-t pt-4">
            <router-link to="/practices" class="btn btn-outline">Annulla</router-link>
            <button type="submit" class="btn btn-primary px-8" :disabled="loading">
                {{ loading ? 'Salvataggio...' : 'Salva Pratica' }}
            </button>
        </div>
    </form>
  </div>
</template>

<style scoped>
.mb-6 { margin-bottom: 1.5rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-1 { margin-bottom: 0.25rem; }
.mt-8 { margin-top: 2rem; }
.pt-4 { padding-top: 1rem; }
.pb-2 { padding-bottom: 0.5rem; }
.gap-4 { gap: 1rem; }
.gap-3 { gap: 0.75rem; }
.block { display: block; }
.flex { display: flex; }
.justify-end { justify-content: flex-end; }
.w-full { width: 100%; }
.h-32 { height: 8rem; }
.rounded { border-radius: 0.375rem; }

.grid { display: grid; }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-1 { grid-template-columns: 1fr; }

@media (min-width: 768px) {
    .md\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
    .md\:grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
    .md\:col-span-2 { grid-column: span 2 / span 2; }
}

.max-w-4xl { max-width: 56rem; }
.border-b { border-bottom: 1px solid #e5e7eb; }
.border-t { border-top: 1px solid #e5e7eb; }
.font-medium { font-weight: 500; }
.text-lg { font-size: 1.125rem; }
.bg-red-50 { background-color: #fef2f2; }
.text-red-700 { color: #b91c1c; }
</style>
