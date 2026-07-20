<script setup lang="ts">
import { useDepositStore } from "../store/depositStore.ts";
import { computed, onMounted } from "vue";
import { DescriptionListItem } from "@bitrix24/b24ui-nuxt";
import { formatPauseDepositType } from "../utils/mappers";

const depositStore = useDepositStore();

const items = computed<DescriptionListItem[]>(() =>
  depositStore.items.map((item) => ({
    label: `Пауза от ${item.recordedAt}`,
    description: formatPauseDepositType(item.depositType),
  })),
);

onMounted(() => {
  if (depositStore.items.length === 0 && depositStore.hasMore) {
    depositStore.fetchHistory();
  }
});
</script>

<template>
  <div v-if="depositStore.items.length > 0">
    <B24DescriptionList
      size="sm"
      :items="items"
      :b24ui="{
        container:
          'rounded-(--ui-border-radius-md) border-(--ui-color-design-outline-stroke) border-(length:--ui-design-outline-stroke-weight) text-(--ui-color-design-outline-content) sm:grid-cols-2 grid-cols-2',
        label: 'px-5',
        description: 'px-5',
        labelWrapper:
          'border-r border-r-(--ui-color-design-outline-stroke) border-r-(length:--ui-design-outline-stroke-weight) sm:border-r sm:border-r-(--ui-color-design-outline-stroke) sm:border-r-(length:--ui-design-outline-stroke-weight)',
      }"
      class="mt-8"
    />
  </div>
  <B24ChatShimmer
    v-else
    class="flex items-start justify-center mt-2xl"
    text="Ничего не найдено..."
    :duration="0"
  />
</template>

<style scoped></style>
