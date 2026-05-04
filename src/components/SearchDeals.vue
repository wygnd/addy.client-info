<script setup lang="ts">
import { ref } from "vue";
import CrmSearchIcon from "@bitrix24/b24icons-vue/crm/CrmSearchIcon";
import { vMaska } from "maska/vue";
import { useDebounceFn } from "@vueuse/core";
import { useBitrixStore } from "../store/bitrix-store.ts";

interface IB24DealItem {
  name: string;
  description?: string;
  to: string;
}

const bitrixStore = useBitrixStore();

const input = ref<string>("");
const deals = ref<IB24DealItem[] | null>(null);
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

  const items = await bitrixStore.methods.findDealsByPhone(parsePhone(val));

  deals.value = items.map((i) => ({
    name: `#${i.id}`,
    description: i.title,
    to: bitrixStore.methods.generateDealUrl(i.id),
  }));

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
      <B24PageList>
        <B24PageCard
          v-for="(deal, index) in deals"
          :key="index"
          variant="plain"
          :to="deal.to"
        >
          <template #body>
            <B24User
              :name="deal.name"
              :description="deal.description"
              size="xl"
              class="relative"
            />
          </template>
        </B24PageCard>
      </B24PageList>
    </div>
    <div v-else-if="Array.isArray(deals)" class="mt-5">
      <ProseH4 class="mb-2"> Ничего не найдено </ProseH4>
    </div>
  </div>
</template>

<style scoped></style>
