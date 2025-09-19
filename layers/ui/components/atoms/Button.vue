<!--
  Atomic Button Component
  A flexible, accessible button component following Nuxt UI v4 patterns
  Integrates with design tokens and supports all variants, sizes, and states
-->

<script setup lang="ts">
import { computed, useSlots } from 'vue'

/**
 * Button Component Props Interface
 * Follows Nuxt UI v4 Button API specifications
 */
interface ButtonProps {
  /** Button text content */
  label?: string
  /** Color theme variant */
  color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
  /** Visual style variant */
  variant?: 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link'
  /** Button size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Button type for form submission */
  type?: 'button' | 'submit' | 'reset'
  /** Disabled state */
  disabled?: boolean
  /** Loading state - shows spinner and disables interaction */
  loading?: boolean
  /** Icon to display when loading */
  loadingIcon?: string
  /** Icon to use based on leading/trailing props */
  icon?: string
  /** Display icon on the left side */
  leadingIcon?: string
  /** Display icon on the right side */
  trailingIcon?: string
  /** Position icon on the left when using icon prop */
  leading?: boolean
  /** Position icon on the right when using icon prop */
  trailing?: boolean
  /** Equal padding on all sides (square) */
  square?: boolean
  /** Full width button */
  block?: boolean
  /** Click event handler */
  onClick?: ((event: MouseEvent) => void | Promise<void>) | ((event: MouseEvent) => void | Promise<void>)[]
}

interface ButtonEmits {
  (e: 'click', event: MouseEvent): void
}

// Component registration
const props = withDefaults(defineProps<ButtonProps>(), {
  color: 'primary',
  variant: 'solid',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  leading: false,
  trailing: false,
  square: false,
  block: false,
})

const emit = defineEmits<ButtonEmits>()
const slots = useSlots()

/**
 * Computed Properties for Button State and Classes
 */

// Check if button should be disabled (explicit disabled or loading)
const isDisabled = computed(() => props.disabled || props.loading)

// Determine leading icon to display
const leadingIconName = computed(() => {
  if (props.leadingIcon)
    return props.leadingIcon
  if (props.icon && (props.leading || (!props.leading && !props.trailing))) {
    return props.icon
  }
  return null
})

// Determine trailing icon to display
const trailingIconName = computed(() => {
  if (props.trailingIcon)
    return props.trailingIcon
  if (props.icon && props.trailing) {
    return props.icon
  }
  return null
})

// Check if button has leading content (slot or icon)
const hasLeading = computed(() => {
  // Check for slot content or icon (show even when loading for hidden state)
  return !!slots.leading || !!leadingIconName.value
})

// Check if button has trailing content (slot or icon)
const hasTrailing = computed(() => {
  // Check for slot content or icon (show even when loading for hidden state)
  return !!slots.trailing || !!trailingIconName.value
})

// Check if this is an icon-only button (define before usage)
const isIconOnlyButton = computed(() => {
  return !props.label && (!!props.icon || !!props.leadingIcon || !!props.trailingIcon)
})

// Check if button has main content (label or default slot)
const hasContent = computed(() => {
  return !!props.label || !isIconOnlyButton.value
})

// Leading icon classes with loading state handling
const leadingIconClasses = computed(() => [
  'btn-icon',
  'btn-icon-leading',
  {
    hidden: props.loading,
  },
])

// Trailing icon classes with loading state handling
const trailingIconClasses = computed(() => [
  'btn-icon',
  'btn-icon-trailing',
  {
    hidden: props.loading,
  },
])

// Main button classes computation
const buttonClasses = computed(() => [
  // Base classes
  'btn',

  // Variant and color classes
  `btn-${props.variant}`,
  `btn-${props.color}`,

  // Size classes
  `btn-${props.size}`,

  // State classes
  {
    'btn-disabled': isDisabled.value,
    'btn-loading': props.loading,
    'btn-square': props.square,
    'btn-block': props.block,
    'btn-icon-only': isIconOnlyButton.value,
  },
])

/**
 * Event Handlers
 */

// Handle click events with disabled/loading state checks
function handleClick(event: MouseEvent) {
  // Prevent click when disabled or loading
  if (isDisabled.value) {
    event.preventDefault()
    event.stopPropagation()
    return
  }

  // Execute onClick prop handlers
  if (props.onClick) {
    if (Array.isArray(props.onClick)) {
      props.onClick.forEach(handler => handler(event))
    }
    else {
      props.onClick(event)
    }
  }

  // Emit the click event
  emit('click', event)
}
</script>

