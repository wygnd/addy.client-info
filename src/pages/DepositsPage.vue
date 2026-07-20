<script setup lang="ts">
import { computed } from "vue";
import { NavigationMenuItem } from "@bitrix24/b24ui-nuxt";
import { useRoute } from "vue-router";
import { useClientStore } from "../store/clientStore.ts";

const route = useRoute();
const clientStore = useClientStore();

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: "История пополнений",
    active: route.query.type === "deposits",
    to: "?type=deposits",
  },
  {
    label: "История пауз",
    active: route.query.type === "pauses",
    to: "?type=pauses",
  },
]);

const pageTitle = computed<string>(() => {
  if ("type" in route.query) {
    switch (route.query.type) {
      case "deposits":
        return "История пополнений";

      case "pauses":
        return "История пауз";
    }
  }

  return "Финансы";
});
</script>

<template>
  <div
    class="mb-0 pb-5 flex items-center justify-between gap-5 border-b border-b-(--ui-color-design-outline-stroke)"
  >
    <ProseH1>{{ pageTitle }}</ProseH1>

    <B24NavigationMenu
      :items="items"
      class="data-[orientation=vertical]:w-1/5 shrink-0"
    />
  </div>

  <B24ChatShimmer
    v-if="clientStore.isLoading"
    class="flex items-start justify-center mt-8xl"
    text="Загрузка финансов"
    :duration="3"
  />

  <B24PageBody class="w-full m-0 pb-0">
    <div v-if="route.query.type === 'deposits'">
      <UserDeposits />
    </div>
    <div v-if="route.query.type === 'pauses'">
      <UserDepositPauses />
    </div>
    <ProseH4 v-if="!route.query.type">
      Чтобы продолжить, выберите вкладку
    </ProseH4>
  </B24PageBody>
</template>

<style scoped></style>
