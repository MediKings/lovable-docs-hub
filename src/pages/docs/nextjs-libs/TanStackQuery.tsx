import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Installation & Setup", href: "#setup", level: 2 },
  { title: "Provider", href: "#provider", level: 2 },
  { title: "useQuery — Lecture", href: "#usequery", level: 2 },
  { title: "useMutation — Écriture", href: "#usemutation", level: 2 },
  { title: "Invalidation & Cache", href: "#cache", level: 2 },
  { title: "Mise à jour optimiste", href: "#optimistic", level: 2 },
  { title: "Pagination infinie", href: "#infinite", level: 2 },
];

const setupCode = `npm install @tanstack/react-query @tanstack/react-query-devtools`;

const providerCode = `// src/providers/query-provider.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

export const QueryProvider = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,        // 1 minute
            gcTime: 5 * 60 * 1000,       // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

// src/app/layout.tsx
import { QueryProvider } from "@/providers/query-provider";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}`;

const useQueryCode = `// src/hooks/use-posts.ts
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { Post } from "@/types/post";

// ✅ Clés de requête centralisées
export const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...postKeys.lists(), filters] as const,
  details: () => [...postKeys.all, "detail"] as const,
  detail: (slug: string) => [...postKeys.details(), slug] as const,
};

// ✅ Hook pour la liste des articles
export const usePosts = (page = 1, search = "") => {
  return useQuery({
    queryKey: postKeys.list({ page, search }),
    queryFn: async () => {
      const { data } = await apiClient.get<{
        results: Post[];
        count: number;
      }>("/posts/", { params: { page, search } });
      return data;
    },
  });
};

// ✅ Hook pour un article par slug
export const usePost = (slug: string) => {
  return useQuery({
    queryKey: postKeys.detail(slug),
    queryFn: async () => {
      const { data } = await apiClient.get<Post>(\`/posts/\${slug}/\`);
      return data;
    },
    enabled: !!slug,
  });
};

// ✅ Utilisation dans un composant
const PostListPage = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = usePosts(page);

  if (isLoading) return <PostListSkeleton />;
  if (isError) return <ErrorMessage message={error.message} />;

  return (
    <>
      <PostGrid posts={data.results} />
      <Pagination
        total={data.count}
        page={page}
        onPageChange={setPage}
      />
    </>
  );
};`;

const useMutationCode = `// src/hooks/use-posts.ts (suite)
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ✅ Mutation pour créer un article
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePostPayload) => {
      const { data } = await apiClient.post<Post>("/posts/", payload);
      return data;
    },
    onSuccess: (newPost) => {
      // Invalider la liste pour refetch
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      toast.success(\`Article "\${newPost.title}" créé\`);
    },
    onError: (error) => {
      handleApiError(error);
    },
  });
};

// ✅ Mutation pour supprimer
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: number) => {
      await apiClient.delete(\`/posts/\${postId}/\`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      toast.success("Article supprimé");
    },
  });
};

// ✅ Utilisation dans un formulaire
const CreatePostForm = () => {
  const { mutate, isPending } = useCreatePost();
  const router = useRouter();

  const onSubmit = (data: CreatePostPayload) => {
    mutate(data, {
      onSuccess: (post) => router.push(\`/posts/\${post.slug}\`),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* champs du formulaire */}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Création..." : "Publier"}
      </Button>
    </form>
  );
};`;

const cacheCode = `// ✅ Stratégies d'invalidation du cache
const queryClient = useQueryClient();

// Invalider toutes les listes de posts
queryClient.invalidateQueries({ queryKey: postKeys.lists() });

// Invalider un post spécifique
queryClient.invalidateQueries({ queryKey: postKeys.detail("mon-slug") });

// Invalider tout ce qui concerne les posts
queryClient.invalidateQueries({ queryKey: postKeys.all });

// ✅ Pré-remplir le cache (prefetch)
// Utile pour le hover sur un lien
const prefetchPost = (slug: string) => {
  queryClient.prefetchQuery({
    queryKey: postKeys.detail(slug),
    queryFn: () => apiClient.get(\`/posts/\${slug}/\`).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
};

// ✅ Mise à jour manuelle du cache
queryClient.setQueryData(postKeys.detail("mon-slug"), (old: Post) => ({
  ...old,
  title: "Nouveau titre",
}));`;

