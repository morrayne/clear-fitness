import localforage from "localforage";

localforage.config({
  name: "Clear-fitness-db",
  storeName: "main-storage",
});

// =====================
// === BASE USER INFO ===
// =====================
export interface UserData {
  userName: string;
  isNew: boolean;
}
export async function getUserData(): Promise<UserData | null> {
  return await localforage.getItem<UserData>("userdata");
}
export async function setUser(data: UserData): Promise<void> {
  await localforage.setItem("userdata", data);
}
export async function clearUser(): Promise<void> {
  await localforage.removeItem("userdata");
}

// ======================
// === BODY USER INFO ===
// ======================
export interface RangeValue {
  min: number;
  max: number;
  step: number;
  current: number;
  goal: number;
}
export interface ActivityLevel {
  text: string;
  val: number;
}
export interface Macros {
  weight: number;
  kcal: number;
  proteins: number;
  fats: number;
  carbs: number;
}
export interface UserMacros {
  maintain: Macros;
  modify: Macros;
}

export interface BodyData {
  gender: "Male" | "Female" | "Secret";
  age: RangeValue;
  height: RangeValue;
  weight: RangeValue;
  activity: {
    current: number;
    all: ActivityLevel[];
  };
}

export async function getBodyData(): Promise<BodyData | null> {
  return await localforage.getItem<BodyData>("userbody");
}
export async function setBodyData(data: BodyData): Promise<void> {
  await localforage.setItem("userbody", data);
}

// =====================
// === FOOD DATABASE ===
// =====================
import { ref } from "vue";

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portionSize: number; // граммы, 100 по умолчанию
}

export interface FoodDatabase {
  default: FoodItem[];
  custom: FoodItem[];
}

// === Базовые продукты ===
const defaultFoods: FoodItem[] = [
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
  },
  {
    id: "3",
    name: "Olive oil",
    calories: 884,
    protein: 0,
    carbs: 0,
    fat: 100,
    portionSize: 100,
  },
];

// === РЕАКТИВНОЕ ХРАНИЛИЩЕ ===
export const foodDB = ref<FoodDatabase>({ default: defaultFoods, custom: [] });

// === Загрузка и сохранение ===
export async function loadFoodDB() {
  try {
    const stored = await localforage.getItem<FoodDatabase>("foodDatabase");
    if (stored) {
      // Используем Object.assign для избежания реактивных проблем
      foodDB.value.default = stored.default
        ? [...stored.default]
        : [...defaultFoods];
      foodDB.value.custom = stored.custom ? [...stored.custom] : [];
    } else {
      // Сохраняем начальные данные
      const initialDB: FoodDatabase = {
        default: [...defaultFoods],
        custom: [],
      };
      await localforage.setItem("foodDatabase", initialDB);
    }
    return foodDB;
  } catch (error) {
    console.error("Error loading food database:", error);
    // Возвращаем значения по умолчанию при ошибке
    foodDB.value.default = [...defaultFoods];
    foodDB.value.custom = [];
    return foodDB;
  }
}

export async function saveFoodDB() {
  try {
    // Создаем глубокую копию без реактивных свойств
    const simpleDB: FoodDatabase = {
      default: JSON.parse(JSON.stringify(foodDB.value.default)),
      custom: JSON.parse(JSON.stringify(foodDB.value.custom)),
    };
    await localforage.setItem("foodDatabase", simpleDB);
  } catch (error) {
    console.error("Error saving food database:", error);
    throw error;
  }
}

// === Добавление ===
export async function addCustomFood(food: Omit<FoodItem, "id">) {
  const id = Date.now().toString();

  // Создаем чистый объект продукта
  const newFood: FoodItem = {
    id,
    name: food.name.trim(),
    calories: Math.round(food.calories),
    protein: Math.round(food.protein * 100) / 100,
    carbs: Math.round(food.carbs * 100) / 100,
    fat: Math.round(food.fat * 100) / 100,
    portionSize: food.portionSize,
  };

  foodDB.value.custom.push(newFood);
  await saveFoodDB();
  return newFood;
}

// === Удаление ===
export async function removeCustomFood(id: string) {
  foodDB.value.custom = foodDB.value.custom.filter((f) => f.id !== id);
  await saveFoodDB();
}
