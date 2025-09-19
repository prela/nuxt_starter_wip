// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  pages: true,

  // Extend all layers
  extends: [
    './layers/core',
    './layers/ui',
    './layers/api',
    './layers/content',
  ],

  modules: [
    '@nuxt/content',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt',
    'nuxt-security',
  ],
  css: ['~/assets/css/main.css'],
  // Security configuration
  security: {
    headers: {
      crossOriginEmbedderPolicy: process.env.NODE_ENV === 'development' ? 'unsafe-none' : 'require-corp',
      contentSecurityPolicy: {
        'default-src': ['\'self\''],
        'base-uri': ['\'self\''],
        'font-src': ['\'self\'', 'https:', 'data:'],
        'form-action': ['\'self\''],
        'frame-ancestors': ['\'none\''],
        'frame-src': ['\'none\''],
        'img-src': ['\'self\'', 'data:', 'https:'],
        'object-src': ['\'none\''],
        'script-src-attr': ['\'none\''],
        'style-src': ['\'self\'', 'https:', '\'unsafe-inline\''],
        'script-src': ['\'self\'', '\'nonce-{{nonce}}\'', '\'strict-dynamic\''],
        'connect-src': process.env.NODE_ENV === 'development'
          ? ['\'self\'', 'ws:', 'ws://127.0.0.1:24678']
          : ['\'self\''],
        'upgrade-insecure-requests': true,
        'report-uri': ['/api/csp-report'],
        'report-to': 'csp',
      },
    },
    // CSRF Protection
    // Disable nuxt-security CSRF and rely on custom middleware exclusions
    csrf: false,
    rateLimiter: {
      tokensPerInterval: 150,
      interval: 300000,
      headers: false,
      driver: {
        name: 'lruCache',
      },
    },
  },

  // Nitro routeRules for caching configuration
  routeRules: {
    // Homepage: SWR cache for 60 seconds
    '/': {
      swr: 60,
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate',
      },
    },

    // Content pages: SWR cache for 300 seconds (5 minutes)
    '/content/**': {
      swr: 300,
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate',
      },
    },

    // Public API routes: Standard cache with 60 seconds maxAge
    '/api/public/**': {
      headers: {
        'Cache-Control': 'public, max-age=60',
      },
    },

    // Health API should not be cached
    '/api/health': {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },

    // CSP reporting endpoint - no cache and no CSRF protection
    '/api/csp-report': {
      csurf: false,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  },

  // @nuxt/image configuration
  image: {
    // Default provider (ipx for local images)
    provider: 'ipx',

    // Image presets for consistent sizing across the application
    presets: {
      // Default preset for common image sizes
      default: {
        modifiers: {
          format: 'webp',
          quality: 80,
          fit: 'cover',
        },
      },

      // Avatar preset for user profile images
      avatar: {
        modifiers: {
          format: 'webp',
          width: 150,
          height: 150,
          quality: 85,
          fit: 'cover',
        },
      },

      // Thumbnail preset for small preview images
      thumbnail: {
        modifiers: {
          format: 'webp',
          width: 300,
          height: 200,
          quality: 75,
          fit: 'cover',
        },
      },

      // Hero preset for large banner images
      hero: {
        modifiers: {
          format: 'webp',
          width: 1920,
          height: 1080,
          quality: 85,
          fit: 'cover',
        },
      },

      // Card preset for content cards
      card: {
        modifiers: {
          format: 'webp',
          width: 400,
          height: 250,
          quality: 80,
          fit: 'cover',
        },
      },
    },

    // Configure responsive sizes for typical components
    sizes: {
      // Sizes for different screen breakpoints
      'xs': '320px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',

      // Common component sizes
      'avatar': '50px,100px,150px',
      'thumbnail': '150px,300px,450px',
      'card': '200px,400px,600px',
      'hero': '800px,1200px,1920px',
    },

    // Default quality and format settings
    quality: 80,
    format: ['webp', 'avif', 'jpeg'],

    // Enable better performance
    densities: [1, 2],

    // IPX provider configuration (for local images)
    ipx: {
      // Default modifiers for all images
      modifiers: {
        quality: 80,
        format: 'webp',
      },
    },
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

  // Development server configuration
  devServer: {
    // Handle connection errors gracefully
    host: '127.0.0.1',
    port: 3000,
  },

  // Nitro configuration for better error handling
  nitro: {
    // Handle development server errors
    devHandlers: [],
    // Experimental features for better error handling
    experimental: {
      wasm: false,
    },
    // Better error handling in development
    devErrorHandler: async (error, _event) => {
      // Check if this is a connection-related error
      if (error.message && (
        error.message.includes('ECONNRESET')
        || error.message.includes('EPIPE')
        || error.message.includes('write EPIPE')
        || error.message.includes('read ECONNRESET')
      )) {
        console.warn('Ignoring connection error:', error.message)
        return
      }

      // Log other errors
      console.error('Nitro dev error:', error)
    },
  },

  // Vite configuration to handle connection errors
  vite: {
    server: {
      // Prevent connection hanging
      hmr: {
        port: 24678,
      },
    },
  },

})
