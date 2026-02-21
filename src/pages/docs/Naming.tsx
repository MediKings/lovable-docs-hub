import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Fichiers & Dossiers", href: "#fichiers", level: 2 },
  { title: "Variables & Fonctions", href: "#variables", level: 2 },
  { title: "Constantes", href: "#constantes", level: 2 },
  { title: "Classes & Types", href: "#classes", level: 2 },
  { title: "Composants React", href: "#composants", level: 2 },
  { title: "Base de données", href: "#database", level: 2 },
  { title: "Endpoints API", href: "#endpoints", level: 2 },
  { title: "Résumé des conventions", href: "#resume", level: 2 },
];

const fileNamingCode = `# Structure de fichiers — Frontend (React/Next.js)
src/
├── components/
│   ├── ui/                    # Composants UI réutilisables (kebab-case)
│   │   ├── button.tsx
│   │   ├── data-table.tsx
│   │   └── search-input.tsx
│   ├── layout/                # Composants de layout (PascalCase)
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── DocsLayout.tsx
│   └── features/              # Composants métier (PascalCase)
│       ├── UserProfile.tsx
│       └── OrderSummary.tsx
├── hooks/                     # Custom hooks (camelCase avec use-)
│   ├── useAuth.ts
│   ├── usePagination.ts
│   └── useDebounce.ts
├── lib/                       # Utilitaires (kebab-case)
│   ├── api-client.ts
│   ├── date-utils.ts
│   └── validators.ts
├── types/                     # Types TypeScript (kebab-case)
│   ├── user.ts
│   └── api-responses.ts
└── constants/                 # Constantes (kebab-case)
    ├── routes.ts
    └── config.ts`;

const backendFileNaming = `# Structure de fichiers — Backend (Django)
blog_api/
├── blog/
│   ├── models.py              # snake_case pour les modules
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_models.py     # Préfixe test_
│   │   ├── test_views.py
│   │   └── test_serializers.py
│   ├── services/              # Logique métier séparée
│   │   ├── __init__.py
│   │   ├── email_service.py
│   │   └── payment_service.py
│   └── utils/
│       ├── __init__.py
│       └── validators.py
└── config/
    ├── settings/
    │   ├── base.py
    │   ├── development.py
    │   └── production.py
    └── urls.py`;

const variableNamingCode = `# Python — snake_case pour tout
user_name = "Alice"
total_count = 42
is_active = True
has_permission = False

def calculate_total_price(items: list, tax_rate: float) -> float:
    """Calcule le prix total avec taxes."""
    subtotal = sum(item.price for item in items)
    return subtotal * (1 + tax_rate)

# TypeScript — camelCase pour variables et fonctions
const userName = "Alice";
const totalCount = 42;
const isActive = true;

function calculateTotalPrice(items: Item[], taxRate: number): number {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  return subtotal * (1 + taxRate);
}`;

const constantsCode = `# Python — UPPER_SNAKE_CASE
MAX_RETRY_COUNT = 3
API_BASE_URL = "https://api.ghennysoft.com"
DEFAULT_PAGE_SIZE = 20
JWT_EXPIRATION_HOURS = 24
ALLOWED_FILE_EXTENSIONS = [".pdf", ".jpg", ".png"]

# Django settings
DATABASE_POOL_SIZE = 10
CACHE_TTL_SECONDS = 3600

# TypeScript — UPPER_SNAKE_CASE
export const MAX_RETRY_COUNT = 3;
export const API_BASE_URL = "https://api.ghennysoft.com";
export const DEFAULT_PAGE_SIZE = 20;
export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  SETTINGS: "/settings",
} as const;

// Enum-like objects
export const USER_ROLES = {
  ADMIN: "admin",
  EDITOR: "editor",
  VIEWER: "viewer",
} as const;`;

const classNamingCode = `# Python — PascalCase pour les classes
class UserProfile:
    """Profil utilisateur avec ses préférences."""
    pass

class PostSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Post."""
    pass

class IsOwnerOrReadOnly(permissions.BasePermission):
    """Permission : seul le propriétaire peut modifier."""
    pass

// TypeScript — PascalCase pour types, interfaces et classes
interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
}

type ApiResponse<T> = {
  data: T;
  meta: PaginationMeta;
  errors?: ApiError[];
};

enum UserRole {
  Admin = "admin",
  Editor = "editor",
  Viewer = "viewer",
}`;

const componentNamingCode = `// Composants — PascalCase, un composant par fichier
// ✅ Bon
export function UserProfileCard({ user }: UserProfileCardProps) {
  return <div>...</div>;
}

// ✅ Bon — Props typées avec le suffixe Props
interface UserProfileCardProps {
  user: User;
  onEdit?: (id: string) => void;
  isEditable?: boolean;  // Booléens préfixés : is, has, can, should
}

// ✅ Hooks personnalisés — préfixe "use"
function useUserProfile(userId: string) {
  // ...
}

// ✅ Event handlers — préfixe "handle" ou "on"
function handleSubmit(event: FormEvent) { ... }
function onUserDelete(userId: string) { ... }`;

