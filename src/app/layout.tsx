import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/lib/providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Coinbroo'

export const metadata: Metadata = {
  title: `${APP_NAME} — Hyperliquid Perps`,
  description: `Trade perpetual futures on Hyperliquid with ${APP_NAME}`,
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-bg-primary text-text-primary antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
