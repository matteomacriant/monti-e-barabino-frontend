<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const users = ref([])
const loading = ref(true)
const modalOpen = ref(false)
const modalMode = ref('create') // create or edit
const formLoading = ref(false)
const formError = ref('')

const form = reactive({
    id: null,
    name: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active'
})

const fetchUsers = async () => {
    loading.value = true
    try {
        const response = await auth.api().get('/users')
        users.value = response.data
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

const openModal = (user = null) => {
    modalOpen.value = true
    formError.value = ''
    if (user) {
        modalMode.value = 'edit'
        form.id = user.id
        form.name = user.name
        form.email = user.email
        form.role = user.role
        form.status = user.status
        form.password = '' // Don't show password
    } else {
        modalMode.value = 'create'
        form.id = null
        form.name = ''
        form.email = ''
        form.role = 'user'
        form.status = 'active'
        form.password = ''
    }
}

const closeModal = () => {
    modalOpen.value = false
}

const handleSubmit = async () => {
    formLoading.value = true
    formError.value = ''
    
    try {
        const data = { ...form }
        if (modalMode.value === 'edit' && !data.password) {
            delete data.password
        }
        
        if (modalMode.value === 'create') {
            await auth.api().post('/users', data)
        } else {
            await auth.api().put(`/users/${form.id}`, data)
        }
        
        closeModal()
        fetchUsers()
    } catch (e) {
        if (e.response && e.response.data.message) {
            formError.value = e.response.data.message
        } else {
            formError.value = 'Errore nel salvataggio'
        }
    } finally {
        formLoading.value = false
    }
}

const deleteUser = async (user) => {
    if (!confirm(`Eliminare utente ${user.name}?`)) return
    try {
        await auth.api().delete(`/users/${user.id}`)
        fetchUsers()
    } catch (e) {
        alert('Errore eliminazione')
    }
}

onMounted(() => {
    fetchUsers()
})
</script>

<template>
  <div class="header mb-6 flex justify-between items-center">
    <h1>Operatori</h1>
    <button @click="openModal()" class="btn btn-primary">Nuovo Operatore</button>
  </div>
  
  <div class="card p-0 overflow-hidden">
      <table class="table w-full">
          <thead>
              <tr>
                  <th class="text-left px-4 py-3">Nome</th>
                  <th class="text-left px-4 py-3">Email</th>
                  <th class="text-left px-4 py-3">Ruolo</th>
                  <th class="text-left px-4 py-3">Stato</th>
                  <th class="text-right px-4 py-3">Azioni</th>
              </tr>
          </thead>
          <tbody>
              <tr v-for="user in users" :key="user.id" class="border-t hover:bg-gray-50">
                  <td class="px-4 py-3 font-medium">{{ user.name }}</td>
                  <td class="px-4 py-3">{{ user.email }}</td>
                  <td class="px-4 py-3">
                      <span class="badge badge-neutral bg-gray-100">{{ user.role }}</span>
                  </td>
                  <td class="px-4 py-3">
                      <span :class="['badge', user.status === 'active' ? 'badge-success' : 'badge-neutral']">{{ user.status }}</span>
                  </td>
                  <td class="px-4 py-3 text-right">
                      <button @click="openModal(user)" class="btn btn-outline btn-xs mr-2">Modifica</button>
                      <button @click="deleteUser(user)" class="btn btn-outline btn-xs text-red-600 border-red-200">Elimina</button>
                  </td>
              </tr>
              <tr v-if="users.length === 0 && !loading">
                  <td colspan="5" class="text-center p-8 text-muted">Nessun operatore trovato.</td>
              </tr>
          </tbody>
      </table>
  </div>
  
  <!-- Modal -->
  <div v-if="modalOpen" class="modal-backdrop">
      <div class="modal-card">
          <h3 class="mb-4 text-xl font-bold">{{ modalMode === 'create' ? 'Nuovo Operatore' : 'Modifica Operatore' }}</h3>
          
          <form @submit.prevent="handleSubmit">
              <div class="mb-4">
                  <label class="block mb-1 font-medium">Nome</label>
                  <input v-model="form.name" class="input w-full" required />
              </div>
              <div class="mb-4">
                  <label class="block mb-1 font-medium">Email</label>
                  <input v-model="form.email" type="email" class="input w-full" required />
              </div>
              <div class="mb-4">
                  <label class="block mb-1 font-medium">{{ modalMode === 'create' ? 'Password' : 'Password (lasciare vuoto per non cambiare)' }}</label>
                  <input v-model="form.password" type="password" class="input w-full" :required="modalMode === 'create'" />
              </div>
              
              <div class="grid grid-cols-2 gap-4 mb-6">
                   <div>
                      <label class="block mb-1 font-medium">Ruolo</label>
                      <select v-model="form.role" class="input w-full">
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                      </select>
                  </div>
                  <div>
                      <label class="block mb-1 font-medium">Stato</label>
                      <select v-model="form.status" class="input w-full">
                          <option value="active">Attivo</option>
                          <option value="inactive">Inattivo</option>
                      </select>
                  </div>
              </div>
              
              <div v-if="formError" class="mb-4 text-red-600 bg-red-50 p-2 rounded text-sm">{{ formError }}</div>
              
              <div class="flex justify-end gap-2">
                  <button type="button" @click="closeModal" class="btn btn-outline">Annulla</button>
                  <button type="submit" class="btn btn-primary" :disabled="formLoading">Salva</button>
              </div>
          </form>
      </div>
  </div>
</template>

<style scoped>
.flex { display: flex; }
.justify-between { justify-content: space-between; }
.justify-end { justify-content: flex-end; }
.items-center { align-items: center; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-1 { margin-bottom: 0.25rem; }
.mr-2 { margin-right: 0.5rem; }
.p-0 { padding: 0; }
.p-8 { padding: 2rem; }
.gap-2 { gap: 0.5rem; }
.gap-4 { gap: 1rem; }
.w-full { width: 100%; }
.text-right { text-align: right; }
.text-left { text-align: left; }
.font-medium { font-weight: 500; }
.font-bold { font-weight: 700; }
.text-xl { font-size: 1.25rem; }
.text-sm { font-size: 0.875rem; }

.modal-backdrop {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
}
.modal-card {
    background: white;
    padding: 2rem;
    border-radius: 0.5rem;
    width: 100%;
    max-width: 500px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.badge {
    padding: 0.25rem 0.5rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
}
.badge-success { background: #dcfce7; color: #166534; }
.badge-neutral { background: #f1f5f9; color: #64748b; }
.text-red-600 { color: #dc2626; }
.bg-red-50 { background-color: #fef2f2; }
.border-red-200 { border-color: #fecaca; }
.grid { display: grid; }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.rounded { border-radius: 0.375rem; }
.btn-xs { padding: 0.1rem 0.5rem; font-size: 0.7rem; }
</style>