const databaseNamingCode = `# Tables — snake_case, pluriel
CREATE TABLE users (...)
CREATE TABLE blog_posts (...)
CREATE TABLE post_comments (...)
CREATE TABLE user_likes (...)

# Colonnes — snake_case
id              -- Clé primaire, toujours "id"
user_id         -- Clé étrangère : table_singulier + _id
created_at      -- Timestamps avec suffixe _at
updated_at
deleted_at      -- Soft delete
is_active       -- Booléens avec préfixe is_, has_
email_count     -- Compteurs avec suffixe _count

# Index — idx_table_colonne
CREATE INDEX idx_posts_author_id ON blog_posts(author_id);
CREATE INDEX idx_posts_created_at ON blog_posts(created_at);`;

const endpointNamingCode = `# Endpoints API — kebab-case, pluriel, orienté ressources
# ✅ Bon
GET    /api/v1/blog-posts/           # Liste
POST   /api/v1/blog-posts/           # Création
GET    /api/v1/blog-posts/{id}/      # Détail
PUT    /api/v1/blog-posts/{id}/      # Mise à jour complète
PATCH  /api/v1/blog-posts/{id}/      # Mise à jour partielle
DELETE /api/v1/blog-posts/{id}/      # Suppression

# Relations imbriquées
GET    /api/v1/blog-posts/{id}/comments/
POST   /api/v1/blog-posts/{id}/comments/

# Actions spécifiques
POST   /api/v1/blog-posts/{id}/publish/
POST   /api/v1/blog-posts/{id}/like/

# ❌ Mauvais
GET    /api/v1/getBlogPosts           # Pas de verbe dans l'URL
POST   /api/v1/blog_posts/create     # Pas de snake_case ni "create"
GET    /api/v1/blogPost/1            # Pas de singulier`;

export default function Naming() {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>Conventions de Nommage</h1>

      <p>
        Des noms bien choisis rendent le code auto-documenté. Chez GhennySoft, 
        nous suivons des conventions strictes et uniformes pour chaque contexte.
      </p>

      <Callout type="info" title="Règle universelle">
        Un nom doit répondre à trois questions : <strong>Quoi ?</strong>, <strong>Pourquoi ?</strong> et <strong>Comment l'utiliser ?</strong> — sans lire le code source.
      </Callout>

      <hr />

      <h2 id="fichiers">Fichiers & Dossiers</h2>

      <h3>Frontend (React / Next.js)</h3>
      <CodeBlock code={fileNamingCode} language="bash" />

      <h3>Backend (Django)</h3>
      <CodeBlock code={backendFileNaming} language="bash" />

      <h2 id="variables">Variables & Fonctions</h2>
      <CodeBlock code={variableNamingCode} language="python" />

      <Callout type="tip" title="Noms booléens">
        Préfixez toujours les booléens : <code>is_</code>, <code>has_</code>, <code>can_</code>, <code>should_</code>. 
        Ex : <code>is_active</code>, <code>has_permission</code>, <code>canEdit</code>.
      </Callout>

      <h2 id="constantes">Constantes</h2>
      <CodeBlock code={constantsCode} language="python" />

      <h2 id="classes">Classes & Types</h2>
      <CodeBlock code={classNamingCode} language="python" />

      <h2 id="composants">Composants React</h2>
      <CodeBlock code={componentNamingCode} language="tsx" />

      <h2 id="database">Base de données</h2>
      <CodeBlock code={databaseNamingCode} language="sql" />

      <h2 id="endpoints">Endpoints API</h2>
      <CodeBlock code={endpointNamingCode} language="bash" />

      <h2 id="resume">Résumé des conventions</h2>

      <table>
        <thead>
          <tr>
            <th>Contexte</th>
            <th>Convention</th>
            <th>Exemple</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Variables Python</td><td>snake_case</td><td><code>user_name</code></td></tr>
          <tr><td>Variables TS/JS</td><td>camelCase</td><td><code>userName</code></td></tr>
          <tr><td>Constantes</td><td>UPPER_SNAKE_CASE</td><td><code>MAX_RETRIES</code></td></tr>
          <tr><td>Classes / Types</td><td>PascalCase</td><td><code>UserProfile</code></td></tr>
          <tr><td>Composants React</td><td>PascalCase</td><td><code>DataTable</code></td></tr>
          <tr><td>Fichiers UI</td><td>kebab-case</td><td><code>data-table.tsx</code></td></tr>
          <tr><td>Fichiers layout</td><td>PascalCase</td><td><code>Header.tsx</code></td></tr>
          <tr><td>Hooks</td><td>camelCase + use</td><td><code>useAuth.ts</code></td></tr>
          <tr><td>Tables DB</td><td>snake_case pluriel</td><td><code>blog_posts</code></td></tr>
          <tr><td>Endpoints API</td><td>kebab-case pluriel</td><td><code>/blog-posts/</code></td></tr>
        </tbody>
      </table>

      <DocsPagination
        prev={{ title: "Clean Code", href: "/docs/clean-code" }}
        next={{ title: "React & Tailwind", href: "/docs/frontend/react" }}
      />
    </DocsLayout>
  );
}
