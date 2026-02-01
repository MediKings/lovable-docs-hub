import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export function CodeBlock({ code, language = "tsx", className }: CodeBlockProps) {
  return (
    <div className={cn("relative rounded-lg overflow-hidden", className)}>
      <div className="flex items-center justify-between px-4 py-2 bg-code-header border-b border-code-border">
        <span className="text-xs text-code-language font-mono">{language}</span>
        <button 
          onClick={() => navigator.clipboard.writeText(code)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Copy
        </button>
      </div>
      <pre className="p-4 bg-code overflow-x-auto">
        <code className="text-sm font-mono text-code-foreground leading-relaxed">
          {code}
        </code>
      </pre>
    </div>
  );
}
