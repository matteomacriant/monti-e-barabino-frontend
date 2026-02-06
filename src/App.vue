<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { useAuthStore } from './stores/auth'
import AppSidebar from './components/AppSidebar.vue'
import AppHeader from './components/AppHeader.vue'

const route = useRoute()
const auth = useAuthStore()

const isPublic = computed(() => route.meta.guest)
</script>

<template>
  <div v-if="isPublic" class="h-screen w-full flex items-center justify-center bg-gray-50">
    <router-view></router-view>
  </div>
  
  <div v-else class="layout">
    <AppSidebar />
    <div class="main-content">
      <AppHeader />
      <div class="page-content">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
