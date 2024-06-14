export const binBaseUrl = (url?: string) =>
  import.meta.env.VITE_BIN_URL + "/api" + url;
