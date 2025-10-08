import { createApp, ref, computed } from "vue";
import App from "../App.vue";
import router from "./router";
import "../scss/main.css";
import localforage from "localforage";

import {
  getUserData,
  setUser,
  getBodyData,
  setBodyData,
  foodDB,
} from "./database";

import type { UserData, BodyData, FoodDatabase } from "./types";

// === ФУНКЦИЯ СОХРАНЕНИЯ БАЗЫ ===
async function saveFoodDB(data: FoodDatabase) {
  await localforage.setItem("foodDatabase", data);
  Object.assign(foodDB.value, data); // сохраняем реактивно
}

// === ФУНКЦИЯ ЗАГРУЗКИ БАЗЫ ===
async function loadFoodDB() {
  const stored = await localforage.getItem<FoodDatabase>("foodDatabase");
  if (stored) {
    Object.assign(foodDB.value, stored);
  } else {
    const defaultDB: FoodDatabase = {
      default: [
        {
          id: "1",
          name: "Chicken breast",
          calories: 165,
          protein: 31,
          carbs: 0,
          fat: 3.6,
          portionSize: 100,
        },
        {
          id: "2",
          name: "Rice (boiled)",
          calories: 130,
          protein: 2.7,
          carbs: 28,
          fat: 0.3,
          portionSize: 100,
        }
      ],
      custom: [],
    };
    await localforage.setItem("foodDatabase", defaultDB);
    Object.assign(foodDB.value, defaultDB);
  }
}

async function bootstrap() {
  // === USER ===
  let userdata: UserData | null = await getUserData();
  if (!userdata) {
    userdata = { userName: "Guest", isNew: true };
    await setUser(userdata);
  }
  const userRef = ref<UserData>(userdata);

  // === BODY ===
  let userbody: BodyData | null = await getBodyData();
  if (!userbody) {
    userbody = {
      gender: "Male",
      age: { min: 16, max: 80, step: 1, current: 21, goal: 21 },
      height: { min: 140, max: 220, step: 1, current: 180, goal: 180 },
      weight: { min: 30, max: 110, step: 0.5, current: 72.5, goal: 85 },
      activity: {
        current: 1.55,
        all: [
          { text: "minimum", val: 1.2 },
          { text: "walking sometimes", val: 1.275 },
          { text: "low activity", val: 1.375 },
          { text: "medium activity", val: 1.55 },
          { text: "high activity", val: 1.725 },
          { text: "extreme activity", val: 1.9 },
        ],
      },
    };
    await setBodyData(userbody);
  }
  const bodyRef = ref<BodyData>(userbody);

  // === FOOD DATABASE ===
  await loadFoodDB();
  const foodRef = ref(foodDB.value);

  // === COMPUTED MACROS ===
  const usermacros = computed(() => {
    const { weight, height, age, gender, activity } = bodyRef.value;
    const { current: currentWeight, goal: goalWeight } = weight;

    // === BMR по Mifflin-St Jeor ===
    const BMR =
      gender === "Male"
        ? 10 * currentWeight + 6.25 * height.current - 5 * age.current + 5
        : 10 * currentWeight + 6.25 * height.current - 5 * age.current - 161;

    const TDEE = BMR * activity.current;

    // === Поддержание веса ===
    const maintain = {
      weight: currentWeight,
      kcal: Math.round(TDEE),
      proteins: +(currentWeight * 1.6).toFixed(1),
      fats: +((TDEE * 0.25) / 9).toFixed(1),
      carbs: +((TDEE * 0.5) / 4).toFixed(1),
    };

    // === Корректировка для достижения цели ===
    const weightDiff = goalWeight - currentWeight;
    if (weightDiff === 0) {
      return { maintain, modify: { ...maintain, weight: goalWeight } };
    }

    const daysToChange = (Math.abs(weightDiff) / 2) * 30;
    const muscleRatio = 0.5;

    const deltaCalories =
      (weightDiff * muscleRatio * 2500 +
        weightDiff * (1 - muscleRatio) * 7700) /
      daysToChange;

    const modifyTDEE = TDEE + deltaCalories;

    const proteinPerKg = 2;
    const proteinKcal = proteinPerKg * currentWeight * 4;
    const fatKcal = modifyTDEE * 0.25;
    const carbKcal = modifyTDEE - proteinKcal - fatKcal;

    const modify = {
      weight: goalWeight,
      kcal: Math.round(modifyTDEE),
      proteins: +(proteinPerKg * currentWeight).toFixed(1),
      fats: +(fatKcal / 9).toFixed(1),
      carbs: +(carbKcal / 4).toFixed(1),
    };

    return { maintain, modify };
  });

  // === APP INIT ===
  const app = createApp(App);
  app.provide("userdata", userRef);
  app.provide("userbody", bodyRef);
  app.provide("usermacros", usermacros);
  app.provide("foodDB", foodRef);
  app.provide("saveFoodDB", saveFoodDB);
  app.use(router);
  app.mount("#app");

  // === REDIRECT ===
  if (userRef.value.userName === "Guest") {
    router.push("/nameform");
  } else if (userRef.value.userName !== "Guest" && userRef.value.isNew) {
    router.push("/bodydata");
  } else {
    router.push("/dashboard");
  }
}

bootstrap();
