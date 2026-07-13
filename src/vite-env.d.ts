/// <reference types="vite/client" />
interface ImportMetaEnv {
  VITE_BACKEND_API_URL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
