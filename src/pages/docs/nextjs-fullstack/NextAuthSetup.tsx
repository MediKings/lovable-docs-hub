import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Configuration Auth.js", href: "#config", level: 2 },
  { title: "Route handler", href: "#route", level: 2 },
  { title: "SessionProvider", href: "#provider", level: 2 },
  { title: "Middleware de protection", href: "#middleware", level: 2 },
  { title: "Utilisation dans les composants", href: "#usage", level: 2 },
];

const configCode = `// src/lib/auth.ts — Auth.js v5
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) {
          throw new Error("Aucun compte trouvé avec cet email");
        }

        const isValid = await compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) {
          throw new Error("Mot de passe incorrect");
        }

        return {
          id: user.id,
          email: user.email,
          name: \`\${user.firstName} \${user.lastName}\`.trim() || user.username,
          username: user.username,
        };
      },
    }),
  ],

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
      }
      return token;
    },

    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).username = token.username as string;
      }
      return session;
    },
  },
});

// Helper pour récupérer l'utilisateur côté serveur
export const getCurrentUser = async () => {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      avatar: true,
    },
  });
};`;

const routeCode = `// src/app/api/auth/[...nextauth]/route.ts — Auth.js v5
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;`;

const providerCode = `// src/app/layout.tsx
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import { QueryProvider } from "@/providers/query-provider";

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  return (
    <html lang="fr">
      <body>
        <SessionProvider session={session}>
          <QueryProvider>
            <Header />
            <main>{children}</main>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
};

export default RootLayout;`;

const middlewareCode = `// src/middleware.ts — Auth.js v5
import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Routes protégées
  const protectedRoutes = ["/posts/create", "/profile"];
  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return Response.redirect(loginUrl);
  }

  // Redirection si déjà connecté
  const authRoutes = ["/login", "/register"];
  if (authRoutes.includes(pathname) && isLoggedIn) {
    return Response.redirect(new URL("/", req.url));
  }
});

export const config = {
  matcher: ["/posts/create", "/profile/:path*", "/login", "/register"],
};`;

const usageCode = `// ✅ Côté serveur (Server Component)
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

const ProfilePage = async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <div>Bonjour {user.firstName} !</div>;
};

export default ProfilePage;

// ✅ Côté client (Client Component) avec Axios + TanStack Query
"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export const UserMenu = () => {
  const { data: session, status } = useSession();

  if (status === "loading") return <Skeleton className="h-8 w-8" />;

  if (!session) {
    return <Button onClick={() => signIn()}>Se connecter</Button>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarFallback>
            {session.user?.name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>{session.user?.name}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => signOut()}>
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ✅ Dans un API Route — Auth.js v5
import { auth } from "@/lib/auth";

export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Non authentifié" } },
      { status: 401 }
    );
  }

  const userId = session.user.id;
  // ... logique métier
};`;

const NextAuthSetup = () => {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>Full-Stack — Auth.js v5</h1>

      <p>
        Configuration complète de l'authentification avec <strong>Auth.js v5</strong> (anciennement NextAuth.js), 
        utilisant les Credentials Provider avec Prisma 7 pour le stockage.
      </p>

      <Callout type="warning" title="Sécurité">
        Générez un <code>AUTH_SECRET</code> fort avec <code>openssl rand -base64 32</code>. 
        Ne jamais le committer dans le code source.
      </Callout>

      <Callout type="info" title="Migration NextAuth → Auth.js v5">
        Auth.js v5 simplifie l'API : <code>auth()</code> remplace <code>getServerSession(authOptions)</code>, 
        et les handlers sont exportés directement depuis <code>NextAuth()</code>.
      </Callout>

      <hr />

      <h2 id="config">Configuration Auth.js</h2>
      <CodeBlock code={configCode} language="typescript" />

      <h2 id="route">Route handler</h2>
      <CodeBlock code={routeCode} language="typescript" />

      <h2 id="provider">SessionProvider + QueryProvider</h2>
      <p>
        Le layout root intègre <code>SessionProvider</code> pour Auth.js et <code>QueryProvider</code> pour 
        TanStack Query, permettant aux Client Components d'utiliser les deux.
      </p>
      <CodeBlock code={providerCode} language="typescript" />

      <h2 id="middleware">Middleware de protection</h2>
      <CodeBlock code={middlewareCode} language="typescript" />

      <h2 id="usage">Utilisation dans les composants</h2>
      <CodeBlock code={usageCode} language="typescript" />

      <DocsPagination
        prev={{ title: "Prisma & PostgreSQL", href: "/docs/nextjs-fullstack/prisma" }}
        next={{ title: "API Routes", href: "/docs/nextjs-fullstack/api" }}
      />
    </DocsLayout>
  );
};

export default NextAuthSetup;
