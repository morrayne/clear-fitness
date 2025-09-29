import { ref } from "vue";
import localforage from "localforage";

// ===== ТИПЫ =====
export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portionSize: number;
}

export interface DailyFoodEntry {
  id: string;
  foodItem: FoodItem;
  consumedAt: string;
}

export interface DailyEntry {
  id: string;
  date: string; // YYYY-MM-DD
  foods: DailyFoodEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface UseCaloriesReturn {
  foodDatabase: { value: FoodItem[] };
  dailyEntries: { value: DailyEntry[] };
  addCustomFood: (foodItem: FoodItem) => Promise<FoodItem>;
  addFoodToToday: (foodItem: FoodItem) => Promise<DailyFoodEntry>;
  getTodayEntries: () => DailyEntry;
  initDatabase: () => Promise<void>;
}

// ===== СОСТОЯНИЕ =====
const foodDatabase = ref<FoodItem[]>([]);
const dailyEntries = ref<DailyEntry[]>([]);

let isInitialized = false;

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
const createDefaultDailyEntry = (date: string): DailyEntry => ({
  id: Date.now().toString(),
  date,
  foods: [],
  totalCalories: 0,
  totalProtein: 0,
  totalCarbs: 0,
  totalFat: 0,
});

const updateDailyTotals = (dailyEntry: DailyEntry): void => {
  dailyEntry.totalCalories = dailyEntry.foods.reduce((sum, entry) => sum + entry.foodItem.calories, 0);
  dailyEntry.totalProtein = dailyEntry.foods.reduce((sum, entry) => sum + entry.foodItem.protein, 0);
  dailyEntry.totalCarbs = dailyEntry.foods.reduce((sum, entry) => sum + entry.foodItem.carbs, 0);
  dailyEntry.totalFat = dailyEntry.foods.reduce((sum, entry) => sum + entry.foodItem.fat, 0);
};

const createFoodEntry = (foodItem: FoodItem): DailyFoodEntry => ({
  id: Date.now().toString(),
  foodItem,
  consumedAt: new Date().toISOString(),
});

const getTodayDate = (): string => {
  const now = new Date();
  // Используем локальную дату, а не UTC
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ===== РАБОТА С БАЗОЙ ДАННЫХ =====
// В callories.script.ts добавь экспорт:
export const saveFoodsToDatabase = async (): Promise<void> => {
  try {
    const dataToSave = JSON.parse(JSON.stringify(foodDatabase.value));
    await localforage.setItem('food-database', dataToSave);
    console.log('Foods saved to database');
  } catch (error) {
    console.error('Error saving food database:', error);
  }
};

const saveEntriesToDatabase = async (): Promise<void> => {
  try {
    const dataToSave = JSON.parse(JSON.stringify(dailyEntries.value));
    await localforage.setItem('daily-entries', dataToSave);
  } catch (error) {
    console.error('Error saving daily entries:', error);
  }
};

const loadFoodsFromDatabase = async (): Promise<void> => {
  const savedFoods = await localforage.getItem<FoodItem[]>('food-database');
  if (savedFoods) {
    foodDatabase.value = savedFoods;
  }
};

const loadEntriesFromDatabase = async (): Promise<void> => {
  const savedEntries = await localforage.getItem<DailyEntry[]>('daily-entries');
  if (savedEntries) {
    dailyEntries.value = savedEntries;
  }
};

// ===== ДЕМО ДАННЫЕ =====
const getDemoFoods = (): FoodItem[] => [
  {
    id: "1",
    name: "Chicken Breast",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    portionSize: 100,
  },
  {
    id: "2",
    name: "Rice",
    calories: 130,
    protein: 2.7,
    carbs: 28,
    fat: 0.3,
    portionSize: 100,
  },
];

// ===== ОСНОВНОЙ КОМПОЗАБЛ =====
export const useCalories = (): UseCaloriesReturn => {
  const initDatabase = async (): Promise<void> => {
    if (isInitialized) return;
    
    try {
      await loadFoodsFromDatabase();
      
      // Если база продуктов пустая, загружаем демо данные
      if (foodDatabase.value.length === 0) {
        foodDatabase.value = getDemoFoods();
        await saveFoodsToDatabase();
      }

      await loadEntriesFromDatabase();
      isInitialized = true;
      
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  };

  const addCustomFood = async (foodItem: FoodItem): Promise<FoodItem> => {
    foodDatabase.value.push(foodItem);
    await saveFoodsToDatabase();
    return foodItem;
  };

  const addFoodToToday = async (foodItem: FoodItem): Promise<DailyFoodEntry> => {
    const today = getTodayDate();
    
    // Находим или создаем запись за сегодня
    let dailyEntry = dailyEntries.value.find(entry => entry.date === today);
    
    if (!dailyEntry) {
      dailyEntry = createDefaultDailyEntry(today);
      dailyEntries.value.push(dailyEntry);
    }

    const foodEntry = createFoodEntry(foodItem);
    dailyEntry.foods.push(foodEntry);
    updateDailyTotals(dailyEntry);
    
    await saveEntriesToDatabase();
    
    console.log('Added to today:', foodItem);
    console.log('Today\'s entries:', dailyEntry);
    
    return foodEntry;
  };

  const getTodayEntries = (): DailyEntry => {
    const today = getTodayDate();
    const foundEntry = dailyEntries.value.find(entry => entry.date === today);
    
    return foundEntry || createDefaultDailyEntry(today);
  };

  return {
    foodDatabase,
    dailyEntries,
    addCustomFood,
    addFoodToToday,
    getTodayEntries,
    initDatabase
  };
};


