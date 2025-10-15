<script setup lang="ts">
import { inject, ref, watch } from "vue";
import HeaderButton from "./components/button.vue";

// === Тип для userconfig ===
interface UserConfig {
  general: {
    name: string;
    lang: string;
    isNew: boolean;
  };
  weight: { min: number; max: number; step: number };
  height: { min: number; max: number; step: number };
  age: { min: number; max: number; step: number };
  activity: number[];
  gender: number[];
}

// === Инжектим userconfig ===
const userconfig = inject<UserConfig>("userconfig");

if (!userconfig) {
  throw new Error("userconfig not provided");
}

// === Отображение шапки ===
const showHeader = ref(false);

// Следим только за userconfig.general.isNew
watch(
  () => userconfig.general.isNew,
  (isNew) => {
    showHeader.value = !isNew;
  },
  { immediate: true }
);

// === Кнопки ===
const HeaderData = [
  {
    text: "Dashboard",
    textDisplay: true,
    svg: "/svg/header/dashboard.svg",
    path: "/dashboard",
  },
  {
    text: "Intakes",
    textDisplay: true,
    svg: "/svg/header/intakes.svg",
    path: "/intakes",
  },
  {
    text: "Add Record",
    textDisplay: false,
    svg: "/svg/header/plus.svg",
    path: "/addrecord",
  },
  {
    text: "Body Data",
    textDisplay: true,
    svg: "/svg/header/bodydata.svg",
    path: "/bodyinput",
  },
  {
    text: "Settings",
    textDisplay: true,
    svg: "/svg/header/settings.svg",
    path: "/settings",
  },
];
</script>

<template>
  <div class="header-wrapper" v-if="showHeader">
    <header>
      <HeaderButton
        v-for="button in HeaderData"
        :key="button.text"
        :data="button"
      />
    </header>
  </div>
</template>
