<script setup lang="ts">
import { inject, type Ref } from "vue";
import type { UserData, HeaderButtonType } from "../common/types";
import HeaderButton from "./components/button.vue";

const user = inject<Ref<UserData | null>>("userdata");
const HeaderData: HeaderButtonType[] = [
  { text: "Dashboard", textDisplay: true, svg: "/svg/header/dashboard.svg", path: "/dashboard" },
  { text: "Intakes", textDisplay: true, svg: "/svg/header/intakes.svg", path: "/intakes" },
  { text: "Add Record", textDisplay: false, svg: "/svg/header/plus.svg", path: "/addrecord" },
  { text: "Body Data", textDisplay: true, svg: "/svg/header/bodydata.svg", path: "/bodydata" },
  { text: "Settings", textDisplay: true, svg: "/svg/header/settings.svg", path: "/settings" },
];
</script>

<template>
  <div class="header-wrapper" v-if="user && !user.isNew">
    <header>
      <HeaderButton v-for="button in HeaderData" :key="button.text" :data="button" />
    </header>
  </div>
</template>
