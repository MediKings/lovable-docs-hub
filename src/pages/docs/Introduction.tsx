import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Présentation", href: "#presentation", level: 2 },
  { title: "Objectifs", href: "#objectifs", level: 2 },
  { title: "Périmètre", href: "#perimetre", level: 2 },
  { title: "Projet d'illustration", href: "#projet", level: 2 },
  { title: "Comment utiliser ce guide", href: "#utilisation", level: 2 },
];

const Introduction = () => {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>Standards de Codage — GhennySoft</h1>
      
      <p>
        Bienvenue dans la documentation officielle des standards de codage de <strong>GhennySoft</strong>. 
        Ce guide définit les conventions, bonnes pratiques et règles uniformes que chaque développeur 
        doit suivre pour garantir la qualité, la lisibilité et la maintenabilité de nos projets.
      </p>

      <Callout type="info" title="Document vivant">
        Ce guide évolue avec nos projets. Chaque équipe est invitée à proposer des améliorations 
        via des pull requests sur le dépôt interne.
      </Callout>

      <hr />

      <h2 id="objectifs">Objectifs</h2>

      <ul>
        <li><strong>Uniformité</strong> : Un code identique quel que soit le développeur</li>
        <li><strong>Lisibilité</strong> : Code compréhensible sans documentation externe excessive</li>
        <li><strong>Maintenabilité</strong> : Faciliter les revues de code et le onboarding</li>
        <li><strong>Sécurité</strong> : Intégrer les bonnes pratiques de sécurité dès le développement</li>
        <li><strong>Performance</strong> : Écrire du code efficace et optimisé</li>
      </ul>

      <h2 id="perimetre">Périmètre</h2>

      <p>Ce guide couvre l'ensemble de la stack technologique GhennySoft :</p>

      <ul>
        <li><strong>Frontend</strong> : React, Next.js, Tailwind CSS, TypeScript</li>
        <li><strong>Backend</strong> : Python, Django, Django REST Framework</li>
        <li><strong>Git</strong> : Conventional Commits, Git Flow, revues de code</li>
        <li><strong>Librairies</strong> : Outils recommandés et leur rôle dans nos projets</li>
        <li><strong>Sécurité</strong> : Protection contre les vulnérabilités courantes</li>
      </ul>

      <h2 id="projet">Projet d'illustration</h2>

      <p>
        Pour illustrer concrètement nos standards, nous utilisons un projet réel : 
        une <strong>API Blog</strong> construite avec Django REST Framework. Ce projet couvre :
      </p>

      <ul>
        <li>CRUD complet des articles avec <code>APIView</code></li>
        <li>Gestion des commentaires et des likes</li>
        <li>Compteur de vues intelligent</li>
        <li>Authentification JWT</li>
        <li>Serializers avec validation</li>
      </ul>

      <Callout type="tip" title="Retrouvez le projet">
        La section « Projet : Blog API (DRF) » dans la barre latérale contient 
        l'ensemble du code illustratif avec explications détaillées.
      </Callout>

      <h2 id="utilisation">Comment utiliser ce guide</h2>

      <ol>
        <li><strong>Nouveaux développeurs</strong> : Lisez le guide du début à la fin avant votre premier commit</li>
        <li><strong>Développeurs existants</strong> : Consultez les sections pertinentes lors des revues de code</li>
        <li><strong>Tech Leads</strong> : Référencez ce guide dans vos critères de validation des PRs</li>
      </ol>

      <DocsPagination
        next={{ title: "Principes Clean Code", href: "/docs/clean-code" }}
      />
    </DocsLayout>
  );
};

export default Introduction;
