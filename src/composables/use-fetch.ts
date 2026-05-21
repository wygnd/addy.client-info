interface IFetchResponse<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

export async function useFetch<T>(url: string): Promise<IFetchResponse<T>> {
  const fullUrl = import.meta.env.VITE_API_BASE_URL + url;

  let data: T | null = null;
  let isLoading: boolean = false;
  let error: string | null = null;

  isLoading = true;

  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        Authorization: `bga ${import.meta.env.VITE_API_AUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Bitrix Gateway Api failed with status ${response.status}: ${response.statusText}`,
      );
    }

    return {
      data: (data = (await response.json()) as T),
      error: null,
      isLoading: isLoading,
    };
  } catch (err) {
    let messageError: string;

    switch (true) {
      case err instanceof Error:
        messageError = err.message;
        break;

      default:
        messageError = "Неизвестная ошибка";
    }

    error = messageError;
  } finally {
    isLoading = false;
  }

  return {
    data,
    isLoading,
    error,
  };
}
