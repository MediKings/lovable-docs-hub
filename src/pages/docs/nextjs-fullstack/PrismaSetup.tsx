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
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── posts/
│   │   │   ├── page.tsx           # Server Component (liste)
│   │   │   ├── [slug]/page.tsx    # Server Component (détail)
│   │   │   └── create/page.tsx    # Client Component (Tiptap)
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
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
│   │   ├── auth.ts                # Config Auth.js
│   │   └── validations.ts         # Schémas Zod
│   └── types/
│       └── index.ts
├── .env
├── docker-compose.yml             # PostgreSQL local
├── next.config.ts
└── package.json`;

const installCode = `# Installation des dépendances
npm install prisma@7 @prisma/client@7 next-auth@5 @auth/prisma-adapter
npm install axios @tanstack/react-query@5 zod react-hook-form @hookform/resolvers
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
npm install -D prisma@7

# Initialiser Prisma avec PostgreSQL
npx prisma init --datasource-provider postgresql

# Variables d'environnement (.env)
DATABASE_URL="postgresql://user:password@localhost:5432/blog_gs?schema=public"
AUTH_SECRET="votre-secret-genere-avec-openssl-rand-base64-32"
AUTH_URL="http://localhost:3000"`;

const schemaCode = `// prisma/schema.prisma — Prisma 7
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  username      String    @unique
  email         String    @unique
  passwordHash  String    @map("password_hash")
  firstName     String?   @map("first_name")
  lastName      String?   @map("last_name")
  avatar        String?
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  // Relations
  posts         Post[]
  comments      Comment[]
  likes         Like[]
  sessions      Session[]

  @@map("users")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique @map("session_token")
  userId       String   @map("user_id")
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

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
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

const main = async () => {
  // Créer un utilisateur de test
  const admin = await prisma.user.upsert({
    where: { email: "admin@ghennysoft.com" },
    update: {},
    create: {
      username: "admin",
      email: "admin@ghennysoft.com",
      passwordHash: await hash("Admin123!", 12),
      firstName: "Admin",
      lastName: "GhennySoft",
    },
  });

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
      title: "Authentification avec Auth.js v5",
      content: "<h2>Présentation</h2><p>Auth.js v5 simplifie l'authentification...</p>",
    },
  ];

  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: slugify(post.title) },
      update: {},
      create: {
        ...post,
        slug: slugify(post.title),
        authorId: admin.id,
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
        et PostgreSQL. Pas de backend séparé — tout est dans un seul projet Next.js.
      </p>

      <Callout type="info" title="Stack technique">
        Next.js 16 · Prisma 7 · PostgreSQL · Auth.js v5 · TypeScript · Axios · TanStack Query v5 · Zod · React Hook Form · Tiptap · Tailwind CSS v4
      </Callout>

      <hr />

      <h2 id="structure">Structure du projet</h2>
      <CodeBlock code={structureCode} language="bash" />

      <h2 id="installation">Installation</h2>
      <CodeBlock code={installCode} language="bash" />

      <h2 id="schema">Schéma Prisma</h2>
      <p>
        Le schéma définit tous les modèles avec les conventions GhennySoft : 
        <code>snake_case</code> pour les colonnes SQL, <code>camelCase</code> pour TypeScript.
        Le champ <code>content</code> stocke du HTML riche généré par Tiptap.
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
      <CodeBlock code={seedCode} language="typescript" />

      <DocsPagination
        prev={{ title: "Commentaires & Likes (Frontend)", href: "/docs/nextjs-frontend/comments" }}
        next={{ title: "Auth.js v5", href: "/docs/nextjs-fullstack/auth" }}
      />
    </DocsLayout>
  );
};

export default PrismaSetup;
