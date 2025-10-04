import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../pages/dashboard/DashboardMain.vue";
import BodyData from "../pages/bodydata/BodyDataMain.vue";
import FoodBase from "../pages/foodbase/FoodbaseMain.vue";
import Intakes from "../pages/intakes/IntakesMain.vue";
import Settings from "../pages/settings/SettingsMain.vue";
import Nameform from "../pages/nameform/NameformMain.vue";

const routes = [
  { path: "/", redirect: "/dashboard" },
  { path: "/dashboard", component: Dashboard },
  { path: "/bodydata", component: BodyData },
  { path: "/foodbase", component: FoodBase },
  { path: "/intakes", component: Intakes },
  { path: "/settings", component: Settings },
  { path: "/nameform", component: Nameform },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;