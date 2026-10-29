import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Economía para Todos — Demo',
  description: 'Demo interactivo de Economía para Todos y el Centro Nacional de Gestión.',
  generator: 'v0.app',
  icons: { icon: { url: '/icon.svg?v=bolivia', type: 'image/svg+xml' } },
  other: { 'darkreader-lock': 'true' },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#fbf8f1',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="bg-[#fbf8f1]">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