const optimisticCode = `// ✅ Like avec mise à jour optimiste
export const useToggleLike = (postId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post(\`/posts/\${postId}/like/\`);
      return data;
    },
    // Avant l'appel API : mettre à jour le cache immédiatement
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: postKeys.detail(postId) });

      const previous = queryClient.getQueryData<Post>(
        postKeys.detail(postId)
      );

      queryClient.setQueryData(postKeys.detail(postId), (old: Post) => ({
        ...old,
        is_liked: !old.is_liked,
        like_count: old.is_liked ? old.like_count - 1 : old.like_count + 1,
      }));

      return { previous };
    },
    // En cas d'erreur : rollback
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          postKeys.detail(postId),
          context.previous
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
    },
  });
};`;

const infiniteCode = `// ✅ Scroll infini avec useInfiniteQuery
import { useInfiniteQuery } from "@tanstack/react-query";

export const useInfinitePosts = () => {
  return useInfiniteQuery({
    queryKey: postKeys.list({ infinite: true }),
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await apiClient.get("/posts/", {
        params: { page: pageParam, per_page: 10 },
      });
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.results.length === 10
        ? allPages.length + 1
        : undefined;
    },
  });
};

// ✅ Composant avec IntersectionObserver
const InfinitePostList = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePosts();
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  return (
    <div>
      {data?.pages.map((page) =>
        page.results.map((post: Post) => (
          <PostCard key={post.id} post={post} />
        ))
      )}
      <div ref={observerRef}>
        {isFetchingNextPage && <Spinner />}
      </div>
    </div>
  );
};`;

const TanStackQuery = () => {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>TanStack Query — Gestion d'état serveur</h1>

      <p>
        TanStack Query (React Query) est la librairie standard chez GhennySoft pour gérer 
        les données serveur : fetching, caching, synchronisation et mise à jour optimiste.
      </p>

      <Callout type="info" title="Combinaison Axios + TanStack Query">
        Axios gère le <strong>transport HTTP</strong> (intercepteurs, tokens). TanStack Query gère 
        le <strong>cycle de vie des données</strong> (cache, refetch, invalidation). Les deux sont complémentaires.
      </Callout>

      <hr />

      <h2 id="setup">Installation & Setup</h2>
      <CodeBlock code={setupCode} language="bash" />

      <h2 id="provider">Provider</h2>
      <CodeBlock code={providerCode} language="tsx" />

      <h2 id="usequery">useQuery — Lecture</h2>
      <p>
        Utiliser des <strong>query keys structurées</strong> et des hooks dédiés par entité 
        pour faciliter l'invalidation et la réutilisation.
      </p>
      <CodeBlock code={useQueryCode} language="tsx" />

      <h2 id="usemutation">useMutation — Écriture</h2>
      <CodeBlock code={useMutationCode} language="tsx" />

      <h2 id="cache">Invalidation & Cache</h2>
      <CodeBlock code={cacheCode} language="typescript" />

      <h2 id="optimistic">Mise à jour optimiste</h2>
      <p>
        La mise à jour optimiste améliore l'UX en reflétant immédiatement l'action 
        dans l'interface, avec rollback automatique en cas d'erreur.
      </p>
      <CodeBlock code={optimisticCode} language="typescript" />

      <h2 id="infinite">Pagination infinie</h2>
      <CodeBlock code={infiniteCode} language="tsx" />

      <DocsPagination
        prev={{ title: "Axios", href: "/docs/nextjs-libs/axios" }}
        next={{ title: "Tiptap", href: "/docs/nextjs-libs/tiptap" }}
      />
    </DocsLayout>
  );
};

export default TanStackQuery;
