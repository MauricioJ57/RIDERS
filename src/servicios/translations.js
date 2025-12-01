import { DE, EN, ES, PT } from "../traducciones/languages";

//funcion para setear el idioma
export function setLanguage(lang) {
  localStorage.setItem("language", lang);
  language = lang;
}

//funcion para obtener el idioma guardado
export function getSavedLanguage() {
  return localStorage.getItem("language") || ES;
}

const PROJECT_ID = "3490b08b-fc92-44e2-b460-b6858508ed10";
let translations = null;
let language = ES;

//funcion para obtener las traducciones desde la API de Traducila
export async function getTranslations(lang, callback) {
  setLanguage(lang);
  localStorage.removeItem("translations");
  translations = null;
  language = lang;
  if (language === ES) {
    return callback ? callback() : false;
  }

  // Check if VITE_MODE is set to 'arcade' to prevent external fetch calls
  const mode = import.meta.env.VITE_MODE;
  if (mode === 'arcade') {
    console.warn('VITE_MODE is set to "arcade". External fetch to Traducila API is disabled.');
    if (callback) callback();
    return;
  }

  // funcion que extrae las traducciones desde la API de Traducila
  return await fetch(
    `https://traducila.vercel.app/api/translations/${PROJECT_ID}/${language}`
  )
    .then((response) => response.json())
    .then((data) => {
      localStorage.setItem("translations", JSON.stringify(data));
      translations = data;
      if (callback) callback();
    });
}

//funcion para obtener una frase traducida por su key
export function getPhrase(key) {
  if (!translations) {
    const locals = localStorage.getItem("translations");
    translations = locals ? JSON.parse(locals) : null;
  }

  let phrase = key;
  const keys = translations?.data?.words;
  if (keys && Array.isArray(keys)) {
    const translation = keys.find((item) => item.key === key);
    if (translation && translation.translate) {
      phrase = translation.translate;
    }
  }

  return phrase;
}

// funcion para verificar el idioma disponibke
function isAllowedLanguage(language) {
  const allowedLanguages = [ES, EN, PT, DE];
  return allowedLanguages.includes(language);
}

export function getLanguageConfig() {
  let languageConfig;

  // Obtener desde la URL el idioma
  console.log(window.location.href);

  const path =
    window.location.pathname !== "/" ? window.location.pathname : null;
  const params = new URL(window.location.href).searchParams;
  const queryLang = params.get("lang");

  languageConfig = path ?? queryLang;

  if (languageConfig) {
    if (isAllowedLanguage(languageConfig)) {
      return languageConfig;
    }
  }

  const browserLanguage = window.navigator.language;
  if (isAllowedLanguage(browserLanguage)) {
    return browserLanguage;
  }

  return ES;
}