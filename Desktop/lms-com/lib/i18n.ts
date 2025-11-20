import { Locale } from '@/i18n/config'
import enMessages from '@/i18n/messages/en.json'
import ruMessages from '@/i18n/messages/ru.json'

const messages = {
  en: enMessages,
  ru: ruMessages,
}

export function getTranslations(locale: Locale = 'en') {
  return messages[locale] || messages.en
}

export function t(key: string, locale: Locale = 'en'): string {
  const keys = key.split('.')
  let value: any = messages[locale] || messages.en
  
  for (const k of keys) {
    value = value?.[k]
    if (value === undefined) {
      // Fallback to English
      value = messages.en
      for (const k2 of keys) {
        value = value?.[k2]
      }
      break
    }
  }
  
  return value || key
}

