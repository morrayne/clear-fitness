<script setup lang="ts">
import { inject, type Ref } from "vue";
import type { UserData } from "../common/database";
import HeaderButton from "./components/button.vue";

const user = inject<Ref<UserData | null>>("userdata");

interface HeaderButtonType {
  text: string;
  svg: string;
  path: string;
}

const HeaderData: HeaderButtonType[] = [
  { text: "Dashboard", svg: "/svg/header/dashboard.svg", path: "/dashboard" },
  { text: "Food Base", svg: "/svg/header/foodbase.svg", path: "/foodbase" },
  { text: "Intakes", svg: "/svg/header/intakes.svg", path: "/intakes" },
  { text: "Body Data", svg: "/svg/header/bodydata.svg", path: "/bodydata" },
  { text: "Settings", svg: "/svg/header/settings.svg", path: "/settings" },
];
</script>

<template>
  <div class="header-wrapper" v-if="user && !user.isNew">
    <header>
      <HeaderButton v-for="button in HeaderData" :key="button.text" :data="button" />
    </header>
  </div>
</template>
