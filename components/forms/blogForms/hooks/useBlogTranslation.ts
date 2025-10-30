import { useState } from "react";
import { FormDataBlog, BlogLanguageKey, LanguageDataBlog } from "../../../../types/blogs";

/**
 * Hook personalizado para traducción de blogs usando Google Translate API
 * Este hook es específico para la sección de blogs y no afecta otras secciones
 */

// Mapa de idiomas
const LANG_MAP: Record<BlogLanguageKey, string> = {
  Español: "es",
  Inglés: "en",
  Portugués: "pt",
};

const TARGET_LANGUAGES: readonly BlogLanguageKey[] = ["Español", "Inglés", "Portugués"] as const;

// Campos de texto a traducir
const FIELDS_TO_TRANSLATE: readonly (keyof LanguageDataBlog)[] = [
  "title",
  "excerpt",
  "content",
  "metaTitle",
  "metaDescription",
  "category",
] as const;

// Función para traducir usando Google Translate API
async function translateTextWithGoogle(
  text: string,
  targetLang: string,
  apiKey: string
): Promise<string> {
  if (!text?.trim()) return text;

  try {
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        target: targetLang,
        format: 'text'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Error de Google Translate:", error);
      throw new Error(`Error ${response.status}: ${error.error?.message || 'Error desconocido'}`);
    }

    const data = await response.json();
    return data.data.translations[0].translatedText || text;
  } catch (error) {
    console.error("Error al traducir con Google Translate:", error);
    throw error;
  }
}

// Función auxiliar para traducir un campo específico
async function translateField(
  text: string,
  targetLangCode: string,
  apiKey: string,
  fieldName: string,
  targetLang: BlogLanguageKey
): Promise<string> {
  try {
    return await translateTextWithGoogle(text, targetLangCode, apiKey);
  } catch (error) {
    console.error(`Error traduciendo ${fieldName} a ${targetLang}:`, error);
    return "";
  }
}

// Función auxiliar para traducir tags
async function translateTags(
  tags: string[],
  targetLangCode: string,
  apiKey: string,
  targetLang: BlogLanguageKey
): Promise<string[]> {
  const translatedTags: string[] = [];

  for (const tag of tags) {
    if (tag?.trim()) {
      try {
        const translatedTag = await translateTextWithGoogle(tag, targetLangCode, apiKey);
        translatedTags.push(translatedTag);
      } catch (error) {
        console.error(`Error traduciendo tag "${tag}" a ${targetLang}:`, error);
        translatedTags.push(tag);
      }
    }
  }

  return translatedTags;
}

export const useBlogTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  const validateApiKey = (): string | null => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY;
    if (!apiKey || apiKey === 'your_google_translate_api_key_here') {
      return null;
    }
    return apiKey;
  };

  const translateContent = async (
    formData: FormDataBlog,
    sourceLang: BlogLanguageKey
  ): Promise<FormDataBlog> => {
    setIsTranslating(true);
    setTranslationError(null);

    const apiKey = validateApiKey();
    if (!apiKey) {
      setTranslationError(
        'No se ha configurado la API Key de Google Translate. Por favor, configura NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY en tu archivo .env.local'
      );
      setIsTranslating(false);
      return formData;
    }

    try {
      const updated = { ...formData };

      // Traducir campos de texto para cada idioma destino
      for (const field of FIELDS_TO_TRANSLATE) {
        const originalText = String(updated[sourceLang][field] || "");

        if (originalText.trim()) {
          await translateFieldForAllLanguages(
            updated,
            sourceLang,
            field,
            originalText,
            apiKey
          );
        }
      }

      // Traducir tags
      const sourceTags = updated[sourceLang].tags || [];
      if (sourceTags.length > 0) {
        await translateTagsForAllLanguages(updated, sourceLang, sourceTags, apiKey);
      }

      return updated;
    } catch (error) {
      console.error("Error en traducción completa:", error);
      setTranslationError(
        error instanceof Error ? error.message : "Error desconocido durante la traducción"
      );
      return formData;
    } finally {
      setIsTranslating(false);
    }
  };

  const translateFieldForAllLanguages = async (
    updated: FormDataBlog,
    sourceLang: BlogLanguageKey,
    field: keyof LanguageDataBlog,
    originalText: string,
    apiKey: string
  ): Promise<void> => {
    for (const targetLang of TARGET_LANGUAGES) {
      if (targetLang !== sourceLang) {
        const targetCode = LANG_MAP[targetLang];
        const translatedText = await translateField(
          originalText,
          targetCode,
          apiKey,
          String(field),
          targetLang
        );
        // Type assertion necesaria porque field puede ser string o string[]
        // pero en este contexto solo traducimos campos string (no tags)
        (updated[targetLang][field] as string) = translatedText;
      }
    }
  };

  const translateTagsForAllLanguages = async (
    updated: FormDataBlog,
    sourceLang: BlogLanguageKey,
    sourceTags: string[],
    apiKey: string
  ): Promise<void> => {
    for (const targetLang of TARGET_LANGUAGES) {
      if (targetLang !== sourceLang) {
        const targetCode = LANG_MAP[targetLang];
        const translatedTags = await translateTags(
          sourceTags,
          targetCode,
          apiKey,
          targetLang
        );
        updated[targetLang].tags = translatedTags;
      }
    }
  };

  return {
    isTranslating,
    translationError,
    translateContent,
  };
};
