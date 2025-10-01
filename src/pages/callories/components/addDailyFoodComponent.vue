<script setup lang="ts">
import { computed, ref } from "vue";
import { useCalories, type FoodItem } from "../callories.script";
import { saveFoodsToDatabase } from "../callories.script";

const { foodDatabase, addFoodToToday } = useCalories();

const presets = computed(() => foodDatabase.value);
const pressTimer = ref<any>(null);
const isLongPress = ref(false);
const hasHandled = ref(false);
const currentItem = ref<FoodItem | null>(null);

// ДОБАВЛЕНИЕ ЕДЫ В СЕГОДЯНШЕЕ УПОТРЕБЛЕНИЕ
const addToday = async (foodItem: FoodItem) => {
  await addFoodToToday(foodItem);
};

// УДАЛЕНИЕ СВОЕГО ПРЕСЕТА ЕДЫ
const deletePreset = async (foodItem: FoodItem) => {
  const index = foodDatabase.value.findIndex(item => item.id === foodItem.id);
  if (index > -1) {
    foodDatabase.value.splice(index, 1);
    await saveFoodsToDatabase();
  }
};

// НАЧАЛО НАЖАТИЯ И ПОПЫТКА ПОНЯТЬ НАЖАТИЕ ИЛИ ЗАЖАТИЕ
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
  }, 1000);
};

// ОКОНЧАНИЕ НАЖАТИЯ
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

// ОТМЕНА НАЖАТИЯ
const cancelPress = () => {
  clearTimeout(pressTimer.value);
  pressTimer.value = null;
  hasHandled.value = false;
  isLongPress.value = false;
  currentItem.value = null;
};
</script>

<template>
  <!-- prettier-ignore -->
  <div class="presets">
    <div v-for="preset in presets" :key="preset.id" class="item" @mousedown="startPress(preset, $event)" @touchstart="startPress(preset, $event)" @mouseup="endPress($event)"@touchend="endPress($event)" @mouseleave="cancelPress" @touchcancel="cancelPress">
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