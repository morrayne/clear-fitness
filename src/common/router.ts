import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../pages/dashboard/DashboardMain.vue";
import Bodyinput from "../pages/bodyinput/bodyinput.vue";
import Settings from "../pages/settings/SettingsMain.vue";
import FoodBase from "../pages/addrecord/addrecord.vue"; 
import Intakes from "../pages/intakes/IntakesMain.vue";
import Nameinput from "../pages/nameinput/nameinput.vue";

const routes = [
  { path: "/", redirect: "/dashboard" },
  { path: "/dashboard", component: Dashboard },
  { path: "/bodyinput", component: Bodyinput },
  { path: "/addrecord", component: FoodBase },
  { path: "/intakes", component: Intakes },
  { path: "/settings", component: Settings },
  { path: "/nameinput", component: Nameinput },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
