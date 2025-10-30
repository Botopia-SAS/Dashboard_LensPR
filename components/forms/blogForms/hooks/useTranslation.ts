import { useState } from "react";
import { FormDataBlog, BlogLanguageKey } from "../../../../types/blogs";

// Utilidad para dividir texto para API free de traducción
function chunkString(str: string, size: number): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < str.length) {
    chunks.push(str.slice(i, i + size));
    i += size;
  }
  return chunks;
}

// Función de traducción
async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  if (!text?.trim()) return text;

  try {
    const chunks = chunkString(text, 500);
    let result = "";

    for (const chunk of chunks) {
      const emailParam = process.env.NEXT_PUBLIC_MYMEMORY_EMAIL
        ? `&de=${encodeURIComponent(process.env.NEXT_PUBLIC_MYMEMORY_EMAIL)}`
        : "";
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
          chunk
        )}&langpair=${sourceLang}|${targetLang}${emailParam}`
      );
      const data = await response.json();
      result += data.responseData.translatedText || chunk;
    }

    return result;
  } catch (error) {
    console.error("Error al traducir:", error);
    return text;
  }
}

export const useTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);

  const translateContent = async (
    formData: FormDataBlog,
    sourceLang: BlogLanguageKey
  ): Promise<FormDataBlog> => {
    setIsTranslating(true);

    try {
      const updated = { ...formData };
      const langMap: Record<BlogLanguageKey, string> = {
        Español: "es",
        Inglés: "en",
        Portugués: "pt",
      };

      const source = langMap[sourceLang];

      // Traducir campos de texto
      const fieldsToTranslate = [
        "title",
        "excerpt",
        "content",
        "metaTitle",
        "metaDescription",
        "category",
      ] as const;

      for (const field of fieldsToTranslate) {
        const originalText = (updated[sourceLang][field] as string) || "";

        if (originalText.trim()) {
          for (const targetLang of [
            "Español",
            "Inglés",
            "Portugués",
          ] as const) {
            if (targetLang !== sourceLang) {
              const target = langMap[targetLang];
              updated[targetLang][field] = (await translateText(
                originalText,
                source,
                target
              )) as string;
            }
          }
        }
      }

      // Traducir tags
      const sourceTags = updated[sourceLang].tags || [];
      if (sourceTags.length > 0) {
        for (const targetLang of ["Español", "Inglés", "Portugués"] as const) {
          if (targetLang !== sourceLang) {
            const target = langMap[targetLang];
            const translatedTags: string[] = [];

            for (const tag of sourceTags) {
              if (tag?.trim()) {
                const translatedTag = await translateText(tag, source, target);
                translatedTags.push(translatedTag);
              }
            }

            updated[targetLang].tags = translatedTags;
          }
        }
      }

      return updated;
    } catch (error) {
      console.error("Error en traducción completa:", error);
      return formData;
    } finally {
      setIsTranslating(false);
    }
  };

  return {
    isTranslating,
    translateContent,
  };
};
