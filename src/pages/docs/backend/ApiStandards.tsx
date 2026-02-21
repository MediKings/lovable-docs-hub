import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Principes REST", href: "#principes", level: 2 },
  { title: "Codes HTTP", href: "#codes", level: 2 },
  { title: "Format de réponse", href: "#format", level: 2 },
  { title: "Pagination", href: "#pagination", level: 2 },
  { title: "Filtrage & Recherche", href: "#filtrage", level: 2 },
  { title: "Versioning", href: "#versioning", level: 2 },
];

const responseFormatCode = `// ✅ Format standard de réponse GhennySoft

// Succès — liste
{
  "data": [...],
  "meta": {
    "page": 1,
    "page_size": 20,
    "total_count": 142,
    "total_pages": 8
  }
}

// Succès — objet unique
{
  "data": {
    "id": 1,
    "title": "Mon article",
    ...
  }
}

// Erreur — validation
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Les données soumises sont invalides.",
    "details": {
      "title": ["Ce champ est requis."],
      "email": ["Adresse email invalide."]
    }
  }
}

// Erreur — générique
{
  "error": {
    "code": "NOT_FOUND",
    "message": "La ressource demandée n'existe pas."
  }
}`;

const paginationCode = `# settings.py
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# Requête
GET /api/v1/posts/?page=2&page_size=10

# Réponse
{
  "count": 142,
  "next": "https://api.ghennysoft.com/api/v1/posts/?page=3",
  "previous": "https://api.ghennysoft.com/api/v1/posts/?page=1",
  "results": [...]
}`;

const filteringCode = `# Filtrage par query params
GET /api/v1/posts/?status=published&author=5
GET /api/v1/posts/?created_after=2024-01-01
GET /api/v1/posts/?search=django&ordering=-created_at

# Implémentation avec django-filter
import django_filters

class PostFilter(django_filters.FilterSet):
    created_after = django_filters.DateFilter(
        field_name='created_at',
        lookup_expr='gte',
    )
    search = django_filters.CharFilter(
        method='filter_search',
    )

    class Meta:
        model = Post
        fields = ['status', 'author']

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(title__icontains=value) |
            Q(content__icontains=value)
        )`;

export default function ApiStandards() {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>Standards API REST</h1>

      <p>
        Toutes les APIs GhennySoft suivent les principes REST et un format de réponse uniforme.
      </p>

      <hr />

      <h2 id="principes">Principes REST</h2>

      <ul>
        <li><strong>Ressources orientées noms</strong> : <code>/posts</code> pas <code>/getPost</code></li>
        <li><strong>Verbes HTTP</strong> : GET (lire), POST (créer), PUT/PATCH (modifier), DELETE (supprimer)</li>
        <li><strong>Stateless</strong> : Chaque requête contient toutes les informations nécessaires</li>
        <li><strong>HATEOAS</strong> : Inclure les liens de navigation dans les réponses</li>
      </ul>

      <h2 id="codes">Codes HTTP</h2>

      <table>
        <thead>
          <tr><th>Code</th><th>Usage</th></tr>
        </thead>
        <tbody>
          <tr><td><code>200 OK</code></td><td>Succès GET, PUT, PATCH</td></tr>
          <tr><td><code>201 Created</code></td><td>Succès POST (ressource créée)</td></tr>
          <tr><td><code>204 No Content</code></td><td>Succès DELETE</td></tr>
          <tr><td><code>400 Bad Request</code></td><td>Erreur de validation</td></tr>
          <tr><td><code>401 Unauthorized</code></td><td>Non authentifié</td></tr>
          <tr><td><code>403 Forbidden</code></td><td>Pas autorisé</td></tr>
          <tr><td><code>404 Not Found</code></td><td>Ressource introuvable</td></tr>
          <tr><td><code>409 Conflict</code></td><td>Conflit (ex: doublon)</td></tr>
          <tr><td><code>429 Too Many Requests</code></td><td>Rate limiting</td></tr>
          <tr><td><code>500 Internal Server Error</code></td><td>Erreur serveur</td></tr>
        </tbody>
      </table>

      <h2 id="format">Format de réponse</h2>
      <CodeBlock code={responseFormatCode} language="json" />

      <Callout type="warning" title="Cohérence">
        Toutes les réponses doivent suivre ce format. Ne retournez jamais un tableau 
        brut ou un message texte en dehors de cette structure.
      </Callout>

      <h2 id="pagination">Pagination</h2>
      <CodeBlock code={paginationCode} language="python" />

      <h2 id="filtrage">Filtrage & Recherche</h2>
      <CodeBlock code={filteringCode} language="python" />

      <h2 id="versioning">Versioning</h2>

      <ul>
        <li>Préfixe d'URL : <code>/api/v1/</code>, <code>/api/v2/</code></li>
        <li>Ne jamais casser la rétrocompatibilité d'une version existante</li>
        <li>Déprécier avant de supprimer (min. 3 mois)</li>
        <li>Documenter les changements dans un CHANGELOG</li>
      </ul>

      <DocsPagination
        prev={{ title: "Django REST Framework", href: "/docs/backend/django" }}
        next={{ title: "Nommage des commits", href: "/docs/git/commits" }}
      />
    </DocsLayout>
  );
}
