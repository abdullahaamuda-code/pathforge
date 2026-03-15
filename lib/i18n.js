import en from "@/messages/en.json";
import fr from "@/messages/fr.json";

const messages = { en, fr };

export function t(language, key) {
  const keys = key.split(".");
  const lang = messages[language] || messages.en;
  let value = lang;
  for (const k of keys) {
    value = value?.[k];
    if (!value) break;
  }
  if (!value) {
    let fallback = messages.en;
    for (const k of keys) {
      fallback = fallback?.[k];
      if (!fallback) break;
    }
    return fallback || key;
  }
  return value;
}

export function interpolate(str, vars) {
  return str.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}
