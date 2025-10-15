<script setup lang="ts">
import { ref, inject, watchEffect } from "vue";
import localforage from "localforage";
import FoodItemComponent from "./FoodItemComponent.vue";

interface FoodData {
  id: string;
  name: string;
  portionSize: number;
  proteins: number;
  carbs: number;
  fats: number;
  kcal: number;
}

const props = defineProps<{ foodAsset: FoodData[] }>();
const emit = defineEmits<{
  (e: "removeAsset", id: string): void;
  (e: "addToBasket", data: any): void; 
}>();


const commonfood = inject<FoodData[]>("defaultfoodassets", []);
const showCustom = ref(true);
const displaylist = ref<FoodData[]>([]);

// Отслеживаем какой список показывать
watchEffect(() => {
  displaylist.value = showCustom.value ? props.foodAsset : commonfood || [];
});

// Переключение вкладок
function changeView(val: boolean) {
  showCustom.value = val;
}

// Удаление кастомного продукта
async function handleRemoveSimple(id: string | number) {
  if (!showCustom.value) return;
  const currentFoods = (await localforage.getItem<FoodData[]>("customfood")) || [];
  const updatedFoods = currentFoods.filter(food => food.id !== id);
  await localforage.setItem("customfood", updatedFoods);
  displaylist.value = displaylist.value.filter(item => item.id !== id);

  // Эмит для родителя (чисто по твоему ТЗ)
  emit("removeAsset", id as string);
}
</script>

<template>
  <div class="assets">
    <div class="top">
      <button @click="changeView(true)" :class="{ active: showCustom }">Custom</button>
      <button @click="changeView(false)" :class="{ active: !showCustom }">Default</button>
    </div>
    <div class="list" :class="{center: displaylist.length === 0}">
      <img v-if="displaylist.length === 0" src="../../../../public/gif/evernight.gif" />
      <p v-if="displaylist.length === 0">Try adding your own food</p>
      <FoodItemComponent
        v-else
        v-for="data in displaylist"
        :key="data.id"
        :data="data"
        @addToBasket="$emit('addToBasket', $event)"
        @remove="handleRemoveSimple"
      />
    </div>
  </div>
</template>
