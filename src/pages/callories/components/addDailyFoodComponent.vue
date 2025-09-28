<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useCalories } from "../callories.script";

const { foodDatabase } = useCalories();
const presets = ref<any[]>([]);

// Загружаем пресеты при монтировании и следим за изменениями
onMounted(() => {
  presets.value = foodDatabase.value;
});

watch(foodDatabase, (newFoods) => {
  presets.value = newFoods;
});

const addToday = (obj: object) => {
  console.log(obj);
}
</script>

<template>
  <div class="presets">
    <div v-for="preset in presets" :key="preset.id" class="item">
      <div class="left" @click="addToday(preset)"></div>
      <div class="right">
        <div class="top">
          {{ preset.name }} ({{ preset.portionSize }} g)
        </div>
        <div class="bot">
          <div class="kcal">{{ preset.calories }} kcal</div>
          <div class="p" v-if="preset.protein">{{ preset.protein }} p</div>
          <div class="c" v-if="preset.carbs">{{ preset.carbs }} c</div>
          <div class="f" v-if="preset.fat">{{ preset.fat }} f</div>
        </div>
      </div>
    </div>
  </div>
</template>