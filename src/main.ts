import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const app = createApp(App);
app.use(router); // 确保使用 router
app.use(ElementPlus);
app.mount('#app');
