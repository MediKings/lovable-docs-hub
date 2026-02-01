import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Liste des commentaires", href: "#comment-list", level: 2 },
  { title: "Création", href: "#comment-create", level: 2 },
  { title: "Suppression", href: "#comment-delete", level: 2 },
];

const commentViewsCode = `from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404

from .models import Post, Comment
from .serializers import CommentSerializer


class CommentListView(APIView):
    """
    GET: Liste les commentaires d'un article
    POST: Ajoute un commentaire à un article
    """
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, post_slug):
        post = get_object_or_404(Post, slug=post_slug)
        comments = post.comments.filter(is_approved=True)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    def post(self, request, post_slug):
        post = get_object_or_404(Post, slug=post_slug)
        
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(
                post=post,
                author=request.user
            )
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class CommentDetailView(APIView):
    """
    DELETE: Supprime un commentaire (auteur uniquement)
    """
    permission_classes = [IsAuthenticatedOrReadOnly]

    def delete(self, request, post_slug, comment_id):
        comment = get_object_or_404(
            Comment,
            id=comment_id,
            post__slug=post_slug
        )
        
        # Vérifier que l'utilisateur est l'auteur du commentaire
        if comment.author != request.user:
            return Response(
                {"error": "Vous ne pouvez supprimer que vos propres commentaires"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)`;

const urlsExampleCode = `# blog/urls.py (extrait pour les commentaires)

urlpatterns = [
    # ... autres URLs
    
    # Commentaires
    path(
        'posts/<slug:post_slug>/comments/',
        CommentListView.as_view(),
        name='comment-list'
    ),
    path(
        'posts/<slug:post_slug>/comments/<int:comment_id>/',
        CommentDetailView.as_view(),
        name='comment-detail'
    ),
]`;

export default function CommentViews() {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>Views Commentaires</h1>
      
      <p>
        Les vues pour les commentaires sont imbriquées sous les articles.
        Un commentaire est toujours associé à un article spécifique.
      </p>

      <h2 id="comment-list">Liste et création de commentaires</h2>

      <CodeBlock code={commentViewsCode} language="python" />

      <h2 id="comment-create">Création d'un commentaire</h2>

      <p>Lors de la création d'un commentaire :</p>

      <ul>
        <li>L'article est récupéré via son <code>slug</code> dans l'URL</li>
        <li>L'auteur est automatiquement assigné depuis <code>request.user</code></li>
        <li>Le serializer ne contient que le champ <code>content</code></li>
      </ul>

      <Callout type="tip" title="URLs imbriquées">
        Les commentaires utilisent des URLs imbriquées comme 
        <code>/api/posts/mon-article/comments/</code> pour une meilleure organisation REST.
      </Callout>

      <h2 id="comment-delete">Configuration des URLs</h2>

      <CodeBlock code={urlsExampleCode} language="python" />

      <Callout type="info">
        Le paramètre <code>post_slug</code> est passé automatiquement 
        à la vue depuis l'URL.
      </Callout>

      <DocsPagination
        prev={{ title: "Views Articles", href: "/docs/views/posts" }}
        next={{ title: "Views Likes", href: "/docs/views/likes" }}
      />
    </DocsLayout>
  );
}
