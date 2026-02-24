import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Principes", href: "#principes", level: 2 },
  { title: "Injection & XSS", href: "#injection", level: 2 },
  { title: "Authentification", href: "#auth", level: 2 },
  { title: "Gestion des secrets", href: "#secrets", level: 2 },
  { title: "CORS & CSRF", href: "#cors", level: 2 },
  { title: "Validation des entrées", href: "#validation", level: 2 },
  { title: "Headers de sécurité", href: "#headers", level: 2 },
  { title: "Dépendances", href: "#dependances", level: 2 },
  { title: "Checklist", href: "#checklist", level: 2 },
];

const injectionCode = `# ❌ JAMAIS — SQL brut avec interpolation
query = f"SELECT * FROM users WHERE email = '{email}'"

# ✅ TOUJOURS — ORM ou requêtes paramétrées
user = User.objects.filter(email=email).first()

# Si SQL brut nécessaire :
from django.db import connection
with connection.cursor() as cursor:
    cursor.execute(
        "SELECT * FROM users WHERE email = %s",
        [email]
    )`;

const xssCode = `// ❌ JAMAIS — innerHTML avec données utilisateur
element.innerHTML = userInput;

// ❌ DANGEREUX — React dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ React échappe automatiquement le contenu
<p>{userContent}</p>

// ✅ Si HTML nécessaire, utiliser DOMPurify
import DOMPurify from "dompurify";

const sanitized = DOMPurify.sanitize(userContent);
<div dangerouslySetInnerHTML={{ __html: sanitized }} />`;

const secretsCode = `# ✅ Variables d'environnement — JAMAIS dans le code
# .env.local (PAS commité)
DATABASE_URL=postgresql://user:pass@localhost/db
SECRET_KEY=super-secret-key-here
STRIPE_SECRET_KEY=sk_live_...

# settings.py
import os
SECRET_KEY = os.environ["SECRET_KEY"]

# next.config.ts — Variables publiques préfixées NEXT_PUBLIC_
NEXT_PUBLIC_API_URL=https://api.ghennysoft.com
NEXT_PUBLIC_STRIPE_KEY=pk_live_...  # Clé publique OK

# ❌ JAMAIS dans le code source
SECRET_KEY = "ma-cle-secrete-123"
API_KEY = "sk_live_..."

# ❌ JAMAIS dans le git
# Vérifiez votre .gitignore :
.env
.env.local
.env.production
*.key
*.pem`;

const corsCode = `# settings.py — Configuration CORS stricte
CORS_ALLOWED_ORIGINS = [
    "https://app.ghennysoft.com",
    "https://admin.ghennysoft.com",
]

# ❌ JAMAIS en production
CORS_ALLOW_ALL_ORIGINS = True  # DANGEREUX

# CSRF — Activer pour les formulaires
CSRF_TRUSTED_ORIGINS = [
    "https://app.ghennysoft.com",
]

# Cookies sécurisés
SESSION_COOKIE_SECURE = True      # HTTPS uniquement
SESSION_COOKIE_HTTPONLY = True     # Pas accessible en JS
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = True`;

const validationCode = `# ✅ Backend — Toujours valider côté serveur
class CreateUserSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, max_length=128)
    age = serializers.IntegerField(min_value=13, max_value=150)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email déjà utilisé.")
        return value.lower().strip()

    def validate_password(self, value):
        # Vérification de complexité
        if not any(c.isupper() for c in value):
            raise serializers.ValidationError(
                "Le mot de passe doit contenir au moins une majuscule."
            )
        if not any(c.isdigit() for c in value):
            raise serializers.ValidationError(
                "Le mot de passe doit contenir au moins un chiffre."
            )
        return value`;

const headersCode = `# Middleware de sécurité Django
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    # ...
]

# Headers de sécurité
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000         # 1 an
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_SSL_REDIRECT = True             # Forcer HTTPS

# Next.js — next.config.ts
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=()' },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval';"
  },
];`;

const dependenciesCode = `# Audit des dépendances — à faire régulièrement

# Python
pip-audit                    # Scan des vulnérabilités
safety check                 # Vérification des CVE

# JavaScript/TypeScript
npm audit                    # Scan intégré npm
npx audit-ci                 # CI/CD friendly

# Automatisation avec Dependabot (.github/dependabot.yml)
version: 2
updates:
  - package-ecosystem: "pip"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"`;

