import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "Modèle Post", href: "#post-model", level: 2 },
  { title: "Champs du modèle", href: "#champs", level: 2 },
  { title: "Méthodes utiles", href: "#methodes", level: 2 },
  { title: "Migration", href: "#migration", level: 2 },
];

const postModelCode = `from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Post(models.Model):
    """
    Modèle représentant un article de blog.
    """
    title = models.CharField(max_length=200, verbose_name="Titre")
    slug = models.SlugField(max_length=200, unique=True)
    content = models.TextField(verbose_name="Contenu")
    excerpt = models.TextField(
        max_length=500, 
        blank=True, 
        verbose_name="Extrait"
    )
    
    author = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='posts'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(
        null=True, 
        blank=True,
        verbose_name="Date de publication"
    )
    
    is_published = models.BooleanField(
        default=False, 
        verbose_name="Publié"
    )
    
    # Compteur de vues
    view_count = models.PositiveIntegerField(
        default=0, 
        verbose_name="Nombre de vues"
    )
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Article"
        verbose_name_plural = "Articles"
    
    def __str__(self):
        return self.title
    
    def publish(self):
        """Publie l'article."""
        self.is_published = True
        self.published_at = timezone.now()
        self.save()
    
    def increment_views(self):
        """Incrémente le compteur de vues."""
        self.view_count += 1
        self.save(update_fields=['view_count'])
    
    @property
    def like_count(self):
        """Retourne le nombre de likes."""
        return self.likes.count()
    
    @property
    def comment_count(self):
        """Retourne le nombre de commentaires."""
        return self.comments.count()`;

const migrationCode = `# Créer les migrations
python manage.py makemigrations blog

# Appliquer les migrations
python manage.py migrate`;

export default function PostModel() {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>Modèle Article (Post)</h1>
      
      <p>
        Le modèle <code>Post</code> est le cœur de notre API blog. Il représente 
        un article avec son contenu, son auteur et ses métadonnées.
      </p>

      <h2 id="post-model">Définition du modèle</h2>

      <CodeBlock code={postModelCode} language="python" />

      <h2 id="champs">Champs du modèle</h2>

      <table>
        <thead>
          <tr>
            <th>Champ</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>title</code></td>
            <td>CharField</td>
            <td>Titre de l'article (max 200 caractères)</td>
          </tr>
          <tr>
            <td><code>slug</code></td>
            <td>SlugField</td>
            <td>URL-friendly unique identifier</td>
          </tr>
          <tr>
            <td><code>content</code></td>
            <td>TextField</td>
            <td>Contenu complet de l'article</td>
          </tr>
          <tr>
            <td><code>excerpt</code></td>
            <td>TextField</td>
            <td>Résumé court (optionnel)</td>
          </tr>
          <tr>
            <td><code>author</code></td>
            <td>ForeignKey</td>
            <td>Auteur de l'article</td>
          </tr>
          <tr>
            <td><code>view_count</code></td>
            <td>PositiveIntegerField</td>
            <td>Compteur de vues</td>
          </tr>
        </tbody>
      </table>

      <Callout type="tip" title="Bonnes pratiques">
        Utilisez <code>related_name</code> sur les ForeignKey pour faciliter 
        les requêtes inverses comme <code>user.posts.all()</code>.
      </Callout>

      <h2 id="methodes">Méthodes utiles</h2>

      <ul>
        <li><code>publish()</code> : Publie l'article et définit la date de publication</li>
        <li><code>increment_views()</code> : Incrémente le compteur de vues de manière optimisée</li>
        <li><code>like_count</code> : Propriété retournant le nombre de likes</li>
        <li><code>comment_count</code> : Propriété retournant le nombre de commentaires</li>
      </ul>

      <Callout type="info">
        La méthode <code>increment_views()</code> utilise <code>update_fields</code> 
        pour n'enregistrer que le champ modifié, ce qui est plus performant.
      </Callout>

      <h2 id="migration">Migration</h2>

      <p>Après avoir créé le modèle, exécutez les migrations :</p>

      <CodeBlock code={migrationCode} language="bash" />

      <DocsPagination
        prev={{ title: "Introduction", href: "/docs" }}
        next={{ title: "Modèle Commentaire", href: "/docs/models/comment" }}
      />
    </DocsLayout>
  );
}
