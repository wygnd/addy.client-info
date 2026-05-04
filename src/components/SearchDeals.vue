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
  const val = value as string;

  if (!val || val.length < 6) {
    details.value = "Необходимо заполнить поле";
    loading.value = false;
    return;
  }

  deals.value = await bitrixStore.methods.findDealsByPhone(parsePhone(val));

  loading.value = false;
  details.value = "";
}, 1000);

const parsePhone = (value: string): string[] => {
  const args = [value];
  const cleanedPhoneNumber = value.replace(/\D/g, "");

  if (!cleanedPhoneNumber) {
    return args;
  }

  const match = cleanedPhoneNumber.match(/(\d{3})(\d{3})(\d{2})(\d{2})$/);

  if (!match) {
    return args;
  }

  // 9999999999
  args.push(match[0]);

  if (match.length >= 3) {
    // 999 999
    args.push(`${match[1]} ${match[2]}`);

    // (999) 999
    args.push(`(${match[1]}) ${match[2]}`);
  }

  if (match.length >= 4) {
    // 999 999 99
    args.push(`${match[1]} ${match[2]} ${match[3]}`);

    // 999 999-99
    args.push(`${match[1]} ${match[2]}-${match[3]}`);

    // (999) 999-99
    args.push(`(${match[1]}) ${match[2]}-${match[3]}`);

    // (999) 999 99
    args.push(`(${match[1]}) ${match[2]} ${match[3]}`);
  }

  if (match.length >= 5) {
    // 999 999-99-99
    args.push(`${match[1]} ${match[2]}-${match[3]}-${match[4]}`);

    // (999) 999-99-99
    args.push(`(${match[1]}) ${match[2]}-${match[3]}-${match[4]}`);

    // (999) 999 99-99
    args.push(`(${match[1]}) ${match[2]} ${match[3]}-${match[4]}`);

    // (999) 999 99 99
    args.push(`(${match[1]}) ${match[2]} ${match[3]} ${match[4]}`);

    // 999 999 99 99
    args.push(`${match[1]} ${match[2]} ${match[3]} ${match[4]}`);
  }

  return args;
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
      <ProseH4 class="mb-2 text-center"> Найденные сделки: </ProseH4>
      <ol>
        <li v-for="deal in deals" :key="deal.id">
          <B24Link type="button" @click="bitrixStore.methods.openDeal(deal.id)">
            {{ deal.title }}
          </B24Link>
        </li>
      </ol>
    </div>
    <div v-else-if="Array.isArray(deals)" class="mt-5">
      <ProseH4 class="mb-2"> Ничего не найдено </ProseH4>
    </div>
  </div>
</template>

<style scoped></style>