const Security = () => {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>Sécurité</h1>

      <p>
        La sécurité est intégrée à chaque étape du développement chez GhennySoft. 
        Ce guide couvre les vulnérabilités courantes et les mesures de protection obligatoires.
      </p>

      <Callout type="danger" title="Règle absolue">
        La sécurité n'est jamais optionnelle. Chaque PR est évaluée sur ses implications sécuritaires 
        lors de la revue de code.
      </Callout>

      <hr />

      <h2 id="principes">Principes</h2>

      <ul>
        <li><strong>Defense in Depth</strong> : Plusieurs couches de protection, jamais une seule</li>
        <li><strong>Least Privilege</strong> : Accorder uniquement les permissions nécessaires</li>
        <li><strong>Fail Secure</strong> : En cas d'erreur, bloquer plutôt qu'autoriser</li>
        <li><strong>Never Trust Input</strong> : Toute donnée externe est potentiellement malveillante</li>
        <li><strong>Secure by Default</strong> : La configuration par défaut doit être sécurisée</li>
      </ul>

      <h2 id="injection">Injection & XSS</h2>

      <h3>SQL Injection</h3>
      <CodeBlock code={injectionCode} language="python" />

      <h3>Cross-Site Scripting (XSS)</h3>
      <CodeBlock code={xssCode} language="tsx" />

      <h2 id="auth">Authentification</h2>

      <ul>
        <li>Utiliser <strong>JWT</strong> avec tokens de courte durée (15 min access, 7 jours refresh)</li>
        <li>Hasher les mots de passe avec <strong>bcrypt</strong> ou <strong>Argon2</strong></li>
        <li>Implémenter le <strong>rate limiting</strong> sur les endpoints de login (5 tentatives/min)</li>
        <li>Activer la <strong>vérification email</strong> à l'inscription</li>
        <li>Supporter le <strong>2FA</strong> pour les comptes administrateurs</li>
        <li>Invalider les tokens lors du changement de mot de passe</li>
      </ul>

      <h2 id="secrets">Gestion des secrets</h2>
      <CodeBlock code={secretsCode} language="bash" />

      <Callout type="warning" title="Audit des secrets">
        Utilisez <code>git-secrets</code> ou <code>trufflehog</code> en pre-commit pour 
        détecter les secrets accidentellement commités.
      </Callout>

      <h2 id="cors">CORS & CSRF</h2>
      <CodeBlock code={corsCode} language="python" />

      <h2 id="validation">Validation des entrées</h2>
      <CodeBlock code={validationCode} language="python" />

      <Callout type="info" title="Double validation">
        Validez <strong>toujours côté serveur</strong>, même si une validation côté client existe. 
        La validation frontend est pour l'UX, la validation backend est pour la sécurité.
      </Callout>

      <h2 id="headers">Headers de sécurité</h2>
      <CodeBlock code={headersCode} language="python" />

      <h2 id="dependances">Dépendances</h2>
      <CodeBlock code={dependenciesCode} language="yaml" />

      <h2 id="checklist">Checklist sécurité (avant chaque release)</h2>

      <ul>
        <li>☐ Aucun secret dans le code source</li>
        <li>☐ Toutes les entrées utilisateur sont validées côté serveur</li>
        <li>☐ CORS configuré avec des origines spécifiques</li>
        <li>☐ CSRF activé pour tous les formulaires</li>
        <li>☐ Headers de sécurité en place</li>
        <li>☐ HTTPS forcé en production</li>
        <li>☐ Rate limiting sur les endpoints sensibles</li>
        <li>☐ Audit des dépendances (npm audit / pip-audit)</li>
        <li>☐ Logs de sécurité activés (tentatives de login, accès refusés)</li>
        <li>☐ Pas de <code>console.log</code> ou <code>print()</code> avec des données sensibles</li>
      </ul>

      <DocsPagination
        prev={{ title: "Librairies recommandées", href: "/docs/libraries" }}
      />
    </DocsLayout>
  );
};

export default Security;
