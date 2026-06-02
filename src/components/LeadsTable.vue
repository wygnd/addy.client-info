<script setup lang="ts">
import { useBitrixStore } from "../store/bitrix-store.ts";
import { UserStatDimensionType } from "../types";
import { IStatData } from "./PageHero.vue";
import { ref, watch } from "vue";

interface ILeadsTableProps {
  items: IStatData[];
}

type ILeadTableUserStat = {
  username: string;
  stat: Record<UserStatDimensionType, number>;
};

const props = defineProps<ILeadsTableProps>();
const bitrixStore = useBitrixStore();
const tableData = ref<Record<string, ILeadTableUserStat>>({});
const managerList = ref<string[]>([]);

watch(
  () => props.items,
  () => {
    if (props.items.length === 0) {
      return;
    }

    const labelList: string[] = [];
    const data: Record<string, ILeadTableUserStat> = {};

    for (const { user_id: userId, username, statistics } of props.items) {
      labelList.push(username);

      for (const [key, countLeads] of Object.entries(statistics)) {
        let dimension: UserStatDimensionType;

        switch (key) {
          case "new_leads":
            dimension = UserStatDimensionType.NEW;
            break;

          case "leads_1c":
            dimension = UserStatDimensionType.C_LEAD;
            break;

          case "converted_leads":
            dimension = UserStatDimensionType.CONVERTED;
            break;

          case "base_leads":
            dimension = UserStatDimensionType.BASE;
            break;

          default:
            continue;
        }

        if (!(userId in data)) {
          data[userId] = {
            username: username,
            stat: {
              [UserStatDimensionType.BASE]: 0,
              [UserStatDimensionType.C_LEAD]: 0,
              [UserStatDimensionType.CONVERTED]: 0,
              [UserStatDimensionType.NEW]: 0,
            },
          };
        }

        data[userId].stat[dimension] += countLeads;
      }
    }

    tableData.value = data;
    managerList.value = labelList;

    console.log(data);
  },
);
</script>

<template>
  <B24TableWrapper
    class="overflow-x-auto w-full p-3 bg-gray-30"
    rounded
    row-hover
  >
    <table>
      <thead>
        <tr>
          <th>Менеджер</th>
          <th>Новые лиды</th>
          <th>1С Лиды</th>
          <th>Лиды из Базы</th>
          <th>Качественные лиды</th>
          <th>Общее кол-во</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="[userId, { username, stat }] in Object.entries(tableData)">
          <th @click="bitrixStore?.methods.openUserChat(userId)">
            {{ username }}
          </th>
          <td>{{ stat.new_leads + stat.leads_1c }}</td>
          <td>{{ stat.leads_1c }}</td>
          <td>{{ stat.base_leads }}</td>
          <td>{{ stat.converted_leads }}</td>
          <td>{{ stat.new_leads + stat.leads_1c + stat.base_leads }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th>Итого:</th>
          <td>
            {{
              Object.values(tableData).reduce((acc, { stat }) => {
                acc += stat.new_leads + stat.leads_1c;
                return acc;
              }, 0)
            }}
          </td>
          <td>
            {{
              Object.values(tableData).reduce((acc, { stat }) => {
                acc += stat.leads_1c;
                return acc;
              }, 0)
            }}
          </td>
          <td>
            {{
              Object.values(tableData).reduce((acc, { stat }) => {
                acc += stat.base_leads;
                return acc;
              }, 0)
            }}
          </td>
          <td>
            {{
              Object.values(tableData).reduce((acc, { stat }) => {
                acc += stat.converted_leads;
                return acc;
              }, 0)
            }}
          </td>
          <td>
            {{
              Object.values(tableData).reduce((acc, { stat }) => {
                acc += stat.new_leads + stat.leads_1c + stat.base_leads;
                return acc;
              }, 0)
            }}
          </td>
        </tr>
      </tfoot>
    </table>
  </B24TableWrapper>
</template>

<style scoped></style>
