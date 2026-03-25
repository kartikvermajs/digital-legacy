export const getEndpoint = (path: string) => `/api${path}`;

export const fetchApi = async (path: string, options: RequestInit = {}) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = new Headers(options.headers || {});
  
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(getEndpoint(path), { ...options, headers });
  
  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {}
    throw new Error(errorMessage);
  }
  
  return response.json();
};

export const api = {
  auth: {
    me: () => fetchApi("/auth/me"),
    update: (data: any) => fetchApi("/user/update", { method: "PUT", body: JSON.stringify(data) }),
  },
  personas: {
    list: () => fetchApi("/personas"),
    create: (data: any) => fetchApi("/personas", { method: "POST", body: JSON.stringify(data) }),
  },
  avatar: {
    upload: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return fetchApi("/avatar/upload", { method: "POST", body: formData });
    }
  },
  session: {
    create: (data: any) => fetchApi("/session/create", { method: "POST", body: JSON.stringify(data) }),
  }
};
