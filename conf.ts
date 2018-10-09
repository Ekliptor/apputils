
// from http://sphinxsearch.com/docs/current/conf-phrase-boundary.html plus some more chars
// see https://www.cs.tut.fi/~jkorpela/dashes.html for hypthens and minus signs
export const WORD_SEPARATOR_CHARS = '\\.,\\?! \u2026:;\\-+_‐‑‒–—―−﹘﹣－\\[\\]=/\\(\\)\\{\\}'
export const WORD_SEPARATOR_REGEX = '[' + WORD_SEPARATOR_CHARS + ']' // don't add chars like ' because they usually mean it's the same word
export const WORD_SEPARATOR_BEGIN = '(^|[' + WORD_SEPARATOR_CHARS + '])'
export const WORD_SEPARATOR_END = '([' + WORD_SEPARATOR_CHARS + ']|$)'

export const WORD_SEPARATORS_SEARCH = '[ ,\\.\\-\\*_/\"\\<\\>\\|:;#+~!%&§\\(\\)\\{\\}\\?\\[\\]=]'
export const UMLAUT_REPLACEMENTS = {'Ä': 'Ae', 'Ö': 'Oe', 'Ü': 'Ue', 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss'}

// http://www.youneeditall.com/web-design-and-development/file-extensions.html
export const IMAGE_EXTENSIONS = 'jpg|jpeg|bmp|ico|png|webp|gif|psd|tif|ps|svg'
export const IMAGE_EXT_REGEX = '\.(' + IMAGE_EXTENSIONS + ')$'

export const VIDEO_EXTENSIONS = 'mp4|mov|mpg|mpeg|avi|divx|wmv|vob|swf|rm|flv|asx|asf|3gp|3g2'
export const VIDEO_EXT_REGEX = '\.(' + VIDEO_EXTENSIONS + ')$'