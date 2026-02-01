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
    title: "Les Bases",
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Composants de base", href: "/docs/components" },
      { title: "Fondamentaux React", href: "/docs/react-fundamentals" },
      { title: "Gestion du texte", href: "/docs/text-input" },
      { title: "Utiliser les ScrollView", href: "/docs/scrollview" },
      { title: "Utiliser les listes", href: "/docs/list-views" },
    ],
  },
  {
    title: "Configuration",
    items: [
      { title: "Installation", href: "/docs/installation" },
      { title: "Structure du projet", href: "/docs/project-structure" },
      { title: "Variables d'environnement", href: "/docs/environment" },
    ],
  },
  {
    title: "Workflow",
    items: [
      { title: "Développement", href: "/docs/development" },
      { title: "Tests", href: "/docs/testing" },
      { title: "Déploiement", href: "/docs/deployment" },
    ],
  },
  {
    title: "Design",
    items: [
      { title: "Styles", href: "/docs/styles" },
      { title: "Thèmes", href: "/docs/themes" },
      { title: "Responsive", href: "/docs/responsive" },
    ],
  },
  {
    title: "Performance",
    items: [
      { title: "Optimisation", href: "/docs/optimization" },
      { title: "Lazy Loading", href: "/docs/lazy-loading" },
      { title: "Caching", href: "/docs/caching" },
    ],
  },
];

interface SidebarSectionProps {
  item: SidebarItem;
}

function SidebarSection({ item }: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

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
