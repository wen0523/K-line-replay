import { zhCN } from './zh-CN';
import { zhTW } from './zh-TW';
import { enUS } from './en-US';
import { jaJP } from './ja-JP';
import { koKR } from './ko-KR';
import { deDE } from './de-DE';
import { frFR } from './fr-FR';

export { zhCN, zhTW, enUS, jaJP, koKR, deDE, frFR };

export const languages = {
    'zh-CN': zhCN,
    'zh-TW': zhTW,
    'en-US': enUS,
    'ja-JP': jaJP,
    'ko-KR': koKR,
    'de-DE': deDE,
    'fr-FR': frFR,
} as const;

export type Language = keyof typeof languages;
export type TranslationKeys = keyof typeof zhCN;

// 使用方法
// import { languages, Language, TranslationKeys } from './i18n';

// // This will now work without errors
// const currentLang: Language = 'en-US';
// const translations = languages[currentLang];
// console.log(translations.time); // "Time:"