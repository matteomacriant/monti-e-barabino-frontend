<script setup>
import { useAuthStore } from '../stores/auth'
const auth = useAuthStore()
</script>

<template>
  <div class="top-bar">
    <div class="user-info">
        <span v-if="auth.user">Benvenuto, {{ auth.user.name }}</span>
    </div>
    <div class="actions">
        <!-- Notification icons or similar -->
    </div>
  </div>
</template>

<style scoped>
.user-info {
    font-weight: 500;
}
</style>
