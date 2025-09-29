<script setup lang="ts">
import { computed, ref } from "vue";
import { useCalories, type FoodItem } from "../callories.script";
import { saveFoodsToDatabase } from "../callories.script"; // Импортируем функцию сохранения

const { foodDatabase, addFoodToToday } = useCalories();

const presets = computed(() => foodDatabase.value);
const pressTimer = ref<any>(null);
const isLongPress = ref(false);
const hasHandled = ref(false);
const currentItem = ref<FoodItem | null>(null);

const addToday = async (foodItem: FoodItem) => {
  await addFoodToToday(foodItem);
};

const deletePreset = async (foodItem: FoodItem) => {
  console.log("Deleting preset:", foodItem.name);
  const index = foodDatabase.value.findIndex(item => item.id === foodItem.id);
  if (index > -1) {
    foodDatabase.value.splice(index, 1);
    // Сохраняем изменения в базу данных
    await saveFoodsToDatabase();
  }
};

const startPress = (foodItem: FoodItem, event: Event) => {
  event.preventDefault();
  if (hasHandled.value) return;
  
  currentItem.value = foodItem;
  hasHandled.value = false;
  isLongPress.value = false;
  
  pressTimer.value = setTimeout(async () => {
    hasHandled.value = true;
    isLongPress.value = true;
    await deletePreset(foodItem);
    currentItem.value = null;
  }, 3000);
};

const endPress = async (event: Event) => {
  event.preventDefault();
  clearTimeout(pressTimer.value);
  pressTimer.value = null;
  
  if (currentItem.value && !isLongPress.value && !hasHandled.value) {
    hasHandled.value = true;
    await addToday(currentItem.value);
  }
  
  isLongPress.value = false;
  currentItem.value = null;
};

const cancelPress = () => {
  clearTimeout(pressTimer.value);
  pressTimer.value = null;
  hasHandled.value = false;
  isLongPress.value = false;
  currentItem.value = null;
};
</script>

<template>
  <div class="presets">
    <div
      v-for="preset in presets"
      :key="preset.id"
      class="item"
      @mousedown="startPress(preset, $event)"
      @touchstart="startPress(preset, $event)"
      @mouseup="endPress($event)"
      @touchend="endPress($event)"
      @mouseleave="cancelPress"
      @touchcancel="cancelPress"
    >
      <div class="left"></div>
      <div class="right">
        <div class="top">
          <span>{{ preset.name }}</span>
          <p>{{ preset.portionSize }} g</p>
        </div>
        <div class="bot">
          <div class="kcal">{{ preset.calories }} kcal</div>
          <div class="p" v-if="preset.protein">{{ preset.protein }}p</div>
          <div class="c" v-if="preset.carbs">{{ preset.carbs }}c</div>
          <div class="f" v-if="preset.fat">{{ preset.fat }}f</div>
        </div>
      </div>
    </div>

    <div v-if="presets.length === 0" class="empty-state">
      No food presets created yet
    </div>
  </div>
</template>