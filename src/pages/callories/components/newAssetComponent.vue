<script setup lang="ts">
import { ref, watch } from "vue";
import { useCalories } from "../callories.script";

const { addCustomFood } = useCalories();

const newFood = ref({
  name: "",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
  portionSize: "100",
});

// ПОПЫТКА РАСЧЕТА КАЛОРИЙ ПО ВВЕДЕННОМУ БЖУ
const calculateCaloriesFromMacros = () => {
  const protein = parseFloat(newFood.value.protein) || 0;
  const carbs = parseFloat(newFood.value.carbs) || 0;
  const fat = parseFloat(newFood.value.fat) || 0;
  const calculatedCalories = protein * 4 + carbs * 4 + fat * 9;
  return Math.round(calculatedCalories);
};

// ПРОВЕРКА БЖУ И АВТОЗАПОЛЕНИЕ КАЛОРИЙ
watch([() => newFood.value.protein, () => newFood.value.carbs, () => newFood.value.fat], () => {
    if (newFood.value.protein && newFood.value.carbs && newFood.value.fat) {
      const calculated = calculateCaloriesFromMacros();
      newFood.value.calories = calculated.toString();
    }
  }
);

// ДОБАВЛЕНИЕ ПРЕСЕТА В АКТИВНОЕ ИСПОЛЬЗОВАНИЕ
const handleCreateFood = async () => {
  if (!newFood.value.name || !newFood.value.calories) return;
  const portionSize = parseFloat(newFood.value.portionSize) || 100;
  const multiplier = portionSize / 100;
  const foodItem = {
    id: Date.now().toString(),
    name: newFood.value.name,
    calories: Math.round(parseFloat(newFood.value.calories) * multiplier),
    protein: parseFloat((parseFloat(newFood.value.protein) * multiplier).toFixed(1)),
    carbs: parseFloat((parseFloat(newFood.value.carbs) * multiplier).toFixed(1)),
    fat: parseFloat((parseFloat(newFood.value.fat) * multiplier).toFixed(1)),
    portionSize: portionSize,
  };
  await addCustomFood(foodItem);
  newFood.value = {
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    portionSize: "100"
  };
};
</script>

<template>
  <!-- prettier-ignore -->
  <div class="create-preset">
    <div class="form">
      <div class="input-group">
        <label>Food Name</label>
        <input v-model="newFood.name" type="text" placeholder="Enter food name" class="text-input"/>
      </div>
      <div class="trio">
        <div class="input-group">
          <label>Proteins</label>
          <input v-model="newFood.protein" type="number" placeholder="0" class="number-input" />
        </div>
        <div class="input-group">
          <label>Carbs</label>
          <input v-model="newFood.carbs" type="number" placeholder="0" class="number-input" />
        </div>
        <div class="input-group">
          <label>Fats</label>
          <input v-model="newFood.fat" type="number" placeholder="0" class="number-input" />
        </div>
      </div>
      <div class="duo">
        <div class="input-group">
          <label>Calories per 100 g</label>
          <input v-model="newFood.calories" type="number" placeholder="0" class="number-input"/>
        </div>
        <div class="input-group">
          <label>Portion Weight (g)</label>
          <input v-model="newFood.portionSize" type="number" placeholder="100" class="number-input"/>
        </div>
      </div>
      
      <button @click="handleCreateFood" class="create-button" :disabled="!newFood.name || !newFood.calories || !newFood.carbs || !newFood.fat || !newFood.protein">
        Create Food
      </button>
    </div>
  </div>
</template>