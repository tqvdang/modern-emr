'use client'

import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { trpc } from '@/lib/trpc'
import { httpBatchLink } from '@trpc/client'
import superjson from 'superjson'
import { Toaster } from 'react-hot-toast'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/lib/i18n'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors
              if (error?.data?.httpStatus >= 400 && error?.data?.httpStatus < 500) {
                return false
              }
              return failureCount < 3
            },
          },
          mutations: {
            retry: false,
          },
        },
      })
  )

  const [trpcClient] = useState(() =>
    trpc.createClient({
      transformer: superjson,
      links: [
        httpBatchLink({
          url: '/api/trpc',
          headers() {
            return {
              'x-client-type': 'web',
              'Accept-Language': i18n.language || 'en',
            }
          },
        }),
      ],
    })
  )

  // Initialize i18n on client side
  useEffect(() => {
    // Set up language detection from localStorage
    const savedLanguage = localStorage.getItem('language')
    if (savedLanguage && ['en', 'vi'].includes(savedLanguage)) {
      i18n.changeLanguage(savedLanguage)
      document.documentElement.lang = savedLanguage
    }

    // Update document direction for RTL languages (not needed for vi/en but good practice)
    const updateDirection = (lng: string) => {
      document.documentElement.dir = ['ar', 'he', 'fa'].includes(lng) ? 'rtl' : 'ltr'
    }

    updateDirection(i18n.language)
    i18n.on('languageChanged', updateDirection)

    return () => {
      i18n.off('languageChanged', updateDirection)
    }
  }, [])

  return (
    <I18nextProvider i18n={i18n}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              className: 'text-sm',
              style: {
                background: '#fff',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </QueryClientProvider>
      </trpc.Provider>
    </I18nextProvider>
  )
}