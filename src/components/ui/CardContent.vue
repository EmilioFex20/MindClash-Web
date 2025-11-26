<template>
  <div data-slot="card-content" :class="['px-6', className]" v-bind="props">
    <slot></slot>
  </div>
</template>

<script setup>
const props = defineProps({
  className: String,
})
</script>
