# UI Layer

The UI layer provides a comprehensive design system built on Nuxt UI v4 with atomic design principles. It includes design tokens, components following atomic design patterns, and responsive layouts optimized for both light and dark modes.

## Architecture

The UI layer implements atomic design methodology:

- **Atoms**: Basic building blocks (Button, Input, Icon)
- **Molecules**: Simple component combinations
- **Organisms**: Complex component compositions
- **Templates**: Page-level layouts and structure

## Design System

### Design Tokens

The layer uses a tokenized CSS design system with semantic variables that adapt to light/dark modes:

```css
/* Core Design Tokens */
:root {
  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Spacing Scale */
  --spacing-1: 0.25rem;    /* 4px */
  --spacing-2: 0.5rem;     /* 8px */
  --spacing-3: 0.75rem;    /* 12px */
  --spacing-4: 1rem;       /* 16px */

  /* UI Component Tokens */
  --ui-button-height-sm: 2rem;
  --ui-button-height-md: 2.5rem;
  --ui-button-height-lg: 3rem;
  --ui-button-radius: 0.375rem;

  /* Semantic Colors */
  --ui-primary: var(--color-primary-600);
  --ui-secondary: var(--color-secondary-600);
  --ui-success: var(--color-success-600);
  --ui-error: var(--color-error-600);
  --ui-warning: var(--color-warning-600);
  --ui-info: var(--color-info-600);
}
```

### Color System

The design system provides comprehensive color scales for each semantic color:

```css
/* Primary Color Scale */
--color-primary-50: #f0f9ff;
--color-primary-100: #e0f2fe;
--color-primary-500: #0ea5e9;  /* Base */
--color-primary-600: #0284c7;  /* Primary UI */
--color-primary-700: #0369a1;  /* Hover */
--color-primary-900: #0c4a6e;
--color-primary-950: #082f49;
```

### Dark Mode Support

Colors automatically adapt to dark mode using CSS variables:

```css
.dark {
  --ui-primary: var(--color-primary-400);
  --ui-bg: var(--color-neutral-950);
  --ui-text: var(--color-neutral-50);
}
```

## Components

### Atoms

#### Button Component

A flexible, accessible button component with comprehensive styling options.

```vue
<template>
  <!-- Basic Usage -->
  <Button label="Click me" />

  <!-- Variants and Colors -->
  <Button
    label="Primary Solid"
    color="primary"
    variant="solid"
  />

  <Button
    label="Secondary Outline"
    color="secondary"
    variant="outline"
  />

  <!-- Sizes -->
  <Button label="Small" size="sm" />
  <Button label="Medium" size="md" />
  <Button label="Large" size="lg" />

  <!-- With Icons -->
  <Button
    label="Save Changes"
    leading-icon="i-lucide-save"
    color="success"
  />

  <Button
    label="Delete"
    trailing-icon="i-lucide-trash"
    color="error"
    variant="outline"
  />

  <!-- Loading State -->
  <Button
    label="Processing"
    :loading="isLoading"
    color="primary"
  />

  <!-- Icon Only -->
  <Button
    icon="i-lucide-settings"
    square
    variant="ghost"
  />
</template>
```

**Props API:**
```typescript
interface ButtonProps {
  label?: string // Button text
  color?: 'primary' | 'secondary' // Color theme
    | 'success' | 'info'
    | 'warning' | 'error'
    | 'neutral'
  variant?: 'solid' | 'outline' // Visual style
    | 'soft' | 'subtle'
    | 'ghost' | 'link'
  size?: 'xs' | 'sm' | 'md' // Button size
    | 'lg' | 'xl'
  disabled?: boolean // Disabled state
  loading?: boolean // Loading state
  icon?: string // Icon name
  leadingIcon?: string // Left icon
  trailingIcon?: string // Right icon
  square?: boolean // Square aspect ratio
  block?: boolean // Full width
}
```

**Color Variants:**

| Color | Description | Use Case |
|-------|-------------|----------|
| `primary` | Main brand color | Primary actions |
| `secondary` | Secondary brand color | Secondary actions |
| `success` | Green semantic | Success, confirm |
| `info` | Blue information | Info, neutral |
| `warning` | Orange/yellow warning | Caution actions |
| `error` | Red danger | Delete, destructive |
| `neutral` | Grayscale | Utility actions |

**Style Variants:**

| Variant | Description | Visual Style |
|---------|-------------|--------------|
| `solid` | Filled background | High emphasis |
| `outline` | Border only | Medium emphasis |
| `soft` | Light background | Low emphasis |
| `subtle` | Light background + border | Subtle emphasis |
| `ghost` | Transparent background | Minimal emphasis |
| `link` | Text only with underline | Link-like |

### Design System Probe

The `DesignSystemProbe` component provides visual testing for design tokens:

```vue
<template>
  <DesignSystemProbe />
</template>
```

This component renders all button variants, colors, and sizes for visual consistency testing during development.

## Usage Patterns

### Form Buttons

```vue
<template>
  <form @submit="handleSubmit">
    <!-- Primary action -->
    <Button
      type="submit"
      label="Save Changes"
      color="primary"
      :loading="saving"
    />

    <!-- Secondary action -->
    <Button
      type="button"
      label="Cancel"
      variant="ghost"
      @click="cancel"
    />
  </form>
</template>
```

### Action Groups

