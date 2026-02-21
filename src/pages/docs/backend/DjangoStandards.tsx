import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Architecture", href: "#architecture", level: 2 },
  { title: "Modèles", href: "#modeles", level: 2 },
  { title: "Serializers", href: "#serializers", level: 2 },
  { title: "Vues (APIView)", href: "#vues", level: 2 },
  { title: "URLs", href: "#urls", level: 2 },
  { title: "Tests", href: "#tests", level: 2 },
];

const architectureCode = `# Architecture standard d'une app Django chez GhennySoft
app_name/
├── __init__.py
├── admin.py               # Configuration admin
├── apps.py                # Configuration de l'app
├── models.py              # Modèles (ou models/ pour les grosses apps)
├── serializers.py         # Serializers DRF
├── views.py               # Vues APIView
├── urls.py                # Routes de l'app
├── permissions.py         # Permissions personnalisées
├── signals.py             # Signaux Django
├── services/              # Logique métier (pas dans les vues !)
│   ├── __init__.py
│   └── email_service.py
├── utils/
│   ├── __init__.py
│   └── validators.py
└── tests/
    ├── __init__.py
    ├── test_models.py
    ├── test_views.py
    └── test_serializers.py`;

const modelCode = `from django.db import models
from django.conf import settings

class TimestampedModel(models.Model):
    """Modèle abstrait avec timestamps automatiques."""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ['-created_at']

class Post(TimestampedModel):
    """Article de blog."""
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    content = models.TextField()
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='posts',
    )
    is_published = models.BooleanField(default=False)
    view_count = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "Article"
        verbose_name_plural = "Articles"
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self) -> str:
        return self.title

    def increment_views(self) -> None:
        """Incrémente le compteur de vues de façon atomique."""
        from django.db.models import F
        Post.objects.filter(pk=self.pk).update(view_count=F('view_count') + 1)`;

const serializerCode = `from rest_framework import serializers

class PostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(
        source='author.get_full_name',
        read_only=True,
    )
    comment_count = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'content',
            'author', 'author_name',
            'is_published', 'view_count',
            'comment_count',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['slug', 'view_count', 'author']

    def get_comment_count(self, obj) -> int:
        return obj.comments.count()

    def validate_title(self, value: str) -> str:
        if len(value) < 5:
            raise serializers.ValidationError(
                "Le titre doit contenir au moins 5 caractères."
            )
        return value`;

const viewCode = `from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticatedOrReadOnly

class PostListCreateView(APIView):
    """
    GET  : Liste des articles publiés
    POST : Création d'un article (authentifié)
    """
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request) -> Response:
        posts = Post.objects.filter(is_published=True)
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)

    def post(self, request) -> Response:
        serializer = PostSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(author=request.user)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )`;

const testCode = `from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

class PostAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            password="testpass123",
        )
        self.post = Post.objects.create(
            title="Test Post",
            content="Content",
            author=self.user,
            is_published=True,
        )

    def test_list_published_posts(self):
        """GET /api/posts/ retourne les articles publiés."""
        response = self.client.get("/api/posts/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_post_unauthenticated(self):
        """POST /api/posts/ sans auth retourne 401."""
        response = self.client.post("/api/posts/", {"title": "New"})
        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )`;

export default function DjangoStandards() {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>Standards Django REST Framework</h1>

      <p>
        Conventions GhennySoft pour le développement backend avec Django et Django REST Framework. 
        Nous utilisons exclusivement des <code>APIView</code> pour un contrôle total.
      </p>

      <Callout type="info" title="Projet d'illustration">
        Consultez la section « Projet : Blog API (DRF) » dans la barre latérale 
        pour voir ces standards appliqués à un projet complet.
      </Callout>

      <hr />

      <h2 id="architecture">Architecture</h2>
      <CodeBlock code={architectureCode} language="bash" />

      <h2 id="modeles">Modèles</h2>
      <CodeBlock code={modelCode} language="python" />

      <Callout type="tip" title="Modèle abstrait">
        Utilisez toujours <code>TimestampedModel</code> comme base pour ajouter automatiquement 
        <code>created_at</code> et <code>updated_at</code>.
      </Callout>

      <h2 id="serializers">Serializers</h2>
      <CodeBlock code={serializerCode} language="python" />

      <h2 id="vues">Vues (APIView)</h2>
      <CodeBlock code={viewCode} language="python" />

      <h2 id="urls">URLs</h2>

      <ul>
        <li>Préfixer avec <code>/api/v1/</code> pour le versioning</li>
        <li>Utiliser <code>kebab-case</code> dans les URLs</li>
        <li>Terminer par <code>/</code> (convention Django)</li>
        <li>Nommer chaque route avec <code>name=</code></li>
      </ul>

      <h2 id="tests">Tests</h2>
      <CodeBlock code={testCode} language="python" />

      <DocsPagination
        prev={{ title: "Next.js", href: "/docs/frontend/nextjs" }}
        next={{ title: "Standards API REST", href: "/docs/backend/api" }}
      />
    </DocsLayout>
  );
}
