<script setup lang="ts">
import FoodItemComponent from "./components/FoodItemComponent.vue";
import { ref, onMounted, computed, watch } from "vue";
import {
  foodDB,
  loadFoodDB,
  addCustomFood,
  addDailyEntry,
} from "../../common/database";
import type { FoodItem, DailyEntry } from "../../common/types";

// === Поля для нового кастомного продукта ===
const name = ref("");
const protein = ref<number>(0);
const carbs = ref<number>(0);
const fat = ref<number>(0);
const portion = ref<number>(100);
const calories = ref<number>(0);
let manualCaloriesEdit = false;

// === Авто пересчёт калорий по БЖУ и порции ===
watch([protein, carbs, fat, portion], () => {
  if (!manualCaloriesEdit) {
    const calc = protein.value * 4 + carbs.value * 4 + fat.value * 9;
    calories.value = Math.round(calc);
  }
});

function handleCaloriesInput() {
  manualCaloriesEdit = true;
}

// === Загрузка базы продуктов ===
onMounted(async () => {
  await loadFoodDB();
});

// === Добавление кастомного продукта ===
async function addAsset() {
  if (!name.value.trim()) return;

  try {
    const foodData: FoodItem = {
      id: crypto.randomUUID(),
      name: name.value,
      calories: Math.round((calories.value * portion.value) / 100),
      protein: (protein.value * portion.value) / 100,
      carbs: (carbs.value * portion.value) / 100,
      fat: (fat.value * portion.value) / 100,
      portionSize: portion.value,
    };

    await addCustomFood(foodData);

    // Очистка полей
    name.value = "";
    protein.value = 0;
    carbs.value = 0;
    fat.value = 0;
    portion.value = 100;
    calories.value = 0;
    manualCaloriesEdit = false;
  } catch (error) {
    console.error("Error adding custom food:", error);
  }
}

// === Слайдер страниц ===
const page = ref(0);
const pageTransform = computed(() => `translateX(-${page.value * 100}vw)`);
function changepage(val: number) {
  page.value = val;
}

// === Выбранные продукты для подтверждения ===
const selectedFoods = ref<FoodItem[]>([]);

function selectFood(food: FoodItem) {
  selectedFoods.value.push(food);
}

function removeSelected(index: number) {
  selectedFoods.value.splice(index, 1);
}

// === Кнопка Finish ===
async function finishSelection() {
  if (selectedFoods.value.length === 0) return;

  // Суммарные макросы
  const total = selectedFoods.value.reduce(
    (acc, food) => {
      acc.kcal += Number(food.calories) || 0;
      acc.proteins += Number(food.protein) || 0;
      acc.fats += Number(food.fat) || 0;
      acc.carbs += Number(food.carbs) || 0;
      return acc;
    },
    { kcal: 0, proteins: 0, fats: 0, carbs: 0 }
  );
  const today: string = new Date().toISOString().split("T")[0] ?? "";

  const entry: DailyEntry = {
    date: today,
    foods: JSON.parse(JSON.stringify(selectedFoods.value)),
    macros: total,
  };

  try {
    await addDailyEntry(entry);
    selectedFoods.value = [];
    alert("Saved successfully!");
  } catch (err) {
    console.error("Error saving daily entry:", err);
    alert("Error saving. Check console.");
  }
}
</script>

<template>
  <div class="addrecord">
    <div class="record-nav">
      <button :class="{ act: page === 0 }" @click="changepage(0)">
        Add Food
      </button>
      <button :class="{ act: page === 1 }" @click="changepage(1)">
        Default
      </button>
      <button :class="{ act: page === 2 }" @click="changepage(2)">
        Your Assets
      </button>
      <button :class="{ act: page === 3 }" @click="changepage(3)">
        New Asset
      </button>
    </div>

    <div class="pages">
      <!-- === Страница 1: Подтверждение выбранных продуктов === -->
      <div class="page" :style="{ transform: pageTransform }">
        <h3>Selected Foods</h3>
        <button
          v-if="selectedFoods.length !== 0"
          class="finish"
          @click="finishSelection"
        >
          Finish
        </button>
        <div class="nothingYet" v-else>
          <img src="../../../public/gif/evernight.gif" />
          <p>Here is nothing yet</p>
        </div>

        <FoodItemComponent
          v-for="(food, index) in selectedFoods"
          :key="food.id"
          :kcal="food.calories"
          :portionSize="food.portionSize"
          :carbs="food.carbs"
          :fats="food.fat"
          :proteins="food.protein"
          :name="food.name"
          :deleteBtn="true"
          @click="removeSelected(index)"
        />
      </div>

      <!-- === Страница 2: Default продукты === -->
      <div class="page" :style="{ transform: pageTransform }">
        <h3>Default products</h3>
        <FoodItemComponent
          v-for="food in foodDB.default"
          :key="food.id"
          :kcal="food.calories"
          :portionSize="food.portionSize"
          :carbs="food.carbs"
          :fats="food.fat"
          :proteins="food.protein"
          :name="food.name"
          :deleteBtn="false"
          @click="selectFood(food)"
        />
      </div>

      <!-- === Страница 3: Custom продукты === -->
      <div class="page" :style="{ transform: pageTransform }">
        <h3>Your Custom products</h3>
        <FoodItemComponent
          v-for="food in foodDB.custom"
          :key="food.id"
          :kcal="food.calories"
          :portionSize="food.portionSize"
          :carbs="food.carbs"
          :fats="food.fat"
          :proteins="food.protein"
          :name="food.name"
          :deleteBtn="true"
          @click="selectFood(food)"
        />
      </div>

      <!-- === Страница 4: Добавление нового кастомного продукта === -->
      <div
        class="page"
        :style="{ transform: pageTransform }"
        style="justify-content: center"
      >
        <div class="input-holder">
          <input v-model="name" type="text" placeholder="Asset's name" />
          <div class="bju">
            <input
              v-model.number="protein"
              type="number"
              placeholder="Proteins"
            />
            <input v-model.number="carbs" type="number" placeholder="Carbs" />
            <input v-model.number="fat" type="number" placeholder="Fats" />
            <input
              v-model.number="calories"
              type="number"
              placeholder="Kcal"
              @input="handleCaloriesInput"
            />
          </div>
          <input
            v-model.number="portion"
            type="number"
            placeholder="Portion size (g)"
          />
          <button class="addasset" @click="addAsset">Add Your Asset</button>
        </div>
      </div>
    </div>
  </div>
</template>
