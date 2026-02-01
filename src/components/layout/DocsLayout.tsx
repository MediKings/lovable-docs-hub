import { ReactNode } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { TableOfContents } from "./TableOfContents";

interface TocItem {
  title: string;
  href: string;
  level: number;
}

interface DocsLayoutProps {
  children: ReactNode;
  tocItems?: TocItem[];
}

export function DocsLayout({ children, tocItems = [] }: DocsLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex max-w-[1400px] mx-auto">
        <Sidebar />
        <main className="flex-1 min-w-0 px-6 lg:px-12 py-8">
          <article className="prose prose-docs max-w-3xl">
            {children}
          </article>
        </main>
        {tocItems.length > 0 && <TableOfContents items={tocItems} />}
      </div>
    </div>
  );
}
