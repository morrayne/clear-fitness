<script setup lang="ts">
import { ref, computed } from "vue";
import localforage from "localforage";
import weekmain from "../../week/weekmain.vue";
import fooditem from "../addrecord/components/FoodItemComponent.vue";
import type { TypeFood } from "../../common/types";

interface Intake {
  date: string;
  foods: TypeFood[];
}

const selectedDate = ref<string>("");
const dayFoods = ref<TypeFood[]>([]);

// === вычисляемые суммарные данные ===
const dayTotals = computed(() => {
  if (!dayFoods.value.length) {
    return { kcal: 0, proteins: 0, fats: 0, carbs: 0 };
  }
  return dayFoods.value.reduce(
    (acc, food) => {
      acc.kcal += food.kcal;
      acc.proteins += food.proteins;
      acc.fats += food.fats;
      acc.carbs += food.carbs;
      return acc;
    },
    { kcal: 0, proteins: 0, fats: 0, carbs: 0 }
  );
});

// === обработка выбора даты ===
async function handleDateSelected(date: string) {
  selectedDate.value = date;

  const allIntakes = (await localforage.getItem<Intake[]>("userintakes")) || [];
  const found = allIntakes.find((entry) => entry.date === date);

  if (found && found.foods?.length) {
    dayFoods.value = found.foods;
  } else {
    dayFoods.value = [];
  }
}

// === удаление блюда ===
async function handleRemoveFood(id: string | number) {
  if (!selectedDate.value) return;
  const allIntakes = (await localforage.getItem<Intake[]>("userintakes")) || [];
  const found = allIntakes.find((entry) => entry.date === selectedDate.value);
  if (found) {
    const index = found.foods.findIndex((food) => food.id === id);
    if (index !== -1) found.foods.splice(index, 1);

    dayFoods.value = [...found.foods];
    await localforage.setItem("userintakes", allIntakes);
  }
}
</script>

<template>
  <div class="week-wrapper">
    <weekmain
      @dateSelected="handleDateSelected"
      :data="dayTotals"
    />

    <div class="list">
      <div class="evernight" v-if="!dayFoods.length">
        <img src="../../../public/gif/evernight.gif">
        <p>
          Nothing to see here
        </p>
      </div>
      <fooditem v-for="food in dayFoods" :key="food.id" :data="food" @remove="handleRemoveFood" />
    </div>
  </div>
</template>
