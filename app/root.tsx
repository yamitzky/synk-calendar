import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node'
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from '@remix-run/react'

import { NextUIProvider } from '@nextui-org/react'

import { LocaleContext } from '~/hooks/useLocale'
import { getLocaleFromAcceptLanguage } from '~/utils/locale'
import stylesheet from './tailwind.css?url'

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
  { rel: 'stylesheet', href: stylesheet },
]

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const locale = getLocaleFromAcceptLanguage(request.headers.get('Accept-Language'))
  return { locale }
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { locale } = useLoaderData<typeof loader>()

  return (
    <html lang={locale === 'ja' ? 'ja' : 'en'} className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <NextUIProvider>
          <LocaleContext.Provider value={locale}>
            {children}
            <ScrollRestoration />
            <Scripts />
          </LocaleContext.Provider>
        </NextUIProvider>
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}
