import type { General, Macros } from "../../data/database.script";

// РАССЧЕТ BRM
export function calculateBMR(data: General): number {
  let genderNum = 0;
  if (data.gender === "Male") genderNum = 5;
  else if (data.gender === "Female") genderNum = -161;
  else genderNum = -78;
  return Math.round(10 * data.weight + 6.25 * data.height - 5 * data.age + genderNum);
}

// РАССЧЕТ МАКРОСОВ
export function calculateMacros(data: General & { tdee: number }): Macros {
  const bmr = calculateBMR(data);
  const kcal = Math.round(bmr * data.tdee);
  const proteins = Math.round(data.weight * 1.6);
  const fats = Math.round(data.weight * 0.9);
  const proteinCalories = proteins * 4;
  const fatCalories = fats * 9;
  const carbs = Math.max(0, Math.round((kcal - proteinCalories - fatCalories) / 4));
  return { kcal, tdee: data.tdee, intake: 0, proteins, carbs, fats };
}

// РАССЧЕТ TDEE
export function calculateIntake(data: General & { tdee: number }, preintake: number): Macros {
  const baseMacros = calculateMacros(data);
  const adjustedKcal = Math.round(baseMacros.kcal * (1 + preintake / 100));
  const proteins = preintake > 0 ? Math.round(data.weight * 2.0) : Math.round(data.weight * 1.6);
  const fats = Math.round(data.weight * 0.9);
  const proteinCalories = proteins * 4;
  const fatCalories = fats * 9;
  const carbs = Math.max(0, Math.round((adjustedKcal - proteinCalories - fatCalories) / 4));
  return {
    kcal: adjustedKcal,
    proteins,
    fats,
    carbs,
    tdee: data.tdee,
    intake: preintake ?? 0,
  };
}
