<template>
  <div
    class="rounded-lg border border-solid border-border bg-card text-card-foreground shadow-sm"
  >
    <div class="flex flex-col gap-y-1.5 p-6">
      <h3 class="text-2xl font-semibold leading-none line-clamp-2">
        <slot name="title" />
      </h3>

      <p class="text-sm text-muted-foreground" v-if="$slots.description">
        <slot name="description" />
      </p>

      <slot name="header" />
    </div>

    <div class="p-6 pt-0">
      <slot />
    </div>

    <div class="flex items-center p-6 pt-0" v-if="$slots.footer">
      <slot name="footer" />
    </div>
  </div>
</template>
