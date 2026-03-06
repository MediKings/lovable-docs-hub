import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Structure du projet", href: "#structure", level: 2 },
  { title: "Installation", href: "#installation", level: 2 },
  { title: "Schéma Prisma", href: "#schema", level: 2 },
  { title: "Client Prisma", href: "#client", level: 2 },
  { title: "Seed de la base", href: "#seed", level: 2 },
];

const structureCode = `# Structure du projet Next.js Full-Stack (Prisma 7 + PostgreSQL)
blog-fullstack/
├── prisma/
│   ├── schema.prisma              # Schéma de la base de données
│   ├── seed.ts                    # Données initiales
│   └── migrations/                # Migrations auto-générées
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── (auth)/
│   │   │   └── login/page.tsx     # Bouton "Se connecter avec GhennySoft"
│   │   ├── posts/
│   │   │   ├── page.tsx           # Server Component (liste)
│   │   │   ├── [slug]/page.tsx    # Server Component (détail)
│   │   │   └── create/page.tsx    # Client Component (Tiptap)
│   │   └── api/
│   │       ├── auth/[...all]/route.ts  # BetterAuth handler
│   │       ├── posts/route.ts
│   │       ├── posts/[slug]/route.ts
│   │       ├── comments/route.ts
│   │       └── likes/route.ts
│   ├── components/
│   │   ├── ui/
│   │   ├── editor/
│   │   │   ├── tiptap-editor.tsx   # Éditeur Tiptap
│   │   │   └── toolbar.tsx
│   │   ├── posts/
│   │   └── comments/
│   ├── lib/
│   │   ├── prisma.ts              # Instance Prisma singleton
│   │   ├── api-client.ts          # Axios pour les Client Components
│   │   ├── auth.ts                # Config BetterAuth + IDP OIDC
│   │   ├── auth-client.ts         # Client BetterAuth (React)
│   │   └── validations.ts         # Schémas Zod
│   └── types/
│       └── index.ts
├── .env
├── docker-compose.yml             # PostgreSQL local
├── next.config.ts
└── package.json`;

const installCode = `# Installation des dépendances
npm install prisma@7 @prisma/client@7 better-auth
npm install axios @tanstack/react-query@5 zod react-hook-form @hookform/resolvers
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
npm install -D prisma@7

# Initialiser Prisma avec PostgreSQL
npx prisma init --datasource-provider postgresql

# Générer les tables BetterAuth
npx @better-auth/cli generate --config src/lib/auth.ts
npx prisma migrate dev --name init

# Variables d'environnement (.env)
DATABASE_URL="postgresql://user:password@localhost:5432/blog_gs?schema=public"
BETTER_AUTH_SECRET="votre-secret-genere-avec-openssl-rand-base64-32"
BETTER_AUTH_URL="http://localhost:3000"
GHENNYSOFT_CLIENT_ID="votre-client-id"
GHENNYSOFT_CLIENT_SECRET="votre-client-secret"
GHENNYSOFT_ISSUER="https://accounts.ghennysoft.com"`;

const schemaCode = `// prisma/schema.prisma — Prisma 7 + BetterAuth
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ──────────────────────────────────────
// Tables gérées par BetterAuth (auto-générées)
// ──────────────────────────────────────

model User {
  id            String    @id
  name          String
  email         String    @unique
  emailVerified Boolean   @default(false) @map("email_verified")
  image         String?
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  // Relations BetterAuth
  sessions      Session[]
  accounts      Account[]

  // Relations métier
  posts         Post[]
  comments      Comment[]
  likes         Like[]

  @@map("users")
}

model Session {
  id        String   @id
  expiresAt DateTime @map("expires_at")
  token     String   @unique
  ipAddress String?  @map("ip_address")
  userAgent String?  @map("user_agent")
  userId    String   @map("user_id")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model Account {
  id                    String    @id
  accountId             String    @map("account_id")
  providerId            String    @map("provider_id")
  userId                String    @map("user_id")
  accessToken           String?   @map("access_token")
  refreshToken          String?   @map("refresh_token")
  idToken               String?   @map("id_token")
  accessTokenExpiresAt  DateTime? @map("access_token_expires_at")
  refreshTokenExpiresAt DateTime? @map("refresh_token_expires_at")
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("accounts")
}

model Verification {
  id         String   @id
  identifier String
  value      String
  expiresAt  DateTime @map("expires_at")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  @@map("verifications")
}

// ──────────────────────────────────────
// Tables métier (Blog)
// ──────────────────────────────────────

model Post {
  id          String    @id @default(cuid())
  title       String
  slug        String    @unique
  content     String    // HTML riche (Tiptap)
  isPublished Boolean   @default(false) @map("is_published")
  viewCount   Int       @default(0) @map("view_count")
  authorId    String    @map("author_id")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  // Relations
  author      User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments    Comment[]
  likes       Like[]

  @@index([slug])
  @@index([createdAt(sort: Desc)])
  @@index([authorId])
  @@map("posts")
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  postId    String   @map("post_id")
  authorId  String   @map("author_id")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@map("comments")
}

model Like {
  id        String   @id @default(cuid())
  postId    String   @map("post_id")
  userId    String   @map("user_id")
  createdAt DateTime @default(now()) @map("created_at")

  // Relations
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Un user ne peut liker qu'une fois par post
  @@unique([postId, userId])
  @@map("likes")
}`;

