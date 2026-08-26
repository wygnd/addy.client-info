export const API_ADDY_URL = import.meta.env.VITE_ADDY_BACKEND_API_URL;

export const API_BITRIX_URL = import.meta.env.VITE_BITRIX_BACKEND_API_URL;

export const API_LIMIT_POSTS = 30;

export const API_AUTH_KEY = btoa(
  `${import.meta.env.VITE_ADDY_BACKEND_API_USERNAME}:${import.meta.env.VITE_ADDY_BACKEND_API_PASSWORD}`,
);
