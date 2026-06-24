/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SCRAMJET_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
