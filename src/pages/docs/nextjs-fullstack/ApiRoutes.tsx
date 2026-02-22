import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Validations Zod", href: "#validations", level: 2 },
  { title: "CRUD Articles", href: "#posts", level: 2 },
  { title: "Détail & Update & Delete", href: "#post-detail", level: 2 },
  { title: "Commentaires", href: "#comments", level: 2 },
  { title: "Likes (toggle)", href: "#likes", level: 2 },
  { title: "Gestion des erreurs", href: "#errors", level: 2 },
];

const validationsCode = `// src/lib/validations.ts
import { z } from "zod";

export const createPostSchema = z.object({
  title: z
    .string()
    .min(5, "Le titre doit contenir au moins 5 caractères")
    .max(200, "Maximum 200 caractères"),
  content: z.string().min(20, "Minimum 20 caractères"),
});

export const updatePostSchema = createPostSchema.partial().extend({
  isPublished: z.boolean().optional(),
});

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Le commentaire ne peut pas être vide")
    .max(1000, "Maximum 1000 caractères"),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Minimum 3 caractères")
      .max(30, "Maximum 30 caractères")
      .regex(/^[a-zA-Z0-9_]+$/, "Lettres, chiffres et _ uniquement"),
    email: z.string().email("Email invalide"),
    password: z
      .string()
      .min(8, "Minimum 8 caractères")
      .regex(/[A-Z]/, "Au moins une majuscule")
      .regex(/[0-9]/, "Au moins un chiffre"),
    passwordConfirm: z.string(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["passwordConfirm"],
  });

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;`;

const postsRouteCode = `// src/app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { createPostSchema } from "@/lib/validations";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// GET /api/posts — Liste des articles publiés
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const perPage = parseInt(searchParams.get("per_page") ?? "10");
  const skip = (page - 1) * perPage;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { isPublished: true },
      include: {
        author: {
          select: { id: true, username: true, firstName: true, lastName: true },
        },
        _count: { select: { comments: true, likes: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: perPage,
    }),
    prisma.post.count({ where: { isPublished: true } }),
  ]);

  return NextResponse.json({
    data: posts.map((p) => ({
      ...p,
      authorName: \`\${p.author.firstName} \${p.author.lastName}\`.trim(),
      commentCount: p._count.comments,
      likeCount: p._count.likes,
    })),
    meta: {
      page,
      per_page: perPage,
      total,
      total_pages: Math.ceil(total / perPage),
    },
  });
}

// POST /api/posts — Créer un article
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Non authentifié" } },
      { status: 401 }
    );
  }

  const body = await req.json();
  const result = createPostSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Données invalides",
          details: result.error.flatten().fieldErrors,
        },
      },
      { status: 400 }
    );
  }

  const post = await prisma.post.create({
    data: {
      title: result.data.title,
      slug: slugify(result.data.title) + "-" + Date.now(),
      content: result.data.content,
      authorId: (session.user as any).id,
      isPublished: true,
    },
  });

  return NextResponse.json({ data: post }, { status: 201 });
}`;

const postDetailCode = `// src/app/api/posts/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { updatePostSchema } from "@/lib/validations";

interface Params {
  params: { slug: string };
}

// GET /api/posts/:slug — Détail + incrémente les vues
export async function GET(req: NextRequest, { params }: Params) {
  const post = await prisma.post.update({
    where: { slug: params.slug },
    data: { viewCount: { increment: 1 } },
    include: {
      author: {
        select: { id: true, username: true, firstName: true, lastName: true },
      },
      _count: { select: { comments: true, likes: true } },
    },
  });

  if (!post) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Article introuvable" } },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: post });
}

// PATCH /api/posts/:slug — Modifier un article
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Non authentifié" } },
      { status: 401 }
    );
  }

  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
  });

  if (!post) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Article introuvable" } },
      { status: 404 }
    );
  }

  if (post.authorId !== (session.user as any).id) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Non autorisé" } },
      { status: 403 }
    );
  }

  const body = await req.json();
  const result = updatePostSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Données invalides", details: result.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }

  const updated = await prisma.post.update({
    where: { slug: params.slug },
    data: result.data,
  });

  return NextResponse.json({ data: updated });
}

// DELETE /api/posts/:slug — Supprimer un article
export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Non authentifié" } },
      { status: 401 }
    );
  }

  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
  });

  if (!post || post.authorId !== (session.user as any).id) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Non autorisé" } },
      { status: 403 }
    );
  }

  await prisma.post.delete({ where: { slug: params.slug } });
  return new NextResponse(null, { status: 204 });
}`;

