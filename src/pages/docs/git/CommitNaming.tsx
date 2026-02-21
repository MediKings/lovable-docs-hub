import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Conventional Commits", href: "#conventional", level: 2 },
  { title: "Types de commits", href: "#types", level: 2 },
  { title: "Scope (portée)", href: "#scope", level: 2 },
  { title: "Exemples complets", href: "#exemples", level: 2 },
  { title: "Breaking Changes", href: "#breaking", level: 2 },
  { title: "Règles strictes", href: "#regles", level: 2 },
  { title: "Automatisation", href: "#automatisation", level: 2 },
];

const formatCode = `# Format Conventional Commits
<type>(<scope>): <description>

[corps optionnel]

[footer optionnel]

# Exemples
feat(auth): ajouter la connexion Google OAuth2
fix(api): corriger le calcul de pagination sur les posts
docs(readme): mettre à jour les instructions d'installation
style(dashboard): aligner les cartes de statistiques
refactor(users): extraire la logique de validation en service
test(posts): ajouter les tests du endpoint de création
chore(deps): mettre à jour Django vers 5.0.3`;

const typesCode = `# Types obligatoires chez GhennySoft

feat     → Nouvelle fonctionnalité pour l'utilisateur
fix      → Correction de bug
docs     → Documentation uniquement
style    → Formatage, point-virgules, etc. (pas de changement de logique)
refactor → Refactorisation du code (ni fix, ni feat)
perf     → Amélioration de performance
test     → Ajout ou correction de tests
build    → Changements du système de build (npm, pip, Docker)
ci       → Configuration CI/CD (GitHub Actions, GitLab CI)
chore    → Tâches de maintenance (mise à jour deps, nettoyage)
revert   → Annulation d'un commit précédent`;

const scopeCode = `# Scopes standards par projet

## Frontend
feat(ui): ajouter le composant DataTable
fix(auth): corriger la redirection après login
feat(dashboard): ajouter le graphique de revenus
fix(form): corriger la validation du champ email
refactor(hooks): simplifier useAuth avec un context
style(layout): ajuster le padding du header mobile

## Backend
feat(api): ajouter l'endpoint de recherche
fix(models): corriger la cascade de suppression
feat(auth): implémenter le refresh token
refactor(views): extraire la logique en services
perf(queries): optimiser la requête N+1 sur les posts

## Fullstack
feat(posts): ajouter le système de likes
fix(comments): corriger la pagination des commentaires

## Infrastructure
ci(github): configurer le workflow de déploiement
build(docker): optimiser le Dockerfile multi-stage
chore(deps): mettre à jour les dépendances de sécurité`;

const exemplesCode = `# ✅ BONS exemples

feat(auth): ajouter la vérification email à l'inscription

Envoie un email de vérification avec un token JWT
valable 24h lors de la création d'un compte.

Closes #42

---

fix(api): corriger le timeout sur les requêtes de rapport

Le timeout de 30s était insuffisant pour les rapports
contenant plus de 10 000 lignes. Augmenté à 120s et
ajout d'un système de pagination côté serveur.

Fixes #128

---

refactor(users)!: renommer UserProfile en Profile

BREAKING CHANGE: Le modèle UserProfile est renommé en Profile.
Les migrations doivent être exécutées avant le déploiement.

---

# ❌ MAUVAIS exemples

fix: bug                           # Trop vague
update code                        # Pas de type
feat: ajout de trucs               # Non descriptif
Fix the thing that was broken      # Pas de type, trop vague
WIP                                # Jamais commiter du WIP
feat(auth): Ajouter OAuth          # Pas de majuscule après ":"
feat(auth): ajouter OAuth.         # Pas de point final`;

const automationCode = `# .commitlintrc.js — Validation automatique
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', 'fix', 'docs', 'style', 'refactor',
        'perf', 'test', 'build', 'ci', 'chore', 'revert',
      ],
    ],
    'subject-case': [2, 'never', ['start-case', 'pascal-case']],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 100],
  },
};

# .husky/commit-msg
#!/bin/sh
npx --no -- commitlint --edit "$1"

# Installation
npm install -D @commitlint/cli @commitlint/config-conventional husky
npx husky init
echo 'npx --no -- commitlint --edit "$1"' > .husky/commit-msg`;

export default function CommitNaming() {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>Nommage des Commits Git</h1>

      <p>
        GhennySoft utilise la spécification <strong>Conventional Commits</strong> pour 
        tous les messages de commit. Cela garantit un historique lisible, automatise 
        les changelogs et facilite le semantic versioning.
      </p>

      <Callout type="danger" title="Obligatoire">
        Les commits qui ne respectent pas ce format seront <strong>rejetés</strong> par le hook 
        pre-commit. Aucune exception.
      </Callout>

      <hr />

      <h2 id="conventional">Conventional Commits</h2>

      <CodeBlock code={formatCode} language="bash" />

      <h2 id="types">Types de commits</h2>

      <CodeBlock code={typesCode} language="bash" />

      <Callout type="info" title="Quand utiliser quel type ?">
        En cas de doute : si ça change le comportement visible → <code>feat</code> ou <code>fix</code>. 
        Si ça restructure sans changer le comportement → <code>refactor</code>. 
        Si ça n'impacte que les outils de dev → <code>chore</code>, <code>build</code>, ou <code>ci</code>.
      </Callout>

      <h2 id="scope">Scope (portée)</h2>

      <p>
        Le scope identifie la partie du projet affectée. Il est <strong>optionnel mais recommandé</strong>. 
        Utilisez un scope cohérent à travers le projet.
      </p>

      <CodeBlock code={scopeCode} language="bash" />

      <h2 id="exemples">Exemples complets</h2>

      <CodeBlock code={exemplesCode} language="bash" />

      <h2 id="breaking">Breaking Changes</h2>

      <ul>
        <li>Ajoutez <code>!</code> après le type/scope : <code>feat(api)!: changer le format de réponse</code></li>
        <li>Ajoutez <code>BREAKING CHANGE:</code> dans le footer du commit</li>
        <li>Documentez la migration requise dans le corps du commit</li>
        <li>Incrémentez la version majeure dans le semantic versioning</li>
      </ul>

      <h2 id="regles">Règles strictes</h2>

      <table>
        <thead>
          <tr><th>Règle</th><th>Détail</th></tr>
        </thead>
        <tbody>
          <tr><td>Sujet</td><td>Max 72 caractères, minuscule, pas de point final</td></tr>
          <tr><td>Corps</td><td>Max 100 caractères par ligne, séparé par une ligne vide</td></tr>
          <tr><td>Langue</td><td>Français pour le sujet et le corps</td></tr>
          <tr><td>Temps</td><td>Impératif présent : « ajouter » pas « ajouté »</td></tr>
          <tr><td>Atomicité</td><td>Un commit = un changement logique</td></tr>
          <tr><td>WIP</td><td>Jamais de commit « WIP ». Utilisez <code>git stash</code>.</td></tr>
        </tbody>
      </table>

      <h2 id="automatisation">Automatisation</h2>

      <p>
        Nous utilisons <code>commitlint</code> + <code>husky</code> pour valider automatiquement 
        chaque message de commit.
      </p>

      <CodeBlock code={automationCode} language="javascript" />

      <DocsPagination
        prev={{ title: "Standards API REST", href: "/docs/backend/api" }}
        next={{ title: "Git Flow & Branches", href: "/docs/git/workflow" }}
      />
    </DocsLayout>
  );
}
