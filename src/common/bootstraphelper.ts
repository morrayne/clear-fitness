// DATA BASE TOOL IMPORT
import localforage from "localforage";

// DEFAULT USER CONFIG
import type { TypeDefaultConfig } from "./types";
export async function setDefaultUserConfig() {
  let temp: TypeDefaultConfig | null =
    await localforage.getItem<TypeDefaultConfig>("userconfig");
  if (!temp) {
    temp = {
      general: {
        name: "Guest",
        lang: "en",
        isNew: true,
      },
      weight: {
        min: 40,
        max: 120,
        step: 0.5,
        bigStep: 10,
        text: "kg",
        textAlt: "lbs",
        mod: 2.2,
      },
      height: {
        min: 140,
        max: 220,
        step: 1,
        bigStep: 10,
        text: "cm",
        textAlt: "ft",
        mod: 1 / 30.5,
      },
      age: {
        min: 14,
        max: 72,
        step: 1,
        bigStep: 10,
        text: "years",
        mod: 1,
      },
      bf: {
        min: 5,
        max: 25,
        step: 1,
        bigStep: 10,
        text: "%",
        mod: 1,
      },
      activity: [1.2, 1.275, 1.375, 1.55, 1.725, 1.9],
      gender: [5, -161, -78],
      accuracy: ["Normal", "Athletic"],
    };
    await localforage.setItem<TypeDefaultConfig>("userconfig", temp);
  }
  return temp;
}

// DEFAULT USER BODY
import type { TypeDefaultBody } from "./types";
export async function setDefaultUserBody() {
  let temp: TypeDefaultBody | null = await localforage.getItem<TypeDefaultBody>(
    "userbody"
  );
  if (!temp) {
    temp = {
      currentWeight: 72.5,
      goalWeight: 80,
      goalBF: 15,
      height: 180,
      gender: 5,
      age: 21,
      activity: 1.55,
      accuracy: "Normal",
    };
    await localforage.setItem<TypeDefaultBody>("userbody", temp);
  }
  return temp;
}

// DEFAULT COMMON FOOD
import type { TypeFood } from "./types";
export async function setDefaulFoodAssets() {
  let temp: TypeFood[] | null = await localforage.getItem<TypeFood[]>(
    "commonfood"
  );
  if (!temp) {
    const defaultFood: TypeFood[] = [
      {
        id: 0,
        name: "Boiled Rice",
        portionSize: 100,
        kcal: 130,
        proteins: 2.7,
        carbs: 28,
        fats: 0.3,
      },
      {
        id: 1,
        name: "Banana",
        portionSize: 120,
        kcal: 105,
        proteins: 1.3,
        carbs: 27,
        fats: 0.4,
      },
      {
        id: 2,
        name: "Wheat Bread",
        portionSize: 100,
        kcal: 265,
        proteins: 7.7,
        carbs: 51,
        fats: 3.2,
      },
    ];

    await localforage.setItem("commonfood", defaultFood);
  }
  return temp;
}

// USER MACROS CALCULATIONS
import type { TypeMacro } from "./types";
export async function setUserMacros() {
  const body: TypeDefaultBody | null = await localforage.getItem<TypeDefaultBody>("userbody");
  if (!body) return null;

  // --- BMR ---
  const genderCorrection = body.gender === 5 ? 5 : body.gender === -161 ? -161 : -78;
  const BMR =
    10 * body.currentWeight +
    6.25 * body.height -
    5 * body.age +
    genderCorrection;
  let TDEE = BMR * body.activity;

  // --- Lean mass ---
  const currentBF = body.goalBF ?? 15;
  const currentBFPercent = currentBF / 100;
  const currentLeanMass = body.currentWeight * (1 - currentBFPercent);

  // --- FFMI для атлетов (по желанию, можно убрать для универсальности) ---
  const heightM = body.height / 100;
  let ffmi = currentLeanMass / heightM ** 2;

  if (body.accuracy === "Athletic") {
    const maxFFMI = 25;
    const ffmiFactor = Math.min(ffmi / maxFFMI, 1);
    const leanFactor =
      1 + Math.max(0, (currentLeanMass - 65) * 0.01 * ffmiFactor);
    TDEE *= leanFactor;
  }

  // --- Расчёт поддержания ---
  const maintain: TypeMacro = {
    weight: body.currentWeight,
    bf: +currentBF.toFixed(1),
    kcal: Math.round(TDEE),
    proteins: +(currentLeanMass * 2.2).toFixed(1),
    fats: +((TDEE * 0.25) / 9).toFixed(1),
    carbs: +((TDEE - currentLeanMass * 2.2 * 4 - TDEE * 0.25) / 4).toFixed(1),
  };

  // --- Цель ---
  const weightDiff = body.goalWeight - body.currentWeight;
  if (weightDiff === 0) {
    return {
      maintain,
      modify: {
        ...maintain,
        weight: body.goalWeight,
        bf: body.goalBF ?? currentBF,
      },
    };
  }

  // --- Безопасное изменение веса ---
  const safeWeightChange = weightDiff > 0 ? 0.3 : 0.5; // кг/нед
  const daysToChange = (Math.abs(weightDiff) / safeWeightChange) * 7;

  // --- Мышечная доля набора/потери ---
  let muscleRatio: number;
  if (weightDiff > 0) {
    muscleRatio = currentBF <= 10 ? 0.85 : currentBF <= 15 ? 0.7 : 0.55;
  } else {
    muscleRatio = currentBF <= 10 ? 0.6 : currentBF <= 15 ? 0.75 : 0.85;
  }

  // --- Коррекция калорий ---
  const fatEnergy = 7700;
  const muscleEnergy = 1800;
  const deltaCalories =
    (weightDiff * muscleRatio * muscleEnergy +
      weightDiff * (1 - muscleRatio) * fatEnergy) /
    daysToChange;
  const modifyTDEE = TDEE + deltaCalories;

  // --- Распределение макросов ---
  const goalBFPercent = (body.goalBF ?? currentBF) / 100;
  const goalLeanMass = body.goalWeight * (1 - goalBFPercent);

  const proteinPerKg = weightDiff > 0 ? 2.0 : 2.4;
  const fatPercentage = weightDiff > 0 ? 0.25 : 0.22;

  const proteinKcal = proteinPerKg * goalLeanMass * 4;
  const fatKcal = modifyTDEE * fatPercentage;
  const carbKcal = modifyTDEE - proteinKcal - fatKcal;

  const minCarbKcal = modifyTDEE * 0.15;
  const adjustedCarbKcal = Math.max(carbKcal, minCarbKcal);
  const adjustedFatKcal =
    carbKcal < minCarbKcal ? fatKcal - (minCarbKcal - carbKcal) : fatKcal;

  const modify: TypeMacro = {
    weight: body.goalWeight,
    bf: body.goalBF ?? +(currentBF + (weightDiff > 0 ? 2 : -5)).toFixed(1),
    kcal: Math.round(modifyTDEE),
    proteins: +(proteinPerKg * goalLeanMass).toFixed(1),
    fats: +(adjustedFatKcal / 9).toFixed(1),
    carbs: +(adjustedCarbKcal / 4).toFixed(1),
  };

  return { maintain, modify };
}
