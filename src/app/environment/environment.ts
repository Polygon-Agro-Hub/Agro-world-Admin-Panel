export const environment = {
  API_URL: (window["env"] as { apiUrl: string }).apiUrl || "default",
  API_BASE_URL:
    (window["env"] as { apiBaseUrl: string }).apiBaseUrl || "default",
};
