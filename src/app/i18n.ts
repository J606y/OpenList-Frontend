import * as i18n from "@solid-primitives/i18n"
import { createResource, createSignal } from "solid-js"
export { i18n }

// glob search by Vite
const langs = import.meta.glob("~/lang/*/index.json", {
  eager: true,
  import: "lang",
})

// all available languages (English is kept only as the internal type/source
// base — it is filtered out so it never appears as a selectable UI language)
export const languages = Object.keys(langs)
  .map((langPath) => {
    const langCode = langPath.split("/")[3]
    const langName = langs[langPath] as string
    return { code: langCode, lang: langName }
  })
  .filter((lang) => lang.code !== "en")

// match the browser language against the selectable (Chinese-only) languages
const userLang = navigator.language.toLowerCase()
const browserLang =
  languages.find((lang) => lang.code.toLowerCase() === userLang)?.code ||
  languages.find(
    (lang) => lang.code.toLowerCase().split("-")[0] === userLang.split("-")[0],
  )?.code

// This fork defaults to Simplified Chinese: use the browser's Chinese variant
// when available, otherwise zh-CN.
const fallbackLang = browserLang ?? "zh-CN"

// An explicit, still-valid stored choice wins; otherwise use the fallback.
// (A stale value such as a previously selected "en" is rejected here.)
const storedLang = localStorage.getItem("lang")
export let initialLang =
  storedLang && languages.some((lang) => lang.code === storedLang)
    ? storedLang
    : fallbackLang

// Type imports
// use `type` to not include the actual dictionary in the bundle
import type * as en from "~/lang/en/entry"

export type Lang = keyof typeof langs
export type RawDictionary = typeof en.dict
export type Dictionary = i18n.Flatten<RawDictionary>

// Fetch and flatten the dictionary
const fetchDictionary = async (locale: Lang): Promise<Dictionary> => {
  try {
    const dict: RawDictionary = (await import(`~/lang/${locale}/entry.ts`)).dict
    return i18n.flatten(dict) // Flatten dictionary for easier access to keys
  } catch (err) {
    console.error(`Error loading dictionary for locale: ${locale}`, err)
    throw new Error(`Failed to load dictionary for ${locale}`)
  }
}

// Signals to track current language and dictionary state
export const [currentLang, setCurrentLang] = createSignal<Lang>(initialLang)

export const [dict] = createResource(currentLang, fetchDictionary)
