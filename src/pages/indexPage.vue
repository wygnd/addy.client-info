<script setup lang="ts">
import UserInfo from "../components/UserInfo.vue";
import { useClientStore } from "../store/clientStore.ts";
import { formatClientName } from "../utils/mappers";
import { computed } from "vue";

const clientStore = useClientStore();

const clientFullName = computed(() => formatClientName(clientStore.client));
</script>

<template>
  <div>
    <ProseH1>
      {{
        clientStore.client && !clientStore.isLoading
          ? `Клиент: ${clientFullName}`
          : "Клиент"
      }}
    </ProseH1>
    <div
      v-if="clientStore.client && 'tags' in clientStore.client"
      class="flex flex-wrap gap-3"
    >
      <B24Badge
        v-for="tag in clientStore.client.tags"
        :key="tag.id"
        :label="tag.name"
        size="xl"
        color="air-secondary-accent-2"
      />
    </div>
  </div>

  <B24ChatShimmer
    v-if="clientStore.isLoading"
    class="flex mt-4xl"
    text="Загрузка данных..."
    :duration="3"
  />

  <div v-if="clientStore.client && !clientStore.isLoading">
    <UserInfo />
  </div>
  <B24Empty
    v-else-if="!clientStore.client && !clientStore.isLoading"
    title="Не удалось получить данные"
    class="mt-10"
  />
</template>
