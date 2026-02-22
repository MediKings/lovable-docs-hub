import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Hook useComments", href: "#hook-comments", level: 2 },
  { title: "CommentList", href: "#comment-list", level: 2 },
  { title: "CommentForm", href: "#comment-form", level: 2 },
  { title: "Hook useLikes", href: "#hook-likes", level: 2 },
  { title: "LikeButton", href: "#like-button", level: 2 },
];

const hookCommentsCode = `// src/hooks/use-comments.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { Comment } from "@/types/comment";

export function useComments(postId: number) {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const { data } = await apiClient.get<Comment[]>(
        \`/posts/\${postId}/comments/\`
      );
      return data;
    },
    enabled: !!postId,
  });
}

export function useCreateComment(postId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      const { data } = await apiClient.post<Comment>(
        \`/posts/\${postId}/comments/\`,
        { content }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useDeleteComment(postId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: number) => {
      await apiClient.delete(\`/comments/\${commentId}/\`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });
}`;

const commentListCode = `// src/components/comments/comment-list.tsx
"use client";

import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { useComments, useDeleteComment } from "@/hooks/use-comments";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface CommentListProps {
  postId: number;
}

export function CommentList({ postId }: CommentListProps) {
  const { data: comments, isLoading } = useComments(postId);
  const { user } = useAuth();
  const deleteComment = useDeleteComment(postId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (!comments?.length) {
    return (
      <p className="text-muted-foreground text-sm py-4">
        Aucun commentaire pour le moment.
      </p>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="border rounded-lg p-4 bg-card"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{comment.author_name}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                  locale: fr,
                })}
              </span>
            </div>
            {user?.id === comment.author && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteComment.mutate(comment.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
          <p className="text-sm">{comment.content}</p>
        </div>
      ))}
    </div>
  );
}`;

const commentFormCode = `// src/components/comments/comment-form.tsx
"use client";

import { useState } from "react";
import { useCreateComment } from "@/hooks/use-comments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CommentFormProps {
  postId: number;
}

export function CommentForm({ postId }: CommentFormProps) {
  const [content, setContent] = useState("");
  const createComment = useCreateComment(postId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    await createComment.mutateAsync(content);
    setContent("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Ajouter un commentaire..."
        rows={3}
      />
      <Button
        type="submit"
        size="sm"
        disabled={!content.trim() || createComment.isPending}
      >
        {createComment.isPending ? "Envoi..." : "Commenter"}
      </Button>
    </form>
  );
}`;

const hookLikesCode = `// src/hooks/use-likes.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

interface LikeStatus {
  is_liked: boolean;
  like_count: number;
}

export function useLikeStatus(postId: number) {
  return useQuery({
    queryKey: ["like-status", postId],
    queryFn: async () => {
      const { data } = await apiClient.get<LikeStatus>(
        \`/posts/\${postId}/like-status/\`
      );
      return data;
    },
    enabled: !!postId,
  });
}

export function useToggleLike(postId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<LikeStatus>(
        \`/posts/\${postId}/toggle-like/\`
      );
      return data;
    },
    // Mise à jour optimiste du cache
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["like-status", postId] });
      const previous = queryClient.getQueryData<LikeStatus>(["like-status", postId]);

      if (previous) {
        queryClient.setQueryData<LikeStatus>(["like-status", postId], {
          is_liked: !previous.is_liked,
          like_count: previous.is_liked
            ? previous.like_count - 1
            : previous.like_count + 1,
        });
      }

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["like-status", postId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["like-status", postId] });
    },
  });
}`;

const likeButtonCode = `// src/components/posts/like-button.tsx
"use client";

import { Heart } from "lucide-react";
import { useLikeStatus, useToggleLike } from "@/hooks/use-likes";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  postId: number;
}

export function LikeButton({ postId }: LikeButtonProps) {
  const { user } = useAuth();
  const { data } = useLikeStatus(postId);
  const toggleLike = useToggleLike(postId);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => toggleLike.mutate()}
      disabled={!user || toggleLike.isPending}
      className="gap-2"
    >
      <Heart
        className={cn(
          "w-4 h-4 transition-colors",
          data?.is_liked && "fill-red-500 text-red-500"
        )}
      />
      <span>{data?.like_count ?? 0}</span>
    </Button>
  );
}`;

export default function CommentsLikes() {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>Next.js Frontend — Commentaires & Likes</h1>

      <p>
        Composants réutilisables pour les commentaires et les likes avec mise à jour 
        optimiste du cache TanStack Query.
      </p>

      <Callout type="info" title="Mise à jour optimiste">
        Le bouton Like utilise l'<strong>optimistic update</strong> de TanStack Query 
        pour une UX instantanée. Le cache est mis à jour immédiatement et corrigé 
        si la requête échoue.
      </Callout>

      <hr />

      <h2 id="hook-comments">Hook useComments</h2>
      <CodeBlock code={hookCommentsCode} language="typescript" />

      <h2 id="comment-list">CommentList</h2>
      <CodeBlock code={commentListCode} language="typescript" />

      <h2 id="comment-form">CommentForm</h2>
      <CodeBlock code={commentFormCode} language="typescript" />

      <h2 id="hook-likes">Hook useLikes</h2>
      <CodeBlock code={hookLikesCode} language="typescript" />

      <h2 id="like-button">LikeButton</h2>
      <CodeBlock code={likeButtonCode} language="typescript" />

      <DocsPagination
        prev={{ title: "Pages Articles", href: "/docs/nextjs-frontend/posts" }}
        next={{ title: "Full-Stack : Prisma Setup", href: "/docs/nextjs-fullstack/prisma" }}
      />
    </DocsLayout>
  );
}
