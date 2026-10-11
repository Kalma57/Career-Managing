import raw from './content.json'
import type { Content } from './types'

// JSON imports widen string literals (e.g. "self" becomes string), so the
// compiler can't check content.json against Content on its own.
// content.test.ts validates the actual values instead.
export const content = raw as Content
