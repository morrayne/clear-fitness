import { ref } from "vue";
import localforage from "localforage";

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portionSize: number;
}

const foodDatabase = ref<FoodItem[]>([]);
let isInitialized = false;

export const useCalories = () => {
  const initDatabase = async () => {
    if (isInitialized) return;
    
    try {
      const savedFoods = await localforage.getItem<FoodItem[]>('food-database');
      if (savedFoods) {
        foodDatabase.value = savedFoods;
        console.log('Loaded from database:', foodDatabase.value);
      } else {
        // Демо данные только если база пустая
        const demoFoods = [
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
        foodDatabase.value = demoFoods;
        await saveToDatabase();
      }
      isInitialized = true;
    } catch (error) {
      console.error('Error loading database:', error);
    }
  };

  const saveToDatabase = async () => {
    try {
      const dataToSave = JSON.parse(JSON.stringify(foodDatabase.value));
      await localforage.setItem('food-database', dataToSave);
      console.log('Saved to database:', dataToSave);
    } catch (error) {
      console.error('Error saving to database:', error);
    }
  };

  const addCustomFood = async (foodItem: FoodItem) => {
    foodDatabase.value.push(foodItem);
    await saveToDatabase();
    console.log("Food added to database:", foodItem);
    return foodItem;
  };

  return {
    foodDatabase,
    addCustomFood,
    initDatabase
  };
};