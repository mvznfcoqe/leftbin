<template>
  <i :class="iconVariants({ size })" />
</template>

<script setup lang="ts">
import { cva, type VariantProps } from "class-variance-authority";

const iconVariants = cva("block", {
  variants: {
    size: {
      sm: "size-4",
      md: "size-6",
      lg: "size-10",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

type IconVariants = VariantProps<typeof iconVariants>;

defineProps<{ size?: IconVariants["size"] }>();
</script>
