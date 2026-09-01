<template>
  <div
    data-slot="card-header"
    :class="[
      '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6',
      className,
    ]"
    v-bind="props"
  >
    <slot></slot>
  </div>
</template>

<script setup>
const props = defineProps({
  className: String,
})
</script>
CardTitle
