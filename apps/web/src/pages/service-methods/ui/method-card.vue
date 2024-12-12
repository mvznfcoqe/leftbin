<template>
  <Card class="h-full flex flex-col justify-between">
    <template #title>
      {{ method.title }}
    </template>

    <div class="flex gap-5">
      <Button
        :as="RouterLink"
        :to="`/${route.params.serviceId}/methods/${method.id}`"
      >
        {{ $t("shared.open") }}
      </Button>
    </div>
  </Card>
</template>

<script setup lang="ts">
import type { ServiceMethod } from "@/entities/service";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { RouterLink, useRoute } from "vue-router";

const route = useRoute();

defineProps<{ method: ServiceMethod }>();
</script>
