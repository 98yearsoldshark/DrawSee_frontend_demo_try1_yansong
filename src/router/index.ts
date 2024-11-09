import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '@/components/pages/Home.vue';
import AgentsPage from '@/components/pages/AgentsPage.vue';
import ChatPage from "@/components/pages/ChatPage.vue";
import FlowPage from "@/components/example/FlowPage.vue";
import KnowledgeBaseManager from "@/components/pages/KnowledgeBaseManager.vue";
import KnowledgePointManager from "@/components/pages/KnowledgePointManager.vue";
import AboutPage from "@/components/pages/AboutPage.vue";
import AdminLogin from "@/components/pages/AdminLogin.vue";

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Home',
        component: Home,
    },
    {
        path: '/agent',
        name: 'AgentsPage',
        component: AgentsPage,
    },
    {
        path: '/chat/:agentId/:user_id',        name: 'ChatPage',
        component: ChatPage,
        props: true
    },
    {
        path: '/admin/login',
        name: 'AdminLogin',
        component: AdminLogin,
    },
    {
        path: '/admin/knowledgebase/:user_id',
        name: 'KnowledgeBaseManager',
        component: KnowledgeBaseManager,
        props: true,
    },
    {
        path: '/admin/knowledgebase/:user_id/:knowledge_base_id',
        name: 'KnowledgePointManager',
        component: KnowledgePointManager,
        props: true,
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
