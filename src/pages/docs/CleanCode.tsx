import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Principes fondamentaux", href: "#principes", level: 2 },
  { title: "Fonctions", href: "#fonctions", level: 2 },
  { title: "DRY & KISS", href: "#dry-kiss", level: 2 },
  { title: "Commentaires", href: "#commentaires", level: 2 },
  { title: "Gestion des erreurs", href: "#erreurs", level: 2 },
  { title: "Formatage", href: "#formatage", level: 2 },
];

const badFunctionCode = `# ❌ Mauvais : fonction trop longue, nom vague
def process(data):
    result = []
    for item in data:
        if item['status'] == 'active':
            if item['age'] > 18:
                if item['email']:
                    result.append({
                        'name': item['name'],
                        'email': item['email'],
                        'verified': True
                    })
    return result`;

const goodFunctionCode = `# ✅ Bon : fonctions courtes, noms explicites
def is_eligible_user(user: dict) -> bool:
    """Vérifie si l'utilisateur est éligible."""
    return (
        user['status'] == 'active'
        and user['age'] > 18
        and bool(user.get('email'))
    )

def format_eligible_user(user: dict) -> dict:
    """Formate un utilisateur éligible."""
    return {
        'name': user['name'],
        'email': user['email'],
        'verified': True,
    }

def get_eligible_users(users: list[dict]) -> list[dict]:
    """Retourne la liste des utilisateurs éligibles formatés."""
    return [
        format_eligible_user(user)
        for user in users
        if is_eligible_user(user)
    ]`;

const commentCode = `# ❌ Commentaire inutile — le code est évident
count = count + 1  # Incrémente le compteur

# ✅ Commentaire utile — explique le POURQUOI
# On ajoute 1 car l'index API est 0-based mais l'UI est 1-based
page_number = api_index + 1`;

const errorHandlingCode = `# ❌ Mauvais : catch générique silencieux
try:
    result = api_call()
except:
    pass

# ✅ Bon : catch spécifique avec logging
try:
    result = api_call()
except ConnectionError as e:
    logger.error(f"API indisponible: {e}")
    raise ServiceUnavailableError("Service temporairement indisponible")
except ValidationError as e:
    logger.warning(f"Données invalides: {e}")
    return Response({"error": str(e)}, status=400)`;

export default function CleanCode() {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>Principes Clean Code</h1>

      <p>
        Chez GhennySoft, nous appliquons les principes du <strong>Clean Code</strong> inspirés 
        de Robert C. Martin. Un code propre est un code lisible, testable et maintenable.
      </p>

      <Callout type="info" title="Règle d'or">
        « Le code est lu beaucoup plus souvent qu'il n'est écrit. » — Écrivez pour le lecteur, pas pour le compilateur.
      </Callout>

      <hr />

      <h2 id="principes">Principes fondamentaux</h2>

      <ul>
        <li><strong>Single Responsibility</strong> : Chaque fonction/classe a une seule raison de changer</li>
        <li><strong>Noms expressifs</strong> : Les noms doivent révéler l'intention</li>
        <li><strong>Pas d'effets de bord</strong> : Une fonction fait ce que son nom indique, rien de plus</li>
        <li><strong>Petit &gt; Grand</strong> : Préférer les petites fonctions aux gros blocs</li>
        <li><strong>Fail fast</strong> : Valider les entrées le plus tôt possible</li>
      </ul>

      <h2 id="fonctions">Fonctions</h2>

      <p>
        Une fonction doit faire <strong>une seule chose</strong>, bien la faire, et ne faire que ça. 
        Limitez-vous à 20 lignes max et 3 paramètres max.
      </p>

      <CodeBlock code={badFunctionCode} language="python" />
      <CodeBlock code={goodFunctionCode} language="python" />

      <h2 id="dry-kiss">DRY & KISS</h2>

      <ul>
        <li><strong>DRY (Don't Repeat Yourself)</strong> : Chaque logique ne doit exister qu'à un seul endroit. Si vous copiez-collez, refactorisez.</li>
        <li><strong>KISS (Keep It Simple, Stupid)</strong> : La solution la plus simple est souvent la meilleure. Pas de sur-ingénierie.</li>
        <li><strong>YAGNI (You Ain't Gonna Need It)</strong> : N'implémentez pas de fonctionnalités « au cas où ».</li>
      </ul>

      <Callout type="warning" title="Attention">
        DRY ne signifie pas « jamais de duplication ». Si deux morceaux de code se ressemblent 
        mais évoluent pour des raisons différentes, la duplication est préférable à une abstraction forcée.
      </Callout>

      <h2 id="commentaires">Commentaires</h2>

      <p>
        Le meilleur commentaire est un code qui n'en a pas besoin. Utilisez les commentaires 
        uniquement pour expliquer le <strong>pourquoi</strong>, jamais le <strong>quoi</strong>.
      </p>

      <CodeBlock code={commentCode} language="python" />

      <h2 id="erreurs">Gestion des erreurs</h2>

      <p>
        Ne jamais ignorer silencieusement une erreur. Utilisez des exceptions spécifiques 
        et loggez avec le niveau approprié.
      </p>

      <CodeBlock code={errorHandlingCode} language="python" />

      <h2 id="formatage">Formatage</h2>

      <ul>
        <li><strong>Python</strong> : Suivre PEP 8, utiliser <code>black</code> et <code>isort</code></li>
        <li><strong>TypeScript/JavaScript</strong> : Utiliser <code>Prettier</code> et <code>ESLint</code></li>
        <li><strong>Indentation</strong> : 4 espaces pour Python, 2 espaces pour TS/JS</li>
        <li><strong>Longueur de ligne</strong> : 88 caractères max (Python), 100 (TS/JS)</li>
        <li><strong>Imports</strong> : Groupés et ordonnés (stdlib → third-party → local)</li>
      </ul>

      <Callout type="tip" title="Automatisation">
        Configurez les formateurs en pre-commit hook pour garantir un formatage uniforme 
        sans effort mental.
      </Callout>

      <DocsPagination
        prev={{ title: "Introduction", href: "/docs" }}
        next={{ title: "Conventions de nommage", href: "/docs/naming" }}
      />
    </DocsLayout>
  );
}