const clientCode = `// src/lib/prisma.ts — Prisma 7
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Commandes utiles (Prisma 7) :
// npx prisma migrate dev --name init    # Créer une migration
// npx prisma generate                   # Générer le client
// npx prisma studio                     # UI de gestion de la DB
// npx prisma db seed                    # Exécuter le seed`;

const seedCode = `// prisma/seed.ts
// Note : pas de seed utilisateur car les comptes sont créés
// automatiquement par BetterAuth lors de la première connexion OIDC
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

const main = async () => {
  // Vérifier qu'un utilisateur existe (créé via OIDC)
  const user = await prisma.user.findFirst();

  if (!user) {
    console.log("⚠️  Aucun utilisateur trouvé. Connectez-vous d'abord via accounts.ghennysoft.com");
    return;
  }

  // Créer des articles de test (contenu HTML riche)
  const posts = [
    {
      title: "Guide des standards de code GhennySoft",
      content: "<h2>Bienvenue</h2><p>Notre guide des standards de développement...</p>",
    },
    {
      title: "Utiliser Prisma 7 avec Next.js 16",
      content: "<h2>Introduction</h2><p>Prisma 7 est un ORM moderne pour TypeScript...</p>",
    },
    {
      title: "Authentification avec BetterAuth",
      content: "<h2>Présentation</h2><p>BetterAuth simplifie l'authentification via OIDC...</p>",
    },
  ];

  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: slugify(post.title) },
      update: {},
      create: {
        ...post,
        slug: slugify(post.title),
        authorId: user.id,
        isPublished: true,
      },
    });
  }

  console.log("✅ Seed terminé");
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());`;

const PrismaSetup = () => {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>Full-Stack Next.js — Prisma 7 & PostgreSQL</h1>

      <p>
        Ce projet implémente un <strong>blog complet</strong> avec Next.js 16, Prisma 7 ORM 
        et PostgreSQL. L'authentification est déléguée à l'IDP GhennySoft via <strong>BetterAuth</strong>.
      </p>

      <Callout type="info" title="Stack technique">
        Next.js 16 · Prisma 7 · PostgreSQL · BetterAuth · IDP GhennySoft (OIDC) · TypeScript · Axios · TanStack Query v5 · Zod · React Hook Form · Tiptap · Tailwind CSS v4
      </Callout>

      <hr />

      <h2 id="structure">Structure du projet</h2>
      <CodeBlock code={structureCode} language="bash" />

      <h2 id="installation">Installation</h2>
      <CodeBlock code={installCode} language="bash" />

      <h2 id="schema">Schéma Prisma</h2>
      <p>
        Le schéma inclut les tables <strong>BetterAuth</strong> (<code>User</code>, <code>Session</code>, <code>Account</code>, <code>Verification</code>) 
        et les tables métier (<code>Post</code>, <code>Comment</code>, <code>Like</code>). 
        Les utilisateurs sont créés automatiquement lors de la première connexion via l'IDP.
      </p>
      <CodeBlock code={schemaCode} language="typescript" />

      <Callout type="tip" title="Convention @@map">
        Utilisez <code>@map</code> et <code>@@map</code> pour garder les noms SQL 
        en <code>snake_case</code> tout en utilisant <code>camelCase</code> dans le code TypeScript.
      </Callout>

      <h2 id="client">Client Prisma</h2>
      <CodeBlock code={clientCode} language="typescript" />

      <Callout type="warning" title="Singleton en dev">
        Le pattern singleton est obligatoire pour éviter de créer plusieurs instances 
        de PrismaClient lors du hot reload en développement.
      </Callout>

      <h2 id="seed">Seed de la base</h2>
      <p>
        Pas de seed utilisateur car les comptes sont créés automatiquement par BetterAuth 
        lors de la première connexion OIDC sur <code>accounts.ghennysoft.com</code>.
      </p>
      <CodeBlock code={seedCode} language="typescript" />

      <DocsPagination
        prev={{ title: "Commentaires & Likes (Frontend)", href: "/docs/nextjs-frontend/comments" }}
        next={{ title: "BetterAuth", href: "/docs/nextjs-fullstack/auth" }}
      />
    </DocsLayout>
  );
};

export default PrismaSetup;
