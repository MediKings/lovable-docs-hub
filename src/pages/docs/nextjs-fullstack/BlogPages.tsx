import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Page d'accueil (Server)", href: "#home", level: 2 },
  { title: "Détail article (Server)", href: "#detail", level: 2 },
  { title: "Composant PostCard", href: "#post-card", level: 2 },
  { title: "Formulaire (Tiptap + Axios)", href: "#form", level: 2 },
  { title: "Metadata SEO", href: "#seo", level: 2 },
];

const homePageCode = `// src/app/posts/page.tsx — Server Component
import { prisma } from "@/lib/prisma";
import { PostCard } from "@/components/posts/post-card";
import { Pagination } from "@/components/ui/pagination";

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export const metadata = {
  title: "Articles | GhennySoft Blog",
  description: "Découvrez nos derniers articles techniques",
};

const PostsPage = async ({ searchParams }: Props) => {
  const { page: pageParam } = await searchParams;
  const page = parseInt(pageParam ?? "1");
  const perPage = 10;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { isPublished: true },
      include: {
        author: {
          select: { name: true, image: true },
        },
        _count: { select: { comments: true, likes: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.post.count({ where: { isPublished: true } }),
  ]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Articles</h1>
        <span className="text-sm text-muted-foreground">
          {total} article{total > 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={{
              ...post,
              authorName: post.author.name ?? "Anonyme",
              commentCount: post._count.comments,
              likeCount: post._count.likes,
            }}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} />
      )}
    </div>
  );
};

export default PostsPage;`;

const detailPageCode = `// src/app/posts/[slug]/page.tsx — Server Component
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { CommentSection } from "@/components/comments/comment-section";
import { LikeButton } from "@/components/posts/like-button";
import { DeletePostButton } from "@/components/posts/delete-button";

interface Props {
  params: Promise<{ slug: string }>;
}

// SEO dynamique
export const generateMetadata = async ({ params }: Props) => {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    select: { title: true, content: true },
  });

  if (!post) return { title: "Article introuvable" };

  // Extraire le texte brut du HTML (Tiptap)
  const plainText = post.content.replace(/<[^>]+>/g, "");

  return {
    title: \`\${post.title} | GhennySoft Blog\`,
    description: plainText.slice(0, 155) + "...",
    openGraph: {
      title: post.title,
      description: plainText.slice(0, 155),
      type: "article",
    },
  };
};

const PostDetailPage = async ({ params }: Props) => {
  const { slug } = await params;
  const session = await getSession(await headers());

  // Récupérer le post ET incrémenter les vues en une requête
  const post = await prisma.post.update({
    where: { slug },
    data: { viewCount: { increment: 1 } },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: { select: { comments: true, likes: true } },
    },
  });

  if (!post) notFound();

  const isAuthor = session?.user?.id === post.authorId;

  return (
    <article className="max-w-3xl mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-3">{post.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Par {post.author.name}</span>
          <span>
            {formatDistanceToNow(post.createdAt, {
              addSuffix: true,
              locale: fr,
            })}
          </span>
          <span>{post.viewCount} vues</span>
        </div>
      </header>

      {/* ✅ Rendu HTML riche généré par Tiptap */}
      <div
        className="prose prose-neutral max-w-none mb-8"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <div className="flex items-center gap-4 border-t border-b py-4 mb-8">
        <LikeButton slug={post.slug} initialCount={post._count.likes} />
        {isAuthor && <DeletePostButton slug={post.slug} />}
      </div>

      {/* Section commentaires (Client Component) */}
      <CommentSection
        postSlug={post.slug}
        commentCount={post._count.comments}
        isAuthenticated={!!session}
      />
    </article>
  );
};

export default PostDetailPage;`;

const postCardCode = `// src/components/posts/post-card.tsx
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageCircle, Eye, Heart } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

interface PostCardProps {
  post: {
    slug: string;
    title: string;
    content: string;     // HTML riche (Tiptap)
    authorName: string;
    viewCount: number;
    commentCount: number;
    likeCount: number;
    createdAt: Date;
  };
}

export const PostCard = ({ post }: PostCardProps) => {
  // Extraire le texte brut du HTML pour l'aperçu
  const plainText = post.content.replace(/<[^>]+>/g, "");

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <Link
          href={\`/posts/\${post.slug}\`}
          className="text-lg font-semibold group-hover:text-primary transition-colors"
        >
          {post.title}
        </Link>
        <p className="text-sm text-muted-foreground">
          Par {post.authorName} ·{" "}
          {formatDistanceToNow(post.createdAt, {
            addSuffix: true,
            locale: fr,
          })}
        </p>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-2 text-sm">
          {plainText.slice(0, 200)}
        </p>
      </CardContent>
      <CardFooter className="gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" /> {post.viewCount}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="w-3.5 h-3.5" /> {post.commentCount}
        </span>
        <span className="flex items-center gap-1">
          <Heart className="w-3.5 h-3.5" /> {post.likeCount}
        </span>
      </CardFooter>
    </Card>
  );
};`;

