<template>
  <div
    data-slot="card-action"
    :class="['col-start-2 row-span-2 row-start-1 self-start justify-self-end', className]"
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
