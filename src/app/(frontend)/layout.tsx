import type { Metadata } from 'next'
import Script from 'next/script'
import { Fraunces, IBM_Plex_Mono, Instrument_Sans, Noto_Serif_JP } from 'next/font/google'
import React from 'react'
import { BodyCustomCode, renderHeadCustomCode } from '@/lib/make-custom-code'
import { makeSiteSettings, sanitizeHtmlAttribute } from '@/lib/make-site-settings'
import './styles.css'

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces' })
const instrument = Instrument_Sans({ subsets: ['latin'], variable: '--font-instrument' })
const plex = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex' })
const noto = Noto_Serif_JP({ subsets: ['latin'], weight: ['500', '600'], variable: '--font-noto' })

const title = makeSiteSettings.title ?? 'Marginalia'
const description =
  makeSiteSettings.description ?? 'A quiet language study notebook for words you actually meet.'
const favicon = makeSiteSettings.icons?.icon ?? '/favicon.svg'
const socialImage = makeSiteSettings.openGraph?.image
const googleAnalyticsId = sanitizeHtmlAttribute(makeSiteSettings.analytics?.googleAnalyticsId)

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: title, template: `%s · ${title}` },
  description,
  icons: favicon ? { icon: favicon } : undefined,
  openGraph: { title, description, images: socialImage ? [socialImage] : undefined },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const customScripts = makeSiteSettings.customScripts
  return (
    <html
      className={`${fraunces.variable} ${instrument.variable} ${plex.variable} ${noto.variable}`}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        {renderHeadCustomCode(customScripts?.headStart, 'head-start')}
        {renderHeadCustomCode(customScripts?.headEnd, 'head-end')}
      </head>
      <body>
        <BodyCustomCode html={customScripts?.bodyStart} />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
        {googleAnalyticsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="figma-google-analytics" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config',${JSON.stringify(googleAnalyticsId)});`}
            </Script>
          </>
        )}
        <BodyCustomCode html={customScripts?.bodyEnd} />
      </body>
    </html>
  )
}
