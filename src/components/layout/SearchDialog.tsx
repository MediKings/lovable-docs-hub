import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface SearchItem {
  title: string;
  href: string;
  category: string;
}

const searchItems: SearchItem[] = [
  // Démarrage
  { title: "Introduction", href: "/docs", category: "Démarrage" },
  // Standards
  { title: "Principes Clean Code", href: "/docs/clean-code", category: "Standards" },
  { title: "Conventions de nommage", href: "/docs/naming", category: "Standards" },
  // Frontend
  { title: "React & Tailwind", href: "/docs/frontend/react", category: "Frontend" },
  { title: "Next.js Standards", href: "/docs/frontend/nextjs", category: "Frontend" },
  // Backend
  { title: "Django REST Framework", href: "/docs/backend/django", category: "Backend" },
  { title: "Standards API REST", href: "/docs/backend/api", category: "Backend" },
  // Git
  { title: "Nommage des commits", href: "/docs/git/commits", category: "Git" },
  { title: "Git Flow & Branches", href: "/docs/git/workflow", category: "Git" },
  // Librairies & Sécurité
  { title: "Librairies recommandées", href: "/docs/libraries", category: "Outils" },
  { title: "Sécurité", href: "/docs/security", category: "Outils" },
  // Blog DRF
  { title: "Authentification JWT", href: "/docs/authentication", category: "Blog DRF" },
  { title: "Modèle Post", href: "/docs/models/post", category: "Blog DRF" },
  { title: "Modèle Comment", href: "/docs/models/comment", category: "Blog DRF" },
  { title: "Modèle Like", href: "/docs/models/like", category: "Blog DRF" },
  { title: "PostSerializer", href: "/docs/serializers/post", category: "Blog DRF" },
  { title: "CommentSerializer", href: "/docs/serializers/comment", category: "Blog DRF" },
  { title: "LikeSerializer", href: "/docs/serializers/like", category: "Blog DRF" },
  { title: "CRUD Articles (DRF)", href: "/docs/views/posts", category: "Blog DRF" },
  { title: "Commentaires (DRF)", href: "/docs/views/comments", category: "Blog DRF" },
  { title: "Likes (DRF)", href: "/docs/views/likes", category: "Blog DRF" },
  { title: "Nombre de vues (DRF)", href: "/docs/views/view-count", category: "Blog DRF" },
  // Next.js Frontend
  { title: "Setup Frontend Next.js", href: "/docs/nextjs-frontend/setup", category: "Next.js Frontend" },
  { title: "Auth (Frontend Next.js)", href: "/docs/nextjs-frontend/auth", category: "Next.js Frontend" },
  { title: "Articles (Frontend Next.js)", href: "/docs/nextjs-frontend/posts", category: "Next.js Frontend" },
  { title: "Commentaires & Likes (Frontend)", href: "/docs/nextjs-frontend/comments", category: "Next.js Frontend" },
  // Next.js Full-stack
  { title: "Prisma & PostgreSQL", href: "/docs/nextjs-fullstack/prisma", category: "Next.js Full-Stack" },
  { title: "NextAuth.js", href: "/docs/nextjs-fullstack/auth", category: "Next.js Full-Stack" },
  { title: "API Routes (Next.js)", href: "/docs/nextjs-fullstack/api", category: "Next.js Full-Stack" },
  { title: "Pages du Blog (Next.js)", href: "/docs/nextjs-fullstack/pages", category: "Next.js Full-Stack" },
];

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      navigate(href);
    },
    [navigate]
  );

  // Group items by category
  const grouped = searchItems.reduce<Record<string, SearchItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative hidden sm:flex items-center w-48 lg:w-64 h-9 pl-9 pr-4 rounded-lg bg-header-search border border-header-search-border text-header-search-placeholder text-sm hover:border-accent-primary/50 transition-colors"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
        <span>Rechercher...</span>
        <kbd className="ml-auto hidden lg:inline-flex items-center gap-0.5 rounded border border-header-search-border px-1.5 py-0.5 text-[10px] font-mono text-header-search-placeholder">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Rechercher dans la documentation..." />
        <CommandList>
          <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
          {Object.entries(grouped).map(([category, items]) => (
            <CommandGroup key={category} heading={category}>
              {items.map((item) => (
                <CommandItem
                  key={item.href}
                  value={item.title}
                  onSelect={() => handleSelect(item.href)}
                >
                  <Search className="mr-2 h-4 w-4 opacity-50" />
                  {item.title}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
