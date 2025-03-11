// types/clients.ts
export interface ClientItem {
  id: string;
  name_spanish: string;
  job_title_spanish: string;
  description_spanish: string;
  name_english: string;
  job_title_english: string;
  description_english: string;
  name_portuguese: string;
  job_title_portuguese: string;
  description_portuguese: string;
  media_url: string;
}

export interface ClientsRecord {
  id: string;
  name_spanish?: string;
  job_title_spanish?: string;
  description_spanish?: string;

  name_english?: string;
  job_title_english?: string;
  description_english?: string;

  name_portuguese?: string;
  job_title_portuguese?: string;
  description_portuguese?: string;

  media_url?: string;
  order_number: number;
  // ... cualquier otro campo
}

export interface ClientData {
  id: string;
  name_spanish: string | null; // o string | undefined
  country_spanish: string | null;
  job_title_spanish: string | null;
  description_spanish: string | null;
  name_english: string | null;
  country_english: string | null;
  job_title_english: string | null;
  description_english: string | null;
  name_portuguese: string | null;
  country_portuguese: string | null;
  job_title_portuguese: string | null;
  description_portuguese: string | null;
  media_url: string | null;
}

// types/clients.ts

export interface LanguageDataClients {
  name: string;
  job_title: string;
  description: string;
}

export interface FormDataClients {
  Español: LanguageDataClients;
  Inglés: LanguageDataClients;
  Portugués: LanguageDataClients;
  media_url: string;
}
