<script setup lang="ts">
import { ref, watch } from "vue";

const genders = [
  { name: "Male", desc: "+5" },
  { name: "Female", desc: "-161" },
  { name: "Secret", desc: "-78" },
];

const props = defineProps<{
  modelValue: string;
  gender: string;
}>();

const emit = defineEmits<{ (e: "update:modelValue", value: string): void }>();

// Устанавливаем начальное значение
const activeGender = ref<string>(props.modelValue || props.gender || "Male");

// Синхронизация с v-model
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== activeGender.value) {
      activeGender.value = newVal;
    }
  }
);

watch(activeGender, (newVal) => {
  emit("update:modelValue", newVal);
});

function selectGender(genderName: string) {
  activeGender.value = genderName;
}
</script>

<template>
  <!-- prettier-ignore -->
  <div class="gender">
    <button v-for="gender in genders" :key="gender.name" class="btn" :class="{ active: activeGender === gender.name }" @click="selectGender(gender.name)">
      <span>{{ gender.name }}</span>
      <p>{{ `${ gender.desc }` }}</p>
    </button>
  </div>
</template>
