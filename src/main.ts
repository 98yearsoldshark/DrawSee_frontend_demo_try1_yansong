import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import '@vue-flow/core/dist/style.css';
import axios from "axios";

axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('access_token')}`;
const app = createApp(App);
app.use(router);
app.use(ElementPlus);
app.mount('#app');
