/// <reference types="vite/client" />
interface ImportMetaEnv {
  VITE_BACKEND_API_URL: string;
  VITE_BACKEND_API_USERNAME: string;
  VITE_BACKEND_API_PASSWORD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
