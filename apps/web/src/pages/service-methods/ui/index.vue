<template>
  <PageHeader>
    <template v-if="data">
      {{ data.service.title }}
    </template>

    <Skeleton v-else-if="pending" class="w-full h-10" />
  </PageHeader>

  <div
    class="mt-5 grid items-center gap-4 grid-cols-[repeat(auto-fit,minmax(240px,1fr))]"
  >
    <div class="h-40">
      <Skeleton class="h-full" v-if="pending" />

      <template v-else-if="data">
        <MethodCard
          v-for="method of data?.methods"
          :key="method.id"
          :method="method"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUnit } from "effector-vue/composition";
import { useRoute } from "vue-router";
import { serviceMethodsQuery } from "../model";
import { watch } from "vue";
import { queryToString } from "@/shared/lib/query-to-string";
import { PageHeader } from "@/shared/ui/page-header";
import MethodCard from "./method-card.vue";
import { Skeleton } from "@/shared/ui/skeleton";

const route = useRoute();

const { start, data, pending } = useUnit(serviceMethodsQuery);

watch(
  () => route.params.serviceId,
  (serviceId) => {
    start({ serviceId: Number(queryToString(serviceId)) });
  },
  {
    immediate: true,
  }
);
</script>
