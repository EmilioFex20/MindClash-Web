<template>
  <div data-slot="card-title" :class="['leading-none font-semibold', className]" v-bind="props">
    <slot></slot>
  </div>
</template>

<script setup>
const props = defineProps({
  className: String,
})
</script>
