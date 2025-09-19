// types/blogs.ts
// Estructuras fuertemente tipadas para manejar Blogs multi-idioma + SEO

export type BlogLanguageKey = "Español" | "Inglés" | "Portugués";

// Datos de contenido por idioma
export interface LanguageDataBlog {
  title: string;          // Título principal
  excerpt: string;        // Resumen corto / descripción corta
  content: string;        // Contenido completo (puede venir de un editor rich text / markdown)
  metaTitle: string;      // Meta <title> específico del idioma
  metaDescription: string;// Meta description específica del idioma
  category: string;       // Categoría en el idioma específico
  tags: string[];         // Tags en el idioma específico
}

// Estructura usada en el formulario en el front
export interface FormDataBlog {
  Español: LanguageDataBlog;
  Inglés: LanguageDataBlog;
  Portugués: LanguageDataBlog;
  cover_image_url: string;   // Imagen principal (Cloudinary)
  og_image_url?: string;     // Imagen específica para Open Graph (opcional, fallback a cover)
  slug: string;              // slug único (sin idioma, canonical)
  canonical_url?: string;    // URL canonical si aplica
  published: boolean;        // Estado de publicación
  order_number?: number;     // Para ordenar manualmente si se desea
  client_id?: string;        // Relación opcional a un cliente
  social_links?: SocialLinks; // Conjunto de enlaces sociales asociados al blog
}

// Representación de un registro traído desde la base de datos
export interface BlogRecord {
  id: string;
  slug: string;
  // Español
  title_spanish: string;
  excerpt_spanish: string;
  content_spanish: string;
  meta_title_spanish: string | null;
  meta_description_spanish: string | null;
  category_spanish: string | null;
  tags_spanish: string[] | null;
  // Inglés
  title_english: string | null;
  excerpt_english: string | null;
  content_english: string | null;
  meta_title_english: string | null;
  meta_description_english: string | null;
  category_english: string | null;
  tags_english: string[] | null;
  // Portugués
  title_portuguese: string | null;
  excerpt_portuguese: string | null;
  content_portuguese: string | null;
  meta_title_portuguese: string | null;
  meta_description_portuguese: string | null;
  category_portuguese: string | null;
  tags_portuguese: string[] | null;
  // Generales
  cover_image_url: string | null;
  og_image_url: string | null;
  canonical_url: string | null;
  published: boolean;
  published_at: string | null; // ISO date string
  order_number: number;
  client_id: string | null;
  social_links?: any; // JSONB en la base (se parsea a SocialLinks)
  created_at: string;
  updated_at: string;
}

// Interfaces para enlaces sociales
export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  x?: string; // Twitter/X
  linkedin?: string;
  // Lista de botones personalizados
  custom?: Array<{
    label: string;
    url: string;
    icon_url?: string; // Cloudinary u otro
  }>;
}

// Utilidad para inicializar el formulario vacío
// Categorías predefinidas multiidioma
export const BLOG_CATEGORIES = {
  "Tecnología": { es: "Tecnología", en: "Technology", pt: "Tecnologia" },
  "Retail": { es: "Retail", en: "Retail", pt: "Varejo" },
  "Marketing": { es: "Marketing", en: "Marketing", pt: "Marketing" },
  "Negocios": { es: "Negocios", en: "Business", pt: "Negócios" },
  "Salud": { es: "Salud", en: "Health", pt: "Saúde" },
  "Educación": { es: "Educación", en: "Education", pt: "Educação" },
  "Entretenimiento": { es: "Entretenimiento", en: "Entertainment", pt: "Entretenimento" },
  "Finanzas": { es: "Finanzas", en: "Finance", pt: "Finanças" },
  "Turismo": { es: "Turismo", en: "Tourism", pt: "Turismo" },
  "Gastronomía": { es: "Gastronomía", en: "Gastronomy", pt: "Gastronomia" }
};

export const emptyBlogFormData: FormDataBlog = {
  Español: { title: "", excerpt: "", content: "", metaTitle: "", metaDescription: "", category: "", tags: [] },
  Inglés: { title: "", excerpt: "", content: "", metaTitle: "", metaDescription: "", category: "", tags: [] },
  Portugués: { title: "", excerpt: "", content: "", metaTitle: "", metaDescription: "", category: "", tags: [] },
  cover_image_url: "",
  og_image_url: "",
  slug: "",
  canonical_url: "",
  published: false,
  order_number: 0,
  client_id: "",
  social_links: {}
};
