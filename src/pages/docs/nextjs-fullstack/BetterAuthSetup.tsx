import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Installation", href: "#install", level: 2 },
  { title: "Configuration serveur", href: "#config", level: 2 },
  { title: "Client OIDC (Generic OAuth)", href: "#oidc", level: 2 },
  { title: "Route handler", href: "#route", level: 2 },
  { title: "Client React", href: "#client", level: 2 },
  { title: "Middleware de protection", href: "#middleware", level: 2 },
  { title: "Utilisation dans les composants", href: "#usage", level: 2 },
];

const installCode = `# Installation de BetterAuth
npm install better-auth

# Variables d'environnement (.env)
DATABASE_URL="postgresql://user:password@localhost:5432/blog_gs?schema=public"
BETTER_AUTH_SECRET="votre-secret-genere-avec-openssl-rand-base64-32"
BETTER_AUTH_URL="http://localhost:3000"

# IDP GhennySoft (OAuth/OIDC)
GHENNYSOFT_CLIENT_ID="votre-client-id"
GHENNYSOFT_CLIENT_SECRET="votre-client-secret"
GHENNYSOFT_ISSUER="https://accounts.ghennysoft.com"`;

const configCode = `// src/lib/auth.ts — BetterAuth avec IDP GhennySoft (OIDC)
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { genericOAuth } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Durée de session : 7 jours
  session: {
    expiresIn: 7 * 24 * 60 * 60, // secondes
    updateAge: 24 * 60 * 60, // rafraîchir toutes les 24h
  },

  plugins: [
    // ✅ IDP privé GhennySoft via Generic OAuth (OIDC auto-discovery)
    genericOAuth({
      config: [
        {
          providerId: "ghennysoft",
          discoveryUrl:
            "https://accounts.ghennysoft.com/.well-known/openid-configuration",
          clientId: process.env.GHENNYSOFT_CLIENT_ID!,
          clientSecret: process.env.GHENNYSOFT_CLIENT_SECRET!,
          scopes: ["openid", "profile", "email"],
          // Mapper les claims OIDC vers le profil utilisateur
          mapProfileToUser: (profile) => ({
            name: profile.name || \`\${profile.given_name} \${profile.family_name}\`.trim(),
            email: profile.email,
            image: profile.picture,
            emailVerified: profile.email_verified ?? false,
          }),
        },
      ],
    }),
  ],

  // Pages personnalisées
  pages: {
    signIn: "/login",
    error: "/login",
  },
});

// Helper pour récupérer l'utilisateur côté serveur
export const getSession = async (headers: Headers) => {
  const session = await auth.api.getSession({ headers });
  return session;
};`;

const oidcExplainCode = `// Comment fonctionne le flux OIDC avec accounts.ghennysoft.com :
//
// 1. L'utilisateur clique "Se connecter avec GhennySoft"
// 2. BetterAuth redirige vers :
//    https://accounts.ghennysoft.com/authorize?
//      client_id=VOTRE_CLIENT_ID&
//      redirect_uri=http://localhost:3000/api/auth/callback/ghennysoft&
//      response_type=code&
//      scope=openid+profile+email
//
// 3. L'utilisateur s'authentifie sur accounts.ghennysoft.com
// 4. Redirection vers le callback avec un code d'autorisation
// 5. BetterAuth échange le code contre un access_token + id_token
// 6. Les claims OIDC sont mappés vers le profil utilisateur local
// 7. Une session est créée dans la base de données
//
// Auto-discovery : BetterAuth récupère automatiquement les endpoints
// (authorize, token, userinfo, jwks) via le .well-known/openid-configuration

// Configuration côté IDP (accounts.ghennysoft.com) :
// - Redirect URI : https://votre-domaine.com/api/auth/callback/ghennysoft
// - Grant type : Authorization Code
// - Scopes autorisés : openid, profile, email`;

const routeCode = `// src/app/api/auth/[...all]/route.ts — BetterAuth
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);`;

const clientCode = `// src/lib/auth-client.ts — Client BetterAuth (React)
import { createAuthClient } from "better-auth/react";
import { genericOAuthClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [genericOAuthClient()],
});

// Hooks et méthodes exportés pour simplifier l'usage
export const {
  signIn,
  signOut,
  useSession,
} = authClient;`;

const middlewareCode = `// src/middleware.ts — Next.js 16 (proxy)
// Note : Next.js 16 utilise "proxy" au lieu de "middleware"
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export const middleware = async (request: NextRequest) => {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  // Routes protégées
  const protectedRoutes = ["/posts/create", "/profile"];
  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));

  if (isProtected && !sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirection si déjà connecté
  const authRoutes = ["/login"];
  if (authRoutes.includes(pathname) && sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/posts/create", "/profile/:path*", "/login"],
};`;

