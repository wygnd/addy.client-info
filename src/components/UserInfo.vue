<script setup lang="ts">
import { useClientStore } from "../store/clientStore.ts";
import { computed } from "vue";
import type { DescriptionListItem } from "@bitrix24/b24ui-nuxt";
import { CLIENT_CONFIG } from "../constants/client.ts";
import { IClient } from "../types";
import { createDescriptionListMapper } from "../utils/mappers";

const clientStore = useClientStore();
const mapClientInfo = createDescriptionListMapper<IClient>(CLIENT_CONFIG);

const clientInfoItems = computed<DescriptionListItem[]>(() => {
  if (!clientStore.client) {
    return [];
  }

  const items = mapClientInfo(clientStore.client);

  if (
    "rewardContracts" in clientStore.client &&
    clientStore.client.rewardContracts
  ) {
    return [
      {
        label: "Договор на вознаграждение",
        description: "Есть",
      },
      ...items,
    ];
  }

  return items;
});
</script>

<template>
  <B24PageBody class="w-3/6 p-0">
    <B24DescriptionList
      size="sm"
      :items="clientInfoItems"
      :b24ui="{
        container: 'rounded-(--ui-border-radius-md) border-(--ui-color-design-outline-stroke) border-(length:--ui-design-outline-stroke-weight) text-(--ui-color-design-outline-content)',
        label: 'px-5',
        description: 'px-5',
      }"
    />
  </B24PageBody>
</template>

<style scoped></style>
