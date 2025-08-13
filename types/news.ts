// types/news.ts
export interface LanguageDataNews {
  title: string;
  description: string;
  editorial: string;
}

export interface FormDataNews {
  Español: LanguageDataNews;
  Inglés: LanguageDataNews;
  Portugués: LanguageDataNews;
  media_url: string; // la URL final de Cloudinary
  news_link?: string; // ⬅ Agregamos esta línea
  client_id?: string; // ⬅ Agregamos el ID del cliente
}
