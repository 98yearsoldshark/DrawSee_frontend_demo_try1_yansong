import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '@/components/Home.vue';
import ChatPage from "@/components/ChatPage.vue";


const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Home',
        component: Home,
    },
    {
        path: '/chat',
        name: 'ChatPage',
        component: ChatPage,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
