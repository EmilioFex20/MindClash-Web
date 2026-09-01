import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { AuthProvider } from '@/components/auth/auth-provider'
import { ConfigurationError } from '@/components/configuration-error'
import { firebaseConfigurationError } from '@/lib/firebase/env'
import './globals.css'

export const metadata: Metadata = {
  title: 'ICC Clash',
  description: 'Master computer science through gamified learning.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#008080',
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {firebaseConfigurationError ? (
          <ConfigurationError message={firebaseConfigurationError} />
        ) : (
          <AuthProvider>{children}</AuthProvider>
        )}
      </body>
    </html>
  )
}
