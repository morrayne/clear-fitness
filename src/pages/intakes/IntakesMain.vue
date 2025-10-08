<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import FoodItemComponent from "../addrecord/components/FoodItemComponent.vue";
import { getDailyEntries } from "../../common/database";
import type { DailyEntry, FoodItem } from "../../common/types";

// Сегодняшняя дата
const today = new Date();
const selectedDate = ref(today.toISOString().slice(0, 10));

// Генерация недели с понедельника до воскресенья
const weekData = computed(() => {
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ...
  // вычисляем смещение до понедельника
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const arr = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    arr.push({
      text: d.toLocaleDateString("en-US", { weekday: "short" }).charAt(0), // M, T, W...
      day: d.getDate(),
      fullDate: d.toISOString().slice(0, 10),
    });
  }
  return arr;
});

// Продукты выбранного дня
const dayFoods = ref<FoodItem[]>([]);
const dayMacros = ref({ kcal: 0, proteins: 0, fats: 0, carbs: 0 });

async function loadDay(date: string) {
  selectedDate.value = date;
  const entries: DailyEntry[] = await getDailyEntries(date);
  const foods: FoodItem[] = entries.flatMap((e) => e.foods);
  dayFoods.value = foods;

  // Суммируем макросы
  const macros = foods.reduce(
    (acc, f) => {
      acc.kcal += f.calories;
      acc.proteins += f.protein;
      acc.fats += f.fat;
      acc.carbs += f.carbs;
      return acc;
    },
    { kcal: 0, proteins: 0, fats: 0, carbs: 0 }
  );
  dayMacros.value = macros;
}

// Загружаем сегодня при монтировании
onMounted(() => loadDay(selectedDate.value));
</script>

<template>
  <div class="intakes">
    <div class="top">
      <div class="goals">
        <div class="item">{{ dayMacros.kcal }}</div>
        <div class="item">{{ dayMacros.proteins }}</div>
        <div class="item">{{ dayMacros.carbs }}</div>
        <div class="item">{{ dayMacros.fats }}</div>
      </div>
      <div class="weekdays">
        <div
          class="day"
          v-for="value in weekData"
          :key="value.fullDate"
          :class="{ active: selectedDate === value.fullDate }"
          @click="loadDay(value.fullDate)"
        >
          <span>{{ value.day }}</span>
          <p>{{ value.text }}</p>
        </div>
      </div>
    </div>
    <div class="bot">
      <div class="page">
        <h2>Intakes</h2>
        <FoodItemComponent
          v-for="food in dayFoods"
          :key="food.id"
          :name="food.name"
          :kcal="food.calories"
          :proteins="food.protein"
          :carbs="food.carbs"
          :fats="food.fat"
          :portionSize="food.portionSize"
          :deleteBtn="true"
          v-if="dayFoods.length !== 0"
        />
        <div class="march-holder" v-else>
          <img src="../../../public/gif/evernight.gif" />
          <p>This day is yet to come</p>
          <p>or you starved</p>
          <p>or just forgor</p>
        </div>
      </div>
    </div>
  </div>
</template>
