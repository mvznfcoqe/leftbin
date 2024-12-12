<template>
  <Card class="flex flex-col justify-between h-full">
    <template #title>
      {{ service.title }}
    </template>

    <Button :as="RouterLink" :to="`/${service.id}/methods`">
      {{ $t("page.services.service-card.methods") }}
    </Button>
  </Card>
</template>

<script setup lang="ts">
import type { Service } from "@/entities/service";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { RouterLink } from "vue-router";

defineProps<{ service: Service }>();
</script>
