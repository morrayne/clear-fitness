<script setup lang="ts">
import Graph from "./Graph.vue";
import { setUserMacros } from "../../../common/bootstraphelper";
import { ref, onMounted, computed } from "vue";

const props = defineProps<{
  userbody: any;
  userconfig: any;
}>();

const isLoading = ref(true);
const macros = ref<any>(null);

const activeMode = ref<"maintain" | "modify">("maintain");
const displaymacros = computed(() => {
  return macros.value?.[activeMode.value] || null;
});

onMounted(() => {
  setUserMacros().then((result) => {
    macros.value = result;
    isLoading.value = false;
  });
});

function changeDisplay(isMaintain: boolean) {
  activeMode.value = isMaintain ? "maintain" : "modify";
}
</script>

<template>
  <div class="summary-top">
    <button
      @click="changeDisplay(true)"
      :class="{ active: activeMode === 'maintain' }"
    >
      maintain
    </button>
    <button
      @click="changeDisplay(false)"
      :class="{ active: activeMode === 'modify' }"
    >
      your goals
    </button>
  </div>
  <div class="summary-holder" v-if="!isLoading && displaymacros">
    <div class="left">
      <Graph :data="displaymacros" />
    </div>
    <div class="right">
      <div class="solo">
        {{ `from ${props.userbody.currentWeight} ${props.userconfig.weight.text}` }}
      </div>
      <div class="solo">
        {{ `to ${props.userbody.goalWeight} ${props.userconfig.weight.text}` }}
      </div>
      <div class="solo">
        {{ `to ${props.userbody.goalBF} ${props.userconfig.bf.text} bf` }}
      </div>
      <div class="solo">
        {{ `${props.userbody.height} ${props.userconfig.height.text}` }}
      </div>
      <div class="solo">
        {{ `${props.userbody.age} ${props.userconfig.age.text}` }}
      </div>
      <div class="solo">
        {{ `${props.userbody.activity} tdee` }}
      </div>
      <div class="solo">
        {{ `${props.userbody.accuracy} level` }}
      </div>
    </div>
  </div>
  <div v-else>
    <p>Loading macros data...</p>
  </div>
</template>
