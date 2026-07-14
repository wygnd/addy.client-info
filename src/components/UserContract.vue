<script setup lang="ts">
import { IContract, IContractPayload } from "../types";
import { computed } from "vue";
import type { DescriptionListItem } from "@bitrix24/b24ui-nuxt";
import {
  CONTRACT_CONFIG,
  CONTRACT_PAYLOAD_CONFIG,
} from "../constants/contract.ts";
import { createDescriptionListMapper } from "../utils/mappers";

interface IUserContractProps {
  contract: IContract;
}

const props = defineProps<IUserContractProps>();
const mapContractData = createDescriptionListMapper<IContract>(CONTRACT_CONFIG);
const mapContractDataPayload = createDescriptionListMapper<IContractPayload>(
  CONTRACT_PAYLOAD_CONFIG,
);

const clientContractData = computed<DescriptionListItem[]>(() =>
  mapContractData(props.contract),
);
const clientContractRequisites = computed<DescriptionListItem[]>(() =>
  mapContractDataPayload(props.contract.payload),
);
</script>

<template>
  <div class="w-full flex items-start gap-4 relative pr-5 mt-5">
    <B24DescriptionList
      size="sm"
      :items="clientContractData"
      class="w-[40%] h-fit sticky top-5 px-5 pb-0 rounded-(--ui-border-radius-md) border-(--ui-color-design-filled-stroke) border-(length:--ui-design-outline-stroke-weight) text-(--ui-color-design-outline-content)"
    />
    <B24DescriptionList
      size="sm"
      :items="clientContractRequisites"
      class="w-3/5 sticky top-25 px-5 pb-0 rounded-(--ui-border-radius-md) border-(--ui-color-design-outline-stroke) border-(length:--ui-design-outline-stroke-weight) text-(--ui-color-design-outline-content)"
    />
  </div>
</template>

<style scoped></style>
