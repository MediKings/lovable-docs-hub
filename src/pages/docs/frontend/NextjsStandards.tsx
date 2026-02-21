import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Architecture App Router", href: "#architecture", level: 2 },
  { title: "Structure des fichiers", href: "#structure", level: 2 },
  { title: "Server vs Client Components", href: "#server-client", level: 2 },
  { title: "Data Fetching", href: "#data-fetching", level: 2 },
  { title: "Routes & Middleware", href: "#routes", level: 2 },
  { title: "Métadonnées & SEO", href: "#seo", level: 2 },
  { title: "Gestion des erreurs", href: "#erreurs", level: 2 },
  { title: "Optimisations", href: "#optimisations", level: 2 },
];

const structureCode = `# Structure standard GhennySoft — Next.js 14+ (App Router)
my-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Layout racine
│   │   ├── page.tsx                # Page d'accueil
│   │   ├── loading.tsx             # Loading UI global
│   │   ├── error.tsx               # Error boundary global
│   │   ├── not-found.tsx           # Page 404
│   │   ├── globals.css             # Styles globaux
│   │   ├── (auth)/                 # Groupe de routes (pas dans l'URL)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── dashboard/
│   │   │   ├── layout.tsx          # Layout imbriqué
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx         # Loading spécifique
│   │   │   └── [projectId]/        # Route dynamique
│   │   │       └── page.tsx
│   │   └── api/                    # Route Handlers
│   │       └── webhooks/
│   │           └── route.ts
│   ├── components/
│   │   ├── ui/                     # Composants UI (shadcn)
│   │   ├── layout/                 # Header, Footer, Nav
│   │   └── features/               # Composants métier
│   ├── lib/
│   │   ├── db.ts                   # Client Prisma/Drizzle
│   │   ├── auth.ts                 # Configuration auth
│   │   └── utils.ts
│   ├── hooks/
│   ├── types/
│   └── constants/
├── public/
├── next.config.ts
├── middleware.ts                    # Middleware (auth, i18n...)
└── .env.local`;

const serverClientCode = `// ✅ Server Component (par défaut dans App Router)
// Accès direct à la DB, pas de JS envoyé au client
async function UserList() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// ✅ Client Component — uniquement quand nécessaire
"use client";

import { useState } from "react";

export function SearchBar({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState("");

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && onSearch(query)}
      placeholder="Rechercher..."
    />
  );
}

// ❌ NE PAS faire : "use client" sur un composant qui n'a pas
// besoin d'interactivité (useState, useEffect, onClick, etc.)`;

const dataFetchingCode = `// ✅ Fetch dans un Server Component — pas de useEffect
async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await db.post.findUnique({
    where: { slug: params.slug },
    include: { author: true, comments: true },
  });

  if (!post) notFound();

  return <ArticleView post={post} />;
}

// ✅ Server Actions pour les mutations
"use server";

import { revalidatePath } from "next/cache";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  // Validation
  if (!title || title.length < 3) {
    throw new Error("Le titre doit contenir au moins 3 caractères");
  }

  await db.post.create({
    data: { title, content, authorId: getCurrentUserId() },
  });

  revalidatePath("/posts");
}

// ✅ Utilisation dans un formulaire
export function CreatePostForm() {
  return (
    <form action={createPost}>
      <input name="title" required />
      <textarea name="content" required />
      <SubmitButton />
    </form>
  );
}`;

const routeMiddlewareCode = `// middleware.ts — Protection des routes
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("session")?.value;

  // Routes protégées
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Redirect si déjà connecté
  if (request.nextUrl.pathname.startsWith("/login") && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};`;

const seoCode = `// ✅ Métadonnées statiques
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | GhennySoft",
  description: "Tableau de bord de gestion des projets GhennySoft",
  openGraph: {
    title: "Dashboard | GhennySoft",
    description: "Gérez vos projets efficacement",
    images: ["/og-dashboard.png"],
  },
};

// ✅ Métadonnées dynamiques
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug);

  return {
    title: \`\${post.title} | Blog GhennySoft\`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}

// ✅ generateStaticParams pour les pages statiques
export async function generateStaticParams() {
  const posts = await db.post.findMany({
    select: { slug: true },
  });
  return posts.map((post) => ({ slug: post.slug }));
}`;

