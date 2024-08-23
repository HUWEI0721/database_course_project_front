import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import store from './store'
import ArcoVue from '@arco-design/web-vue';
import '@arco-design/web-vue/dist/arco.css';

import Vue3EmojiPicker from 'vue3-emoji-picker';

const app = createApp(App)
app.component('Vue3EmojiPicker', Vue3EmojiPicker)
app.use(router)
app.use(ElementPlus)
app.use(store)
app.use(ArcoVue);
app.mount('#app')
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
