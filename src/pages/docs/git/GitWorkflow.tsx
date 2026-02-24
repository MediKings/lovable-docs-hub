import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Branches principales", href: "#branches", level: 2 },
  { title: "Nommage des branches", href: "#nommage", level: 2 },
  { title: "Workflow quotidien", href: "#workflow", level: 2 },
  { title: "Pull Requests", href: "#pr", level: 2 },
  { title: "Revue de code", href: "#revue", level: 2 },
];

const branchesCode = `# Branches permanentes
main       → Production stable, déployée automatiquement
develop    → Intégration, base pour les features
staging    → Pré-production, tests d'acceptance

# Branches temporaires
feature/   → Nouvelles fonctionnalités
fix/       → Corrections de bugs
hotfix/    → Corrections urgentes en production
release/   → Préparation d'une release
chore/     → Maintenance, refactoring`;

const namingCode = `# Format : type/ticket-description-courte

# ✅ Bons exemples
feature/GS-142-ajout-auth-google
fix/GS-87-pagination-posts
hotfix/GS-200-crash-login-prod
release/v2.3.0
chore/GS-50-upgrade-django-5

# ❌ Mauvais exemples
my-branch              # Pas de type ni ticket
feature/new-stuff      # Pas de numéro de ticket
Feature/GS-142         # Pas de description`;

const workflowCode = `# 1. Créer une branche depuis develop
git checkout develop
git pull origin develop
git checkout -b feature/GS-142-ajout-auth-google

# 2. Travailler, commiter régulièrement
git add .
git commit -m "feat(auth): ajouter le bouton Google OAuth"
git commit -m "feat(auth): implémenter le callback OAuth"
git commit -m "test(auth): ajouter les tests OAuth"

# 3. Rebaser avant de push (garder un historique propre)
git fetch origin
git rebase origin/develop

# 4. Push et créer la PR
git push origin feature/GS-142-ajout-auth-google

# 5. Après approbation, merge avec squash si beaucoup de commits
# Le merge se fait via l'interface GitHub/GitLab`;

const prTemplateCode = `## Description
Ajout de l'authentification Google OAuth2 pour les utilisateurs.

## Ticket
Closes GS-142

## Type de changement
- [x] Nouvelle fonctionnalité (feat)
- [ ] Correction de bug (fix)
- [ ] Refactoring
- [ ] Documentation

## Checklist
- [x] Le code suit les standards GhennySoft
- [x] Les tests passent localement
- [x] J'ai ajouté des tests pour les nouvelles fonctionnalités
- [x] La documentation a été mise à jour
- [x] Pas de console.log ou print() restants
- [x] Les migrations sont incluses (si applicable)

## Screenshots (si UI)
[Ajouter des captures d'écran]`;

const GitWorkflow = () => {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>Git Flow & Branches</h1>

      <p>
        GhennySoft utilise un Git Flow adapté avec des conventions strictes 
        pour le nommage des branches et les pull requests.
      </p>

      <hr />

      <h2 id="branches">Branches principales</h2>
      <CodeBlock code={branchesCode} language="bash" />

      <h2 id="nommage">Nommage des branches</h2>
      <CodeBlock code={namingCode} language="bash" />

      <Callout type="warning" title="Toujours un ticket">
        Chaque branche de feature ou fix doit référencer un numéro de ticket (ex: GS-142). 
        Pas de développement sans ticket.
      </Callout>

      <h2 id="workflow">Workflow quotidien</h2>
      <CodeBlock code={workflowCode} language="bash" />

      <h2 id="pr">Pull Requests</h2>

      <p>Chaque PR doit suivre ce template :</p>

      <CodeBlock code={prTemplateCode} language="markdown" />

      <h2 id="revue">Revue de code</h2>

      <ul>
        <li><strong>Minimum 1 approbation</strong> requise avant le merge</li>
        <li><strong>2 approbations</strong> pour les changements critiques (auth, paiement, DB)</li>
        <li>Le reviewer vérifie : logique, tests, standards, sécurité</li>
        <li>Feedback constructif et bienveillant — pas de critique personnelle</li>
        <li>Les PRs doivent être révisées sous <strong>24h</strong></li>
      </ul>

      <Callout type="tip" title="Taille des PRs">
        Une PR idéale fait moins de <strong>400 lignes modifiées</strong>. Au-delà, 
        découpez en plusieurs PRs plus petites.
      </Callout>

      <DocsPagination
        prev={{ title: "Nommage des commits", href: "/docs/git/commits" }}
        next={{ title: "Librairies recommandées", href: "/docs/libraries" }}
      />
    </DocsLayout>
  );
};

export default GitWorkflow;