<template>
  <button
    :type="type"
    :disabled="isDisabled"
    :tabindex="isDisabled ? -1 : undefined"
    :aria-disabled="isDisabled"
    :class="buttonClasses"
    @click="handleClick"
  >
    <!-- Leading Content -->
    <span v-if="hasLeading" class="btn-leading">
      <slot name="leading">
        <UIcon
          v-if="leadingIconName"
          :name="leadingIconName"
          :class="leadingIconClasses"
          class="leading-icon"
        />
      </slot>
    </span>

    <!-- Loading Icon -->
    <UIcon
      v-if="loading"
      :name="loadingIcon || 'i-lucide-loader-circle'"
      class="loading-icon animate-spin"
    />

    <!-- Button Content -->
    <span v-if="hasContent" class="btn-content">
      <slot>{{ label }}</slot>
    </span>

    <!-- Trailing Content -->
    <span v-if="hasTrailing" class="btn-trailing">
      <slot name="trailing">
        <UIcon
          v-if="trailingIconName"
          :name="trailingIconName"
          :class="trailingIconClasses"
          class="trailing-icon"
        />
      </slot>
    </span>
  </button>
</template>

<style scoped>
/**
 * Button Component Styles
 * Uses design tokens from design-system.css for consistency
 * Follows Nuxt UI v4 styling patterns
 */

.btn {
  /* Base button styles using design tokens */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);

  /* Typography */
  font-family: var(--font-sans);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  line-height: 1;

  /* Interaction */
  cursor: pointer;
  user-select: none;

  /* Transitions */
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast),
    box-shadow var(--transition-fast),
    opacity var(--transition-fast),
    transform var(--transition-fast);

  /* Border and radius */
  border: 1px solid transparent;
  border-radius: var(--ui-button-radius);

  /* Focus styles */
  outline: none;
  focus-visible:ring-2;
  focus-visible:ring-offset-2;

  /* Prevent text selection */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* Button content layout */
.btn-content {
  flex: 1;
  text-align: center;
}

