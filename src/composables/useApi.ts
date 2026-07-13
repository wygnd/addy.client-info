export const useApi = async <T = unknown>(
  url: string,
  config?: RequestInit,
) => {
  let error = "",
    data: T | null = null;

  const response = await fetch(url, config);

  if (response.ok) {
    data = (await response.json()) as T;
  } else {
    error = `Сервер вернул ошибку ${response.status}: ${response.statusText}`;
  }

  return { data, error };
};
