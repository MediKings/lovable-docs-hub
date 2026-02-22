import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SidebarItem {
  title: string;
  href?: string;
  items?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Démarrage",
    items: [
      { title: "Introduction", href: "/docs" },
    ],
  },
  {
    title: "Standards Généraux",
    items: [
      { title: "Principes Clean Code", href: "/docs/clean-code" },
      { title: "Conventions de nommage", href: "/docs/naming" },
    ],
  },
  {
    title: "Frontend",
    items: [
      { title: "React & Tailwind", href: "/docs/frontend/react" },
      { title: "Next.js", href: "/docs/frontend/nextjs" },
    ],
  },
  {
    title: "Backend",
    items: [
      { title: "Django REST Framework", href: "/docs/backend/django" },
      { title: "Standards API REST", href: "/docs/backend/api" },
    ],
  },
  {
    title: "Git & Workflow",
    items: [
      { title: "Nommage des commits", href: "/docs/git/commits" },
      { title: "Git Flow & Branches", href: "/docs/git/workflow" },
    ],
  },
  {
    title: "Librairies & Sécurité",
    items: [
      { title: "Librairies recommandées", href: "/docs/libraries" },
      { title: "Sécurité", href: "/docs/security" },
    ],
  },
  {
    title: "Projet : Blog API (DRF)",
    items: [
      { title: "Authentification JWT", href: "/docs/authentication" },
      { title: "Modèle Post", href: "/docs/models/post" },
      { title: "Modèle Comment", href: "/docs/models/comment" },
      { title: "Modèle Like", href: "/docs/models/like" },
      { title: "PostSerializer", href: "/docs/serializers/post" },
      { title: "CommentSerializer", href: "/docs/serializers/comment" },
      { title: "LikeSerializer", href: "/docs/serializers/like" },
      { title: "CRUD Articles", href: "/docs/views/posts" },
      { title: "Commentaires", href: "/docs/views/comments" },
      { title: "Likes", href: "/docs/views/likes" },
      { title: "Nombre de vues", href: "/docs/views/view-count" },
    ],
  },
  {
    title: "Projet : Next.js Frontend (DRF)",
    items: [
      { title: "Setup & Configuration", href: "/docs/nextjs-frontend/setup" },
      { title: "Authentification", href: "/docs/nextjs-frontend/auth" },
      { title: "Pages Articles", href: "/docs/nextjs-frontend/posts" },
      { title: "Commentaires & Likes", href: "/docs/nextjs-frontend/comments" },
    ],
  },
  {
    title: "Projet : Next.js Full-Stack (Prisma)",
    items: [
      { title: "Prisma & PostgreSQL", href: "/docs/nextjs-fullstack/prisma" },
      { title: "NextAuth.js", href: "/docs/nextjs-fullstack/auth" },
      { title: "API Routes", href: "/docs/nextjs-fullstack/api" },
      { title: "Pages du Blog", href: "/docs/nextjs-fullstack/pages" },
    ],
  },
];

interface SidebarSectionProps {
  item: SidebarItem;
}

function SidebarSection({ item }: SidebarSectionProps) {
  const location = useLocation();
  const hasActiveChild = item.items?.some((sub) => location.pathname === sub.href);
  const [isOpen, setIsOpen] = useState(hasActiveChild ?? true);

  if (!item.items) {
    return (
      <Link
        to={item.href || "#"}
        className={cn(
          "block py-1.5 text-sm transition-colors",
          location.pathname === item.href
            ? "text-sidebar-active font-medium border-l-2 border-accent-primary pl-3 -ml-[2px]"
            : "text-sidebar-foreground hover:text-sidebar-hover"
        )}
      >
        {item.title}
      </Link>
    );
  }

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-2 text-sm font-semibold text-sidebar-section hover:text-sidebar-hover transition-colors"
      >
        {item.title}
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen && (
        <div className="mt-1 ml-0 space-y-0.5">
          {item.items.map((subItem) => (
            <Link
              key={subItem.href}
              to={subItem.href || "#"}
              className={cn(
                "block py-1.5 text-sm transition-colors",
                location.pathname === subItem.href
                  ? "text-sidebar-active font-medium border-l-2 border-accent-primary pl-3 -ml-[2px]"
                  : "text-sidebar-foreground hover:text-sidebar-hover pl-3"
              )}
            >
              {subItem.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden lg:block w-64 shrink-0 border-r border-sidebar-border bg-sidebar">
      <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-6 px-4">
        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <SidebarSection key={item.title} item={item} />
          ))}
        </nav>
      </div>
    </aside>
  );
}
