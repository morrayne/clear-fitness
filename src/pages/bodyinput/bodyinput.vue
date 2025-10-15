<script setup lang="ts">
import { inject, ref, computed, toRaw } from "vue";
import localforage from "localforage";
import Athletism from "./components/Athletism.vue";
import CurrentWeight from "./components/CurrentWeight.vue";
import GoalWeight from "./components/GoalWeight.vue";
import Height from "./components/Height.vue";
import Age from "./components/Age.vue";
import Gender from "./components/Gender.vue";
import Activity from "./components/Activity.vue";
import BFGoal from "./components/BFGoal.vue";
import Summary from "./components/Summary.vue";
import type { TypeDefaultConfig, TypeDefaultBody } from "../../common/types";
import router from "../../common/router";

const userbody = inject<TypeDefaultBody>("userbody", {} as TypeDefaultBody);
const userconfig = inject<TypeDefaultConfig>(
  "userconfig",
  {} as TypeDefaultConfig
);

// PAGINATION
const pageIndex = ref(0);
const goBack = () => {
  if (pageIndex.value === 0) return;
  pageIndex.value--;
};
const goNext = () => {
  pageIndex.value++;
  localforage.setItem("userbody", toRaw(userbody));
};
function finish() {
  userconfig.general.isNew = false;
  localforage.setItem("userconfig", toRaw(userconfig));
  router.push("/dashboard");
}
const pagesTransform = computed(() => {
  return `translateX(-${pageIndex.value * 100}%)`;
});

const accuracy = computed({
  get: () => userbody?.accuracy ?? "Normal",
  set: (val: "Normal" | "Athletic") => {
    if (userbody) userbody.accuracy = val;
  },
});
</script>

<template>
  <div class="bodyinputs">
    <div class="wrapper">
      <div class="pages">
        <!-- ATHLETISM -->
        <div class="page" :style="{ transform: pagesTransform }">
          <Athletism
            v-model="accuracy"
            :userbody="userbody"
            :userconfig="userconfig"
          />
        </div>
        <!-- CURRENT WEIGHT -->
        <div class="page" :style="{ transform: pagesTransform }">
          <CurrentWeight
            v-model="userbody.currentWeight"
            :userbody="userbody"
            :userconfig="userconfig"
          />
        </div>
        <!-- GOAL WEIGHT -->
        <div class="page" :style="{ transform: pagesTransform }">
          <GoalWeight
            v-model="userbody.goalWeight"
            :userbody="userbody"
            :userconfig="userconfig"
          />
        </div>
        <!-- HEIGHT -->
        <div class="page" :style="{ transform: pagesTransform }">
          <Height
            v-model="userbody.height"
            :userbody="userbody"
            :userconfig="userconfig"
          />
        </div>
        <!-- AGE -->
        <div class="page" :style="{ transform: pagesTransform }">
          <Age
            v-model="userbody.age"
            :userbody="userbody"
            :userconfig="userconfig"
          />
        </div>
        <!-- GENDER -->
        <div class="page" :style="{ transform: pagesTransform }">
          <Gender
            v-model="userbody.gender"
            :userbody="userbody"
            :userconfig="userconfig"
          />
        </div>
        <!-- ACTIVITY -->
        <div class="page" :style="{ transform: pagesTransform }">
          <Activity
            v-model="userbody.activity"
            :userbody="userbody"
            :userconfig="userconfig"
          />
        </div>
        <!-- BF GOAL -->
        <div class="page" :style="{ transform: pagesTransform }">
          <BFGoal
            v-model="userbody.goalBF"
            :userbody="userbody"
            :userconfig="userconfig"
          />
        </div>
        <!-- SUMMARY -->
        <div class="page" :style="{ transform: pagesTransform }">
          <Summary :userbody="userbody" :userconfig="userconfig" />
        </div>
      </div>
      <div class="controls">
        <button class="goBack" @click="goBack">Go back</button>
        <button class="goNext" v-if="pageIndex !== 8" @click="goNext">
          Go next
        </button>
        <button class="goNext" v-else @click="finish">Finish</button>
      </div>
    </div>
  </div>
</template>
