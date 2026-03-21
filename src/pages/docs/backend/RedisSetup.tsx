import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Installation", href: "#installation", level: 2 },
  { title: "Configuration", href: "#configuration", level: 2 },
  { title: "Cache avec Redis", href: "#cache", level: 2 },
  { title: "Sessions Redis", href: "#sessions", level: 2 },
  { title: "Cas d'usage avancés", href: "#advanced", level: 2 },
];

const installCode = `# Installation des dépendances
pip install django-redis redis`;

const settingsCode = `# settings.py

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/0",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "SERIALIZER": "django_redis.serializers.json.JSONSerializer",
            "SOCKET_CONNECT_TIMEOUT": 5,
            "SOCKET_TIMEOUT": 5,
            "RETRY_ON_TIMEOUT": True,
            "CONNECTION_POOL_KWARGS": {
                "max_connections": 50,
            },
        },
        "KEY_PREFIX": "ghennysoft",
        "TIMEOUT": 300,  # 5 minutes par défaut
    }
}

# Utiliser Redis pour les sessions
SESSION_ENGINE = "django.contrib.sessions.backends.cache"
SESSION_CACHE_ALIAS = "default"`;

const cacheViewCode = `from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response

class PostListView(APIView):
    """
    Liste des articles avec cache Redis.
    """

    def get(self, request) -> Response:
        cache_key = "posts:published:list"
        
        # Tenter de récupérer depuis le cache
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return Response(cached_data)
        
        # Sinon, requête DB + mise en cache
        posts = Post.objects.filter(is_published=True)
        serializer = PostSerializer(posts, many=True)
        
        cache.set(cache_key, serializer.data, timeout=600)  # 10 min
        
        return Response(serializer.data)`;

const cacheInvalidationCode = `from django.core.cache import cache

class PostCreateView(APIView):
    """Invalider le cache après création d'un article."""

    def post(self, request) -> Response:
        serializer = PostSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        post = serializer.save(author=request.user)
        
        # Invalider le cache de la liste
        cache.delete("posts:published:list")
        
        # Invalider le cache du post spécifique si existant
        cache.delete(f"posts:detail:{post.slug}")
        
        return Response(
            PostSerializer(post).data,
            status=status.HTTP_201_CREATED,
        )


class PostDetailView(APIView):
    """Détail d'un article avec cache individuel."""

    def get(self, request, slug) -> Response:
        cache_key = f"posts:detail:{slug}"
        cached_data = cache.get(cache_key)
        
        if cached_data is not None:
            return Response(cached_data)
        
        post = get_object_or_404(Post, slug=slug)
        post.increment_views()
        
        serializer = PostSerializer(post)
        cache.set(cache_key, serializer.data, timeout=300)
        
        return Response(serializer.data)`;

const rateLimitCode = `import redis
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

redis_client = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=1,
)


class RateLimitMixin:
    """
    Mixin pour limiter le nombre de requêtes par IP.
    Utilise un compteur Redis avec expiration.
    """
    rate_limit = 100       # requêtes max
    rate_period = 3600     # par heure (en secondes)

    def check_rate_limit(self, request) -> bool:
        ip = self.get_client_ip(request)
        key = f"ratelimit:{ip}:{self.__class__.__name__}"
        
        current = redis_client.get(key)
        if current and int(current) >= self.rate_limit:
            return False
        
        pipe = redis_client.pipeline()
        pipe.incr(key)
        pipe.expire(key, self.rate_period)
        pipe.execute()
        
        return True

    def get_client_ip(self, request) -> str:
        x_forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded:
            return x_forwarded.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR")`;

const RedisSetup = () => {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>Redis — Cache & Sessions</h1>

      <p>
        Redis est utilisé chez GhennySoft comme cache applicatif, store de sessions
        et pour les fonctionnalités temps réel (rate limiting, compteurs).
      </p>

      <h2 id="installation">Installation</h2>
      <CodeBlock code={installCode} language="bash" />

      <h2 id="configuration">Configuration</h2>
      <CodeBlock code={settingsCode} language="python" />

      <Callout type="tip" title="Préfixe de clés">
        Utilisez toujours <code>KEY_PREFIX</code> pour éviter les collisions
        entre projets sur le même serveur Redis.
      </Callout>

      <h2 id="cache">Cache avec Redis</h2>

      <p>
        Mettre en cache les requêtes fréquentes pour réduire la charge sur la base de données :
      </p>

      <CodeBlock code={cacheViewCode} language="python" />

      <p>
        <strong>Invalidation du cache</strong> — Toujours invalider le cache lors des mutations :
      </p>

      <CodeBlock code={cacheInvalidationCode} language="python" />

      <Callout type="warning" title="Invalidation">
        Ne jamais oublier d'invalider le cache après un <code>POST</code>, <code>PUT</code>,
        <code>PATCH</code> ou <code>DELETE</code>. Un cache obsolète est pire que pas de cache.
      </Callout>

      <h2 id="sessions">Sessions Redis</h2>

      <p>
        Avec la configuration <code>SESSION_ENGINE</code> ci-dessus, les sessions Django
        sont automatiquement stockées dans Redis, ce qui améliore les performances
        et permet une gestion centralisée en environnement multi-serveur.
      </p>

      <h2 id="advanced">Cas d'usage avancés</h2>

      <p>
        <strong>Rate Limiting</strong> — Limiter les requêtes par IP avec un mixin réutilisable :
      </p>

      <CodeBlock code={rateLimitCode} language="python" />

      <Callout type="info" title="Redis en production">
        <ul>
          <li>Utilisez Redis Sentinel ou Redis Cluster pour la haute disponibilité</li>
          <li>Configurez un mot de passe via <code>REDIS_URL</code> avec authentification</li>
          <li>Monitorer avec <code>redis-cli INFO</code> ou un outil comme RedisInsight</li>
        </ul>
      </Callout>

      <DocsPagination
        prev={{ title: "Standards API REST", href: "/docs/backend/api" }}
        next={{ title: "Celery — Tâches asynchrones", href: "/docs/backend/celery" }}
      />
    </DocsLayout>
  );
};

export default RedisSetup;
