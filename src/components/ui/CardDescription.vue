<template>
  <div
    data-slot="card-description"
    :class="['text-muted-foreground text-sm', className]"
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
