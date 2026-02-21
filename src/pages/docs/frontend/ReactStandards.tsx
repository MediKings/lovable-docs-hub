import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Architecture", href: "#architecture", level: 2 },
  { title: "Composants", href: "#composants", level: 2 },
  { title: "État & Props", href: "#etat", level: 2 },
  { title: "Hooks", href: "#hooks", level: 2 },
  { title: "Tailwind CSS", href: "#tailwind", level: 2 },
  { title: "Performance", href: "#performance", level: 2 },
];

const componentCode = `// ✅ Standard GhennySoft — Composant fonctionnel typé
interface UserCardProps {
  user: User;
  onEdit?: (id: string) => void;
  isCompact?: boolean;
}

export function UserCard({ user, onEdit, isCompact = false }: UserCardProps) {
  const handleEdit = useCallback(() => {
    onEdit?.(user.id);
  }, [user.id, onEdit]);

  return (
    <div className={cn("rounded-lg border p-4", isCompact && "p-2")}>
      <h3 className="font-semibold text-foreground">{user.name}</h3>
      <p className="text-sm text-muted-foreground">{user.email}</p>
      {onEdit && (
        <Button variant="outline" size="sm" onClick={handleEdit}>
          Modifier
        </Button>
      )}
    </div>
  );
}`;

const hooksCode = `// ✅ Custom hook — logique réutilisable
function usePagination<T>(items: T[], pageSize = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / pageSize);
  const paginatedItems = useMemo(
    () => items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [items, currentPage, pageSize]
  );

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  return { paginatedItems, currentPage, totalPages, goToPage };
}`;

const tailwindCode = `// ✅ Utiliser les tokens sémantiques du design system
<div className="bg-background text-foreground border-border">
  <h1 className="text-accent-primary">Titre</h1>
  <p className="text-muted-foreground">Description</p>
  <Button className="bg-accent-primary hover:bg-accent-primary/90">
    Action
  </Button>
</div>

// ❌ Ne PAS utiliser de couleurs en dur
<div className="bg-white text-gray-900">
  <h1 className="text-orange-500">Titre</h1>
</div>

// ✅ Utiliser cn() pour les classes conditionnelles
import { cn } from "@/lib/utils";

<div className={cn(
  "rounded-lg border p-4",
  isActive && "border-accent-primary bg-accent/10",
  isDisabled && "opacity-50 pointer-events-none"
)} />`;

const stateCode = `// ✅ État local pour l'UI, état global pour les données partagées
// État local — useState
function SearchInput() {
  const [query, setQuery] = useState("");
  // ...
}

// Données serveur — TanStack Query
function UserList() {
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  if (isLoading) return <Skeleton />;
  return <DataTable data={users} />;
}

// ❌ Éviter : état global pour tout
// ❌ Éviter : useEffect pour fetch (utiliser TanStack Query)
// ❌ Éviter : prop drilling sur plus de 2 niveaux`;

const performanceCode = `// ✅ Mémoisation — uniquement quand c'est nécessaire
const expensiveResult = useMemo(
  () => computeExpensiveValue(data),
  [data]
);

const stableCallback = useCallback(
  (id: string) => onDelete(id),
  [onDelete]
);

// ✅ Lazy loading des routes
const Dashboard = lazy(() => import("@/pages/Dashboard"));

// ✅ Optimistic updates avec TanStack Query
const mutation = useMutation({
  mutationFn: updateUser,
  onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey: ["user", id] });
    const previous = queryClient.getQueryData(["user", id]);
    queryClient.setQueryData(["user", id], newData);
    return { previous };
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(["user", id], context?.previous);
  },
});`;

export default function ReactStandards() {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>Standards React & Tailwind CSS</h1>

      <p>
        Conventions GhennySoft pour le développement frontend avec React, TypeScript et Tailwind CSS.
      </p>

      <hr />

      <h2 id="architecture">Architecture</h2>

      <ul>
        <li><strong>Composants UI</strong> dans <code>src/components/ui/</code> — génériques, réutilisables</li>
        <li><strong>Composants layout</strong> dans <code>src/components/layout/</code> — structure de page</li>
        <li><strong>Composants features</strong> dans <code>src/components/features/</code> — logique métier</li>
        <li><strong>Pages</strong> dans <code>src/pages/</code> — un fichier par route</li>
        <li><strong>Hooks</strong> dans <code>src/hooks/</code> — logique réutilisable</li>
        <li><strong>Types</strong> dans <code>src/types/</code> — interfaces partagées</li>
      </ul>

      <h2 id="composants">Composants</h2>

      <CodeBlock code={componentCode} language="tsx" />

      <Callout type="tip" title="Règles de composants">
        Un composant ne doit pas dépasser 150 lignes. Au-delà, extrayez des sous-composants.
        Un fichier = un composant exporté.
      </Callout>

      <h2 id="etat">État & Props</h2>

      <CodeBlock code={stateCode} language="tsx" />

      <h2 id="hooks">Hooks</h2>

      <CodeBlock code={hooksCode} language="tsx" />

      <h2 id="tailwind">Tailwind CSS</h2>

      <CodeBlock code={tailwindCode} language="tsx" />

      <Callout type="warning" title="Design System">
        Toujours utiliser les tokens sémantiques définis dans <code>index.css</code> et <code>tailwind.config.ts</code>. 
        Jamais de couleurs en dur dans les composants.
      </Callout>

      <h2 id="performance">Performance</h2>

      <CodeBlock code={performanceCode} language="tsx" />

      <DocsPagination
        prev={{ title: "Conventions de nommage", href: "/docs/naming" }}
        next={{ title: "Next.js", href: "/docs/frontend/nextjs" }}
      />
    </DocsLayout>
  );
}
