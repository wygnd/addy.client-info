<script setup lang="ts">
import { useClientStore } from "../store/clientStore.ts";
import { computed } from "vue";
import { NavigationMenuItem } from "@bitrix24/b24ui-nuxt";
import { useRoute } from "vue-router";
import UserContract from "../components/UserContract.vue";

const clientStore = useClientStore();
const route = useRoute();

const links = computed<NavigationMenuItem[]>(() => [
  {
    label: "Вознаграждения",
    active: route.query.type === "reward",
    to: "?type=reward",
  },
  {
    label: "Клиентские договоры",
    active: route.query.type === "client",
    to: "?type=client",
  },
]);

const pageTitle = computed<string>(() => {
  if ("type" in route.query) {
    switch (route.query.type) {
      case "reward":
        return "Вознаграждения";

      case "client":
        return "Клиентские договоры";
    }
  }

  return "Договоры";
});
</script>

<template>
  <div
    class="mb-0 pb-5 flex items-center justify-between gap-5 border-b border-b-(--ui-color-design-outline-stroke)"
  >
    <ProseH1 class="mb-0">{{ pageTitle }}</ProseH1>
    <B24NavigationMenu
      :items="links"
      class="data-[orientation=vertical]:w-1/5 shrink-0"
    />
  </div>
  <B24ChatShimmer
    v-if="clientStore.isLoading"
    class="flex items-start justify-center mt-8xl"
    text="Загрузка договоров"
    :duration="3"
  />

  <div
    v-if="clientStore.client && !clientStore.isLoading"
    class="h-200 overflow-y-auto"
  >
    <div v-if="route.query.type === 'reward'">
      <UserContract
        v-if="clientStore.client.rewardContracts"
        :contract="clientStore.client.rewardContracts"
      />
      <B24Empty
        v-else
        title="Договор не найден"
        class="mt-15 flex justify-center w-1/2 mx-auto"
      />
    </div>

    <div v-if="route.query.type === 'client'">
      <UserContract
        v-if="clientStore.client.contracts.length > 0"
        v-for="c in clientStore.client.contracts"
        :contract="c"
      />
      <B24Empty
        v-else
        title="Договоры не найдены"
        class="mt-15 flex justify-center w-1/2 mx-auto"
      />
    </div>

    <B24Empty
      v-if="!route.query.type"
      title="Выберите тип договора"
      class="mt-10 w-fit flex mx-auto"
    />
  </div>
  <B24Empty
    v-else-if="!clientStore.client && !clientStore.isLoading"
    title="Не удалось получить данные о клиенте"
  />
</template>

<style scoped></style>
