import { Search } from "lucide-react";
import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="sticky top-0 z-50 h-14 bg-header border-b border-header-border">
      <div className="h-full flex items-center justify-between px-4 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center">
              <span className="text-header font-bold text-lg">D</span>
            </div>
            <span className="text-header-foreground font-semibold text-lg">DevDocs</span>
          </Link>
          <span className="text-xs px-2 py-0.5 rounded bg-header-badge text-header-badge-foreground font-medium">
            v1.0
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/docs" className="text-header-nav hover:text-header-nav-hover transition-colors text-sm font-medium border-b-2 border-accent-primary pb-4 -mb-4">
            Docs
          </Link>
          <Link to="/components" className="text-header-nav hover:text-header-nav-hover transition-colors text-sm font-medium">
            Components
          </Link>
          <Link to="/api" className="text-header-nav hover:text-header-nav-hover transition-colors text-sm font-medium">
            API
          </Link>
          <Link to="/community" className="text-header-nav hover:text-header-nav-hover transition-colors text-sm font-medium">
            Community
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-header-search-icon" />
            <input
              type="text"
              placeholder="Search..."
              className="w-48 lg:w-64 h-9 pl-9 pr-4 rounded-lg bg-header-search border border-header-search-border text-header-foreground placeholder:text-header-search-placeholder text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
            />
          </div>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-header-nav hover:text-header-nav-hover transition-colors text-sm font-medium"
          >
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
}
