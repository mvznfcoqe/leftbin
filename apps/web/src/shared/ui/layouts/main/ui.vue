<template>
  <div>
    <header class="border-b-border border-b-1 border-b-solid h-15">
      <div class="container mx-auto px-6 flex items-center h-full">
        <RouterLink to="/">
          <Logo />
        </RouterLink>
      </div>
    </header>

    <main class="container mx-auto mt-5 px-6">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { Logo } from "@/shared/ui/logo";
</script>
