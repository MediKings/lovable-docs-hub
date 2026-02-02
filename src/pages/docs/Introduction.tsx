import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Introduction", href: "#introduction", level: 2 },
  { title: "Fonctionnalités", href: "#fonctionnalites", level: 2 },
  { title: "Prérequis", href: "#prerequis", level: 2 },
  { title: "Structure du projet", href: "#structure", level: 2 },
  { title: "Pourquoi APIView ?", href: "#apiview", level: 2 },
];

const projectStructure = `blog_api/
├── blog/
│   ├── __init__.py
│   ├── models.py          # Modèles Post, Comment, Like
│   ├── serializers.py     # Serializers DRF
│   ├── views.py           # Views basées sur APIView
│   ├── urls.py            # Configuration des URLs
│   └── tests.py           # Tests unitaires
├── blog_api/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── manage.py
└── requirements.txt`;

const requirementsCode = `Django>=5.0
djangorestframework>=3.14
django-cors-headers>=4.3`;

const settingsCode = `INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third party
    'rest_framework',
    'corsheaders',
    # Local
    'blog',
]

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}`;

export default function Introduction() {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>API Blog avec Django REST Framework</h1>
      
      <p>
        Ce guide vous accompagne dans la création d'une API REST complète pour un blog 
        en utilisant <a href="https://www.django-rest-framework.org/" target="_blank" rel="noopener noreferrer">Django REST Framework</a>. 
        Nous utiliserons exclusivement des vues basées sur <code>APIView</code> pour un contrôle total sur la logique.
      </p>

      <Callout type="info" title="À propos de ce tutoriel">
        Ce tutoriel couvre la création d'une API complète avec CRUD pour les articles, 
        gestion des commentaires, système de likes et compteur de vues.
      </Callout>

      <hr />

      <h2 id="fonctionnalites">Fonctionnalités</h2>

      <p>Notre API Blog implémentera les fonctionnalités suivantes :</p>

      <ul>
        <li><strong>Articles (Posts)</strong> : CRUD complet (Create, Read, Update, Delete)</li>
        <li><strong>Commentaires</strong> : Ajout et suppression de commentaires sur les articles</li>
        <li><strong>Likes</strong> : Système de like/unlike pour les articles</li>
        <li><strong>Nombre de vues</strong> : Compteur automatique de vues par article</li>
      </ul>

      <h2 id="prerequis">Prérequis</h2>

      <p>
        Avant de commencer, assurez-vous d'avoir Python 3.10+ installé. 
        Créez un environnement virtuel et installez les dépendances :
      </p>

      <CodeBlock code={requirementsCode} language="txt" />

      <Callout type="tip" title="Installation rapide">
        Utilisez <code>pip install -r requirements.txt</code> après avoir créé votre fichier requirements.txt.
      </Callout>

      <h2 id="structure">Structure du projet</h2>

      <p>Voici la structure que nous allons créer :</p>

      <CodeBlock code={projectStructure} language="bash" />

      <h2 id="apiview">Pourquoi APIView ?</h2>

      <p>
        Django REST Framework offre plusieurs types de vues : <code>APIView</code>, <code>GenericAPIView</code>, 
        et les <code>ViewSets</code>. Nous utilisons <code>APIView</code> car elle offre :
      </p>

      <ul>
        <li><strong>Contrôle explicite</strong> : Chaque méthode HTTP est définie manuellement</li>
        <li><strong>Flexibilité</strong> : Logique personnalisée sans contraintes</li>
        <li><strong>Clarté</strong> : Le code est facile à lire et comprendre</li>
        <li><strong>Apprentissage</strong> : Idéal pour comprendre les concepts REST</li>
      </ul>

      <Callout type="warning" title="Note importante">
        Les <code>APIView</code> requièrent plus de code que les ViewSets, mais offrent 
        une meilleure compréhension du fonctionnement de l'API.
      </Callout>

      <p>Configuration de base dans <code>settings.py</code> :</p>

      <CodeBlock code={settingsCode} language="python" />

      <DocsPagination
        next={{ title: "Authentification JWT", href: "/docs/authentication" }}
      />
    </DocsLayout>
  );
}
