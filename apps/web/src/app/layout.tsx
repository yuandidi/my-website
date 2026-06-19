import type { Metadata } from 'next'
import { SiteHeader } from '@/components/layout/site-header'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: '迪迪の秘密小屋',
  description: '迪迪の秘密小屋',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;600&family=ZCOOL+KuaiLe&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <div className="fantasy-bg min-h-screen">
            <SiteHeader />
            <main>{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
