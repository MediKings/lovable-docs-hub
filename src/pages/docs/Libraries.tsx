import { DocsLayout } from "@/components/layout/DocsLayout";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Frontend", href: "#frontend", level: 2 },
  { title: "Backend", href: "#backend", level: 2 },
  { title: "DevOps & Outils", href: "#devops", level: 2 },
  { title: "Règles d'adoption", href: "#adoption", level: 2 },
];

export default function Libraries() {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>Librairies Recommandées</h1>

      <p>
        Liste des librairies approuvées et leur rôle dans les projets GhennySoft. 
        Toute librairie non listée doit être validée par le Tech Lead avant adoption.
      </p>

      <hr />

      <h2 id="frontend">Frontend</h2>

      <table>
        <thead>
          <tr><th>Librairie</th><th>Usage</th><th>Pourquoi</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>React 18+</strong></td><td>UI Framework</td><td>Standard industrie, écosystème riche, Server Components</td></tr>
          <tr><td><strong>Next.js 14+</strong></td><td>Framework fullstack</td><td>SSR/SSG, App Router, optimisations automatiques</td></tr>
          <tr><td><strong>TypeScript</strong></td><td>Typage statique</td><td>Détection d'erreurs à la compilation, meilleur DX</td></tr>
          <tr><td><strong>Tailwind CSS</strong></td><td>Styling</td><td>Utility-first, design system cohérent, performance</td></tr>
          <tr><td><strong>shadcn/ui</strong></td><td>Composants UI</td><td>Accessible, personnalisable, pas de dépendance runtime</td></tr>
          <tr><td><strong>TanStack Query</strong></td><td>Data fetching</td><td>Cache, mutations, optimistic updates, devtools</td></tr>
          <tr><td><strong>React Hook Form</strong></td><td>Formulaires</td><td>Performance, validation avec Zod, minimal re-renders</td></tr>
          <tr><td><strong>Zod</strong></td><td>Validation</td><td>Schema-first, type inference, composition</td></tr>
          <tr><td><strong>Framer Motion</strong></td><td>Animations</td><td>API déclarative, exit animations, layout animations</td></tr>
          <tr><td><strong>Lucide React</strong></td><td>Icônes</td><td>Tree-shakeable, cohérent, léger</td></tr>
          <tr><td><strong>date-fns</strong></td><td>Dates</td><td>Tree-shakeable (vs Moment.js), immutable</td></tr>
          <tr><td><strong>Recharts</strong></td><td>Graphiques</td><td>Basé sur D3, API React simple, responsive</td></tr>
          <tr><td><strong>Zustand</strong></td><td>État global</td><td>Minimal, pas de boilerplate, performant</td></tr>
        </tbody>
      </table>

      <h2 id="backend">Backend</h2>

      <table>
        <thead>
          <tr><th>Librairie</th><th>Usage</th><th>Pourquoi</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>Django 5+</strong></td><td>Web Framework</td><td>Batteries incluses, ORM puissant, admin auto</td></tr>
          <tr><td><strong>Django REST Framework</strong></td><td>API REST</td><td>Serializers, permissions, throttling, documentation</td></tr>
          <tr><td><strong>djangorestframework-simplejwt</strong></td><td>Auth JWT</td><td>Tokens access/refresh, blacklist, personnalisation</td></tr>
          <tr><td><strong>django-cors-headers</strong></td><td>CORS</td><td>Configuration fine des origines autorisées</td></tr>
          <tr><td><strong>django-filter</strong></td><td>Filtrage API</td><td>Filtres déclaratifs, intégration DRF native</td></tr>
          <tr><td><strong>celery</strong></td><td>Tâches async</td><td>Tâches différées (emails, rapports, nettoyage)</td></tr>
          <tr><td><strong>redis</strong></td><td>Cache & Broker</td><td>Cache haute performance, broker Celery, sessions</td></tr>
          <tr><td><strong>gunicorn</strong></td><td>WSGI Server</td><td>Production-ready, multi-worker</td></tr>
          <tr><td><strong>sentry-sdk</strong></td><td>Error tracking</td><td>Monitoring, alertes, performance tracking</td></tr>
          <tr><td><strong>black + isort</strong></td><td>Formatage</td><td>Formatage automatique et uniforme</td></tr>
          <tr><td><strong>ruff</strong></td><td>Linting</td><td>Ultra-rapide, remplace flake8 + isort + pyupgrade</td></tr>
          <tr><td><strong>pytest + pytest-django</strong></td><td>Tests</td><td>Fixtures, parametrize, plugins riches</td></tr>
        </tbody>
      </table>

      <h2 id="devops">DevOps & Outils</h2>

      <table>
        <thead>
          <tr><th>Outil</th><th>Usage</th><th>Pourquoi</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>Docker</strong></td><td>Conteneurisation</td><td>Environnements reproductibles, déploiement uniforme</td></tr>
          <tr><td><strong>GitHub Actions</strong></td><td>CI/CD</td><td>Intégration GitHub native, marketplace d'actions</td></tr>
          <tr><td><strong>PostgreSQL</strong></td><td>Base de données</td><td>Robuste, JSON support, extensions riches</td></tr>
          <tr><td><strong>Nginx</strong></td><td>Reverse proxy</td><td>SSL termination, load balancing, static files</td></tr>
          <tr><td><strong>Vercel</strong></td><td>Hosting frontend</td><td>Déploiement automatique, edge functions, preview</td></tr>
          <tr><td><strong>Sentry</strong></td><td>Monitoring</td><td>Error tracking, performance, releases</td></tr>
          <tr><td><strong>Prettier + ESLint</strong></td><td>Qualité code JS/TS</td><td>Formatage et linting automatiques</td></tr>
          <tr><td><strong>Husky + lint-staged</strong></td><td>Git hooks</td><td>Validation pre-commit automatique</td></tr>
        </tbody>
      </table>

      <h2 id="adoption">Règles d'adoption</h2>

      <ul>
        <li><strong>Évaluation</strong> : Toute nouvelle librairie doit être évaluée sur : taille du bundle, maintenance active, communauté, licence</li>
        <li><strong>Approbation</strong> : Le Tech Lead doit approuver l'ajout dans <code>package.json</code> ou <code>requirements.txt</code></li>
        <li><strong>Documentation</strong> : Documenter pourquoi la librairie a été choisie et comment l'utiliser dans le projet</li>
        <li><strong>Audit régulier</strong> : Réviser les dépendances chaque trimestre pour détecter les obsolescences</li>
        <li><strong>Pas de dépendance inutile</strong> : Si ça peut être fait en 20 lignes de code, ne pas installer une librairie</li>
      </ul>

      <Callout type="warning" title="Librairies interdites">
        <code>Moment.js</code> (utiliser date-fns), <code>jQuery</code>, <code>Lodash</code> complet 
        (utiliser les imports individuels si nécessaire), <code>Axios</code> pour les projets Next.js 
        (utiliser fetch natif).
      </Callout>

      <DocsPagination
        prev={{ title: "Git Flow & Branches", href: "/docs/git/workflow" }}
        next={{ title: "Sécurité", href: "/docs/security" }}
      />
    </DocsLayout>
  );
}
