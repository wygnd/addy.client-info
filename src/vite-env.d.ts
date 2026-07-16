/// <reference types="vite/client" />
interface ImportMetaEnv {
  VITE_ADDY_BACKEND_API_URL: string;
  VITE_ADDY_BACKEND_API_USERNAME: string;
  VITE_ADDY_BACKEND_API_PASSWORD: string;

  VITE_BITRIX_BACKEND_API_URL: string;
  VITE_BITRIX_BACKEND_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
