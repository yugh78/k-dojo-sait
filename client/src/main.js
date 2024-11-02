import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

import { createMemoryHistory, createRouter } from 'vue-router'

import HomeView from './views/HomeView.vue'
import AboutView from './views/AboutView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/about', component: AboutView },
];

const router = createRouter({
  history: createMemoryHistory(), routes,
})

createApp(App)
  .use(router)
  .mount('#app')

