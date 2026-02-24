import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Liste des articles", href: "#post-list", level: 2 },
  { title: "Détail d'un article", href: "#post-detail", level: 2 },
  { title: "Création", href: "#post-create", level: 2 },
  { title: "Mise à jour", href: "#post-update", level: 2 },
  { title: "Suppression", href: "#post-delete", level: 2 },
];

const postListViewCode = `from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404

from .models import Post
from .serializers import PostSerializer, PostListSerializer


class PostListView(APIView):
    """
    GET: Liste tous les articles publiés
    POST: Crée un nouvel article (authentification requise)
    """
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        posts = Post.objects.filter(is_published=True)
        serializer = PostListSerializer(posts, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(
                serializer.data, 
                status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors, 
            status=status.HTTP_400_BAD_REQUEST
        )`;

const postDetailViewCode = `class PostDetailView(APIView):
    """
    GET: Récupère un article par son slug
    PUT: Met à jour un article (auteur uniquement)
    DELETE: Supprime un article (auteur uniquement)
    """
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_object(self, slug):
        return get_object_or_404(Post, slug=slug)

    def get(self, request, slug):
        post = self.get_object(slug)
        
        # Incrémenter le compteur de vues
        post.increment_views()
        
        serializer = PostSerializer(post)
        return Response(serializer.data)

    def put(self, request, slug):
        post = self.get_object(slug)
        
        # Vérifier que l'utilisateur est l'auteur
        if post.author != request.user:
            return Response(
                {"error": "Vous n'êtes pas l'auteur de cet article"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = PostSerializer(post, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(
            serializer.errors, 
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, slug):
        post = self.get_object(slug)
        
        # Vérifier que l'utilisateur est l'auteur
        if post.author != request.user:
            return Response(
                {"error": "Vous n'êtes pas l'auteur de cet article"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)`;

const fullViewsCode = `# blog/views.py - CRUD complet pour les articles

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404

from .models import Post
from .serializers import PostSerializer, PostListSerializer


class PostListView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        posts = Post.objects.filter(is_published=True)
        serializer = PostListSerializer(posts, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PostDetailView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_object(self, slug):
        return get_object_or_404(Post, slug=slug)

    def get(self, request, slug):
        post = self.get_object(slug)
        post.increment_views()
        serializer = PostSerializer(post)
        return Response(serializer.data)

    def put(self, request, slug):
        post = self.get_object(slug)
        if post.author != request.user:
            return Response(
                {"error": "Non autorisé"},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = PostSerializer(post, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, slug):
        post = self.get_object(slug)
        if post.author != request.user:
            return Response(
                {"error": "Non autorisé"},
                status=status.HTTP_403_FORBIDDEN
            )
        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)`;

const PostViews = () => {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>Views CRUD Articles</h1>
      
      <p>
        Les vues basées sur <code>APIView</code> nous donnent un contrôle total 
        sur chaque opération CRUD. Chaque méthode HTTP est explicitement définie.
      </p>

      <Callout type="info" title="APIView vs ViewSet">
        Contrairement aux ViewSets, les APIView nécessitent de définir 
        manuellement chaque méthode (get, post, put, delete), ce qui offre 
        plus de flexibilité et de clarté.
      </Callout>

      <h2 id="post-list">Liste des articles (GET) & Création (POST)</h2>

      <CodeBlock code={postListViewCode} language="python" />

      <Callout type="tip" title="Permissions">
        <code>IsAuthenticatedOrReadOnly</code> permet à tous de lire, 
        mais seuls les utilisateurs authentifiés peuvent créer.
      </Callout>

      <h2 id="post-detail">Détail d'un article</h2>

      <p>
        Cette vue gère la récupération, la mise à jour et la suppression 
        d'un article spécifique. Le compteur de vues est incrémenté à chaque lecture.
      </p>

      <CodeBlock code={postDetailViewCode} language="python" />

      <h2 id="post-create">Points clés de la création</h2>

      <ul>
        <li>L'auteur est automatiquement assigné via <code>request.user</code></li>
        <li>Validation automatique via le serializer</li>
        <li>Retourne HTTP 201 en cas de succès</li>
      </ul>

      <h2 id="post-update">Points clés de la mise à jour</h2>

      <ul>
        <li><code>partial=True</code> permet les mises à jour partielles (PATCH)</li>
        <li>Vérification de propriété avant modification</li>
        <li>HTTP 403 si l'utilisateur n'est pas l'auteur</li>
      </ul>

      <h2 id="post-delete">Points clés de la suppression</h2>

      <ul>
        <li>Vérification de propriété avant suppression</li>
        <li>Retourne HTTP 204 No Content en cas de succès</li>
      </ul>

      <Callout type="warning" title="Sécurité">
        Toujours vérifier que l'utilisateur a les droits de modifier/supprimer 
        une ressource avant d'effectuer l'opération.
      </Callout>

      <hr />

      <h2>Code complet</h2>

      <CodeBlock code={fullViewsCode} language="python" />

      <DocsPagination
        prev={{ title: "LikeSerializer", href: "/docs/serializers/like" }}
        next={{ title: "Views Commentaires", href: "/docs/views/comments" }}
      />
    </DocsLayout>
  );
};

export default PostViews;
