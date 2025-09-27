<script setup lang="ts">
import { toRefs, ref, computed } from "vue";
import inputHorizontal from "./inputHorizontal.vue";

interface formDataType {
  weight: number;
  height: number;
  age: number;
  gender: string;
  tdee: number;
}

const props = defineProps<{ formData: formDataType }>();

const { formData } = toRefs(props);
const preintake = ref(0);

// Вычисляемое свойство для TDEE
const tdee = computed(() => {
  const data = formData.value;
  let genderNum = 0;
  if (data.gender === "Male") genderNum = 5;
  else if (data.gender === "Female") genderNum = -161;
  else genderNum = -78;

  const bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age + genderNum;
  return Math.round(bmr * data.tdee);
});

// Целевые калории
const intakeGoals = computed(() => {
  return Math.round(tdee.value * (preintake.value + 100) / 100);
});

// ==================== Базовые макросы ====================
const baseProteins = computed(() => Math.round(formData.value.weight * 1.6));
const baseFats = computed(() => Math.round(formData.value.weight * 0.9));
const baseCarbs = computed(() => {
  const proteinCalories = baseProteins.value * 4;
  const fatCalories = baseFats.value * 9;
  const remainingCalories = tdee.value - proteinCalories - fatCalories;
  return Math.max(0, Math.round(remainingCalories / 4));
});

// ==================== Макросы с изменением ====================
const proteins = computed(() => {
  const modifier = preintake.value > 0 ? 2.0 : 1.6;
  return Math.round(formData.value.weight * modifier);
});
const fats = computed(() => Math.round(formData.value.weight * 0.9));
const carbs = computed(() => {
  const proteinCalories = proteins.value * 4;
  const fatCalories = fats.value * 9;
  const remainingCalories = intakeGoals.value - proteinCalories - fatCalories;
  return Math.max(0, Math.round(remainingCalories / 4));
});

// Вспомогательные функции
const getBaseWidth = (value: number) => {
  const all = baseProteins.value + baseCarbs.value + baseFats.value;
  if (all === 0) return "0%";
  return `${Math.round((value / all) * 1000) / 10}%`;
};
const getIntakeWidth = (value: number) => {
  const all = proteins.value + carbs.value + fats.value;
  if (all === 0) return "0%";
  return `${Math.round((value / all) * 1000) / 10}%`;
};
</script>

<template>
  <div class="final">
    <p v-if="preintake === 0">To keep current body weight: {{ tdee }} kcal</p>
    <p v-else-if="preintake > 0">To increase body weight: {{ intakeGoals }} kcal</p>
    <p v-else>To decrease body weight: {{ intakeGoals }} kcal</p>

    <div class="bar-holder" v-if="preintake === 0">
      <div class="bar bar-0">
        <div class="p part" :style="{ width: getBaseWidth(baseProteins) }">{{ baseProteins }} p</div>
        <div class="f part" :style="{ width: getBaseWidth(baseFats) }">{{ baseFats }} f</div>
        <div class="c part" :style="{ width: getBaseWidth(baseCarbs) }">{{ baseCarbs }} c</div>
      </div>
    </div>

    <div v-else class="bar-holder">
      <div class="bar bar-intake" :style="{ width: `${preintake + 80}%` }">
        <div class="p part" :style="{ width: getIntakeWidth(proteins) }">{{ proteins }} p</div>
        <div class="f part" :style="{ width: getIntakeWidth(fats) }">{{ fats }} f</div>
        <div class="c part" :style="{ width: getIntakeWidth(carbs) }">{{ carbs }} c</div>
      </div>
    </div>

    <inputHorizontal v-model="preintake" :min="-20" :max="20" :step="1" :mod="1" text="%" :bigStep="10" />
  </div>
</template>
