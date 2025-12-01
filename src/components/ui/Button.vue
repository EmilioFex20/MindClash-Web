<template>
  <component :is="compType" :class="buttonClass" v-bind="attrs" data-slot="button">
    <slot />
  </component>
</template>

<script setup>
import { computed, useAttrs } from 'vue'

const attrs = useAttrs()

const props = defineProps({
  className: { type: String, default: '' },
  variant: { type: String, default: 'default' },
  size: { type: String, default: 'default' },
  asChild: { type: Boolean, default: false },
})

const compType = computed(() => (props.asChild ? 'span' : 'button'))

const buttonClass = computed(() => {
  const variants = {
    default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
    destructive:
      'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
    outline:
      'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
    secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
    link: 'text-primary underline-offset-4 hover:underline',
  }

  const sizes = {
    default: 'h-9 px-4 py-2 has-[>svg]:px-3',
    sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
    lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
    icon: 'size-9',
  }

  return [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50',
    variants[props.variant] || variants.default,
    sizes[props.size] || sizes.default,
    props.className,
  ]
    .filter(Boolean)
    .join(' ')
})
</script>
