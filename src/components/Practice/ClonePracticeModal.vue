<script setup>
import { reactive, ref, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'

const props = defineProps({
    isOpen: Boolean,
    practice: Object
})

const emit = defineEmits(['close', 'success'])
const auth = useAuthStore()
const loading = ref(false)

const cloneOptions = reactive({
    with_attachments: false,
    link_to_parent: true
})

// Reset options when modal opens
watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        cloneOptions.with_attachments = false
        cloneOptions.link_to_parent = true
    }
})

const confirmClone = async () => {
    if (!props.practice) return
    loading.value = true
    
    try {
        const response = await auth.api().post(`/practices/${props.practice.id}/clone`, cloneOptions)
        emit('success', response.data)
        emit('close')
    } catch (e) {
        console.error(e)
        alert('Errore durante la clonazione')
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h3 class="text-lg font-bold mb-4">Clona Pratica</h3>
            <p class="mb-4 text-sm text-gray-600">Stai clonando: <strong>{{ practice?.code }}</strong></p>
            
            <div class="mb-4 space-y-2">
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" v-model="cloneOptions.link_to_parent" class="checkbox">
                    <span>Mantieni collegamento con padre</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" v-model="cloneOptions.with_attachments" class="checkbox">
                    <span>Clona allegati</span>
                </label>
            </div>
            
            <div class="flex justify-end gap-2 mt-6">
                <button @click="$emit('close')" class="btn btn-outline text-gray-500" :disabled="loading">Annulla</button>
                <button @click="confirmClone" class="btn btn-primary" :disabled="loading">
                    {{ loading ? 'Clonazione...' : 'Clona' }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.fixed { position: fixed; }
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
.bg-black { background-color: black; }
.bg-opacity-50 { background-color: rgba(0, 0, 0, 0.5); }
.flex { display: flex; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.z-50 { z-index: 50; }
.bg-white { background-color: white; }
.p-6 { padding: 1.5rem; }
.rounded { border-radius: 0.375rem; }
.shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
.max-w-sm { max-width: 24rem; }
.w-full { width: 100%; }
.text-lg { font-size: 1.125rem; }
.font-bold { font-weight: 700; }
.mb-4 { margin-bottom: 1rem; }
.text-sm { font-size: 0.875rem; }
.text-gray-600 { color: #4b5563; }
.space-y-2 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.5rem; }
.gap-2 { gap: 0.5rem; }
.cursor-pointer { cursor: pointer; }
.justify-end { justify-content: flex-end; }
.mt-6 { margin-top: 1.5rem; }
.text-gray-500 { color: #6b7280; }
</style>
