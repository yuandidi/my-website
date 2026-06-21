import type { Metadata } from 'next'
import { WEB_ROUTES } from '@my-blog/shared'
import { SiteHeader } from '@/components/layout/site-header'
import { SITE_DESCRIPTION, SITE_NAME } from '@lib/seo'
import { getConfiguredSiteUrl } from '@lib/site-url'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(getConfiguredSiteUrl()),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  alternates: {
    types: {
      'application/rss+xml': [
        { url: WEB_ROUTES.feed, title: `${SITE_NAME} RSS` },
      ],
    },
  },
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
            <main className="pt-[var(--site-header-height)]">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
