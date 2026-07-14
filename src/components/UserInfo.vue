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

  return mapClientInfo(clientStore.client);
});
</script>

<template>
  <B24PageBody
    class="w-4/6 sticky top-25 px-5 pb-0 rounded-(--ui-border-radius-md) border-(--ui-color-design-outline-stroke) border-(length:--ui-design-outline-stroke-weight) text-(--ui-color-design-outline-content)"
  >
    <B24DescriptionList size="sm" :items="clientInfoItems" />
  </B24PageBody>
</template>

<style scoped></style>
