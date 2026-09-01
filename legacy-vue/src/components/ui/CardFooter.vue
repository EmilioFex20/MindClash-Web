<template>
  <div
    data-slot="card-footer"
    :class="['flex items-center px-6 [.border-t]:pt-6', className]"
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
