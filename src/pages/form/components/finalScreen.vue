<script setup lang="ts">
import { ref, watch, computed } from "vue";
import inputHorizontal from "./inputHorizontal.vue";
import type { General, Macros } from "../../../data/database.script";
import { calculateIntake } from "../form.script";

// ПРОПСЫ И ПЕРЕМЕННЫЕ
const props = defineProps<{
  formData: General;
  macrosData: Macros; // базовые макросы с tdee
}>();

const preintake = ref(props.macrosData.intake ?? 0);

// EMIT В РОДИТЕЛЯ
const emit = defineEmits<{ (e: "saveMacros", value: number): void }>();

// ПЕРЕСЧЕТ МАКРОСОВ ПРИ ИЗМЕНЕНИИ ПОЛЗУНКА
const intakeMacros = computed<Macros>(() =>
  calculateIntake({ ...props.formData, tdee: props.macrosData.tdee }, preintake.value)
);

// ШИРИНЫ БЖУ
const widths = computed(() => {
  const total = intakeMacros.value.proteins + intakeMacros.value.fats + intakeMacros.value.carbs;
  return {
    protein: total ? `${Math.round((intakeMacros.value.proteins / total) * 1000) / 10}%` : "0%",
    fat: total ? `${Math.round((intakeMacros.value.fats / total) * 1000) / 10}%` : "0%",
    carb: total ? `${Math.round((intakeMacros.value.carbs / total) * 1000) / 10}%` : "0%",
  };
});


// СИНХРОНИЗАЦИЯ С РОДИТЕЛЕМ
watch(preintake, (val) => emit("saveMacros", val), { immediate: true });
</script>

<template>
  <div class="final">
    <p v-if="preintake === 0">To keep current body weight: {{ intakeMacros.kcal }} kcal</p>
    <p v-else-if="preintake > 0">To increase body weight: {{ intakeMacros.kcal }} kcal</p>
    <p v-else>To decrease body weight: {{ intakeMacros.kcal }} kcal</p>

    <div class="bar-holder">
      <div class="bar">
        <div class="p part" :style="{ width: widths.protein }">{{ intakeMacros.proteins }} p</div>
        <div class="f part" :style="{ width: widths.fat }">{{ intakeMacros.fats }} f</div>
        <div class="c part" :style="{ width: widths.carb }">{{ intakeMacros.carbs }} c</div>
      </div>
    </div>

    <inputHorizontal
      v-model="preintake"
      :min="-20"
      :max="20"
      :step="1"
      :mod="1"
      text="%"
      :bigStep="10"
    />
  </div>
</template>
