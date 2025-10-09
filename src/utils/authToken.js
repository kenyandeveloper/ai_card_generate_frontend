// Single place to read/write the JWT so apiClient & UserContext agree.
const TOKEN_KEY = "authToken";

export function getToken() {
  return (
    localStorage.getItem(TOKEN_KEY) || "" // no token
  );
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export { TOKEN_KEY };
