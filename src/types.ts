import type { i18n } from './i18n'

export type ConsistencyPrompt = (typeof i18n)[keyof typeof i18n]