```vue
<template>
  <div class="flex gap-2">
    <Button
      icon="i-lucide-edit"
      variant="outline"
      size="sm"
      square
    />
    <Button
      icon="i-lucide-trash"
      variant="outline"
      color="error"
      size="sm"
      square
    />
  </div>
</template>
```

### Loading States

```vue
<template>
  <Button
    :label="isLoading ? 'Processing...' : 'Submit'"
    :loading="isLoading"
    :disabled="!canSubmit"
    @click="handleSubmit"
  />
</template>

<script setup lang="ts">
const isLoading = ref(false)
const canSubmit = computed(() => /* validation logic */)

async function handleSubmit() {
  isLoading.value = true
  try {
    await submitData()
  } finally {
    isLoading.value = false
  }
}
</script>
```

## Integration

### With Core Layer

The UI layer integrates seamlessly with core composables:

```vue
<script setup lang="ts">
const { handleApiError } = useErrorHandler()
const api = useApi()
const loading = ref(false)

async function createUser() {
  loading.value = true
  try {
    const response = await api.post('/api/users', userData)
    if (!response.success) {
      handleApiError(response.errors, 'User creation')
    }
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <Button
    label="Create User"
    :loading="loading"
    @click="createUser"
  />
</template>
```

### With Nuxt UI

The layer extends Nuxt UI components:

```vue
<template>
  <!-- Custom Button with Nuxt UI integration -->
  <Button
    label="Show Modal"
    @click="modal.open"
  />

  <!-- Native Nuxt UI when custom not needed -->
  <UModal v-model="modal.isOpen">
    <UCard>
      <template #header>
        <h3>Modal Title</h3>
      </template>

      <p>Modal content...</p>

      <template #footer>
        <Button
          label="Close"
          variant="outline"
          @click="modal.close"
        />
      </template>
    </UCard>
  </UModal>
</template>
```

## Responsive Design

All components include responsive design patterns:

```css
/* Responsive button sizing */
.btn-responsive {
  @media (max-width: 640px) {
    font-size: var(--font-size-sm);
    padding: 0 var(--ui-button-padding-x-sm);
  }
}

/* Touch-friendly sizing on mobile */
@media (max-width: 768px) {
  .btn {
    min-height: 44px; /* iOS minimum touch target */
  }
}
```

## Accessibility

### WCAG 2.1 AA Compliance

All components include comprehensive accessibility features:

```vue
<template>
  <Button
    label="Submit Form"
    :disabled="isDisabled"
    :aria-disabled="isDisabled"
    :tabindex="isDisabled ? -1 : 0"
    @click="handleSubmit"
  />
</template>
```

### Focus Management

```css
.btn:focus-visible {
  outline: 2px solid var(--ui-focus-ring);
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .btn {
    border-width: 2px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .btn {
    transition: none;
  }
}
```

### Screen Reader Support

- Proper ARIA labels and descriptions
- Loading state announcements
- Disabled state handling
- Icon accessibility with `aria-hidden="true"`

## Theming

### Custom Color Themes

Create custom color themes by extending the token system:

```css
:root {
  /* Custom brand colors */
  --color-brand-50: #fef7ff;
  --color-brand-500: #a855f7;
  --color-brand-600: #9333ea;

  /* Apply to UI tokens */
  --ui-primary: var(--color-brand-600);
}
```

### Component Customization

Override component styles using CSS custom properties:

```css
/* Custom button radius */
:root {
  --ui-button-radius: 0.75rem; /* More rounded */
}

/* Custom button heights */
:root {
  --ui-button-height-md: 3rem; /* Taller buttons */
}
```

## Performance

### Bundle Optimization

- Tree-shaking support for unused variants
- Minimal CSS footprint with token-based system
- Lazy loading for complex organisms
- Optimized icon usage with Iconify

### Runtime Performance

- CSS-only animations for smooth interactions
- Minimal JavaScript for component logic
- Efficient re-rendering with computed properties
- Memory-efficient event handling

## Testing

### Visual Testing

```typescript
// Storybook stories for visual testing
export default {
  title: 'Atoms/Button',
  component: Button,
  argTypes: {
    color: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'success', 'error']
    },
    variant: {
      control: { type: 'select' },
      options: ['solid', 'outline', 'soft', 'ghost']
    }
  }
}

export function AllVariants() {
  return {
    components: { Button },
    template: `
    <div class="grid grid-cols-4 gap-4">
      <Button v-for="color in colors"
        :key="color"
        :color="color"
        :label="color"
      />
    </div>
  `
  }
}
```

### Unit Testing

```typescript
import { mount } from '@vue/test-utils'
import Button from './Button.vue'

describe('Button Component', () => {
  it('renders with correct label', () => {
    const wrapper = mount(Button, {
      props: { label: 'Test Button' }
    })
    expect(wrapper.text()).toContain('Test Button')
  })

  it('emits click event', async () => {
    const wrapper = mount(Button)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('is disabled when loading', () => {
    const wrapper = mount(Button, {
      props: { loading: true }
    })
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })
})
```

## Migration Guide

### From Nuxt UI v3

1. **Color Props**: Update color names to match new semantic system
2. **Variant Props**: Some variants renamed (e.g., `ghost` → `subtle`)
3. **Size Props**: Size scale updated for better consistency
4. **CSS Classes**: Update custom CSS to use new design tokens

### Breaking Changes

- Removed deprecated color variants
- Updated spacing scale
- Changed default button heights
- New focus ring implementation
