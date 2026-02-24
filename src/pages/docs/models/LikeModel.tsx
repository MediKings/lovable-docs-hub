import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Modèle Like", href: "#like-model", level: 2 },
  { title: "Contrainte unique", href: "#unique-constraint", level: 2 },
];

const likeModelCode = `from django.db import models
from django.contrib.auth.models import User


class Like(models.Model):
    """
    Modèle représentant un like sur un article.
    Un utilisateur ne peut liker qu'une seule fois un article.
    """
    post = models.ForeignKey(
        'Post',
        on_delete=models.CASCADE,
        related_name='likes',
        verbose_name="Article"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='likes',
        verbose_name="Utilisateur"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        # Contrainte unique : un user ne peut liker qu'une fois par post
        unique_together = ['post', 'user']
        verbose_name = "Like"
        verbose_name_plural = "Likes"
    
    def __str__(self):
        return f"{self.user.username} aime {self.post.title}"`;

const allModelsCode = `# blog/models.py - Fichier complet

from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Post(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    content = models.TextField()
    excerpt = models.TextField(max_length=500, blank=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    is_published = models.BooleanField(default=False)
    view_count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def increment_views(self):
        self.view_count += 1
        self.save(update_fields=['view_count'])

    @property
    def like_count(self):
        return self.likes.count()

    @property
    def comment_count(self):
        return self.comments.count()


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']


class Like(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['post', 'user']`;

const LikeModel = () => {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>Modèle Like</h1>
      
      <p>
        Le modèle <code>Like</code> permet de gérer les likes sur les articles.
        Une contrainte unique empêche un utilisateur de liker plusieurs fois le même article.
      </p>

      <h2 id="like-model">Définition du modèle</h2>

      <CodeBlock code={likeModelCode} language="python" />

      <h2 id="unique-constraint">Contrainte unique</h2>

      <p>
        La propriété <code>unique_together</code> dans la classe <code>Meta</code> 
        garantit qu'un utilisateur ne peut liker qu'une seule fois un article donné.
      </p>

      <Callout type="warning" title="Gestion des erreurs">
        Lors de la création d'un like, une <code>IntegrityError</code> sera levée 
        si l'utilisateur a déjà liké l'article. Gérez cette erreur dans votre vue.
      </Callout>

      <hr />

      <h2>Récapitulatif des modèles</h2>

      <p>Voici le fichier <code>models.py</code> complet :</p>

      <CodeBlock code={allModelsCode} language="python" />

      <DocsPagination
        prev={{ title: "Modèle Commentaire", href: "/docs/models/comment" }}
        next={{ title: "PostSerializer", href: "/docs/serializers/post" }}
      />
    </DocsLayout>
  );
};

export default LikeModel;