.btn-leading,
.btn-trailing {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Icon styles */
.btn-icon {
  flex-shrink: 0;
  display: inline-block;
}

.loading-icon {
  flex-shrink: 0;
}

/* Size variants using design tokens */
.btn-xs {
  height: var(--ui-button-height-sm);
  padding: 0 var(--ui-button-padding-x-sm);
  font-size: var(--font-size-xs);
  gap: var(--spacing-1);
}

.btn-xs .btn-icon {
  width: 1rem;
  height: 1rem;
}

.btn-sm {
  height: var(--ui-button-height-sm);
  padding: 0 var(--ui-button-padding-x-sm);
  font-size: var(--font-size-sm);
  gap: var(--spacing-1);
}

.btn-sm .btn-icon {
  width: 1rem;
  height: 1rem;
}

.btn-md {
  height: var(--ui-button-height-md);
  padding: 0 var(--ui-button-padding-x-md);
  font-size: var(--font-size-sm);
  gap: var(--spacing-2);
}

.btn-md .btn-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.btn-lg {
  height: var(--ui-button-height-lg);
  padding: 0 var(--ui-button-padding-x-lg);
  font-size: var(--font-size-base);
  gap: var(--spacing-2);
}

.btn-lg .btn-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.btn-xl {
  height: var(--ui-button-height-lg);
  padding: 0 var(--ui-button-padding-x-lg);
  font-size: var(--font-size-lg);
  gap: var(--spacing-2);
}

.btn-xl .btn-icon {
  width: 1.5rem;
  height: 1.5rem;
}

/* Color variants - Solid */
.btn-solid.btn-primary {
  background-color: var(--ui-primary);
  color: var(--ui-text-inverted);
  border-color: var(--ui-primary);
}

.btn-solid.btn-primary:hover:not(.btn-disabled) {
  background-color: var(--color-primary-700);
  border-color: var(--color-primary-700);
}

.btn-solid.btn-primary:active:not(.btn-disabled) {
  background-color: var(--color-primary-800);
  border-color: var(--color-primary-800);
}

.btn-solid.btn-primary:focus-visible {
  ring-color: var(--ui-primary);
}

.btn-solid.btn-secondary {
  background-color: var(--ui-secondary);
  color: var(--ui-text-inverted);
  border-color: var(--ui-secondary);
}

.btn-solid.btn-secondary:hover:not(.btn-disabled) {
  background-color: var(--color-secondary-700);
  border-color: var(--color-secondary-700);
}

.btn-solid.btn-success {
  background-color: var(--ui-success);
  color: var(--ui-text-inverted);
  border-color: var(--ui-success);
}

.btn-solid.btn-success:hover:not(.btn-disabled) {
  background-color: var(--color-success-700);
  border-color: var(--color-success-700);
}

.btn-solid.btn-info {
  background-color: var(--ui-info);
  color: var(--ui-text-inverted);
  border-color: var(--ui-info);
}

.btn-solid.btn-info:hover:not(.btn-disabled) {
  background-color: var(--color-info-700);
  border-color: var(--color-info-700);
}

.btn-solid.btn-warning {
  background-color: var(--ui-warning);
  color: var(--ui-text-inverted);
  border-color: var(--ui-warning);
}

.btn-solid.btn-warning:hover:not(.btn-disabled) {
  background-color: var(--color-warning-700);
  border-color: var(--color-warning-700);
}

.btn-solid.btn-error {
  background-color: var(--ui-error);
  color: var(--ui-text-inverted);
  border-color: var(--ui-error);
}

.btn-solid.btn-error:hover:not(.btn-disabled) {
  background-color: var(--color-error-700);
  border-color: var(--color-error-700);
}

.btn-solid.btn-neutral {
  background-color: var(--ui-bg-inverted);
  color: var(--ui-text-inverted);
  border-color: var(--ui-bg-inverted);
}

.btn-solid.btn-neutral:hover:not(.btn-disabled) {
  background-color: var(--color-neutral-800);
  border-color: var(--color-neutral-800);
}

/* Color variants - Outline */
.btn-outline.btn-primary {
  background-color: transparent;
  color: var(--ui-primary);
  border-color: var(--ui-primary);
}

.btn-outline.btn-primary:hover:not(.btn-disabled) {
  background-color: var(--color-primary-50);
}

.btn-outline.btn-secondary {
  background-color: transparent;
  color: var(--ui-secondary);
  border-color: var(--ui-secondary);
}

.btn-outline.btn-secondary:hover:not(.btn-disabled) {
  background-color: var(--color-secondary-50);
}

.btn-outline.btn-success {
  background-color: transparent;
  color: var(--ui-success);
  border-color: var(--ui-success);
}

.btn-outline.btn-success:hover:not(.btn-disabled) {
  background-color: var(--color-success-50);
}

.btn-outline.btn-info {
  background-color: transparent;
  color: var(--ui-info);
  border-color: var(--ui-info);
}

.btn-outline.btn-info:hover:not(.btn-disabled) {
  background-color: var(--color-info-50);
}

.btn-outline.btn-warning {
  background-color: transparent;
  color: var(--ui-warning);
  border-color: var(--ui-warning);
}

.btn-outline.btn-warning:hover:not(.btn-disabled) {
  background-color: var(--color-warning-50);
}

.btn-outline.btn-error {
  background-color: transparent;
  color: var(--ui-error);
  border-color: var(--ui-error);
}

.btn-outline.btn-error:hover:not(.btn-disabled) {
  background-color: var(--color-error-50);
}

.btn-outline.btn-neutral {
  background-color: transparent;
  color: var(--ui-text);
  border-color: var(--ui-border-accented);
}

.btn-outline.btn-neutral:hover:not(.btn-disabled) {
  background-color: var(--ui-bg-elevated);
}

/* Color variants - Soft */
.btn-soft.btn-primary {
  background-color: var(--color-primary-100);
  color: var(--ui-primary);
  border-color: transparent;
}

.btn-soft.btn-primary:hover:not(.btn-disabled) {
  background-color: var(--color-primary-200);
}

.btn-soft.btn-secondary {
  background-color: var(--color-secondary-100);
  color: var(--ui-secondary);
  border-color: transparent;
}

.btn-soft.btn-secondary:hover:not(.btn-disabled) {
  background-color: var(--color-secondary-200);
}

.btn-soft.btn-success {
  background-color: var(--color-success-100);
  color: var(--ui-success);
  border-color: transparent;
}

.btn-soft.btn-success:hover:not(.btn-disabled) {
  background-color: var(--color-success-200);
}

.btn-soft.btn-info {
  background-color: var(--color-info-100);
  color: var(--ui-info);
  border-color: transparent;
}

.btn-soft.btn-info:hover:not(.btn-disabled) {
  background-color: var(--color-info-200);
}

.btn-soft.btn-warning {
  background-color: var(--color-warning-100);
  color: var(--ui-warning);
  border-color: transparent;
}

.btn-soft.btn-warning:hover:not(.btn-disabled) {
  background-color: var(--color-warning-200);
}

.btn-soft.btn-error {
  background-color: var(--color-error-100);
  color: var(--ui-error);
  border-color: transparent;
}

.btn-soft.btn-error:hover:not(.btn-disabled) {
  background-color: var(--color-error-200);
}

.btn-soft.btn-neutral {
  background-color: var(--ui-bg-elevated);
  color: var(--ui-text);
  border-color: transparent;
}

.btn-soft.btn-neutral:hover:not(.btn-disabled) {
  background-color: var(--ui-bg-accented);
}

/* Color variants - Subtle */
.btn-subtle.btn-primary {
  background-color: var(--color-primary-100);
  color: var(--ui-primary);
  border-color: var(--color-primary-200);
}

.btn-subtle.btn-primary:hover:not(.btn-disabled) {
  background-color: var(--color-primary-200);
  border-color: var(--color-primary-300);
}

.btn-subtle.btn-secondary {
  background-color: var(--color-secondary-100);
  color: var(--ui-secondary);
  border-color: var(--color-secondary-200);
}

.btn-subtle.btn-secondary:hover:not(.btn-disabled) {
  background-color: var(--color-secondary-200);
  border-color: var(--color-secondary-300);
}

.btn-subtle.btn-success {
  background-color: var(--color-success-100);
  color: var(--ui-success);
  border-color: var(--color-success-200);
}

.btn-subtle.btn-success:hover:not(.btn-disabled) {
  background-color: var(--color-success-200);
  border-color: var(--color-success-300);
}

.btn-subtle.btn-info {
  background-color: var(--color-info-100);
  color: var(--ui-info);
  border-color: var(--color-info-200);
}

.btn-subtle.btn-info:hover:not(.btn-disabled) {
  background-color: var(--color-info-200);
  border-color: var(--color-info-300);
}

.btn-subtle.btn-warning {
  background-color: var(--color-warning-100);
  color: var(--ui-warning);
  border-color: var(--color-warning-200);
}

.btn-subtle.btn-warning:hover:not(.btn-disabled) {
  background-color: var(--color-warning-200);
  border-color: var(--color-warning-300);
}

.btn-subtle.btn-error {
  background-color: var(--color-error-100);
  color: var(--ui-error);
  border-color: var(--color-error-200);
}

.btn-subtle.btn-error:hover:not(.btn-disabled) {
  background-color: var(--color-error-200);
  border-color: var(--color-error-300);
}

.btn-subtle.btn-neutral {
  background-color: var(--ui-bg-elevated);
  color: var(--ui-text);
  border-color: var(--ui-border-accented);
}

.btn-subtle.btn-neutral:hover:not(.btn-disabled) {
  background-color: var(--ui-bg-accented);
  border-color: var(--ui-border-accented);
}

/* Color variants - Ghost */
.btn-ghost.btn-primary {
  background-color: transparent;
  color: var(--ui-primary);
  border-color: transparent;
}

.btn-ghost.btn-primary:hover:not(.btn-disabled) {
  background-color: var(--color-primary-100);
}

.btn-ghost.btn-secondary {
  background-color: transparent;
  color: var(--ui-secondary);
  border-color: transparent;
}

.btn-ghost.btn-secondary:hover:not(.btn-disabled) {
  background-color: var(--color-secondary-100);
}

.btn-ghost.btn-success {
  background-color: transparent;
  color: var(--ui-success);
  border-color: transparent;
}

.btn-ghost.btn-success:hover:not(.btn-disabled) {
  background-color: var(--color-success-100);
}

.btn-ghost.btn-info {
  background-color: transparent;
  color: var(--ui-info);
  border-color: transparent;
}

.btn-ghost.btn-info:hover:not(.btn-disabled) {
  background-color: var(--color-info-100);
}

.btn-ghost.btn-warning {
  background-color: transparent;
  color: var(--ui-warning);
  border-color: transparent;
}

.btn-ghost.btn-warning:hover:not(.btn-disabled) {
  background-color: var(--color-warning-100);
}

.btn-ghost.btn-error {
  background-color: transparent;
  color: var(--ui-error);
  border-color: transparent;
}

.btn-ghost.btn-error:hover:not(.btn-disabled) {
  background-color: var(--color-error-100);
}

.btn-ghost.btn-neutral {
  background-color: transparent;
  color: var(--ui-text);
  border-color: transparent;
}

.btn-ghost.btn-neutral:hover:not(.btn-disabled) {
  background-color: var(--ui-bg-elevated);
}

/* Color variants - Link */
.btn-link.btn-primary {
  background-color: transparent;
  color: var(--ui-primary);
  border-color: transparent;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.btn-link.btn-primary:hover:not(.btn-disabled) {
  color: var(--color-primary-700);
}

.btn-link.btn-secondary {
  background-color: transparent;
  color: var(--ui-secondary);
  border-color: transparent;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.btn-link.btn-secondary:hover:not(.btn-disabled) {
  color: var(--color-secondary-700);
}

.btn-link.btn-success {
  background-color: transparent;
  color: var(--ui-success);
  border-color: transparent;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.btn-link.btn-success:hover:not(.btn-disabled) {
  color: var(--color-success-700);
}

.btn-link.btn-info {
  background-color: transparent;
  color: var(--ui-info);
  border-color: transparent;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.btn-link.btn-info:hover:not(.btn-disabled) {
  color: var(--color-info-700);
}

.btn-link.btn-warning {
  background-color: transparent;
  color: var(--ui-warning);
  border-color: transparent;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.btn-link.btn-warning:hover:not(.btn-disabled) {
  color: var(--color-warning-700);
}

.btn-link.btn-error {
  background-color: transparent;
  color: var(--ui-error);
  border-color: transparent;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.btn-link.btn-error:hover:not(.btn-disabled) {
  color: var(--color-error-700);
}

.btn-link.btn-neutral {
  background-color: transparent;
  color: var(--ui-text-muted);
  border-color: transparent;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.btn-link.btn-neutral:hover:not(.btn-disabled) {
  color: var(--ui-text);
}

/* State styles */
.btn-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: auto; /* Allow hover styles for feedback */
}

.btn-loading {
  pointer-events: none;
  cursor: default;
}

/* Modifier styles */
.btn-square.btn-xs {
  padding: var(--spacing-1);
  width: auto;
  aspect-ratio: 1;
}

.btn-square.btn-sm {
  padding: var(--spacing-1);
  width: auto;
  aspect-ratio: 1;
}

.btn-square.btn-md {
  padding: var(--spacing-2);
  width: auto;
  aspect-ratio: 1;
}

.btn-square.btn-lg {
  padding: var(--spacing-2);
  width: auto;
  aspect-ratio: 1;
}

.btn-square.btn-xl {
  padding: var(--spacing-3);
  width: auto;
  aspect-ratio: 1;
}

.btn-block {
  display: flex;
  width: 100%;
}

.btn-icon-only {
  gap: 0;
}

.btn-icon-only .btn-content {
  display: none;
}

/* Animation for loading state */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Dark mode adjustments */
.dark .btn-soft.btn-primary {
  background-color: var(--color-primary-900);
  color: var(--color-primary-300);
}

.dark .btn-soft.btn-primary:hover:not(.btn-disabled) {
  background-color: var(--color-primary-800);
  color: var(--color-primary-200);
}

.dark .btn-outline.btn-primary:hover:not(.btn-disabled) {
  background-color: var(--color-primary-950);
}

.dark .btn-ghost.btn-primary:hover:not(.btn-disabled) {
  background-color: var(--color-primary-950);
}

/* Apply similar dark mode styles for other colors... */
.dark .btn-soft.btn-secondary {
  background-color: var(--color-secondary-900);
  color: var(--color-secondary-300);
}

.dark .btn-soft.btn-success {
  background-color: var(--color-success-900);
  color: var(--color-success-300);
}

.dark .btn-soft.btn-info {
  background-color: var(--color-info-900);
  color: var(--color-info-300);
}

.dark .btn-soft.btn-warning {
  background-color: var(--color-warning-900);
  color: var(--color-warning-300);
}

.dark .btn-soft.btn-error {
  background-color: var(--color-error-900);
  color: var(--color-error-300);
}

.dark .btn-soft.btn-neutral {
  background-color: var(--color-neutral-800);
  color: var(--color-neutral-200);
}

/* Ensure accessibility */
.btn:focus-visible {
  outline: 2px solid var(--ui-focus-ring);
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .btn {
    border-width: 2px;
  }

  .btn-outline {
    border-width: 2px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .btn {
    transition: none;
  }

  .animate-spin {
    animation: none;
  }
}
</style>
