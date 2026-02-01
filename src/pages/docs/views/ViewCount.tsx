import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Implémentation simple", href: "#simple", level: 2 },
  { title: "Éviter les doublons", href: "#session-based", level: 2 },
  { title: "Avec Redis", href: "#redis", level: 2 },
];

const simpleImplementationCode = `# Dans PostDetailView.get()

def get(self, request, slug):
    post = self.get_object(slug)
    
    # Incrémenter le compteur de vues
    post.increment_views()
    
    serializer = PostSerializer(post)
    return Response(serializer.data)`;

const modelMethodCode = `# Dans le modèle Post

def increment_views(self):
    """
    Incrémente le compteur de vues de manière atomique.
    Utilise update_fields pour optimiser la requête.
    """
    from django.db.models import F
    
    Post.objects.filter(pk=self.pk).update(
        view_count=F('view_count') + 1
    )
    self.refresh_from_db(fields=['view_count'])`;

const sessionBasedCode = `class PostDetailView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_object(self, slug):
        return get_object_or_404(Post, slug=slug)

    def get(self, request, slug):
        post = self.get_object(slug)
        
        # Clé de session unique pour cet article
        session_key = f'viewed_post_{post.id}'
        
        # Incrémenter seulement si pas déjà vu dans cette session
        if not request.session.get(session_key, False):
            post.increment_views()
            request.session[session_key] = True
        
        serializer = PostSerializer(post)
        return Response(serializer.data)`;

const redisImplementationCode = `import redis
from django.conf import settings

# Connexion Redis
redis_client = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=0
)


class PostDetailView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')

    def get(self, request, slug):
        post = get_object_or_404(Post, slug=slug)
        
        # Clé unique basée sur IP + article
        client_ip = self.get_client_ip(request)
        cache_key = f'view:{post.id}:{client_ip}'
        
        # Vérifier si déjà compté (expire après 1 heure)
        if not redis_client.exists(cache_key):
            post.increment_views()
            redis_client.setex(cache_key, 3600, '1')  # 1 heure
        
        serializer = PostSerializer(post)
        return Response(serializer.data)`;

export default function ViewCount() {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>Compteur de vues</h1>
      
      <p>
        Le compteur de vues permet de suivre la popularité des articles.
        Plusieurs approches existent selon vos besoins de précision.
      </p>

      <h2 id="simple">Implémentation simple</h2>

      <p>
        L'approche la plus simple incrémente le compteur à chaque requête GET :
      </p>

      <CodeBlock code={simpleImplementationCode} language="python" />

      <p>Avec une méthode optimisée dans le modèle :</p>

      <CodeBlock code={modelMethodCode} language="python" />

      <Callout type="tip" title="F() Expression">
        Utiliser <code>F('view_count') + 1</code> garantit une incrémentation 
        atomique, évitant les problèmes de concurrence.
      </Callout>

      <h2 id="session-based">Éviter les doublons (session)</h2>

      <p>
        Pour éviter de compter plusieurs vues du même utilisateur, 
        utilisez les sessions :
      </p>

      <CodeBlock code={sessionBasedCode} language="python" />

      <Callout type="warning" title="Limitations">
        Cette approche ne fonctionne que pour les utilisateurs avec cookies activés.
        Les API clients (mobile, etc.) nécessitent une autre approche.
      </Callout>

      <h2 id="redis">Avec Redis (production)</h2>

      <p>
        Pour une solution plus robuste en production, utilisez Redis 
        pour tracker les vues par IP :
      </p>

      <CodeBlock code={redisImplementationCode} language="python" />

      <Callout type="info" title="Avantages de Redis">
        <ul>
          <li>Très performant (en mémoire)</li>
          <li>Expiration automatique des clés</li>
          <li>Fonctionne pour tous les clients (API, web, mobile)</li>
        </ul>
      </Callout>

      <DocsPagination
        prev={{ title: "Views Likes", href: "/docs/views/likes" }}
        next={{ title: "Configuration URLs", href: "/docs/urls" }}
      />
    </DocsLayout>
  );
}