const formCode = `// src/app/posts/create/page.tsx — Client Component
// ✅ Utilise Axios, TanStack Query, Zod, React Hook Form et Tiptap
"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import axios from "@/lib/api-client";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const postSchema = z.object({
  title: z
    .string()
    .min(5, "Le titre doit contenir au moins 5 caractères")
    .max(200, "Maximum 200 caractères"),
  content: z
    .string()
    .min(20, "Le contenu doit contenir au moins 20 caractères"),
});

type PostFormData = z.infer<typeof postSchema>;

const CreatePostPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: { title: "", content: "" },
  });

  // ✅ Mutation via Axios + TanStack Query
  const createPost = useMutation({
    mutationFn: async (data: PostFormData) => {
      const { data: result } = await axios.post("/api/posts", data);
      return result.data;
    },
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      router.push(\`/posts/\${post.slug}\`);
      router.refresh();
    },
  });

  const onSubmit = (data: PostFormData) => {
    createPost.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Nouvel article</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {createPost.error && (
              <div className="p-3 rounded bg-destructive/10 text-destructive text-sm">
                Erreur lors de la publication. Veuillez réessayer.
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input id="title" {...register("title")} />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* ✅ Tiptap Rich Text Editor */}
            <div className="space-y-2">
              <Label>Contenu</Label>
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <TiptapEditor
                    content={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.content && (
                <p className="text-sm text-destructive">
                  {errors.content.message}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={createPost.isPending}>
                {createPost.isPending ? "Publication..." : "Publier"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePostPage;`;

const seoCode = `// Metadata statique (pages sans données dynamiques)
export const metadata = {
  title: "Articles | GhennySoft Blog",
  description: "Découvrez nos articles techniques sur le développement",
};

// Metadata dynamique (pages avec données)
export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
  });

  const plainText = post?.content.replace(/<[^>]+>/g, "") ?? "";

  return {
    title: \`\${post?.title} | GhennySoft Blog\`,
    description: plainText.slice(0, 155),
    openGraph: {
      type: "article",
      title: post?.title,
      publishedTime: post?.createdAt.toISOString(),
    },
  };
};

// Pré-générer les pages statiques (SSG)
export const generateStaticParams = async () => {
  const posts = await prisma.post.findMany({
    where: { isPublished: true },
    select: { slug: true },
  });

  return posts.map((p) => ({ slug: p.slug }));
};`;

const BlogPages = () => {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>Full-Stack — Pages du Blog</h1>

      <p>
        Les pages du blog combinant <strong>Server Components</strong> pour le rendu 
        initial et les performances SEO, et <strong>Client Components</strong> avec 
        <strong> Axios</strong>, <strong>TanStack Query v5</strong>, <strong>Zod</strong>, 
        <strong> React Hook Form</strong> et <strong>Tiptap</strong> pour l'interactivité. 
        L'authentification est gérée par <strong>BetterAuth</strong> via l'IDP GhennySoft.
      </p>

      <Callout type="tip" title="Pattern GhennySoft">
        Privilégiez les Server Components par défaut. N'ajoutez <code>"use client"</code> que 
        pour les composants nécessitant de l'interactivité (formulaires Tiptap, boutons like, modales).
      </Callout>

      <hr />

      <h2 id="home">Page d'accueil (Server Component)</h2>
      <p>La liste des articles est rendue côté serveur. Aucun JavaScript envoyé au client pour cette page.</p>
      <CodeBlock code={homePageCode} language="typescript" />

      <h2 id="detail">Détail article (Server Component)</h2>
      <p>
        Le détail incrémente les vues et génère les métadonnées SEO dynamiquement. 
        Le contenu HTML riche (Tiptap) est rendu via <code>dangerouslySetInnerHTML</code>. 
        La session BetterAuth est récupérée via <code>getSession()</code> côté serveur.
      </p>
      <CodeBlock code={detailPageCode} language="typescript" />

      <h2 id="post-card">Composant PostCard</h2>
      <CodeBlock code={postCardCode} language="typescript" />

      <h2 id="form">Formulaire de création (Tiptap + Axios)</h2>
      <Callout type="info" title="Stack du formulaire">
        Le formulaire utilise <strong>Axios</strong> via <code>useMutation</code> de TanStack Query, 
        <strong> Zod</strong> + <strong>React Hook Form</strong> pour la validation, 
        et <strong>Tiptap</strong> comme éditeur de contenu riche au lieu d'un <code>&lt;Textarea&gt;</code>.
      </Callout>
      <CodeBlock code={formCode} language="typescript" />

      <h2 id="seo">Metadata SEO</h2>
      <p>
        Next.js 16 génère automatiquement les balises <code>&lt;head&gt;</code> à partir 
        des exports <code>metadata</code> et <code>generateMetadata</code>.
      </p>
      <CodeBlock code={seoCode} language="typescript" />

      <DocsPagination
        prev={{ title: "API Routes", href: "/docs/nextjs-fullstack/api" }}
        next={{ title: "Introduction", href: "/docs" }}
      />
    </DocsLayout>
  );
};

export default BlogPages;