const commentsRouteCode = `// src/app/api/posts/[slug]/comments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { createCommentSchema } from "@/lib/validations";

interface Params {
  params: { slug: string };
}

// GET /api/posts/:slug/comments
export async function GET(req: NextRequest, { params }: Params) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    select: { id: true },
  });

  if (!post) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Article introuvable" } },
      { status: 404 }
    );
  }

  const comments = await prisma.comment.findMany({
    where: { postId: post.id },
    include: {
      author: {
        select: { id: true, username: true, firstName: true, lastName: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: comments });
}

// POST /api/posts/:slug/comments
export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Non authentifié" } },
      { status: 401 }
    );
  }

  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    select: { id: true },
  });

  if (!post) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Article introuvable" } },
      { status: 404 }
    );
  }

  const body = await req.json();
  const result = createCommentSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Données invalides", details: result.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }

  const comment = await prisma.comment.create({
    data: {
      content: result.data.content,
      postId: post.id,
      authorId: (session.user as any).id,
    },
    include: {
      author: {
        select: { id: true, username: true, firstName: true, lastName: true },
      },
    },
  });

  return NextResponse.json({ data: comment }, { status: 201 });
}`;

const likesRouteCode = `// src/app/api/posts/[slug]/likes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

interface Params {
  params: { slug: string };
}

// POST /api/posts/:slug/likes — Toggle like
export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Non authentifié" } },
      { status: 401 }
    );
  }

  const userId = (session.user as any).id;

  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    select: { id: true },
  });

  if (!post) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Article introuvable" } },
      { status: 404 }
    );
  }

  // Vérifier si le like existe déjà
  const existingLike = await prisma.like.findUnique({
    where: {
      postId_userId: { postId: post.id, userId },
    },
  });

  if (existingLike) {
    // Unlike
    await prisma.like.delete({
      where: { id: existingLike.id },
    });
  } else {
    // Like
    await prisma.like.create({
      data: { postId: post.id, userId },
    });
  }

  // Retourner le nouveau statut
  const likeCount = await prisma.like.count({
    where: { postId: post.id },
  });

  return NextResponse.json({
    data: {
      isLiked: !existingLike,
      likeCount,
    },
  });
}

// GET /api/posts/:slug/likes — Statut du like
export async function GET(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  const userId = session ? (session.user as any).id : null;

  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    select: { id: true },
  });

  if (!post) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Article introuvable" } },
      { status: 404 }
    );
  }

  const [likeCount, userLike] = await Promise.all([
    prisma.like.count({ where: { postId: post.id } }),
    userId
      ? prisma.like.findUnique({
          where: { postId_userId: { postId: post.id, userId } },
        })
      : null,
  ]);

  return NextResponse.json({
    data: {
      isLiked: !!userLike,
      likeCount,
    },
  });
}`;

const errorHandlerCode = `// src/lib/api-error.ts
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export function handleApiError(error: unknown) {
  // Erreur de validation Zod
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Données invalides",
          details: error.flatten().fieldErrors,
        },
      },
      { status: 400 }
    );
  }

  // Erreur Prisma : enregistrement non trouvé
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Ressource introuvable" } },
      { status: 404 }
    );
  }

  // Erreur Prisma : contrainte unique violée
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return NextResponse.json(
      {
        error: {
          code: "CONFLICT",
          message: "Cette ressource existe déjà",
        },
      },
      { status: 409 }
    );
  }

  // Erreur inattendue
  console.error("API Error:", error);
  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "Erreur interne du serveur",
      },
    },
    { status: 500 }
  );
}

// Utilisation dans un route handler :
// try {
//   // ... logique
// } catch (error) {
//   return handleApiError(error);
// }`;

export default function ApiRoutes() {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>Full-Stack — API Routes</h1>

      <p>
        Toutes les API Routes du blog implémentées avec les Route Handlers de Next.js, 
        la validation Zod et Prisma pour l'accès aux données.
      </p>

      <Callout type="info" title="Format de réponse standard">
        Toutes les API suivent le format GhennySoft : <code>{"{ data, meta }"}</code> pour 
        les succès et <code>{"{ error: { code, message, details } }"}</code> pour les erreurs.
      </Callout>

      <hr />

      <h2 id="validations">Validations Zod</h2>
      <CodeBlock code={validationsCode} language="typescript" />

      <h2 id="posts">CRUD Articles</h2>
      <CodeBlock code={postsRouteCode} language="typescript" />

      <h2 id="post-detail">Détail & Update & Delete</h2>
      <CodeBlock code={postDetailCode} language="typescript" />

      <h2 id="comments">Commentaires</h2>
      <CodeBlock code={commentsRouteCode} language="typescript" />

      <h2 id="likes">Likes (toggle)</h2>
      <CodeBlock code={likesRouteCode} language="typescript" />

      <h2 id="errors">Gestion des erreurs</h2>
      <p>
        Un handler centralisé pour les erreurs Zod, Prisma et les erreurs inattendues.
      </p>
      <CodeBlock code={errorHandlerCode} language="typescript" />

      <DocsPagination
        prev={{ title: "NextAuth.js", href: "/docs/nextjs-fullstack/auth" }}
        next={{ title: "Pages du blog", href: "/docs/nextjs-fullstack/pages" }}
      />
    </DocsLayout>
  );
}
