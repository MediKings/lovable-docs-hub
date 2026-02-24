import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Configuration NextAuth", href: "#config", level: 2 },
  { title: "Route handler", href: "#route", level: 2 },
  { title: "SessionProvider", href: "#provider", level: 2 },
  { title: "Middleware de protection", href: "#middleware", level: 2 },
  { title: "Utilisation dans les composants", href: "#usage", level: 2 },
];

const configCode = `// src/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 jours
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("Aucun compte trouvé avec cet email");
        }

        const isValid = await compare(
          credentials.password,
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).username = token.username as string;
      }
      return session;
    },
  },
};

// Helper pour récupérer la session côté serveur
import { getServerSession } from "next-auth";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  return prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      avatar: true,
    },
  });
}`;

const routeCode = `// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };`;

const providerCode = `// src/app/layout.tsx
import { SessionProvider } from "next-auth/react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="fr">
      <body>
        <SessionProvider session={session}>
          <Header />
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}`;

const middlewareCode = `// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Redirection personnalisée selon le rôle si nécessaire
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/posts/create", "/profile/:path*", "/api/posts/:path*"],
};`;

const usageCode = `// Côté serveur (Server Component)
import { getCurrentUser } from "@/lib/auth";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <div>Bonjour {user.firstName} !</div>;
}

// Côté client (Client Component)
"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") return <Skeleton className="h-8 w-8" />;

  if (!session) {
    return (
      <Button onClick={() => signIn()}>Se connecter</Button>
    );
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
        <DropdownMenuItem>
          {session.user?.name}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => signOut()}>
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Dans un API Route
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Non authentifié" } },
      { status: 401 }
    );
  }

  const userId = (session.user as any).id;
  // ... logique métier
}`;

const NextAuthSetup = () => {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>Full-Stack — NextAuth.js</h1>

      <p>
        Configuration complète de l'authentification avec NextAuth.js, 
        utilisant les Credentials Provider avec Prisma pour le stockage.
      </p>

      <Callout type="warning" title="Sécurité">
        Générez un <code>NEXTAUTH_SECRET</code> fort avec <code>openssl rand -base64 32</code>. 
        Ne jamais le committer dans le code source.
      </Callout>

      <hr />

      <h2 id="config">Configuration NextAuth</h2>
      <CodeBlock code={configCode} language="typescript" />

      <h2 id="route">Route handler</h2>
      <CodeBlock code={routeCode} language="typescript" />

      <h2 id="provider">SessionProvider</h2>
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
