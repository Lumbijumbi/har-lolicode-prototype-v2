import './globals.css'
import type { Metadata } from 'next'
import { ReduxProvider } from '@/components/providers/ReduxProvider'

export const metadata: Metadata = {
  title: 'HAR2LoliCode',
  description: 'Convert HAR files to executable LoliCode scripts for OpenBullet 2',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  )
}
