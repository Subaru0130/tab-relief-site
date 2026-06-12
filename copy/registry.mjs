import { MESSAGES as enMessages } from "./locales/en.mjs";
import { MESSAGES as jaMessages } from "./locales/ja.mjs";

export const SITE_LOCALES = {
  en: {
    label: "English",
    nativeName: "English",
    direction: "ltr",
    status: "production-supported",
    messages: enMessages
  },
  ja: {
    label: "Japanese",
    nativeName: "日本語",
    direction: "ltr",
    status: "production-supported",
    messages: jaMessages
  }
};

export const SUPPORTED_SITE_LANGUAGES = Object.freeze(
  Object.keys(SITE_LOCALES).filter((language) => (
    ["production-supported", "native-reviewed"].includes(SITE_LOCALES[language].status)
  ))
);
