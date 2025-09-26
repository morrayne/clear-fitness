// ROUTER
import { createRouter, createWebHistory } from "vue-router";
import homePage from "./pages/home/home.main.vue";
import calloriesPage from "./pages/callories/callories.main.vue";
import trainingPage from "./pages/training/training.main.vue";
import paramsPage from "./pages/params/params.main.vue";
import settingsPage from "./pages/settings/settings.main.vue";
import formPage from "./pages/form/form.main.vue";

const routes = [
  { path: "/", redirect: "/home" },
  { path: "/home", component: homePage, meta: { header: true } },
  { path: "/callories", component: calloriesPage, meta: { header: true } },
  { path: "/training", component: trainingPage, meta: { header: true } },
  { path: "/params", component: paramsPage, meta: { header: true } },
  { path: "/settings", component: settingsPage, meta: { header: true } },
  { path: "/form", component: formPage, meta: { header: false } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// MAIN
import { createApp } from "vue";
import App from "./App.vue";
import "./scss/main.css";

const app = createApp(App);
app.use(router);
app.mount("#app");
