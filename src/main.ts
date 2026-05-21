import "./assets/css/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import { createRouter, createWebHistory } from "vue-router";
import { routes, handleHotUpdate } from "vue-router/auto-routes";
import b24UiPlugin from "@bitrix24/b24ui-nuxt/vue-plugin";

import App from "./App.vue";

const pinia = createPinia();
const app = createApp(App);

const router = createRouter({
  routes,
  history: createWebHistory("/frontend/users/stat/"),
});

app.use(pinia);
app.use(router);
app.use(b24UiPlugin);

app.mount("#app");

if (import.meta.hot) {
  handleHotUpdate(router);
}
