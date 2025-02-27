// types/clients.ts
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
