import { cn } from "@/lib/utils";

interface TocItem {
  title: string;
  href: string;
  level: number;
}

interface TableOfContentsProps {
  items: TocItem[];
  activeId?: string;
}

export function TableOfContents({ items, activeId }: TableOfContentsProps) {
  return (
    <aside className="hidden xl:block w-56 shrink-0">
      <div className="sticky top-20 py-6 pr-4">
        <nav>
          <div className="border-l-2 border-toc-border pl-4">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "block py-1 text-sm transition-colors",
                  item.level === 2 ? "ml-0" : "ml-3",
                  activeId === item.href.slice(1)
                    ? "text-toc-active font-medium"
                    : "text-toc-foreground hover:text-toc-hover"
                )}
              >
                {item.title}
              </a>
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
}
