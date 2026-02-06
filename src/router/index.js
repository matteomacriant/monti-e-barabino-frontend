import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import PracticeIndex from '../views/Practice/Index.vue'
import PracticeForm from '../views/Practice/Form.vue'
import PracticeShow from '../views/Practice/Show.vue'

const routes = [
    { path: '/login', component: Login, meta: { guest: true } },
    { path: '/', component: Dashboard, meta: { requiresAuth: true } },
    { path: '/practices', component: PracticeIndex, meta: { requiresAuth: true } },
    { path: '/practices/create', component: PracticeForm, meta: { requiresAuth: true } },
    { path: '/practices/:id', component: PracticeShow, meta: { requiresAuth: true } },
    { path: '/practices/:id/edit', component: PracticeForm, meta: { requiresAuth: true } },
    { path: '/search', component: () => import('../views/Search.vue'), meta: { requiresAuth: true } },
    { path: '/operators', component: () => import('../views/Operators.vue'), meta: { requiresAuth: true } },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const auth = useAuthStore()
    if (to.meta.requiresAuth && !auth.token) {
        next('/login')
    } else if (to.meta.guest && auth.token) {
        next('/')
    } else {
        next()
    }
})

export default router
