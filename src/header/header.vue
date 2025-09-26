<script setup lang="ts">
import btn from "./components/header.btn.vue";
const headerButtonArray = [
  {
    textEN: "home",
    textRU: "главная",
    path: "/home",
    svg: "../../public/svg/home.svg",
  },
  {
    textEN: "callories",
    textRU: "каллории",
    path: "/callories",
    svg: "../../public/svg/callories.svg",
  },
  {
    textEN: "training",
    textRU: "тренировки",
    path: "/training",
    svg: "../../public/svg/training.svg",
  },
  {
    textEN: "params",
    textRU: "данные",
    path: "/form",
    svg: "../../public/svg/params.svg",
  },
  {
    textEN: "settings",
    textRU: "настройки",
    path: "/settings",
    svg: "../../public/svg/settings.svg",
  },
];
</script>

<template>
  <header>
    <btn v-for="item in headerButtonArray" :to="item.path" :data="item" />
  </header>
</template>
