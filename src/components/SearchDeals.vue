<script setup lang="ts">
import { ref } from "vue";
import CrmSearchIcon from "@bitrix24/b24icons-vue/crm/CrmSearchIcon";
import { vMaska } from "maska/vue";
import { useDebounceFn } from "@vueuse/core";
import { B24Deal, useBitrixStore } from "../store/bitrix-store.ts";

const bitrixStore = useBitrixStore();

const input = ref<string>("");
const deals = ref<B24Deal[] | null>(null);
const loading = ref<boolean>(false);
const details = ref<string>("");

const debouncedChangeInput = useDebounceFn(async (value: unknown) => {
  loading.value = true;
  const val = clearPhone(value as string);

  if (!val) {
    details.value = "Необходимо заполнить поле";
    loading.value = false;
    return;
  }

  deals.value = await bitrixStore.methods.findDealsByPhone(val);

  loading.value = false;
  details.value = "";
}, 1000);

const clearPhone = (value: string): string => {
  let val = value.replace(/[+()\- ]/gi, "");

  if (val.startsWith("+")) {
    val = val.substring(1, val.length);
  }

  if (val.startsWith("7")) {
    val = val.substring(1, val.length);
  }

  return val;
};
</script>

<template>
  <div class="w-full inline-auto max-w-312.5">
    <B24FormField label="Поиск по номеру телефона" :help="details">
      <B24Input
        v-model="input"
        v-maska="'+7 (###) ### ##-##'"
        :icon="CrmSearchIcon"
        placeholder="+7 (999) 999 99-99"
        color="air-primary"
        highlight
        size="lg"
        class="w-60 inline-auto"
        :loading="loading"
        @update:model-value="debouncedChangeInput"
      />
    </B24FormField>
    <div v-if="deals && deals.length > 0" class="mt-5">
      <ProseH4 class="mb-2"> Найденные сделки: </ProseH4>
      <ol>
        <li v-for="deal in deals" :key="deal.id">
          <B24Link type="button" @click="bitrixStore.methods.openDeal(deal.id)">
            {{ deal.title }}
          </B24Link>
        </li>
      </ol>
    </div>
    <div v-else-if="Array.isArray(deals)" class="mt-5">
      <ProseH4 class="mb-2"> Ничего не найдено: </ProseH4>
    </div>
  </div>
</template>

<style scoped></style>
