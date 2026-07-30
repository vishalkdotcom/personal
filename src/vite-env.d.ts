/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HIRE_SIGNAL?: string;
  /** GA4 measurement ID (e.g. G-XXXXXXXXXX). Blank/unset disables analytics. */
  readonly VITE_GOOGLE_ANALYTICS_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
