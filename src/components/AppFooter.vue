<script setup lang="ts">
import { useBitrixStore } from "../store/bitrixStore.ts";

const bitrixStore = useBitrixStore();
</script>

<template>
  <B24Footer>
    <template #left>
      <ProseP small accent="less" class="mb-0">
        Создано с помощью Bitrix24 UI • &copy; {{ new Date().getFullYear() }}
      </ProseP>
    </template>
    <template #right>
      <div class="flex gap-2.5">
        <B24Badge
          v-if="bitrixStore.isInit"
          label="Подключен"
          color="air-primary"
          size="xl"
        />
        <B24Badge
          v-else
          label="Не подключен"
          color="air-primary-alert"
          size="xl"
        />
      </div>
    </template>
  </B24Footer>
</template>

<style scoped></style>
