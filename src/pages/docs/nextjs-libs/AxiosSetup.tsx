import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Installation", href: "#installation", level: 2 },
  { title: "Instance configurée", href: "#instance", level: 2 },
  { title: "Intercepteurs", href: "#interceptors", level: 2 },
  { title: "Hooks personnalisés", href: "#hooks", level: 2 },
  { title: "Gestion des erreurs", href: "#errors", level: 2 },
  { title: "Upload de fichiers", href: "#upload", level: 2 },
];

const installCode = `npm install axios`;

const instanceCode = `// src/lib/api-client.ts
import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export default apiClient;`;

const interceptorsCode = `// src/lib/api-client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./auth";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// ✅ Intercepteur requête : injecter le token JWT
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Intercepteur réponse : rafraîchir le token si 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = getRefreshToken();

      if (refreshToken) {
        try {
          const { data } = await axios.post(
            \`\${process.env.NEXT_PUBLIC_API_URL}/auth/token/refresh/\`,
            { refresh: refreshToken }
          );
          setTokens(data.access, refreshToken);
          originalRequest.headers.Authorization = \`Bearer \${data.access}\`;
          return apiClient(originalRequest);
        } catch {
          clearTokens();
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;`;

const hooksCode = `// src/hooks/use-api.ts
import { useState, useCallback } from "react";
import apiClient from "@/lib/api-client";
import { AxiosRequestConfig, AxiosError } from "axios";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// ✅ Hook générique pour les appels API
export const useApi = <T>() => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (config: AxiosRequestConfig) => {
    setState({ data: null, loading: true, error: null });
    try {
      const { data } = await apiClient.request<T>(config);
      setState({ data, loading: false, error: null });
      return data;
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.error?.message || err.message
          : "Erreur inconnue";
      setState({ data: null, loading: false, error: message });
      throw err;
    }
  }, []);

  return { ...state, execute };
};

// ✅ Utilisation
const PostList = () => {
  const { data: posts, loading, error, execute } = useApi<Post[]>();

  useEffect(() => {
    execute({ method: "GET", url: "/posts/" });
  }, [execute]);

  if (loading) return <Skeleton />;
  if (error) return <ErrorMessage message={error} />;
  return <PostGrid posts={posts} />;
};`;

const errorsCode = `// src/lib/api-errors.ts
import { AxiosError } from "axios";
import { toast } from "sonner";

interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

// ✅ Extraire le message d'erreur de la réponse API
export const getApiErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;

    if (data?.error?.message) return data.error.message;

    switch (error.response?.status) {
      case 400: return "Données invalides";
      case 401: return "Non authentifié";
      case 403: return "Accès refusé";
      case 404: return "Ressource introuvable";
      case 429: return "Trop de requêtes, réessayez plus tard";
      case 500: return "Erreur serveur";
      default:  return error.message;
    }
  }
  return "Une erreur est survenue";
};

// ✅ Afficher un toast d'erreur
export const handleApiError = (error: unknown) => {
  const message = getApiErrorMessage(error);
  toast.error(message);
};

// ✅ Extraire les erreurs de validation par champ
export const getFieldErrors = (error: unknown): Record<string, string> => {
  if (error instanceof AxiosError) {
    const details = (error.response?.data as ApiErrorResponse)?.error?.details;
    if (details) {
      return Object.fromEntries(
        Object.entries(details).map(([key, msgs]) => [key, msgs[0]])
      );
    }
  }
  return {};
};`;

const uploadCode = `// ✅ Upload de fichiers avec Axios
import apiClient from "@/lib/api-client";

export const uploadFile = async (
  file: File,
  onProgress?: (percent: number) => void
) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post("/upload/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => {
      if (event.total && onProgress) {
        onProgress(Math.round((event.loaded * 100) / event.total));
      }
    },
  });

  return data;
};

// ✅ Composant d'upload avec barre de progression
"use client";

import { useState } from "react";
import { uploadFile } from "@/lib/upload";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export const FileUploader = () => {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadFile(file, setProgress);
      toast.success("Fichier uploadé avec succès");
    } catch {
      toast.error("Échec de l'upload");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <input type="file" onChange={handleUpload} disabled={uploading} />
      {uploading && <Progress value={progress} />}
    </div>
  );
};`;

const AxiosSetup = () => {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>Axios — Client HTTP</h1>

      <p>
        Axios est le client HTTP standard chez GhennySoft pour les projets Next.js 
        consommant des API externes. Il permet de configurer des intercepteurs, 
        gérer les tokens JWT et centraliser la gestion des erreurs.
      </p>

      <Callout type="info" title="Quand utiliser Axios ?">
        Axios est recommandé pour les projets <strong>Next.js Frontend</strong> consommant une API externe (DRF, Express, etc.). 
        Pour les projets full-stack Next.js, préférez les Server Actions et <code>fetch</code> natif.
      </Callout>

      <hr />

      <h2 id="installation">Installation</h2>
      <CodeBlock code={installCode} language="bash" />

      <h2 id="instance">Instance configurée</h2>
      <p>Toujours créer une instance Axios centralisée avec la <code>baseURL</code> et les headers par défaut.</p>
      <CodeBlock code={instanceCode} language="typescript" />

      <h2 id="interceptors">Intercepteurs</h2>
      <p>
        Les intercepteurs gèrent automatiquement l'injection du token JWT dans chaque requête 
        et le rafraîchissement du token en cas d'expiration (401).
      </p>
      <CodeBlock code={interceptorsCode} language="typescript" />

      <h2 id="hooks">Hooks personnalisés</h2>
      <CodeBlock code={hooksCode} language="tsx" />

      <Callout type="tip" title="Préférez TanStack Query">
        Pour la majorité des cas, combinez Axios avec <strong>TanStack Query</strong> plutôt 
        que des hooks maison. Voir la page dédiée.
      </Callout>

      <h2 id="errors">Gestion des erreurs</h2>
      <CodeBlock code={errorsCode} language="typescript" />

      <h2 id="upload">Upload de fichiers</h2>
      <CodeBlock code={uploadCode} language="tsx" />

      <DocsPagination
        prev={{ title: "Standards Next.js", href: "/docs/frontend/nextjs" }}
        next={{ title: "TanStack Query", href: "/docs/nextjs-libs/tanstack-query" }}
      />
    </DocsLayout>
  );
};

export default AxiosSetup;