const errorHandlingCode = `// error.tsx — Error Boundary par segment de route
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Logger l'erreur vers un service de monitoring
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <h2 className="text-xl font-semibold mb-4">
        Une erreur est survenue
      </h2>
      <p className="text-muted-foreground mb-6">
        {error.message || "Erreur inattendue"}
      </p>
      <Button onClick={reset}>Réessayer</Button>
    </div>
  );
}

// loading.tsx — Skeleton automatique pendant le chargement
export default function Loading() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}`;

const optimizationsCode = `// ✅ Image optimisée avec next/image
import Image from "next/image";

<Image
  src="/hero.jpg"
  alt="Hero banner GhennySoft"
  width={1200}
  height={630}
  priority                    // Pour les images above-the-fold
  placeholder="blur"
  blurDataURL={blurHash}
/>

// ✅ Font optimisée avec next/font
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

// ✅ Dynamic imports pour le code-splitting
const HeavyChart = dynamic(() => import("@/components/HeavyChart"), {
  loading: () => <Skeleton className="h-[400px]" />,
  ssr: false,  // Désactiver SSR pour les composants client-only
});

// ✅ Parallel data fetching
async function DashboardPage() {
  // Fetch en parallèle, pas séquentiel !
  const [stats, posts, users] = await Promise.all([
    getStats(),
    getRecentPosts(),
    getActiveUsers(),
  ]);

  return <Dashboard stats={stats} posts={posts} users={users} />;
}`;

export default function NextjsStandards() {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>Standards Next.js</h1>

      <p>
        Conventions GhennySoft pour les projets Next.js 14+ avec l'App Router. 
        Nous utilisons les Server Components par défaut et les Client Components uniquement quand nécessaire.
      </p>

      <Callout type="info" title="Version minimale">
        Tous les projets Next.js GhennySoft utilisent <strong>Next.js 14+</strong> avec l'App Router. 
        Le Pages Router n'est plus utilisé pour les nouveaux projets.
      </Callout>

      <hr />

      <h2 id="architecture">Architecture App Router</h2>

      <p>L'App Router de Next.js utilise un système de fichiers conventionnel :</p>

      <ul>
        <li><code>page.tsx</code> — Rend la route accessible</li>
        <li><code>layout.tsx</code> — Layout partagé entre les routes enfants</li>
        <li><code>loading.tsx</code> — UI de chargement automatique (Suspense)</li>
        <li><code>error.tsx</code> — Error boundary par segment</li>
        <li><code>not-found.tsx</code> — Page 404 personnalisée</li>
        <li><code>route.ts</code> — API Route Handler</li>
      </ul>

      <h2 id="structure">Structure des fichiers</h2>

      <CodeBlock code={structureCode} language="bash" />

      <h2 id="server-client">Server vs Client Components</h2>

      <CodeBlock code={serverClientCode} language="tsx" />

      <Callout type="warning" title="Règle critique">
        Par défaut, tout composant dans l'App Router est un <strong>Server Component</strong>. 
        N'ajoutez <code>"use client"</code> que pour les composants nécessitant de l'interactivité 
        (state, effects, event handlers).
      </Callout>

      <h2 id="data-fetching">Data Fetching</h2>

      <CodeBlock code={dataFetchingCode} language="tsx" />

      <h2 id="routes">Routes & Middleware</h2>

      <CodeBlock code={routeMiddlewareCode} language="tsx" />

      <h2 id="seo">Métadonnées & SEO</h2>

      <CodeBlock code={seoCode} language="tsx" />

      <Callout type="tip" title="SEO obligatoire">
        Chaque page doit définir ses métadonnées. Les pages dynamiques utilisent <code>generateMetadata</code> 
        et les pages statiques <code>generateStaticParams</code> pour le pré-rendu.
      </Callout>

      <h2 id="erreurs">Gestion des erreurs</h2>

      <CodeBlock code={errorHandlingCode} language="tsx" />

      <h2 id="optimisations">Optimisations</h2>

      <CodeBlock code={optimizationsCode} language="tsx" />

      <DocsPagination
        prev={{ title: "React & Tailwind", href: "/docs/frontend/react" }}
        next={{ title: "Django REST Framework", href: "/docs/backend/django" }}
      />
    </DocsLayout>
  );
}
