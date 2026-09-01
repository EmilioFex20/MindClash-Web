<template>
  <div
    :class="[
      'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
      className,
    ]"
    v-bind="props"
  >
    <slot></slot>
    <!-- This slot will render the child content (CardHeader, CardFooter, etc.) -->
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

// Define the `className` prop to accept additional classes
const props = defineProps({
  className: String,
})
</script>
