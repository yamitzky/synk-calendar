import acceptLanguage from 'accept-language-parser'

export function getLocaleFromAcceptLanguage(header: string | null): string | undefined {
  if (!header) {
    return undefined
  }
  const language = acceptLanguage.parse(header)[0]
  if (language?.region) {
    return `${language.code}-${language.region.toUpperCase()}`
  }
  return language?.code
}
