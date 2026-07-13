import "./assets/css/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import { createRouter, createWebHistory } from "vue-router";
import b24UiPlugin from "@bitrix24/b24ui-nuxt/vue-plugin";

import App from "./App.vue";
import Index from "./pages/indexPage.vue";
import AccountsPage from "./pages/AccountsPage.vue";
import ContractsPage from "./pages/ContractsPage.vue";
import ChatsPage from "./pages/ChatsPage.vue";
import DepositsPage from "./pages/DepositsPage.vue";

const pinia = createPinia();
const app = createApp(App);

const routes = [
  { path: "/", component: Index },
  { path: "/accounts", component: AccountsPage },
  { path: "/contracts", component: ContractsPage },
  { path: "/chats", component: ChatsPage },
  { path: "/deposits", component: DepositsPage },
];

const router = createRouter({
  routes,
  history: createWebHistory(),
});

app.use(pinia);
app.use(router);
app.use(b24UiPlugin);

app.mount("#app");
