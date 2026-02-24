import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Modèle Comment", href: "#comment-model", level: 2 },
  { title: "Relations", href: "#relations", level: 2 },
];

const commentModelCode = `from django.db import models
from django.contrib.auth.models import User


class Comment(models.Model):
    """
    Modèle représentant un commentaire sur un article.
    """
    post = models.ForeignKey(
        'Post',
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name="Article"
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name="Auteur"
    )
    content = models.TextField(verbose_name="Contenu")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    is_approved = models.BooleanField(
        default=True,
        verbose_name="Approuvé"
    )
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Commentaire"
        verbose_name_plural = "Commentaires"
    
    def __str__(self):
        return f"Commentaire de {self.author.username} sur {self.post.title}"`;

const CommentModel = () => {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>Modèle Commentaire</h1>
      
      <p>
        Le modèle <code>Comment</code> permet aux utilisateurs de commenter les articles.
        Chaque commentaire est lié à un article et à un auteur.
      </p>

      <h2 id="comment-model">Définition du modèle</h2>

      <CodeBlock code={commentModelCode} language="python" />

      <h2 id="relations">Relations</h2>

      <ul>
        <li><code>post</code> : Lien vers l'article commenté (ForeignKey)</li>
        <li><code>author</code> : Utilisateur ayant écrit le commentaire (ForeignKey)</li>
      </ul>

      <Callout type="tip" title="Cascade Delete">
        Avec <code>on_delete=models.CASCADE</code>, les commentaires sont 
        automatiquement supprimés si l'article ou l'utilisateur est supprimé.
      </Callout>

      <DocsPagination
        prev={{ title: "Modèle Post", href: "/docs/models/post" }}
        next={{ title: "Modèle Like", href: "/docs/models/like" }}
      />
    </DocsLayout>
  );
};

export default CommentModel;
