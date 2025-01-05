import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node'
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useHref,
  useNavigate,
  useRouteError,
  useRouteLoaderData,
} from '@remix-run/react'

import { NextUIProvider } from '@nextui-org/react'

import { ErrorMessage } from '~/components/ErrorMessage'
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
  const data = useRouteLoaderData<typeof loader>('root')
  const navigate = useNavigate()

  return (
    <html lang={data?.locale} className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <NextUIProvider navigate={navigate} useHref={useHref}>
          <LocaleContext.Provider value={data?.locale}>
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

export function ErrorBoundary() {
  const error = useRouteError()

  let errorMessage: React.ReactNode
  if (isRouteErrorResponse(error)) {
    errorMessage = <ErrorMessage title={`${error.status} ${error.statusText}`} message={error.data} />
  } else if (error instanceof Error) {
    errorMessage = <ErrorMessage title="Error" message={error.message} />
  } else {
    errorMessage = <ErrorMessage title="Unknown Error" />
  }
  return <div className="h-screen w-full p-4">{errorMessage}</div>
}
