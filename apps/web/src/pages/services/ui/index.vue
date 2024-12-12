<template>
  <PageHeader>
    {{ $t("page.services.title") }}
  </PageHeader>

  <div
    class="mt-5 grid items-center gap-4 grid-cols-[repeat(auto-fit,minmax(240px,1fr))]"
  >
    <div class="h-40" v-for="service in services" :key="service.id">
      <template v-if="pending">
        <Skeleton class="h-full" />
      </template>

      <template v-else-if="services">
        <ServiceCard :service />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUnit } from "effector-vue/composition";
import { servicesQuery } from "../model";
import { onMounted } from "vue";
import ServiceCard from "./service-card.vue";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";

const { data: services, start, pending } = useUnit(servicesQuery);

onMounted(() => {
  if (!services.value) {
    start({});
  }
});
</script>
