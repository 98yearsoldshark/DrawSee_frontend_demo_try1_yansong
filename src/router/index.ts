import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '@/components/Home.vue';
import ChatPage from "@/components/ChatPage.vue";
import FlowPage from "@/components/FlowPage.vue";


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
    {
        path: '/flow',
        name: 'FlowPage',
        component: FlowPage,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
