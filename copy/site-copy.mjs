// Landing-page copy source.
// Keep communication jobs in site-spec and locale-native strings in copy/locales.

import { SITE_COPY_SPECS } from "./site-spec.mjs";
import { SITE_LOCALES, SUPPORTED_SITE_LANGUAGES } from "./registry.mjs";

export { SITE_COPY_SPECS, SITE_LOCALES, SUPPORTED_SITE_LANGUAGES };

export const SITE_COPY = Object.fromEntries(
  Object.entries(SITE_COPY_SPECS).map(([key, spec]) => [
    key,
    {
      ...spec,
      ...Object.fromEntries(
        SUPPORTED_SITE_LANGUAGES.map((language) => [language, SITE_LOCALES[language].messages[key]])
      )
    }
  ])
);
