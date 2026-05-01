<script setup lang="ts">
import { ref } from "vue";
import CrmSearchIcon from "@bitrix24/b24icons-vue/crm/CrmSearchIcon";
import { vMaska } from "maska/vue";
import { useDebounceFn } from "@vueuse/core";
import { B24Deal, useBitrixStore } from "../store/bitrix-store.ts";

const bitrixStore = useBitrixStore();

const input = ref<string>("");
const deals = ref<B24Deal[]>([]);
const loading = ref<boolean>(false);

const debouncedChangeInput = useDebounceFn(async (value: unknown) => {
  loading.value = true;
  const val = clearPhone(value as string);

  deals.value = await bitrixStore.methods.findDealsByPhone(val);

  loading.value = false;
}, 800);

const clearPhone = (value: string): string => {
  return value.replace(/[+()\- ]/gi, "");
};
</script>

<template>
  <div class="w-full inline-auto max-w-312.5">
    <B24Input
      v-model="input"
      v-maska="'+7 (###) ### ##-##'"
      :icon="CrmSearchIcon"
      placeholder=""
      color="air-primary"
      highlight
      size="lg"
      class="w-60"
      :loading="loading"
      @update:model-value="debouncedChangeInput"
    />
    <div v-if="deals.length > 0">
      <ProseH4> Найденные сделки: </ProseH4>
      <ul>
        <li v-for="deal in deals" :key="deal.id">{{ deal.title }}</li>
      </ul>
    </div>
    <div v-else>
      <ProseH4> Сделок не найдено: </ProseH4>
    </div>
  </div>
</template>

<style scoped></style>
