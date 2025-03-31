// types/tailor.ts
export type LanguageKey = "Español" | "Inglés" | "Portugués";

export interface LanguageData {
  title: string;
  subtitle: string;
  description: string;
}

export interface TailorMadeItem {
  id: string;
  title_spanish?: string;
  subtitle_spanish?: string;
  description_spanish?: string;
  title_english?: string;
  subtitle_english?: string;
  description_english?: string;
  title_portuguese?: string;
  subtitle_portuguese?: string;
  description_portuguese?: string;
  image?: string;
  order: number;
}

export interface FormDataTailor {
  Español: LanguageData;
  Inglés: LanguageData;
  Portugués: LanguageData;
  image: string;
}
