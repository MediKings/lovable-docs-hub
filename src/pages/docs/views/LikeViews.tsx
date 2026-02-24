import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Toggle Like", href: "#toggle-like", level: 2 },
  { title: "Vérifier le statut", href: "#check-status", level: 2 },
];

const likeViewsCode = `from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import IntegrityError

from .models import Post, Like


class LikeToggleView(APIView):
    """
    POST: Toggle like/unlike sur un article
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, post_slug):
        post = get_object_or_404(Post, slug=post_slug)
        
        # Chercher si le like existe déjà
        like = Like.objects.filter(
            post=post,
            user=request.user
        ).first()
        
        if like:
            # Unlike : supprimer le like existant
            like.delete()
            return Response({
                "status": "unliked",
                "like_count": post.like_count
            })
        else:
            # Like : créer un nouveau like
            Like.objects.create(
                post=post,
                user=request.user
            )
            return Response({
                "status": "liked",
                "like_count": post.like_count
            }, status=status.HTTP_201_CREATED)


class LikeStatusView(APIView):
    """
    GET: Vérifie si l'utilisateur a liké un article
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, post_slug):
        post = get_object_or_404(Post, slug=post_slug)
        
        has_liked = Like.objects.filter(
            post=post,
            user=request.user
        ).exists()
        
        return Response({
            "has_liked": has_liked,
            "like_count": post.like_count
        })`;

const alternativeApproachCode = `# Approche alternative avec gestion d'erreur IntegrityError

class LikeToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_slug):
        post = get_object_or_404(Post, slug=post_slug)
        
        try:
            # Essayer de créer le like
            Like.objects.create(post=post, user=request.user)
            return Response({
                "status": "liked",
                "like_count": post.like_count
            }, status=status.HTTP_201_CREATED)
            
        except IntegrityError:
            # Le like existe déjà, le supprimer
            Like.objects.filter(
                post=post,
                user=request.user
            ).delete()
            return Response({
                "status": "unliked",
                "like_count": post.like_count
            })`;

const LikeViews = () => {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>Views Likes</h1>
      
      <p>
        Le système de like utilise un pattern "toggle" : une seule action 
        pour liker ou unliker, selon l'état actuel.
      </p>

      <h2 id="toggle-like">Toggle Like/Unlike</h2>

      <CodeBlock code={likeViewsCode} language="python" />

      <Callout type="info" title="Pattern Toggle">
        Au lieu d'avoir deux endpoints séparés (like et unlike), on utilise 
        un seul endpoint POST qui inverse l'état actuel du like.
      </Callout>

      <h2 id="check-status">Approche alternative</h2>

      <p>
        Une approche alternative utilise <code>IntegrityError</code> pour 
        détecter si le like existe déjà :
      </p>

      <CodeBlock code={alternativeApproachCode} language="python" />

      <Callout type="warning" title="Performance">
        La première approche (avec <code>.first()</code>) est généralement 
        préférée car elle évite de lever une exception, ce qui est plus performant.
      </Callout>

      <h3>Réponse de l'API</h3>

      <p>L'API retourne toujours :</p>

      <ul>
        <li><code>status</code> : "liked" ou "unliked"</li>
        <li><code>like_count</code> : le nombre total de likes après l'action</li>
      </ul>

      <DocsPagination
        prev={{ title: "Views Commentaires", href: "/docs/views/comments" }}
        next={{ title: "Compteur de vues", href: "/docs/views/view-count" }}
      />
    </DocsLayout>
  );
};

export default LikeViews;
