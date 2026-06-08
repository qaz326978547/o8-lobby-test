import { createI18n } from 'vue-i18n'
import zhTW from './zh-TW'
import enUS from './en-US'

export const i18n = createI18n({
  legacy: false,
  locale: 'zh-TW',
  fallbackLocale: 'en-US',
  messages: {
    'zh-TW': zhTW,
    'en-US': enUS,
  },
})