const usageCode = `// ✅ Côté serveur (Server Component)
import { headers } from "next/headers";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

const ProfilePage = async () => {
  const session = await getSession(await headers());
  if (!session) redirect("/login");

  return <div>Bonjour {session.user.name} !</div>;
};

export default ProfilePage;

// ✅ Côté client — Connexion via IDP GhennySoft
"use client";

import { signIn, signOut, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export const UserMenu = () => {
  const { data: session, isPending } = useSession();

  if (isPending) return <Skeleton className="h-8 w-8 rounded-full" />;

  if (!session) {
    return (
      <Button
        onClick={() =>
          signIn.social({ provider: "ghennysoft", callbackURL: "/" })
        }
      >
        Se connecter avec GhennySoft
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={session.user.image ?? undefined} />
          <AvatarFallback>
            {session.user.name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>{session.user.name}</DropdownMenuItem>
        <DropdownMenuItem>{session.user.email}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => signOut()}>
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ✅ Page de connexion
"use client";

import { signIn } from "@/lib/auth-client";
import { useSearchParams } from "next/navigation";

const LoginPage = () => {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="max-w-sm w-full space-y-6 text-center">
        <h1 className="text-2xl font-bold">Connexion</h1>
        <p className="text-muted-foreground">
          Connectez-vous avec votre compte GhennySoft
        </p>
        <Button
          className="w-full"
          onClick={() =>
            signIn.social({
              provider: "ghennysoft",
              callbackURL: redirect,
            })
          }
        >
          Se connecter avec GhennySoft
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;

// ✅ Dans un API Route — BetterAuth
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const POST = async (req: Request) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Non authentifié" } },
      { status: 401 }
    );
  }

  const userId = session.user.id;
  // ... logique métier
};`;

const BetterAuthSetup = () => {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>Full-Stack — BetterAuth + IDP GhennySoft</h1>

      <p>
        Configuration complète de l'authentification avec <strong>BetterAuth</strong> et 
        le provider <strong>OAuth/OIDC</strong> privé de GhennySoft sur{" "}
        <code>accounts.ghennysoft.com</code>. Aucun formulaire de login/register local — 
        toute l'authentification est déléguée à l'IDP de l'entreprise.
      </p>

      <Callout type="warning" title="Sécurité">
        Générez un <code>BETTER_AUTH_SECRET</code> fort avec <code>openssl rand -base64 32</code>. 
        Les secrets <code>GHENNYSOFT_CLIENT_ID</code> et <code>GHENNYSOFT_CLIENT_SECRET</code> sont 
        fournis par l'équipe infrastructure lors de l'enregistrement de votre application sur l'IDP.
      </Callout>

      <Callout type="info" title="Pourquoi BetterAuth ?">
        BetterAuth est un framework d'authentification TypeScript-first avec support natif de 
        Prisma, un système de plugins extensible et une compatibilité complète avec Next.js 16. 
        Le plugin <code>genericOAuth</code> permet de connecter n'importe quel provider OIDC, 
        y compris l'IDP privé GhennySoft.
      </Callout>

      <hr />

      <h2 id="install">Installation</h2>
      <CodeBlock code={installCode} language="bash" />

      <h2 id="config">Configuration serveur</h2>
      <CodeBlock code={configCode} language="typescript" />

      <h2 id="oidc">Client OIDC — IDP GhennySoft</h2>
      <p>
        BetterAuth utilise le plugin <code>genericOAuth</code> avec l'<strong>auto-discovery OIDC</strong> pour 
        se connecter à <code>accounts.ghennysoft.com</code>. Le <code>discoveryUrl</code> pointe vers le 
        <code>.well-known/openid-configuration</code> qui fournit automatiquement tous les endpoints nécessaires.
      </p>
      <CodeBlock code={oidcExplainCode} language="typescript" />

      <Callout type="tip" title="Redirect URI">
        Enregistrez la redirect URI suivante sur l'IDP GhennySoft :{" "}
        <code>https://votre-domaine.com/api/auth/callback/ghennysoft</code>. 
        En dev : <code>http://localhost:3000/api/auth/callback/ghennysoft</code>.
      </Callout>

      <h2 id="route">Route handler</h2>
      <CodeBlock code={routeCode} language="typescript" />

      <h2 id="client">Client React</h2>
      <CodeBlock code={clientCode} language="typescript" />

      <h2 id="middleware">Middleware de protection (Next.js 16)</h2>
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

export default BetterAuthSetup;
