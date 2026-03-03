import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Hook usePosts", href: "#hook", level: 2 },
  { title: "Composant PostCard", href: "#post-card", level: 2 },
  { title: "Liste des articles", href: "#list", level: 2 },
  { title: "Détail d'un article", href: "#detail", level: 2 },
  { title: "Création d'article (Tiptap)", href: "#create", level: 2 },
];

const hookCode = `// src/hooks/use-posts.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { Post, CreatePostPayload } from "@/types/post";
import type { ApiResponse } from "@/types/api";

export const usePosts = (page = 1) => {
  return useQuery({
    queryKey: ["posts", page],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Post[]>>("/posts/", {
        params: { page },
      });
      return data;
    },
  });
};

export const usePost = (slug: string) => {
  return useQuery({
    queryKey: ["post", slug],
    queryFn: async () => {
      const { data } = await apiClient.get<Post>(\`/posts/\${slug}/\`);
      return data;
    },
    enabled: !!slug,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePostPayload) => {
      const { data } = await apiClient.post<Post>("/posts/", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slug: string) => {
      await apiClient.delete(\`/posts/\${slug}/\`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};`;

const postCardCode = `// src/components/posts/post-card.tsx
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageCircle, Eye, Heart } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import type { Post } from "@/types/post";

interface PostCardProps {
  post: Post;
}

export const PostCard = ({ post }: PostCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <Link
          href={\`/posts/\${post.slug}\`}
          className="text-lg font-semibold hover:text-primary transition-colors"
        >
          {post.title}
        </Link>
        <p className="text-sm text-muted-foreground">
          Par {post.author_name} ·{" "}
          {formatDistanceToNow(new Date(post.created_at), {
            addSuffix: true,
            locale: fr,
          })}
        </p>
      </CardHeader>
      <CardContent>
        {/* Rendu HTML riche (Tiptap) */}
        <div
          className="text-muted-foreground line-clamp-3 text-sm prose prose-sm"
          dangerouslySetInnerHTML={{ __html: post.content.slice(0, 300) }}
        />
      </CardContent>
      <CardFooter className="gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Eye className="w-4 h-4" /> {post.view_count}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="w-4 h-4" /> {post.comment_count}
        </span>
        <span className="flex items-center gap-1">
          <Heart className="w-4 h-4" /> {post.like_count ?? 0}
        </span>
      </CardFooter>
    </Card>
  );
};`;

const listPageCode = `// src/app/posts/page.tsx
"use client";

import { useState } from "react";
import { usePosts } from "@/hooks/use-posts";
import { PostCard } from "@/components/posts/post-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const PostsPage = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = usePosts(page);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-3xl mx-auto py-8 text-center">
        <p className="text-destructive">
          Erreur lors du chargement des articles.
        </p>
      </div>
    );
  }

  const posts = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Articles</h1>
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {meta && meta.total_pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Précédent
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {page} / {meta.total_pages}
          </span>
          <Button
            variant="outline"
            disabled={page >= meta.total_pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
};

export default PostsPage;`;

const detailPageCode = `// src/app/posts/[slug]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, Trash2 } from "lucide-react";
import { usePost, useDeletePost } from "@/hooks/use-posts";
import { useAuth } from "@/providers/auth-provider";
import { CommentList } from "@/components/comments/comment-list";
import { CommentForm } from "@/components/comments/comment-form";
import { LikeButton } from "@/components/posts/like-button";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const PostDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { data: post, isLoading } = usePost(slug);
  const deletePost = useDeletePost();

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-8 space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!post) return null;

  const handleDelete = async () => {
    if (!confirm("Supprimer cet article ?")) return;
    await deletePost.mutateAsync(slug);
    router.push("/posts");
  };

  return (
    <article className="max-w-3xl mx-auto py-8">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Retour
      </Button>

      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
        <span>Par {post.author_name}</span>
        <span>
          {formatDistanceToNow(new Date(post.created_at), {
            addSuffix: true,
            locale: fr,
          })}
        </span>
        {user?.id === post.author && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deletePost.isPending}
          >
            <Trash2 className="w-4 h-4 mr-1" /> Supprimer
          </Button>
        )}
      </div>

      {/* ✅ Rendu HTML riche généré par Tiptap */}
      <div
        className="prose prose-neutral max-w-none mb-8"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <div className="flex items-center gap-4 border-t border-b py-4 mb-8">
        <LikeButton postId={post.id} />
        <span className="text-sm text-muted-foreground">
          {post.view_count} vues
        </span>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">
          Commentaires ({post.comment_count})
        </h2>
        {user && <CommentForm postId={post.id} />}
        <CommentList postId={post.id} />
      </section>
    </article>
  );
};

export default PostDetailPage;`;

