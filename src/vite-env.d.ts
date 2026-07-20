/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HIRE_SIGNAL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
