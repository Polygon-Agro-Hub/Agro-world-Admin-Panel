// export const environment = {
//   API_URL: (window["env"] as { apiUrl: string }).apiUrl || "default",
//   API_BASE_URL:
//     (window["env"] as { apiBaseUrl: string }).apiBaseUrl || "default",
// };

export const environment = {
  production: true,
  API_BASE_URL: 'http://localhost:3000/api/auth/',
  API_URL: 'http://localhost:3000/api/',
  // API_BASE_URL: 'https://backend.agroworld.lk/api/auth/',
  TOKEN: localStorage.getItem('Login Token : '),
};
