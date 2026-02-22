import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Structure du projet", href: "#structure", level: 2 },
  { title: "Variables d'environnement", href: "#env", level: 2 },
  { title: "Client API (Axios)", href: "#api-client", level: 2 },
  { title: "Types TypeScript", href: "#types", level: 2 },
  { title: "Gestion du token JWT", href: "#token", level: 2 },
];

const structureCode = `# Structure du projet Next.js (Frontend pour API DRF)
blog-frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Page d'accueil
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── posts/
│   │   │   ├── page.tsx                # Liste des articles
│   │   │   ├── [slug]/page.tsx         # Détail article
│   │   │   └── create/page.tsx         # Création article
│   │   └── profile/page.tsx
│   ├── components/
│   │   ├── ui/                         # Composants Shadcn
│   │   ├── posts/
│   │   │   ├── post-card.tsx
│   │   │   ├── post-form.tsx
│   │   │   └── post-list.tsx
│   │   ├── comments/
│   │   │   ├── comment-form.tsx
│   │   │   └── comment-list.tsx
│   │   └── layout/
│   │       ├── header.tsx
│   │       ├── footer.tsx
│   │       └── sidebar.tsx
│   ├── lib/
│   │   ├── api-client.ts               # Instance Axios configurée
│   │   ├── auth.ts                     # Gestion tokens JWT
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-posts.ts
│   │   └── use-comments.ts
│   ├── types/
│   │   ├── post.ts
│   │   ├── comment.ts
│   │   ├── user.ts
│   │   └── api.ts
│   └── providers/
│       ├── auth-provider.tsx
│       └── query-provider.tsx
├── .env.local
├── next.config.ts
└── package.json`;

const envCode = `# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME=GhennySoft Blog`;

const apiClientCode = `// src/lib/api-client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./auth";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Intercepteur : ajouter le token à chaque requête
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

// Intercepteur : rafraîchir le token si expiré (401)
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

const typesCode = `// src/types/api.ts
export interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

// src/types/user.ts
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

// src/types/post.ts
export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  author: number;
  author_name: string;
  is_published: boolean;
  view_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePostPayload {
  title: string;
  content: string;
}

// src/types/comment.ts
export interface Comment {
  id: number;
  post: number;
  author: number;
  author_name: string;
  content: string;
  created_at: string;
}`;

const tokenCode = `// src/lib/auth.ts
const ACCESS_KEY = "gs_access_token";
const REFRESH_KEY = "gs_refresh_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

// Décoder le payload JWT (sans vérification de signature côté client)
export function decodeToken(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  return Date.now() >= (decoded.exp as number) * 1000;
}`;

export default function NextjsFrontendSetup() {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>Next.js Frontend — Setup & Configuration</h1>

      <p>
        Ce projet Next.js sert de <strong>frontend</strong> pour consommer l'API REST 
        du blog Django. Il utilise l'App Router, TypeScript et Axios pour communiquer 
        avec le backend.
      </p>

      <Callout type="info" title="Stack technique">
        Next.js 14+ · TypeScript · Tailwind CSS · Shadcn/UI · Axios · TanStack Query · Zod
      </Callout>

      <hr />

      <h2 id="structure">Structure du projet</h2>
      <CodeBlock code={structureCode} language="bash" />

      <h2 id="env">Variables d'environnement</h2>
      <CodeBlock code={envCode} language="bash" />

      <Callout type="warning" title="Sécurité">
        Ne jamais stocker de clés secrètes avec le préfixe <code>NEXT_PUBLIC_</code>. 
        Seules les variables publiques (URL API) doivent être exposées côté client.
      </Callout>

      <h2 id="api-client">Client API (Axios)</h2>
      <p>
        Le client API est configuré avec des intercepteurs pour gérer automatiquement 
        l'authentification JWT et le rafraîchissement des tokens.
      </p>
      <CodeBlock code={apiClientCode} language="typescript" />

      <h2 id="types">Types TypeScript</h2>
      <p>Tous les types sont centralisés dans <code>src/types/</code> pour assurer la cohérence.</p>
      <CodeBlock code={typesCode} language="typescript" />

      <h2 id="token">Gestion du token JWT</h2>
      <CodeBlock code={tokenCode} language="typescript" />

      <DocsPagination
        prev={{ title: "Nombre de vues", href: "/docs/views/view-count" }}
        next={{ title: "Authentification (Next.js)", href: "/docs/nextjs-frontend/auth" }}
      />
    </DocsLayout>
  );
}