const createPageCode = `// src/app/posts/create/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreatePost } from "@/hooks/use-posts";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const postSchema = z.object({
  title: z
    .string()
    .min(5, "Le titre doit contenir au moins 5 caractères")
    .max(200, "Maximum 200 caractères"),
  content: z
    .string()
    .min(20, "Le contenu doit contenir au moins 20 caractères"),
});

type PostForm = z.infer<typeof postSchema>;

const CreatePostPage = () => {
  const router = useRouter();
  const createPost = useCreatePost();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PostForm>({
    resolver: zodResolver(postSchema),
    defaultValues: { title: "", content: "" },
  });

  const onSubmit = async (data: PostForm) => {
    const post = await createPost.mutateAsync(data);
    router.push(\`/posts/\${post.slug}\`);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Nouvel article</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                placeholder="Mon article..."
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* ✅ Tiptap Rich Text Editor au lieu de <Textarea> */}
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
                <p className="text-sm text-destructive">{errors.content.message}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Publication..." : "Publier"}
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

const PostPages = () => {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>Next.js Frontend — Articles (CRUD)</h1>

      <p>
        Gestion complète des articles avec <strong>Axios</strong> + <strong>TanStack Query v5</strong> pour 
        les requêtes et le cache, <strong>Zod</strong> + <strong>React Hook Form</strong> pour la validation, 
        et <strong>Tiptap</strong> comme éditeur de contenu riche.
      </p>

      <Callout type="tip" title="Pattern GhennySoft">
        Chaque entité a son propre hook (<code>usePosts</code>, <code>useComments</code>) 
        qui encapsule toutes les requêtes Axios. Les composants ne font jamais d'appels 
        API directement.
      </Callout>

      <hr />

      <h2 id="hook">Hook usePosts</h2>
      <CodeBlock code={hookCode} language="typescript" />

      <h2 id="post-card">Composant PostCard</h2>
      <CodeBlock code={postCardCode} language="typescript" />

      <h2 id="list">Liste des articles</h2>
      <CodeBlock code={listPageCode} language="typescript" />

      <h2 id="detail">Détail d'un article</h2>
      <p>
        Le contenu est rendu en HTML riche grâce à <code>dangerouslySetInnerHTML</code> car 
        il est généré par Tiptap côté création.
      </p>
      <CodeBlock code={detailPageCode} language="typescript" />

      <h2 id="create">Création d'article (Tiptap)</h2>
      <Callout type="info" title="Éditeur riche">
        Le formulaire utilise <strong>Tiptap</strong> au lieu d'un simple <code>&lt;Textarea&gt;</code>. 
        Le composant <code>TiptapEditor</code> est intégré via <code>Controller</code> de React Hook Form 
        pour une validation Zod transparente.
      </Callout>
      <CodeBlock code={createPageCode} language="typescript" />

      <DocsPagination
        prev={{ title: "Authentification", href: "/docs/nextjs-frontend/auth" }}
        next={{ title: "Commentaires & Likes", href: "/docs/nextjs-frontend/comments" }}
      />
    </DocsLayout>
  );
};

export default PostPages;
