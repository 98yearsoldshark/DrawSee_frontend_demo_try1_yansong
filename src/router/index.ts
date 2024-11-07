import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '@/components/pages/Home.vue';
import ChatPage from "@/components/pages/ChatPage.vue";
import FlowPage from "@/components/example/FlowPage.vue";
import KnowledgePointManager from "@/components/pages/KnowledgePointManager.vue";
import AboutPage from "@/components/pages/AboutPage.vue";

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Home',
        component: Home,
    },
    {
        path: '/chat/:agentId/:agentName/:openid',
        name: 'ChatPage',
        component: ChatPage,
        props: true
    },
    {
        path: '/admin',
        name: 'KnowledgePointManager',
        component: KnowledgePointManager,
    },
    {
        path: '/about',
        name: 'AboutPage',
        component: AboutPage,
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
