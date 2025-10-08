import localforage from "localforage";
import { ref } from "vue";
import type {
  UserData,
  BodyData,
  FoodItem,
  FoodDatabase,
  DailyEntry,
} from "./types";

// === LOCALFORAGE SETTINGS ===
localforage.config({
  name: "Clear-fitness-db",
  storeName: "main-storage",
});

// === BASE USER INFO ===

export async function getUserData(): Promise<UserData | null> {
  return await localforage.getItem<UserData>("userdata");
}

export async function setUser(data: UserData): Promise<void> {
  await localforage.setItem("userdata", data);
}

export async function clearUser(): Promise<void> {
  await localforage.removeItem("userdata");
}

// === BODY USER INFO ===

export async function getBodyData(): Promise<BodyData | null> {
  return await localforage.getItem<BodyData>("userbody");
}

export async function setBodyData(data: BodyData): Promise<void> {
  await localforage.setItem("userbody", data);
}

// === FOOD DATABASE ===

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

export const foodDB = ref<FoodDatabase>({
  default: defaultFoods,
  custom: [],
});

export async function loadFoodDB() {
  try {
    const stored = await localforage.getItem<FoodDatabase>("foodDatabase");
    if (stored) {
      foodDB.value.default = stored.default?.length
        ? [...stored.default]
        : [...defaultFoods];
      foodDB.value.custom = stored.custom ? [...stored.custom] : [];
    } else {
      const initialDB: FoodDatabase = {
        default: [...defaultFoods],
        custom: [],
      };
      await localforage.setItem("foodDatabase", initialDB);
    }
    return foodDB;
  } catch (error) {
    console.error("Error loading food database:", error);
    foodDB.value.default = [...defaultFoods];
    foodDB.value.custom = [];
    return foodDB;
  }
}

export async function saveFoodDB() {
  try {
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

export async function addCustomFood(food: Omit<FoodItem, "id">) {
  const id = Date.now().toString();
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

export async function removeCustomFood(id: string) {
  foodDB.value.custom = foodDB.value.custom.filter((f) => f.id !== id);
  await saveFoodDB();
}

// === DAILY MEALS STORAGE ===

export async function addDailyEntry(entry: DailyEntry) {
  if (!entry || !entry.date) {
    throw new Error("addDailyEntry: entry.date is required");
  }

  const cleanEntry: DailyEntry = {
    date: entry.date,
    foods: JSON.parse(JSON.stringify(entry.foods || [])),
    macros: { ...entry.macros },
  };

  // получаем существующие дневные записи
  const allEntries =
    (await localforage.getItem<Record<string, DailyEntry[]>>("dailyEntries")) ||
    {};

  const existing = allEntries[cleanEntry.date] || [];
  existing.push(cleanEntry);
  allEntries[cleanEntry.date] = existing;

  await localforage.setItem("dailyEntries", allEntries);
}

export async function getDailyEntries(date: string): Promise<DailyEntry[]> {
  const allEntries =
    (await localforage.getItem<Record<string, DailyEntry[]>>("dailyEntries")) ||
    {};
  return allEntries[date] || [];
}

export async function clearDailyEntries(date?: string) {
  const allEntries =
    (await localforage.getItem<Record<string, DailyEntry[]>>("dailyEntries")) ||
    {};

  if (date) {
    delete allEntries[date];
  } else {
    Object.keys(allEntries).forEach((k) => delete allEntries[k]);
  }

  await localforage.setItem("dailyEntries", allEntries);
}
