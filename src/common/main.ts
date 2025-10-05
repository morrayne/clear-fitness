import { createApp, ref, computed } from "vue";
import App from "../App.vue";
import router from "./router";
import "../scss/main.css";

import { getUserData, setUser, type UserData } from "./database";
import { getBodyData, setBodyData, type BodyData } from "./database";

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
      proteins: +(currentWeight * 1.6).toFixed(1), // базовый белок 1.6 г/кг
      fats: +((TDEE * 0.25) / 9).toFixed(1),
      carbs: +((TDEE * 0.5) / 4).toFixed(1),
    };

    // === Корректировка для достижения цели ===
    const weightDiff = goalWeight - currentWeight; // кг
    if (weightDiff === 0) {
      return { maintain, modify: { ...maintain, weight: goalWeight } };
    }

    const daysToChange = (Math.abs(weightDiff) / 2) * 30; // 2 кг = 1 месяц, 30 дней в месяце
    const muscleRatio = 0.5; // 50% мышц, 50% жира

    // Дневная калорийная корректировка
    const deltaCalories =
      (weightDiff * muscleRatio * 2500 +
        weightDiff * (1 - muscleRatio) * 7700) /
      daysToChange;

    const modifyTDEE = TDEE + deltaCalories;

    // Расчёт макросов
    const proteinPerKg = 2; // 2 г белка на кг для набора
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
