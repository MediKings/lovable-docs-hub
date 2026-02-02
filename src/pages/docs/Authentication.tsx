import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Installation", href: "#installation", level: 2 },
  { title: "Configuration", href: "#configuration", level: 2 },
  { title: "URLs", href: "#urls", level: 2 },
  { title: "Protection des vues", href: "#protection", level: 2 },
  { title: "Utilisation côté client", href: "#client", level: 2 },
  { title: "Refresh Token", href: "#refresh", level: 2 },
];

const installCode = `pip install djangorestframework-simplejwt`;

const settingsCode = `# settings.py

from datetime import timedelta

INSTALLED_APPS = [
    # ...
    'rest_framework',
    'rest_framework_simplejwt',
    # ...
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    
    'TOKEN_OBTAIN_SERIALIZER': 'rest_framework_simplejwt.serializers.TokenObtainPairSerializer',
}`;

const urlsCode = `# blog_api/urls.py

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Endpoints JWT
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # API Blog
    path('api/', include('blog.urls')),
]`;

const protectedViewCode = `from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


class ProtectedView(APIView):
    """
    Vue protégée accessible uniquement aux utilisateurs authentifiés
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "message": f"Bonjour {request.user.username}!",
            "user_id": request.user.id,
            "email": request.user.email,
        })`;

const customTokenCode = `# serializers.py

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializer personnalisé pour ajouter des données au token
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Ajouter des claims personnalisés
        token['username'] = user.username
        token['email'] = user.email
        token['is_staff'] = user.is_staff
        
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Ajouter des données à la réponse
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
        }
        
        return data`;

const customTokenViewCode = `# views.py

from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer`;

const clientUsageCode = `# Obtenir un token (login)
POST /api/token/
Content-Type: application/json

{
    "username": "john_doe",
    "password": "secure_password"
}

# Réponse
{
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com"
    }
}`;

const authRequestCode = `# Requête authentifiée
GET /api/posts/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...`;

const refreshTokenCode = `# Rafraîchir le token d'accès
POST /api/token/refresh/
Content-Type: application/json

{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}

# Réponse
{
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."  # Nouveau refresh token
}`;

const verifyTokenCode = `# Vérifier la validité d'un token
POST /api/token/verify/
Content-Type: application/json

{
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}

# Réponse si valide: 200 OK {}
# Réponse si invalide: 401 Unauthorized`;

const blacklistCode = `# settings.py - Activer le blacklist

INSTALLED_APPS = [
    # ...
    'rest_framework_simplejwt.token_blacklist',
]

# Puis exécuter les migrations
# python manage.py migrate`;

const logoutViewCode = `from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken


class LogoutView(APIView):
    """
    POST: Déconnexion en blacklistant le refresh token
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {"message": "Déconnexion réussie"},
                status=status.HTTP_200_OK
            )
        except Exception:
            return Response(
                {"error": "Token invalide"},
                status=status.HTTP_400_BAD_REQUEST
            )`;

export default function Authentication() {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>Authentification JWT</h1>
      
      <p>
        L'authentification JWT (JSON Web Token) permet de sécuriser votre API 
        de manière stateless. Nous utilisons <code>djangorestframework-simplejwt</code>, 
        la solution recommandée pour Django REST Framework.
      </p>

      <Callout type="info" title="Pourquoi JWT ?">
        JWT offre une authentification stateless, idéale pour les APIs. Le token 
        contient les informations de l'utilisateur et peut être vérifié sans 
        accéder à la base de données.
      </Callout>

      <hr />

      <h2 id="installation">Installation</h2>

      <CodeBlock code={installCode} language="bash" />

      <h2 id="configuration">Configuration</h2>

      <p>Configurez JWT dans votre fichier <code>settings.py</code> :</p>

      <CodeBlock code={settingsCode} language="python" />

      <Callout type="warning" title="Sécurité">
        En production, utilisez une <code>SIGNING_KEY</code> différente de 
        <code>SECRET_KEY</code> et stockez-la dans les variables d'environnement.
      </Callout>

      <h3>Options importantes</h3>

      <ul>
        <li><strong>ACCESS_TOKEN_LIFETIME</strong> : Durée de vie du token d'accès (court)</li>
        <li><strong>REFRESH_TOKEN_LIFETIME</strong> : Durée de vie du refresh token (long)</li>
        <li><strong>ROTATE_REFRESH_TOKENS</strong> : Génère un nouveau refresh token à chaque refresh</li>
        <li><strong>BLACKLIST_AFTER_ROTATION</strong> : Invalide l'ancien refresh token après rotation</li>
      </ul>

      <h2 id="urls">Configuration des URLs</h2>

      <CodeBlock code={urlsCode} language="python" />

      <p>Trois endpoints sont disponibles :</p>

      <ul>
        <li><code>/api/token/</code> : Obtenir un couple access/refresh token</li>
        <li><code>/api/token/refresh/</code> : Rafraîchir le token d'accès</li>
        <li><code>/api/token/verify/</code> : Vérifier la validité d'un token</li>
      </ul>

      <h2 id="protection">Protection des vues</h2>

      <p>Utilisez <code>IsAuthenticated</code> pour protéger vos vues :</p>

      <CodeBlock code={protectedViewCode} language="python" />

      <h3>Token personnalisé</h3>

      <p>Personnalisez le contenu du token et la réponse de login :</p>

      <CodeBlock code={customTokenCode} language="python" />

      <CodeBlock code={customTokenViewCode} language="python" />

      <Callout type="tip" title="Claims personnalisés">
        Ajoutez des informations comme le rôle utilisateur ou les permissions 
        directement dans le token pour éviter des requêtes supplémentaires.
      </Callout>

      <h2 id="client">Utilisation côté client</h2>

      <h3>Obtenir un token (Login)</h3>

      <CodeBlock code={clientUsageCode} language="bash" />

      <h3>Requête authentifiée</h3>

      <CodeBlock code={authRequestCode} language="bash" />

      <Callout type="info" title="Header Authorization">
        Le format est <code>Bearer &lt;token&gt;</code> avec un espace entre 
        "Bearer" et le token.
      </Callout>

      <h2 id="refresh">Gestion du Refresh Token</h2>

      <h3>Rafraîchir le token d'accès</h3>

      <CodeBlock code={refreshTokenCode} language="bash" />

      <h3>Vérifier un token</h3>

      <CodeBlock code={verifyTokenCode} language="bash" />

      <h3>Blacklist et Logout</h3>

      <p>Pour implémenter une vraie déconnexion, activez le blacklist :</p>

      <CodeBlock code={blacklistCode} language="python" />

      <p>Puis créez une vue de logout :</p>

      <CodeBlock code={logoutViewCode} language="python" />

      <Callout type="warning" title="Nettoyage">
        Pensez à nettoyer régulièrement les tokens blacklistés avec une 
        commande planifiée : <code>python manage.py flushexpiredtokens</code>
      </Callout>

      <DocsPagination
        prev={{ title: "Introduction", href: "/docs" }}
        next={{ title: "Modèle Article (Post)", href: "/docs/models/post" }}
      />
    </DocsLayout>
  );
}
