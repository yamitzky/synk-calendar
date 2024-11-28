import { describe, it, expect } from 'vitest'
import { getLocaleFromAcceptLanguage } from './locale'

describe('getLocaleFromAcceptLanguage', () => {
  it('returns undefined for null input', () => {
    expect(getLocaleFromAcceptLanguage(null)).toBeUndefined()
  })

  it('returns the correct locale for a simple language code', () => {
    expect(getLocaleFromAcceptLanguage('en')).toBe('en')
  })

  it('returns the correct locale for a language code with region', () => {
    expect(getLocaleFromAcceptLanguage('en-US')).toBe('en-US')
  })

  it('returns the correct locale for a complex Accept-Language header', () => {
    expect(getLocaleFromAcceptLanguage('en-US,en;q=0.9,ja;q=0.8')).toBe('en-US')
  })

  it('handles lowercase region codes', () => {
    expect(getLocaleFromAcceptLanguage('en-us')).toBe('en-US')
  })

  it('returns only the language code when no region is specified', () => {
    expect(getLocaleFromAcceptLanguage('fr;q=0.8,en-US;q=0.7,en;q=0.6')).toBe('fr')
  })
})
