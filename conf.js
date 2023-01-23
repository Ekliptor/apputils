"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VIDEO_EXT_REGEX = exports.VIDEO_EXTENSIONS = exports.IMAGE_EXT_REGEX = exports.IMAGE_EXTENSIONS = exports.UMLAUT_REPLACEMENTS = exports.WORD_SEPARATORS_SEARCH = exports.WORD_SEPARATOR_END = exports.WORD_SEPARATOR_BEGIN = exports.WORD_SEPARATOR_REGEX = exports.WORD_SEPARATOR_CHARS = void 0;
// from http://sphinxsearch.com/docs/current/conf-phrase-boundary.html plus some more chars
// see https://www.cs.tut.fi/~jkorpela/dashes.html for hypthens and minus signs
exports.WORD_SEPARATOR_CHARS = '\\.,\\?! \u2026:;\\-+_‐‑‒–—―−﹘﹣－\\[\\]=/\\(\\)\\{\\}';
exports.WORD_SEPARATOR_REGEX = '[' + exports.WORD_SEPARATOR_CHARS + ']'; // don't add chars like ' because they usually mean it's the same word
exports.WORD_SEPARATOR_BEGIN = '(^|[' + exports.WORD_SEPARATOR_CHARS + '])';
exports.WORD_SEPARATOR_END = '([' + exports.WORD_SEPARATOR_CHARS + ']|$)';
exports.WORD_SEPARATORS_SEARCH = '[ ,\\.\\-\\*_/\"\\<\\>\\|:;#+~!%&§\\(\\)\\{\\}\\?\\[\\]=]';
exports.UMLAUT_REPLACEMENTS = { 'Ä': 'Ae', 'Ö': 'Oe', 'Ü': 'Ue', 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' };
// http://www.youneeditall.com/web-design-and-development/file-extensions.html
exports.IMAGE_EXTENSIONS = 'jpg|jpeg|bmp|ico|png|webp|gif|psd|tif|ps|svg';
exports.IMAGE_EXT_REGEX = '\.(' + exports.IMAGE_EXTENSIONS + ')$';
exports.VIDEO_EXTENSIONS = 'mp4|mov|mpg|mpeg|avi|divx|wmv|vob|swf|rm|flv|asx|asf|3gp|3g2';
exports.VIDEO_EXT_REGEX = '\.(' + exports.VIDEO_EXTENSIONS + ')$';
//# sourceMappingURL=conf.js.map